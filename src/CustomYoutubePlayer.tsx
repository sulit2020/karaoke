import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __yt_script_injected?: boolean;
  }
}

// 1. Properly type and structure the Props interface
interface CustomYoutubePlayerProps {
  videoId: string;
}

const CustomYoutubePlayer = ({ videoId }: CustomYoutubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If the container element isn't available yet, bail out safely
    if (!containerRef.current) return;

    containerRef.current.innerHTML = ""; // Clear previous player if any
    const youtubeTargetDiv = document.createElement("div");
    containerRef.current.appendChild(youtubeTargetDiv);

    let player: any = null;

    // 2. Helper function to initialize the player
    const createPlayer = () => {
      // Check if container still exists (could have unmounted during async load)
      if (!youtubeTargetDiv || !window.YT || !window.YT.Player) return;

      player = new window.YT.Player(youtubeTargetDiv, {
        height: "390",
        width: "540",
        videoId: videoId, // 3. Use the destructured prop here
        playerVars: {
          autoplay: 0,
          controls: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => console.log("Player is ready!", event),
          onStateChange: (event: any) =>
            console.log("State changed:", event.data),
        },
      });
      playerRef.current = player;
    };

    // 4. Inject script safely if it doesn't exist
    if (!window.YT && !window.__yt_script_injected) {
      window.__yt_script_injected = true; // Mark as injected instantly
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    // 5. Handle global callback sequencing safely
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        createPlayer();
      };
    }

    // 6. Robust Cleanup on unmount to prevent memory leaks on localhost
    return () => {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
      playerRef.current = null;
    };
  }, [videoId]); // Triggers recreate if videoId changes

  return <div ref={containerRef} />;
};

export default CustomYoutubePlayer;
