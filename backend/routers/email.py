from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
import logging
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)

# Load environment variables from sendgrid.env file
env_path = Path(__file__).parent.parent / 'sendgrid.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    logger.warning(f"SendGrid configuration file not found at {env_path}")

class SendQuoteEmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    email_content: str
    pdf_base64: Optional[str] = None
    lead_name: str

@router.post("/send-quote-email")
async def send_quote_email(request: SendQuoteEmailRequest):
    """Send a quote email with optional PDF attachment using SendGrid"""
    try:
        # Check for SendGrid configuration
        sg_api_key = os.environ.get('SENDGRID_API_KEY')
        if not sg_api_key or sg_api_key == 'your_sendgrid_api_key_here':
            logger.error("SendGrid API key not properly configured")
            raise HTTPException(
                status_code=500, 
                detail="Email service not configured. Please set up SendGrid API key in sendgrid.env file."
            )
        
        from_email = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@roofquotepro.com')
        reply_to = os.environ.get('SENDGRID_REPLY_TO', from_email)
        
        # Convert plain text to HTML with proper formatting
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="white-space: pre-wrap;">{request.email_content}</div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Roof Quote Pro on behalf of your roofing contractor.
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Create the email message
        message = Mail(
            from_email=from_email,
            to_emails=request.to_email,
            subject=request.subject,
            plain_text_content=request.email_content,
            html_content=html_content
        )
        
        # Set reply-to address
        message.reply_to = reply_to
        
        # Add PDF attachment if provided
        if request.pdf_base64:
            try:
                attachment = Attachment(
                    FileContent(request.pdf_base64),
                    FileName(f"Quote_{request.lead_name.replace(' ', '_')}.pdf"),
                    FileType('application/pdf'),
                    Disposition('attachment')
                )
                message.attachment = attachment
                logger.info(f"PDF attachment added for {request.lead_name}")
            except Exception as e:
                logger.error(f"Failed to attach PDF: {str(e)}")
                # Continue sending without attachment rather than failing completely
        
        # Send the email
        sg = SendGridAPIClient(sg_api_key)
        response = sg.send(message)
        
        logger.info(f"Email sent successfully to {request.to_email}. Status code: {response.status_code}")
        
        return {
            "success": True,
            "message": "Email sent successfully",
            "status_code": response.status_code,
            "details": {
                "to": request.to_email,
                "from": from_email,
                "pdf_attached": bool(request.pdf_base64)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        
        # Provide more specific error messages
        if "401" in str(e):
            error_msg = "Invalid SendGrid API key. Please check your configuration."
        elif "403" in str(e):
            error_msg = "SendGrid access forbidden. Please verify your sender email is authenticated."
        elif "400" in str(e):
            error_msg = "Invalid email request. Please check the email addresses."
        else:
            error_msg = f"Failed to send email: {str(e)}"
        
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/email-config-status")
async def get_email_config_status():
    """Check if email configuration is properly set up"""
    sg_api_key = os.environ.get('SENDGRID_API_KEY')
    from_email = os.environ.get('SENDGRID_FROM_EMAIL')
    reply_to = os.environ.get('SENDGRID_REPLY_TO')
    
    is_configured = bool(sg_api_key and sg_api_key != 'your_sendgrid_api_key_here')
    
    return {
        "sendgrid_configured": is_configured,
        "from_email_configured": bool(from_email),
        "from_email": from_email if from_email else "Not configured",
        "reply_to": reply_to if reply_to else from_email,
        "status": "ready" if is_configured else "not_configured",
        "message": "Email service is ready" if is_configured else "Please configure SendGrid API key in sendgrid.env file"
    }

@router.post("/test-email")
async def send_test_email(email: EmailStr):
    """Send a test email to verify SendGrid configuration"""
    try:
        sg_api_key = os.environ.get('SENDGRID_API_KEY')
        if not sg_api_key or sg_api_key == 'your_sendgrid_api_key_here':
            raise HTTPException(
                status_code=500,
                detail="SendGrid not configured. Please add your API key to sendgrid.env file."
            )
        
        from_email = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@roofquotepro.com')
        
        message = Mail(
            from_email=from_email,
            to_emails=email,
            subject="Test Email from Roof Quote Pro",
            html_content="""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Test Email Successful!</h2>
                    <p>Your SendGrid configuration is working correctly.</p>
                    <p>You can now send quote emails with PDF attachments to your leads.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is a test email from Roof Quote Pro
                    </p>
                </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(sg_api_key)
        response = sg.send(message)
        
        return {
            "success": True,
            "message": f"Test email sent successfully to {email}",
            "status_code": response.status_code
        }
        
    except Exception as e:
        logger.error(f"Test email failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")