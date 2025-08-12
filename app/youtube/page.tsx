"use client"

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { YoutubeIcon } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Film, Heart, Link, ListVideo, Podcast, Search, SquareArrowOutDownRightIcon, SquareArrowOutUpRightIcon } from "lucide-react";
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
import { toast } from 'sonner';
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from '@radix-ui/react-separator';
import { useRouter, usePathname } from "next/navigation";

import { PlaylistSection } from "@/components/sections/PlaylistSection"

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


      <Table
        searchString={confirmedSearch}
        onResultStatusChange={setHasSearchResults}
      />
    </div>
  );
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
  const router = useRouter();
  const pathname = usePathname();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(pathname);
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
    searchString ? `${process.env.NEXT_PUBLIC_YOUTUBE_API_ENDPOINT}?search=${encodeURIComponent(searchString)}` : null,
    fetcher
  );

  useEffect(() => {
    if (onResultStatusChange) {
      onResultStatusChange(!!SearchData); // true if results are present
    }
  }, [SearchData, onResultStatusChange]);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div><Loader2 className='spin animate-spin' /></div>;
  if (!SearchData) return (

    <>
      <FavouritesSection />
      <PlaylistSection />
    </>
  );

  switch (SearchData.type) {
    case "YouTube Video":
      return <VideoTable data={SearchData} />;
    case "YouTube Channel":
      return <YTFeed data={SearchData} />
    case "YouTube Playlist":
      return <YTFeed data={SearchData} />
    case "search":
      return <SearchResultsTable searchString={searchString} />;
    default:
      return <div>Unsupported content type</div>;
  }
}



export function VideoTable({ data }: { data: any }) {

  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const descParts = data.description.split(linkRegex);
  const formatter = new Intl.NumberFormat("en", { notation: "compact" });

  function msToTime(ms) {
    const date = new Date(ms);
    return new Intl.DateTimeFormat('en', {
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }
  return (
    <div className='flex flex-col'>
      <div className='md:flex-row flex-col flex gap-3'>
        <div className='relative'>
          <div>
            <img className='max-w-full md:max-w-xl rounded shadow-2xl border border-neutral-900 ' src={data.thumbnail} alt={data.title} />
          </div>

          {data.view_count && (
            <div className='absolute right-0 bottom-0 p-2'>
              <div className='text-neutral-300 font-light bg-neutral-800/70 px-2 py-1 rounded-sm border border-neutral-800/50 shadow backdrop-blur-sm'>
                {formatter.format(data.view_count)} views
              </div>
            </div>
          )}
        </div>
        <div className='grow flex flex-col'>
          <h1 className='text-xl/snug md:text-3xl/snug font-bold'>{data.title}</h1>
          {/* <a href={data.uploader_url} className='hover:underline hover:text-white transition text-sm md:text-xl text-neutral-400'>{data.uploader}</a> */}
          <a href={data.uploader_url} className='hover:underline hover:text-white transition text-sm md:text-xl text-neutral-400'>{data.uploader}</a>

          {data.is_live && (
            <span className="inline-flex items-center gap-1 bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded-md w-fit md:mt-3 mt-2">
              LIVE
            </span>
          )}

          {data.duration_ms && (
            <div className='text-neutral-300 font-light'>
              {msToTime(data.duration_ms)}
            </div>
          )}



          {/* <p className='py-1 px-2 border border-neutral-700 bg-neutral-600 text-neutral-400 '>{data.duration}</p> */}
          <div className='flex flex-row gap-2 pt-2 grow items-end'>
            <a href={data.uploader_url} target='_blank'>
              <Button className='rounded-full' variant={'outline'}><SquareArrowOutUpRightIcon /> Open in YouTube</Button>
            </a>
            <Button className='rounded-full' variant={'outline'}><BookmarkPlus /> Bookmark Video</Button>
          </div>
        </div>
      </div>

      <Separator />

      <Accordion type="single" collapsible className='pt-3'>
        <AccordionItem value="desc">
          <AccordionTrigger className='bg-neutral-800 px-4 py-3'>Description</AccordionTrigger>
          <AccordionContent className='py-3'>
            <pre className='whitespace-pre-wrap font-sans'>
              {descParts.map((part, i) =>
                linkRegex.test(part) ? (
                  <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-200 border border-neutral-700 bg-neutral-700/50 py-0.5 px-2 inline-block rounded-full hover:text-blue-400 hover:bg-neutral-700/20 my-0.5 transition duration-75"
                  >
                    {part}
                  </a>
                ) : (
                  part
                )
              )}
              {/* {data.description} */}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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


export function YTFeed({ data }: { data: any }) {
  const handleBookmark = async () => {
    try {
      toast.info("Bookmark request sent.")
      const bookmarkUrl = `${process.env.NEXT_PUBLIC_PODCAST_SAVE_ENDPOINT}`
      console.log(bookmarkUrl)
      const res = await fetch(bookmarkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }), // Or data.url if that's the correct key
      });

      if (!res.ok) {
        if (res.status == 409) {
          toast.warning(`Already Bookmarked`)
          throw new Error(`Server responded with ${res.status}`);
        } else {
          toast.error(`Server responded with ${res.status}`)
          throw new Error(`Server responded with ${res.status}`);
        }

        // throw new Error(`Server responded with ${res.status}`);
      }

      console.log("Bookmark success!");
      toast.success("Bookmark successful")
    } catch (err) {
      console.log(err)
      // toast.error(`Bookmark failed: ${err}`);

    }
  };


  console.log(data)
  return (
    <div className="pt-4 gap-y-4 flex flex-col">
      <div className=" pb-2 flex flex-row w-full">
        <div className="flex flex-row gap-2">
          {/* <span className=''>
                     <PodcastThumb image_url={data.image} title={data.title} />
                   </span> */}
          <div className="flex flex-col content-around">
            <h1 className="text-1xl md:text-5xl font-extrabold ">{data.title}</h1>
            <p>{data.channel}</p>
            <p className="text-sm text-neutral-400">{data.type}</p>
            <a href={data.url} className="md:flex hidden text-xs pt-1 hover:text-blue-400 text-slate-400">{data.url}</a>

            <div className="h-full items-end flex pt-2">
              <Button variant={"outline"} className="rounded-full" onClick={handleBookmark}>
                <BookmarkPlus />
                <span className="inline-block">
                  Bookmark Podcast
                </span>
              </Button>
            </div>
          </div>

        </div>

      </div>
      <PodcastTable data={data.items} />
    </div>
  )
}

// Borrowed from Podcasts

function PodcastThumb({ image_url, title }) {
  console.debug(image_url)
  return (
    <div className="relative flex justify-center items-center md:max-w-32">
      <img
        src={image_url}
        alt={title}
        className="relative z-10 h-auto max-h-full object-contain rounded border-neutral-600 border shadow-lg"
      />
    </div>
  )

}


export function PodcastTable({ data }: { data: any[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  if (!data || data.length === 0) {
    return <p className="text-sm text-neutral-400">No podcast episodes found.</p>;
  }

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // Adjust based on actual item height
    overscan: 5,
  });

  // Variants for staggered children
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div ref={parentRef} className="relative h-[70vh] overflow-auto ">
      <motion.div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const episode = data[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              ref={(el) => {
                rowVirtualizer.measureElement(el);
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <PodcastItem data={episode} index={virtualRow.index} />
            </div>

          );
        })}
      </motion.div>
    </div>
  );
}

