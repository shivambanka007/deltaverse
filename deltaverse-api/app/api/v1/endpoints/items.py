"""
Items API endpoints with CRUD operations.
Demonstrates FastAPI best practices with proper error handling and validation.
"""

import datetime as dt
from typing import List

from app.api.v1.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from fastapi import APIRouter, HTTPException, status

# Create router for items endpoints
router = APIRouter(prefix="/items", tags=["items"])

# In-memory storage for demonstration (replace with database in production)
items_db: List[dict] = [{"id": 1,
                         "name": "Wireless Bluetooth Headphones",
                         "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
                         "price": 199.99,
                         "is_active": True,
                         "created_at": "2024-01-15T10:30:00",
                         "updated_at": "2024-01-15T10:30:00",
                         },
                        {"id": 2,
                         "name": "Smart Fitness Tracker",
                         "description": "Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking.",
                         "price": 149.99,
                         "is_active": True,
                         "created_at": "2024-01-16T14:20:00",
                         "updated_at": "2024-01-16T14:20:00",
                         },
                        {"id": 3,
                         "name": "Portable Power Bank",
                         "description": "20000mAh portable charger with fast charging and multiple USB ports.",
                         "price": 49.99,
                         "is_active": True,
                         "created_at": "2024-01-17T09:15:00",
                         "updated_at": "2024-01-17T09:15:00",
                         },
                        {"id": 4,
                         "name": "Wireless Charging Pad",
                         "description": "Qi-compatible wireless charging pad for smartphones and earbuds.",
                         "price": 29.99,
                         "is_active": False,
                         "created_at": "2024-01-18T16:45:00",
                         "updated_at": "2024-01-18T16:45:00",
                         },
                        {"id": 5,
                         "name": "USB-C Hub",
                         "description": "Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader.",
                         "price": 79.99,
                         "is_active": True,
                         "created_at": "2024-01-19T11:30:00",
                         "updated_at": "2024-01-19T11:30:00",
                         }]
next_id = 6


@router.get("/", response_model=List[ItemResponse])
async def get_items(skip: int = 0, limit: int = 100):
    """
    Retrieve all items with pagination.

    Args:
        skip: Number of items to skip (for pagination)
        limit: Maximum number of items to return

    Returns:
        List of items
    """
    return items_db[skip: skip + limit]


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """
    Retrieve a specific item by ID.

    Args:
        item_id: The ID of the item to retrieve

    Returns:
        The requested item

    Raises:
        HTTPException: If item is not found
    """
    item = next((item for item in items_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )
    return item


@router.post("/", response_model=ItemResponse,
             status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate):
    """
    Create a new item.

    Args:
        item: Item data to create

    Returns:
        The created item with generated ID and timestamps
    """
    global next_id

    now = dt.datetime.now(dt.UTC)
    new_item = {
        "id": next_id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "is_active": item.is_active,
        "created_at": now,
        "updated_at": now,
    }

    items_db.append(new_item)
    next_id += 1

    return new_item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item_update: ItemUpdate):
    """
    Update an existing item.

    Args:
        item_id: The ID of the item to update
        item_update: Updated item data

    Returns:
        The updated item

    Raises:
        HTTPException: If item is not found
    """
    item_index = next(
        (i for i, item in enumerate(items_db) if item["id"] == item_id), None
    )

    if item_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )

    # Update only provided fields
    update_data = item_update.model_dump(exclude_unset=True)
    items_db[item_index].update(update_data)
    items_db[item_index]["updated_at"] = dt.datetime.now(dt.UTC)

    return items_db[item_index]


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    """
    Delete an item.

    Args:
        item_id: The ID of the item to delete

    Raises:
        HTTPException: If item is not found
    """
    item_index = next(
        (i for i, item in enumerate(items_db) if item["id"] == item_id), None
    )

    if item_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )

    items_db.pop(item_index)
