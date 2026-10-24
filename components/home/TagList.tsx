'use client';

import { Suspense, lazy, useEffect, useRef } from 'react';
import { Icons } from '@/components/ui/Icon';
import type { Tag } from './SortableTag';

// 拖拽排序实现（含 @dnd-kit，约 50KB）只有打开「标签管理」时才用得上：
// 懒加载，不再压进所有用户的首屏 bundle；加载完成前先用普通标签行占位，布局不跳动。
const SortableTagList = lazy(() =>
    import('./SortableTagList').then((m) => ({ default: m.SortableTagList }))
);

interface RecommendTagConfig {
    label: string;
    isSelected: boolean;
    onSelect: () => void;
}

interface TagListProps {
    tags: Tag[];
    selectedTag: string;
    showTagManager: boolean;
    justAddedTag: boolean;
    onTagSelect: (tagId: string) => void;
    onTagDelete: (tagId: string) => void;
    onDragEnd: (event: import('@dnd-kit/core').DragEndEvent) => void;
    onJustAddedTagHandled: () => void;
    recommendTag?: RecommendTagConfig;
}

export function TagList(props: TagListProps) {
    if (props.showTagManager) {
        return (
            <Suspense fallback={<PlainTagList {...props} />}>
                <SortableTagList {...props} />
            </Suspense>
        );
    }
    return <PlainTagList {...props} />;
}

/** 普通模式标签行：与拖拽版非管理态的渲染保持一致（纯按钮，无拖拽库） */
function PlainTagList({
    tags,
    selectedTag,
    justAddedTag,
    onTagSelect,
    onJustAddedTagHandled,
    recommendTag,
}: TagListProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to end when new tag is added
    useEffect(() => {
        if (justAddedTag && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollWidth,
                behavior: 'smooth',
            });
            onJustAddedTagHandled();
        }
    }, [justAddedTag, onJustAddedTagHandled]);

    // Handle horizontal scroll with mouse wheel
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div
            ref={scrollContainerRef}
            className="mb-8 flex items-center gap-3 pb-3 pt-2 px-1 scrollbar-hide overflow-x-auto"
        >
            {/* Recommendation Tag — non-draggable, rendered before tags */}
            {recommendTag && (
                <div className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={recommendTag.onSelect}
                        className={`
                            px-6 py-2.5 text-sm font-semibold transition-all whitespace-nowrap rounded-[var(--radius-full)] cursor-pointer select-none flex items-center gap-1.5
                            ${recommendTag.isSelected
                                ? 'bg-[var(--accent-color)] text-white shadow-md scale-105'
                                : 'bg-[var(--glass-bg)] backdrop-blur-xl text-[var(--text-color)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:scale-105'
                            }
                        `}
                    >
                        <Icons.Sparkles size={14} />
                        {recommendTag.label}
                    </button>
                </div>
            )}
            {tags.map((tag) => (
                <div key={tag.id} className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => onTagSelect(tag.id)}
                        className={`
                            px-6 py-2.5 text-sm font-semibold transition-all whitespace-nowrap rounded-[var(--radius-full)] cursor-pointer select-none
                            ${selectedTag === tag.id
                                ? 'bg-[var(--accent-color)] text-white shadow-md scale-105'
                                : 'bg-[var(--glass-bg)] backdrop-blur-xl text-[var(--text-color)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:scale-105'
                            }
                        `}
                    >
                        {tag.label}
                    </button>
                </div>
            ))}
        </div>
    );
}
