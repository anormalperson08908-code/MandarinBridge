from flask import Blueprint, jsonify, request

from auth_utils import login_required
from models import Lesson, db
from validators import validate_lesson_payload

bp_lessons = Blueprint("lessons_api", __name__, url_prefix="/api/lessons")


def lesson_to_dict(lesson: Lesson) -> dict:
    return {
        "id": lesson.id,
        "title": lesson.title,
        "category": lesson.category,
        "description": lesson.description,
    }


@bp_lessons.route("", methods=["GET"])
def list_lessons():
    lessons = Lesson.query.order_by(Lesson.category, Lesson.title).all()
    return jsonify([lesson_to_dict(lesson) for lesson in lessons])


@bp_lessons.get("/<int:lesson_id>")
def get_lesson(lesson_id: int):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found."}), 404
    return jsonify(lesson_to_dict(lesson))


@bp_lessons.route("", methods=["POST"])
@login_required
def create_lesson():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return (
            jsonify({"errors": {"_body": "Send JSON with Content-Type: application/json."}}),
            400,
        )
    errors = validate_lesson_payload(data, partial=False)
    if errors:
        return jsonify({"errors": errors}), 400

    lesson = Lesson(
        title=data["title"].strip(),
        category=data["category"],
        description=data["description"].strip(),
    )
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson_to_dict(lesson)), 201


@bp_lessons.put("/<int:lesson_id>")
@login_required
def replace_lesson(lesson_id: int):
    """Full update (PUT): all three fields required."""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found."}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return (
            jsonify({"errors": {"_body": "Send JSON with Content-Type: application/json."}}),
            400,
        )
    errors = validate_lesson_payload(data, partial=False)
    if errors:
        return jsonify({"errors": errors}), 400

    lesson.title = data["title"].strip()
    lesson.category = data["category"]
    lesson.description = data["description"].strip()
    db.session.commit()
    return jsonify(lesson_to_dict(lesson))


@bp_lessons.patch("/<int:lesson_id>")
@login_required
def patch_lesson(lesson_id: int):
    """Partial update (PATCH): send only fields you want to change."""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found."}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return (
            jsonify({"errors": {"_body": "Send JSON with Content-Type: application/json."}}),
            400,
        )
    errors = validate_lesson_payload(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    if "title" in data:
        lesson.title = data["title"].strip()
    if "category" in data:
        lesson.category = data["category"]
    if "description" in data:
        lesson.description = data["description"].strip()

    db.session.commit()
    return jsonify(lesson_to_dict(lesson))


@bp_lessons.delete("/<int:lesson_id>")
@login_required
def delete_lesson(lesson_id: int):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found."}), 404
    db.session.delete(lesson)
    db.session.commit()
    return ("", 204)
