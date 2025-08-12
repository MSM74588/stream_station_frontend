// components/SongDrawer.tsx
'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"

type Song = {
  id: string;
  name: string;
  artist: string;
  album_art: string;
  spotify_url: string;
  serial?: number;
};

type SongDrawerProps = {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SongDrawer({ song, open, onOpenChange }: SongDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4 pb-4">
        <DrawerHeader>
          <DrawerTitle>Song Details</DrawerTitle>
          <DrawerDescription>
            Info about the selected song
          </DrawerDescription>
        </DrawerHeader>

        {song && (
          <div className="space-y-2 text-sm">
            <img src={song.album_art} alt="Album Art" className="w-24 h-24 rounded mb-2" />
            <p><strong>Title:</strong> {song.name}</p>
            <p><strong>Artist:</strong> {song.artist}</p>
            <p><strong>ID:</strong> {song.id}</p>
            <p><strong>Spotify:</strong> <a href={song.spotify_url} target="_blank" className="underline text-blue-500">{song.spotify_url}</a></p>
          </div>
        )}

        <DrawerFooter className="mt-4">
          <Button className="w-full">Placeholder Action</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
