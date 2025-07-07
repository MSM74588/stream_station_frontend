import { Calendar, Home, Inbox, Search, Settings, CassetteTape, Clock4Icon, MoonStarIcon, Music, RadioTower, Terminal, Wrench, Heart, History, ExternalLink } from "lucide-react"

import { Plus_Jakarta_Sans } from 'next/font/google'
const JkSans = Plus_Jakarta_Sans({ subsets: ['latin'] })

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"

export const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        role="img"
        viewBox="0 0 24 26"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>YouTube</title>
        <path
            fill="currentColor"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        />
    </svg>
);

export const SpotifyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        role="img"
        viewBox="0 0 24 26"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>Spotify</title>
        <path
            fill="currentColor"
            d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
        />
    </svg>
);

// Menu items.
const items = [
    {
        title: "History",
        url: "#",
        icon: History,
        hoverBg: "hover:bg-blue-500/10",
        iconBg: "bg-blue-600/20",
        iconBgHover: "group-hover/button:bg-blue-600/30",
        borderStyle: "border-2 border-blue-600/20",
        iconColor: "text-blue-500",
        align: "right-[0px]"
    },
    {
        title: "Favourites",
        url: "#",
        icon: Heart,
        hoverBg: "hover:bg-rose-500/10",
        iconBg: "bg-rose-600/20",
        iconBgHover: "group-hover/button:bg-rose-600/30",
        borderStyle: "border-2 border-rose-600/20",
        iconColor: "text-rose-500",
        align: "top-[0px]"
    },
    {
        title: "Radio",
        url: "#",
        icon: RadioTower,
        hoverBg: "hover:bg-emerald-500/10",
        iconBg: "bg-emerald-600/20",
        iconBgHover: "group-hover/button:bg-emerald-600/30",
        borderStyle: "border-2 border-emerald-600/20",
        iconColor: "text-emerald-500",
        align: "top-[1px]"
    },
    {
        title: "Commands",
        url: "#",
        icon: Terminal,
        hoverBg: "hover:bg-yellow-500/10",
        iconBg: "bg-yellow-600/20",
        iconBgHover: "group-hover/button:bg-yellow-600/30",
        borderStyle: "border-2 border-yellow-600/20",
        iconColor: "text-yellow-500",
        align: "top-[1px]"
    },
]

const services = [
    {
        title: "Youtube",
        icon: YoutubeIcon,
        hoverBg: "hover:bg-rose-500/10",
        iconBg: "bg-rose-600/20",
        iconBgHover: "group-hover/button:bg-rose-600/30",
        borderStyle: "border-2 border-rose-600/20",
        adjustment: "",
        iconColor: "text-red-500",
        align: "top-[1px]"
    },
    {
        title: "Spotify",
        icon: SpotifyIcon,
        hoverBg: "hover:bg-green-500/10",
        iconBg: "bg-green-600/20",
        iconBgHover: "group-hover/button:bg-green-500/30",
        borderStyle: "border-2 border-green-600/20",
        iconColor: "text-green-500",
    },
    {
        title: "Local",
        icon: CassetteTape,
        hoverBg: "hover:bg-yellow-400/10",
        iconBg: "bg-yellow-500/20",
        iconBgHover: "group-hover:bg-yellow-500/30",
        borderStyle: "border-2 border-yellow-500/20",
        align: "top-[1px]",
        iconColor: "text-yellow-500",
    }

]

export function AppSidebar() {
    return (
        <Sidebar className="">
            <SidebarHeader>
                <SidebarGroup>
                    <MainBlock />
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} >
                                    <SidebarMenuButton asChild size="lg" className={`group/button flex flex-row 
                                        items-center gap-x-3 font-sans font-extrabold transition-all duration-300 
                                        rounded-lg group-hover/button:shadow-xl/30 shadow-blue-500/50 
                                        
                                        ${item.hoverBg}`}>
                                        <a href={item.url}>
                                            <div className={`aspect-square h-10 rounded-2xl 
                                                group-hover/button:rounded-3xl group-hover/button:scale-200 flex items-center justify-center transition-all duration-300 ${item.iconBg} ${item.iconBgHover} ${item.borderStyle}`}>
                                                <item.icon className={`relative ${item.align ?? ""} ${item.iconColor} z-0`} />
                                            </div>
                                            <p className={`font-semibold ${JkSans.className} z-50`}>{item.title}</p>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Music Services</SidebarGroupLabel>
                    <SidebarContent>
                        <SidebarMenu>
                            {services.map((service) => (
                                <SidebarMenuItem key={service.title}>
                                    <SidebarMenuButton
                                        asChild
                                        size="lg"
                                        className={`group/button flex flex-row items-center gap-x-3 font-sans font-extrabold transition-all duration-300 rounded-lg ${service.hoverBg} cursor-pointer`}
                                    >
                                        <a href={service.url}>
                                            <div
                                                className={`group-hover/button:scale-200  aspect-square h-10 rounded-2xl group-hover/button:rounded-3xl flex items-center justify-center transition-all duration-150 ${service.verticalAdjustment ?? ""} ${service.iconBg} ${service.iconBgHover} ${service.borderStyle}`}
                                            >
                                                <service.icon className={`w-7 h-7 p-1 ${service.align} ${service.iconColor} z-50`} />
                                            </div>
                                            <p className={`font-semibold ${JkSans.className} select-auto cursor-pointer z-99`}>{service.title}</p>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter>
                <SidebarGroup className="flex items-start">
                    <Button variant="link" size="sm" className="text-white/80">
                        <ExternalLink />  Open Jellyfin
                    </Button>
                    <Button variant="link" size="sm" className="text-white/80">
                        <MoonStarIcon />  Set Sleep Timer
                    </Button>
                    <Button variant="link" size="sm" className="text-white/80">
                        <Settings />  Settings
                    </Button>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    )
}


function MainBlock() {
    return (
        <div className="border-border border-2 w-full min-h-[15em] overflow-hidden stretch flex flex-col rounded-lg">
            <div className="bg-secondary flex flex-grow"></div>
            <div className="bg-background p-3 items-center align-middle flex flex-row gap-3">
                <Clock4Icon color="white" size={20} />
                <p className="font-sans">12:39 AM</p>
            </div>
        </div>
    );
}