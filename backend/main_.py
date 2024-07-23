from fastapi import FastAPI, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
import time
import uuid
import os

app = FastAPI()

# tasks = {}
# videos = {}

# def process_image(image_id: str):
#     time.sleep(30)
#     video_path = f"./videos/{image_id}.mp4"
#     # Simulate video generation
#     with open(video_path, "w") as f:
#         f.write("Video content")
#     videos[image_id] = video_path
#     tasks[image_id] = 100


# @app.get("/")
# def read_root():
#     return {"Hello": "fastapi"}

# @app.post("/upload")
# async def upload_image(file: UploadFile, background_tasks: BackgroundTasks):
#     image_id = str(uuid.uuid4())
#     tasks[image_id] = 0
#     background_tasks.add_task(process_image, image_id)
#     return JSONResponse({"task_id": image_id})

# @app.get("/status")
# async def get_status(task_id: str):
#     progress = tasks.get(task_id, 0)
#     video_url = f"/video/{task_id}" if progress == 100 else None
#     return JSONResponse({"progress": progress, "videoUrl": video_url})

# @app.get("/video/{task_id}")
# async def get_video(task_id: str):
#     video_path = videos.get(task_id)
#     if not video_path:
#         return JSONResponse({"error": "Video not found"}, status_code=404)
#     return FileResponse(video_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)


