# Product Backlog & Project Structure: SmartBacklog

Following the methodology from "Example Jira.pdf" and "Final Project.pdf".

---

## Step 1: Creation of the Structure (Epics)
As per the project requirements, we isolate 3 themes:
1.  **Epic 1: Workspace Infrastructure:** Development of the Kanban board (To Do, In Progress, Done).
2.  **Epic 2: Ticket Management (CRUD):** Creating, Editing, and Deleting User Stories.
3.  **Epic 4: AI Intelligence (Expert Assistant):** Automation of criteria, estimation, and priority.

## Step 2: Writing User Stories (US)

| ID | User Story (As a... I want... so that...) | Acceptance Criteria |
| :--- | :--- | :--- |
| **US1** | **As a** Product Owner, **I want** to see a Kanban board with 3 columns (To Do, In Progress, Done). | - 3 labeled columns visible.<br>- Responsive layout. |
| **US2** | **As a** Product Owner, **I want** to add, edit, and delete tickets. | - CRUD operations functional.<br>- Tickets display Title/Description. |
| **US3** | **As a** PO, **I want** the AI to auto-generate acceptance criteria from a title. | - AI returns a list of criteria.<br>- User can review before saving. |
| **US4** | **As a** PO, **I want** the AI to suggest a Fibonacci complexity (1, 2, 3, 5, 8, 13). | - AI analyzes description.<br>- Suggests a valid Fibonacci number. |
| **US5** | **As a** PO, **I want** the AI to tag tickets as "Blocking" or "Urgent". | - AI detects critical keywords.<br>- Visual badge applied to ticket. |

## Step 3: Prioritization (The MoSCoW Method)
"Can the project function without this task?"

*   **Must have (Essential):** US1 (Board Layout), US2 (Ticket CRUD). This is the "App Core" (MVP).
*   **Should have (Important):** US3 (AI Criteria), US4 (AI Complexity). This is the "Dev Plus" core.
*   **Could have (Bonus):** US5 (AI Priority Analysis).

## Step 4: Sprint Planning
*   **Number of Sprints:** 2 Sprints.
*   **Sprint Duration:** 2 weeks (as per Professor's example).

| Sprint | Objective | US Included |
| :--- | :--- | :--- |
| **Sprint 1** | **The App Core (MVP):** Functional board and ticket management. | US1, US2 |
| **Sprint 2** | **AI Integration:** Implementing Prompt Engineering and Smart features. | US3, US4, US5 |

## Step 5: Implementation Roadmap
1. Create the project structure.
2. Develop the Frontend/Backend logic for tickets.
3. Design the "Expert Agile Coach" system prompt.
4. Integrate the LLM API calls.
