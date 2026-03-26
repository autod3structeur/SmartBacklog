import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  GripVertical
} from "lucide-react";

// --- TICKET COMPONENT (SORTABLE) ---
function SortableTicket({ ticket, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: ticket.id,
    data: { type: 'Ticket', ticket }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-white p-4 mb-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${
        ticket.priority === 'urgent' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
            <GripVertical size={14} />
          </div>
          <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{ticket.title}</h4>
        </div>
        <button 
          onClick={() => onDelete(ticket.id)}
          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3 min-h-[2rem] line-clamp-2">{ticket.description || "Pas de description..."}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
          SP: {ticket.points || 1}
        </span>
        {ticket.priority === 'urgent' && (
          <span className="text-[10px] text-red-600 font-black flex items-center gap-0.5">
            <AlertTriangle size={10} /> URGENT
          </span>
        )}
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT (DROPPABLE) ---
function Column({ id, title, icon, tickets, colorClass, onDelete }) {
  const { setNodeRef } = useDroppable({ 
    id,
    data: { type: 'Column', status: id }
  });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[300px] flex flex-col bg-slate-200/40 rounded-2xl p-4 h-full border border-transparent hover:border-slate-300 transition-colors">
      <div className={`flex items-center gap-2 mb-5 pb-2 border-b-2 ${colorClass}`}>
        {icon}
        <h2 className="font-black text-xs uppercase tracking-widest text-slate-600">{title}</h2>
        <span className="ml-auto bg-white/80 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          {tickets.length}
        </span>
      </div>
      
      <SortableContext id={id} items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-[150px]">
          {tickets.map(t => <SortableTicket key={t.id} ticket={t} onDelete={onDelete} />)}
          {tickets.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] uppercase font-bold tracking-tighter italic">
              Déposez ici
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
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tickets")
      .then(res => res.json())
      .then(setTickets);
  }, []);

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) return;

    // Détecter si on survole une colonne ou un autre ticket
    const overColumnId = over.data.current?.status || (tickets.find(t => t.id === overId)?.status);

    if (overColumnId && activeTicket.status !== overColumnId) {
      setTickets(prev => prev.map(t => t.id === activeId ? { ...t, status: overColumnId } : t));
    }
  };

  const handleDragEnd = async (event) => {
    const { active } = event;
    setActiveId(null);

    const ticketId = active.id;
    const finalTicket = tickets.find(t => t.id === ticketId);

    if (finalTicket) {
      await fetch(`http://127.0.0.1:5000/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: finalTicket.status })
      });
    }
  };

  const handleCreate = async (aiData = null) => {
    const payload = aiData ? {
      title: newTitle,
      description: aiData.description,
      points: aiData.points,
      priority: aiData.priority
    } : { title: newTitle, description: newDesc, status: "todo" };

    const res = await fetch("http://127.0.0.1:5000/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const created = await res.json();
    setTickets(prev => [...prev, created]);
    setShowModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  const handleMagicAI = async () => {
    if (!newTitle) return;
    setAiLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await res.json();
      await handleCreate(data);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5000/api/tickets/${id}`, { method: "DELETE" });
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-8 lg:p-16">
      <div className="max-w-7xl w-full mx-auto flex flex-col h-full">
        
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SmartBacklog <span className="text-blue-600">AI</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Intelligence Assistée • Agile Scrum</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.2rem] font-bold shadow-2xl transition-all active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            Ajouter une Story
          </button>
        </header>

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-10 min-h-[600px]">
            <Column id="todo" title="À FAIRE" icon={<Clock size={14}/>} tickets={tickets.filter(t => t.status === 'todo')} colorClass="border-blue-500 text-blue-600" onDelete={handleDelete} />
            <Column id="doing" title="EN COURS" icon={<Search size={14}/>} tickets={tickets.filter(t => t.status === 'doing')} colorClass="border-amber-500 text-amber-600" onDelete={handleDelete} />
            <Column id="done" title="TERMINÉ" icon={<CheckCircle2 size={14}/>} tickets={tickets.filter(t => t.status === 'done')} colorClass="border-emerald-500 text-emerald-600" onDelete={handleDelete} />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-5 rounded-2xl shadow-2xl border-2 border-blue-500 w-[320px] rotate-2 scale-105 opacity-95 cursor-grabbing">
                <h4 className="font-bold text-slate-800">{tickets.find(t => t.id === activeId)?.title}</h4>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">{tickets.find(t => t.id === activeId)?.description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nouvelle Story</h2>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><Sparkles size={24}/></div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Titre de la tâche</label>
                  <input 
                    type="text" placeholder="ex: Interface de profil utilisateur"
                    className="w-full mt-2 p-5 bg-slate-50 border-none rounded-[1.2rem] focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700"
                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Description</label>
                  <textarea 
                    placeholder="Laissez l'IA s'en occuper..." rows={3}
                    className="w-full mt-2 p-5 bg-slate-50 border-none rounded-[1.2rem] focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-600"
                    value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-4">
                <button 
                  onClick={handleMagicAI} disabled={aiLoading || !newTitle}
                  className="w-full py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-30"
                >
                  {aiLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Sparkles size={22} />}
                  Générer avec l'IA
                </button>
                <button 
                  onClick={() => handleCreate()} disabled={!newTitle}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
                >
                  Ajouter manuellement
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="mt-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest hover:text-slate-500 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
