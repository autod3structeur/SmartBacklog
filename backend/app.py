from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# On autorise explicitement toutes les origines (*) sur toutes les routes (/api/*)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Simulation d'une base de données (Liste de tickets)
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
        "status": "todo",
        "priority": "normal"
    }
]

@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    """Retourne la liste complète des tickets du backlog."""
    return jsonify(tickets_db)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