function PodcastItem({ data, index }: { data: any; index: number }) {
  // FIXME
  const handleBookmarkEp = async () => {
    try {
      toast.info("Bookmark request sent.")
      const bookmarkUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/episode/save`
      console.log(bookmarkUrl)
      const res = await fetch(bookmarkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }), // Or data.url if that's the correct key
      });

      if (!res.ok) {
        if (res.status == 409) {
          toast.warning(`Already Bookmarked`)
        } else {
          toast.error(`Server responded with ${res.status}`)
        }

        // throw new Error(`Server responded with ${res.status}`);
      }

      console.log("Bookmark success!");
      toast.success("Bookmark successful")
    } catch (err) {
      toast.error(`Bookmark failed: ${err}`);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        delay: index / 10 * 0.02, // Stagger manually using index
        type: "spring",
        stiffness: 80,
        damping: 12
      }}
    >
      <div className="flex flex-row justify-between w-full px-3 md:px-6 py-4 md:border-2 md:border-neutral-500/15 md:shadow-lg transition active:scale-[99%]  md:hover:border-red-700/50 rounded-lg md:hover:bg-red-800/20 items-center group">
        <div className="flex flex-row gap-2 items-start">
          <Film className="text-neutral-500 group-hover:text-red-500 transition" />

          <div className="text-base text-white font-semibold break-words max-w-[65vw] select-none md:select-text">
            {data.title}
          </div>

        </div>
        <div className="md:flex flex-row gap-1 hidden">
          <Button variant={"outline"} className="rounded-full" onClick={handleBookmarkEp}><BookmarkPlus /></Button>
          <Button variant={"outline"} className="rounded-full">
            <Play />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
