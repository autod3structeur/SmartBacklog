from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Configuration CORS très large pour le développement
CORS(app)

# Simulation d'une base de données
tickets_db = [
    {
        "id": 1,
        "title": "Initialisation du Projet",
        "description": "Mise en place de l'architecture Flask et React.",
        "status": "done",
        "priority": "normal"
    },
    {
        "id": 2,
        "title": "Configuration du CORS",
        "description": "Permettre la communication entre le client et le serveur.",
        "status": "done",
        "priority": "urgent"
    },
    {
        "id": 3,
        "title": "Création du Tableau Kanban",
        "description": "Développer l'interface visuelle avec les 3 colonnes.",
        "status": "doing",
        "priority": "normal"
    },
    {
        "id": 4,
        "title": "Filtrage des données",
        "description": "Utiliser .filter() pour séparer les tickets par colonnes.",
        "status": "todo",
        "priority": "normal"
    }
]

@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    """Récupère tous les tickets."""
    return jsonify(tickets_db)

@app.route("/api/tickets/<int:ticket_id>", methods=["PATCH"])
def update_ticket_status(ticket_id):
    """Modifie le statut d'un ticket spécifique."""
    data = request.json
    new_status = data.get("status")
    
    # On cherche le ticket dans notre "base de données"
    for ticket in tickets_db:
        if ticket["id"] == ticket_id:
            ticket["status"] = new_status
            return jsonify(ticket), 200
            
    return jsonify({"error": "Ticket non trouvé"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
