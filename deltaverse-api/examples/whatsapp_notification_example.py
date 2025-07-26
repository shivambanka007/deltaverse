"""
Example usage of the PushMessage model for WhatsApp notifications.
This demonstrates how to use the notification models and API endpoints.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

# Example usage of the PushMessage model
async def send_pubsub_message_example():
    """
    Example function showing how to send a message to Pub/Sub topic.
    """
    
    # API endpoint
    base_url = "http://localhost:8080"
    endpoint = f"{base_url}/notifications/send_message"
    
    # Example message data
    message_data = {
        "recipient_whatsapp_number": "+919876543210",
        "message_body": "Hello! This message will be sent to Pub/Sub topic for processing."
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                endpoint,
                json=message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Message sent to Pub/Sub successfully!")
                    print(f"Status: {result.get('status')}")
                    print(f"Message ID: {result.get('message_id')}")
                    print(f"Topic: {result.get('topic')}")
                    print(f"Timestamp: {result.get('timestamp')}")
                else:
                    error = await response.text()
                    print(f"❌ Failed to send message to Pub/Sub: {error}")
                    
    except Exception as e:
        print(f"❌ Error sending message to Pub/Sub: {str(e)}")


async def check_pubsub_status_example():
    """
    Example function showing how to check Pub/Sub status.
    """
    base_url = "http://localhost:8080"
    endpoint = f"{base_url}/notifications/pubsub/status"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Pub/Sub status retrieved!")
                    print(f"Pub/Sub Available: {result.get('pubsub_available')}")
                    print(f"Publisher Initialized: {result.get('publisher_initialized')}")
                    print(f"Topic Path: {result.get('topic_path')}")
                    print(f"GCP Project ID: {result.get('gcp_project_id')}")
                    print(f"Topic ID: {result.get('pubsub_topic_id')}")
                else:
                    error = await response.text()
                    print(f"❌ Failed to get Pub/Sub status: {error}")
                    
    except Exception as e:
        print(f"❌ Error checking Pub/Sub status: {str(e)}")


async def send_whatsapp_notification_example():
    """
    Example function showing how to send a WhatsApp notification
    using the PushMessage model via the API.
    """
    
    # API endpoint (adjust based on your deployment)
    base_url = "http://localhost:8080"  # or your deployed API URL
    endpoint = f"{base_url}/notifications/whatsapp/send"
    
    # Example message data
    message_data = {
        "recipient_whatsapp_number": "+919876543210",
        "message_body": "Hello! This is a test notification from Deltaverse. Your financial health score has been updated."
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                endpoint,
                json=message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Message sent successfully!")
                    print(f"Message ID: {result.get('message_id')}")
                    print(f"Status: {result.get('status')}")
                    print(f"Timestamp: {result.get('timestamp')}")
                else:
                    error = await response.text()
                    print(f"❌ Failed to send message: {error}")
                    
    except Exception as e:
        print(f"❌ Error sending message: {str(e)}")


async def send_bulk_whatsapp_notifications_example():
    """
    Example function showing how to send bulk WhatsApp notifications.
    """
    
    # API endpoint
    base_url = "http://localhost:8080"
    endpoint = f"{base_url}/notifications/whatsapp/send-bulk"
    
    # Example bulk message data
    bulk_message_data = {
        "recipient_whatsapp_numbers": [
            "+919876543210",
            "+919876543211",
            "+919876543212"
        ],
        "message_body": "🎉 Great news! Your financial health score has improved this month. Check your dashboard for details."
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                endpoint,
                json=bulk_message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Bulk messages processed!")
                    print(f"Total messages: {result.get('total_messages')}")
                    print(f"Successful: {result.get('successful_messages')}")
                    print(f"Failed: {result.get('failed_messages')}")
                    print(f"Overall status: {result.get('overall_status')}")
                    
                    # Print individual results
                    for msg_result in result.get('message_results', []):
                        status_icon = "✅" if msg_result['success'] else "❌"
                        print(f"{status_icon} {msg_result['recipient']}: {msg_result['status']}")
                        
                else:
                    error = await response.text()
                    print(f"❌ Failed to send bulk messages: {error}")
                    
    except Exception as e:
        print(f"❌ Error sending bulk messages: {str(e)}")


def validate_push_message_example():
    """
    Example showing how to validate PushMessage data using Pydantic V2.
    """
    from pydantic import ValidationError
    
    # Try to import the actual model, fallback to local definition if needed
    try:
        from app.models.notifications import PushMessage
    except ImportError:
        # Fallback definition for testing
        from pydantic import BaseModel, Field, field_validator
        
        class PushMessage(BaseModel):
            recipient_whatsapp_number: str = Field(..., example="+919876543210")
            message_body: str = Field(..., min_length=1, max_length=4096)

            @field_validator('recipient_whatsapp_number')
            @classmethod
            def validate_whatsapp_number(cls, v: str) -> str:
                if not v.startswith('+'):
                    raise ValueError('WhatsApp number must start with + and include country code')
                number_without_plus = v[1:]
                if not number_without_plus.isdigit():
                    raise ValueError('WhatsApp number must contain only digits after the + sign')
                if len(number_without_plus) < 10 or len(number_without_plus) > 15:
                    raise ValueError('WhatsApp number must be between 10-15 digits including country code')
                return v

            @field_validator('message_body')
            @classmethod
            def validate_message_body(cls, v: str) -> str:
                if not v.strip():
                    raise ValueError('Message body cannot be empty or contain only whitespace')
                return v.strip()
    
    print("🔍 Testing PushMessage validation...")
    
    # Valid message
    try:
        valid_message = PushMessage(
            recipient_whatsapp_number="+919876543210",
            message_body="This is a valid message."
        )
        print("✅ Valid message created successfully")
        print(f"   Recipient: {valid_message.recipient_whatsapp_number}")
        print(f"   Message: {valid_message.message_body}")
    except Exception as e:
        print(f"❌ Unexpected error with valid message: {e}")
    
    # Invalid phone number (missing +)
    try:
        invalid_message = PushMessage(
            recipient_whatsapp_number="919876543210",  # Missing +
            message_body="This message has invalid phone number."
        )
        print("❌ Should have failed validation!")
    except ValidationError as e:
        print(f"✅ Correctly caught invalid phone number: {e}")
    except Exception as e:
        print(f"✅ Correctly caught invalid phone number: {e}")
    
    # Empty message body
    try:
        invalid_message = PushMessage(
            recipient_whatsapp_number="+919876543210",
            message_body=""  # Empty message
        )
        print("❌ Should have failed validation!")
    except ValidationError as e:
        print(f"✅ Correctly caught empty message: {e}")
    except Exception as e:
        print(f"✅ Correctly caught empty message: {e}")
    
    # Phone number too short
    try:
        invalid_message = PushMessage(
            recipient_whatsapp_number="+123",  # Too short
            message_body="This message has too short phone number."
        )
        print("❌ Should have failed validation!")
    except ValidationError as e:
        print(f"✅ Correctly caught short phone number: {e}")
    except Exception as e:
        print(f"✅ Correctly caught short phone number: {e}")


async def check_message_status_example():
    """
    Example showing how to check the status of a sent message.
    """
    base_url = "http://localhost:8080"
    message_id = "example-message-id-123"
    endpoint = f"{base_url}/notifications/whatsapp/status/{message_id}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Message status retrieved!")
                    print(f"Message ID: {result.get('message_id')}")
                    print(f"Status: {result.get('status')}")
                    print(f"Sent at: {result.get('sent_at')}")
                    print(f"Delivered at: {result.get('delivered_at')}")
                    print(f"Read at: {result.get('read_at')}")
                else:
                    error = await response.text()
                    print(f"❌ Failed to get message status: {error}")
                    
    except Exception as e:
        print(f"❌ Error checking message status: {str(e)}")


async def main():
    """
    Main function to run all examples.
    """
    print("🚀 WhatsApp Notification Examples")
    print("=" * 50)
    
    print("\n1. Validating PushMessage model:")
    validate_push_message_example()
    
    print("\n2. Checking Pub/Sub status:")
    await check_pubsub_status_example()
    
    print("\n3. Sending message to Pub/Sub topic:")
    await send_pubsub_message_example()
    
    print("\n4. Sending single WhatsApp notification:")
    await send_whatsapp_notification_example()
    
    print("\n5. Sending bulk WhatsApp notifications:")
    await send_bulk_whatsapp_notifications_example()
    
    print("\n6. Checking message status:")
    await check_message_status_example()
    
    print("\n✅ All examples completed!")


if __name__ == "__main__":
    # Run the examples
    asyncio.run(main())
