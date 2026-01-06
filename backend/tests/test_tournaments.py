"""
Tests for Tournaments Router
Testing CRUD operations, authorization, validation
"""
import pytest
from datetime import datetime, timedelta
from app.models.tournament import TournamentStatus, TournamentDiscipline


class TestTournamentCreation:
    """Test tournament creation endpoint"""
    
    def test_create_tournament_as_admin(self, client, admin_token):
        """Admin can create a tournament"""
        tournament_data = {
            "name": "Test Tournament",
            "description": "Test description",
            "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "start_date": (datetime.utcnow() + timedelta(days=10)).date().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=12)).date().isoformat(),
            "city": "Kyiv",
            "country": "Україна",
            "club": "Test Club",
            "discipline": "FREE_PYRAMID",
            "is_rated": True
        }
        
        response = client.post(
            "/api/tournaments/",
            json=tournament_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == tournament_data["name"]
        assert data["status"] == "registration"
        assert data["is_rated"] == True
        assert "id" in data
    
    def test_create_tournament_as_user_forbidden(self, client, user_token):
        """Regular user cannot create a tournament"""
        tournament_data = {
            "name": "Test Tournament",
            "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "city": "Kyiv",
            "country": "Україна",
            "club": "Test Club",
            "discipline": "FREE_PYRAMID"
        }
        
        response = client.post(
            "/api/tournaments/",
            json=tournament_data,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 403
    
    def test_create_tournament_without_auth(self, client):
        """Cannot create tournament without authentication"""
        tournament_data = {
            "name": "Test Tournament",
            "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "city": "Kyiv",
            "country": "Україна",
            "club": "Test Club",
            "discipline": "FREE_PYRAMID"
        }
        
        response = client.post("/api/tournaments/", json=tournament_data)
        assert response.status_code == 401
    
    def test_create_tournament_missing_required_fields(self, client, admin_token):
        """Creating tournament without required fields should fail"""
        tournament_data = {
            "name": "Test Tournament"
            # Missing required fields
        }
        
        response = client.post(
            "/api/tournaments/",
            json=tournament_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_create_non_rated_tournament(self, client, admin_token):
        """Can create non-rated tournament"""
        tournament_data = {
            "name": "Fun Tournament",
            "description": "Non-rated fun event",
            "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "city": "Lviv",
            "country": "Україна",
            "club": "Fun Club",
            "discipline": "COMBINED_PYRAMID",
            "is_rated": False
        }
        
        response = client.post(
            "/api/tournaments/",
            json=tournament_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["is_rated"] == False


class TestTournamentRetrieval:
    """Test tournament retrieval endpoints"""
    
    def test_get_all_tournaments(self, client, admin_token, db):
        """Can retrieve all tournaments"""
        # Create test tournaments
        for i in range(3):
            client.post(
                "/api/tournaments/",
                json={
                    "name": f"Tournament {i}",
                    "registration_end": (datetime.utcnow() + timedelta(days=7+i)).isoformat(),
                    "city": "Kyiv",
                    "country": "Україна",
                    "club": "Test Club",
                    "discipline": "FREE_PYRAMID"
                },
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        response = client.get("/api/tournaments/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
    
    def test_get_tournaments_by_status(self, client, admin_token, db):
        """Can filter tournaments by status"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Registration Tournament",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Filter by status
        response = client.get("/api/tournaments/?status_filter=registration")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "registration"
    
    def test_get_tournament_by_id(self, client, admin_token):
        """Can retrieve specific tournament by ID"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Specific Tournament",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Get by ID
        response = client.get(f"/api/tournaments/{tournament_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == tournament_id
        assert data["name"] == "Specific Tournament"
    
    def test_get_nonexistent_tournament(self, client):
        """Getting non-existent tournament returns 404"""
        response = client.get("/api/tournaments/99999")
        assert response.status_code == 404


class TestTournamentUpdate:
    """Test tournament update endpoint"""
    
    def test_update_tournament_as_admin(self, client, admin_token):
        """Admin can update tournament"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Original Name",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Update tournament
        update_response = client.put(
            f"/api/tournaments/{tournament_id}",
            json={"name": "Updated Name", "city": "Lviv"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["name"] == "Updated Name"
        assert data["city"] == "Lviv"
    
    def test_update_tournament_status(self, client, admin_token):
        """Can update tournament status"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Test Tournament",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Update status to in_progress
        update_response = client.put(
            f"/api/tournaments/{tournament_id}",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "in_progress"
    
    def test_update_tournament_as_user_forbidden(self, client, admin_token, user_token):
        """Regular user cannot update tournament"""
        # Create tournament as admin
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Test Tournament",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Try to update as user
        update_response = client.put(
            f"/api/tournaments/{tournament_id}",
            json={"name": "Hacked Name"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert update_response.status_code == 403


class TestTournamentDeletion:
    """Test tournament deletion endpoint"""
    
    def test_delete_tournament_as_admin(self, client, admin_token):
        """Admin can delete tournament"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "To Delete",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Delete tournament
        delete_response = client.delete(
            f"/api/tournaments/{tournament_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = client.get(f"/api/tournaments/{tournament_id}")
        assert get_response.status_code == 404
    
    def test_delete_tournament_as_user_forbidden(self, client, admin_token, user_token):
        """Regular user cannot delete tournament"""
        # Create tournament
        create_response = client.post(
            "/api/tournaments/",
            json={
                "name": "Test Tournament",
                "registration_end": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "city": "Kyiv",
                "country": "Україна",
                "club": "Test Club",
                "discipline": "FREE_PYRAMID"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        tournament_id = create_response.json()["id"]
        
        # Try to delete as user
        delete_response = client.delete(
            f"/api/tournaments/{tournament_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert delete_response.status_code == 403
