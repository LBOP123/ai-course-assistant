import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import VideoPlayer from '../components/VideoPlayer';

const HomePage: React.FC = () => {
  // 使用相对路径访问视频
  const videoUrl = '/videos/daoshu.mp4';

  useEffect(() => {
    // 调试日志：检查视频URL和环境变量
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Base URL:', process.env.PUBLIC_URL);
    console.log('Window location:', window.location.href);
    console.log('Video URL (relative):', videoUrl);
    console.log('Video URL (absolute):', window.location.origin + videoUrl);

    // 检查文件是否存在
    const checkVideoFile = async () => {
      try {
        const response = await fetch(videoUrl);
        console.log('Video file response status:', response.status);
        console.log('Video file response headers:', response.headers);
        console.log('Video file response type:', response.type);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        console.log('Video file size:', blob.size, 'bytes');
        console.log('Video file type:', blob.type);
      } catch (error) {
        console.error('Error checking video file:', error);
      }
    };

    checkVideoFile();
  }, [videoUrl]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI课程助手
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <VideoPlayer videoSrc={videoUrl} />
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          点击"不懂"按钮，AI助手将为您解析当前视频内容
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;