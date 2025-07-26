"""
Pydantic models for chat functionality.
Defines request/response schemas for chat endpoints.
"""

from datetime import datetime, UTC
from typing import List, Optional, Dict, Any, Annotated
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict, field_serializer


class MessageRole(str, Enum):
    """Enumeration for message roles in chat."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Model for a single chat message."""
    
    model_config = ConfigDict(protected_namespaces=())
    
    id: Optional[str] = Field(None, description="Unique message identifier")
    role: MessageRole = Field(..., description="Role of the message sender")
    content: str = Field(..., min_length=1, max_length=10000, description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(UTC), description="Message timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional message metadata")
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        """Validate message content."""
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty")
        return v.strip()


class ChatRequest(BaseModel):
    """Model for chat request."""
    
    message: str = Field(..., min_length=1, max_length=10000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation identifier for context")
    conversation_history: Optional[List[ChatMessage]] = Field(
        default_factory=list, 
        max_length=50,
        description="Previous conversation messages for context"
    )
    stream: bool = Field(default=False, description="Whether to stream the response")
    user_id: Optional[str] = Field(None, description="User identifier")
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        """Validate user message."""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()
    
    @field_validator('conversation_history')
    @classmethod
    def validate_conversation_history(cls, v):
        """Validate conversation history."""
        if v and len(v) > 50:
            # Keep only the last 50 messages to prevent token limit issues
            return v[-50:]
        return v or []


class ChatResponse(BaseModel):
    """Model for chat response."""
    
    model_config = ConfigDict(protected_namespaces=())
    
    message: str = Field(..., description="AI assistant response")
    conversation_id: Optional[str] = Field(None, description="Conversation identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Response timestamp")
    model_info: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model information")
    usage: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Token usage information")
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        return value.isoformat()


class ChatStreamChunk(BaseModel):
    """Model for streaming chat response chunks."""
    
    model_config = ConfigDict()
    
    chunk: str = Field(..., description="Response chunk")
    conversation_id: Optional[str] = Field(None, description="Conversation identifier")
    is_final: bool = Field(default=False, description="Whether this is the final chunk")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Chunk timestamp")
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        return value.isoformat()


class ConversationSummary(BaseModel):
    """Model for conversation summary."""
    
    model_config = ConfigDict()
    
    conversation_id: str = Field(..., description="Conversation identifier")
    title: Optional[str] = Field(None, description="Conversation title")
    message_count: int = Field(default=0, description="Number of messages in conversation")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Conversation creation timestamp")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Last update timestamp")
    user_id: Optional[str] = Field(None, description="User identifier")
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value: datetime) -> str:
        return value.isoformat()


class ChatHealthCheck(BaseModel):
    """Model for chat service health check response."""
    
    model_config = ConfigDict(protected_namespaces=())
    
    status: str = Field(..., description="Service status")
    model_name: str = Field(..., description="Current model name")
    is_connected: bool = Field(..., description="Whether service is connected to Vertex AI")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Health check timestamp")
    model_info: Dict[str, Any] = Field(default_factory=dict, description="Detailed model information")
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        return value.isoformat()


class ErrorResponse(BaseModel):
    """Model for error responses."""
    
    model_config = ConfigDict()
    
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Error timestamp")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional error details")
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        return value.isoformat()
