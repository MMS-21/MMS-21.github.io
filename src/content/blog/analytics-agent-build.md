---
title: 'I built a tool-calling agent without a framework, and the quality gate is the part worth copying'
description: 'What writing an agent loop by hand taught me about which parts of an agent architecture actually matter — the loop is trivial, the parser is not, and the validation gate is the product.'
pubDate: 2026-10-02
tags: ['agentic-ai', 'python', 'tool-calling']
---

# I built a tool-calling agent without a framework, and the quality gate is the part worth copying

Every tutorial I saw for agentic workflows started the same way: install LangGraph, wire up a state graph, define nodes and edges, and let the framework handle the loop. It worked, and I had no idea what it was doing for me.

So I rebuilt the loop by hand. 737 lines in `agent.py`, no LangChain, no LangGraph, no dspy, no smolagents. Just a parse-execute-reflect cycle and 13 tools.

This is not an argument that frameworks are bad. It is an argument that the loop is small enough to read, and that reading it changed what I built. Three decisions came out of it that I would keep even if I went back to a framework tomorrow.

Repo: [github.com/MMS-21/analytics-agent](https://github.com/MMS-21/analytics-agent)

## The setup

A local agent that answers business questions about an e-commerce dataset and writes a report with charts. 5,720 customers, RFM segmentation, churn probability, predicted CLV. The question "Which segments are most at risk of churn?" should come out the other side as a DOCX with a bar chart and a recommendation, not a chatbot paragraph.

The whole thing is about 2,800 lines across seven Python files, and 21 tests that pass without an API key.

## Decision 1: no tool is allowed to be an LLM

The agent talks to a model. The tools do not.

```python
"segment_summary": lambda _: t.segment_summary(self.df),
"churn_risk_filter": lambda params: t.churn_risk_filter(
    self.df, params["risk_category"], params.get("limit", 10), ...
),
```

Every tool is a plain function over a DataFrame. Deterministic, pure, no model in the call path.

I did this for testability, and the payoff was bigger than I expected. All 13 tool tests run offline and finish in under a second:

```
test_load_data OK
test_segment_summary OK (6 segments, 4113 customers)
test_clv_by_segment OK (6 segments)
test_churn_risk_filter OK (5 critical-risk customers returned)
test_make_chart OK (avgpredictedclvbysegment.png, 38792 bytes)
...
13/13 tests passed
```

The 8 agent loop tests then swap in a mock `call_llm` that returns a scripted sequence of actions, and the real loop code, the real parser, and the real report assembler all get exercised with zero network calls.

This is an architecture decision, not a testing decision. Keeping the model out of the tool layer is what made the loop testable at all. The moment one tool calls a model, that test suite needs API keys and starts getting skipped.

## Decision 2: the parser is harder than the loop

The loop itself is about 40 lines. The parser that reads the model's reply turned out to be the real work.

The first version was `json.loads(response)`. It broke immediately, in three separate ways.

**Prose around the JSON.** The model would write "Let me check the segments first" and then emit the action. `json.loads` throws on the leading text. So `_extract_json_object` walks the string looking for candidate `{` characters, and for each one tracks brace depth, string state, and escape state until the object closes. It only accepts a candidate if `json.loads` succeeds *and* the `action` key is one of `tool_call`, `write_report`, `stop`. Anything else is skipped and the scan continues. A brace-depth counter alone would break on a nested `}` inside a quoted chart description, which is exactly what my `chart_descriptions` field produces.

**Different providers emit different tool-call formats.** Some models return JSON. NousResearch models return XML:

```xml
<tool_call>segment_summary</tool_call>
<parameter>risk_category=Critical Risk</parameter>
</tool_call>
```

That was a real bug I hit at runtime, not a hypothetical. `parse_action` tries JSON first, then falls back to `_extract_xml_action`, which handles both `<parameter>key=value</parameter>` and the `<arg_key>` / `<arg_value>` pair format, and coerces values to int or float when they parse. Both paths return the same action dict, so nothing downstream knows which format it came from.

**Malformed output.** When a response cannot be parsed, the agent does not crash and does not exit. It appends a corrective instruction to the context and loops again:

```python
if action is None:
    context.append(
        "\n\nYour last response could not be parsed. "
        "Write a report now using the data above. Output a JSON object with "
        "action='write_report', title, sections, chart_paths, and chart_descriptions."
    )
    continue
```

Same handling for an unknown tool name and for a tool that throws. The tool's exception message goes back into the context as a string and the model gets to adapt. An agent that dies because a model named a tool wrong is not usable.

## Decision 3: the quality gate (this is the real article)

Here is the part I would put in a blog post on its own.

In my first version, when the model emitted `write_report`, the agent wrote the file. Whatever the model produced landed on disk. And what the model produced was frequently a report with a heading, a paragraph, and no chart. Technically a report. Useless in practice.

The fix was a validation gate. Before any report is written, `_validate_report_action` checks:

- at least one chart, listed in `chart_paths`, **and** a description for it in `chart_descriptions`
- an Executive Summary section with a body of at least 30 characters
- a Findings section with at least 30 characters
- a Recommendations section with at least 10 characters

If it fails, the agent does not write the report. It feeds the specific failures back and asks for a revision:

```
--- Your report does not meet the required criteria. Please revise it. Issues found:
  - Report has no charts. Call make_chart and list the path in chart_paths.
  - Missing 'Executive Summary' section.
  - Chart 'avgpredictedclvbysegment.png' has no description in chart_descriptions.

  - Include at least one chart (call make_chart) and list its path in chart_paths.
  - Provide a chart_descriptions dict mapping each chart filename to a one-sentence description.
```

The specific-issue feedback matters more than the validation. Telling a model "your report is bad" gives it nothing to work with. Telling it "section X is 12 characters, needs 30, and chart Y needs a description" gives it three concrete edits.

After 2 failed revisions (3 total attempts), the agent stops trying, writes a best-effort report, and prints a visible warning. It does not loop forever, and it does not fail silently.

Why this matters beyond my repo: **an agent that produces output nobody validates is just a text generator with extra steps.** The gate is 40 lines. It is the difference between a system that consistently produces usable artifacts and one that produces plausible ones about 60% of the time. If you build agents, put a quality gate in front of the final output. It is the highest-leverage thing in the whole architecture and it is the part people skip.

Worth noting from the test output: my own mock LLM fails this gate every single time, and falls through to best-effort. That is the gate working as intended. A weak model produces a flagged report, never a silently bad one.

## The tools changed the analysis

This is the part I did not expect.

`churn_risk_filter` originally took `limit` and sorted by churn probability. Running it on the full base returned mostly rows where `segment` was null, because 1,607 of 5,720 customers have no RFM segment assigned and those rows cluster at the top of the churn sort.

So a top-N churn query answered the wrong question. It showed you the highest-risk customers, and those customers mostly had no segment, so the report could not say where the risk sat.

I added `max_per_segment`, which caps results per segment. Same function, one extra parameter, and the output became answerable:

```
## Findings
Average predicted CLV peaks in Champions at $2,951.32. Critical Risk customers
appear in every RFM segment once the sample is balanced with max_per_segment=5;
a plain top-N query returns mostly unsegmented rows and hides where the risk
actually sits.
```

Champions hold 65.5% of revenue at $2,951.32 average predicted CLV, which makes them the highest-value segment to retain and also the most expensive to lose. That insight is in the output only because the tool forced a balanced cut. A language model summarizing the raw top-N list would have written something confident and wrong.

![Bar chart of average predicted CLV per RFM segment, generated by the agent's make_chart tool from the bundled dataset](/img/clv-by-segment.png)

## What it does not do yet

Straight list, so you know the shape of it:

- **No CI.** 21 tests pass locally, but they only run when I run them. Adding a GitHub Actions workflow is the first thing to fix.
- **No token or cost accounting.** The context is a growing list of strings and I have no idea what a run costs.
- **The tool cap is coarse.** `MAX_TOOL_CALLS = 6` for everything. A question needing 8 calls gets truncated; one needing 3 wastes budget. A token budget would be better than a count.
- **`make_erd` and multi-file loading are barely exercised.** They work on the bundled single CSV. The folder, Parquet, and SQL paths in `data_source.py` are untested.

Two things that *were* on this list are now fixed, and the fixes shaped how the prompt works:

**The system prompt hardcoded the dataset.** It said "5,720 e-commerce customers" and listed the exact columns. Correct for the bundled CSV, a lie for anything else, which meant pointing the agent at a new file silently misinformed the model. The prompt now takes `{dataset_block}` and `{risk_hint}` tokens that get filled from the actual DataFrame at runtime — row count, columns grouped by dtype, the observed values of low-cardinality columns, and the null count. A synthetic 37-row order dataset produces a prompt describing 37 rows with `region` values, and leaks none of the bundled dataset's numbers.

`build_system_prompt` uses token replacement rather than `str.format`, because the template contains literal JSON action examples whose braces `str.format` would try to read as replacement fields.

`load_data` had the same problem in a smaller way: it returned the literal string "5,720 customer records; 4,113 have RFM segment assignments." It now derives both numbers from the frame.

## The takeaway

I did not learn something I could not have learned from the LangGraph docs. What I got from writing the loop by hand was a feel for which parts of an agent architecture are load-bearing and which are ceremony.

The loop is trivial. The parser is not. The validation gate is the whole product. And the tools need to be boring, because boring is what makes them testable.

If you are building agents: keep your final output behind a gate that can fail, and make your failure messages specific enough to act on.

---

*Moaaz Magdy, Data & Business Analyst. Building analytics tooling and agentic AI applications.*
