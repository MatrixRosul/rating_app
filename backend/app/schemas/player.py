"""
Pydantic schemas for Player API
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PlayerBase(BaseModel):
    """Base Player schema with common fields"""
    name: str = Field(..., min_length=1, max_length=200, description="Player full name or nickname")
    first_name: Optional[str] = Field(None, max_length=100, description="Player first name")
    last_name: Optional[str] = Field(None, max_length=100, description="Player last name")
    city: Optional[str] = Field(None, max_length=100, description="Player city")
    year_of_birth: Optional[int] = Field(None, ge=1900, le=2024, description="Year of birth")


class PlayerCreate(PlayerBase):
    """Schema for creating a new player"""
    id: str = Field(..., min_length=1, max_length=50, description="Unique player ID")
    initial_rating: Optional[float] = Field(1300.0, ge=0, le=5000, description="Initial rating (default: 1300)")


class PlayerUpdate(BaseModel):
    """Schema for updating player information"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    year_of_birth: Optional[int] = Field(None, ge=1900, le=2024)
    is_cms: Optional[bool] = Field(None, description="Candidate Master status")


class PlayerResponse(BaseModel):
    """Schema for player response"""
    id: str
    name: str
    rating: float
    initial_rating: float
    peak_rating: float
    is_cms: bool
    created_at: datetime
    updated_at: datetime
    matches_count: int = Field(default=0, description="Total number of matches played")

    class Config:
        from_attributes = True


class PlayerListItem(BaseModel):
    """Simplified schema for player list"""
    id: str
    name: str
    rating: float
    city: Optional[str]
    is_cms: bool

    class Config:
        from_attributes = True


class PlayerStats(BaseModel):
    """Player statistics schema"""
    id: str
    name: str
    rating: float
    peak_rating: float
    total_matches: int
    wins: int
    losses: int
    win_rate: float
    rating_change: float  # from initial to current

    class Config:
        from_attributes = True
