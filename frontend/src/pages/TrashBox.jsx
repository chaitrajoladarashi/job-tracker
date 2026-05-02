import React, { useState, useEffect } from 'react';
import { RefreshCcw, Trash, Calendar } from 'lucide-react';
import axios from 'axios';

const STATUS_STYLES = {
  Pending:    'bg-amber-500/20 text-amber-500 border-amber-500/30',
  Assessment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Interview:  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Rejected:   'bg-red-500/20 text-red-400 border-red-500/30',
  Selected:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function TrashBox() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    try {
      const { data } = await axios.get('/api/jobs/trash');
      setItems(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDeleted(); }, []);

  const restore = async (id) => {
    try { await axios.put(`/api/jobs/${id}/restore`); fetchDeleted(); }
    catch(e) { console.error(e); }
  };

  const hardDelete = async (id) => {
    try { await axios.delete(`/api/jobs/${id}/hard`); fetchDeleted(); }
    catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Trash size={20} className="text-muted-foreground" /> Trash Box
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Deleted applications — restore or permanently remove them.</p>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass-panel py-16 text-center">
            <Trash size={32} className="text-muted-foreground opacity-30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Trash is empty.</p>
          </div>
        ) : items.map((app, i) => (
          <div key={app._id} className="glass-panel p-4 rounded-2xl opacity-80">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{app.company}</p>
                {app.role && <p className="text-xs text-muted-foreground truncate">{app.role}</p>}
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[app.status]}`}>
                {app.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={11} />
                {new Date(app.dateApplied).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                <button onClick={() => restore(app._id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Restore">
                  <RefreshCcw size={14}/>
                </button>
                <button onClick={() => hardDelete(app._id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete permanently">
                  <Trash size={14}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table ── */}
      <div className="glass-panel overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date Applied</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-10 text-center text-muted-foreground text-xs">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <Trash size={32} className="text-muted-foreground opacity-30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Trash is empty.</p>
                  </td>
                </tr>
              ) : items.map((app, i) => (
                <tr key={app._id} className="opacity-70 hover:opacity-100 transition-opacity">
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{i+1}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{app.company}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.role || '—'}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{new Date(app.dateApplied).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button onClick={() => restore(app._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all mr-1" title="Restore">
                      <RefreshCcw size={14}/>
                    </button>
                    <button onClick={() => hardDelete(app._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete permanently">
                      <Trash size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
