import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/buttons/buttons';
import Navbar from '../components/NavBar/navBar';
import './Search.css';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import PostModal from '../components/PostModel/PostModel';
import PostCard from '../components/PostCard/PostCard';

const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://api.momento.lifestyle');


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const [searchCategory, setCategory] = useState('All');
  // State for infinite scrolling
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const query = useQuery();
  const searchParam = query.get('q');
  const navigate = useNavigate();
  
  // 获取当前用户信息
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          try {
              const tokenData = JSON.parse(atob(token.split('.')[1]));
              setCurrentUser({ userId: tokenData.userId, username: tokenData.username });
          } catch (e) {
              console.error('Error parsing token:', e);
          }
      }
  }, []);

  const fetchResults = async (pageNumber = 1, isNewSearch = false) => {
    if (!searchParam) return;
    setIsLoading(true);

    try {
      console.log(`${API_BASE}/api/search?q=${encodeURIComponent(searchParam)}&type=${searchCategory.toLowerCase()}&page=${pageNumber}`);
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchParam)}&type=${searchCategory.toLowerCase()}&page=${pageNumber}`);
      const data = await res.json();
      console.log(`data received: `);

      const items = data.results.posts || [];

      if (isNewSearch) {
        setResults(items);
      } else {
        setResults(prev => [...prev, ...items]);
      }

      setHasMore(items.length >= 10);
      setPage(pageNumber);
    } catch (error) {
      console.error('Search API error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParam) {
      fetchResults(1, true);
    }
  }, [searchParam]);

  useEffect(() => {
    fetchResults(1, true);
  }, [searchCategory]);

  const loadMoreResults = useCallback(async () => {
    if (isLoading || !hasMore) return;
    fetchResults(page + 1);
  }, [isLoading, hasMore, page]);

  const categories = ['All', 'Users', 'Posts', 'Tags', 'Places'];

  const handleSearch = () => {
    console.log("search");
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleSearchCategory = (input) => {
    setCategory(input);
    setPage(1);
  }
  
  const handleLike = (id) => {
    alert(`Like Click: ${id}`);
  }

  const handleComment = (id) => {
    alert(`Comment Click: ${id}`);
  }

  const handleShare = (id) => {
    alert(`Share Click: ${id}`);
  }

  const handleFollow = (id) => {
    alert(`Followed`);
  }

  /**
     * Format date for display
     */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };


  return (
    <div className="search-page">
      <Navbar />
      <div className="search-main-container">
        {/* Search input with button 你加一个类似search-input的class */}
        <div className="search-input-container">
          {/* SideBar */}
          <div className="category-bar">
            {categories.map((cat) => (
              <div
              key={cat}
              className={`category-tab ${searchCategory === cat ? 'active' : ''}`}
              onClick={() => handleSearchCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
        {/* Content area for search results */}
        <div className="contents-containers">
          <div className="history-container">
            <div className="content-area">
            {/* Content will appear here after search */}
              <div className = "search-result-section">
                <InfiniteScroll
                  loadMore={loadMoreResults}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  loader={<div className="posts-loader">Loading more posts...</div>}
                  endMessage={<p className="posts-end-message">You've seen all posts</p>}
                >
                  <div className = "post-grid">
                      {results.map((post) => (
                          <PostCard
                              key={post._id || post.id}
                              postData={post}
                              currentUser={currentUser}
                              onFollow={handleFollow}
                              onClick={() => handlePostClick(post)}
                          />
                      ))}
                  </div>
                        
                  {/* Show message when no posts are found */}
                  {!isLoading && results.length === 0 && !error && (
                      <div className="no-posts-message">
                          <h3>No posts found</h3>
                          <p>Try adjusting your filters or search query.</p>
                      </div>
                  )}
                </InfiniteScroll>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default SearchPage;
