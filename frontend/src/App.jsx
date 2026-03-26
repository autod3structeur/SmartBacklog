import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- COMPOSANT TICKET (DÉPLAÇABLE) ---
function SortableTicket({ ticket }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: "1px solid #ddd", 
    padding: "12px", 
    marginBottom: "12px", 
    borderRadius: "6px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
    borderLeft: ticket.priority === "urgent" ? "5px solid #e74c3c" : "5px solid #3498db",
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem" }}>{ticket.title}</h4>
      <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>{ticket.description}</p>
    </div>
  );
}

// --- COMPOSANT PRINCIPAL ---
function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration des capteurs pour la souris et le clavier
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Récupération initiale des tickets
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. LOGIQUE DE FIN DE DRAG (C'est là que la magie opère)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Pour ce projet, on va simplifier : 
      // Si on dépose un ticket sur une colonne (ou un autre ticket), on change son statut.
      
      const ticketId = active.id;
      const overId = over.id; // L'ID de l'élément sur lequel on a lâché.

      // On trouve le nouveau statut basé sur l'ID de la cible
      // (Dans un vrai projet, on utiliserait des IDs de colonnes, ici on simplifie)
      let newStatus = "";
      if (overId === "todo-zone") newStatus = "todo";
      else if (overId === "doing-zone") newStatus = "doing";
      else if (overId === "done-zone") newStatus = "done";
      else {
        // Si on lâche sur un autre ticket, on prend le statut de ce ticket
        const targetTicket = tickets.find(t => t.id === overId);
        if (targetTicket) newStatus = targetTicket.status;
      }

      if (newStatus) {
        // A. Mise à jour visuelle immédiate (Optimistic UI)
        const updatedTickets = tickets.map(t => 
          t.id === ticketId ? { ...t, status: newStatus } : t
        );
        setTickets(updatedTickets);

        // B. Envoi de l'ordre au serveur Flask
        fetch(`http://127.0.0.1:5000/api/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
      }
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "50px" }}>Chargement...</p>;

  // Filtrage des tickets par colonnes
  const columns = [
    { id: "todo-zone", title: "🔵 À FAIRE", status: "todo", color: "#2980b9" },
    { id: "doing-zone", title: "🟡 EN COURS", status: "doing", color: "#f39c12" },
    { id: "done-zone", title: "🟢 TERMINÉ", status: "done", color: "#27ae60" }
  ];

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "40px" }}>SmartBacklog 🧠 Glisser-Déposer</h1>
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: "25px", justifyContent: "center", maxWidth: "1200px", margin: "0 auto" }}>
          
          {columns.map((col) => (
            <div key={col.id} style={{ flex: 1, backgroundColor: "#ebedef", padding: "15px", borderRadius: "10px" }}>
              <h2 style={{ fontSize: "1.1rem", color: col.color, borderBottom: `3px solid ${col.color}`, paddingBottom: "10px", textAlign: "center" }}>
                {col.title}
              </h2>

              {/* Zone de dépôt Sortable */}
              <SortableContext 
                id={col.id}
                items={tickets.filter(t => t.status === col.status).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ marginTop: "20px", minHeight: "200px" }}>
                  {tickets.filter(t => t.status === col.status).map((ticket) => (
                    <SortableTicket key={ticket.id} ticket={ticket} />
                  ))}
                  {/* Une petite aide visuelle pour lâcher dans la zone vide */}
                  <div style={{ height: "50px", border: "2px dashed #ccc", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "0.8rem" }}>
                    Lâcher ici
                  </div>
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default App;
