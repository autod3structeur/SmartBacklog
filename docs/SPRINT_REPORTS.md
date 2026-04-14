# Sprint Reports

As requested in **Expected Deliverables n°2**: *"A short document explaining what was completed and how the team improved its process between Sprint 1 and Sprint 2."*

---

## Sprint 1 Report: Review & Retro
**Date:** March 3 - March 14, 2026
**Status:** Done

### 1. Sprint Review (What was done)
*   [x] Kanban Board UI (3 Columns: To Do, In Progress, Done).
*   [x] Ticket CRUD functionality (create, edit, delete tickets).
*   [x] Technical foundation for Backend/Frontend communication (Flask REST API + React fetch).
*   [x] Drag & Drop between columns using @dnd-kit.
*   [x] Persistent storage with JSON file backend.

### 2. Sprint Retrospective (Improvement)
*   **What went well:** The React + Tailwind CSS setup was fast. Having a clear MoSCoW prioritization made it easy to focus on the MVP first. The @dnd-kit library handled drag-and-drop much better than a manual implementation.
*   **Challenges faced:** Getting @dnd-kit to work with droppable columns required custom collision detection. Initial CORS issues between Flask and Vite dev server took some debugging.
*   **Action plan for Sprint 2:** Focus on AI integration. Keep the prompt engineering simple and iterate. Use a small local model to avoid API costs.

---

## Sprint 2 Report: Review & Retro
**Date:** March 17 - March 28, 2026
**Status:** Done

### 1. Sprint Review (What was done)
*   [x] AI Criteria Auto-generation using local SmolLM2-135M model.
*   [x] AI Complexity Estimation (Smart Story Points based on keywords + AI).
*   [x] AI Priority Analysis (keyword detection for urgent/bug/fix/critical).
*   [x] Ticket editing modal with Markdown preview (Write/Preview tabs).
*   [x] Professional UI redesign with Jira-style layout.

### 2. Sprint Retrospective (Improvement)
*   **What went well:** The local LLM approach (SmolLM2-135M) worked surprisingly well for a 135M parameter model. Running it locally means zero API costs and full data privacy. The prompt engineering with specific output formatting constraints helped get consistent results.
*   **Challenges faced:** LLM output can be repetitive or off-topic with a small model. Added a validation step with fallback criteria to handle bad outputs. The model takes ~5-10s on CPU which is noticeable but acceptable.
*   **Action plan for future:** Could explore larger models (SmolLM2-360M) for better output quality. Adding touch support for mobile drag-and-drop would improve UX.
