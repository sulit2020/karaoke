import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from googleapiclient.discovery import build
#from sentence_transformers import SentenceTransformer
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
#ai_model = SentenceTransformer('all-MiniLM-L6-v2')

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
            maxResults=5,
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
            #vector = ai_model.encode(title).tolist()

            video_data = {
                "id": video_id,
                "title": title,
                "description": description,
                "thumbnail": thumbnail,
                #"vector": vector
            }

            # Save to database cache if it's new
            if not any(v['id'] == video_id for v in video_database):
                video_database.append(video_data)

            results.append({
                "videoId": video_id,
                "title": title,
                "thumbnail": thumbnail
            })

        return {"results": results}

    except Exception as e:
        # This will send the actual error text to your browser console rather than a mystery 500 error page
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/recommendations")
def get_recommendations(videoId: str):
    """Fetches a fixed set of 20 default Pop and OPM karaoke recommendations."""
    # Your requested default hardcoded search queries

    try:
        # Request modified to fetch 20 results as requested
        details = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=videoId
        )
        
        details_response = details.execute()
        tags = details_response['items'][0]['snippet']['tags']
        query_tags = " ".join(tags[0:3])  # Limit to first 10 tags to avoid overly long queries
        
        new_search_query = youtube.search().list(
            part="snippet",
            q=query_tags,
            type="video",
            maxResults=10
        )
        
        new_search_response = new_search_query.execute()

        recommendations = []
        for item in new_search_response.get("items", []):
            item_id_info = item.get("id", {})
            video_id = item_id_info.get("videoId")
            
            if not video_id:
                continue

            snippet = item.get("snippet", {})
            title = snippet.get("title", "Unknown Title")
            description = snippet.get("description", "")
            
            thumbnails = snippet.get("thumbnails", {})
            high_thumb = thumbnails.get("high", {})
            thumbnail = high_thumb.get("url", "")

            video_data = {
                "id": video_id,
                "title": title,
                "description": description,
                "thumbnail": thumbnail
            }

            # Cache it to your video database if it's unique
            if not any(v['id'] == video_id for v in video_database):
                video_database.append(video_data)

            # Structure the response format neatly for your frontend
            recommendations.append({
                "id": video_id,
                "title": title,
                "thumbnail": thumbnail
            })

        return recommendations

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))