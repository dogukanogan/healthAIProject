import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../services';
import PostCard from '../../components/common/PostCard';
import FilterBar from '../../components/common/FilterBar';
import './PostList.css';

const EMPTY_FILTERS = { domain: '', city: '', expertise: '', stage: '', status: '' };

// D: Parse expertise field into individual tags
function parseExpertiseTags(posts) {
  const freq = {};
  posts.forEach(p => {
    if (!p.expertiseRequired) return;
    // Split by common delimiters: / , ; and trim
    p.expertiseRequired
      .split(/[/,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 2 && t.length < 40)
      .forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));
}

export default function PostListPage() {
  const [posts, setPosts]     = useState([]);
  const [allPosts, setAllPosts] = useState([]);   // full list for tag calc
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  // Fetch all posts once for trending tags
  useEffect(() => {
    postsApi.getAll({}).then(setAllPosts).catch(() => {});
  }, []);

  const fetchPosts = async (f) => {
    setLoading(true);
    const data = await postsApi.getAll(f);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(filters); }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPosts(newFilters);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    fetchPosts(EMPTY_FILTERS);
  };

  const handleTagClick = (tag) => {
    const newFilters = { ...EMPTY_FILTERS, expertise: tag };
    setFilters(newFilters);
    fetchPosts(newFilters);
  };

  // D: Compute trending tags from all posts
  const trendingTags = useMemo(() => parseExpertiseTags(allPosts), [allPosts]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Browse Posts</h1>
        <Link to="/posts/new" className="btn btn-primary">+ New Post</Link>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} onClear={handleClear} />

      {/* D: Trending Expertise Tags */}
      {trendingTags.length > 0 && (
        <div className="trending-section">
          <span className="trending-label">🔥 Trending expertise</span>
          <div className="trending-tags">
            {trendingTags.map(({ tag, count }) => (
              <button
                key={tag}
                className={`trending-tag${filters.expertise === tag ? ' active' : ''}`}
                onClick={() => filters.expertise === tag ? handleClear() : handleTagClick(tag)}
              >
                {tag}
                <span className="trending-tag-count">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="skeleton-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line short" style={{marginBottom:'18px'}} />
              <div className="skeleton-line wide" />
              <div className="skeleton-line mid" />
              <div className="skeleton-line tall" style={{marginTop:'12px'}} />
              <div className="skeleton-line short" style={{marginTop:'16px'}} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p>No posts match your filters.</p>
          <p className="empty-state-sub">Try adjusting or clearing the filters above.</p>
          <button className="btn btn-primary" onClick={handleClear}>Clear Filters</button>
        </div>
      ) : (
        <>
          <p className="results-count">
            <span>{posts.length}</span>
            {' '}post{posts.length !== 1 ? 's' : ''} found
          </p>
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
