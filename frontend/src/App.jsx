import { useState, useEffect } from "react";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Récupération des données du serveur
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tickets")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ textAlign: "center", padding: "50px" }}>Chargement du backlog...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", padding: "50px" }}>Erreur: {error}</p>;

  // 2. Logique de filtrage (Agile : Todo, Doing, Done)
  const todoTickets = tickets.filter(t => t.status === "todo");
  const doingTickets = tickets.filter(t => t.status === "doing");
  const doneTickets = tickets.filter(t => t.status === "done");

  // 3. Fonction réutilisable pour afficher un ticket individuel
  const renderTicket = (ticket) => (
    <div 
      key={ticket.id} 
      style={{ 
        border: "1px solid #ddd", 
        padding: "12px", 
        marginBottom: "12px", 
        borderRadius: "6px",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
        borderLeft: ticket.priority === "urgent" ? "5px solid #e74c3c" : "5px solid #3498db"
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem" }}>{ticket.title}</h4>
      <p style={{ fontSize: "0.85rem", color: "#666", margin: 0, lineHeight: "1.4" }}>{ticket.description}</p>
      {ticket.priority === "urgent" && (
        <span style={{ fontSize: "0.7rem", color: "#e74c3c", fontWeight: "bold", textTransform: "uppercase" }}>⚠️ Urgent</span>
      )}
    </div>
  );

  return (
    <div style={{ 
      padding: "30px", 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      backgroundColor: "#f0f2f5", 
      minHeight: "100vh" 
    }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "40px" }}>SmartBacklog 🧠 Kanban</h1>
      
      {/* 4. Tableau Kanban (Flexbox) */}
      <div style={{ 
        display: "flex", 
        gap: "25px", 
        justifyContent: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        
        {/* Colonne À FAIRE */}
        <div style={{ flex: 1, backgroundColor: "#ebedef", padding: "15px", borderRadius: "10px", boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "1.1rem", color: "#2980b9", borderBottom: "3px solid #2980b9", paddingBottom: "10px", textAlign: "center" }}>
            🔵 À FAIRE ({todoTickets.length})
          </h2>
          <div style={{ marginTop: "20px" }}>
            {todoTickets.map(renderTicket)}
          </div>
        </div>

        {/* Colonne EN COURS */}
        <div style={{ flex: 1, backgroundColor: "#ebedef", padding: "15px", borderRadius: "10px", boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "1.1rem", color: "#f39c12", borderBottom: "3px solid #f39c12", paddingBottom: "10px", textAlign: "center" }}>
            🟡 EN COURS ({doingTickets.length})
          </h2>
          <div style={{ marginTop: "20px" }}>
            {doingTickets.map(renderTicket)}
          </div>
        </div>

        {/* Colonne TERMINÉ */}
        <div style={{ flex: 1, backgroundColor: "#ebedef", padding: "15px", borderRadius: "10px", boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "1.1rem", color: "#27ae60", borderBottom: "3px solid #27ae60", paddingBottom: "10px", textAlign: "center" }}>
            🟢 TERMINÉ ({doneTickets.length})
          </h2>
          <div style={{ marginTop: "20px" }}>
            {doneTickets.map(renderTicket)}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
