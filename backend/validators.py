import re
from typing import Any

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

ALLOWED_LEVELS = frozenset({"Beginner", "Elementary", "Intermediate", "Advanced"})

ALLOWED_LESSON_CATEGORIES = frozenset({"Vocabulary", "Grammar", "Pronunciation"})


def _require_non_empty_str(data: dict, key: str, max_len: int, errors: dict) -> str | None:
    value = data.get(key)
    if value is None or not isinstance(value, str):
        errors[key] = "This field is required."
        return None
    value = value.strip()
    if not value:
        errors[key] = "This field is required."
        return None
    if len(value) > max_len:
        errors[key] = f"Must be at most {max_len} characters."
        return None
    return value


def validate_register(data: dict[str, Any]) -> dict[str, str]:
    """Backend validation for registration JSON body."""
    errors: dict[str, str] = {}
    _require_non_empty_str(data, "full_name", 120, errors)
    email = _require_non_empty_str(data, "email", 120, errors)
    if email and not _EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    password = data.get("password")
    if not password or not isinstance(password, str):
        errors["password"] = "Password is required."
    else:
        if len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."
        elif len(password) > 128:
            errors["password"] = "Password is too long."
        elif not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            errors["password"] = "Password must include at least one letter and one number."

    level = data.get("mandarin_level", "Beginner")
    if not isinstance(level, str) or level not in ALLOWED_LEVELS:
        errors["mandarin_level"] = "Choose a valid Mandarin level."

    return errors


def validate_login(data: dict[str, Any]) -> dict[str, str]:
    errors: dict[str, str] = {}
    email = _require_non_empty_str(data, "email", 120, errors)
    if email and not _EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    password = data.get("password")
    if not password or not isinstance(password, str) or not password.strip():
        errors["password"] = "Password is required."
    return errors


def validate_profile_update(data: dict[str, Any]) -> dict[str, str]:
    """Validate partial profile updates (only provided fields are checked)."""
    errors: dict[str, str] = {}
    if "full_name" in data:
        _require_non_empty_str(data, "full_name", 120, errors)
    if "email" in data:
        email = _require_non_empty_str(data, "email", 120, errors)
        if email and not _EMAIL_RE.match(email):
            errors["email"] = "Enter a valid email address."
    if "mandarin_level" in data:
        level = data.get("mandarin_level")
        if not isinstance(level, str) or level not in ALLOWED_LEVELS:
            errors["mandarin_level"] = "Choose a valid Mandarin level."
    if not any(k in data for k in ("full_name", "email", "mandarin_level")):
        errors["_form"] = "Submit at least one field to update."
    return errors


def validate_lesson_payload(data: dict[str, Any], partial: bool = False) -> dict[str, str]:
    """Validate lesson create (full) or update (partial) JSON body."""
    errors: dict[str, str] = {}

    if partial:
        if not data or not any(k in data for k in ("title", "category", "description")):
            errors["_body"] = "Provide at least one of title, category, or description."
            return errors
        if "title" in data:
            _require_non_empty_str(data, "title", 120, errors)
        if "category" in data:
            cat = data.get("category")
            if not isinstance(cat, str) or cat not in ALLOWED_LESSON_CATEGORIES:
                errors["category"] = "Category must be Vocabulary, Grammar, or Pronunciation."
        if "description" in data:
            desc = data.get("description")
            if not isinstance(desc, str) or not desc.strip():
                errors["description"] = "Description is required."
            elif len(desc) > 5000:
                errors["description"] = "Description is too long."
        return errors

    for key in ("title", "category", "description"):
        if key not in data:
            errors[key] = "This field is required."
    if errors:
        return errors

    _require_non_empty_str(data, "title", 120, errors)
    cat = data.get("category")
    if not isinstance(cat, str) or cat not in ALLOWED_LESSON_CATEGORIES:
        errors["category"] = "Category must be Vocabulary, Grammar, or Pronunciation."
    desc = data.get("description")
    if not isinstance(desc, str) or not desc.strip():
        errors["description"] = "Description is required."
    elif len(desc) > 5000:
        errors["description"] = "Description is too long."

    return errors
