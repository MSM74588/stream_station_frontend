'use client'

import { useRef } from "react";
import useSWR from "swr";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Terminal } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Crumbs from "@/components/crumbs";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();
    return data.available_tasks;
};

export default function CommandsPage() {
    const { data, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/taskrunner`,
        fetcher
    );

    const tasks = data ? Object.entries(data) : [];

    return (
        
        <div className="p-4 min-h-full md:px-[10vw] z-0">
            <div className="flex flex-row text-blue-500 font-semibold text-xl items-center justify-between gap-x-2 mb-4">
                Commands
                <Terminal className="w-[24px]" />
            </div>

            <div className="w-full max-h-[80vh] overflow-auto border rounded-md">
                {isLoading && <div>Loading...</div>}
                {error && <div className="text-red-500">Error loading commands</div>}
                {data && <CommandList tasks={tasks} />}
            </div>
        </div>
    );
}

function CommandList({ tasks }: { tasks: [string, string[]][] }) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: tasks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // Estimate can still be rough, but won't break layout
        overscan: 10,
    });

    return (
        <div
            ref={parentRef}
            className="relative overflow-auto h-[99dvh] w-full"
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: "relative",
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const [taskName, commands] = tasks[virtualRow.index];

                    return (
                        <div
                            key={taskName}
                            className="absolute top-0 left-0 w-full px-4 py-3 border-b space-y-2"
                            style={{
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div className="text-sm text-muted-foreground font-medium">
                                {taskName}
                            </div>
                            <code className="text-white bg-black/70 p-2 rounded block font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {commands.join('\n')}
                            </code>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
