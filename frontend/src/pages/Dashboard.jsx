import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, Calendar, TrendingUp, FileText, Bell } from 'lucide-react';
import { differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';
import axios from 'axios';

const STATUS_STYLES = {
  Pending:    'bg-amber-500/20 text-amber-500 border-amber-500/30',
  Assessment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Interview:  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Rejected:   'bg-red-500/20 text-red-400 border-red-500/30',
  Selected:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/jobs');
        setAllJobs(data);
        const total    = data.length;
        const pending  = data.filter(j => j.status === 'Pending').length;
        const active_n = data.filter(j => ['Interview','Assessment'].includes(j.status)).length;
        const selected = data.filter(j => j.status === 'Selected').length;
        const rejected = data.filter(j => j.status === 'Rejected').length;

        setStats([
          { label: 'Total Applied',  value: total,                icon: Briefcase,    color: '#6366f1', filter: 'all',     sub: 'All time' },
          { label: 'Pending',        value: pending,              icon: Clock,        color: '#f59e0b', filter: 'pending', sub: 'Awaiting reply' },
          { label: 'Active',         value: active_n,             icon: Calendar,     color: '#8b5cf6', filter: 'active',  sub: 'Assessment / Interview' },
          { label: 'Selected',       value: `${selected}/${rejected}`, icon: CheckCircle, color: '#10b981', filter: 'decided', sub: `${total > 0 ? Math.round(selected/total*100) : 0}% success rate` },
        ]);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = !active ? [] :
    active === 'all'     ? allJobs :
    active === 'pending' ? allJobs.filter(j => j.status === 'Pending') :
    active === 'active'  ? allJobs.filter(j => ['Interview','Assessment'].includes(j.status)) :
                           allJobs.filter(j => ['Selected','Rejected'].includes(j.status));

  if (loading) return (
    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Overview of your job search journey.</p>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on large */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const isActive = active === s.filter;
          return (
            <div
              key={i}
              onClick={() => setActive(isActive ? null : s.filter)}
              className={`glass-panel p-4 md:p-5 cursor-pointer hover-lift transition-all duration-200 select-none ${isActive ? 'ring-2 ring-primary/60' : ''}`}
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${s.color}18` }}>
                  <Icon size={17} style={{ color: s.color }} />
                </div>
                {isActive && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-primary border-primary/40 bg-primary/10">Active</span>
                )}
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <TrendingUp size={11} style={{ color: s.color }} />{s.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filtered results */}
      {active && (
        <div>
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-3">
            {stats.find(s => s.filter === active)?.label} Applications
          </h3>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No applications in this category.</p>
            ) : filtered.map(app => (
              <div key={app._id} className="glass-panel p-4 rounded-2xl">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">{app.company}</p>
                    {app.role && <p className="text-xs text-muted-foreground">{app.role}</p>}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[app.status]}`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                  <span>{differenceInDays(new Date(), new Date(app.dateApplied))}d ago</span>
                </div>
                {app.assessmentDate && (app.status === 'Assessment' || app.status === 'Interview') && (
                  <p className="text-[11px] text-violet-400 mt-1.5">📅 {new Date(app.assessmentDate).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="glass-panel overflow-hidden hidden md:block">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-muted-foreground text-xs">No applications in this category.</td></tr>
                ) : filtered.map(app => (
                  <tr key={app._id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{app.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.role || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(app.dateApplied).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{differenceInDays(new Date(), new Date(app.dateApplied))}d</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[app.status]}`}>{app.status}</span>
                      {app.assessmentDate && (app.status==='Assessment'||app.status==='Interview') && (
                        <p className="text-[11px] text-violet-400 mt-0.5">📅 {new Date(app.assessmentDate).toLocaleDateString()}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
