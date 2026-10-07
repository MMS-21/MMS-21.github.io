---
title: 'From a model call to a useful app: eight repositories worth exploring'
description: 'A practical route through AI learning resources and building tools, with a small project to try at every step.'
pubDate: 2026-10-08
tags: ['learning-resources', 'ai-applications', 'open-source']
---

Getting a model to answer a question is a useful first step. Turning that answer into an application introduces a different set of questions: where does the information come from, what can the model do, how does the interface behave, and how will you know when something breaks?

These eight repositories cover different parts of that journey. Some teach the concepts; others help implement a particular part of an application. You do not need to install all of them. Choose a small problem, then use the resource that helps with the next missing piece.

This is a reading and building guide based on the projects’ own documentation, checked on **8 October 2026**. The exercises are suggested learning projects, not claims that every example here has been tested end to end.

## Choose your starting point

| What you want to do | Where to start |
| --- | --- |
| Understand the basics of AI applications | Microsoft’s Generative AI for Beginners |
| Learn how agents use tools | Hugging Face Agents Course |
| Study practical Claude examples | Claude Cookbooks |
| Build an interactive TypeScript application | Vercel AI SDK |
| Coordinate a workflow with persistent state | LangGraph |
| Build around your own documents | LlamaIndex |
| Compare outputs and catch regressions | Promptfoo |
| Experiment with models on your machine | Ollama |

Before starting, be comfortable running a small Python or TypeScript program, installing dependencies, reading an error, and using environment variables. If those steps are unfamiliar, learning them alongside one simple model call is a better starting point than assembling a large agent system.

## Learn the building blocks

### Microsoft: Generative AI for Beginners

