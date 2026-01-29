import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PreferencesSettings() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">User Preferences</h1>
                    <p className="text-muted-foreground mt-1">
                        Customize your experience
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize how the application looks properly on your device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme-toggle" className="flex flex-col gap-1">
                                <span>Theme</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Select your preferred color theme
                                </span>
                            </Label>
                            <div id="theme-toggle">
                                <ThemeToggle />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>
                            Manage your language preferences and regional settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="language-toggle" className="flex flex-col gap-1">
                                <span>Language</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Select your preferred interface language
                                </span>
                            </Label>
                            <div id="language-toggle">
                                <LanguageToggle />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
