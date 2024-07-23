import React, { useEffect, useState } from 'react';

const ProgressStatus: React.FC<{ taskId: string }> = ({ taskId }) => {
    const [status, setStatus] = useState<{ progress: number, videoUrl: string | null }>({ progress: 0, videoUrl: null });

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch(`http://127.0.0.1:8000/status?task_id=${taskId}`);
            const data = await res.json();
            setStatus(data);
        }, 1000);

        return () => clearInterval(interval);
    }, [taskId]);

    return (
        <div>
            {status.videoUrl ? (
                <video src={status.videoUrl} controls />
            ) : (
                <div>Processing: {status.progress}%</div>
            )}
        </div>
    );
};

export default ProgressStatus;
