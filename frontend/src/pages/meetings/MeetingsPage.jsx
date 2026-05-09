import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { meetingsApi } from '../../services';
import { formatDateTime } from '../../utils/dateUtils';
import './Meetings.css';

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({}); // meetingId → slot

  useEffect(() => {
    meetingsApi.getAll().then(data => {
      setMeetings(data.filter(m => m.requesterId === user?.id || m.ownerId === user?.id));
      setLoading(false);
    });
  }, [user]);

  const handleRespond = async (id, action) => {
    const slot = selectedSlots[id] || '';
    if (action === 'accepted' && !slot) {
      alert('Please select a time slot to confirm.');
      return;
    }
    const updated = await meetingsApi.respond(id, action, slot);
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const pending = meetings.filter(m => m.ownerId === user?.id && m.status === 'pending');
  const others  = meetings.filter(m => !(m.ownerId === user?.id && m.status === 'pending'));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Meetings</h1>
        {pending.length > 0 && (
          <span className="meetings-pending-badge">
            {pending.length} pending
          </span>
        )}
      </div>

      {loading ? <p style={{ color: 'var(--gray-500)', padding: 40 }}>Loading…</p>
      : meetings.length === 0 ? (
        <div className="meetings-empty">
          <span className="meetings-empty-icon">🤝</span>
          <p>No meeting requests yet.</p>
          <small>Browse posts and click "Express Interest" to get started.</small>
        </div>
      ) : (
        <>
          {/* Pending requests first */}
          {pending.length > 0 && (
            <div className="meetings-section">
              <h2 className="meetings-section-title">🔔 Awaiting Your Response</h2>
              <div className="meetings-list">
                {pending.map(m => (
                  <MeetingCard
                    key={m.id} m={m} user={user}
                    selectedSlot={selectedSlots[m.id] || ''}
                    onSlotChange={(slot) => setSelectedSlots(prev => ({ ...prev, [m.id]: slot }))}
                    onRespond={handleRespond}
                  />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="meetings-section">
              {pending.length > 0 && <h2 className="meetings-section-title">📋 All Meetings</h2>}
              <div className="meetings-list">
                {others.map(m => (
                  <MeetingCard key={m.id} m={m} user={user} onRespond={handleRespond} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MeetingCard({ m, user, selectedSlot, onSlotChange, onRespond }) {
  const isOwner  = m.ownerId === user?.id;
  const isPending = m.status === 'pending';

  return (
    <div className={`meeting-card status-${m.status}`}>
      <div className="meeting-card-header">
        <div>
          <h3 className="meeting-post-title">{m.postTitle}</h3>
          <p className="meeting-parties">
            <strong>{m.requesterName}</strong>
            <span className="parties-arrow">→</span>
            <strong>{m.ownerName}</strong>
            {isOwner && isPending && (
              <span className="meeting-role-tag">You received this</span>
            )}
            {!isOwner && (
              <span className="meeting-role-tag sent">You sent this</span>
            )}
          </p>
          {/* Show contact email */}
          {m.requesterEmail && !isOwner && (
            <a href={`mailto:${m.requesterEmail}`} className="meeting-email-link">
              ✉️ {m.requesterEmail}
            </a>
          )}
          {m.ownerEmail && isOwner && (
            <a href={`mailto:${m.ownerEmail}`} className="meeting-email-link">
              ✉️ {m.ownerEmail}
            </a>
          )}
        </div>
        <span className={`status-badge ${m.status}`}>{STATUS_LABEL[m.status] || m.status}</span>
      </div>

      {m.message && (
        <div className="meeting-message">"{m.message}"</div>
      )}

      {/* Proposed slots */}
      <div className="meeting-slots">
        <span className="slots-label">Proposed slots:</span>
        <div className="slots-list">
          {m.proposedSlots?.map((slot, i) => (
            <span key={i} className="slot-tag">{formatDateTime(slot)}</span>
          ))}
        </div>
      </div>

      {/* Owner picks a slot to confirm */}
      {isOwner && isPending && (
        <div className="meeting-slot-picker">
          <label className="slot-picker-label">Select a slot to confirm:</label>
          <div className="slot-picker-options">
            {m.proposedSlots?.map((slot, i) => (
              <button
                key={i}
                className={`slot-picker-btn ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => onSlotChange && onSlotChange(slot)}
              >
                {formatDateTime(slot)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed slot */}
      {m.confirmedSlot && (
        <div className="meeting-confirmed">
          Confirmed: <strong>{formatDateTime(m.confirmedSlot)}</strong>
        </div>
      )}

      {/* Actions */}
      {isOwner && isPending && (
        <div className="meeting-actions">
          <button
            className="btn btn-success btn-sm"
            onClick={() => onRespond(m.id, 'accepted')}
            disabled={!selectedSlot}
          >
            ✓ Accept
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onRespond(m.id, 'declined')}>
            ✕ Decline
          </button>
        </div>
      )}
    </div>
  );
}