[Explore the repository →](https://github.com/microsoft/generative-ai-for-beginners)

This course mixes explanations with build exercises. Its lessons cover prompting, chat applications, search, function calling, retrieval-augmented generation, and application design. Python and TypeScript examples are included where possible.

**Start here if:** you know some programming but want a map of how the pieces fit together.

**Try this:** make a short-text classifier with three categories. Define the expected output, add several ambiguous inputs, and inspect what happens when an input does not fit any category. Keep the first version small enough that you can explain every step.

**Keep in mind:** check the setup instructions for the particular lesson. Provider accounts, model access, and possible usage charges depend on the example you choose.

### Hugging Face: Agents Course

[Explore the repository →](https://github.com/huggingface/agents-course)

The course moves from agent fundamentals to frameworks and practical assignments. It includes material on smolagents, LlamaIndex, and LangGraph, which makes it useful for comparing approaches after you understand what a tool-using loop does.

**Start here if:** you can already call a model and want to understand how an application lets it request an action, receive the result, and decide what to do next.

**Try this:** give an assistant one read-only tool that looks up a record in a small local catalogue. Log the tool name, arguments, result, and final response. Add a limit on tool calls and a clear response for missing records.

**Keep in mind:** an agent does not need a large collection of tools. One well-defined tool makes the behaviour easier to inspect than several overlapping ones.

### Anthropic: Claude Cookbooks

[Explore the repository →](https://github.com/anthropics/claude-cookbooks)

The cookbooks provide focused examples for tasks such as classification, summarisation, retrieval, tool use, and evaluation. Most examples are written in Python and require access to the Claude API.

**Start here if:** you have a concrete feature in mind and want to study a relevant example rather than follow a full course.

**Try this:** adapt a summarisation example for a short meeting note. Ask for decisions, open questions, and next steps. Include a note with no decision and check that the output leaves that category empty rather than inventing one.

**Keep in mind:** the examples teach Claude-specific interfaces. The underlying ideas may transfer to another provider, but the API calls and supported features need checking.

## Give the application a useful shape

### Vercel: AI SDK

[Explore the repository →](https://github.com/vercel/ai)

The AI SDK is a TypeScript toolkit for AI applications. Its documentation and examples cover text generation, structured outputs, tool use, and interfaces that stream responses.

**Start here if:** your next problem is the interaction between a model and a web application: showing progress, handling an interrupted response, or presenting an output as something more useful than a chat paragraph.

**Try this:** build a short-note organiser. Let someone paste a note, generate a structured summary, and edit the result before saving it. Include loading, failure, and retry states in the interface.

**Keep in mind:** a convenient SDK does not remove the application’s responsibilities. Keep provider credentials on the server and validate submitted inputs and generated data.

### LangChain: LangGraph

[Explore the repository →](https://github.com/langchain-ai/langgraph)

LangGraph focuses on stateful workflows and agents. Its capabilities include durable execution and human-in-the-loop interaction, useful when a process needs to pause, resume, or carry information across steps.

**Start here if:** you can describe the workflow, but coordinating its steps and preserving state is becoming difficult.

**Try this:** build a draft-and-review process. Generate a draft, pause for a person’s decision, and either finish or revise it. Make the current state visible so you can see exactly where the process stopped.

**Keep in mind:** a graph is an implementation choice. For a single request with a predictable sequence of steps, an ordinary function may be easier to maintain. Reach for workflow infrastructure when the coordination problem is real.

### LlamaIndex

[Explore the repository →](https://github.com/run-llama/llama_index)

LlamaIndex provides tools for building AI applications around data, including document ingestion, indexing, and retrieval. It is a useful place to investigate how an application finds relevant material before asking a model to respond.

**Start here if:** your application needs to answer questions using a specific collection of documents.

**Try this:** use a handful of public documents to build a question-answering tool that shows the passages used in an answer. Include a question whose answer is absent from the documents and check whether the application admits the gap.

**Keep in mind:** retrieval-augmented generation, or RAG, supplies context; it does not guarantee correctness. Inspect what was retrieved as well as the final answer. A fluent answer can hide a poor search result.

## Check the result and explore local models

### Promptfoo

[Explore the repository →](https://github.com/promptfoo/promptfoo)

Promptfoo is a command-line tool and library for evaluating AI applications. It supports comparisons across prompts and providers, along with evaluation and red-teaming workflows.

**Start here if:** a change appears to improve one example, but you need to know what it does to the rest of your test cases.

**Try this:** collect ten inputs for your small application, including ambiguous and malformed ones. Define what a satisfactory result means for each input. Compare two prompt versions and investigate any regression rather than choosing the version with the most convincing single response.

**Keep in mind:** checks need to reflect the task. Valid JSON is a useful structural check, but it cannot tell you whether the content is correct. Model-based judging can help with some criteria, but it also needs calibration against human review.

### Ollama

[Explore the repository →](https://github.com/ollama/ollama)

Ollama lets you run supported models locally and offers Python and JavaScript libraries for application integration. It is useful for exploring how a different model changes an application’s behaviour without tying every experiment to a hosted model API.

**Start here if:** you want to experiment with a model your hardware can run, or compare a local model with a hosted option.

**Try this:** run the same small classification task with a locally available model. Record response time and incorrect or invalid outputs. Use the same inputs so the comparison tells you something about the task rather than about two different demos.

**Keep in mind:** model size, available memory, and hardware affect the experience. Check the licence of the model you choose. Also verify whether your application uses any cloud models, external tools, or telemetry before describing the whole system as local or private.

## A practical route through the list

A useful first project is a small assistant that turns a public document into a structured note and answers a few questions about it. It gives you a reason to work on inputs, output shape, evidence, and failure states without needing a large system.

1. **Make one model call.** Start with the Microsoft course or a cookbook example. Keep the input short and inspect the raw response.
2. **Define a useful output.** Decide which fields the application needs and what should happen when information is missing. Validate that structure in code.
3. **Build a thin interface.** Use the AI SDK if you are working in TypeScript. Make progress and failures visible; let someone correct the result.
4. **Add retrieval only when needed.** If the source material no longer fits a simple request, explore LlamaIndex and inspect the retrieved passages.
5. **Create a small evaluation set.** Use Promptfoo to compare changes against ordinary and difficult examples. Save failures as future test cases.
6. **Add tools or workflow state for a specific reason.** Use the Agents Course to learn the concepts and LangGraph if the process genuinely needs coordination or pausing. Keep the first tools read-only.

Ollama is an alternative way to run the model in these experiments where your chosen tools and model capabilities are compatible. It is not an extra stage that every application needs.

## What to take away from a repository

Aim to finish an experiment with something you can explain: the input, the model request, the data or tools involved, the output, and the checks around it. Read the project’s current documentation before copying a setup command, and keep a record of the versions you use.

The most valuable result is a small working application with a few known limitations and repeatable checks. Once that exists, choosing the next repository becomes much easier: you have an actual problem for it to solve.

For a closer look at building and checking a tool-calling loop, [read the analytics agent build notes](/writing/analytics-agent-build/). Or [explore the projects](/projects/) to see how these ideas connect to practical work.
