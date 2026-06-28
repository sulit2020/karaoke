import { useEffect, useState } from "react";
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
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([]);
  const API_ENDPOINT =
    import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

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
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to search Youtube:", err);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINT}/recommendations`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  // Utility: Fisher-Yates shuffle a copy of the array
  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // When a recommendation is clicked: play it, remove from list, and reshuffle remaining
  const handleRecommendationClick = (id: string, title: string) => {
    setSelectedVideoId(id);
    setSelectedVideoTitle(title);
    setRecommendations((prev) => {
      const filtered = prev.filter((v) => {
        const vid = (v as any).videoId ?? (v as any).id ?? (v as any).video_id ?? "";
        return vid !== id;
      });
      return shuffle(filtered);
    });
  };

  const handleSearchResultClick = (video: YouTubeVideo) => {
    setSelectedVideoId(video.videoId);
    setSelectedVideoTitle(video.title);
    setVideos([]);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        padding: "20px",
        fontFamily: "sans-serif",
        marginTop: "-10px",
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
      <div style={{ display: "flex", gap: "20px" , marginTop: "-20px"}}>
        {/* LEFT COLUMN: Main Karaoke Video Screen */}
        <div style={{ flex: 8 }}>
          <CustomYoutubePlayer videoId={selectedVideoId || "ypcVYB9T32o"} />
          <h2 style={{ marginTop: "15px" }}>Now Playing : {selectedVideoTitle} </h2>
          <span>
            {selectedVideoTitle || videos.find((v) => v.videoId === selectedVideoId)?.title || "Default Video"}
          </span>
        </div>

        {/* RIGHT COLUMN: Search Results + AI Sidebar Recommendations */}

        <div
          style={{
            flex: 2,
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            height: "fit-content",
          }}
        >
          {videos.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "100vh",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {videos.map((video) => (
                <div
                  key={video.videoId}
                  onClick={() => handleSearchResultClick(video)}
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
                    style={{ width: "180px" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "100vh",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {loading ? (
                <p>Loading your karaoke list...</p>
              ) : (
                recommendations.map((video) => {
                  const vid = (video as any).videoId ?? (video as any).id ?? (video as any).video_id ?? "";
                  const title = (video as any).title ?? (video as any).name ?? "Untitled";
                  const thumb = (video as any).thumbnail ?? (video as any).thumbnailUrl ?? "";
                  return (
                    <div
                      key={vid || title}
                      onClick={() => vid && handleRecommendationClick(vid, title)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        gap: "8px",
                        marginBottom: "10px",
                        background: "#f0f0f0",
                        padding: "5px",
                      }}
                    >
                      <img src={thumb} alt={title} style={{ width: "180px" }} />
              
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaraokePlayer;
