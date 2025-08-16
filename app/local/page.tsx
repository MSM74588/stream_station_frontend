'use client'

import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  CassetteTape,
  Clock,
  EllipsisVertical,
  FolderDown,
  Hash,
  Headphones,
  HeartPlus,
  Link,
  ListPlus,
  ListStart,
  ListX,
  Loader2,
  Music,
  Play,
  Search,
  Star,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import useSWR from 'swr';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Crumbs from '@/components/crumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
import createLongPressHandlers from '@/lib/LongPressHandler';
import { HandlePlayCommand } from '@/lib/requests/PlayerHandlers';

const fetcher = async (url: string): Promise<SongsData> => {
  const res = await fetch(url);
  const rawData: SongsData = await res.json();
  return addSerialNumbers(rawData);
};

export type Song = {
  file: string;
  title: string;
  artist: string;
  album: string;
  track: string;
  duration: number;
  size_bytes: number;
  size_mb: number;
  serial?: number;
};

export type SongsData = {
  songs: Song[];
};

async function handleAddToFavorites(song: Song) {
    try {
        const toastId = toast.loading("Adding to bookmarks...");
        // 1. Fetch image and convert to Blob
        // const imageResponse = await fetch(song.album_art);
        // const imageBlob = await imageResponse.blob();
        console.log(song)
        // 2. Prepare form data
        const formData = new FormData();
        formData.append("song_name", song.title);
        formData.append("artist", song.artist);
        formData.append("url", song.file);
        // formData.append("image", imageBlob, "thumbnail.jpg");
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

function handlePlay(songName: string) {
  toast.info("Play Request sent.")
  fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/player/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ song_name: songName }),
  })
    .then((res) => {
      if (!res.ok) {
        toast.error("Failed to play.")
        throw new Error('Failed to play');
      }
      return res.json();
    })
    .then((data) => console.log('Playing song:', data))
    .catch((err) => console.error('Error playing song:', err));
}

