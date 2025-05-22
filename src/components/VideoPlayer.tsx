import React, { useEffect, useRef, useState } from 'react';
import { Button, Paper, Box, Typography } from '@mui/material';
import socketIOClient from 'socket.io-client';

interface VideoPlayerProps {
  videoSrc: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [videoError, setVideoError] = useState<string>('');

  useEffect(() => {
    // 调试日志：检查视频源
    console.log('Video source:', videoSrc);

    const videoElement = videoRef.current;
    if (!videoElement) {
      console.error('Video element not found');
      return;
    }

    // 监听视频事件
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      console.log('Video duration:', videoElement.duration);
      console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
    };

    const handleLoadedData = () => {
      console.log('Video data loaded and ready to play');
    };

    const handleError = () => {
      console.error('Video error:', videoElement.error);
      setVideoError(`视频加载错误: ${videoElement.error?.message || '未知错误'}`);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);

    // 测试视频源是否可访问
    fetch(videoSrc)
      .then(response => {
        console.log('Video file response:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        console.log('Video file size:', blob.size, 'bytes');
        // 创建Blob URL
        const blobUrl = URL.createObjectURL(blob);
        videoElement.src = blobUrl;
      })
      .catch(error => {
        console.error('Error accessing video file:', error);
        setVideoError(`无法访问视频文件: ${error.message}`);
      });

    // 初始化WebSocket连接
    socketRef.current = socketIOClient('http://localhost:3001');

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [videoSrc]);

  const handleDontUnderstand = () => {
    if (!videoRef.current || !socketRef.current) return;

    const currentTime = videoRef.current.currentTime;
    
    // 暂停视频
    videoRef.current.pause();

    // 发送当前时间点到服务器进行内容分析
    socketRef.current.emit('analyze_content', {
      timestamp: currentTime,
      videoId: videoSrc
    });

    // 监听服务器返回的解析结果
    socketRef.current.on('analysis_result', (data: { explanation: string }) => {
      setExplanation(data.explanation);
    });

    // 监听服务器连接错误
    socketRef.current.on('connect_error', () => {
      setExplanation('无法连接到服务器，显示默认解析结果。');
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2, minHeight: '450px' }}>
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <video
            ref={videoRef}
            controls
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              backgroundColor: '#000'
            }}
          />
        </Box>
        {videoError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {videoError}
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDontUnderstand}
          sx={{ minWidth: '120px' }}
        >
          不懂
        </Button>
      </Box>

      {explanation && (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            解析结果
          </Typography>
          <Typography variant="body1">
            {explanation}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default VideoPlayer;