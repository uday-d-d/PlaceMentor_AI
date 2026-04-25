# 🚀 PlaceMentor AI – AI Driven Mock Interview and Aptitude Preparation System

AI-powered placement preparation platform combining aptitude practice, mock interviews, speech interaction and performance analytics to help students prepare smarter.

![Status](https://img.shields.io/badge/Status-Active%20Development-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Flask-black)
![Database](https://img.shields.io/badge/Database-MongoDB-green)
![AI](https://img.shields.io/badge/AI-Ollama%20Phi--3-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Overview

PlaceMentor AI is an intelligent placement preparation platform built to support students through technical interview readiness and aptitude practice using AI.

The system combines assessment, mock interviews, analytics and personalized feedback into a single full-stack platform designed to simulate real placement preparation.

It helps students improve through:

* 🧠 Aptitude preparation and assessment
* 🎤 AI-driven mock interviews
* 📊 Performance analytics and skill tracking
* 💬 Personalized feedback and improvement suggestions

### Core Goal

Make placement preparation interactive, measurable and personalized.

---

## ✨ Key Features

### 👨‍🎓 Student Features

* 🔐 Student Authentication
  Secure login and registration using JWT authentication.

* 📝 Aptitude Test Module
  Timed aptitude practice with scoring and performance tracking.

* 🤖 AI Mock Interview Module
  Interactive interview simulation powered by AI.

* 🎙️ Voice-Based Interview Interaction
  Speech-enabled interviews using Web Speech API.

* 📈 AI Feedback and Evaluation
  Response analysis, improvement suggestions and interview scoring.

* 📡 Radar Chart Performance Analysis
  Visual skill analysis using radar charts.

* 🚫 Tab-Switch Detection
  Basic anti-cheating monitoring during tests.

---

### 🛠 Admin Features

* 📊 Admin Dashboard
  Manage students and monitor progress.

* 🗄 MongoDB Student Data Management
  Store users, scores and feedback securely.

---

## 🧰 Tech Stack

### Frontend

| Technology     | Purpose            |
| -------------- | ------------------ |
| React.js       | Frontend Framework |
| Chart.js       | Data Visualization |
| Web Speech API | Voice Interaction  |

### Backend

| Technology         | Purpose             |
| ------------------ | ------------------- |
| Python Flask       | Backend APIs        |
| REST APIs          | Communication Layer |
| JWT Authentication | Security            |

### Database

| Technology | Purpose      |
| ---------- | ------------ |
| MongoDB    | Data Storage |

### AI

| Technology     | Purpose             |
| -------------- | ------------------- |
| Ollama (Phi-3) | Interview AI Engine |

### UI

| Technology        | Purpose           |
| ----------------- | ----------------- |
| Google Stitch MCP | UI Design Support |

---

## 🏗 System Architecture

```text
React Frontend
     │
     ▼
Flask Backend
   │      │
   ▼      ▼
MongoDB  Ollama (Phi-3)
```

Flow:

Frontend → Flask Backend → MongoDB + Ollama

* React handles UI and user interaction
* Flask manages APIs and logic
* MongoDB stores application data
* Ollama powers AI interview evaluation

---

## 📁 Project Structure

```bash
PlaceMentor_AI/
├── frontend/
├── backend/
├── database/
├── docs/
├── model_ollama.py
├── requirements.txt
└── README.md
```

---

## ⚙ Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/PlaceMentor_AI.git
cd PlaceMentor_AI
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment

Windows:

```bash
venv\Scripts\activate
```

Linux / Mac:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

### 3. Start MongoDB

```bash
mongod
```

Or configure MongoDB Atlas.

---

### 4. Start Ollama

```bash
ollama pull phi3
ollama run phi3
```

---

### 5. Run Flask Backend

```bash
python app.py
```

Runs at:

```bash
http://localhost:5000
```

---

### 6. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at:

```bash
http://localhost:5173
```

---

## ▶ How to Run

Run all services:

* MongoDB
* Ollama
* Flask Backend
* React Frontend

Open:

```bash
http://localhost:5173
```

Login and start using the platform.

---

## 💡 Usage

### Student Workflow

1. Login/Register
2. Practice Aptitude Tests
3. Start AI Mock Interview
4. Answer using text or voice
5. Get AI-generated feedback
6. Review analytics dashboard

---

### Admin Workflow

* Manage students
* Monitor performance
* View analytics and reports

---

### AI Interview Flow

```text
Question Prompt
   ↓
Student Response
   ↓
AI Evaluation
   ↓
Feedback + Score
   ↓
Performance Analytics
```


## 🔮 Future Enhancements

* Resume Analysis
* Company-Specific Interview Simulation
* Placement Prediction
* Advanced AI Coaching
* Video Interview Simulation
* Cloud Deployment

---

## 🎓 Motivation and Learning Outcomes

This project was developed as a capstone project to explore how AI can improve placement preparation.

Key learnings from this project:

* Full Stack Development
* React and Flask Integration
* REST API Design
* MongoDB Data Modeling
* AI Integration using Ollama
* Speech-Based Interfaces
* Authentication Systems
* Data Visualization

This project focuses on solving a practical student problem using applied AI.

---

## 👥 Contributors

### Project Author

Your Name
Final Year Capstone Project

### Contributors

* Contributor Name
* Contributor Name
* Contributor Name

---

## 🤝 Contributing

Contributions and suggestions are welcome.

```bash
Fork the repository
Create feature branch
Commit changes
Open pull request
```

---

## 📜 License

Licensed under MIT License.

See the LICENSE file for details.

---

## ⭐ Support

If you found this project useful, consider giving it a star.

Built with ❤️ for smarter placement preparation
