# Sprint 1: Planning Document

**Sprint Goal:** Develop the technical foundation of the SmartBacklog. By the end of this sprint, a user must be able to visually manage a standard Kanban board (Add, move, and delete tickets). The AI features are explicitly excluded from this sprint.

**Sprint Duration:** 1 week (Virtual)
**Total Story Points Planned:** 18 SP

## Selected User Stories (Sprint Backlog)

From the Product Backlog, the following items have been pulled into Sprint 1:

1.  **US1:** See a Kanban board with 3 distinct columns (3 SP)
2.  **US2:** Create a new ticket in the "To Do" column (5 SP)
3.  **US3:** Drag and drop a ticket between columns (8 SP)
4.  **US4:** Delete a ticket (2 SP)

## Definition of Done (DoD)
For a User Story to be considered "Done" in this Sprint, it must meet the following criteria:
*   The code compiles and runs without critical errors.
*   The feature works as described in the Acceptance Criteria.
*   The UI is responsive and styled (using Tailwind CSS).
*   Changes are committed to the main branch.

## Tasks Breakdown for Execution
*To be distributed during the Sprint:*

*   [ ] `Frontend:` Setup React project.
*   [ ] `Frontend:` Create the basic UI layout (Header, Board area).
*   [ ] `Frontend:` Create Column components.
*   [ ] `Frontend:` Create Ticket components.
*   [ ] `Backend:` Setup Express server and basic REST API routes (`GET /tickets`, `POST /tickets`, `DELETE /tickets`).
*   [ ] `Integration:` Link Frontend UI to Backend API.
*   [ ] `Frontend:` Implement a Drag-and-Drop library (e.g., `dnd-kit` or `react-beautiful-dnd`).
