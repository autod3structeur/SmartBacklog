import { useState, useEffect } from "react";

function App() {
  // 1. État pour stocker le message du serveur
  const [serverMessage, setServerMessage] = useState("Chargement...");

  // 2. Appel API au chargement du composant
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        return response.json(); // On attend du JSON cette fois
      })
      .then((data) => {
        setServerMessage(data.message); // On accède à la clé "message" de l'objet JSON
      })
      .catch((error) => {
        console.error("Erreur Fetch:", error);
        setServerMessage("Impossible de contacter le serveur Flask.");
      });
  }, []);

  // 3. Interface utilisateur (JSX)
  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      backgroundColor: "#f0f2f5"
    }}>
      <div style={{ 
        padding: "20px", 
        borderRadius: "8px", 
        backgroundColor: "white", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#1a73e8" }}>SmartBacklog</h1>
        <hr />
        <p style={{ fontSize: "1.2rem", color: "#5f6368" }}>
          Statut du Backend : <strong>{serverMessage}</strong>
        </p>
      </div>
    </div>
  );
}

export default App;
