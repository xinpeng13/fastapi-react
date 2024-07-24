import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, LinearProgress, Card, CardContent, CardActions, Snackbar, Alert } from '@mui/material';
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

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        ws.onmessage = (event) => {
            addTask(event.data);
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
                showSnackbar('Failed to fetch video', 'error');
            }
        } catch (error) {
            console.error('Error fetching video:', error);
            showSnackbar('Error fetching video', 'error');
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
            showSnackbar('Image submitted successfully! (Awaiting Process)', 'success');
            console.log(data);
        } catch (error) {
            console.error('Error uploading file:', error);
            showSnackbar('Error uploading file', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>Image to Video Magic Tool</Typography>
            <Typography variant="h6" gutterBottom>
                You can upload multiple images, but the app can process one image at a time. Each image needs 30 seconds to be finished.
            </Typography>
            <input
                onChange={imageUploadHandler}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="file-upload"
            />
            <label htmlFor="file-upload">
                <Button variant="contained" color="primary" component="span">
                    Select Image
                </Button>
            </label>
            <Button onClick={handleSubmit} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                Upload
            </Button>
            <Box mt={4}>
                {tasks.map((task) => (
                    <Card key={task.id} variant="outlined" style={{ marginBottom: '20px' }}>
                        <CardContent>
                            <Typography variant="body1">{task.message}</Typography>
                            {task.isProgressVisible ? (
                                <Box display="flex" alignItems="center">
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={task.progress} />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color="textSecondary">{`${Math.round(task.progress)}%`}</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">Processing complete</Typography>
                            )}
                        </CardContent>
                        {task.videoUrl && (
                            <CardActions>
                                <Box width="100%">
                                    <Typography variant="h6">Video Generate Complete!</Typography>
                                    <video
                                        width="100%"
                                        controls
                                        controlsList="nodownload"
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        <source src={task.videoUrl} type="video/mp4" />
                                    </video>
                                </Box>
                            </CardActions>
                        )}
                    </Card>
                ))}
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <Button color="inherit" onClick={handleCloseSnackbar}>
                        Close
                    </Button>
                }
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default App;





