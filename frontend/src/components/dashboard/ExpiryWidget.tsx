
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertRulesManager } from "@/components/settings/AlertRulesManager";
import { type DashboardStats, type ExpiryAlert } from "@/services/statsService";
import { useTranslation } from "react-i18next";

interface ExpiryWidgetProps {
    data: DashboardStats['expiry'];
    days?: number; // Deprecated but kept for compat
    onDaysChange?: (days: number) => void; // Deprecated
    onRefresh?: () => void;
    className?: string;
}

interface ExpiryListProps {
    items: ExpiryAlert[];
}

const ExpiryList = ({ items }: ExpiryListProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation('dashboard');

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                <p>{t('actionCenter.expiryWidget.noExpiries')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => {
                const days = differenceInDays(new Date(item.expiryDate), new Date());
                return (
                    <div
                        key={`${item.teacherId}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/teachers/${item.teacherId}`)}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={item.profilePicture ? `http://localhost:5000/${item.profilePicture}` : undefined} />
                                <AvatarFallback>{item.firstName[0]}{item.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm text-foreground">{item.firstName} {item.lastName}</p>
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">
                                        {t('actionCenter.expiryWidget.expiresIn', { days })}
                                    </p>
                                    <p className="text-[10px] text-blue-600 font-medium">
                                        {t('actionCenter.expiryWidget.rule')}: {item.ruleName}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                            {t('actionCenter.expiryWidget.alert')}
                        </Badge>
                    </div>
                );
            })}
        </div>
    );
};

export function ExpiryWidget({ data, onRefresh, className }: ExpiryWidgetProps) {
    const { t } = useTranslation('dashboard');

    // Data is now { arc: [AlertObject], workPermit: [], ... }
    // AlertObject: { ruleName, expiryDate, firstName... }



    return (
        <Card className={`col-span-1 md:col-span-2 lg:col-span-1 h-full min-w-0 ${className || ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground font-heading">{t('actionCenter.title')}</CardTitle>
                    <CardDescription>{t('actionCenter.description')}</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t('actionCenter.expiryWidget.dialog.title')}</DialogTitle>
                            <DialogDescription>
                                {t('actionCenter.expiryWidget.dialog.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <AlertRulesManager onUpdated={onRefresh} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="pt-4">
                <Tabs defaultValue="arc" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="arc">{t('actionCenter.expiryWidget.arc')} ({data.arc.length})</TabsTrigger>
                        <TabsTrigger value="permit">{t('actionCenter.expiryWidget.workPermit')} ({data.workPermit.length})</TabsTrigger>
                        <TabsTrigger value="passport">{t('actionCenter.expiryWidget.passport')} ({data.passport.length})</TabsTrigger>
                        <TabsTrigger value="certificate">{t('actionCenter.expiryWidget.teachingCertificate')} ({data.teachingLicense.length})</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 h-[300px] overflow-y-auto pr-2">
                        <TabsContent value="arc">
                            <ExpiryList items={data.arc} />
                        </TabsContent>
                        <TabsContent value="permit">
                            <ExpiryList items={data.workPermit} />
                        </TabsContent>
                        <TabsContent value="passport">
                            <ExpiryList items={data.passport} />
                        </TabsContent>
                        <TabsContent value="certificate">
                            <ExpiryList items={data.teachingLicense} />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}

