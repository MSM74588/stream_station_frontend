"use client"

import Crumbs from "@/components/crumbs"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { createColumnHelper, useReactTable } from "@tanstack/react-table"
import { Loader2, Search, Play, BookmarkPlus, Mic, Podcast, Loader, List, ListStart, Film, ListX, ListPlus, SquareArrowOutUpRightIcon } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import useSWRMutation from "swr/mutation";

import { motion } from "framer-motion";

import { useRouter, useSearchParams } from "next/navigation";
import { create } from "zustand";


// Add your own hook or use matchMedia directly
import { useVirtualizer } from '@tanstack/react-virtual'
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PodcastSection } from "@/components/sections/PodcastSection"
import { Dots_v3, Dots_v4 } from "@/components/ui/dotloader"
import { EpisodeSection } from "@/components/sections/EpisodeSection"
import createLongPressHandlers from "@/lib/LongPressHandler"

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

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// Zustand store for search state
type SearchStore = {
    searchString: string;
    setSearchString: (v: string) => void;
    triggerRefresh: () => void;
    refreshKey: number;
    podcastUrl: string | null;
    setPodcastUrl: (url: string | null) => void;
    isEpisodeDetailsFetch: boolean;
    setIsEpisodeDetailsFetch: (value: boolean) => void;
};
export const useSearchStore = create<SearchStore>((set) => ({
    searchString: "",
    setSearchString: (v) => set({ searchString: v }),
    refreshKey: 0,
    triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
    podcastUrl: null,
    setPodcastUrl: (url) => set({ podcastUrl: url }),
    isEpisodeDetailsFetch: false,
    setIsEpisodeDetailsFetch: (value) => set({ isEpisodeDetailsFetch: value }),
}));


export function triggerSearchWithQuery(query: string) {
    const { setSearchString, triggerRefresh } = useSearchStore();

    // Set the search string
    setSearchString(query);

    // Trigger the refresh/fetch
    triggerRefresh();
}

function getUrlOrTitle(url, title) {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('spotify') || lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) {
            return url;
        }
        return title;
    }

// Utility: Check if URL is Spotify or YouTube
function isSpotifyOrYouTubeUrl(url: string) {
    const regex = /(spotify\.com|youtube\.com|youtu\.be)/i;
    return regex.test(url);
}

// Modified postFetcher to accept optional podcast_url
const postFetcher = async (
    key: string,
    { arg }: { arg: { url: string; podcast_url?: string } }
) => {
    const res = await fetch(key, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(arg),
    });
    if (!res.ok) {
        toast.error(`Server responded with ${res.status}`)
        throw new Error(`Fetch failed: ${res.status}`);
    }
    console.info(`NOW PRINTING THE JSON: ${res.status}`)
    
    const text = await res.text();
    if (!text.trim()) {
        throw new Error('Empty response from server');
    }
    
    try {
        const jsonData = JSON.parse(text);
        console.log(jsonData);
        return jsonData;
    } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid JSON response from server');
    }
};

