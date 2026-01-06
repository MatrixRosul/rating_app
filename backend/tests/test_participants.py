"""
Tests for Participants Router
Testing registration, confirmation, rejection, deletion
"""
import pytest
from datetime import datetime, timedelta


class TestParticipantRegistration:
    """Test participant registration endpoints"""
    
    def test_self_registration(self, client, user_token, admin_token, test_player, db):
        """User can register themselves for a tournament"""
        # Link user to player
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_player.id
        db.commit()
        
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Self-register
        register_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert register_response.status_code == 200
        data = register_response.json()
        assert data["status"] == "pending"
        assert data["player_id"] == test_player.id
        assert data["registered_by_admin"] == False
    
    def test_self_registration_without_player_profile(self, client, user_token, admin_token):
        """User without player profile cannot register"""
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Try to register
        register_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert register_response.status_code == 400
    
    def test_duplicate_registration_prevented(self, client, user_token, admin_token, test_player, db):
        """Cannot register twice for same tournament"""
        # Link user to player
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_player.id
        db.commit()
        
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # First registration
        client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        # Second registration attempt
        second_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert second_response.status_code == 400
    
    def test_admin_add_participant(self, client, admin_token, test_player):
        """Admin can add participant directly with confirmed status"""
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Admin adds participant
        add_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/add",
            json={"player_id": test_player.id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert add_response.status_code == 200
        data = add_response.json()
        assert data["status"] == "confirmed"
        assert data["registered_by_admin"] == True


class TestParticipantConfirmation:
    """Test participant confirmation/rejection"""
    
    def test_confirm_pending_participant(self, client, user_token, admin_token, test_player, db):
        """Admin can confirm pending participant"""
        # Setup: user registers
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_player.id
        db.commit()
        
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        register_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        participant_id = register_response.json()["id"]
        
        # Confirm participant
        confirm_response = client.patch(
            f"/api/tournaments/{tournament_id}/participants/{participant_id}/confirm",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert confirm_response.status_code == 200
        data = confirm_response.json()
        assert data["status"] == "confirmed"
        assert data["confirmed_at"] is not None
    
    def test_reject_pending_participant(self, client, user_token, admin_token, test_player, db):
        """Admin can reject pending participant"""
        # Setup: user registers
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_player.id
        db.commit()
        
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        register_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        participant_id = register_response.json()["id"]
        
        # Reject participant
        reject_response = client.patch(
            f"/api/tournaments/{tournament_id}/participants/{participant_id}/reject",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert reject_response.status_code == 200
        data = reject_response.json()
        assert data["status"] == "rejected"
    
    def test_user_cannot_confirm_participant(self, client, user_token, admin_token, test_players, db):
        """Regular user cannot confirm participants"""
        # Setup
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_players[0].id
        db.commit()
        
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        register_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        participant_id = register_response.json()["id"]
        
        # Try to confirm as user
        confirm_response = client.patch(
            f"/api/tournaments/{tournament_id}/participants/{participant_id}/confirm",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert confirm_response.status_code == 403


class TestParticipantRetrieval:
    """Test participant list retrieval with filtering"""
    
    def test_get_all_participants(self, client, admin_token, test_players):
        """Can retrieve all participants"""
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Add participants
        for player in test_players[:3]:
            client.post(
                f"/api/tournaments/{tournament_id}/participants/add",
                json={"player_id": player.id},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        # Get all participants
        response = client.get(
            f"/api/tournaments/{tournament_id}/participants",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
    
    def test_filter_confirmed_participants(self, client, user_token, admin_token, test_players, db):
        """Can filter participants by confirmed status"""
        # Setup
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_players[0].id
        db.commit()
        
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Add confirmed participant (admin adds)
        client.post(
            f"/api/tournaments/{tournament_id}/participants/add",
            json={"player_id": test_players[1].id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Add pending participant (user registers)
        client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        # Filter confirmed
        response = client.get(
            f"/api/tournaments/{tournament_id}/participants?status_filter=confirmed",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "confirmed"
    
    def test_filter_pending_participants(self, client, user_token, admin_token, test_players, db):
        """Can filter participants by pending status"""
        # Setup
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.player_id = test_players[0].id
        db.commit()
        
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Add participants
        client.post(
            f"/api/tournaments/{tournament_id}/participants/add",
            json={"player_id": test_players[1].id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        client.post(
            f"/api/tournaments/{tournament_id}/participants/register",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        # Filter pending
        response = client.get(
            f"/api/tournaments/{tournament_id}/participants?status_filter=pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "pending"
    
    def test_participants_sorted_by_rating(self, client, admin_token, test_players):
        """Participants are sorted by rating (descending)"""
        # Create tournament
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        # Add participants in random order
        for player in [test_players[2], test_players[0], test_players[1]]:
            client.post(
                f"/api/tournaments/{tournament_id}/participants/add",
                json={"player_id": player.id},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        # Get participants
        response = client.get(
            f"/api/tournaments/{tournament_id}/participants",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        data = response.json()
        ratings = [p["rating"] for p in data]
        assert ratings == sorted(ratings, reverse=True)


class TestParticipantDeletion:
    """Test participant removal"""
    
    def test_admin_can_remove_participant(self, client, admin_token, test_player):
        """Admin can remove participant from tournament"""
        # Create tournament and add participant
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        add_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/add",
            json={"player_id": test_player.id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        participant_id = add_response.json()["id"]
        
        # Remove participant
        delete_response = client.delete(
            f"/api/tournaments/{tournament_id}/participants/{participant_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert delete_response.status_code == 200
        
        # Verify removal
        list_response = client.get(
            f"/api/tournaments/{tournament_id}/participants",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert len(list_response.json()) == 0
    
    def test_user_cannot_remove_participant(self, client, user_token, admin_token, test_player):
        """Regular user cannot remove participants"""
        # Create tournament and add participant
        tournament_response = client.post(
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
        tournament_id = tournament_response.json()["id"]
        
        add_response = client.post(
            f"/api/tournaments/{tournament_id}/participants/add",
            json={"player_id": test_player.id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        participant_id = add_response.json()["id"]
        
        # Try to remove as user
        delete_response = client.delete(
            f"/api/tournaments/{tournament_id}/participants/{participant_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert delete_response.status_code == 403
