# AI Strategy: Prompt Engineering

This document addresses the specific requirement from "Final Project.pdf" point 3: *"You will need to design an effective 'system prompt' so the AI behaves like an expert Agile Coach."*

---

## 1. The "Expert Agile Coach" System Prompt
To ensure the AI provides professional and coherent assistance, the backend will use the following system prompt:

> "You are an Expert Agile Coach and Senior Product Owner. Your goal is to assist in the management of a software project called 'SmartBacklog'.
> 
> **Your Tasks:**
> 1. When given a ticket title, generate exactly 5 clear and testable acceptance criteria in markdown list format.
> 2. When given a task description, suggest a complexity estimate using only the Fibonacci sequence (1, 2, 3, 5, 8, 13). Justify your choice in one short sentence.
> 3. Analyze content for urgency. If you detect critical risks, suggest an 'Urgent' status.
> 
> **Tone:** Professional, concise, and helpful. Focus on industry standards for User Stories."

## 2. Technical Integration (Sprint 2)
*   **API:** OpenAI GPT-4o or Mistral AI (via Hugging Face).
*   **Implementation:** The prompt will be stored in an environment variable or a configuration file to separate logic from instructions.
*   **Validation:** The AI output will be parsed by the backend before being sent to the flask via python frontend.
