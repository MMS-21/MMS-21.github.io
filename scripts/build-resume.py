"""Build the public resume from facts already recorded in the portfolio.

Sources: src/components/AboutTimeline.astro, src/pages/about.astro,
and src/data/site.ts. No inferred degrees, performance gains or job titles.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'moaaz-magdy-resume.pdf'
pdfmetrics.registerFont(TTFont('Cormorant', str(ROOT/'public/fonts/cormorant-garamond-medium.ttf')))
c = canvas.Canvas(str(OUT), pagesize=(595.28,841.89))
c.setTitle('Moaaz Magdy | Data & Business Analyst')
c.setAuthor('Moaaz Magdy')
c.setFillColor(HexColor('#fffcf5')); c.rect(0,0,595.28,841.89,fill=1,stroke=0)
ink=HexColor('#302c29'); muted=HexColor('#72675c')
styles={
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=8.5,leading=11.7,textColor=ink),
 'title':ParagraphStyle('title',fontName='Cormorant',fontSize=12.5,leading=14.5,textColor=ink),
 'meta':ParagraphStyle('meta',fontName='Helvetica',fontSize=7.3,leading=10,textColor=muted),
}
y=807
def paragraph(text,kind='body',gap=5,x=157,width=414):
 global y
 p=Paragraph(text,styles[kind]); _,height=p.wrap(width,1000)
 p.drawOn(c,x,y-height);y-=height+gap
def section(label):
 global y
 y-=10;c.setStrokeColor(HexColor('#d8cfc2'));c.setLineWidth(.45);c.line(24,y,571,y);y-=19
 c.setFont('Courier',6.7);c.setFillColor(muted);c.drawString(24,y-8,label.upper())
def item(title,meta,body):
 paragraph(title,'title',3);paragraph(meta,'meta',4);paragraph(body,'body',20)

c.setFillColor(ink);c.setFont('Courier',6.7);c.drawString(24,y,'MOAAZ MAGDY')
c.setFont('Helvetica',6.7)
for text,url,x in [('mms-21.github.io','https://mms-21.github.io/',157),('in/moaaz-magdy','https://www.linkedin.com/in/moaaz-magdy',365),('moaz.magdy220@gmail.com','mailto:moaz.magdy220@gmail.com',480)]:
 c.drawString(x,y,text);c.linkURL(url,(x,y-2,x+pdfmetrics.stringWidth(text,'Helvetica',6.7),y+8),relative=0)
y-=12
section('Education')
paragraph('Sadat Academy for Management Sciences','title',3)
paragraph('2017 - 2022','meta',3)
paragraph('International Business Management','body',18)
paragraph('Professional training &amp; certificates','title',4)
paragraph('Business Analytics Program · Digital Egypt Builders Initiative, Nov 2025 - Aug 2026<br/>Data Analytics and Visualization Bootcamp · Sprints, Mar 2025<br/>Advanced Data Analysis Nanodegree · Egypt FWD / Udacity, Oct 2022<br/>Google Data Analytics Professional Certificate · Google / Coursera, Aug 2022<br/>Data Analysis Challenger · Egypt FWD / Udacity, Apr 2022','body',5)
section('Experience')
item('Business Analyst · Al-Amal Trade &amp; Distribution','December 2024 - present','Reconcile 1,000+ financial, inventory and logistics records each month. Built 10+ recurring reports. Alongside this role, freelance work includes sales and HR dashboards and reporting automation.')
item('Career-readiness collaboration · Mattlob','September 2026 - present','Collaborate on practical activities including role matching, CV review and workplace skills.')
item('Customer service internships · QNB / Banque Misr','QNB: Summer 2020 · Banque Misr: Summer 2021','Gained exposure to banking operations, customer requests and the care required when handling financial information.')
section('Selected projects')
item('Customer value &amp; churn analysis','Python · pandas · scikit-learn · BG/NBD · Gamma-Gamma','Combined RFM segmentation, customer lifetime value modelling and churn risk to identify retention priorities. <link href="https://mms-21.github.io/projects/ecommerce-clv-churn/">View case study</link>')
item('analytics-agent / ai-tell','Python · FastAPI · React · TypeScript · Electron','Built an analytics assistant with deterministic tools and a report quality gate, and released a desktop tool for exploring document authorship signals. <link href="https://mms-21.github.io/projects/">View projects</link>')
section('Skills')
paragraph('Tools','meta',4)
paragraph('Excel, SQL, Python, pandas, Power BI, DAX, Tableau, matplotlib, React, TypeScript, FastAPI, Electron','body',14)
paragraph('Practice','meta',4)
paragraph('Reporting, reconciliation, customer segmentation, dashboard development and automation','body',3)
assert y>40, f'Resume overflows: final baseline {y}'
c.showPage();c.save()
reader=PdfReader(str(OUT));assert len(reader.pages)==1
assert '1,000+' in reader.pages[0].extract_text()
preview=ROOT/'public'/'img'/'resume-preview.png'
doc=pdfium.PdfDocument(str(OUT));doc[0].render(scale=1.7).to_pil().save(preview)
print(f'Created one-page resume; bottom baseline {y:.1f}pt')

