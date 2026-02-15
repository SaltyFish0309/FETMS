import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, ChevronRight, Bell, Layers, Settings2, Database } from "lucide-react";

const Settings = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('settings');

    const settingsSections = [
        {
            titleKey: "sections.projectManagement.title",
            descriptionKey: "sections.projectManagement.description",
            icon: FolderKanban,
            path: "/settings/projects",
            iconColor: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            titleKey: "sections.alertRules.title",
            descriptionKey: "sections.alertRules.description",
            icon: Bell,
            path: "/settings/alerts",
            iconColor: "text-amber-600",
            bgColor: "bg-amber-100"
        },
        {
            titleKey: "sections.pipelineStages.title",
            descriptionKey: "sections.pipelineStages.description",
            icon: Layers,
            path: "/settings/stages",
            iconColor: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            titleKey: "sections.userPreferences.title",
            descriptionKey: "sections.userPreferences.description",
            icon: Settings2,
            path: "/settings/preferences",
            iconColor: "text-muted-foreground",
            bgColor: "bg-muted"
        },
        {
            titleKey: "sections.dataImport.title",
            descriptionKey: "sections.dataImport.description",
            icon: Database,
            path: "/settings/import",
            iconColor: "text-muted-foreground",
            bgColor: "bg-muted"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
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
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                </div>
                                <CardTitle className="text-xl mt-4">{t(section.titleKey as never)}</CardTitle>
                                <CardDescription>{t(section.descriptionKey as never)}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-blue-600 font-medium group-hover:underline">
                                    {t('actions.manageSettings')} →
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
