import React from 'react';
import { ShieldCheck, MessageCircle, Bot, PlusCircle } from 'lucide-react';
import { call } from '../lib/api.js';
export default function PrivateMessages({
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
}) {
  if(user.role==='reviewer'&&selected.reviewer!==user.id||user.role==='consultant'&&selected.consultant!==user.id)return <div className="panel"><h2>Private messages</h2><p>Only the reporter and assigned staff can access this conversation. The reviewer must assign the case to you before you can use its private conversation.</p></div>;
  return <div className="panel"><h2><MessageCircle size={20} /> Private messages</h2><p className="fineprint">Only the reporter and assigned case staff can access this conversation. Do not enter real personal details in this demo.</p><div className="chat-log">{messages.length === 0 ? <p>{user?.role === 'reporter' && !selected.reviewer ? 'Messaging becomes available when a reviewer claims this report.' : 'No messages yet.'}</p> : messages.map(m => <div className={'bubble ' + (m.sender === user.id ? 'mine' : '')} key={m.id}><small>{m.sender === user.id ? 'You' : 'Case participant'}</small><p>{m.text}</p></div>)}</div><form onSubmit={sendMessage}><textarea aria-label="Private message" required minLength={2} maxLength={1000} placeholder="Write a fictional message..." value={message} onChange={e => G(e.target.value)} /><button disabled={busy || user?.role === 'reporter' && !selected.reviewer} className="purple">Send private message</button></form></div>;
}
