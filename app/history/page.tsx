'use client';

import { useRef, useState } from "react";
import useSWR from "swr";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BookmarkMinus, Clock, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Crumbs from "@/components/crumbs";

import { ArrowUpDown, Asterisk, EllipsisVertical, FolderDown, Hash, Heart, HeartPlus, IdCard, Info, Link, ListEnd, ListPlus, ListStart, ListX, Loader2, Play, Redo, Search, SplinePointerIcon, Star } from 'lucide-react'



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
import { DeleteHandler } from "@/lib/requests/DeleteHandler";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`)
  };
  const rawData = await res.json();
  console.log("HISTORY")
  console.log(rawData)
  return rawData;
};

export default function HistoryPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: history, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/history`,
    fetcher
  );

  const filteredHistory = selectedType
    ? history?.filter((item: any) => item.player_type === selectedType)
    : history;

  return (
    <>
      <div className="p-4 h-[100dvh] flex flex-col md:px-[10vw]">

        <div className="flex flex-row text-blue-500 font-semibold text-xl items-center justify-between gap-x-2 mb-4">
          History
          <Clock className="w-[24px]" />
        </div>

        <FilterSec selectedType={selectedType} setSelectedType={setSelectedType} />

        <div className="flex-1 min-h-0">
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">Error loading history</div>}
          {filteredHistory && <HistorySec items={filteredHistory} />}
        </div>
      </div>
    </>
  );
}

type Props = {
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
};

function FilterSec({ selectedType, setSelectedType }: Props) {
  const filters = [
    { label: "MPV", value: "mpv" },
    { label: "MPD", value: "mpd" },
    { label: "Spotify", value: "spotify" },
  ];

  return (
    <div className="flex flex-row gap-2 items-center mb-4">
      <span className="text-sm text-muted-foreground">Filters:</span>

      {filters.map(({ label, value }) => {
        const isActive = selectedType === value;

        return (
          <Button
            key={value}
            variant="default"
            className={`
                            rounded-full px-3 py-1 text-sm border h-6
                            flex items-center gap-1
                            transition-colors duration-200
                            ${isActive
                ? "bg-blue-500 text-white ring-offset-neutral-800 hover:bg-blue-600 ring-2 ring-offset-1 ring-blue-600"
                : "bg-transparent text-white hover:text-black border-gray-300/50 hover:bg-gray-100"}
                        `}
            onClick={() =>
              isActive ? setSelectedType(null) : setSelectedType(value)
            }
          >
            {label}
            {isActive && (
              <X
                className="w-2 h-2 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedType(null);
                }}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
}

function HistorySec({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);

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


  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,


    estimateSize: (index) => {
      const song = items[index];
      if (!song) return 80;

      // Estimate height based on text length
      const nameLength = song.song_name?.length ?? 0;
      const artistLength = song.artist?.length ?? 0;

      // Base height (padding + serial number line)
      let estimatedHeight = 80;

      // Add height for long song names (roughly 40 chars per line on mobile)
      if (nameLength > 40) {
        const nameLines = Math.ceil(nameLength / 40);
        estimatedHeight += (nameLines - 1) * 28; // was 20
      }

      // Add height for long artist names
      if (artistLength > 50) {
        const artistLines = Math.ceil(artistLength / 50);
        estimatedHeight += (artistLines - 1) * 24; // was 18
      }

      return estimatedHeight;
    },
    overscan: 5,
  });

  return (
    <>
      <div
        ref={parentRef}
        className="relative max-h-full overflow-y-auto overflow-x-hidden"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const longPressHandlers = createLongPressHandlers(item, handleLongPress);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <motion.div
                  ref={rowVirtualizer.measureElement}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-row justify-between w-full px-4 py-4 md:hover:border-2 md:border-neutral-500/15 md:hover:shadow hover:border-blue-700/50 transition active:scale-[99%] rounded-lg hover:bg-blue-800/10 items-center group select-none"
                  {...longPressHandlers}
                >
                  <div className="flex flex-col w-full gap-1">
                    <p
                      className="text-white font-semibold text-base break-words transition w-full group-active:text-indigo-400"
                    >
                      {item.song_name}
                    </p>
                    <div className="text-sm text-neutral-400 font-semibold flex flex-row justify-between gap-2">
                      <span>{item.player_type}</span>
                      <span>
                        {new Date(item.time).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
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


  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className='p-0'>
        <div className='w-full flex flex-col divide-y-[1px] divide-neutral-600'>
          <div className='sticky top-0 flex flex-row gap-4 p-4'>
            {/* <img className='md:max-h-28 rounded max-h-20' src={data?.image_url} alt={data?.id} /> */}
            <div className='flex flex-col grow justify-center w-full'>
              <h1 className='text-white font-semibold text-xl w-full whitespace-break-spaces'
              >
                {data?.song_name}
              </h1>
              <p className='text-neutral-200 font-light'>{data?.publisher}</p>
              <p className='text-neutral-200 font-light text-xs'>
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
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListStart /> Play next</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Add to queue</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
              onClick={() => { if (data) handleAddToFavorites(data) }}
            ><Star /> Save to Favourites</Button>


          </div>
          <div className='flex w-full flex-col p-2'>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-violet-500/10'><FolderDown /> Download</Button>
          </div>
          <div className='flex flex-col p-2'>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListStart /> Play Latest Episode</Button>
            {/* <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Hello</Button> */}
            {/* <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button> */}
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
              onClick={() => {
                DeleteHandler({
                  server_url: process.env.NEXT_PUBLIC_PODCAST_SAVE_ENDPOINT!,
                  cell_id: data?.cell_id
                })
              }}
            >
              <BookmarkMinus /> Remove From Bookmarks
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