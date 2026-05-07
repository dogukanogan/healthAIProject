import { Link } from 'react-router-dom';
import './PostCard.css';

const STATUS_LABELS = {
  draft:             'Draft',
  active:            'Active',
  meeting_scheduled: 'Meeting Scheduled',
  closed:            'Partner Found',
  expired:           'Expired',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PostCard({ post }) {
  const days = daysUntil(post.expiryDate);
  const expiryLabel = days === null ? null
    : days <= 0   ? 'Expired'
    : days <= 7   ? `⚠️ ${days}d left`
    : `${days}d left`;
  const expiryUrgent = days !== null && days <= 7;

  return (
    <div className="post-card">
      <div className="post-card-header">
        <span className={`badge badge-${post.status}`}>{STATUS_LABELS[post.status]}</span>
        <span className="post-card-domain">{post.domain}</span>
      </div>

      <h3 className="post-card-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>

      <p className="post-card-desc">{post.description}</p>

      <div className="post-card-meta">
        <span>🎯 {post.expertiseRequired}</span>
        <span>📍 {post.city}{post.country ? `, ${post.country}` : ''}</span>
        <span>🔬 {post.projectStage?.replace(/_/g, ' ')}</span>
        {post.commitmentLevel && <span>⏱ {post.commitmentLevel}</span>}
      </div>

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
