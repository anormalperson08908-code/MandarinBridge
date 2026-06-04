# tests/test_integration.py
import pytest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User, Lesson


class TestAuthFlow:
    """Test complete authentication flow"""
    
    def test_register_login_logout_flow(self, client):
        # 1. Register
        register_data = {
            "full_name": "Integration User",
            "email": "integration@test.com",
            "password": "testpass123",
            "mandarin_level": "Beginner"
        }
        response = client.post('/api/auth/register', 
                               json=register_data)
        assert response.status_code == 201
        
        # 2. Login
        login_data = {
            "email": "integration@test.com",
            "password": "testpass123"
        }
        response = client.post('/api/auth/login', json=login_data)
        assert response.status_code == 200
        assert 'user' in response.json
        
        # 3. Get profile
        response = client.get('/api/users/me')
        assert response.status_code == 200
        assert response.json['user']['email'] == "integration@test.com"
        
        # 4. Update profile
        update_data = {"full_name": "Updated Name"}
        response = client.patch('/api/users/me', json=update_data)
        assert response.status_code == 200
        assert response.json['user']['full_name'] == "Updated Name"
        
        # 5. Logout
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        
        # 6. Verify can't access protected endpoint
        response = client.get('/api/users/me')
        assert response.status_code == 401
    
    def test_invalid_login_returns_error(self, client):
        response = client.post('/api/auth/login', json={
            "email": "wrong@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        assert "errors" in response.json


class TestLessonCRUDFlow:
    """Test complete lesson CRUD operations"""
    
    def test_lesson_crud_flow(self, auth_client):
        # 1. Create lesson
        create_data = {
            "title": "Integration Test Lesson",
            "category": "Vocabulary",
            "description": "Created during integration test"
        }
        response = auth_client.post('/api/lessons', json=create_data)
        assert response.status_code == 201
        lesson_id = response.json['id']
        
        # 2. Get all lessons (should include new lesson)
        response = auth_client.get('/api/lessons')
        assert response.status_code == 200
        assert len(response.json) > 0
        
        # 3. Get single lesson
        response = auth_client.get(f'/api/lessons/{lesson_id}')
        assert response.status_code == 200
        assert response.json['title'] == "Integration Test Lesson"
        
        # 4. Update lesson (PATCH)
        update_data = {"title": "Updated Lesson Title"}
        response = auth_client.patch(f'/api/lessons/{lesson_id}', json=update_data)
        assert response.status_code == 200
        assert response.json['title'] == "Updated Lesson Title"
        
        # 5. Delete lesson
        response = auth_client.delete(f'/api/lessons/{lesson_id}')
        assert response.status_code == 204
        
        # 6. Verify deleted
        response = auth_client.get(f'/api/lessons/{lesson_id}')
        assert response.status_code == 404
    
    def test_create_lesson_without_login(self, client):
        response = client.post('/api/lessons', json={
            "title": "Should Fail",
            "category": "Vocabulary",
            "description": "No auth"
        })
        assert response.status_code == 401


class TestEndToEndScenarios:
    """Test complete user scenarios"""
    
    def test_new_user_complete_journey(self, client):
        # User visits home page
        response = client.get('/')
        assert response.status_code == 200
        
        # User registers
        register_data = {
            "full_name": "Journey User",
            "email": "journey@test.com",
            "password": "journey123",
            "mandarin_level": "Beginner"
        }
        response = client.post('/api/auth/register', json=register_data)
        assert response.status_code == 201
        
        # User logs in
        response = client.post('/api/auth/login', json={
            "email": "journey@test.com",
            "password": "journey123"
        })
        assert response.status_code == 200
        
        # User views dashboard
        response = client.get('/dashboard')
        assert response.status_code == 200 or response.status_code == 302
        
        # User creates a lesson
        response = client.post('/api/lessons', json={
            "title": "My First Lesson",
            "category": "Pronunciation",
            "description": "Learning tones"
        })
        assert response.status_code == 201
        
        # User updates profile
        response = client.patch('/api/users/me', json={
            "mandarin_level": "Elementary"
        })
        assert response.status_code == 200
        
        # User logs out
        response = client.post('/api/auth/logout')
        assert response.status_code == 200


class TestErrorHandling:
    """Test error responses"""
    
    def test_duplicate_email_error(self, client, test_user):
        response = client.post('/api/auth/register', json={
            "full_name": "Duplicate",
            "email": "existing@test.com",
            "password": "password123",
            "mandarin_level": "Beginner"
        })
        assert response.status_code == 409
        assert "email" in response.json['errors']
    
    def test_lesson_not_found_error(self, auth_client):
        response = auth_client.get('/api/lessons/99999')
        assert response.status_code == 404
    
    def test_invalid_json_error(self, client):
        response = client.post('/api/auth/login', 
                               data="invalid json",
                               content_type='application/json')
        assert response.status_code == 400


# Fixtures
@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_client(client):
    """Client that is already logged in"""
    client.post('/api/auth/register', json={
        "full_name": "Auth User",
        "email": "auth@test.com",
        "password": "authpass123",
        "mandarin_level": "Beginner"
    })
    return client


@pytest.fixture
def test_user(client):
    """Create a test user in database"""
    client.post('/api/auth/register', json={
        "full_name": "Existing User",
        "email": "existing@test.com",
        "password": "existing123",
        "mandarin_level": "Beginner"
    })
    yield