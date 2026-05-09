import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { meetingsApi } from '../../services';
import { formatDateTime } from '../../utils/dateUtils';
import './Meetings.css';

const STATUS_LABEL = { pending:'Pending', accepted:'Accepted', declined:'Declined', scheduled:'Scheduled', completed:'Completed', cancelled:'Cancelled' };

export default function MeetingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    meetingsApi.getAll().then(data => {
      const found = data.find(m => String(m.id) === String(id));
      if (!found) { navigate('/meetings'); return; }
      setMeeting(found);
      setLoading(false);
    });
  }, [id]);

  const handleRespond = async (action) => {
    if (action === 'accepted' && !selectedSlot) { alert('Please select a time slot.'); return; }
    const updated = await meetingsApi.respond(meeting.id, action, selectedSlot);
    setMeeting(updated);
  };

  if (loading) return <div className="page-container"><p style={{color:'var(--gray-500)',padding:40}}>Loading…</p></div>;
  if (!meeting) return null;

  const isOwner = meeting.ownerId === user?.id;
  const isPending = meeting.status === 'pending';

  return (
    <div className="page-container">
      <div className="post-detail-back">
        <Link to="/meetings">← Back to Meetings</Link>
      </div>
      <div className="meeting-detail-page-card">
        <div className="meeting-detail-page-header">
          <h1 className="meeting-detail-page-title">{meeting.postTitle}</h1>
          <span className={`status-badge ${meeting.status}`}>{STATUS_LABEL[meeting.status]}</span>
        </div>

        <div className="meeting-detail-grid">
          <div className="meeting-detail-section">
            <span className="meeting-detail-label">Post</span>
            {meeting.postId
              ? <Link to={`/posts/${meeting.postId}`} className="meeting-detail-post-link">View Post →</Link>
              : <span>{meeting.postTitle}</span>}
          </div>
          <div className="meeting-detail-section">
            <span className="meeting-detail-label">Requester</span>
            <div className="meeting-detail-person">
              <strong>{meeting.requesterName}</strong>
              {meeting.requesterEmail && <a href={`mailto:${meeting.requesterEmail}`} className="meeting-email-link">✉️ {meeting.requesterEmail}</a>}
            </div>
          </div>
          <div className="meeting-detail-section">
            <span className="meeting-detail-label">Post Owner</span>
            <div className="meeting-detail-person">
              <strong>{meeting.ownerName}</strong>
              {meeting.ownerEmail && <a href={`mailto:${meeting.ownerEmail}`} className="meeting-email-link">✉️ {meeting.ownerEmail}</a>}
            </div>
          </div>
          {meeting.message && (
            <div className="meeting-detail-section" style={{gridColumn:'1/-1'}}>
              <span className="meeting-detail-label">Message</span>
              <div className="meeting-message" style={{marginTop:6}}>"{meeting.message}"</div>
            </div>
          )}
        </div>

        <div className="meeting-detail-section" style={{marginTop:20}}>
          <span className="meeting-detail-label">Proposed Time Slots</span>
          <div className="slots-list" style={{marginTop:8}}>
            {meeting.proposedSlots?.map((slot, i) => {
              const [datePart, timePart] = slot.split(' ');
              return (
                <div key={i} className="slot-tag" style={{display:'flex',flexDirection:'column',gap:2,padding:'8px 14px'}}>
                  <span style={{fontSize:10,opacity:0.6,fontWeight:700,textTransform:'uppercase'}}>Date</span>
                  <span>{datePart ? datePart.split('-').reverse().join('/') : '—'}</span>
                  <span style={{fontSize:10,opacity:0.6,fontWeight:700,textTransform:'uppercase',marginTop:2}}>Time</span>
                  <span>{timePart || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {meeting.confirmedSlot && (
          <div className="meeting-confirmed" style={{marginTop:16}}>
            Confirmed — <strong>{formatDateTime(meeting.confirmedSlot)}</strong>
          </div>
        )}

        {isOwner && isPending && (
          <div className="meeting-slot-picker" style={{marginTop:20}}>
            <label className="slot-picker-label">Select a slot to confirm:</label>
            <div className="slot-picker-options">
              {meeting.proposedSlots?.map((slot, i) => (
                <button key={i} className={`slot-picker-btn ${selectedSlot === slot ? 'selected' : ''}`} onClick={() => setSelectedSlot(slot)}>
                  {formatDateTime(slot)}
                </button>
              ))}
            </div>
            <div className="meeting-actions" style={{marginTop:14}}>
              <button className="btn btn-success btn-sm" onClick={() => handleRespond('accepted')} disabled={!selectedSlot}>✓ Accept</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleRespond('declined')}>✕ Decline</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
