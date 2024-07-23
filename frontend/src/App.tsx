import React, { useState, useEffect } from 'react';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket server
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        ws.onmessage = (event) => {
            alert(event.data); // Show an alert when receiving a message from the server
        };
        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);
    
    const imageUploadHandler = (e:any) => {
      setSelectedFile(e.target.files[0]);
      console.log(e.target.files[0]);
    };

    const handleSubmit = async () => {
      if (!selectedFile) return;
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const requestOptions = {
        method: 'POST', 
        body: formData
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
          <h1>Upload Image and Get Video</h1>
          <input onChange={imageUploadHandler} type="file" accept="image/*" />
          <button onClick={handleSubmit}>Upload Image</button>

        </div>
    );
}

export default App;



