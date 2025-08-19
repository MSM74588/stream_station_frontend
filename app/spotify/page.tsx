'use client'

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { create } from 'domain';
import { ArrowUpDown, Asterisk, Clock, EllipsisVertical, FolderDown, Hash, Heart, HeartPlus, IdCard, Info, Link, ListEnd, ListPlus, ListStart, ListX, Loader2, Play, Redo, Search, SplinePointerIcon, Star } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr'

import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';



import { Input } from "@/components/ui/input"


import { useVirtualizer } from '@tanstack/react-virtual'

import { toast } from "sonner"

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

import createLongPressHandlers from "@/lib/LongPressHandler"
import { HandlePlayCommand } from '@/lib/requests/PlayerHandlers';


// const fetcher = (url: string) => fetch(url).then(res => res.json())

// ✅ Modified fetcher for SWR
// const fetcher = async (url: string): Promise<SongsData> => {
//     const res = await fetch(url);
//     if (!res.ok) {
//         throw new Error(`Fetch failed: ${res.status}`);
//     }
//     const rawData: Song[] = await res.json();
//     return addSerialNumbers({ songs: rawData });
// };

const fetcher = async (url: string): Promise<SongsData> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
    }
    const rawJson = await res.json();

    // The API now returns { items: [...] }
    const items = rawJson.items ?? [];

    // Map API fields -> your Song type
    const mappedSongs: Song[] = items.map((item: any) => ({
        id: item.id,
        name: item.song_name,          // was "name"
        artist: item.artists ?? "Unknown Artist",
        album_art: item.image_url,     // was "album_art"
        spotify_url: item.spotify_url,
    }));

    return addSerialNumbers({ songs: mappedSongs });
};

type Song = {
    id: string;
    name: string;
    artist: string;
    album_art: string;
    serial?: number;
    spotify_url: string;
    album_id?: string;
    album_name?: string;
    album_url?: string;
};


type SongsData = {
    songs: Song[];
};


// function handlePlay(url: string) {
//     toast.info("Play Request sent.")
//     fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/player/play`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ url: url }),
//     })
//         .then((res) => {
//             if (!res.ok) {
//                 toast.error('Failed to Play');
//                 throw new Error("Failed to play");
//             }

//             return res.json();
//         })
//         .then((data) => {
//             console.log("Playing song:", data);
//         })
//         .catch((err) => {
//             console.error("Error playing song:", err);
//         });
// }

async function handleAddToFavorites(song: Song) {
    try {
        const toastId = toast.loading("Adding to bookmarks...");
        // 1. Fetch image and convert to Blob
        const imageResponse = await fetch(song.album_art);
        const imageBlob = await imageResponse.blob();

        // 2. Prepare form data
        const formData = new FormData();
        formData.append("song_name", song.name);
        formData.append("artist", song.artist);
        formData.append("url", song.spotify_url);
        formData.append("image", imageBlob, "thumbnail.jpg");
        formData.append("thumbnail_constructor_url", process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "")

        // 3. Send POST request
        const res = await fetch(`${process.env.NEXT_PUBLIC_FAVOURITES_ENDPOINT}`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            if (res.status == 409) {
                toast.warning("Already Added to Favourites!", { id: toastId })

            } else {
                toast.error("Failed to add to favorites", { id: toastId });

            }
            throw new Error(`Server responded with ${res.status}`);
        }

        toast.success("Bookmarked successfully!", { id: toastId });
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}


async function addSerialNumbers(data: SongsData): Promise<SongsData> {
    return {
        ...data,
        songs: data.songs.map((song, index) => ({
            ...song,
            serial: index + 1, // or use 'serial: index + 1' if you prefer that name
        })),
    };
}

// Helper function to format seconds to mm:ss
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}


// TOP LEVEL
export default function SpotifyPage() {
    return (
        <div className='pt-2 pb-2 px-4 md:px-10 md:py-2 grow flex w-full flex-col gap-4 h-dvh'>
            <Table className='' />
        </div>
    )
}




