# SmartBacklog 

The intelligent assistant for Agile product management. 

Final project for the **Master 1: Information Systems Modeling** course by Ali BOUKEHILA.

## Concept
SmartBacklog is a web-based Kanban application designed to assist Product Owners and development teams. It uses **Local AI** to automate the most tedious parts of Agile project management.

**Key Technical Feature:**
Unlike standard projects using APIs (OpenAI/Mistral), this version runs a **Local Large Language Model (SmolLM2-135M)** directly on your machine using the Hugging Face `transformers` library. This ensures 100% data privacy and zero API costs.

## Features
1. **Interactive Kanban:** Fluid Drag & Drop using `@dnd-kit`.
2. **Magic AI Button:** 
   - Auto-generates Acceptance Criteria.
   - Suggests Story Points (Fibonacci).
   - Detects Priority.
3. **Local Persistence:** Data saved in a JSON database (`data.json`).
4. **Professional UI:** Built with React 19 and Tailwind CSS v4.

## Agile Methodology
- **Framework:** Scrum
- **Prioritization:** MoSCoW
- **Estimation:** Story Points (Fibonacci)
- **Lifecycle:** 2 Sprints.

## Installation & Launch

### 1. Backend (Python + Local LLM)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
*Note: The first launch will download the model (~270MB).*

### 2. Frontend (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

---
*Developed for Master 1 - SI Modeling*
