import { useState, useEffect } from "react";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Chargement du backlog...</p>;
  if (error) return <p style={{ color: "red" }}>Erreur: {error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2c3e50" }}>SmartBacklog : Liste des Tickets</h1>
      <hr />
      
      <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            style={{ 
              border: "1px solid #ddd", 
              padding: "15px", 
              borderRadius: "8px",
              backgroundColor: ticket.status === "done" ? "#f9f9f9" : "white",
              borderLeft: ticket.priority === "urgent" ? "5px solid #e74c3c" : "5px solid #3498db"
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>{ticket.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>{ticket.description}</p>
            <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
              Status: <span style={{ color: ticket.status === "done" ? "#27ae60" : "#f39c12" }}>{ticket.status.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
