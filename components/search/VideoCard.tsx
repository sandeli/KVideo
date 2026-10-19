'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

import { Video } from '@/lib/types';
import { htmlToText } from '@/lib/utils/html';
import { parseVideoTitle } from '@/lib/utils/video';
import type { ResolutionInfo } from '@/lib/hooks/useResolutionProbe';

interface VideoCardProps {
    video: Video;
    videoUrl: string;
    cardId: string;
    isActive: boolean;
    onCardClick: (e: React.MouseEvent, cardId: string, videoUrl: string) => void;
    isPremium?: boolean;
    latencies?: Record<string, number>;
    resolution?: ResolutionInfo | null;
    isProbing?: boolean;
    rank?: number;
}

export const VideoCard = memo<VideoCardProps>(({
    video,
    videoUrl,
    cardId,
    isActive,
    onCardClick,
    isPremium = false,
    latencies = {},
    resolution,
    isProbing = false,
    rank,
}) => {
    const displayLatency = latencies[video.source] ?? video.latency;
    const displayRemarks = htmlToText(video.vod_remarks);
    return (
        <div
            style={{
                position: 'relative',
                zIndex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.zIndex = '100')}
            onMouseLeave={(e) => (e.currentTarget.style.zIndex = '1')}
        >
            <Link
                key={cardId}
                href={videoUrl}
                onClick={(e) => onCardClick(e, cardId, videoUrl)}
                role="listitem"
                aria-label={`${video.vod_name}${video.vod_remarks ? ` - ${video.vod_remarks}` : ''}`}
                prefetch={false}
                data-focusable
                className="group cursor-pointer hover:translate-y-[-2px] transition-transform duration-200 ease-out block h-full"
            >
                <div
                    className="flex flex-col h-full rounded-[var(--radius-2xl)] overflow-hidden bg-[var(--glass-bg)] shadow-sm"
                    style={{
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] overflow-hidden">
                        {video.vod_pic ? (
                            <Image
                                src={video.vod_pic}
                                alt={video.vod_name}
                                fill
                                className="object-cover rounded-[var(--radius-2xl)]"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                                loading="eager"
                                unoptimized
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    if (target.dataset.fallback === '1') {
                                        target.style.opacity = '0';
                                        return;
                                    }
                                    target.dataset.fallback = '1';
                                    target.src = '/placeholder-poster.svg';
                                }}
                            />
                        ) : (
                            <Image
                                src="/placeholder-poster.svg"
                                alt={video.vod_name}
                                fill
                                className="object-cover rounded-[var(--radius-2xl)]"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                                unoptimized
                            />
                        )}

                        {/* Fallback Icon - visible when image fails completely */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 gap-2">
                            <Icons.Film size={48} className="text-[var(--text-color-secondary)] opacity-40" />
                            <span className="text-xs text-[var(--text-color-secondary)] opacity-60 px-2 text-center line-clamp-2">{video.vod_name}</span>
                        </div>

                        {/* Rank Badge - Top Left (like ranking list style) */}
                        {rank !== undefined && (
                            <div className={`absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center rounded-xl text-lg font-bold text-white shadow-md ${rank <= 3 ? 'bg-orange-500' : 'bg-black/60'}`}>
                                {rank}
                            </div>
                        )}

                        {/* Episode Badge - Bottom Left of poster */}
                        {displayRemarks && (
                            <div className="absolute bottom-2 left-2 z-10 bg-black/70 px-2.5 py-1 rounded-full">
                                <span className="text-xs font-medium text-orange-400">
                                    {displayRemarks}
                                </span>
                            </div>
                        )}

                        {/* Badge Container - offset when rank badge is present */}
                        <div className={`absolute top-2 right-2 z-10 flex items-center justify-end gap-1 ${rank !== undefined ? 'left-12' : 'left-2'}`}>
                            <div className="flex items-center gap-1 min-w-0">
                                {video.sourceName && (
                                    <Badge variant="primary" className="bg-[var(--accent-color)] flex-shrink-0 max-w-[100%] truncate">
                                        {video.sourceName}
                                    </Badge>
                                )}
                            </div>

                        </div>

                        {/* Favorite Button - Top Right */}
                        <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <FavoriteButton
                                videoId={video.vod_id}
                                source={video.source}
                                title={video.vod_name}
                                poster={video.vod_pic}
                                sourceName={video.sourceName}
                                type={video.type_name}
                                year={video.vod_year}
                                remarks={video.vod_remarks}
                                size={16}
                                className="shadow-md"
                                isPremium={isPremium}
                            />
                        </div>

                        {/* Overlay */}
                        <div
                            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isActive ? 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100' : 'opacity-0 lg:group-hover:opacity-100'
                                }`}
                            style={{
                                willChange: 'opacity',
                            }}
                        >
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                {isActive && (
                                    <div className="lg:hidden text-white/90 text-xs mb-2 font-medium">
                                        再次点击播放 →
                                    </div>
                                )}
                                {video.type_name && (
                                    <Badge variant="secondary" className="text-xs mb-2">
                                        {video.type_name}
                                    </Badge>
                                )}
                                {video.vod_year && (
                                    <div className="flex items-center gap-1 text-white/80 text-xs">
                                        <Icons.Calendar size={12} />
                                        <span>{video.vod_year}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-1 pt-1.5 pb-2 flex-1 flex flex-col">
                        {(() => {
                            const { cleanTitle } = parseVideoTitle(video.vod_name);

                            return (
                                <>
                                    <h4 className="font-medium text-[13px] leading-tight text-center text-[var(--text-color)] line-clamp-1 mb-1">
                                        {cleanTitle}
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                        {resolution ? (
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${resolution.color}`}>
                                                {resolution.label}
                                            </span>
                                        ) : isProbing ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white/50 bg-gray-500/50 animate-pulse">
                                                ...
                                            </span>
                                        ) : null}
                                        {displayLatency !== undefined && (
                                            <LatencyBadge latency={displayLatency} className="flex-shrink-0" />
                                        )}
                                    </div>
                                    {video.vod_lang && (
                                        <p className="text-xs text-center text-[var(--text-color-secondary)] mt-1">
                                            {video.vod_lang}
                                        </p>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </Link>
        </div>
    );
});

VideoCard.displayName = 'VideoCard';
