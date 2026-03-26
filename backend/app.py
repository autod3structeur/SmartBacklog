from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = "data.json"

# Initialisation de la base de données (lecture depuis fichier ou défaut)
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        tickets_db = json.load(f)
else:
    tickets_db = [
        {"id": 1, "title": "Setup Project", "description": "Base technical structure.", "status": "done", "priority": "normal", "points": 3},
        {"id": 2, "title": "Configure AI", "description": "Implement prompt engineering.", "status": "todo", "priority": "urgent", "points": 8}
    ]

def save_db():
    with open(DATA_FILE, "w") as f:
        json.dump(tickets_db, f)

@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    return jsonify(tickets_db)

@app.route("/api/tickets", methods=["POST"])
def create_ticket():
    data = request.json
    new_ticket = {
        "id": max([t["id"] for t in tickets_db] + [0]) + 1,
        "title": data.get("title", "Sans titre"),
        "description": data.get("description", ""),
        "status": data.get("status", "todo"),
        "priority": data.get("priority", "normal"),
        "points": data.get("points", 1)
    }
    tickets_db.append(new_ticket)
    save_db()
    return jsonify(new_ticket), 201

@app.route("/api/tickets/<int:ticket_id>", methods=["PATCH"])
def update_ticket(ticket_id):
    data = request.json
    for ticket in tickets_db:
        if ticket["id"] == ticket_id:
            ticket.update(data)
            save_db()
            return jsonify(ticket)
    return jsonify({"error": "Not found"}), 404

@app.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    global tickets_db
    tickets_db = [t for t in tickets_db if t["id"] != ticket_id]
    save_db()
    return "", 204

@app.route("/api/ai/generate", methods=["POST"])
def ai_generate():
    """
    Expert Agile Coach AI Engine.
    Simulates high-quality LLM output for criteria and points.
    """
    title = request.json.get("title", "")
    
    # Simulation de l'IA (Expert Agile Coach)
    criteria = f"### Acceptance Criteria for: {title}\n" \
               "- The feature must be fully responsive.\n" \
               "- Edge cases must be handled gracefully.\n" \
               "- Unit tests must cover at least 80% of logic.\n" \
               "- Documentation must be updated."
               
    # Logique de suggestion de points (Fibonacci)
    points = 5 if len(title) > 10 else 3
    priority = "urgent" if "urgent" in title.lower() or "bug" in title.lower() else "normal"
    
    return jsonify({
        "description": criteria,
        "points": points,
        "priority": priority
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
