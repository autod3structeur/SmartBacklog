import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
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
  FileSearch,
  Eye,
  Edit3
} from "lucide-react";

const API = "http://127.0.0.1:5000";

// --- TICKET COMPONENT ---
function SortableTicket({ ticket, onDelete, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
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
        ticket.priority === 'urgent' ? 'border-l-4 border-l-red-500' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} {...listeners} 
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 p-1 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
          <h4 className="font-medium text-gray-800 text-sm line-clamp-1 -ml-2 group-hover:ml-0 transition-all">{ticket.title}</h4>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-[10px] font-bold bg-gray-50 px-2 py-0.5 rounded text-gray-500 border border-gray-100">
          SP: {ticket.points || 1}
        </span>
        {ticket.priority === 'urgent' && (
          <span className="text-[10px] text-red-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
            <AlertTriangle size={10} /> Urgent
          </span>
        )}
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT ---
function Column({ id, title, tickets, colorClass, onDelete, onTicketClick }) {
  const { setNodeRef } = useDroppable({ id, data: { type: 'Column', status: id } });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[280px] flex flex-col bg-gray-100/50 rounded-lg p-3 h-full border border-gray-200">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${colorClass}`}>
        <h2 className="font-bold text-[11px] uppercase tracking-widest text-gray-500">{title}</h2>
        <span className="text-[10px] font-mono text-gray-400 font-bold">{tickets.length}</span>
      </div>
      
      <SortableContext id={id} items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {tickets.map(t => <SortableTicket key={t.id} ticket={t} onDelete={onDelete} onClick={onTicketClick} />)}
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
  const [editingTicket, setEditingTicket] = useState(null); 
  const [modalTab, setModalTab] = useState("write"); // "write" or "preview"
  const [formData, setFormData] = useState({ title: "", description: "", points: 1, priority: "normal" });
  const [aiLoading, setAiLoading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetch(`${API}/api/tickets`).then(res => res.json()).then(setTickets);
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTicket = tickets.find(t => t.id === active.id);
    const overColumnId = over.data.current?.status || (tickets.find(t => t.id === over.id)?.status);

    if (activeTicket && overColumnId && activeTicket.status !== overColumnId) {
      setTickets(prev => prev.map(t => t.id === active.id ? { ...t, status: overColumnId } : t));
      await fetch(`${API}/api/tickets/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: overColumnId })
      });
    }
  };

  const openCreateModal = () => {
    setEditingTicket(null);
    setModalTab("write");
    setFormData({ title: "", description: "", points: 1, priority: "normal" });
    setShowModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setModalTab("preview"); // Par défaut on affiche le rendu Markdown en édition
    setFormData({ title: ticket.title, description: ticket.description || "", points: ticket.points || 1, priority: ticket.priority || "normal" });
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editingTicket ? "PATCH" : "POST";
    const url = editingTicket ? `${API}/api/tickets/${editingTicket.id}` : `${API}/api/tickets`;
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTicket ? formData : { ...formData, status: "todo" })
    });
    const result = await res.json();
    
    if (editingTicket) setTickets(prev => prev.map(t => t.id === result.id ? result : t));
    else setTickets(prev => [...prev, result]);
    
    setShowModal(false);
  };

  const handleAI = async () => {
    if (!formData.title) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title })
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, description: data.description, points: data.points, priority: data.priority }));
      setModalTab("preview"); // On montre direct le résultat Markdown
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans text-slate-900">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col h-full">
        
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-lg">S</div>
            <h1 className="text-xl font-bold text-slate-800">SmartBacklog</h1>
          </div>
          <button onClick={openCreateModal} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-semibold text-xs transition-all shadow-sm active:scale-95">
            + NEW ISSUE
          </button>
        </header>

        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id)}>
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] items-start">
            <Column id="todo" title="To Do" tickets={tickets.filter(t => t.status === 'todo')} colorClass="border-slate-300" onDelete={(id) => { fetch(`${API}/api/tickets/${id}`, {method:"DELETE"}); setTickets(t => t.filter(x=>x.id!==id)) }} onTicketClick={openEditModal} />
            <Column id="doing" title="In Progress" tickets={tickets.filter(t => t.status === 'doing')} colorClass="border-blue-400" onDelete={(id) => { fetch(`${API}/api/tickets/${id}`, {method:"DELETE"}); setTickets(t => t.filter(x=>x.id!==id)) }} onTicketClick={openEditModal} />
            <Column id="done" title="Done" tickets={tickets.filter(t => t.status === 'done')} colorClass="border-emerald-400" onDelete={(id) => { fetch(`${API}/api/tickets/${id}`, {method:"DELETE"}); setTickets(t => t.filter(x=>x.id!==id)) }} onTicketClick={openEditModal} />
          </div>
          <DragOverlay>
            {activeId ? <div className="bg-white p-4 rounded border border-blue-400 w-[280px] shadow-2xl opacity-90"><h4 className="font-bold text-sm">{tickets.find(t=>t.id===activeId)?.title}</h4></div> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b">
              <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                {editingTicket ? `Issue-${editingTicket.id}` : "New Entry"}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex-1 min-w-[300px]">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Issue Title</label>
                   <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 outline-none font-semibold text-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Points</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded font-mono text-sm focus:border-blue-500 outline-none" value={formData.points} onChange={e => setFormData({...formData, points: Number(e.target.value)})}>
                    {[1, 2, 3, 5, 8, 13, 21].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Priority</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-blue-500 outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                  <div className="flex gap-4">
                    <button onClick={() => setModalTab("write")} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 pb-1 ${modalTab === 'write' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Edit3 size={12}/> Write
                    </button>
                    <button onClick={() => setModalTab("preview")} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 pb-1 ${modalTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Eye size={12}/> Preview
                    </button>
                  </div>
                  <button onClick={handleAI} disabled={aiLoading || !formData.title} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-blue-600 px-4 py-2 rounded-full transition-all disabled:opacity-30">
                    {aiLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <FileSearch size={14}/>}
                    Analyze & Document
                  </button>
                </div>

                {modalTab === "write" ? (
                  <textarea rows={12} className="w-full p-4 bg-slate-50 border border-slate-200 rounded font-mono text-sm focus:bg-white focus:border-blue-500 outline-none resize-none leading-relaxed" placeholder="Detailed technical specifications..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                ) : (
                  <div className="w-full p-4 bg-white border border-slate-100 rounded min-h-[280px] prose prose-slate prose-sm max-w-none">
                    <ReactMarkdown>{formData.description || "*No content to preview*"}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-lg">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
              <button onClick={handleSave} disabled={!formData.title} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md transition-all active:scale-95">
                {editingTicket ? "Update Issue" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
