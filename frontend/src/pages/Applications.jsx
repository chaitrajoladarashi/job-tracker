import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Plus, Edit2, Building2, Briefcase, Calendar, Link2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import axios from 'axios';

const STATUS_STYLES = {
  Pending:    'bg-amber-500/20 text-amber-500 border-amber-500/30',
  Assessment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Interview:  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Rejected:   'bg-red-500/20 text-red-400 border-red-500/30',
  Selected:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const TH = ({ children }) => (
  <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{children}</th>
);

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/jobs');
      setApplications(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(`/api/jobs/${id}`, { status });
      fetchJobs();
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/jobs/${id}`);
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const handleAssessmentDateChange = async (id, assessmentDate) => {
    try {
      await axios.put(`/api/jobs/${id}`, { assessmentDate });
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Applications</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Track all your job applications in one place.</p>
        </div>
        <Link to="/add" className="btn-primary text-xs md:text-sm whitespace-nowrap">
          <Plus size={15} />
          <span className="hidden sm:inline">Add Application</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* ── Mobile Cards (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="glass-panel py-16 text-center">
            <p className="text-muted-foreground text-sm">No applications yet.</p>
            <Link to="/add" className="text-primary text-xs font-medium mt-1 inline-block hover:underline">Add your first one →</Link>
          </div>
        ) : applications.map((app, i) => (
          <div key={app._id} className="glass-panel p-4 rounded-2xl space-y-3">
            {/* Top row: company + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-foreground text-base leading-tight truncate">{app.company}</p>
                {app.role && <p className="text-sm text-muted-foreground mt-0.5 truncate">{app.role}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Link to={`/edit/${app._id}`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
                  <Edit2 size={14} />
                </Link>
                <button onClick={() => handleDelete(app._id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Move to Trash">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(app.dateApplied).toLocaleDateString()}
              </span>
              <span>{differenceInDays(new Date(), new Date(app.dateApplied))}d ago</span>
              {app.source && <span className="flex items-center gap-1"><Link2 size={11} />{app.source}</span>}
              {app.referralName && <span>Ref: {app.referralName}</span>}
            </div>

            {/* Status */}
            <div>
              {updatingId === app._id ? (
                <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
              ) : (
                <div className="flex flex-col gap-2">
                  <select
                    value={app.status}
                    onChange={e => handleStatusChange(app._id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border appearance-none cursor-pointer w-fit hover:opacity-80 transition-opacity ${STATUS_STYLES[app.status]}`}
                  >
                    {['Pending','Assessment','Interview','Selected','Rejected'].map(s => (
                      <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                    ))}
                  </select>
                  {(app.status === 'Assessment' || app.status === 'Interview') && (
                    <input
                      type="date"
                      defaultValue={app.assessmentDate ? new Date(app.assessmentDate).toISOString().split('T')[0] : ''}
                      onChange={e => handleAssessmentDateChange(app._id, e.target.value)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-primary/30 bg-primary/5 text-primary focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer w-full"
                      title="Schedule date"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            {app.notes && (
              <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 line-clamp-2">{app.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop Table (hidden on mobile) ── */}
      <div className="glass-panel overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <TH>#</TH>
                <TH>Company</TH>
                <TH>Role</TH>
                <TH>Date Applied</TH>
                <TH>Days Since</TH>
                <TH>Source</TH>
                <TH>Referral</TH>
                <TH>Progress</TH>
                <TH>Notes</TH>
                <TH></TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="10" className="px-4 py-10 text-center text-muted-foreground text-xs">Loading…</td></tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No applications yet.</p>
                    <Link to="/add" className="text-primary text-xs font-medium mt-1 inline-block hover:underline">Add your first one →</Link>
                  </td>
                </tr>
              ) : applications.map((app, i) => (
                <tr key={app._id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{i+1}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{app.company}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.role || '—'}</td>
                  <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{new Date(app.dateApplied).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{differenceInDays(new Date(), new Date(app.dateApplied))}d</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.source || '—'}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.referralName || '—'}</td>
                  <td className="px-4 py-3.5">
                    {updatingId === app._id ? (
                      <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 min-w-[110px]">
                        <select
                          value={app.status}
                          onChange={e => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border appearance-none cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[app.status]}`}
                        >
                          {['Pending','Assessment','Interview','Selected','Rejected'].map(s => (
                            <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                          ))}
                        </select>
                        {(app.status === 'Assessment' || app.status === 'Interview') && (
                          <input
                            type="date"
                            defaultValue={app.assessmentDate ? new Date(app.assessmentDate).toISOString().split('T')[0] : ''}
                            onChange={e => handleAssessmentDateChange(app._id, e.target.value)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-primary/30 bg-primary/5 text-primary focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer w-full"
                            title="Schedule date"
                          />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground max-w-[160px] truncate" title={app.notes}>{app.notes || '—'}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Link to={`/edit/${app._id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all inline-block mr-1" title="Edit">
                      <Edit2 size={14}/>
                    </Link>
                    <button onClick={() => handleDelete(app._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Move to Trash">
                      <Trash2 size={14}/>
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
