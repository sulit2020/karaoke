import { useState } from "react";
import CustomYoutubePlayer from "./CustomYoutubePlayer";
// Using YouTube iframe embed instead of react-player
interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

const KaraokePlayer = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  const API_ENDPOINT =
    import.meta.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const handleSearchSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(
        `${API_ENDPOINT}/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      setVideos(data.results || []);
      console.log("Search results:", data.results);
    } catch (err) {
      console.error("Failed to search Youtube:", err);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* 1. SEARCH BOX CONTAINER */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ display: "flex", gap: "10px", marginBottom: "25px" }}
      >
        <input
          type="text"
          placeholder="Type a song title or artist (e.g., Bruno Mars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#ff0000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </form>

      {/* Main App Workspace View */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* LEFT COLUMN: Main Karaoke Video Screen */}
        <div style={{ flex: 2 }}>
          {selectedVideoId ? (
            <div>
              <CustomYoutubePlayer videoId={selectedVideoId || "ypcVYB9T32o"} />
              <h2 style={{ marginTop: "15px" }}>Now Playing </h2>
              <span>{videos.find(v => v.videoId === selectedVideoId)?.title || ""}</span>
            </div>
          ) : (
            <p>Select a video to begin playing</p>
          )}
        </div>

        {/* RIGHT COLUMN: Search Results + AI Sidebar Recommendations */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            height: "fit-content",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Up Next (AI Recommended)</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "6px",
            }}
          >
            {videos.map((video) => (
              <div
                key={video.videoId}
                onClick={() => setSelectedVideoId(video.videoId)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  background: "#f0f0f0",
                  padding: "5px",
                }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{ width: "120px" }}
                />
                <p
                  style={{
                    fontWeight:
                      selectedVideoId === video.videoId ? "bold" : "normal",
                  }}
                >
                  {video.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaraokePlayer;
