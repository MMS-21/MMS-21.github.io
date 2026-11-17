export interface DashboardVisual {
  title: string;
  path: string;
  alt: string;
}

export interface DashboardSource {
  label: string;
  path: string;
}

export interface DashboardProject {
  slug: string;
  title: string;
  format: string;
  period: string;
  folder: string;
  summary: string;
  question: string;
  findings: string[];
  preview: DashboardVisual;
  gallery: DashboardVisual[];
  files: DashboardSource[];
}

const ROOT = 'https://github.com/MMS-21/Analytics-Projects';
const RAW = 'https://raw.githubusercontent.com/MMS-21/Analytics-Projects/main';

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function dashboardRepositoryUrl(project: DashboardProject): string {
  return ROOT + '/tree/main/' + encodePath(project.folder);
}

export function dashboardFileUrl(project: DashboardProject, path: string): string {
  return ROOT + '/blob/main/' + encodePath(project.folder + '/' + path);
}

export function dashboardImageUrl(project: DashboardProject, path: string): string {
  return RAW + '/' + encodePath(project.folder + '/' + path);
}

export function dashboardPageUrl(project: DashboardProject): string {
  return '/projects/analytics-projects/' + project.slug + '/';
}

// Each entry maps to a folder and an actual image in the public analytics repository.
// Reports and infographics are labelled accurately rather than described as live embeds.
export const DASHBOARDS: DashboardProject[] = [
  {
    slug: 'melodymart-performance',
    title: 'MelodyMart Performance',
    format: 'Sales dashboard',
    period: '2007–2011',
    folder: 'MelodyMart Performance Analysis',
    summary: 'A music retail sales view across genres, cities, units sold, and average revenue.',
    question: 'Which products and locations contribute most to revenue, and where should the team investigate next?',
    findings: [
      'Rock leads the genre breakdown in the documented report.',
      'Average customer revenue is reported as $11.89 in the project notes.',
      'Chile and Poland are identified for further investigation; weaker observed sales alone do not justify expanding into those markets.',
    ],
    preview: {
      title: 'MelodyMart dashboard overview',
      path: 'snap/melody mart performance.png',
      alt: 'MelodyMart sales dashboard with revenue, genres, cities, and product performance charts.',
    },
    gallery: [],
    files: [
      { label: 'Project notes and interpretation', path: 'readme.md' },
    ],
  },
  {
    slug: 'plant-co-performance',
    title: 'Plant Co. Performance',
    format: 'Power BI dashboard',
    period: '2022–2024',
    folder: 'Power BI Dashboard Plant Co. Performance 2022 - 204',
    summary: 'Year-to-date sales, quantity, and gross profit compared with matching prior-year periods.',
    question: 'Is the performance gap driven by countries, product categories, or account profitability?',
    findings: [
      'The report documents an overall year-to-date sales decline against the previous year.',
      'Portugal and the Philippines stand out more positively in the country-level breakdown.',
      'The reported 39.62% gross profit percentage is from the selected dashboard context, not proof of a sustained change.',
    ],
    preview: {
      title: 'Plant Co. dashboard overview',
      path: 'QuickShots/Whole Dashboard.png',
      alt: 'Power BI report with year-to-date KPIs, country sales comparison, waterfall, and profitability scatter plot.',
    },
    gallery: [
      { title: 'Country breakdown', path: 'QuickShots/CatMap.png', alt: 'Country-level comparison of year-to-date performance.' },
      { title: 'Change waterfall', path: 'QuickShots/Waterfall.png', alt: 'Waterfall visual comparing current and previous year-to-date performance.' },
      { title: 'Account profitability', path: 'QuickShots/Scatter.png', alt: 'Scatter plot of accounts by profitability and sales.' },
    ],
    files: [
      { label: 'Power BI source file (.pbix)', path: 'Power BI Dashboard Plant Co. Performance 2022 -2024.pbix' },
      { label: 'Project methodology and measures', path: 'README.md' },
    ],
  },
  {
    slug: 'king-county-house-sales',
    title: 'King County House Sales',
    format: 'Tableau dashboard',
    period: 'July 2014 view',
    folder: 'KING COUNTY, WASHINGTON HOUSE SALES DASHBOARD',
    summary: 'Property prices, distributions, and housing characteristics for King County, Washington.',
    question: 'What does the price distribution reveal that a single average selling price cannot?',
    findings: [
      'The documented July 2014 view places many sales broadly in the $200,000 to $800,000 range.',
      'Filters include living area, lot size, year built, and sales date.',
      'Condition and view vary alongside sale prices; the chart does not establish that either feature caused a price change.',
    ],
    preview: {
      title: 'King County housing dashboard',
      path: 'Quick/King County, Washington House Sales.JPG',
      alt: 'Tableau housing dashboard showing price distribution, map, home features, and date filters.',
    },
    gallery: [
      { title: 'Price distribution', path: 'Quick/PriceDistribution.png', alt: 'Histogram of house sales by price range.' },
      { title: 'Condition and view', path: 'Quick/Condition.png', alt: 'Heatmap of average house prices by property condition and view.' },
      { title: 'Location overview', path: 'Quick/Map.png', alt: 'Map of King County house sales.' },
    ],
    files: [
      { label: 'Tableau workbook (.twb)', path: 'KING COUNTY, WASHINGTON HOUSE SALES DASHBOARD.twb' },
      { label: 'PDF report', path: 'HOUSES.pdf' },
      { label: 'Project documentation', path: 'README.md' },
    ],
  },
  {
    slug: 'hospital-operational-efficiency',
    title: 'Hospital Operational Efficiency',
    format: 'Operations dashboard',
    period: 'Department comparisons',
    folder: 'Hospital Operational Efficiency',
    summary: 'Patient waiting times, surgery duration, and departments meeting waiting-time targets.',
    question: 'Where are patients waiting longest, and what additional context would explain those delays?',
    findings: [
      'The project records approximately 4,250 total surgery hours for Orthopedics.',
      'General Practice is flagged for patients exceeding waiting-time targets.',
      'Total surgery hours and waiting times need patient volume and case complexity before they can establish efficiency.',
    ],
    preview: {
      title: 'Hospital operations dashboard',
      path: 'snap/operational effeciency.png',
      alt: 'Hospital dashboard showing wait-time measures and surgery duration across departments.',
    },
    gallery: [],
    files: [{ label: 'Project notes', path: 'readme.md' }],
  },
  {
    slug: 'patient-satisfaction',
    title: 'Patient Satisfaction',
    format: 'Tableau dashboard',
    period: 'Department comparisons',
    folder: 'Patient Satisfaction Analysis',
    summary: 'Satisfaction scores examined alongside waiting times and patient characteristics.',
    question: 'Which departments receive different satisfaction scores, and what might warrant follow-up?',
    findings: [
      'The documented report lists Renal at 5.3 and Orthopedics at 4.9.',
      'It describes an association between shorter waits and higher satisfaction.',
      'Scores alone do not explain patient experiences; case mix, survey response rates, and sample sizes matter.',
    ],
    preview: {
      title: 'Patient satisfaction dashboard',
      path: 'snap/patient satisfaction.png',
      alt: 'Patient satisfaction dashboard comparing service ratings across departments and patient groups.',
    },
    gallery: [],
    files: [{ label: 'Project notes', path: 'readme.md' }],
  },
  {
    slug: 'hr-retention',
    title: 'HR Retention Analysis',
    format: 'Excel dashboard',
    period: 'IBM HR sample',
    folder: 'HR Retention Analysis',
    summary: 'Executive and detailed views of employee attrition by role, tenure, overtime, and age.',
    question: 'Which workforce groups show unusually high attrition and deserve a closer look?',
    findings: [
      'The project documents 237 leavers and an overall attrition rate of approximately 16%.',
      'Sales Representatives are reported with a 40% attrition rate in this sample.',
      'Differences between groups are descriptive patterns, not proof that role or overtime causes employees to leave.',
    ],
    preview: {
      title: 'HR attrition executive view',
      path: 'SnapShots/Screenshot 2025-12-11 151715.png',
      alt: 'Executive Excel HR attrition dashboard screenshot.',
    },
    gallery: [
      { title: 'HR attrition deep dive', path: 'SnapShots/Screenshot 2025-12-11 151845.png', alt: 'Detailed employee attrition dashboard showing workforce group comparisons.' },
    ],
    files: [
      { label: 'Excel workbook and source data', path: 'src/WA_Fn-UseC_-HR-Employee-Attrition.xlsx' },
      { label: 'Project documentation', path: 'readme.md' },
    ],
  },
  {
    slug: 'supermarket-turnaround',
    title: 'Supermarket Turnaround Plan',
    format: 'Retail dashboard and report',
    period: 'Q1 2025',
    folder: 'Q1 2025 Supermarket Turnaround Plan',
    summary: 'A business review connecting category revenue, margins, and customer experience to a proposed recovery plan.',
    question: 'Why can revenue look healthy while the overall gross profit margin remains weak?',
    findings: [
      'The project reports $122,967 in revenue from 1,000 transactions.',
      'Its documented baseline gross profit margin is 4.8%.',
      'The 8.0% margin is a target in the proposed turnaround plan, not a measured achieved result.',
    ],
    preview: {
      title: 'Q1 supermarket performance dashboard',
      path: 'Snaps/Screenshot 2026-02-02 232516.png',
      alt: 'Supermarket dashboard preview of revenue, gross profit margin, and category performance.',
    },
    gallery: [
      { title: 'Turnaround presentation opening', path: 'Snaps/Slide1.JPG', alt: 'Opening slide of Q1 2025 Supermarket Turnaround Plan.' },
      { title: 'Supporting analysis slide', path: 'Snaps/Slide8.JPG', alt: 'Selected visual from the supermarket analysis presentation.' },
    ],
    files: [
      { label: 'Turnaround presentation (PDF)', path: 'Report/Q1 2025 Supermarket Turnaround Plan.pdf' },
      { label: 'Analysis workbook (.xlsx)', path: 'SRC/SuperMarket Analysis.xlsx' },
      { label: 'Project notes', path: 'readme.md' },
    ],
  },
  {
    slug: 'co2-per-capita-2020',
    title: 'CO₂ Emissions per Capita',
    format: 'Data infographic',
    period: '2000–2020',
    folder: 'CO2 Emissions per capita For 2020',
    summary: 'A comparative infographic of total emissions, emissions per person, population, and GDP.',
    question: 'How does the picture change when national totals and per-person emissions are compared?',
    findings: [
      'The composition covers a 2020 country selection with population and GDP axes.',
      'Small trend lines summarize emissions per person from 2000 to 2020.',
      'Symbol size denotes total emissions, while the visual encoding and country selection should be checked before ranking countries.',
    ],
    preview: {
      title: 'CO₂ per-capita infographic',
      path: 'images/Proj Parts/CO2.JPG',
      alt: 'Emissions infographic comparing countries by population, GDP, total emissions, and per-person trends.',
    },
    gallery: [
      { title: 'Chart legend', path: 'images/Proj Parts/legend.JPG', alt: 'Legend explaining the infographic symbols.' },
      { title: 'Trend-line key', path: 'images/Proj Parts/Curved Lines.JPG', alt: 'Explanation of the curved trend-line encoding.' },
      { title: 'Circle-size key', path: 'images/Proj Parts/Circles.png', alt: 'Explanation of circle sizes in the infographic.' },
    ],
    files: [
      { label: 'PDF infographic', path: 'CO2 Emissions  Per Capita 2020.pdf' },
      { label: 'Sources and interpretation', path: 'README.md' },
    ],
  },
  {
    slug: 'global-co2-by-source',
    title: 'Global CO₂ by Source',
    format: 'Data visualization',
    period: 'Global emissions',
    folder: 'Global CO2 Emissions by Fuel and Industry',
    summary: 'An emissions breakdown across coal, oil, natural gas, and industrial processes.',
    question: 'Which energy and industrial sources contribute to global carbon dioxide emissions?',
    findings: [
      'Coal, oil, and natural gas are the principal fuel sources highlighted.',
      'The illustration also identifies cement-related industrial emissions.',
      'Source shares depend on the year and dataset; the accompanying project links the underlying Our World in Data series.',
    ],
    preview: {
      title: 'Global CO₂ emissions infographic',
      path: 'CO2 FUEL, INDUSTRY.png',
      alt: 'Infographic of global carbon dioxide emissions by fuel and industry.',
    },
    gallery: [],
    files: [{ label: 'Sources and project notes', path: 'README.md' }],
  },
];
