'use client';

import { useState, useEffect } from 'react';
import { DesktopVideoPlayer } from './DesktopVideoPlayer';
import { MobileVideoPlayer } from './MobileVideoPlayer';

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
 * Smart Video Player that renders different versions based on device
 * - Mobile/Tablet: Optimized touch controls, double-tap gestures, CSS fake-landscape rotation
 * - Desktop: Full-featured player with hover interactions
 */
export function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);

  useEffect(() => {
    // 动态检测是否为移动设备 (iOS / Android / 微信等)
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;

      setIsMobileDevice(isMobileUA || isSmallScreen);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SSR 服务器端渲染阶段默认渲染 DesktopVideoPlayer，避免水合不一致 (Hydration Mismatch)
  if (isMobileDevice === null) {
    return <DesktopVideoPlayer {...props} />;
  }

  // 根据设备类型渲染对应的播放器组件
  return isMobileDevice ? (
    <MobileVideoPlayer {...props} />
  ) : (
    <DesktopVideoPlayer {...props} />
  );
}
