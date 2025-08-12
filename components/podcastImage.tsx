import { useEffect, useState } from "react";
import { Music } from "lucide-react";

interface PodcastImageProps {
    imageUrl: string;
    title: string;
    media_url: string
}

function YoutubeIcon({ size = 24, className = "" }) {
    return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className}><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    )
}

function RSSIcon({ size = 24, className = "" }) {
    return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className}><title>RSS</title><path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415c1.814 0 3.293 1.479 3.293 3.295 0 1.813-1.485 3.29-3.301 3.29C1.47 24 0 22.526 0 20.71s1.475-3.294 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91z" /></svg>
    )
}

function SpotifyIcon({ size = 24, className = "" }) {
    return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className}><title>Spotify</title><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
    )
}


export default function PodcastImage({ imageUrl, title, media_url }: PodcastImageProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!imageUrl) {
            setError(true);
            return;
        }

        let abort = false;

        fetch(imageUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.blob();
            })
            .then((blob) => {
                if (!abort) {
                    setBlobUrl(URL.createObjectURL(blob));
                }
            })
            .catch(() => {
                if (!abort) setError(true);
            });

        return () => {
            abort = true;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [imageUrl]);

    const getIcon = () => {
        switch (true) {
            case /youtube\.com|youtu\.be/.test(media_url):
                return <YoutubeIcon className="fill-white text-shadow-xl" size={24} />;
            case /spotify\.com/.test(media_url):
                return <SpotifyIcon size={24} className="fill-white" />;
            default:
                return <RSSIcon size={24} className="fill-white" />;
        }
    };

    if (error) {
        return (
            <div className="w-full h-full md:h-16 md:w-16 aspect-square flex md:items-center md:justify-center bg-gradient-to-tr from-slate-600 to-zinc-700 text-white/60 rounded-sm relative md:static">
                <div className="absolute md:static top-3 left-3 md:top-auto md:left-auto md:scale-125">
                    {getIcon()}
                </div>
                <div className="md:hidden absolute text-white text-xs font-semibold bottom-3 right-0 bg-black/60 inline-block text-right">
                    {title}
                </div>
            </div>
        );
    }

    return (
        blobUrl && (
            <img
                src={blobUrl}
                alt={title}
                className="select-none h-full md:h-16 object-cover rounded-sm border border-neutral-800 shadow"
                onPointerDown={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
            />
        )
    );
}
