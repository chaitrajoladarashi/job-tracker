import React, { useState, useEffect } from 'react';
import { RefreshCcw, Clock, Check } from 'lucide-react';
import { differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';
import axios from 'axios';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [checked, setChecked]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('reminder_checked') || '{}'); }
    catch { return {}; }
  });
  const [now] = useState(new Date());

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/jobs');
      const list = data
        .filter(j => (j.status === 'Assessment' || j.status === 'Interview') && j.assessmentDate)
        .map(j => ({ ...j, _d: new Date(j.assessmentDate) }))
        .sort((a, b) => a._d - b._d);
      setReminders(list);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleChecked = (id) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    localStorage.setItem('reminder_checked', JSON.stringify(updated));
  };

  const getTimeLabel = (d) => {
    if (isPast(d) && !isToday(d)) return { text: 'Passed',   color: '#ef4444' };
    if (isToday(d))               return { text: 'Today',    color: '#f97316' };
    if (isTomorrow(d))            return { text: 'Tomorrow', color: '#eab308' };
    const n = differenceInDays(d, now);
    return { text: `In ${n} day${n !== 1 ? 's' : ''}`, color: 'var(--primary)' };
  };

  // Buckets removed: we show all reminders and let the Card style them

  const Card = ({ app, isDone = false }) => {
    const tl = getTimeLabel(app._d);
    const isInterview = app.status === 'Interview';

    return (
      <div
        className="rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-300 aspect-square"
        style={{
          background: isDone
            ? 'rgba(16,185,129,0.06)'
            : 'color-mix(in srgb, var(--secondary) 70%, transparent)',
          borderColor: isDone ? 'rgba(16,185,129,0.25)' : 'var(--border)',
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: isInterview ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'color-mix(in srgb, var(--secondary) 25%, transparent)',
              color:      isInterview ? 'var(--primary)' : 'var(--primary)',
            }}
          >
            {app.status}
          </span>
          <button
            onClick={() => toggleChecked(app._id)}
            title={isDone ? 'Move back to pending' : 'Mark as done'}
            className="w-4 h-4 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: isDone ? '#10b981' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
              borderColor:     isDone ? '#10b981' : 'var(--primary)',
            }}
          >
            {isDone && <Check size={11} strokeWidth={3.5} className="text-white" />}
          </button>
        </div>

        {/* Middle row: company & role */}
        <div className="mt-auto mb-2">
          <p className={`text-lg font-bold tracking-tight leading-snug ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {app.company}
          </p>
          {app.role && <p className="text-sm font-medium text-muted-foreground mt-0.5 line-clamp-1">{app.role}</p>}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {app._d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
          {!isDone && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${tl.color}18`, color: tl.color }}
            >
              {tl.text}
            </span>
          )}
          {isDone && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
              ✓ Attended
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reminders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your upcoming assessments &amp; interviews.</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Refresh"
        >
          <RefreshCcw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
      ) : reminders.length === 0 ? (
        <div className="glass-panel py-16 text-center">
          <Clock size={32} className="text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground mt-1">You have no upcoming assessments or interviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {reminders.map(app => <Card key={app._id} app={app} isDone={!!checked[app._id]} />)}
        </div>
      )}
    </div>
  );
}
