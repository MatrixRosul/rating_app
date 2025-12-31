"""
Pydantic schemas for Match API
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, date


class MatchBase(BaseModel):
    """Base Match schema with common fields"""
    player1_id: str = Field(..., description="First player ID")
    player2_id: str = Field(..., description="Second player ID")
    player1_score: int = Field(..., ge=0, description="First player score")
    player2_score: int = Field(..., ge=0, description="Second player score")
    max_score: int = Field(..., ge=1, description="Maximum score (e.g., 10 for race to 10)")
    date: Optional[date] = Field(None, description="Match date (defaults to today)")

    @field_validator('player1_id', 'player2_id')
    @classmethod
    def validate_player_ids(cls, v):
        if not v or not v.strip():
            raise ValueError("Player ID cannot be empty")
        return v.strip()

    @field_validator('max_score')
    @classmethod
    def validate_max_score(cls, v, info):
        """Ensure at least one player reached max score"""
        data = info.data
        if 'player1_score' in data and 'player2_score' in data:
            if data['player1_score'] != v and data['player2_score'] != v:
                raise ValueError(f"One player must have reached max_score ({v})")
        return v


class MatchCreate(MatchBase):
    """Schema for creating a new match"""
    pass


class MatchResponse(BaseModel):
    """Schema for match response"""
    id: str
    player1_id: str
    player2_id: str
    winner_id: str
    player1_score: int
    player2_score: int
    max_score: int
    player1_rating_before: float
    player2_rating_before: float
    player1_rating_change: float
    player2_rating_change: float
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class MatchListItem(BaseModel):
    """Simplified schema for match list"""
    id: int
    player1_name: str
    player2_name: str
    player1_score: int
    player2_score: int
    max_score: int
    winner_id: str
    date: date
    player1_rating_change: float
    player2_rating_change: float

    class Config:
        from_attributes = True


class MatchHistory(BaseModel):
    """Player's match history item"""
    id: int
    opponent_name: str
    player_score: int
    opponent_score: int
    max_score: int
    is_winner: bool
    rating_before: float
    rating_change: float
    date: date

    class Config:
        from_attributes = True
