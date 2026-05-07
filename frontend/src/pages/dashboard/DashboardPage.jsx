import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../services';
import PostCard from '../../components/common/PostCard';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts]   = useState([]);
  const [stats, setStats]               = useState({ active: 0, total: 0, myPosts: 0 });
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      postsApi.getAll({ status: 'active' }),
      postsApi.getAll({}),
    ]).then(([activePosts, allPosts]) => {
      const myPosts = allPosts.filter(p => p.userId === user?.id).length;
      setStats({ active: activePosts.length, total: allPosts.length, myPosts });
      setRecentPosts(activePosts.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="page-container">
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Discover healthcare–engineering collaboration opportunities or share your own project.</p>
          <div className="dashboard-hero-actions">
            <Link to="/posts/new" className="btn btn-primary btn-lg">+ New Post</Link>
            <Link to="/posts"     className="btn btn-secondary btn-lg">Browse Posts</Link>
          </div>
        </div>
        <div className="dashboard-hero-stats">
          <div className="stat-card">
            <span className="stat-number">{loading ? '—' : stats.active}</span>
            <span className="stat-label">Active Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{loading ? '—' : stats.myPosts}</span>
            <span className="stat-label">My Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{loading ? '—' : stats.total}</span>
            <span className="stat-label">Total Posts</span>
          </div>
        </div>
      </div>

      <div className={`role-banner role-banner-${user?.role}`}>
        <span className="role-banner-icon">
          {user?.role === 'engineer' ? '⚙️' : user?.role === 'healthcare' ? '🏥' : '🛡️'}
        </span>
        <div>
          <strong>{user?.role === 'engineer' ? 'Engineer' : user?.role === 'healthcare' ? 'Healthcare Professional' : 'Administrator'}</strong>
          <span> — {user?.email}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Recent Active Posts</h2>
          <Link to="/posts" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {loading ? (
          <p className="loading-text">Loading posts...</p>
        ) : (
          <div className="posts-grid">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
