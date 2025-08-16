'use client';

import useSWR from 'swr';
import { Heart, Link as LinkIcon, Loader2, Music, FolderDown, Link, ListPlus, ListStart, ListX, Star, FilmIcon, Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

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
import { Button } from './ui/button';
import createLongPressHandlers from '@/lib/LongPressHandler';
import { HandlePlayCommand } from '@/lib/requests/PlayerHandlers';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function FavouritesSection() {
  const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_FAVOURITES_FETCH_ENDPOINT}?type=youtube`, fetcher);

  const songs = data?.data || [];

  console.log(songs)

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



  if (isLoading) return (
    <div className="space-y-2">
      <h1>LOADING TEST</h1>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  )

  if (error) return (
    <div className="text-red-400 text-sm">
      Failed to load favourites.
    </div>
  )

  if (!isLoading && songs.length === 0) return (
    <div className="text-white/50 italic">
      No favourites yet.
    </div>
  )

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-row text-red-500 font-semibold text-xl items-center justify-between gap-x-2">
          Favourites
          <Heart className="w-[24px]" />
        </div>

        {songs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {
              songs.map((song: any) => {
                const longPressHandlers = createLongPressHandlers(song, handleLongPress);
                return (
                  <div
                    {...longPressHandlers}
                    onDoubleClick={() => HandlePlayCommand(null, song.url, "playnow")}
                    key={song.id}
                    className="flex items-start space-x-3 rounded-md border border-neutral-700 bg-neutral-800/50 p-2 hover:bg-white/10 transition select-none active:scale-[99%] group"
                  >
                    {song.cover_art_url ? (
                      <img
                        src={song.cover_art_url}
                        alt={song.song_name}
                        className="h-16 object-cover rounded-sm border border-neutral-800 shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 text-white/60 rounded">
                        <Music />
                      </div>
                    )}

                    <div className="flex flex-col justify-center text-white text-sm">
                      <div className="font-medium text-base line-clamp-2 group-active:text-red-500">{song.song_name}</div>
                      <div className="text-white/70 line-clamp-1">{song.artist}</div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
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
            <img className='md:max-h-28 rounded max-h-20' src={data?.cover_art_url} alt={data?.id} />
            <div className='flex flex-col grow w-full justify-center'>
              <h1 className='text-white font-semibold text-xl w-full'>{data?.song_name}</h1>
              <p className='text-neutral-200 font-light'>{data?.artist}</p>
              <p className='text-neutral-200 font-light text-xs'>
                {data?.url?.match(/(?:v=|youtu\.be\/)([^&#]+)/)?.[1]}
              </p>
            </div>
          </div>
          <div className=' px-2 py-2'>
            <a href={data?.url} target='_blank' className='flex flex-col'>
              <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><Film /> Open in YouTube</Button>
            </a>
          </div>
          <div className='flex flex-col p-2'>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'
            onClick={() => HandlePlayCommand(data.url, null, "playnext")}
            ><ListStart /> Play next</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListPlus /> Add to queue</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-green-500/10'><ListX /> Clear queue and Play</Button>
            <Button variant={'ghost'} className='font-semibold justify-start active:scale-[99%] active:bg-pink-500/10'
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