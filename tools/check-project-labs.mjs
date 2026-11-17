import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const standalone=text('src/pages/project-labs/[slug].astro');
const html=text('src/components/ProjectLab.astro');
const layout=text('src/components/ProjectReadingLayout.astro');
const scripts=text('public/project-labs/labs.js');
const original=text('src/pages/projects/[slug].astro');
const hr=text('src/pages/projects/hr-attrition-analysis.astro');
const slugs=['ecommerce-clv-churn','hr-attrition-analysis','ab-test','sql-for-business-analytics','co2-emissions','analytics-agent','ai-tell','analytics-projects'];
for(const slug of slugs){
  assert(html.includes("'"+slug+"'"),'Missing lab content for '+slug);
  assert(html.includes("project.slug==='"+slug+"'"),'Missing lab section for '+slug);
}
assert(standalone.includes('<ProjectLab project={project}>'),'Standalone route does not use the shared lab');
assert(html.includes('id="interactive-lab"') && html.includes('/project-labs/${project.slug}/'), 'Inline lab must have a stable section anchor and standalone link');
assert(layout.includes('aria-label="Project contents"') && layout.includes('<details open>'), 'Missing accessible, collapsible project ledger');
for(const [name,route] of [['standard',original],['HR',hr]]){
  assert(route.includes('<ProjectLab project={project} embedded'),'Missing inline lab on '+name+' case studies');
  assert(route.includes('<ProjectReadingLayout sections={sections}>'),'Missing ledger on '+name+' case studies');
  assert(route.includes("id: 'interactive-lab'"), 'Ledger lacks lab link on '+name+' case studies');
}
new vm.Script(scripts,{filename:'labs.js'});
const co2=text('public/project-labs/co2-annual-2000-2020.csv').trim().split(/\r?\n/).slice(1).map(row=>row.split(','));
assert.equal(co2.length,420,'CO2 extract must have 20 countries times 21 years');
assert.equal(new Set(co2.map(r=>r[0])).size,20);
assert.equal(new Set(co2.map(r=>r[1]+'-'+r[2])).size,420);
assert(co2.every(r=>+r[2]>=2000 && +r[2]<=2020 && +r[3]>=0),'Invalid CO2 year/emissions');
const customer=text('public/data/ecommerce/segment-summary.csv').trim().split(/\r?\n/).slice(1);
const total=customer.reduce((sum,row)=>sum+Number(row.split(',')[1]),0);
assert.equal(total,5720,'RFM customer total changed');
const models=text('public/data/ecommerce/model-comparison.csv');
assert(models.includes('Random Forest')&&models.includes('Logistic Regression'));
assert(text('public/project-labs/agent-sales.csv').includes('South,,4'),'Missing-value test record is required');
for(const p of ['public/project-labs/labs.css','public/project-labs/labs.js','src/pages/project-labs/[slug].astro'])assert(existsSync(new URL('../'+p,import.meta.url)),'Missing '+p);
console.log('Project lab checks passed: 8 modules, 420 sourced CO2 observations, shared lab and case-study ledger, valid script, customer totals, and agent sample.');
