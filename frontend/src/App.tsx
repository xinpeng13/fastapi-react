import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
    id: number;
    progress: number;
    isProgressVisible: boolean;
    videoUrl: string;
    message: string;
}

const App: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Connect to WebSocket server
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        ws.onmessage = (event) => {
           
            addTask(event.data); // Add a new task for each new message
            // alert(event.data); // Show an alert when receiving a message from the server
        };
        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    const addTask = (message: string) => {
        const newTask: Task = {
            id: Date.now(),
            progress: 0,
            isProgressVisible: true,
            videoUrl: '',
            message,
        };
        setTasks((prevTasks) => [...prevTasks, newTask]);
        startProgressBar(newTask.id);
    };

    const startProgressBar = (taskId: number) => {
        const interval = setInterval(() => {
            setTasks((prevTasks) => {
                const updatedTasks = prevTasks.map((task) => {
                    if (task.id === taskId) {
                        const newProgress = task.progress + (100 / 30);
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            fetchVideo(taskId);
                            return { ...task, progress: 100, isProgressVisible: false };
                        }
                        return { ...task, progress: newProgress };
                    }
                    return task;
                });
                return updatedTasks;
            });
        }, 1000);
    };

    const fetchVideo = async (taskId: number) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/video');
            if (response.ok) {
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? { ...task, videoUrl } : task
                    )
                );
            } else {
                alert('Failed to fetch video');
            }
        } catch (error) {
            console.error('Error fetching video:', error);
            alert('Error fetching video');
        }
    };

    const imageUploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('file', file));

        const requestOptions: RequestInit = {
            method: 'POST',
            body: formData,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/upload/", requestOptions);
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="App">
            <h1>Image to Video magic tool!</h1>
            <h2>You can upload multiple images, but the app can process one image at a time. Each image need 30 seconds to be finished.</h2>
            <input onChange={imageUploadHandler} type="file" accept="image/*" multiple />
            <button onClick={handleSubmit}>Upload Image</button>
            <div>
                {tasks.map((task) => (
                    <div key={task.id} style={{ marginBottom: '20px' }}>
                        <div>
                                <div>{task.message}</div>
                                <div>Progress: {Math.round(task.progress)}%</div>
                                <progress value={task.progress} max="100"></progress>
                            </div>
                        {task.videoUrl && (
                            <div>
                                <h2>Video Generate Complete!</h2>
                                <video
                                    width="600"
                                    controls
                                    controlsList="nodownload"
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    <source src={task.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;





