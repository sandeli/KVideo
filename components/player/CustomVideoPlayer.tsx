'use client';

import { useRef, useState, useEffect } from 'react';
import { DesktopVideoPlayer } from './DesktopVideoPlayer';
import { useScreenOrientation } from '@/lib/hooks/mobile/useScreenOrientation';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  shouldAutoPlay?: boolean;
  // Episode navigation props for auto-skip/auto-next
  totalEpisodes?: number;
  currentEpisodeIndex?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  // Danmaku props
  videoTitle?: string;
  episodeName?: string;
  isPremium?: boolean;
  // Resolution callback
  onResolutionDetected?: (info: import('./hooks/useVideoResolution').VideoResolutionInfo) => void;
}

/**
 * Smart Video Player Component
 * 统一渲染视频播放器，并自动监听全屏状态，在移动端（iOS/微信等）自动应用 CSS 伪横屏 90 度旋转兼容
 */
export function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 监听浏览器原生全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement;

      setIsFullscreen(!!fullscreenEl);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 绑定方向控制：若移动端屏幕旋转 API 失败，Hook 会自动给 containerRef 挂载 .is-mobile-landscape 样式类
  useScreenOrientation(isFullscreen, containerRef.current);

  return (
    <div ref={containerRef} className="kvideo-container w-full h-full relative overflow-hidden">
      <DesktopVideoPlayer {...props} />
    </div>
  );
}
