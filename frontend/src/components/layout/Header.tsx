import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-slate-500" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </Button>
            </div>
        </header>
    );
}
