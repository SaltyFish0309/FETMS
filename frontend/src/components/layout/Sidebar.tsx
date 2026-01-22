import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Settings, School as SchoolIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Teachers", href: "/teachers", icon: Users },
    { name: "Schools", href: "/schools", icon: SchoolIcon },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="font-bold text-white">F</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight">FETMS</span>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-6">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white hover:pl-4"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        AD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Admin User</span>
                        <span className="text-xs text-slate-500">admin@fetms.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
