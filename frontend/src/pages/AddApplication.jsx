import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const inputCls = "form-input";

export default function AddApplication() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    company: '', role: '', dateApplied: new Date().toISOString().split('T')[0],
    source: '', referralName: '', status: 'Pending', notes: '', assessmentDate: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const { data } = await axios.get('/api/jobs');
        const job = data.find(j => j._id === id);
        if (job) {
          setForm({
            company: job.company || '', role: job.role || '',
            dateApplied: job.dateApplied ? new Date(job.dateApplied).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            source: job.source || '', referralName: job.referralName || '',
            status: job.status || 'Pending', notes: job.notes || '',
            assessmentDate: job.assessmentDate ? new Date(job.assessmentDate).toISOString().split('T')[0] : ''
          });
        }
      } catch(e) { console.error(e); }
    })();
  }, [id, isEditing]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `/api/jobs/${id}` : '/api/jobs';
      const method = isEditing ? 'put' : 'post';
      await axios[method](url, form);
      navigate('/applications');
    } catch(e) { console.error(e); alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  const showAssessmentDate = form.status === 'Assessment' || form.status === 'Interview';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {isEditing ? 'Edit Application' : 'Add Application'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? 'Update the details of this job application.' : 'Store a new job application to track.'}
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Company + Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company *</label>
              <input required name="company" value={form.company} onChange={handleChange} className={inputCls} placeholder="e.g. Google" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
              <input name="role" value={form.role} onChange={handleChange} className={inputCls} placeholder="e.g. Software Engineer" />
            </div>
          </div>

          {/* Date + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Applied *</label>
              <input required type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {['Pending','Assessment','Interview','Selected','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Assessment date — shown when status is Assessment or Interview */}
          {showAssessmentDate && (
            <div className="space-y-1.5 p-4 rounded-xl border border-primary/25" style={{ background: 'color-mix(in srgb, var(--primary) 6%, transparent)' }}>
              <label className="text-xs font-semibold text-primary uppercase tracking-wider">
                📅 {form.status} Date — When is it scheduled?
              </label>
              <input type="date" name="assessmentDate" value={form.assessmentDate} onChange={handleChange} className={inputCls} />
            </div>
          )}

          {/* Source + Referral */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Website</label>
              <input name="source" value={form.source} onChange={handleChange} className={inputCls} placeholder="LinkedIn, Naukri, Company site…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referral Name</label>
              <input name="referralName" value={form.referralName} onChange={handleChange} className={inputCls} placeholder="Optional" />
            </div>
          </div>



          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              className={inputCls + ' resize-none'} placeholder="Any additional details…" />
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : isEditing ? 'Update Application' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
