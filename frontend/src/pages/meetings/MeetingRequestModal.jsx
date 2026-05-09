import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { meetingsApi } from '../../services';
import './MeetingRequestModal.css';

export default function MeetingRequestModal({ post, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast     = useToast();
  const [step, setStep]       = useState(1);
  const [message, setMessage] = useState('');
  const [ndaAccepted, setNda] = useState(false);
  const [slots, setSlots]     = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const handleSlotChange = (i, val) => {
    const updated = [...slots];
    updated[i] = val;
    setSlots(updated);
  };

  const addSlot = () => setSlots(s => [...s, '']);
  const removeSlot = (i) => {
    if (slots.length <= 2) return;
    setSlots(s => s.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    const filled = slots.filter(Boolean);
    if (filled.length < 2) {
      toast.warning('Please propose at least 2 time slots.');
      return;
    }
    setLoading(true);
    try {
      await meetingsApi.create({
        postId: post.id,
        postTitle: post.title,
        requesterId: user.id,
        requesterName: user.name,
        ownerId: post.userId,
        ownerName: post.authorName,
        message,
        ndaAccepted,
        proposedSlots: filled,
      });
      toast.success('Meeting request sent!');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2>Request Meeting</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-steps">
          {[1,2,3].map(n => (
            <div key={n} className={`modal-step ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`}>
              <span className="step-num">{step > n ? '✓' : n}</span>
              <span>{n === 1 ? 'Message' : n === 2 ? 'NDA' : 'Time Slots'}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div>
              <p className="modal-subtitle">Introduce yourself and explain your interest in <strong>{post.title}</strong>.</p>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" rows={5}
                  placeholder="I am interested in collaborating because..."
                  value={message} onChange={e => setMessage(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="nda-section">
              <div className="nda-box">
                <h4>🔒 Non-Disclosure Agreement</h4>
                <p>By proceeding, you agree that any information shared during or after this meeting is confidential and may not be disclosed to third parties without prior written consent. All intellectual property shared remains the property of the original owner.</p>
              </div>
              <label className="nda-check">
                <input type="checkbox" checked={ndaAccepted} onChange={e => setNda(e.target.checked)} />
                I have read and agree to the NDA terms above
              </label>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="modal-subtitle">
                Propose at least <strong>2 time slots</strong>. The post owner will confirm one.
              </p>
              {slots.map((slot, i) => (
                <div className="slot-input-row" key={i}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>
                      Slot {i + 1}
                      {i < 2 && <span className="required"> *</span>}
                    </label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={slot}
                      onChange={e => handleSlotChange(i, e.target.value)}
                    />
                  </div>
                  {slots.length > 2 && (
                    <button className="slot-remove-btn" onClick={() => removeSlot(i)} title="Remove slot">✕</button>
                  )}
                </div>
              ))}
              <button className="slot-add-btn" onClick={addSlot}>
                + Add another time slot
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>}
          {step < 3 && (
            <button className="btn btn-primary" onClick={() => {
              if (step === 2 && !ndaAccepted) { toast.warning('You must accept the NDA to continue.'); return; }
              setStep(s => s + 1);
            }}>Next →</button>
          )}
          {step === 3 && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending…' : 'Send Request 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
