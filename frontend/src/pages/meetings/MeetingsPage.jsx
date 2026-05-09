import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    meetingsApi.getAll().then(data => {
      const mine = data.filter(m => m.requesterId === user?.id || m.ownerId === user?.id);
      setMeetings(mine);
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
    if (selectedMeeting?.id === id) setSelectedMeeting(updated);
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

      <div className="meetings-page-layout">
        {/* Left: list */}
        <div className="meetings-list-col">
          {loading ? (
            <p style={{ color: 'var(--gray-500)', padding: 40 }}>Loading…</p>
          ) : meetings.length === 0 ? (
            <div className="meetings-empty">
              <span className="meetings-empty-icon">🤝</span>
              <p>No meeting requests yet.</p>
              <small>Browse posts and click "Express Interest" to get started.</small>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className="meetings-section">
                  <h2 className="meetings-section-title">🔔 Awaiting Your Response</h2>
                  <div className="meetings-list">
                    {pending.map(m => (
                      <MeetingCard
                        key={m.id} m={m} user={user}
                        isSelected={selectedMeeting?.id === m.id}
                        onClick={() => setSelectedMeeting(m)}
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
                      <MeetingCard
                        key={m.id} m={m} user={user}
                        isSelected={selectedMeeting?.id === m.id}
                        onClick={() => setSelectedMeeting(m)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedMeeting && (
          <div className="meetings-detail-panel">
            <MeetingDetail
              m={selectedMeeting}
              user={user}
              selectedSlot={selectedSlots[selectedMeeting.id] || ''}
              onSlotChange={(slot) => setSelectedSlots(prev => ({ ...prev, [selectedMeeting.id]: slot }))}
              onRespond={handleRespond}
              onClose={() => setSelectedMeeting(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingCard({ m, user, isSelected, onClick }) {
  const isOwner = m.ownerId === user?.id;
  const isPending = m.status === 'pending';

  return (
    <div
      className={`meeting-card status-${m.status}${isSelected ? ' meeting-card-selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="meeting-card-header">
        <div style={{ minWidth: 0, flex: 1 }}>
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
        </div>
        <span className={`status-badge ${m.status}`}>{STATUS_LABEL[m.status] || m.status}</span>
      </div>
      {m.proposedSlots?.length > 0 && (
        <div className="meeting-slots">
          <span className="slots-label">Slots:</span>
          <div className="slots-list">
            {m.proposedSlots.slice(0, 2).map((slot, i) => (
              <span key={i} className="slot-tag">{formatDateTime(slot)}</span>
            ))}
            {m.proposedSlots.length > 2 && (
              <span className="slot-tag">+{m.proposedSlots.length - 2} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingDetail({ m, user, selectedSlot, onSlotChange, onRespond, onClose }) {
  const isOwner = m.ownerId === user?.id;
  const isPending = m.status === 'pending';

  return (
    <div className="meeting-detail-card">
      <div className="meeting-detail-header">
        <h3 className="meeting-detail-title">Meeting Details</h3>
        <button className="meeting-detail-close" onClick={onClose}>✕</button>
      </div>

      {/* Post link */}
      <div className="meeting-detail-section">
        <span className="meeting-detail-label">Post</span>
        {m.postId
          ? <Link to={`/posts/${m.postId}`} className="meeting-detail-post-link">{m.postTitle}</Link>
          : <span className="meeting-detail-value">{m.postTitle}</span>
        }
      </div>

      {/* Requester */}
      <div className="meeting-detail-section">
        <span className="meeting-detail-label">Requester</span>
        <div className="meeting-detail-person">
          <strong>{m.requesterName}</strong>
          {m.requesterEmail && (
            <a href={`mailto:${m.requesterEmail}`} className="meeting-email-link">
              ✉️ {m.requesterEmail}
            </a>
          )}
        </div>
      </div>

      {/* Owner */}
      <div className="meeting-detail-section">
        <span className="meeting-detail-label">Post Owner</span>
        <div className="meeting-detail-person">
          <strong>{m.ownerName}</strong>
          {m.ownerEmail && (
            <a href={`mailto:${m.ownerEmail}`} className="meeting-email-link">
              ✉️ {m.ownerEmail}
            </a>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="meeting-detail-section">
        <span className="meeting-detail-label">Status</span>
        <span className={`status-badge ${m.status}`}>{STATUS_LABEL[m.status] || m.status}</span>
      </div>

      {/* Message */}
      {m.message && (
        <div className="meeting-detail-section">
          <span className="meeting-detail-label">Message</span>
          <div className="meeting-message">"{m.message}"</div>
        </div>
      )}

      {/* Proposed slots */}
      {m.proposedSlots?.length > 0 && (
        <div className="meeting-detail-section">
          <span className="meeting-detail-label">Proposed Slots</span>
          <div className="slots-list" style={{ marginTop: 6 }}>
            {m.proposedSlots.map((slot, i) => (
              <span key={i} className="slot-tag">{formatDateTime(slot)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed slot */}
      {m.confirmedSlot && (
        <div className="meeting-detail-section">
          <span className="meeting-detail-label">Confirmed Slot</span>
          <div className="meeting-confirmed">{formatDateTime(m.confirmedSlot)}</div>
        </div>
      )}

      {/* Owner actions */}
      {isOwner && isPending && (
        <>
          <div className="meeting-slot-picker" style={{ marginTop: 12 }}>
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
          <div className="meeting-actions" style={{ marginTop: 12 }}>
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
        </>
      )}
    </div>
  );
}
