"""
FastAPI main application
Billiard Rating System Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import Player, Match, User, Tournament, TournamentRegistration, Table
from app.routers import players, matches, auth, tournaments, participants, tables
import os

# Create FastAPI app
app = FastAPI(
    title="Billiard Rating System API",
    description="Backend API for billiard player ratings and match management",
    version="1.0.0"
)

# CORS middleware for frontend
# Allow Vercel, Heroku, and localhost
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://rating-app-mu-murex.vercel.app",  # Production Vercel
    os.getenv("FRONTEND_URL", ""),  # Можна додати через env var
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],  # Filter empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Billiard Rating System API",
        "version": "1.0.0",
        "status": "running"
    }

# Health check
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router)
app.include_router(tournaments.router)
app.include_router(participants.router)
app.include_router(players.router, prefix="/api/players", tags=["players"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(tables.router, prefix="/api", tags=["tables"])
