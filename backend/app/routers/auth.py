"""
Authentication router - login, logout, current user info
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, UserRole
from app.auth import verify_password, create_access_token
from app.dependencies import get_current_user, require_user, require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
    player_id: Optional[str] = None


class CurrentUserResponse(BaseModel):
    username: str
    role: str
    player_id: Optional[str] = None


@router.post("/login/", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint - authenticate user and return JWT token
    """
    # Find user by username
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role.value,
        "player_id": user.player_id
    }


@router.get("/me/", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(require_user)):
    """
    Get current authenticated user info
    """
    return {
        "username": current_user.username,
        "role": current_user.role.value,
        "player_id": current_user.player_id
    }


@router.post("/logout/")
def logout():
    """
    Logout endpoint (client should remove token from storage)
    """
    return {"message": "Logged out successfully"}


class UserInfo(BaseModel):
    id: int
    username: str
    role: str
    player_id: Optional[str] = None


@router.get("/users/", response_model=list[UserInfo])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all users (admin only) - для вибору користувачів при реєстрації на турнір
    """
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "role": user.role.value,
            "player_id": user.player_id
        }
        for user in users
    ]
