import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, ChevronRight, Bell, Layers, Settings2, Database } from "lucide-react";

const Settings = () => {
    const navigate = useNavigate();

    const settingsSections = [
        {
            title: "Project Management",
            description: "Create, edit, and archive projects",
            icon: FolderKanban,
            path: "/settings/projects",
            iconColor: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Alert Rules",
            description: "Configure document expiry alerts",
            icon: Bell,
            path: "/settings/alerts",
            iconColor: "text-amber-600",
            bgColor: "bg-amber-100"
        },
        {
            title: "Pipeline Stages",
            description: "Manage recruitment pipeline stages",
            icon: Layers,
            path: "/settings/stages",
            iconColor: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            title: "User Preferences",
            description: "Customize application theme and appearance",
            icon: Settings2,
            path: "/settings/preferences",
            iconColor: "text-slate-600",
            bgColor: "bg-slate-100"
        },
        {
            title: "Data Import",
            description: "Import teachers and schools from external sources",
            icon: Database,
            path: "/settings/import",
            iconColor: "text-slate-600",
            bgColor: "bg-slate-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-2">Manage application settings and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={section.path}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
                            onClick={() => navigate(section.path)}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${section.iconColor}`} />
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <CardTitle className="text-xl mt-4">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-blue-600 font-medium group-hover:underline">
                                    Manage settings →
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};


export default Settings;
