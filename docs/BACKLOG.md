# Product Backlog: SmartBacklog

This document represents the exhaustive list of functionalities to be developed, prioritized using the **MoSCoW method** (Must have, Should have, Could have, Won't have).

## Epics Breakdown
1.  **Epic 1: Core Workspace (Kanban)** - Essential infrastructure to view and manage task columns.
2.  **Epic 2: Ticket Management (CRUD)** - The ability to create, read, update, and delete tasks.
3.  **Epic 3: AI Intelligence (Dev "Plus")** - Integration of LLM capabilities to assist the Product Owner.

---

## User Stories (US)

### EPIC 1 & 2: MVP (Minimum Viable Product) - Target: Sprint 1

| ID | User Story (As a... I want... so that...) | Acceptance Criteria | Priority | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **US1** | **As a** Product Owner, **I want** to see a Kanban board with 3 distinct columns (To Do, In Progress, Done) **so that** I can track task progress visually. | - The board displays 3 columns side-by-side.<br>- The columns are clearly labeled.<br>- The board is responsive. | **Must** | 3 |
| **US2** | **As a** Product Owner, **I want** to create a new ticket in the "To Do" column **so that** I can add tasks to the backlog. | - A "Create Ticket" button is available.<br>- A modal/form opens asking for a Title and Description.<br>- The new ticket appears at the bottom of "To Do". | **Must** | 5 |
| **US3** | **As a** developer, **I want** to drag and drop a ticket between columns **so that** I can update its status easily. | - Tickets can be clicked and dragged.<br>- Dropping a ticket in a new column updates its status visually. | **Must** | 8 |
| **US4** | **As a** Product Owner, **I want** to delete a ticket **so that** I can remove cancelled or duplicate tasks. | - A delete icon is visible on each ticket.<br>- Clicking it asks for confirmation before removal. | **Must** | 2 |

### EPIC 3: AI Integration - Target: Sprint 2

| ID | User Story (As a... I want... so that...) | Acceptance Criteria | Priority | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **US5** | **As a** Product Owner, **I want** the AI to auto-generate acceptance criteria when I type a ticket title **so that** I save time writing specifications. | - A button "Generate Criteria" is in the ticket creation form.<br>- It calls the AI API with the title.<br>- The response populates the description field in markdown format. | **Should** | 5 |
| **US6** | **As a** Product Owner, **I want** the AI to estimate the complexity (Story Points) based on the description **so that** sprint planning is easier. | - A button "Estimate Complexity" analyzes the description.<br>- It returns a Fibonacci number (1, 2, 3, 5, 8, 13).<br>- The suggested value is displayed on the ticket. | **Should** | 5 |
| **US7** | **As a** Product Owner, **I want** the AI to analyze the ticket and flag it as "Blocking" or "Urgent" **so that** critical tasks are highlighted. | - The AI analyzes the text upon ticket creation.<br>- If words like "crash", "error", "prod" are detected or implied, a red "Urgent" badge is added. | **Could** | 3 |

---

## Technical Tasks (TT)
*These are tasks not directly tied to a user feature but necessary for the project.*

*   **TT1:** Initialize Git repository and project structure. (Done)
*   **TT2:** Set up the Frontend environment (React/Vite, Tailwind).
*   **TT3:** Set up the Backend environment (Node.js/Express, basic local storage).
*   **TT4:** Configure the OpenAI/Mistral API connection on the backend.
*   **TT5:** Design the "System Prompt" (Prompt Engineering) for the AI Agile Coach persona.
