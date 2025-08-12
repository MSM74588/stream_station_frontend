'use client'

import { useRef, useState } from "react";
import useSWR from "swr";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { X, Play, Heart, Music } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Crumbs from "@/components/crumbs";
import { Console } from "console";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const rawData = await res.json();
    console.log(rawData)
    return rawData.data; // only return songs array
};

export default function FavPage() {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const url =
        `${process.env.NEXT_PUBLIC_FAVOURITES_FETCH_ENDPOINT}` +
        (selectedType ? `?type=${selectedType}` : "");

    const { data: songs, error, isLoading } = useSWR(url, fetcher);

    return (
        <>
            <div className="p-4 h-[100dvh] flex flex-col md:px-[10vw]">

                <div className="flex flex-row text-red-500 font-semibold text-xl items-center justify-between gap-x-2 mb-4">
                    Favourites
                    <Heart className="w-[24px]" />
                </div>

                <FilterSec selectedType={selectedType} setSelectedType={setSelectedType} />

                <div className="flex-1 min-h-0">
                    {isLoading && <div>Loading...</div>}
                    {error && <div className="text-red-500">Error loading favourites</div>}
                    {songs && <FavSec items={songs} />}
                </div>
            </div>
        </>
    );
}

type Props = {
    selectedType: string | null;
    setSelectedType: (type: string | null) => void;
};

export function FilterSec({ selectedType, setSelectedType }: Props) {
    const filters = [
        { label: "YouTube", value: "youtube" },
        { label: "Local", value: "mpd" },
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
                                ? "bg-red-500 text-white ring-offset-neutral-800 hover:bg-red-600 ring-2 ring-offset-1 ring-red-600"
                                : "bg-transparent text-white hover:text-black border-gray-300/50 hover:bg-gray-100"}
            `}
                        onClick={() =>
                            isActive ? setSelectedType(null) : setSelectedType(value)
                        }
                    >
                        {label}
                        {isActive && (
                            <X
                                className="w-1 h-1 ml-1"
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent toggling filter again
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

export function FavSec({ items }: { items: any[] }) {
    const parentRef = useRef<HTMLDivElement | null>(null);

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 90, // Keep this as a reasonable default estimate
        overscan: 10,
    });

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.05,
            },
        },
    };

    return (
        <div
            ref={parentRef}
            className="relative max-h-full overflow-y-auto overflow-x-hidden"
        >
            <motion.div
                style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                    width: "100%",
                }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={(el) => rowVirtualizer.measureElement(el)}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <FavItem data={item} index={virtualRow.index} />
                        </div>
                    );
                })}
            </motion.div >
        </div >
    );
}

function FavItem({ data, index }: { data: any; index: number }) {
    const handleLike = () => {
        toast.success("This would trigger like/unlike logic.");
    };

    console.log(data)
    return (
        <motion.div
            data-index={index}
            initial={{ opacity: 0, y: 0, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{
                delay: index * 0.015,
                type: "spring",
                stiffness: 90,
                damping: 14,
            }}
            className="mb-2" // Add margin bottom for spacing between items
        >
            <div className="flex flex-row justify-between w-full px-2 py-2 border-2 border-neutral-500/15 shadow hover:border-red-700/50 transition active:scale-[99%] rounded-lg hover:bg-red-800/10 items-center group">
                <div className="flex flex-row gap-3 items-start w-full">
                    {
                        data.cover_art_url
                            ? (
                                <img
                                    src={data.cover_art_url}
                                    alt={data.song_name}
                                    className="h-12 object-cover rounded-sm shadow border-1 border-neutral-800 flex-shrink-0"
                                />
                            )
                            : (
                                <div className="rounded-sm shadow h-12 aspect-square border-1 border-neutral-800 flex items-center justify-center flex-shrink-0
                                bg-gradient-to-tr from-slate-500 to-slate-800
                                ">
                                    <Music />
                                </div>
                            )
                    }

                    <div className="flex flex-col max-w-[65vw] min-w-0">
                        <div className="text-white font-semibold text-base break-words">
                            {data.song_name}
                        </div>
                        <div className="text-sm text-neutral-400 break-words">{data.artist}</div>
                    </div>
                </div>

                <div className="hidden md:flex flex-row gap-1 shrink-0 ml-2">
                    <Button variant={"outline"} className="rounded-full">
                        <Play />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}