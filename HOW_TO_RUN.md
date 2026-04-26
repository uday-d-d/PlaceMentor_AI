# PlaceMentor AI - Project Setup and Run Guide

Welcome to the PlaceMentor AI setup guide! Follow these step-by-step instructions to get the full-stack project (Frontend + Backend + AI + Database) running on your local machine from scratch.

---

## 🛠 Prerequisites
Before starting, ensure you have the following installed on your system:
1. **[Node.js](https://nodejs.org/)** (v16+ recommended) - For running the React frontend.
2. **[Python](https://www.python.org/downloads/)** (v3.9+ recommended) - For running the Flask backend.
3. **[MongoDB Community Server](https://www.mongodb.com/try/download/community)** - For the database.
4. **[Ollama](https://ollama.com/)** - For running the local AI model (Phi-3) used in interviews.

---

## 🚀 Step-by-Step Setup

### Step 1: Database Setup (MongoDB)
The backend requires MongoDB to store user and interview data.
1. Install MongoDB Community Server and start the service.
2. The default port is `27017`. Ensure it's running in the background.
3. *Optional:* Use MongoDB Compass to visualize your database visually. The database will automatically be created under the name `placementor_ai` when the server runs.

### Step 2: AI Engine Setup (Ollama)
The application relies on a local LLM to generate questions and evaluate answers.
1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Open your terminal or command prompt and run the following command to download the required AI model:
   ```bash
   ollama pull phi3
   ```
3. Keep the Ollama service running in the background (it runs on port `11434` by default).

### Step 3: Backend Setup (Flask)
The backend manages APIs, Database connection, and AI integration.

1. Open a new terminal window and navigate to the project root folder.
2. Go into the `backend` folder:
   ```bash
   cd backend
   ```
3. **Create a Virtual Environment** (Highly Recommended):
   - Windows: `python -m venv venv`
   - Mac/Linux: `python3 -m venv venv`
4. **Activate the Virtual Environment**:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
5. **Install Dependencies**:
   Navigate to the root folder where `requirement.txt` is located (or if it's inside backend, adjust path):
   ```bash
   pip install -r ../requirement.txt
   ```
6. **Set up Environment Variables**:
   In the `backend` folder, create a file named `.env` and add the following:
   ```env
   SECRET_KEY=placementor-ai-secret-key-2024
   MONGO_URI=mongodb://localhost:27017/
   DB_NAME=placementor_ai
   OLLAMA_BASE_URL=http://localhost:11434/v1
   OLLAMA_MODEL=phi3
   ```
7. **Run the Backend Server**:
   ```bash
   python app.py
   ```
   *The backend should now be running on `http://localhost:5000`.*

### Step 4: Frontend Setup (React/Vite)
The frontend provides the user interface for students and admins.

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. **Install Node modules**:
   ```bash
   npm install
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The frontend should now be running on `http://localhost:5173`.*

---

## 🌐 Accessing the Application

With both servers running, open your browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

- You can register a new student account to access the dashboard.
- To access the admin dashboard, you can hit the `/api/admin/setup` POST endpoint (using Postman or curl) to generate the default admin credentials.

---

## 🔧 Common Issues and Fixes

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Interview gives exactly 0.5 or 0.2 score consistently** | Backend cannot connect to Ollama, or Python throws an Exception | Ensure the Ollama app is running in the background. Check if `ollama run phi3` works in your terminal. Ensure the backend console isn't showing `ModuleNotFoundError`. |
| **Mic button doesn't respond or throws error** | Browser lacks permissions or doesn't support Web Speech API | Use **Google Chrome**, as it has the best native support for the Web Speech API. Ensure you click "Allow" when the browser prompts for Microphone permissions. |
| **`pymongo.errors.ServerSelectionTimeoutError`** | MongoDB is not running | Ensure MongoDB service is started (`mongod` command or Windows Services manager). |
| **Backend throws `ModuleNotFoundError`** | Virtual environment not activated or missing packages | Make sure you ran `venv\Scripts\activate` before running `pip install` and `python app.py`. Re-run `pip install -r ../requirement.txt` while activated. |

---
Enjoy building your career with PlaceMentor AI!
