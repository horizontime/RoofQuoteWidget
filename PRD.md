### **Project Title**

🛠️ Instant Roof Quote Widget with Contractor-Defined Pricing

### **Problem Statement**

Getting a price for a home improvement project today almost always requires scheduling an in-person contractor visit. This friction exists across nearly every trade — from roofing to water heaters — and slows down homeowner decision-making. In a world where e-commerce dominates, we believe homeowners will increasingly expect instant, self-serve pricing tools.

For contractors, this gap creates a missed opportunity. They receive tons of web traffic, but most of it leaves without engaging — not because pricing is unavailable, but because there’s nothing compelling enough to convert that curiosity into a conversation. By embedding an instant pricing widget on their site, contractors can create a “lead trap” — offering homeowners something of value (a price) in exchange for their contact information.

### **Business Context & Impact**

We home improvement contractors, especially roofers. This project helps our customers transition toward digital selling by giving them a self-serve quoting tool that engages early-stage buyers and feeds them into our CRM.

Impact Metrics:  
\- Increased lead capture from existing web traffic  
\- Shorter quote-to-conversation time  
\- Competitive differentiation for digitally enabled contractors

### **Technical Requirements**

\- Languages: JavaScript, TypeScript, Python  
\- Frontend: React (admin console + widget)  
\- Backend: FastAPI  
\- Cloud: AWS or GCP  
\- Data:  
  \- Google Maps API for address \+ aerial imagery  
  \- Mock roof measurement logic (fallback to EagleView/CoreLogic simulation)  
  \- Sample GAF shingles pricing:  
    \- Good: Timberline NS @ $3.50/sqft  
    \- Better: Timberline HDZ @ $4.00/sqft  
    \- Best: Timberline UHDZ @ $5.00/sqft  


### **Project Context & Environment**

\- \[✔\] Greenfield Project  
\- \[✔\] Mock Environment  
\- \[✔\] Simulated contractor \+ homeowner data

### **Success Criteria**

✅ Must-Have (MVP):  
\- Admin console for contractor to:  
  \- Select shingle SKUs (3 tiers)  
  \- Set per-sqft pricing  
  \- Upload branding (logo/colors)  
  \- Configure proposal PDF template. add live preview of pdf template.  
  \- Generate website embed code (iframe/script tag)  
\- Homeowner widget:  
  \- Input address  
  \- Confirm map location  
  \- Display good/better/best estimate  
  \- Customer can email Proposal PDF to themselves  
\- Responsive design; matches contractor site style automatically or via config
\- Lead created in mock CRM endpoint with estimate attached

## **Developer Notes & Clarifications**

This section is just for you, the engineer, to clarify how to approach the build and what’s expected given the time constraints and lack of prior domain knowledge.

1\. Widget Embedding  
Use a simple \<script\> or \<iframe\> code snippet that the admin console can generate. You don’t need to build WordPress integration, but demonstrate how the contractor installs it via copy/paste.

2\. Roof Measurement Logic  
Best effort: use Google Maps or Mapbox to identify the house and visually confirm the structure with a pin or bounding box.  
Stretch: estimate roof square footage using public data or assumptions.  

3\. Aerial Map Display  
Use a map API to show satellite view centered on the address with the house clearly indicated.

4\. Estimate Proposal PDF  
Include estimate summary, branding, warranty blurb, and testimonials. HTML preview is acceptable. Convert to PDF if possible.

5\. Admin Console Requirements  
Build live-editable fields for shingle pricing, branding, and content. Simulate a real contractor settings experience.

6\. Lead \+ Estimate Capture  
send captured leads and estimates to a mocked CRM endpoint. 