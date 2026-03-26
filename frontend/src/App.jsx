import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock 
} from "lucide-react";

// --- TICKET COMPONENT ---
function SortableTicket({ ticket, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        ticket.priority === 'urgent' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
      }`}
      {...attributes} 
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{ticket.title}</h4>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{ticket.description || "Pas de description..."}</p>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
          SP: {ticket.points || 1}
        </span>
        {ticket.priority === 'urgent' && (
          <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
            <AlertTriangle size={10} /> URGENT
          </span>
        )}
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT ---
function Column({ id, title, icon, tickets, colorClass, onDelete }) {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col bg-gray-100/60 rounded-xl p-4 h-full">
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${colorClass}`}>
        {icon}
        <h2 className="font-bold text-sm tracking-wide text-gray-700">{title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-mono">
          {tickets.length}
        </span>
      </div>
      
      <SortableContext id={id} items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto pr-1">
          {tickets.length > 0 ? (
            tickets.map(t => <SortableTicket key={t.id} ticket={t} onDelete={onDelete} />)
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center text-gray-400 text-xs italic">
              Déposez un ticket ici
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tickets")
      .then(res => res.json())
      .then(data => { setTickets(data); setLoading(false); });
  }, []);

  const handleCreate = async (aiData = null) => {
    const payload = aiData ? {
      title: newTitle,
      description: aiData.description,
      points: aiData.points,
      priority: aiData.priority
    } : { title: newTitle, description: newDesc };

    const res = await fetch("http://127.0.0.1:5000/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const created = await res.json();
    setTickets([...tickets, created]);
    setShowModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  const handleMagicAI = async () => {
    if (!newTitle) return alert("Entrez un titre d'abord !");
    setAiLoading(true);
    const res = await fetch("http://127.0.0.1:5000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    });
    const data = await res.json();
    setNewDesc(data.description);
    setAiLoading(false);
    handleCreate(data);
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5000/api/tickets/${id}`, { method: "DELETE" });
    setTickets(tickets.filter(t => t.id !== id));
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const ticketId = active.id;
    const overId = over.id;

    // Déterminer le nouveau statut
    let newStatus = "";
    if (["todo", "doing", "done"].includes(overId)) newStatus = overId;
    else {
      const target = tickets.find(t => t.id === overId);
      if (target) newStatus = target.status;
    }

    if (newStatus) {
      const updated = tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
      setTickets(updated);
      await fetch(`http://127.0.0.1:5000/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-mono animate-pulse">Chargement du Backlog...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Sparkles /></div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">SmartBacklog</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
        >
          <Plus size={20} /> Nouveau Ticket
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 max-w-7xl w-full mx-auto">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            <Column id="todo" title="À FAIRE" icon={<Clock size={16} />} tickets={tickets.filter(t => t.status === 'todo')} colorClass="border-blue-500 text-blue-600" onDelete={handleDelete} />
            <Column id="doing" title="EN COURS" icon={<Search size={16} />} tickets={tickets.filter(t => t.status === 'doing')} colorClass="border-amber-500 text-amber-600" onDelete={handleDelete} />
            <Column id="done" title="TERMINÉ" icon={<CheckCircle2 size={16} />} tickets={tickets.filter(t => t.status === 'done')} colorClass="border-emerald-500 text-emerald-600" onDelete={handleDelete} />
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeId ? (
              <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-400 opacity-90 scale-105 rotate-2">
                <h4 className="font-bold text-sm">{tickets.find(t => t.id === activeId)?.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal Creation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus size={24} className="text-blue-600" /> Créer une Story
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Titre du ticket (ex: Page Login)"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                />
                <textarea 
                  placeholder="Description ou critères..." rows={4}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleMagicAI} disabled={aiLoading}
                  className="flex-[2] py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={18} className={aiLoading ? "animate-spin" : ""} /> {aiLoading ? "Magie en cours..." : "✨ Magie IA"}
                </button>
              </div>
              <p className="mt-4 text-[10px] text-center text-gray-400 italic">
                Le bouton Magie IA génère les critères, suggère les points et crée le ticket.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
