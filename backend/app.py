from pathlib import Path
from urllib.parse import quote

from flask import Flask, jsonify, redirect, request, send_from_directory, session

from auth_api import bp_auth, bp_users
from config import Config
from lesson_api import bp_lessons
from models import Lesson, db


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
PAGES_DIR = FRONTEND_DIR / "pages"

PAGE_ROUTES = {
    "/": ("index.html", FRONTEND_DIR),
    "/login": ("login.html", PAGES_DIR),
    "/register": ("register.html", PAGES_DIR),
    "/dashboard": ("dashboard.html", PAGES_DIR),
    "/profile": ("profile.html", PAGES_DIR),
    "/modules": ("learning-modules.html", PAGES_DIR),
    "/vocabulary": ("vocabulary.html", PAGES_DIR),
    "/grammar": ("grammar.html", PAGES_DIR),
    "/pronunciation": ("pronunciation.html", PAGES_DIR),
    "/progress": ("progress.html", PAGES_DIR),
    "/reports": ("reports.html", PAGES_DIR),
    "/quiz": ("quiz.html", PAGES_DIR),
    "/chatbot": ("chatbot.html", PAGES_DIR),
    "/extra-learning": ("extra-learning.html", PAGES_DIR),
    "/culture": ("cultural-learning.html", PAGES_DIR),
    "/about": ("about.html", PAGES_DIR),
    "/team": ("team.html", PAGES_DIR),
    "/careers": ("careers.html", PAGES_DIR),
    "/news": ("news.html", PAGES_DIR),
    "/faqs": ("faqs.html", PAGES_DIR),
    "/support": ("support.html", PAGES_DIR),
    "/contact": ("contact.html", PAGES_DIR),
}

PROTECTED_HTML_ROUTES = frozenset(
    {
        "/dashboard",
        "/profile",
        "/modules",
        "/vocabulary",
        "/grammar",
        "/pronunciation",
        "/progress",
        "/reports",
        "/quiz",
        "/chatbot",
        "/extra-learning",
        "/culture",
    }
)


def create_app():
    app = Flask(
        __name__,
        static_folder=str(FRONTEND_DIR),
        static_url_path="",
    )
    app.config.from_object(Config)
    db.init_app(app)

    @app.before_request
    def require_login_for_student_area():
        """
        Week 6: treat the learning area as authenticated.
        Public marketing/support/auth pages stay available without a session.
        """
        if request.path not in PROTECTED_HTML_ROUTES:
            return None
        if session.get("user_id"):
            return None
        return redirect(f"/login?next={quote(request.path, safe='/')}")

    register_page_routes(app)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_users)
    app.register_blueprint(bp_lessons)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok", "project": "MandarinBridge"})

    with app.app_context():
        db.create_all()
        seed_lessons()

    return app


def register_page_routes(app):
    for route, (filename, directory) in PAGE_ROUTES.items():
        app.add_url_rule(
            route,
            endpoint=f"page_{filename.replace('.', '_')}",
            view_func=lambda filename=filename, directory=directory: send_from_directory(
                directory, filename
            ),
        )


def seed_lessons():
    if Lesson.query.count() > 0:
        return

    lessons = [
        Lesson(
            title="Everyday Greetings",
            category="Vocabulary",
            description="Basic greetings for beginner Mandarin conversations.",
        ),
        Lesson(
            title="Simple Sentence Order",
            category="Grammar",
            description="Introduction to subject, verb, and object sentence patterns.",
        ),
        Lesson(
            title="Four Tones Practice",
            category="Pronunciation",
            description="Practice recognizing and speaking Mandarin tones.",
        ),
    ]
    db.session.add_all(lessons)
    db.session.commit()


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
