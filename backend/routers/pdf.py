from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Quote, Lead, Contractor, Pricing, Branding, Template
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import os
from datetime import datetime
import uuid

router = APIRouter()

os.makedirs("pdfs", exist_ok=True)

def generate_proposal_pdf(quote_id: int, db: Session) -> str:
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")
    
    lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
    contractor = db.query(Contractor).filter(Contractor.id == lead.contractor_id).first()
    pricing = db.query(Pricing).filter(Pricing.contractor_id == contractor.id).first()
    branding = db.query(Branding).filter(Branding.contractor_id == contractor.id).first()
    template = db.query(Template).filter(Template.contractor_id == contractor.id).first()
    
    filename = f"proposal_{quote_id}_{uuid.uuid4().hex[:8]}.pdf"
    filepath = os.path.join("pdfs", filename)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor(branding.primary_color if branding else "#22c55e"),
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor(branding.secondary_color if branding else "#16a34a")
    )
    
    story.append(Paragraph(template.header_text if template else "Professional Roof Quote", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph(contractor.company_name, styles['Heading1']))
    story.append(Paragraph(f"{contractor.address}<br/>{contractor.phone} | {contractor.email}", styles['Normal']))
    if contractor.website:
        story.append(Paragraph(contractor.website, styles['Normal']))
    story.append(Spacer(1, 0.5*inch))
    
    story.append(Paragraph("Prepared For:", heading_style))
    story.append(Paragraph(f"{lead.name}<br/>{lead.address}<br/>{lead.email}<br/>{lead.phone or ''}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Quote Details", heading_style))
    story.append(Paragraph(f"Quote Date: {quote.created_at.strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Paragraph(f"Quote #: {quote.id:05d}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Roof Specifications", heading_style))
    roof_data = quote.quote_data
    specs_data = [
        ["Roof Size:", f"{quote.roof_size_sqft:,.0f} sq ft ({roof_data.get('roof_squares', 0):.1f} squares)"],
        ["Roof Pitch:", roof_data.get('pitch', 'N/A')],
        ["Complexity:", roof_data.get('complexity', 'N/A').title()],
        ["Selected Product:", quote.selected_tier.title()]
    ]
    
    specs_table = Table(specs_data, colWidths=[2*inch, 4*inch])
    specs_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(specs_table)
    story.append(Spacer(1, 0.3*inch))
    
    tier_details = {
        "good": (pricing.good_tier_name, pricing.good_tier_warranty),
        "better": (pricing.better_tier_name, pricing.better_tier_warranty),
        "best": (pricing.best_tier_name, pricing.best_tier_warranty)
    }
    
    product_name, warranty = tier_details.get(quote.selected_tier, ("", ""))
    
    story.append(Paragraph("Selected Roofing System", heading_style))
    story.append(Paragraph(f"<b>{product_name}</b><br/>Warranty: {warranty}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Price Breakdown", heading_style))
    price_data = [
        ["Description", "Amount"],
        ["Roofing Materials & Labor", f"${quote.base_price:,.2f}"],
    ]
    if quote.removal_cost > 0:
        price_data.append(["Old Roof Removal", f"${quote.removal_cost:,.2f}"])
    if quote.permit_cost > 0:
        price_data.append(["Permits", f"${quote.permit_cost:,.2f}"])
    
    price_data.append(["", ""])
    price_data.append(["TOTAL", f"${quote.total_price:,.2f}"])
    
    price_table = Table(price_data, colWidths=[4*inch, 2*inch])
    price_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
        ('LINEBELOW', (0, -1), (-1, -1), 2, colors.black),
    ]))
    story.append(price_table)
    story.append(Spacer(1, 0.5*inch))
    
    if template:
        if template.show_warranty:
            story.append(Paragraph("Warranty Information", heading_style))
            story.append(Paragraph("This quote includes manufacturer's warranty and our workmanship guarantee.", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        if template.show_financing:
            story.append(Paragraph("Financing Available", heading_style))
            story.append(Paragraph("Ask about our flexible financing options with approved credit.", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        if template.custom_message:
            story.append(Paragraph(template.custom_message, styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        if template.terms_conditions:
            story.append(Paragraph("Terms & Conditions", heading_style))
            story.append(Paragraph(template.terms_conditions, styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.gray
    )
    
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(template.footer_text if template else "Thank you for your business!", footer_style))
    
    doc.build(story)
    
    return filepath

@router.post("/generate/{quote_id}")
async def generate_pdf(quote_id: int, db: Session = Depends(get_db)):
    try:
        filepath = generate_proposal_pdf(quote_id, db)
        
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        quote.pdf_url = f"/pdfs/{os.path.basename(filepath)}"
        db.commit()
        
        return {
            "success": True,
            "pdf_url": quote.pdf_url,
            "message": "PDF generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{quote_id}")
async def download_pdf(quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if not quote.pdf_url:
        filepath = generate_proposal_pdf(quote_id, db)
        quote.pdf_url = f"/pdfs/{os.path.basename(filepath)}"
        db.commit()
    else:
        filepath = quote.pdf_url.replace("/pdfs/", "pdfs/")
        if not os.path.exists(filepath):
            filepath = generate_proposal_pdf(quote_id, db)
            quote.pdf_url = f"/pdfs/{os.path.basename(filepath)}"
            db.commit()
    
    return FileResponse(
        filepath,
        media_type='application/pdf',
        filename=f"proposal_{quote_id}.pdf"
    )

@router.post("/email/{quote_id}")
async def email_pdf(
    quote_id: int,
    email_to: str = None,
    db: Session = Depends(get_db)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
    recipient_email = email_to or lead.email
    
    if not quote.pdf_url:
        filepath = generate_proposal_pdf(quote_id, db)
        quote.pdf_url = f"/pdfs/{os.path.basename(filepath)}"
        db.commit()
    
    return {
        "success": True,
        "message": f"PDF would be emailed to {recipient_email} (email service not configured)",
        "pdf_url": quote.pdf_url
    }