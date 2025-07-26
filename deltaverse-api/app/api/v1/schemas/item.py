"""
Pydantic schemas for item-related API operations.
These schemas handle request/response validation and serialization.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class ItemBase(BaseModel):
    """Base schema for item with common fields."""

    name: str = Field(..., min_length=1, max_length=100,
                      description="Item name")
    description: Optional[str] = Field(
        None, max_length=500, description="Item description"
    )
    price: float = Field(...,
                         gt=0,
                         description="Item price (must be positive)")
    is_active: bool = Field(
        default=True,
        description="Whether the item is active")


class ItemCreate(ItemBase):
    """Schema for creating a new item."""

    pass


class ItemUpdate(BaseModel):
    """Schema for updating an existing item."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class ItemResponse(ItemBase):
    """Schema for item response with additional metadata."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Item ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
