import { Link } from 'react-router-dom';
import './PostCard.css';

const STATUS_LABELS = {
  draft:             'Draft',
  active:            'Active',
  meeting_scheduled: 'Meeting Scheduled',
  closed:            'Partner Found',
  expired:           'Expired',
};

// C: Project Stage Progress
const STAGE_CONFIG = {
  idea:               { pct: 10, label: 'Idea',             color: '#6366F1' },
  concept_validation: { pct: 32, label: 'Concept',          color: '#3B82F6' },
  prototype:          { pct: 56, label: 'Prototype',        color: '#0EA5E9' },
  pilot_testing:      { pct: 78, label: 'Pilot Testing',    color: '#10B981' },
  pre_deployment:     { pct: 95, label: 'Pre-Deployment',   color: '#34D399' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PostCard({ post }) {
  const days        = daysUntil(post.expiryDate);
  const expiryLabel = days === null ? null
    : days <= 0  ? 'Expired'
    : days <= 7  ? `⚠️ ${days}d left`
    : `${days}d left`;
  const expiryUrgent = days !== null && days <= 7;

  const stage = STAGE_CONFIG[post.projectStage];

  return (
    <div className="post-card">
      {/* Header: status badge + domain */}
      <div className="post-card-header">
        <span className={`badge badge-${post.status}`}>{STATUS_LABELS[post.status]}</span>
        <span className="post-card-domain">{post.domain}</span>
      </div>

      {/* Title */}
      <h3 className="post-card-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>

      {/* C: Stage progress bar */}
      {stage && (
        <div className="post-card-stage-wrap">
          <div className="post-card-stage-header">
            <span className="post-card-stage-label">
              <span className="post-card-stage-dot" style={{ background: stage.color }} />
              {stage.label}
            </span>
            <span className="post-card-stage-pct">{stage.pct}%</span>
          </div>
          <div className="post-card-stage-bar">
            <div
              className="post-card-stage-fill"
              style={{ width: `${stage.pct}%`, background: `linear-gradient(90deg, #2563EB, ${stage.color})` }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <p className="post-card-desc">{post.description}</p>

      {/* Meta */}
      <div className="post-card-meta">
        <span>🎯 {post.expertiseRequired}</span>
        <span>📍 {post.city}{post.country ? `, ${post.country}` : ''}</span>
        {post.commitmentLevel && <span>⏱ {post.commitmentLevel}</span>}
      </div>

      {/* Footer */}
      <div className="post-card-footer">
        <span className="post-card-author">
          {post.role === 'engineer' ? '⚙️' : '🏥'} {post.authorName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {expiryLabel && (
            <span className={`post-card-expiry${expiryUrgent ? ' urgent' : ''}`}>{expiryLabel}</span>
          )}
          <Link to={`/posts/${post.id}`} className="btn btn-ghost btn-sm">View →</Link>
        </div>
      </div>
    </div>
  );
}