async function addSerialNumbers(data: SongsData): Promise<SongsData> {
  return {
    ...data,
    songs: data.songs.map((song, index) => ({ ...song, serial: index + 1 })),
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Local() {
  return (
    <div className='pb-4 pt-2 px-4 md:px-10 md:py-2 grow flex w-full flex-col gap-4'>
      <Table className='' />
    </div>
  );
}

export function Table({ className }: { className?: string }) {
  const { data: SongsData, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_SERVER_URL}/songs`, fetcher);
  const [songDataTable, setSongDataTable] = useState<Song[]>([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (SongsData?.songs) setSongDataTable([...SongsData.songs]);
  }, [SongsData]);

  const columnHelper = createColumnHelper<Song>();

  const columns = [
    columnHelper.accessor('serial', {
      cell: (info) => (
        <span className='flex-grow grid place-items-center transition-all duration-500'>
          <div className='hidden group-hover/cell:inline-block invisible group-hover/cell:visible'>
            <Button
              onClick={() => HandlePlayCommand(null, info.row.original.title, "playnow")}
              className='cursor-pointer shadow-lg shadow-blue-500/50 outline-4 ring ring-indigo-500/70 hover:scale-200 hover:rounded-full rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30'
              variant={'secondary'}>
              <Play className='aspect-square h-8 w-8' size={24} />
            </Button>
          </div>
          <div className='block group-hover/cell:hidden py-2'>{info.getValue()}</div>
        </span>
      ),
      header: () => <div className='whitespace-nowrap p-0 md:pl-[3vh]'><Hash /></div>,
    }),
    columnHelper.accessor('title', {
      cell: (info) => <div className='grid content-center'><p>{info.getValue()}</p></div>,
      header: () => <span className='flex items-center'>Title</span>,
    }),
    columnHelper.accessor('artist', {
      cell: (info) => <span className='italic text-white/70 grid content-center'>{info.getValue()}</span>,
      header: () => <span className='flex items-center'>Artist</span>,
    }),
    columnHelper.accessor('duration', {
      cell: (info) => <span className='grid place-items-center flex-grow'>{formatDuration(info.getValue())}</span>,
      header: () => <span className='p-0'><Clock /></span>,
    }),
  ];

  const table = useReactTable({
    data: songDataTable,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });

  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const desktopVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => desktopRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const mobileVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => mobileRef.current,
    estimateSize: (index) => {
      const row = table.getRowModel().rows[index];
      if (!row) return 80;
      
      const song = row.original;
      // Estimate height based on text length
      const titleLength = song.title.length;
      const artistLength = song.artist.length;
      
      // Base height (padding + serial number line)
      let estimatedHeight = 64;
      
      // Add height for long song titles (roughly 40 chars per line on mobile)
      if (titleLength > 40) {
        const titleLines = Math.ceil(titleLength / 40);
        estimatedHeight += (titleLines - 1) * 20; // 20px per additional line
      }
      
      // Add height for long artist names
      if (artistLength > 50) {
        const artistLines = Math.ceil(artistLength / 50);
        estimatedHeight += (artistLines - 1) * 18; // 18px per additional line
      }
      
      return estimatedHeight;
    },
    overscan: 5,
  });

  const [isCredenzaOpen, setCredenzaOpen] = useState(false);
  const [credenzaData, setCredenzaData] = useState<Song | null>(null);

  function openCredenza(data: Song) {
    setCredenzaData(data);
    setCredenzaOpen(true);
  }

  function handleLongPress(data: Song) {
    openCredenza(data);
    console.log("LONG PERESSED?")
  }

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div><Loader2 className='spin animate-spin' /></div>;
  if (!SongsData?.songs) return <div>no data</div>;

  return (
    <>
      <div className='flex w-full items-center gap-2 flex-grow'>
        <Input placeholder='Search' className='w-full' value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        <Button className='text-white' variant={'outline'}><Search /></Button>
      </div>

      {/* DESKTOP */}
      <div className={cn('space-y-1 hidden md:block', className)}>
        <div className='grid grid-cols-[7vw_1fr_1fr_10vw_1fr] py-2 text font-semibold text-muted-foreground rounded divide-x-2 gap-4 divide-white/20 dark:bg-neutral-800/80'>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map(header => (
              <div
                key={header.id}
                className='flex items-center cursor-pointer select-none justify-center'
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                <ArrowUpDown className='h-4 aspect-square' />
              </div>
            ))
          )}
        </div>

        <div ref={desktopRef} style={{ overflow: 'auto', maxHeight: '80vh', position: 'relative' }}>
          <div style={{ height: `${desktopVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {desktopVirtualizer.getVirtualItems().map(virtualRow => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={(el) => desktopVirtualizer.measureElement(el)}
                  className='absolute left-0 right-0'
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                  onDoubleClick={() => HandlePlayCommand(null, row.original.title, "playnow" )}
                >
                  <div className='active:scale-[99%] group/cell grid grid-cols-[7vw_1fr_1fr_10vw_1fr] gap-x-4 h-12 dark:hover:bg-white/10 cursor-pointer group rounded duration-75 transition mb-1'>
                    {row.getVisibleCells().map(cell => (
                    <div key={cell.id} className='w-full truncate flex '>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                  <OptionArea openCredenza={openCredenza} data={row.original}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className='md:hidden space-y-2'>
        <div className='flex justify-around pb-2 text-sm text-white/60 font-medium'>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map(header => (
              <button
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                className='flex items-center gap-1'
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                <ArrowUpDown className='h-4 w-4' />
              </button>
            ))
          )}
        </div>

        <div ref={mobileRef} style={{ overflow: 'auto', maxHeight: '70vh', position: 'relative' }} className='rounded border border-white/10'>
          <div style={{ height: `${mobileVirtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
            {mobileVirtualizer.getVirtualItems().map(virtualRow => {
              const row = table.getRowModel().rows[virtualRow.index];
              const song = row.original
              const longPressHandlers = createLongPressHandlers(song, handleLongPress);

              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={(el) => mobileVirtualizer.measureElement(el)}
                  className='absolute left-0 right-0'
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className='flex items-start p-3 gap-3 rounded-lg hover:bg-neutral-700/70 transition group active:scale-[95%] select-none hover:shadow-lg mb-2'
                    onDoubleClick={() => HandlePlayCommand(null, row.original.title, "playnow" )}
                    {...longPressHandlers}
                  >
                    <div className='text-lg font-semibold text-white/80 min-w-[3rem] text-center pt-1 flex-shrink-0'>{row.original.serial}</div>
                    <div className='flex-grow min-w-0 max-w-[calc(100vw-8rem)]'>
                      <div className='text-white text-sm group-active:text-yellow-400 break-words leading-5'>{row.original.title}</div>
                      <div className='text-sm text-white/60 break-words leading-4 mt-1'>{row.original.artist}</div>
                    </div>
                  </div>
                </div>
              );
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
  );
}

function SongCredenza({ open, onOpenChange, data }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Song;
}) {
  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className='p-0'>
        <div className='w-full flex flex-col divide-y-[1px] divide-neutral-600'>
          <div className='sticky top-0 flex w-full flex-row gap-4 p-4'>
            {/* <img className='md:max-h-28 rounded max-h-20' src={data?.album_art} alt={data?.id} /> */}
            <div className='flex flex-col grow justify-center w-full'>
              <h1 className=' text-white font-semibold text-xl overflow-x-scroll whitespace-break-spaces flex w-full flex-row gap-2 items-center'><Music/> {data?.title}</h1>
              <p className='text-neutral-200 font-light'>{data?.artist}</p>
              <p className='text-neutral-200 font-light text-xs'>{data?.file}</p>
            </div>
          </div>
          <div className=' px-2 py-2'>
            <a href="/" target='_blank' className='flex flex-col'>
              <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><CassetteTape /> Open in CopyParty</Button>
              <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Headphones /> Open in Navidrome</Button>
            </a>
          </div>
          <div className='flex flex-col p-2'>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'
            onClick={() => HandlePlayCommand(null, data.title, "playnext")}
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

function OptionArea({ data, openCredenza }: { data: Song; openCredenza: (data: Song) => void }) {
  console.log(data)
  return (
    <span className='flex w-full justify-end items-center grow pr-6 flex-row gap-3'>
      <Button variant={'ghost'}
        className='active:scale-[120%] transition duration-100 hover:bg-pink-500/60 hover:text-pink-500 border-transparent border-2 aspect-square hover:border-pink-500 rounded-full active:translate-x-1'
        onClick={() => handleAddToFavorites(data)}
      >
        <HeartPlus />
      </Button>

      <Button variant={'ghost'} className=' active:scale-[120%] transition duration-100 hover:bg-neutral-500/60 hover:text-neutral-100 border-transparent border-2 aspect-square hover:border-neutral-600 rounded-full active:translate-x-1'
        onClick={() => openCredenza(data)}
      ><EllipsisVertical /></Button>
    </span>
  )
}