from functools import wraps

from flask import g, jsonify, session

from models import User


def login_required(view):
    """Require a logged-in user (session user_id) for JSON API routes."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Authentication required."}), 401
        user = User.query.filter_by(id=user_id).first()
        if not user:
            session.clear()
            return jsonify({"error": "Invalid session."}), 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


def user_to_public_dict(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "mandarin_level": user.mandarin_level,
    }
