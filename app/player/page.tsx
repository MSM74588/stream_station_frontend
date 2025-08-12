"use client";

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Square, Volume, Volume2 } from "lucide-react"
import { useState } from "react"


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

export default function PlayerPage() {
    return (
        <div className="min-h-screen w-full bg-black relative">
            {/* Midnight Mist */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
                        radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
                        radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
                        `,
                }}
            />

            {/* Content on top of background */}
            <div className="flex w-full min-h-screen items-center justify-center z-50 relative " id="front">
                <div className="flex flex-col text-white gap-y-3 items-center">
                    <div className="aspect-square bg-amber-600 rounded-lg h-64 w-64"></div>
                    <div className="text-base font-semibold">Song Name</div>
                    <div><SeekbarArea /></div>
                    <div><Controls /></div>
                    <div><VolumeControlArea /></div>


                    <Credenza>
                        <CredenzaTrigger asChild>
                            <Button>Open modal</Button>
                        </CredenzaTrigger>
                        <CredenzaContent>
                            <CredenzaHeader>
                                <CredenzaTitle>Credenza</CredenzaTitle>
                                <CredenzaDescription>
                                    A responsive modal component for shadcn/ui.
                                </CredenzaDescription>
                            </CredenzaHeader>
                            <CredenzaBody>
                                This component is built using shadcn/ui&apos;s dialog and drawer
                                component, which is built on top of Vaul.
                            </CredenzaBody>
                            <CredenzaFooter>
                                <CredenzaClose asChild>
                                    <Button>Close</Button>
                                </CredenzaClose>
                            </CredenzaFooter>
                        </CredenzaContent>
                    </Credenza>
                </div>
            </div>
        </div>
    )
}

function VolumeControlArea() {
    return (
        <div className="w-[30vw] flex flex-row gap-2">
            <Volume />
            <Slider defaultValue={[33]} max={100} step={1} />
            <Volume2 className="ml-2" />
        </div>
    )
}

function Controls() {
    return (
        <div className="my-14 scale-150;">
            {/* Previous, Play, Pause, Next, Replay. Clear, Queue, Radio?, Mute */}
            <Button variant={"ghost"} className="scale-80">
                <Shuffle size={24} className="text-neutral-400" />
            </Button>
            <Button variant={"ghost"}>
                <SkipBack size={32} />
            </Button>
            <Button variant={"ghost"}>
                <Play size={32} className="text-red-500" />
            </Button>
            <Button variant={"ghost"}>
                <Pause size={32} className="text-red-500" />
            </Button>
            <Button variant={"ghost"}>
                <Square size={32} className="text-red-500" />
            </Button>
            <Button variant={"ghost"}>
                <SkipForward size={32} />
            </Button>
            <Button variant={"ghost"} className="scale-80">
                <Repeat size={24} className="text-neutral-400" />
            </Button>
            {/* <Button variant={"ghost"}>
                <SkipBack />
            </Button>
            <Button variant={"ghost"}>
                <SkipBack />
            </Button>
            <Button variant={"ghost"}>
                <SkipBack />
            </Button> */}
        </div>
    )
}

// https://ui.raulcarini.dev/music-player

function SeekbarArea() {
    return (
        <div className="flex flex-row gap-2 w-[30vw]">
            {/* <span className="text-xs font-semibold text-neutral-300">00:00</span> */}
            {/* <Slider defaultValue={[33]} max={100} step={1} className=""/> */}
            <AudioSlider />
            {/* <span className="text-xs font-semibold text-neutral-300">00:00</span> */}
        </div>
    )
}




const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

function AudioSlider() {
    const duration = 145;
    const [playbackTime, setPlaybackTime] = useState([78]);

    return (
        <div className="w-full">
            <Slider
                defaultValue={playbackTime}
                max={duration}
                step={1}
                onValueChange={setPlaybackTime}
            />
            <div className="mt-1 flex justify-between text-xs font-medium text-muted-foreground">
                <span>{formatDuration(playbackTime[0])}</span>
                <span>{formatDuration(duration)}</span>
            </div>
        </div>
    );
}

