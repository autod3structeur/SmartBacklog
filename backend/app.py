from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import torch
from transformers import pipeline

app = Flask(__name__)
CORS(app)

DATA_FILE = "data.json"
MODEL_ID = "HuggingFaceTB/SmolLM2-135M-Instruct"

# --- INITIALISATION IA LOCALE ---
print(f"Chargement du modèle {MODEL_ID}...")
device = "cuda" if torch.cuda.is_available() else "cpu"
# Sur Mac avec puce M1/M2/M3, on peut utiliser "mps" mais pour 135M le CPU est suffisant et stable
generator = pipeline("text-generation", model=MODEL_ID, device=device)
print("IA prête !")

# --- BASE DE DONNÉES LOCALE ---
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        tickets_db = json.load(f)
else:
    tickets_db = [
        {"id": 1, "title": "Setup Project", "description": "Base technical structure.", "status": "done", "priority": "normal", "points": 3}
    ]

def save_db():
    with open(DATA_FILE, "w") as f:
        json.dump(tickets_db, f)

# --- ROUTES TICKETS ---
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

# --- ROUTE IA GÉNÉRATION ---
@app.route("/api/ai/generate", methods=["POST"])
def ai_generate():
    title = request.json.get("title", "")
    
    # Prompt optimisé pour SmolLM (Format ChatML)
    messages = [
        {"role": "system", "content": "You are a Senior Product Owner. Provide 3 short acceptance criteria and a Fibonacci story point (1, 2, 3, 5, 8, 13)."},
        {"role": "user", "content": f"Ticket Title: {title}"}
    ]
    
    # Génération
    prompt = generator.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    outputs = generator(prompt, max_new_tokens=150, do_sample=True, temperature=0.7)
    response_text = outputs[0]["generated_text"].split("<|im_start|>assistant")[-1].strip()
    
    # Analyse basique de la réponse pour extraire un chiffre (Story Point)
    # Si l'IA n'en donne pas clairement, on met 3 par défaut
    import re
    points_match = re.search(r'\b(1|2|3|5|8|13)\b', response_text)
    suggested_points = int(points_match.group(0)) if points_match else 3
    
    return jsonify({
        "description": response_text,
        "points": suggested_points,
        "priority": "urgent" if "urgent" in title.lower() or "bug" in title.lower() else "normal"
    })

if __name__ == "__main__":
    # Note : debug=True peut charger le modèle 2 fois en mémoire à cause du reloader de Flask.
    # Pour la prod ou si peu de RAM, mettre use_reloader=False
    app.run(debug=True, host="127.0.0.1", port=5000, use_reloader=False)
