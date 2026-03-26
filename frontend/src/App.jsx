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
  AlertTriangle, 
  GripVertical,
  X,
  Bot
} from "lucide-react";

// --- TICKET COMPONENT (SORTABLE) ---
function SortableTicket({ ticket, onDelete, onClick }) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={() => onClick(ticket)}
      className={`group relative bg-white p-3 mb-2 rounded-md border shadow-sm hover:shadow-md transition-all cursor-pointer ${
        ticket.priority === 'urgent' ? 'border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 p-1 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()} // Évite d'ouvrir la modale quand on veut juste drag
          >
            <GripVertical size={14} />
          </div>
          <h4 className="font-medium text-gray-800 text-sm line-clamp-1 -ml-2 group-hover:ml-0 transition-all">{ticket.title}</h4>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
          className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{ticket.description || "Aucune description"}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-[11px] font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
          Pts: {ticket.points || 1}
        </span>
        {ticket.priority === 'urgent' && (
          <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
            <AlertTriangle size={12} /> Urgent
          </span>
        )}
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT (DROPPABLE) ---
function Column({ id, title, tickets, colorClass, onDelete, onTicketClick }) {
  const { setNodeRef } = useDroppable({ 
    id,
    data: { type: 'Column', status: id }
  });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[280px] flex flex-col bg-gray-50/80 rounded-lg p-3 h-full border border-gray-200">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${colorClass}`}>
        <h2 className="font-semibold text-xs uppercase tracking-wider text-gray-700">{title}</h2>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
          {tickets.length}
        </span>
      </div>
      
      <SortableContext id={id} items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-[150px]">
          {tickets.map(t => <SortableTicket key={t.id} ticket={t} onDelete={onDelete} onClick={onTicketClick} />)}
          {tickets.length === 0 && (
            <div className="h-24 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
              Déposez des tickets ici
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
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null); 
  
  // Form State
  const [formData, setFormData] = useState({ title: "", description: "", points: 1, priority: "normal" });
  const [aiLoading, setAiLoading] = useState(false);

  // Configuration DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tickets")
      .then(res => res.json())
      .then(setTickets);
  }, []);

  // --- DND LOGIC ---
  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) return;

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

  // --- MODAL LOGIC ---
  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({ title: "", description: "", points: 1, priority: "normal" });
    setShowModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setFormData({ 
      title: ticket.title, 
      description: ticket.description || "", 
      points: ticket.points || 1, 
      priority: ticket.priority || "normal" 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title) return;

    if (editingTicket) {
      // Édition
      const res = await fetch(`http://127.0.0.1:5000/api/tickets/${editingTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const updated = await res.json();
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      // Création
      const res = await fetch("http://127.0.0.1:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "todo" })
      });
      const created = await res.json();
      setTickets(prev => [...prev, created]);
    }
    
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5000/api/tickets/${id}`, { method: "DELETE" });
    setTickets(prev => prev.filter(t => t.id !== id));
    if (editingTicket && editingTicket.id === id) setShowModal(false);
  };

  const handleAI = async () => {
    if (!formData.title) return alert("Veuillez définir un titre pour analyser la requête.");
    setAiLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title })
      });
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        description: data.description,
        points: data.points,
        priority: data.priority
      }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6 font-sans text-gray-900">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col h-full">
        
        {/* Header Sober */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SmartBacklog</h1>
            <p className="text-gray-500 text-xs mt-1">Workspace / Project Alpha</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Issue
          </button>
        </header>

        {/* Board */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] items-start">
            <Column id="todo" title="To Do" tickets={tickets.filter(t => t.status === 'todo')} colorClass="border-gray-400" onDelete={handleDelete} onTicketClick={openEditModal} />
            <Column id="doing" title="In Progress" tickets={tickets.filter(t => t.status === 'doing')} colorClass="border-blue-500" onDelete={handleDelete} onTicketClick={openEditModal} />
            <Column id="done" title="Done" tickets={tickets.filter(t => t.status === 'done')} colorClass="border-green-500" onDelete={handleDelete} onTicketClick={openEditModal} />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-4 rounded-md shadow-xl border border-blue-400 w-[280px] rotate-2 opacity-95 cursor-grabbing">
                <h4 className="font-medium text-sm text-gray-800">{tickets.find(t => t.id === activeId)?.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal Standard (Edit / Create) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingTicket ? `Issue-${editingTicket.id}` : "Create New Issue"}
              </h2>
              <div className="flex items-center gap-2">
                {editingTicket && (
                  <button onClick={() => handleDelete(editingTicket.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                   <input 
                     type="text" 
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium transition-all"
                     value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                   />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Points</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    value={formData.points} onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                  >
                    {[1, 2, 3, 5, 8, 13, 21].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                  <button 
                    onClick={handleAI} disabled={aiLoading || !formData.title}
                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:grayscale"
                  >
                    {aiLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    ) : <Bot size={14} />}
                    {aiLoading ? "Generating..." : "Generate AI criteria"}
                  </button>
                </div>
                <textarea 
                  rows={10}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y font-mono leading-relaxed transition-all"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} disabled={!formData.title}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 shadow-sm transition-all active:scale-95"
              >
                {editingTicket ? "Save Changes" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
