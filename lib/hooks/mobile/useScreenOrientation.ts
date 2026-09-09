import { useEffect, useState } from 'react';

/**
 * Hook for managing screen orientation on mobile devices.
 * Tries native orientation lock first, and falls back to CSS rotation (fake landscape)
 * if native locking fails or is restricted by mobile browsers (e.g. iOS Safari / WeChat).
 */
export function useScreenOrientation(isFullscreen: boolean, containerElement?: HTMLElement | null) {
  const [isFakeLandscape, setIsFakeLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = async () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      const screen = window.screen as any;

      if (isFullscreen) {
        let lockSuccess = false;

        // 1. 优先尝试系统原生 Screen Orientation Lock API
        if (screen.orientation?.lock) {
          try {
            await screen.orientation.lock('landscape');
            lockSuccess = true;
          } catch (err) {
            console.warn('Native orientation lock failed/blocked, falling back to CSS rotation:', err);
          }
        }

        // 2. 如果是移动端竖屏状态，且原生 Lock API 失败/不可用，启动 CSS 伪横屏
        if (!lockSuccess && isMobile && isPortrait) {
          setIsFakeLandscape(true);
          document.body.classList.add('mobile-fullscreen-active');
          if (containerElement) {
            containerElement.classList.add('is-mobile-landscape');
          }
        }
      } else {
        // 3. 退出全屏：清理系统锁定与 CSS 伪横屏样式
        cleanupOrientation(containerElement);
      }
    };

    handleOrientation();

    // Cleanup: 卸载时复原
    return () => {
      cleanupOrientation(containerElement);
    };
  }, [isFullscreen, containerElement]);

  return { isFakeLandscape };
}

/**
 * 辅助清理函数：解锁方向并移除伪横屏 CSS 类
 */
function cleanupOrientation(containerElement?: HTMLElement | null) {
  if (typeof window === 'undefined') return;

  // 1. 解除 CSS 伪横屏
  document.body.classList.remove('mobile-fullscreen-active');
  if (containerElement) {
    containerElement.classList.remove('is-mobile-landscape');
  } else {
    // 降级兜底：搜寻所有可能挂载了该类的元素并移除
    const elements = document.querySelectorAll('.is-mobile-landscape');
    elements.forEach((el) => el.classList.remove('is-mobile-landscape'));
  }

  // 2. 解除系统方向锁定
  try {
    const screen = window.screen as any;
    if (screen.orientation?.unlock) {
      screen.orientation.unlock();
    }
  } catch (error) {
    // 忽略清理阶段的错误
  }
}
