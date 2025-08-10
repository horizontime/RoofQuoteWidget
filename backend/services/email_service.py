import os
import base64
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        self.from_email = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@roofquotepro.com')
        self.from_name = os.environ.get('SENDGRID_FROM_NAME', 'Roof Quote Pro')
        
    def send_quote_email(
        self,
        to_email: str,
        customer_name: str,
        pdf_content: bytes,
        quote_details: dict,
        contractor_name: str = "Your Local Roofing Expert"
    ) -> bool:
        """
        Send a quote email with PDF attachment
        
        Args:
            to_email: Recipient email address
            customer_name: Customer's full name
            pdf_content: PDF file content as bytes
            quote_details: Dictionary containing quote details (address, price, tier, etc.)
            contractor_name: Name of the contractor sending the quote
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.api_key:
                print("WARNING: SENDGRID_API_KEY not configured. Email will not be sent.")
                return False
                
            # Create the email message
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=f"Your Roof Quote from {contractor_name}",
                html_content=self._create_email_html(customer_name, quote_details, contractor_name)
            )
            
            # Attach the PDF
            encoded_pdf = base64.b64encode(pdf_content).decode()
            attachment = Attachment(
                FileContent(encoded_pdf),
                FileName('roof_quote.pdf'),
                FileType('application/pdf'),
                Disposition('attachment')
            )
            message.attachment = attachment
            
            # Send the email
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            print(f"Email sent successfully to {to_email}. Status code: {response.status_code}")
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    def _create_email_html(self, customer_name: str, quote_details: dict, contractor_name: str) -> str:
        """Create HTML content for the email"""
        
        address = quote_details.get('address', 'Your Property')
        selected_tier = quote_details.get('selected_tier', 'Better').title()
        total_price = quote_details.get('total_price', 0)
        roof_size = quote_details.get('roof_size_sqft', 0)
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #059669;">Your Personalized Roof Quote</h2>
                    
                    <p>Dear {customer_name},</p>
                    
                    <p>Thank you for requesting a roof quote! We're excited to help you with your roofing project.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #059669; margin-top: 0;">Quote Summary</h3>
                        <p><strong>Property Address:</strong> {address}</p>
                        <p><strong>Estimated Roof Size:</strong> {roof_size:,} sq ft</p>
                        <p><strong>Selected Package:</strong> {selected_tier}</p>
                        <p style="font-size: 1.2em;"><strong>Total Estimated Price:</strong> <span style="color: #059669;">${total_price:,}</span></p>
                    </div>
                    
                    <p>Please find your detailed quote attached as a PDF. This quote includes:</p>
                    <ul>
                        <li>Complete pricing breakdown</li>
                        <li>Material specifications</li>
                        <li>Warranty information</li>
                        <li>Next steps</li>
                    </ul>
                    
                    <p><strong>What's Next?</strong></p>
                    <p>One of our roofing specialists will contact you within 24-48 hours to:</p>
                    <ul>
                        <li>Schedule a detailed roof inspection</li>
                        <li>Answer any questions you may have</li>
                        <li>Discuss financing options if needed</li>
                        <li>Confirm final measurements and pricing</li>
                    </ul>
                    
                    <p>If you have any immediate questions, please don't hesitate to reach out to us.</p>
                    
                    <p>Best regards,<br>
                    <strong>{contractor_name}</strong></p>
                    
                    <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 0.9em; color: #6b7280; text-align: center;">
                        This quote is valid for 30 days from the date of generation. 
                        Final pricing may vary based on actual roof measurements and conditions.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return html_content

# Create a singleton instance
email_service = EmailService()