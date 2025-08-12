'use client';

import useSWR from 'swr';
import { Heart, Link as LinkIcon, Loader2, Music, FolderDown, Link, ListPlus, ListStart, ListX, Star, FilmIcon, Film, List, ListVideo, StarOff, BookmarkMinus, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/credenza"
import { Button } from '@/components/ui/button';
import createLongPressHandlers from '@/lib/LongPressHandler';
import { DeleteHandler } from '@/lib/requests/DeleteHandler'
import { useSearchStore } from '@/app/podcasts/page';
import PodcastImage from '../podcastImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PodcastSection() {
    const { setSearchString, triggerRefresh } = useSearchStore();

    const triggerSearchWithQuery = (query: string) => {
        setSearchString(query);
        triggerRefresh();
    };


    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PODCAST_SAVE_ENDPOINT}`, fetcher);
    const saveEndpoint = process.env.NEXT_PUBLIC_PODCAST_SAVE_ENDPOINT

    console.log(data)
    const playlistData = data?.items || [];

    console.log(playlistData)

    const [isCredenzaOpen, setCredenzaOpen] = useState(false);
    const [credenzaData, setCredenzaData] = useState<any | null>(null);

    function openCredenza(data: any) {
        setCredenzaData(data);
        setCredenzaOpen(true);
    }


    function handleLongPress(data: any) {
        console.log(data)
        openCredenza(data);
    }



    if (isLoading) return <div className="w-full flex items-center justify-center p-5 animate-spin"><Loader /></div>


    if (error) return (
        <div className="text-red-400 text-sm">
            Failed to load favourites.
        </div>
    )

    if (!isLoading && playlistData.length === 0) return (
        <div className="text-white/50 italic">
            No favourites yet.
        </div>
    )

    return (
        <>
            <div className="w-full flex flex-col gap-4">
                <div className="flex flex-row text-emerald-500 font-semibold text-xl items-center justify-between gap-x-2">
                    Saved Podcasts, Playlists and Channels
                    <ListVideo className="w-[24px]" />
                </div>

                {playlistData.length > 0 && (
                    <div className="grid w-full overflow-auto grid-flow-col gap-1 md:grid-flow-row md:w-full grid-rows-2 overflow-x-scroll md:overflow-auto md:grid-rows-none md:grid-cols-2 md:gap-3">
                        {
                            playlistData.map((playlistItem: any) => {
                                const longPressHandlers = createLongPressHandlers(playlistItem, handleLongPress);
                                return (
                                    <div key={playlistItem.id}
                                        {...longPressHandlers}
                                        onClick={() => triggerSearchWithQuery(playlistItem.url)}
                                        className="w-32 md:w-auto aspect-square md:aspect-auto md:max-w-none flex items-start space-x-3 rounded-md border border-neutral-700 bg-neutral-800/50 md:p-2 hover:bg-white/10 transition select-none active:scale-[99%] group"
                                    >
                                        {playlistItem.image_url ? (
                                            // <img
                                            //     src={playlistItem.image_url}
                                            //     alt={playlistItem.title}
                                            //     className="select-none h-full md:h-16 object-cover rounded-sm border border-neutral-800 shadow"
                                            //     onPointerDown={(e) => e.preventDefault()}
                                            //     onContextMenu={(e) => e.preventDefault()} // stops long-press menu
                                            //     style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }} // iOS Safari
                                            // />
                                            <PodcastImage imageUrl={playlistItem.image_url} title={playlistItem.title} media_url={playlistItem.url}/>
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 text-white/60 rounded">
                                                <Music />
                                            </div>
                                        )}

                                        <div className="md:flex flex-col justify-center text-white text-sm hidden">
                                            <div className="font-medium text-base line-clamp-2 group-active:text-red-500">{playlistItem.title}</div>
                                            <div className="text-white/70 line-clamp-1">{playlistItem.publisher}</div>
                                            <div className="text-white/70 line-clamp-1 text-sm font-light">{playlistItem.type}</div>

                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </div>
            <FavCredenza
                open={isCredenzaOpen}
                onOpenChange={setCredenzaOpen}
                data={credenzaData}
            />
        </>
    );
}

function FavCredenza({ open, onOpenChange, data }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any | null;
}) {

    const { setSearchString, triggerRefresh } = useSearchStore();

    const triggerSearchWithQuery = (query: string) => {
        setSearchString(query);
        triggerRefresh();
    };


    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent className='p-0'>
                <div className='w-full flex flex-col divide-y-[1px] divide-neutral-600'>
                    <div className='sticky top-0 flex flex-row gap-4 p-4'>
                        <img className='md:max-h-28 rounded max-h-20' src={data?.image_url} alt={data?.id} />
                        {/* <div className='h-20 min-h-20 md:h-full'>
                            <PodcastImage imageUrl={data?.image_url} title={data?.title} media_url={data?.url}/>
                        </div> */}
                        
                        <div className='flex flex-col grow justify-center'>
                            <h1 className='text-white font-semibold text-xl overflow-x-scroll whitespace-nowrap max-w-[70vw] md:max-w-[30vw] md:whitespace-break-spaces'>{data?.title}</h1>
                            <p className='text-neutral-200 font-light'>{data?.publisher}</p>
                            <p className='text-neutral-200 font-light text-xs select-text'>
                                {data?.url}
                            </p>
                        </div>
                    </div>
                    <div className=' px-2 py-2'>
                        <a href={data?.url} target='_blank' className='flex flex-col'>
                            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Film /> Open Podcast Source</Button>
                        </a>
                    </div>
                    <div className='flex flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListStart /> Play Latest Episode</Button>
                        {/* <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Hello</Button> */}
                        {/* <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button> */}
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
                            onClick={() => triggerSearchWithQuery(data?.url)}
                        >
                            <List /> Details and Episodes
                        </Button>


                    </div>
                    {/* <div className='flex w-full flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-violet-500/10'><FolderDown /> Download</Button>
                    </div> */}
                </div>

                {/* <CredenzaClose asChild>
                        <Button variant="outline">Close</Button>
                    </CredenzaClose> */}

            </CredenzaContent>
        </Credenza>
    );
}