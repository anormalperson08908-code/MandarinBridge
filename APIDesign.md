## RESTful API Design

### 1 Authentication APIs
- POST `/api/register`  
  Registers a new user.

- POST `/api/login`  
  Logs in an existing user.

- POST `/api/logout`  
  Logs out a user.

---

### 2 Lesson APIs
- GET `/api/lessons`  
  Returns a list of all lessons.

- GET `/api/lessons/{lesson_id}`  
  Returns detailed information about a specific lesson.

---

### 3 Learning Module APIs
- GET `/api/vocabulary/{lesson_id}`  
  Returns vocabulary items for a lesson.

- GET `/api/grammar/{lesson_id}`  
  Returns grammar topics for a lesson.

- GET `/api/pronunciation/{lesson_id}`  
  Returns pronunciation exercises for a lesson.

---

### 4 Quiz APIs
- GET `/api/quiz/{lesson_id}`  
  Returns quiz questions for a lesson.

- POST `/api/quiz/submit`  
  Submits quiz answers and returns score.

---

### 5 Progress APIs
- GET `/api/progress/{user_id}`  
  Returns user progress information.

- POST `/api/progress/update`  
  Updates progress after completing a lesson or quiz.

---

### 6 Report APIs
- GET `/api/reports/{user_id}`  
  Generates and returns a progress report.

---

### 7 Chatbot APIs
- POST `/api/chat`  
  Sends a user message to the chatbot and returns the AI response.


