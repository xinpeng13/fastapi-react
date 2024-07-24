from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import asyncio
import os
import shutil
import uuid
from typing import Optional
from queue import Queue
from threading import Thread
import random

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded images
UPLOAD_DIR = "uploads"
VIDEO_DIR = "videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Queue for image processing
image_queue = Queue()
processing_lock = asyncio.Lock()
websocket_connections = set()



# Function to process images
async def process_image(file_path: str):
    async with processing_lock:
        await notify_clients(f"Processing start for {file_path}")
        await asyncio.sleep(30)  # Simulate image processing
        os.remove(file_path)  # Remove image after processing
        # await notify_clients(f"Processing complete for {file_path}")

# Worker thread to process images
def worker():
    while True:
        file_path = image_queue.get()
        if file_path is None:
            break
        asyncio.run(process_image(file_path))
        image_queue.task_done()

# Start worker thread
thread = Thread(target=worker)
thread.start()

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_extension = file.filename.split('.')[-1]
    if file_extension.lower() not in ['jpg', 'jpeg', 'png']:
        return {"error": "Unsupported file type"}
    
    # Save the file
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.{file_extension}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Add to queue for processing
    image_queue.put(file_path)
    
    return {"message": "Image uploaded successfully"}

@app.get("/video")
async def get_video():
    video_files = [f for f in os.listdir(VIDEO_DIR) if f.endswith('.mp4')]
    if not video_files:
        return {"error": "No video available"}
    i = random.randint(0, len(video_files) - 1)
    video_path = os.path.join(VIDEO_DIR, video_files[i])
    
    return FileResponse(video_path)


# web socket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

async def notify_clients(message: str):
    for connection in websocket_connections:
        await connection.send_text(message)


def read_video_data(video_path: str) -> bytes:
    with open(video_path, "rb") as video_file:
        return video_file.read()

@app.on_event("shutdown")
async def shutdown_event():
    image_queue.put(None)  
    thread.join()  # Wait for the worker thread to exit