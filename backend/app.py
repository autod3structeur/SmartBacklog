from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# On autorise TOUT, partout. C'est le plus simple pour le développement.
CORS(app)

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
    return jsonify(tickets_db)

if __name__ == "__main__":
    # On force Flask à écouter sur 127.0.0.1
    app.run(debug=True, host="127.0.0.1", port=5000)
