"""
Notification models for WhatsApp and other messaging services.
Defines request/response models for sending push notifications.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional



class PushMessage(BaseModel):
    """
    Pydantic model for the request body.
    Ensures that the request has the required fields.
    """
    model_config = ConfigDict(protected_namespaces=())
    recipient_whatsapp_number: str = Field(
        ...,
        description="WhatsApp number in international format (e.g., +1234567890)"
    )
    message_body: str = Field(
        ...,
        description="The message content to be sent",
        min_length=1,
        max_length=4096
    )

    @field_validator('recipient_whatsapp_number')
    @classmethod
    def validate_whatsapp_number(cls, v: str) -> str:
        """Validate WhatsApp number format."""
        if not v.startswith('+'):
            raise ValueError('WhatsApp number must start with + and include country code')
        
        # Remove + and check if remaining characters are digits
        number_without_plus = v[1:]
        if not number_without_plus.isdigit():
            raise ValueError('WhatsApp number must contain only digits after the + sign')
        
        # Check length (typically 10-15 digits including country code)
        if len(number_without_plus) < 10 or len(number_without_plus) > 15:
            raise ValueError('WhatsApp number must be between 10-15 digits including country code')
        
        return v

    @field_validator('message_body')
    @classmethod
    def validate_message_body(cls, v: str) -> str:
        """Validate message body content."""
        if not v.strip():
            raise ValueError('Message body cannot be empty or contain only whitespace')
        return v.strip()


class PushMessageResponse(BaseModel):
    """
    Response model for push message requests.
    """
    model_config = ConfigDict(protected_namespaces=())
    success: bool = Field(..., description="Whether the message was sent successfully")
    message_id: Optional[str] = Field(None, description="Unique identifier for the sent message")
    status: str = Field(..., description="Status of the message sending operation")
    error_message: Optional[str] = Field(None, description="Error message if sending failed")
    timestamp: Optional[str] = Field(None, description="Timestamp when the message was processed")


class BulkPushMessage(BaseModel):
    """
    Model for sending bulk WhatsApp messages.
    """
    model_config = ConfigDict(protected_namespaces=())
    recipient_whatsapp_numbers: list[str] = Field(
        ...,
        description="List of WhatsApp numbers in international format",
        min_length=1,
        max_length=100
    )
    message_body: str = Field(
        ...,
        description="The message content to be sent to all recipients",
        min_length=1,
        max_length=4096
    )

    @field_validator('recipient_whatsapp_numbers')
    @classmethod
    def validate_whatsapp_numbers(cls, v: list[str]) -> list[str]:
        """Validate all WhatsApp numbers in the list."""
        for number in v:
            if not number.startswith('+'):
                raise ValueError(f'WhatsApp number {number} must start with + and include country code')
            
            number_without_plus = number[1:]
            if not number_without_plus.isdigit():
                raise ValueError(f'WhatsApp number {number} must contain only digits after the + sign')
            
            if len(number_without_plus) < 10 or len(number_without_plus) > 15:
                raise ValueError(f'WhatsApp number {number} must be between 10-15 digits including country code')
        
        return v

    @field_validator('message_body')
    @classmethod
    def validate_message_body(cls, v: str) -> str:
        """Validate message body content."""
        if not v.strip():
            raise ValueError('Message body cannot be empty or contain only whitespace')
        return v.strip()


class BulkPushMessageResponse(BaseModel):
    """
    Response model for bulk push message requests.
    """
    model_config = ConfigDict(protected_namespaces=())
    total_messages: int = Field(..., description="Total number of messages attempted")
    successful_messages: int = Field(..., description="Number of messages sent successfully")
    failed_messages: int = Field(..., description="Number of messages that failed to send")
    message_results: list[dict] = Field(..., description="Detailed results for each message")
    overall_status: str = Field(..., description="Overall status of the bulk operation")
