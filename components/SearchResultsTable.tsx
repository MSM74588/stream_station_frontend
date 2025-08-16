'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { createColumnHelper, useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { VideoRow } from './VideoRow'; // 👈 import child component
import { PaginationControls } from './PaginationControls'; // assuming you extracted this too

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

import { FavouriteRequest, handleAddToFavorites } from '@/lib/requests/FavouriteRequest'

import { CassetteTape, Film, FolderDown, Headphones, Link, ListPlus, ListStart, ListX, Music, Star, Tv, Video } from 'lucide-react';
import createLongPressHandlers from '@/lib/LongPressHandler';
import { channel } from 'diagnostics_channel';
import { HandlePlayCommand } from '@/lib/requests/PlayerHandlers';

type YTVideo = {
    title: string,
    channel: string,
    thumbnail: string,
    url: string,
    is_live: boolean,
    item_type: string,
    channel_url: string,
    duration: string,
    release_timestamp: string,
    upload_data: string
    id: string
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

const columnHelper = createColumnHelper<any>();
const columns = [
    columnHelper.accessor('title', { header: 'Title', cell: info => info.getValue() }),
    columnHelper.accessor('channel', { header: 'Channel', cell: info => info.getValue() }),
    columnHelper.accessor('thumbnail', { header: 'Thumbnail', cell: info => info.getValue() }),
];

export function SearchResultsTable({ searchString }: { searchString: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') ?? '1');
    const fetchUrl = `${process.env.NEXT_PUBLIC_YOUTUBE_API_ENDPOINT}?search=${encodeURIComponent(
        searchString
    )}&page=${page}`;

    const { data, error, isLoading } = useSWR(
        fetchUrl,
        url => fetch(url).then(res => res.json()),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 0,
            dedupingInterval: 10000,
        }
    );

    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [isCredenzaOpen, setCredenzaOpen] = useState(false);
    const [credenzaData, setCredenzaData] = useState<any | null>(null);

    function openCredenza(data: YTVideo) {
        setCredenzaData(data);
        setCredenzaOpen(true);
    }


    function handleLongPress(data: YTVideo) {
        openCredenza(data);
        console.log(data)
    }


    const table = useReactTable({
        data: data?.results ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;
    if (!data || !data.results) return <div>no data</div>;

    return (
        <div className="space-y-4">
            <PaginationControls
                currentPage={Number(searchParams.get('page') || 1)}
                resultCount={data.results.length}
            />

            <div>
                {table.getRowModel().rows.map(row => {
                    const video = row.original;

                    return (
                        <VideoRow
                            key={row.id}
                            video={video}
                            onLongPress={() => handleLongPress(video)}
                        />
                    );
                })}
            </div>

            <PaginationControls
                currentPage={Number(searchParams.get('page') || 1)}
                resultCount={data.results.length}
            />


            <YTCredenza
                open={isCredenzaOpen}
                onOpenChange={setCredenzaOpen}
                data={credenzaData}
            />


        </div>
    );
}

function YTCredenza({ open, onOpenChange, data }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: YTVideo | null;
}) {
    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent className='p-0'>
                <div className='w-full flex flex-col divide-y-[1px] divide-neutral-600'>

                    <div className='sticky top-0 p-4'>
                        <h1 className='pb-2 text-white font-semibold text-md overflow-x-scroll whitespace-nowrap max-w-full md:max-w-[18rem] flex w-full flex-row gap-1 items-center'>
                            <Film />
                            {data?.title}
                        </h1>

                        <div className='flex flex-row gap-4 '>
                            <img className='md:max-h-28 rounded max-h-20' src={data?.thumbnail} alt={data?.title} />
                            <div className='flex flex-col grow w-full'>
                                {/* <h1 className=' text-white font-semibold text-md overflow-x-scroll whitespace-nowrap max-w-[9rem] md:max-w-[18rem] flex w-full flex-row gap-2 items-center'>{data?.title}</h1> */}
                                {data?.is_live && (
                                    <span className="inline-flex items-center gap-1 bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded-md w-fit md:mt-3 mt-2">
                                        LIVE
                                    </span>
                                )}
                                <p className='text-neutral-200 font-light'>{data?.channel}</p>
                                <p className='text-neutral-200 font-light text-xs'>ID: {data?.id}</p>
                            </div>
                        </div>
                    </div>
                    {
                        data?.channel_url && (
                            <div className='flex flex-col p-2'>
                                <a href={data?.channel_url} target='_blank' className='flex flex-col'>
                                    <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Tv /> Open Channel</Button>
                                </a>
                            </div>
                        )
                    }
                    <div className=' px-2 py-2'>
                        <a href={data?.url} target='_blank' className='flex flex-col'>
                            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Link /> Open in YouTube</Button>
                            {/* <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Headphones /> Open in Navidrome</Button> */}
                        </a>
                    </div>

                    <div className='flex flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'
                        onClick={() => HandlePlayCommand(data?.url, null, "playnext")}
                        ><ListStart /> Play next</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Add to queue</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
                            onClick={() => {
                                if (data) handleAddToFavorites(
                                    {
                                        song: data?.title,
                                        artist: data?.channel,
                                        album_art: data?.thumbnail,
                                        url: data?.url

                                    }
                                )
                            }}
                        ><Star /> Save to Favourites</Button>


                    </div>
                    <div className='flex w-full flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-violet-500/10'
                            onClick={() => {
                                if (data) handleAddToFavorites(
                                    {
                                        song: data?.title,
                                        artist: data?.channel,
                                        album_art: data?.thumbnail,
                                        url: data?.url

                                    }
                                )
                            }}
                        >
                            <FolderDown /> Download
                        </Button>
                    </div>
                </div>

                {/* <CredenzaClose asChild>
                        <Button variant="outline">Close</Button>
                    </CredenzaClose> */}

            </CredenzaContent>
        </Credenza >
    );
}