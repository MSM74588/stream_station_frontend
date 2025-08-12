'use client';

import { useLongPress } from '@uidotdev/usehooks';
import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Download } from 'lucide-react';
import { toast } from 'sonner';

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
}


const handleBookmark = async (video: {
    title: string;
    channel?: string;
    url?: string;
    thumbnail: string;
}) => {
    const toastId = toast.loading("Adding to bookmarks...");

    try {
        const response = await fetch(video.thumbnail);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("song_name", video.title);
        formData.append("artist", video.channel ?? "");
        formData.append("url", video.url ?? "");
        formData.append("image", blob, "thumbnail.jpg"); // name it as a file
        formData.append("thumbnail_constructor_url", process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "")

        const res = await fetch(`${process.env.NEXT_PUBLIC_FAVOURITES_ENDPOINT}`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            if (res.status == 409) {
                toast.warning("Already Added to Favourites!", { id: toastId })
            } else {
                toast.error("Failed to bookmark", { id: toastId });
            }

            throw new Error(`${res.status}`)
        };

        toast.success("Bookmarked successfully!", { id: toastId });
    } catch (err) {
        console.error(err)
    }
};

const handleDownload = async (video: {
    title: string;
    channel?: string;
    url?: string;
    thumbnail: string;
}) => {
    await toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: video.url,
            }),
        }).then((res) => {
            if (!res.ok) throw new Error("Download failed");
            return res.json();
        }),
        {
            loading: "Starting download...",
            success: "Download started!",
            error: "Download failed",
        }
    );
};


export function VideoRow({
    video,
    onLongPress,
}: {
    video: any;
    onLongPress: () => void;
}) {
    const [clickedUrl, setClickedUrl] = useState<string | null>(null);
    const debouncedUrl = useDebounce(clickedUrl, 300);

    useEffect(() => {
        if (!debouncedUrl) return;

        const sendPost = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/player/play`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: debouncedUrl }),
                });
                console.log('POST success', await res.json());
            } catch (err) {
                console.error('POST failed', err);
            }
        };

        sendPost();
    }, [debouncedUrl]);


    const bind = useLongPress(onLongPress, {
        threshold: 500,
        captureEvent: true,
        cancelOnMovement: true,
        onStart: (event) => {
            if (event?.preventDefault) event.preventDefault(); // prevent native menu
        },
    });

    const handleClick = () => {
        toast.info("Sent Play Request")
        setClickedUrl(video.url);
    };

    return (
        <div
            {...bind}
            onClick={handleClick}
            className="flex items-start space-x-4 px-3 py-2 border-white/10 hover:bg-white/5 transition rounded-sm cursor-pointer group select-none"
        >
            <div className="h-20">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="aspect-video h-full object-cover rounded-sm border border-stone-700"
                />
            </div>
            <div className="flex flex-col justify-evenly grow">
                <p className="text-white font-medium md:text-base text-xs text-clip group-hover:text-red-500 transition">
                    {video.title}
                </p>
                <p
                    className="text-white/70 md:text-sm hover:underline text-xs"
                >
                    {video.channel}
                </p>
                <span className="pt-0.5">
                    {video.is_live ? (
                        <span className="text-xs bg-red-700 px-1 py-0.5 inline-block w-min rounded-sm font-semibold">
                            Live
                        </span>
                    ) : (
                        <p className="text-xs bg-stone-700 px-1 py-0.5 inline-block whitespace-nowrap w-min rounded-sm font-semibold">
                            {formatDuration(video.duration)}
                        </p>
                    )}
                </span>
            </div>
            <div
                className="md:flex h-full items-center justify-center gap-1 hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {!video.is_live && (
                    <Button variant={'outline'} className="rounded-full p-0" onClick={() => handleDownload(video)}>
                        <Download />
                    </Button>
                )}

                <Button variant={'outline'} className="rounded-full p-0" onClick={() => handleBookmark(video)}>
                    <Bookmark />
                </Button>
            </div>
        </div>
    );
}
