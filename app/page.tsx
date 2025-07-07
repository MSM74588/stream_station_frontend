import { Icon } from "@iconify/react";
import { CassetteTape, Clock4Icon, MoonStarIcon, Music, RadioTower, Settings, Terminal, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Heart, History } from "lucide-react";

import { Plus_Jakarta_Sans } from 'next/font/google'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

const JkSans = Plus_Jakarta_Sans({ subsets: ['latin'] })

// export default function ResizableDemo() {
//   return (
//     <ResizablePanelGroup
//       direction="horizontal"
//       className="min-h-dvh min-w-full rounded-lg"
//     >
//       <ResizablePanel defaultSize={25} className="bg-secondary">
//         <div className="border-r-2 border-border bg-secondary pl-[20%] pr-2 h-full">
//           <Sidebar />
//         </div>
//       </ResizablePanel>
//       <ResizableHandle />
//       <ResizablePanel defaultSize={75}>
//         <div className="flex h-full items-center justify-center p-6">
//           <span className="font-semibold">Content</span>
//         </div>
//       </ResizablePanel>
//     </ResizablePanelGroup>
//   )
// }

export default function Test() {
  return (
    <h1>Hello</h1>
  )
}

function Sidebar() {
  return (
    <div className="gap-y-3 flex flex-col pt-4 grow h-full">
      <MainBlock />
      <div className="flex stretch flex-col gap-2">

        <div className="flex stretch flex-col">
          <LinkBtn label="History"
            hoverBg="hover:bg-blue-500/10"
            iconBg="bg-blue-600/20"
            iconBgHover="group-hover:bg-blue-600/30"
            borderStyle="border-2 border-blue-600/20"
          >
            <History className="relative right-[0px] text-blue-500" size={20} />
          </LinkBtn>

          <LinkBtn label="Favourites"
            hoverBg="hover:bg-rose-500/10"
            iconBg="bg-rose-600/20"
            iconBgHover="group-hover:bg-rose-600/30"
            borderStyle="border-2 border-rose-600/20"
          >
            <Heart className="relative top-[0px] text-rose-500" size={20} />
          </LinkBtn>



          <LinkBtn label="Radio"
            hoverBg="hover:bg-emerald-500/10"
            iconBg="bg-emerald-600/20"
            iconBgHover="group-hover:bg-emerald-600/30"
            borderStyle="border-2 border-emerald-600/20"
          >
            <RadioTower className="relative top-[1px] text-emerald-500" size={20} />
          </LinkBtn>

          <LinkBtn label="Commands"
            hoverBg="hover:bg-yellow-500/10"
            iconBg="bg-yellow-600/20"
            iconBgHover="group-hover:bg-yellow-600/30"
            borderStyle="border-2 border-yellow-600/20"
          >
            <Terminal className="relative top-[1px] text-yellow-500" size={20} />
          </LinkBtn>
        </div>

        <Divider label="Music Services" />

        <div className="flex stretch flex-col">
          <LinkBtn label="Youtube"
            hoverBg="hover:bg-red-500/10"
            iconBg="bg-red-600/20"
            iconBgHover="group-hover:bg-red-600/30"
            borderStyle="border-2 border-red-600/20"
          >
            <svg role="img" className="w-7 h-7 p-1 text-red-500 relative top-[1px]" viewBox="0 0 24 26" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </LinkBtn>
          <LinkBtn label="Spotify"
            hoverBg="hover:bg-green-500/10"
            iconBg="bg-green-600/20"
            iconBgHover="group-hover:bg-green-600/30"
            borderStyle="border-2 border-green-600/20"
          >
            <svg role="img" className="w-7 h-7 p-1 text-green-500  rounded" viewBox="0 0 24 26" xmlns="http://www.w3.org/2000/svg"><title>Spotify</title><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
          </LinkBtn>
          <LinkBtn label="Local"
            hoverBg="hover:bg-yellow-400/10"
            iconBg="bg-yellow-500/20"
            iconBgHover="group-hover:bg-yellow-500/30"
            borderStyle="border-2 border-yellow-500/20"
          >
            <CassetteTape className="relative top-[1px] text-yellow-500" size={20} />
          </LinkBtn>
        </div>
      </div>
      <div className="flex flex-col items-start grow align-bottom content-end">
        <Button variant="link" size="sm" className="text-white/80">
          <Music /> Open Jellyfin
        </Button>
        <Button variant="link" size="sm" className="text-white/80">
          <MoonStarIcon /> Set Sleep Timer
        </Button>
        <Button variant="link" size="sm" className="text-white/80">
          <Settings /> Settings
        </Button>
      </div>
    </div>
  );
}




const tail_colours = 'bg-blue-500/20'

function MainBlock() {
  return (
    <div className="border-border border-2 w-full min-h-[15em] overflow-hidden stretch flex flex-col rounded-lg">
      <div className="bg-secondary flex flex-grow"></div>
      <div className="bg-background p-3 items-center align-middle flex flex-row gap-3">
        <Clock4Icon color="white" size={20} />
        <p className="font-sans">Hello</p>
      </div>
    </div>
  );
}


// LINK BTN
type LinkBtnProps = {
  children: React.ReactNode;
  label: string;
  iconBg?: string;
  hoverBg?: string;
  iconBgHover?: string;
  borderStyle?: string;
  verticalAdjustment?: string;
};

function LinkBtn({
  children,
  label,
  iconBg = "",
  hoverBg = "",
  iconBgHover = "",
  borderStyle = "",
  verticalAdjustment = "",
}: LinkBtnProps) {
  return (
    <a href="#" className={`group rounded-lg p-2 ${hoverBg} transition-all duration-300`}>
      <button className="flex flex-row items-center gap-x-3 font-sans font-extrabold">
        <div
          className={`aspect-square h-10 rounded-2xl group-hover:rounded-3xl flex items-center justify-center transition-all duration-150 ${verticalAdjustment} ${iconBg} ${iconBgHover} ${borderStyle}`}
        >
          {/* ICON SLOT */}
          {children}
        </div>
        <p className={`hidden lg:block font-semibold ${JkSans.className}`}>{label}</p>
      </button>
    </a>
  );
}

function Divider({ label }) {
  return (
    <div className="flex flex-row gap-3 w-full items-center pr-3">
      <p className={`${JkSans.className} font-medium whitespace-nowrap`}>{label}</p>
      <div className="h-[1px] bg-slate-600 w-full flex flex-grow" />

    </div>
  );
}
