# Week 4 (Apr 16 – Apr 23): System Architecture Design  
## Project: Mandarin Bridge

---

## 1. Architecture Style

### 1.1 Selected Architecture
Mandarin Bridge will use an **MVC (Model-View-Controller) architecture** combined with a **RESTful API architecture**. The system will be divided into three main layers: the frontend user interface (View), the backend server logic (Controller), and the database storage (Model). The frontend communicates with the backend using HTTP requests through REST API endpoints.

### 1.2 Justification
This architecture was selected because it provides:
- Clear separation between user interface, business logic, and database management
- Easier maintainability and future upgrades
- Scalability for adding new learning modules (Vocabulary, Grammar, Pronunciation)
- Support for future mobile app development using the same backend APIs
- Simple integration of third-party services such as chatbot AI APIs

---

## 2. System Architecture Design

### 2.1 System Overview
Mandarin Bridge is an educational software platform designed to help users learn Mandarin through structured learning modules, quizzes, progress tracking, and an AI chatbot. The system provides personalized learning based on the user's selected level and records user progress over time.

The architecture includes the following major layers:
- **Frontend Layer**: user interface and interaction
- **Backend Layer**: business logic and API management
- **Database Layer**: storage for users, lessons, quizzes, and progress
- **External Services**: AI chatbot API and optional email notification services

---

## 3. Component Diagram Description

### 3.1 Frontend Components
The frontend is responsible for displaying the system interface and allowing users to interact with the platform. The main frontend components include:
- Home Page UI
- Login and Registration UI
- Dashboard UI
- Learning Modules UI (Vocabulary, Grammar, Pronunciation)
- Quiz and Assessment UI
- Progress Tracking UI
- Reports UI
- Chatbot UI
- Support and Contact UI

### 3.2 Backend Components
The backend is responsible for managing the system logic, validating users, storing progress, and generating reports. The main backend components include:
- Authentication Controller (Login/Register)
- User Management Controller
- Learning Module Controller
- Quiz Controller
- Progress Tracking Controller
- Report Generation Controller
- Chatbot Integration Service
- Admin/Content Management Module (optional)

### 3.3 Database Components
The database stores all permanent data. Core tables include:
- Users
- Lessons
- Vocabulary
- Grammar Topics
- Pronunciation Exercises
- Quizzes
- Quiz Questions
- User Progress
- Chat History

### 3.4 External Services
The system may communicate with external services such as:
- AI Chatbot API (for conversation and language help)
- Email Service API (for password reset and notifications)

---

## 4. Deployment Diagram Description

### 4.1 Deployment Architecture
Mandarin Bridge will be deployed using a standard web-based architecture with multiple layers. The system will run on cloud hosting services.

The deployment includes:
- **Client Device (User Browser)**: Accesses the system through a web browser.
- **Frontend Hosting Server**: Hosts the website interface (React/HTML).
- **Backend Application Server**: Hosts the REST API and business logic.
- **Database Server**: Hosts the MySQL database.
- **External AI Service**: Hosts the chatbot API used by the system.

### 4.2 Communication Flow
- Users access the system using a web browser.
- The frontend sends HTTPS requests to the backend API server.
- The backend processes the request and retrieves/stores data in MySQL.
- For chatbot responses, the backend sends requests to the AI API and returns the response to the frontend.

## Conclusion
The system architecture of Mandarin Bridge is designed to be modular, scalable, and easy to maintain. By using MVC with RESTful APIs, the system can support multiple learning modules and can be extended in the future to support mobile applications, additional AI features, and advanced reporting.
