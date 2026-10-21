import React from 'react';
import { ShieldCheck, MessageCircle, Bot, PlusCircle } from 'lucide-react';
import { call } from '../lib/api.js';
const categories = ['Bullying', 'Harassment', 'Discrimination', 'Unfair Treatment', 'Other'];
export default function SubmitReport(props) {
  const {
    view,
    user,
    token,
    error,
    notice,
    busy,
    credentials,
    C,
    reportForm,
    F,
    reports,
    unassigned,
    users,
    consultants,
    selected,
    messages,
    message,
    G,
    note,
    H,
    newStaff,
    J,
    chat,
    prompt,
    P,
    navigate,
    run,
    refresh,
    authenticate,
    submit,
    openReport,
    sendMessage,
    updateReport,
    createStaff,
    askAI,
    logout,
    N
  } = props;
  return <section className="form-section"><h1>Submit a concern</h1><p>Only you and authorized staff assigned to your report can see its details. Use fictional information while testing.</p><form className="panel" onSubmit={submit}><label>Category<select value={reportForm.category} onChange={e => F({
          ...reportForm,
          category: e.target.value
        })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Describe your fictional report<textarea required minLength={20} maxLength={2000} rows={7} value={reportForm.description} onChange={e => F({
          ...reportForm,
          description: e.target.value
        })} placeholder="Use fictional details (at least 20 characters)..." /></label><button className="purple" disabled={busy}>Submit report</button></form></section>;
}
