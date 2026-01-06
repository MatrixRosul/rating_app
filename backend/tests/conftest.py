"""
Pytest configuration and fixtures for testing
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models.player import Player
from app.auth import get_password_hash
from datetime import datetime

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    """Create a test regular user"""
    user = User(
        username="testuser",
        email="test@test.com",
        hashed_password=get_password_hash("testpass123"),
        role=UserRole.USER,
        player_id=None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(db):
    """Create a test admin user"""
    admin = User(
        username="admin",
        email="admin@test.com",
        hashed_password=get_password_hash("adminpass123"),
        role=UserRole.ADMIN,
        player_id=None
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def test_player(db):
    """Create a test player"""
    player = Player(
        name="Test Player",
        rating=1500.0,
        matches_played=10,
        wins=5,
        losses=5,
        created_at=datetime.utcnow()
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@pytest.fixture(scope="function")
def test_players(db):
    """Create multiple test players with different ratings"""
    players = [
        Player(name="Player 1", rating=1800.0, matches_played=20, wins=15, losses=5),
        Player(name="Player 2", rating=1600.0, matches_played=15, wins=8, losses=7),
        Player(name="Player 3", rating=1400.0, matches_played=10, wins=5, losses=5),
        Player(name="Player 4", rating=1200.0, matches_played=8, wins=3, losses=5),
    ]
    for player in players:
        db.add(player)
    db.commit()
    for player in players:
        db.refresh(player)
    return players


@pytest.fixture(scope="function")
def user_token(client, test_user):
    """Get authentication token for regular user"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def admin_token(client, test_admin):
    """Get authentication token for admin user"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_admin.username,
            "password": "adminpass123"
        }
    )
    return response.json()["access_token"]
