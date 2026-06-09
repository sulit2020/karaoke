import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from googleapiclient.discovery import build
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv() # Load environment variables from .env file

app = FastAPI(title="Karaoke AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

YOUTUBE_API_KEY=os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube','v3',developerKey=YOUTUBE_API_KEY)
ai_model = SentenceTransformer('all-MiniLM-L6-v2')

video_database = []

@app.get("/search")
def search_karaoke(q:str):
    """Searches Youtube for Karaoke videos and caches them with AI vectors."""
    if not q:
        raise HTTPException(status_code=400, detail="Query required")
    # Force 'karaoke' into the search query to keep results clean
    search_query = f"{q} atomic karaoke"

    try:
        request = youtube.search().list(
            q=search_query,
            part="snippet",
            maxResults=1,
            type="video"
        )
        response = request.execute()

        results = []
        for item in response.get("items", []):
            # Safe checking for videoId structure to prevent crashes
            item_id_info = item.get("id", {})
            video_id = item_id_info.get("videoId")
            
            # If it's somehow not a video, skip it safely
            if not video_id:
                continue

            snippet = item.get("snippet", {})
            title = snippet.get("title", "Unknown Title")
            description = snippet.get("description", "")
            
            # Safe fallback if thumbnail high resolution doesn't exist
            thumbnails = snippet.get("thumbnails", {})
            high_thumb = thumbnails.get("high", {})
            thumbnail = high_thumb.get("url", "")

            # AI Step: Generate text embedding vector based on the video title
            vector = ai_model.encode(title).tolist()

            video_data = {
                "id": video_id,
                "title": title,
                "description": description,
                "thumbnail": thumbnail,
                "vector": vector
            }

            # Save to database cache if it's new
            if not any(v['id'] == video_id for v in video_database):
                video_database.append(video_data)

            # 🌟 FIXED FOR YOUR REACT TRANSITION 🌟
            # Changed 'id' to 'videoId' to perfectly align with what your React hooks expect!
            results.append({
                "videoId": video_id,
                "title": title,
                "thumbnail": thumbnail
            })

        return {"results": results}

    except Exception as e:
        # This will send the actual error text to your browser console rather than a mystery 500 error page
        raise HTTPException(status_code=500, detail=str(e))

# @app.get("/recommendations")
# def get_recommendations(video_id:str):

#     search_query = f"pop karaoke, oldies karaoke, rock karaoke, country karaoke, rap karaoke"

#     request = youtube.search().list(
#         q=search_query,
#         part="snippet",
#         maxResults=5,
#         type="video"
#     )

#     response = request.execute()

#     """Calculates the closest AI vector match to populate the sidebar recommendations."""
#     # Find the current video in our system
#     current_video = next((v for v in video_database if v['id'] == video_id),None)
#     if not current_video:
#         return []
    
    
#     current_vector = np.array([current_video["vector"]])

#     # Calculate similarity score against all other videos in the database
#     recommendations = []
#     for v in video_database:
#         if v["id"]==video_id:
#             continue # Skip comparing the song against itself

#         target_vector = np.array([v["vector"]])
#         similarity = cosine_similarity(current_vector,target_vector)[0][0]

#         recommendations.append({
#             "id":v["id"],
#             "title":v["title"],
#             "thumbnail":v["thumbnail"],
#             "score": float(similarity)
#         })

#     # Sort recommendations by highest AI similarity score first
#     recommendations.sort(key=lambda x:x["score"],reverse=True)
#     return recommendations[:5] # Return top 5 matching songs 