"use client"

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { YoutubeIcon } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Film, Heart, ListVideo, Search } from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from "@/lib/utils"
import useSWR from 'swr'
import { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Clock, Hash, IdCard, Info, Loader2, Play, SplinePointerIcon, Radio, Youtube, Calendar, User } from 'lucide-react'
import { SearchResultsTable } from '@/components/SearchResultsTable';
import { format } from 'date-fns';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Crumbs from '@/components/crumbs';
import { FavouritesSection } from '@/components/FavouritesSection';


const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }
  const rawData = await res.json();
  console.log(rawData)
  return rawData
};

type VideoData = {
  type: 'video';
  title: string;
  id: string;
  url: string;
  channel: string;
  channel_url: string;
  upload_date: string;
  thumbnail: string;
  duration: number | null;
  release_timestamp: number;
  is_live: boolean;
};


export default function YTPage() {
  const [searchString, setSearchString] = useState("");
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(false);

  return (
    <div className="px-3 md:px-[10vw] py-7 w-full gap-y-5 flex flex-col">
      <SearchSection
        searchString={searchString}
        setSearchString={setSearchString}
        onSearch={() => setConfirmedSearch(searchString)}
      />

      {/* Only show if not searching or no results */}
      {!confirmedSearch || !hasSearchResults ? (
        <>
          <FavouritesSection />
          <PlaylistsSection />
        </>
      ) : null}

      <Table
        searchString={confirmedSearch}
        onResultStatusChange={setHasSearchResults}
      />
    </div>
  );
}



export function PlaylistsSection() {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-row text-red-500 font-semibold text-xl items-center justify-between gap-x-2">
        Playlists
        <ListVideo className="w-[24px]" />
      </div>

    </div>
  )
}



export function SearchSection({
  searchString,
  setSearchString,
  onSearch
}: {
  searchString: string;
  setSearchString: (v: string) => void;
  onSearch: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full flex flex-col border-2 border-rose-800 rounded-lg has-focus-within:ring-2 ring-rose-400/50 ring-0 divide-neutral-600/70 divide-y-2 overflow-hidden">
        <div className="w-full px-3 py-2">
          <input
            className="w-full focus:outline-0"
            placeholder="Paste URL or Search a Video, Playlist or a Query"
            type="text"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
        <div className="bg-neutral-900 px-3 py-2 flex flex-row justify-between items-center overflow-scroll gap-2">
          <div className="flex flex-row gap-3 ">
            <div className="flex flex-row gap-2 font-semibold">
              <YoutubeIcon className="w-[24px] text-red-500" />
              Youtube
            </div>
            <div className="md:flex gap-2 flex-row items-center hidden">
              <div className="px-2 flex grow-0 flex-row gap-1 font-semibold bg-neutral-600/50 rounded-full border-[1px] border-neutral-700 items-center">
                <Film className="w-[15px]" />
                Video
              </div>
              <div className="px-2  flex grow-0 flex-row gap-1 font-semibold bg-neutral-600/50 rounded-full border-[1px] border-neutral-700 items-center">
                <ListVideo className="w-[15px]" />
                Playlist
              </div>
              <div className="px-2  flex grow-0 flex-row gap-1 font-semibold bg-neutral-600/50 rounded-full border-[1px] border-neutral-700 items-center">
                <Search className="w-[15px]" />
                Search
              </div>
            </div>
          </div>

          <Button variant={"outline"} type="submit">
            <Search />
          </Button>
        </div>
      </div>
    </form>
  );
}


export function Table({
  searchString,
  className,
  onResultStatusChange,
}: {
  searchString: string;
  className?: string;
  onResultStatusChange?: (hasResults: boolean) => void;
}) {
  const { data: SearchData, error, isLoading } = useSWR(
    searchString ? `${process.env.NEXT_PUBLIC_SERVER_URL}/search/youtube?search=${encodeURIComponent(searchString)}` : null,
    fetcher
  );

  useEffect(() => {
    if (onResultStatusChange) {
      onResultStatusChange(!!SearchData); // true if results are present
    }
  }, [SearchData, onResultStatusChange]);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div><Loader2 className='spin animate-spin' /></div>;
  if (!SearchData) return <div>no data</div>;

  switch (SearchData.type) {
    case "video":
      return <VideoTable data={SearchData} />;
    case "playlist":
      return <PlaylistTable data={SearchData.results} />;
    case "search":
      return <SearchResultsTable searchString={searchString} />;
    default:
      return <div>Unsupported content type</div>;
  }
}



export function VideoTable({ data }: { data: VideoData }) {
  return (
    <div className="border border-white/20 rounded p-4 bg-white/5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        <Radio className="w-5 h-5 text-pink-400" />
        {data.title}
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        <img
          src={data.thumbnail}
          className="w-full md:w-60 h-auto rounded-md object-cover"
          alt="thumbnail"
        />

        <div className="flex flex-col justify-between space-y-2 text-white text-sm">
          <p className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <a href={data.channel_url} target="_blank" className="hover:underline text-white/90">
              {data.channel}
            </a>
          </p>

          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            {format(new Date(data.release_timestamp * 1000), 'PPPpp')}
          </p>

          {data.duration !== null && (
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              {formatDuration(data.duration)}
            </p>
          )}

          {data.is_live && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded w-fit">
              🔴 Live
            </span>
          )}

          <a
            href={data.url}
            target="_blank"
            className="inline-flex items-center gap-2 text-blue-400 hover:underline mt-2"
          >
            <Youtube className="w-4 h-4" />
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}



function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'Unknown';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

const columnHelper = createColumnHelper<any>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('channel', {
    header: 'Channel',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('thumbnail', {
    header: 'Thumbnail',
    cell: info => info.getValue(),
  }),
];

export function PlaylistTable({ data }: { data: any[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {table.getRowModel().rows.map(row => {
        const title = row.getValue('title');
        const channel = row.getValue('channel');
        const thumbnail = row.original.thumbnail;
        const videoUrl = row.original.url;
        const channelUrl = row.original.channel_url;
        const duration = formatDuration(row.original.duration);

        return (
          <div
            key={row.id}
            className="flex items-start space-x-4 px-3 py-2 border-white/10 hover:bg-white/5 transition rounded-sm"
          >
            <div className="h-20">
              <img
                src={thumbnail}
                alt={title}
                className="aspect-video h-full object-cover rounded-sm border border-stone-700"
              />
            </div>

            <div className="flex flex-col justify-evenly">
              <a
                href={videoUrl}
                target="_blank"
                className="text-white font-medium hover:underline md:text-base text-xs text-clip"
              >
                {title}
              </a>
              <a
                href={channelUrl}
                target="_blank"
                className="text-white/70 md:text-sm hover:underline text-xs"
              >
                {channel}
              </a>
              <span className="pt-0.5">
                {row.original.is_live ? (
                  <span className="text-xs bg-red-700 px-1 py-0.5 inline-block w-min rounded-sm font-semibold">
                    Live
                  </span>
                ) : (
                  <p className="text-xs bg-stone-700 px-1 py-0.5 inline-block whitespace-nowrap w-min rounded-sm font-semibold">
                    {duration}
                  </p>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}