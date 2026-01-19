// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoRoomPage({ params }) {
  const containerRef = useRef(null);
  const callRef = useRef(null);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    async function joinLesson() {
      try {
        // Fetch secure token from our API Bridge [cite: 2026-01-10]
        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: params.id })
        });
        const data = await res.json();
        
        if (data.token) {
          // Initialize Daily Iframe
          const call = window.DailyIframe.createFrame(containerRef.current, {
            iframeStyle: { 
              width: '100%', 
              height: '100%', 
              border: 'none', 
              borderRadius: '24px' 
            },
            showLeaveButton: true,
          });
          
          callRef.current = call;
          await call.join({ url: data.roomUrl, token: data.token });
        }
      } catch (err) {
        console.error("Session initialization failed");
      } finally {
        setLoading(false);
      }
    }
    joinLesson();

    return () => {
      if (callRef.current) {
        callRef.current.leave();
        callRef.current.destroy();
      }
    };
  }, [params.id]);

  // italki-standard: Mutual recording logic
  const handleRecording = async () => {
    if (!isRecording) {
      await callRef.current.startRecording();
      setIsRecording(true);
    } else {
      await callRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  if (loading) return <div className="loader">ESTABLISHING_ENCRYPTED_LINK...</div>;

  return (
    <div className="room-wrapper">
      <aside className="lesson-sidebar">
        <div className="sidebar-branding">
          <h2>LERNITT</h2>
          <span>Classroom v2.0</span>
        </div>
        
        <div className="sidebar-tools">
          <button className={`tool-btn ${isRecording ? 'active' : ''}`} onClick={handleRecording}>
            {isRecording ? "🔴 STOP RECORDING" : "⏺ START RECORDING"}
          </button>
          <button className="tool-btn danger" onClick={() => router.push('/my-lessons')}>
            EXIT LESSON
          </button>
        </div>

        <div className="chat-notice">
          <p>The integrated chat history will be saved to your Notebook after the session.</p>
        </div>
      </aside>

      <main className="call-viewport">
        <div ref={containerRef} className="iframe-box" />
      </main>

      <style jsx>{`
        .room-wrapper { display: flex; height: 100vh; background: #0a0a0a; padding: 20px; gap: 20px; font-family: system-ui, sans-serif; }
        
        .lesson-sidebar { width: 280px; background: #181818; border-radius: 24px; padding: 30px; border: 3px solid #222; color: #fff; display: flex; flex-direction: column; }
        .sidebar-branding h2 { font-weight: 900; margin: 0; letter-spacing: -1.5px; }
        .sidebar-branding span { font-size: 10px; font-weight: 800; color: #555; text-transform: uppercase; }
        
        .sidebar-tools { flex: 1; display: flex; flex-direction: column; gap: 12px; margin-top: 40px; }
        .tool-btn { background: #222; color: #fff; border: 2px solid #333; padding: 15px; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 11px; transition: 0.2s; }
        .tool-btn.active { background: #ef4444; border-color: #ef4444; }
        .tool-btn.danger { background: #333; border-color: #444; margin-top: auto; }
        .tool-btn:hover { transform: translateY(-2px); }

        .call-viewport { flex: 1; border-radius: 24px; overflow: hidden; background: #000; border: 3px solid #222; }
        .iframe-box { width: 100%; height: 100%; }
        
        .chat-notice { font-size: 11px; color: #666; line-height: 1.5; font-weight: 600; margin-top: 20px; }
        .loader { height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-weight: 900; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
