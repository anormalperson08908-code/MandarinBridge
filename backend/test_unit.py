import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, User, Lesson
from validators import validate_register, validate_login, validate_lesson_payload
from passwords import hash_password, verify_password

class TestPasswordFunctions:
    """Test password hashing and verification"""
    
    def test_hash_password_returns_string(self):
        password = "mypassword123"
        hashed = hash_password(password)
        assert isinstance(hashed, str)
        assert len(hashed) > 20
    
    def test_hash_password_different_for_same_password(self):
        password = "samepassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        # Different salt = different hash
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        password = "correctpassword"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        password = "correctpassword"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty(self):
        hashed = hash_password("test123")
        assert verify_password("", hashed) is False


class TestRegisterValidation:
    """Test registration form validation"""
    
    def test_valid_registration_data(self):
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert errors == {}
    
    def test_missing_full_name(self):
        data = {
            "email": "john@example.com",
            "password": "password123",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert "full_name" in errors
    
    def test_invalid_email_format(self):
        data = {
            "full_name": "John Doe",
            "email": "not-an-email",
            "password": "password123",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert "email" in errors
    
    def test_short_password(self):
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "short",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert "password" in errors
        assert "8 characters" in errors["password"]
    
    def test_password_no_letter(self):
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "12345678",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert "password" in errors
        assert "letter" in errors["password"]
    
    def test_password_no_number(self):
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "abcdefgh",
            "mandarin_level": "Beginner"
        }
        errors = validate_register(data)
        assert "password" in errors
        assert "number" in errors["password"]
    
    def test_invalid_mandarin_level(self):
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "mandarin_level": "Expert"
        }
        errors = validate_register(data)
        assert "mandarin_level" in errors


class TestLoginValidation:
    """Test login form validation"""
    
    def test_valid_login_data(self):
        data = {
            "email": "john@example.com",
            "password": "password123"
        }
        errors = validate_login(data)
        assert errors == {}
    
    def test_missing_email(self):
        data = {"password": "password123"}
        errors = validate_login(data)
        assert "email" in errors
    
    def test_missing_password(self):
        data = {"email": "john@example.com"}
        errors = validate_login(data)
        assert "password" in errors
    
    def test_invalid_email_format(self):
        data = {
            "email": "invalid-email",
            "password": "password123"
        }
        errors = validate_login(data)
        assert "email" in errors


class TestLessonValidation:
    """Test lesson data validation"""
    
    def test_valid_lesson_data(self):
        data = {
            "title": "Basic Greetings",
            "category": "Vocabulary",
            "description": "Learn greetings in Mandarin"
        }
        errors = validate_lesson_payload(data, partial=False)
        assert errors == {}
    
    def test_missing_title(self):
        data = {
            "category": "Vocabulary",
            "description": "Some description"
        }
        errors = validate_lesson_payload(data, partial=False)
        assert "title" in errors
    
    def test_invalid_category(self):
        data = {
            "title": "Test Lesson",
            "category": "Invalid",
            "description": "Description"
        }
        errors = validate_lesson_payload(data, partial=False)
        assert "category" in errors
    
    def test_empty_description(self):
        data = {
            "title": "Test Lesson",
            "category": "Vocabulary",
            "description": ""
        }
        errors = validate_lesson_payload(data, partial=False)
        assert "description" in errors
    
    def test_partial_update_valid(self):
        data = {"title": "Updated Title"}
        errors = validate_lesson_payload(data, partial=True)
        assert errors == {}
    
    def test_partial_update_invalid_category(self):
        data = {"category": "Invalid"}
        errors = validate_lesson_payload(data, partial=True)
        assert "category" in errors


class TestUserModel:
    """Test User model"""
    
    def test_user_creation(self, app_context):
        user = User(
            full_name="Test User",
            email="test@example.com",
            mandarin_level="Intermediate",
            password_hash="hashed_password"
        )
        db.session.add(user)
        db.session.commit()
        
        saved_user = User.query.filter_by(email="test@example.com").first()
        assert saved_user is not None
        assert saved_user.full_name == "Test User"
        assert saved_user.mandarin_level == "Intermediate"


class TestLessonModel:
    """Test Lesson model"""
    
    def test_lesson_creation(self, app_context):
        lesson = Lesson(
            title="Test Lesson",
            category="Grammar",
            description="This is a test lesson description"
        )
        db.session.add(lesson)
        db.session.commit()
        
        saved_lesson = Lesson.query.filter_by(title="Test Lesson").first()
        assert saved_lesson is not None
        assert saved_lesson.category == "Grammar"
        assert len(saved_lesson.description) > 0


# Fixtures
@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    return app


@pytest.fixture
def app_context(app):
    """Create app context for database tests"""
    with app.app_context():
        db.create_all()
        yield
        db.drop_all()


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])