'use client'

const LOCAL_FETCH_URL = "http://192.168.0.123:8000/songs"

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { create } from 'domain';
import { ArrowUpDown, Clock, IdCard, Loader2, Play, SplinePointerIcon } from 'lucide-react'
import { useState, useEffect } from 'react';
import useSWR from 'swr'

import { cn } from "@/lib/utils"


// const fetcher = (url: string) => fetch(url).then(res => res.json())

// ✅ Modified fetcher for SWR
const fetcher = async (url: string): Promise<SongsData> => {
  const res = await fetch(url);
  const rawData: SongsData = await res.json();
  return addSerialNumbers(rawData);
};


type Song = {
  file: string;
  title: string;
  artist: string;
  album: string;
  track: string;
  duration: number;
  size_bytes: number;
  size_mb: number;
  serial?: number; // optional at first, will be added
};

type SongsData = {
  songs: Song[];
};

async function addSerialNumbers(data :SongsData): Promise<SongsData> {
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

export default function Local(){
    return (
        <div className='px-10 py-2'>
        <Table className='border-4 border-blue-500 rounded-2xl overflow-hidden'/>
    </div>
    )
}

export function Table({ className }: { className?: string }) {
    // const response = await fetch(LOCAL_FETCH_URL)
    
    // const data = await response.json()
    const { data: SongsData, error, isLoading } = useSWR(LOCAL_FETCH_URL, fetcher)

    const [songDataTable, setSongDataTable] = useState<Song[]>([]);
    const [sorting, setSorting] = useState([])

    useEffect(() => {
        if (SongsData && SongsData.songs) {
            setSongDataTable([...SongsData.songs]);
        }
    }, [SongsData]);


    // const serialisedData = addSerialNumbers(data)
    // data is the stable ref returned, so can work with tanstack now.

    const columnHelper = createColumnHelper<Song>()

    const columns = [
        columnHelper.accessor("serial", {
            // cell is a callback fun, returns, that we named info
            cell:  (info) => (
                <div>
                    <div className='hidden group-hover/cell:block'>
                    <Play />
                    </div>
                    <div className='block group-hover/cell:hidden'>
                        {info.getValue()}
                    </div>
                </div>
            ),
            header: () => (
                <span className='flex items-center whitespace-nowrap gap-2'>
                    <IdCard /> SERIAL
                </span>
            )
        }),

        columnHelper.accessor("title", {
            // cell is a callback fun, returns, that we named info
            cell:  (info) => info.getValue(),
            header: () => (
                <span className='flex items-center'>
                    ARTIST
                </span>
            )
        }),

        columnHelper.accessor("artist", {
            // cell is a callback fun, returns, that we named info
            cell:  (info) => (
                <span className='italic text-white/70 '>{info.getValue()}</span>
            ),
            header: () => (
                <span className='flex items-center '>
                    Artist
                </span>
            )
        }),

        columnHelper.accessor("duration", {
            cell: (info) => formatDuration(info.getValue()),
            header: () => (
                <span className='flex items-center'>
                    <Clock /> Duration
                </span>
            )
        })
    ]

    const table = useReactTable({
        data: songDataTable,
        columns,
        state: {
            sorting
        },
        getCoreRowModel: getCoreRowModel(),

        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel()
    })

    console.log(SongsData)
    
    // console.log(serialisedData)


    if (error) return <div>failed to load</div>
    if (isLoading) return (
        <div>
            <Loader2 className='spin animate-spin' />
        </div>
    )
    if (!SongsData || !SongsData.songs) return <div>no data</div>
    
    // render data
    
    // console.log(table.getRowModel())


    return (
            // <h2>- Song Titles -</h2>
            // <ul className='list-disc'>
            //     {SongsData.songs.map((song: Song, idx: number) => (
            //         <li key={idx}>{song.serial} - {song.title} - {song.artist}</li>
            //     ))}
            // </ul> 
            <table className={cn("", className)}>
                <thead className='bg-green-400/20 w-full'>
                    {
                        table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {
                                    headerGroup.headers.map((header) => (
                                        <th key={header.id} className='text-white'>
                                            <div 
                                            {
                                                ...{
                                                    className: header.column.getCanSort() ? "cursor-pointer select-none flex item-center align-middle" : "",
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }
                                            }
                                            >

                                            
                                            {
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            }
                                            <ArrowUpDown className='ml-2' size={20}/>
                                            </div>
                                        </th>
                                        
                                    ))
                                    
                                }
                            </tr>
                        ))
                    }
                </thead>
                <tbody className=''>
                    {
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className='hover:bg-gray-300/50 rounded-lg group/cell'>
                                {
                                    row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className='px-6 text-sm'>
                                            <div className='whitespace-nowrap max-w-xs  overflow-x-auto  py-4'>
                                                {
                                                flexRender(cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )
                                            }
                                            </div>

                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
    )


    // console.log(data)


    // return ( 
    //     <p>Local</p>
    //  );
}