const handleBookmarkEp = async (data: { url: string | Blob; title: string | Blob; description: string | Blob; duration_ms: string | Blob; image: string | URL | Request }) => {
    const toastId = toast.loading("Adding to Bookmarks")

    try {
        const bookmarkUrl = `${process.env.NEXT_PUBLIC_EPISODES_ENDPOINT}`
        console.log(bookmarkUrl)
        console.log(data)

        // Prepare FormData and upload image as Blob
        const formData = new FormData();

        // Append regular fields
        formData.append('url', data.url);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('duration_ms', data.duration_ms); // fixed typo from 'dutation_ms'
        // formData.append('release_date', data.duration_ms); // fixed typo from 'dutation_ms'
        formData.append("thumbnail_constructor_url", process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "")


        if (data.image) {
            // Fetch the image as a Blob
            const imageResponse = await fetch(data.image);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status}`);
            }
            const imageBlob = await imageResponse.blob();

            // Append image to FormData
            // Optional: pass a filename for better server-side handling
            formData.append('image', imageBlob, 'image.jpg');
        }

        // Send POST request
        const res = await fetch(bookmarkUrl, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            if (res.status == 409) {
                toast.warning(`Already Bookmarked`, { id: toastId })
            } else {
                throw Error(`Server Responded with ${res.status}`)
            }
            return

            // throw new Error(`Server responded with ${res.status}`);
        }

        console.log("Bookmark success!");
        toast.success("Bookmark successful", { id: toastId })
    } catch (err) {
        // toast.error(`Bookmark failed: ${err}`);
        toast.error(`Server responded with ${err}`, { id: toastId })

    }
};

export default function PodcastsPage() {

    return (
        <>


            <div className="px-3 md:px-[10vw] py-7 w-full gap-y-5 flex flex-col snap-y snap-mandatory">
                <div className="snap-start snap-always">
                    <SearchSection />
                </div>
                <Separator orientation="horizontal" />
                <div className="snap-start snap-always">
                    <Table />
                </div>
            </div>
        </>
    )
}

export function SearchSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { searchString, setSearchString, triggerRefresh } = useSearchStore();

    // Sync Zustand store with URL on mount
    useEffect(() => {
        const urlSearch = searchParams.get("q") || "";
        setSearchString(urlSearch);
    }, [searchParams, setSearchString]);

    // Update URL when searchString changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (searchString) {
            params.set("q", searchString);
        } else {
            params.delete("q");
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [searchString, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchString(e.target.value);
        // Optionally trigger refresh on every change:
        // triggerRefresh();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerRefresh(); // Explicit refresh on submit
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col rounded border-2 border-emerald-700 has-focus:outline-2 outline-offset-0 outline-emerald-600 outline-0 shadow-2xl divide-neutral-600/70 divide-y-2 overflow-hidden">
                <div className="px-3 py-2">
                    <input
                        className="w-full outline-none"
                        value={searchString}
                        onChange={handleInputChange}
                        placeholder="Search Podcast via URL"
                        type="text"
                    />
                </div>
                <div className="flex flex-row justify-between bg-neutral- px-3 py-2 gap-2 bg-neutral-900">
                    <div className="flex flex-row items-center gap-1 overflow-auto">
                        <p className="text-neutral-300 whitespace-nowrap">Supported URLs:</p>
                        <SearchTypeCrumb name="Youtube Channel" />
                        <SearchTypeCrumb name="Youtube Playlist" />
                        <SearchTypeCrumb name="Spotify Podcast" />
                        <SearchTypeCrumb name="RSS feed" />
                    </div>
                    <div>
                        <Button variant={"outline"} type="submit" onClick={triggerRefresh}>
                            <Search />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

function SearchTypeCrumb(props) {
    return (
        <div className="text-sm px-2 py-1 rounded-full bg-neutral-600/50 border border-neutral-700 font-semibold whitespace-nowrap">{props.name}</div>
    )
}

export function Table() {
    const { searchString, refreshKey, triggerRefresh, podcastUrl, setPodcastUrl, isEpisodeDetailsFetch, setIsEpisodeDetailsFetch } = useSearchStore();
    const triggeredRef = useRef(false);
    const lastSearchRef = useRef("");

    const { data: PodcastData, error, isMutating, trigger } = useSWRMutation(
        `${process.env.NEXT_PUBLIC_PODCAST_API_URL}`,
        postFetcher,
    );

    // On mount, if searchString is set, trigger a search ONCE
    useEffect(() => {
        if (!triggeredRef.current && searchString.trim()) {
            triggeredRef.current = true;
            setIsEpisodeDetailsFetch(false); // Initial fetch is not episode details
            triggerRefresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Trigger POST request when searchString changes
    useEffect(() => {
        if (searchString.trim() && searchString !== lastSearchRef.current) {
            lastSearchRef.current = searchString;
            
            if (isEpisodeDetailsFetch && podcastUrl) {
                // Only include podcast_url when explicitly fetching episode details
                trigger({ url: searchString, podcast_url: podcastUrl });
            } else {
                // For podcast feed fetches, only send the URL
                trigger({ url: searchString });
            }
            
            // Clear podcastUrl for Spotify/YouTube
            if (isSpotifyOrYouTubeUrl(searchString)) {
                setPodcastUrl(null);
            }
        }
    }, [refreshKey, trigger, searchString, isEpisodeDetailsFetch]); // Removed podcastUrl and setPodcastUrl from dependencies

    // Reset the episode details fetch flag when data is received
    useEffect(() => {
        if (PodcastData && isEpisodeDetailsFetch && !isMutating) {
            // Only reset when we're not currently fetching to avoid triggering new requests
            setIsEpisodeDetailsFetch(false);
        }
    }, [PodcastData, isEpisodeDetailsFetch, isMutating, setIsEpisodeDetailsFetch]);

    console.log(PodcastData)



    if (error) return <div className="italic text-red-600">failed to load</div>;
    if (isMutating) return <div className="w-full flex items-center justify-center p-5 animate-spin"><Loader /></div>
    if (!PodcastData) return <div className="gap-y-6 flex flex-col">
        <PodcastSection />
        <EpisodeSection />
    </div>;

    console.log(PodcastData)

    switch (PodcastData.type) {
        case "episode":
            return <EpisodeDetails data={PodcastData} />;
        case "spotify_show":
            return <PodcastFeed data={PodcastData} />
        case "RSS Feed":
            return <PodcastFeed data={PodcastData} />
        case "YouTube Channel":
            return <PodcastFeed data={PodcastData} />
        case "YouTube Playlist":
            return <PodcastFeed data={PodcastData} />
    }

}

export function PodcastFeed({ data }: { data: any }) {
    const { setPodcastUrl } = useSearchStore();

    useEffect(() => {
        // Only set podcast URL for RSS Feed type, clear for others
        // Use a longer timeout and check if we're not already in an episode details state
        if (data?.type === "RSS Feed" && data?.url) {
            const timeoutId = setTimeout(() => {
                setPodcastUrl(data.url);
            }, 500); // Increased timeout
            
            return () => clearTimeout(timeoutId);
        } else {
            setPodcastUrl(null);
        }
    }, [data?.url, data?.type, setPodcastUrl]);

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
            }

            console.log("Bookmark success!");
            toast.success("Bookmark successful")
        } catch (err) {
            console.log(err)
        }
    };


    console.log(data)
    return (
        <div className="pt-4 gap-y-4 flex flex-col">
            <div className=" pb-2 flex flex-row w-full">
                <div className="flex flex-row gap-2">
                    <PodcastThumb image_url={data.image} title={data.title} />
                    <div className="flex flex-col content-around">
                        <h1 className="text-1xl md:text-5xl font-extrabold ">{data.title}</h1>
                        <p>{data.channel}</p>
                        <p className="text-sm text-neutral-400">{data.type}</p>
                        <a href={data.url} className="md:flex hidden text-xs pt-1 hover:text-blue-400 text-slate-400">{data.url}</a>

                        <div className="h-full items-end flex">
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


function PodcastThumb({ image_url, title }) {
    return (
        <div className="relative flex justify-center items-center md:max-w-32">
            {/* Blurred background */}
            {/* <div
                className="absolute inset-0 bg-center bg-cover blur-md"
                style={{ backgroundImage: `url(${image_url})` }}
            ></div> */}

            {/* Foreground image */}
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

    // HERE CONST FOR CREDENZA
    const longPressHandlers = createLongPressHandlers(data, handleLongPress);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 0, x: -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                    delay: index / 10 * 0.02, // Stagger manually using index
                    type: "spring",
                    stiffness: 80,
                    damping: 12
                }}
                {...longPressHandlers}
                key={index}
            >
                <div className="flex flex-row justify-between w-full px-3 md:px-6 py-4 md:border-2 md:border-neutral-500/15 md:shadow-lg transition active:scale-[99%]  md:hover:border-emerald-700/50 rounded-lg md:hover:bg-emerald-800/20 items-center group">
                    <div className="flex flex-row gap-2 items-start">
                        <Podcast className="text-neutral-500 group-hover:text-emerald-400 transition" />

                        <div className="text-base text-white font-semibold break-words max-w-[65vw] select-none md:select-text">
                            {data.title}
                        </div>

                    </div>
                    <div className="md:flex flex-row gap-1 hidden">
                        <Button variant={"outline"} className="rounded-full" onClick={() => handleBookmarkEp(data)}><BookmarkPlus /></Button>
                        <Button variant={"outline"} className="rounded-full">
                            <Play />
                        </Button>
                    </div>
                </div>
            </motion.div>
            <EpCredenza
                open={isCredenzaOpen}
                onOpenChange={setCredenzaOpen}
                data={credenzaData}
            /></>
    );
}


export function EpisodeDetails({ data }: { data: any }) {

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
        <div className='flex flex-col gap-4'>
            <div className='md:flex-row flex-col flex gap-2'>
                <div className='relative'>
                    <div>
                        <img className='max-w-full md:max-w-[10vw] rounded shadow-2xl border border-neutral-900 ' src={data.thumbnail} alt={data.title} />
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

                    <pre className='whitespace-pre-wrap font-sans overflow-x-auto max-w-full inline-block md:hidden'>
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



                    {/* <p className='py-1 px-2 border border-neutral-700 bg-neutral-600 text-neutral-400 '>{data.duration}</p> */}
                    <div className='flex flex-row gap-2 pt-2 grow items-end'>
                        <a href={data.url} target='_blank'>
                            <Button className='rounded-full' variant={'outline'}><SquareArrowOutUpRightIcon /> Open Source</Button>
                        </a>
                        <Button className='rounded-full' variant={'outline'} onClick={() => handleBookmarkEp(data)}><BookmarkPlus /> Bookmark Episode</Button>
                    </div>
                </div>
            </div>

            <Separator/>

            <Accordion type="single" collapsible className="hidden md:block">
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



function EpCredenza({ open, onOpenChange, data }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any | null;
}) {

    const { setSearchString, triggerRefresh, setPodcastUrl, podcastUrl, setIsEpisodeDetailsFetch } = useSearchStore();

    const triggerSearchWithQuery = (query: string) => {
        setSearchString(query);
        // Mark this as an episode details fetch
        setIsEpisodeDetailsFetch(true);
        triggerRefresh();
    };

    function getUrlOrTitle(url, title) {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('spotify') || lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) {
            return url;
        }
        return title;
    }

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
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Play /> Play now</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListStart /> Play next</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Add to Queue</Button>
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button>
                    </div>
                    <div className="flex w-full flex-col p-2">
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
                            onClick={() => handleBookmarkEp(data)}
                        >
                            <BookmarkPlus /> Bookmark Episode
                        </Button>

                    </div>
                    <div className="flex w-full flex-col p-2">
                        <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
                            onClick={() => {
                                // Use the stored podcastUrl for the API call
                                triggerSearchWithQuery(data.url);
                            }}
                        >
                            <List /> Episode Details
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