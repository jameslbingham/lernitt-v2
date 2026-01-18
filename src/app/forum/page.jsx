// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';

export default function CommunityForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/forum/posts');
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Forum feed error");
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  if (loading) return <div className="loading">SYNCING_COMMUNITY_FEED...</div>;

  return (
    <div className="forum-wrapper">
      <header className="forum-header">
        <div>
          <h1>Community</h1>
          <p>Learn from tutors and students around the world.</p>
        </div>
        <button className="ask-btn" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Close" : "Ask a Question"}
        </button>
      </header>

      {showCreate && (
        <div className="create-post-box">
          <input placeholder="What is your question?" className="title-input" />
          <textarea placeholder="Add details..." className="content-area" />
          <button className="submit-btn">Post to Community</button>
        </div>
      )}

      <div className="post-list">
        {posts.map(post => (
          <article key={post._id} className="post-card">
            <div className="post-meta">
              <span className={`role-tag ${post.authorRole}`}>{post.authorRole}</span>
              <strong>{post.authorName}</strong>
              <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div className="post-footer">
              <span className="comment-count">💬 {post.commentCount} comments</span>
              <button className="reply-link">Write a reply</button>
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .forum-wrapper { max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; }
        .forum-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1.5px; }
        .ask-btn { background: #4f46e5; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; }
        
        .create-post-box { background: #f9f9f9; border: 3px solid #000; border-radius: 20px; padding: 20px; margin-bottom: 40px; }
        .title-input { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 10px; margin-bottom: 12px; font-weight: 700; }
        .content-area { width: 100%; height: 100px; padding: 12px; border: 2px solid #eee; border-radius: 10px; margin-bottom: 12px; resize: none; }
        .submit-btn { background: #000; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 900; cursor: pointer; }

        .post-card { background: #fff; border: 3px solid #000; border-radius: 24px; padding: 25px; margin-bottom: 20px; box-shadow: 8px 8px 0px 0px #000; }
        .post-meta { display: flex; gap: 10px; align-items: center; font-size: 12px; margin-bottom: 12px; }
        .role-tag { padding: 2px 8px; border-radius: 6px; font-weight: 900; text-transform: uppercase; font-size: 10px; border: 1.5px solid #000; }
        .tutor { background: #facc15; }
        .student { background: #eee; }
        
        h3 { margin: 0 0 10px; font-size: 20px; font-weight: 900; text-transform: uppercase; }
        p { color: #444; line-height: 1.5; margin-bottom: 20px; }
        
        .post-footer { display: flex; justify-content: space-between; border-top: 1px solid #eee; pt: 15px; }
        .comment-count { font-size: 12px; font-weight: 700; color: #888; }
        .reply-link { background: none; border: none; font-size: 12px; font-weight: 900; color: #4f46e5; cursor: pointer; text-transform: uppercase; }
        
        .loading { padding: 100px; text-align: center; font-weight: 900; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