export function Table({ className }: { className?: string }) {
    // CREDENZA related
    // Credenza State
    const [isCredenzaOpen, setCredenzaOpen] = useState(false);
    const [credenzaData, setCredenzaData] = useState<Song | null>(null);

    function openCredenza(data: Song) {
        setCredenzaData(data);
        setCredenzaOpen(true);
    }


    function handleLongPress(data: Song) {
        openCredenza(data);
    }





    // const response = await fetch(LOCAL_FETCH_URL)

    // const data = await response.json()
    console.log("Fetch URL:", `${process.env.NEXT_PUBLIC_SPOTIFY_LIKED_ENDPOINT}`);
    const { data: SongsData, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_SPOTIFY_LIKED_ENDPOINT}`, fetcher)

    const [songDataTable, setSongDataTable] = useState<Song[]>([]);
    const [sorting, setSorting] = useState([])
    const [globalFilter, setGlobalFilter] = useState("")

    // TanStack Virtual Related
    const parentRef = useRef<HTMLDivElement>(null)

    const desktopParentRef = useRef<HTMLDivElement>(null)
    const mobileParentRef = useRef<HTMLDivElement>(null)

    console.log("Songs data:", SongsData)


    useEffect(() => {
        if (SongsData && SongsData.songs) {
            setSongDataTable([...SongsData.songs]);
        }
    }, [SongsData]);

    const columnHelper = createColumnHelper<Song>()

    const columns = [
        columnHelper.accessor("album_art", {
            // cell is a callback fun, returns, that we named info
            cell: (info) => (
                <span className='flex-grow grid place-items-center transition-all duration-500'>
                    <div className=' py-2 group-hover/cell:scale-[250%] transition group-hover/cell:rounded-3xl z-10'
                        // onClick={() => handlePlay(info.row.original.spotify_url)}
                        onClick={() => HandlePlayCommand(info.row.original.spotify_url, null, "playnow")}

                    >

                        <img className='h-8 w-8 aspect-square  content group-hover/cell:shadow-lg group-hover/cell:border-4 border-neutral-900 shadow outline group-hover/cell:rounded-3xl rounded-xs
                         duration-150 ease-linear
                        outline-black z-10 group-hover/cell:z-50 ' src={info.getValue()} alt="m" />
                    </div>
                </span>
            ),
            header: () => (
                <div className='whitespace-nowrap p-0 md:pl-[3vh]'>
                    <Hash />
                </div>
            )
        }),

        columnHelper.accessor("name", {
            // cell is a callback fun, returns, that we named info
            cell: (info) => (
                <div className='flex items-center justify-center content-center overflow-x-scroll max-w-md'>
                    <p>{info.getValue()}</p>
                </div>
            ),
            header: () => (
                <span className='flex items-center'>
                    Title
                </span>
            )
        }),

        columnHelper.accessor("artist", {
            // cell is a callback fun, returns, that we named info
            cell: (info) => (
                <span className='italic text-white/70 grid  content-center overflow-auto max-w-lg'>{info.getValue()}</span>
            ),
            header: () => (
                <span className='flex items-center '>
                    Artist
                </span>
            )
        }),

        columnHelper.accessor("id", {
            cell: (info) => (
                <span className='flex w-full justify-end items-center grow pr-6 flex-row gap-3'>
                    {/* {info.getValue()} */}
                    <Button variant={'ghost'}
                        className='active:scale-[120%] transition duration-100 hover:bg-pink-500/60 hover:text-pink-500 border-transparent border-2 aspect-square hover:border-pink-500 rounded-full active:translate-x-1'
                        onClick={() => handleAddToFavorites(info.row.original)}
                    >
                        <HeartPlus />
                    </Button>

                    <Button variant={'ghost'} className=' active:scale-[120%] transition duration-100 hover:bg-neutral-500/60 hover:text-neutral-100 border-transparent border-2 aspect-square hover:border-neutral-600 rounded-full active:translate-x-1'
                        onClick={() => openCredenza(info.row.original)}
                    ><EllipsisVertical /></Button>
                </span>
            ),
            header: () => (
                <span className='p-0'>
                    <Asterisk />
                </span>
            )
        })
    ]

    const table = useReactTable({
        data: songDataTable,
        columns,
        getRowId: row => row.id,
        state: {
            sorting,
            globalFilter
        },
        getCoreRowModel: getCoreRowModel(),

        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),

        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel()
    })

    console.log(SongsData)





    // const virtualRows = rowVirtualizer.getVirtualItems()
    // const totalSize = rowVirtualizer.getTotalSize()
    // console.log(serialisedData)

    const desktopVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => desktopParentRef.current,
        estimateSize: () => 48,
        overscan: 10,
    })

    const mobileVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => mobileParentRef.current,
        estimateSize: (index) => {
            const row = table.getRowModel().rows[index];
            if (!row) return 80;
            
            const song = row.original;
            // Estimate height based on text length
            const nameLength = song.name.length;
            const artistLength = song.artist.length;
            
            // Base height (padding + serial number line)
            let estimatedHeight = 64;
            
            // Add height for long song names (roughly 40 chars per line on mobile)
            if (nameLength > 40) {
                const nameLines = Math.ceil(nameLength / 40);
                estimatedHeight += (nameLines - 1) * 20; // 20px per additional line
            }
            
            // Add height for long artist names
            if (artistLength > 50) {
                const artistLines = Math.ceil(artistLength / 50);
                estimatedHeight += (artistLines - 1) * 18; // 18px per additional line
            }
            
            return estimatedHeight;
        },
        overscan: 5,
    })




    if (error) {
        console.error("SWR error:", error);
        return <div>failed to load</div>
    }

    if (isLoading) return (
        <div>
            <Loader2 className='spin animate-spin' />
        </div>
    )
    if (!SongsData || !SongsData.songs) return <div>no data</div>

    return (
        <>

            <div className='flex w-full items-center gap-2'>
                <Input placeholder='Search' className='w-full'
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <Button className='text-white' variant={'outline'}>
                    <Search />
                    {/* USE this button later to fetch songs, to reduce compute on user device, implement an api for that. */}
                </Button>
            </div>
            {/* DESKTOP UI */}
            <div className={cn("space-y-1 hidden md:block", className)}>
                {/* Headers */}
                <div className="grid grid-cols-[7vw_1fr_1fr_7vw] py-2 text font-semibold text-muted-foreground rounded divide-x-2 gap-4 divide-white/20 dark:bg-neutral-800/80">
                    {table.getHeaderGroups().map(headerGroup =>
                        headerGroup.headers.map(header => (
                            <div
                                key={header.id}
                                className="flex items-center cursor-pointer select-none justify-center "
                                onClick={header.column.getToggleSortingHandler()}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <ArrowUpDown className="h-4 aspect-square" />
                            </div>
                        ))
                    )}
                </div>

                {/* Virtualized Rows */}
                <div
                    ref={desktopParentRef}
                    style={{ overflow: 'auto', maxHeight: '80vh', position: 'relative' }}
                >
                    <div
                        style={{
                            height: `${desktopVirtualizer.getTotalSize()}px`,
                            position: 'relative',
                            width: '100%',
                        }}
                    >
                        {desktopVirtualizer.getVirtualItems().map(virtualRow => {
                            const row = table.getRowModel().rows[virtualRow.index]
                            return (
                                <div
                                    tabIndex={0}
                                    key={row.id}
                                    ref={desktopVirtualizer.measureElement}
                                    style={{
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                onDoubleClick={() => HandlePlayCommand(row.original.spotify_url, null, "playnow")}
                                >
                                    <div className='group/cell grid grid-cols-[7vw_1fr_1fr_7vw] gap-x-4 h-12 dark:hover:bg-neutral-700/20 cursor-pointer rounded transition duration-75 absolute w-full active:scale-[99%]'>
                                        {row.getVisibleCells().map(cell => (
                                            <div key={cell.id} className="w-full truncate flex overflow-visible pointer-events-auto z-10">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            {/* MOBILE UI */}
            <div className="md:hidden space-y-2 grow">
                <div className="flex justify-around pb-2 text-sm text-white/60 font-medium">
                    {table.getHeaderGroups().map(headerGroup =>
                        headerGroup.headers.map(header => (
                            <button
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className="flex items-center gap-1"
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                        ))
                    )}
                </div>

                <div
                    ref={mobileParentRef}
                    style={{ overflow: 'auto', maxHeight: '75dvh', position: 'relative' }}
                    className="rounded border border-white/10"
                >
                    <div
                        style={{
                            height: `${mobileVirtualizer.getTotalSize()}px`,
                            position: 'relative',
                            width: '100%',
                        }}
                    >
                        {mobileVirtualizer.getVirtualItems().map(virtualRow => {
                            const row = table.getRowModel().rows[virtualRow.index]

                            const song = row.original
                            const longPressHandlers = createLongPressHandlers(song, handleLongPress);

                            return (
                                <div
                                    key={row.id}
                                    data-index={virtualRow.index}
                                    ref={(el) => mobileVirtualizer.measureElement(el)}
                                    className="absolute left-0 right-0"
                                    style={{
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div
                                        className="flex items-start p-3 gap-3 rounded-lg hover:bg-neutral-700/70 transition active:scale-[95%] group mb-2"
                                        onDoubleClick={() => HandlePlayCommand(row.original.spotify_url, null, "playnow")}
                                        {...longPressHandlers}
                                    >
                                        <div className="text-lg font-semibold text-white/80 min-w-[3rem] text-center pt-1 select-none flex-shrink-0">
                                            {row.original.serial}
                                        </div>

                                        <div className="flex-grow min-w-0 max-w-[calc(100vw-8rem)]">
                                            <div className="text-white text-sm select-none group-active:text-green-500 transition duration-75 break-words leading-5">
                                                {row.original.name}
                                            </div>
                                            <div className="text-sm text-white/60 select-none break-words leading-4 mt-1">
                                                {row.original.artist}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>



            <SongCredenza
                open={isCredenzaOpen}
                onOpenChange={setCredenzaOpen}
                data={credenzaData}
            />


        </>
    )
}


function SongCredenza({ open, onOpenChange, data }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Song | null;
}) {

    
    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent className='p-0'>
                <div className='w-full flex flex-col divide-y-[1px] divide-neutral-600'>
                    <div className='sticky top-0 flex flex-row gap-4 p-4'>
                        <img className='md:max-h-28 rounded max-h-20' src={data?.album_art} alt={data?.id} />
                        <div className='flex flex-col w-full justify-center'>
                            <h1 className='text-white font-semibold text-xl whitespace-break-spaces w-full'>{data?.name}</h1>
                            <p className='text-neutral-200 font-light'>{data?.artist}</p>
                            <p className='text-neutral-200 font-light text-xs'>{data?.id}</p>
                        </div>
                    </div>
                    <div className=' px-2 py-2'>
                        <a href={data?.spotify_url} target='_blank' className='flex flex-col'>
                            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Link /> Open in Spotify</Button>
                        </a>
                    </div>
                    <div className='flex flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'
                        onClick={() => HandlePlayCommand(data?.spotify_url, null, "playnext")}
                        ><ListStart /> Play next</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Add to queue</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
                            onClick={() => { if (data) handleAddToFavorites(data) }}
                        ><Star /> Save to Favourites</Button>


                    </div>
                    <div className='flex w-full flex-col p-2'>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-violet-500/10'><FolderDown /> Download</Button>
                    </div>
                </div>

                {/* <CredenzaClose asChild>
                        <Button variant="outline">Close</Button>
                    </CredenzaClose> */}

            </CredenzaContent>
        </Credenza>
    );
}