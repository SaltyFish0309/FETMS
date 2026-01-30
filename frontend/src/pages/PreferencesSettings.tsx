import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/contexts/PreferencesContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function PreferencesSettings() {
    const { t } = useTranslation('settings');
    const navigate = useNavigate();
    const { preferences, updatePreferences } = usePreferences();
    const systemPrefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{t('preferences.page.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('preferences.page.subtitle')}
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('preferences.sections.appearance.title')}</CardTitle>
                        <CardDescription>
                            {t('preferences.sections.appearance.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme-toggle" className="flex flex-col gap-1">
                                <span>{t('preferences.sections.appearance.theme.label')}</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    {t('preferences.sections.appearance.theme.description')}
                                </span>
                            </Label>
                            <div id="theme-toggle">
                                <ThemeToggle />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="font-size" className="flex flex-col gap-1">
                                <span>{t('preferences.sections.appearance.fontSize.label')}</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    {t('preferences.sections.appearance.fontSize.description')}
                                </span>
                            </Label>
                            <Select
                                value={preferences.fontSize}
                                onValueChange={(value: 'small' | 'medium' | 'large') =>
                                    updatePreferences({ fontSize: value })
                                }
                            >
                                <SelectTrigger id="font-size" className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">{t('preferences.sections.appearance.fontSize.small')}</SelectItem>
                                    <SelectItem value="medium">{t('preferences.sections.appearance.fontSize.medium')}</SelectItem>
                                    <SelectItem value="large">{t('preferences.sections.appearance.fontSize.large')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="density" className="flex flex-col gap-1">
                                <span>{t('preferences.sections.appearance.density.label')}</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    {t('preferences.sections.appearance.density.description')}
                                </span>
                            </Label>
                            <Select
                                value={preferences.density}
                                onValueChange={(value: 'compact' | 'comfortable' | 'spacious') =>
                                    updatePreferences({ density: value })
                                }
                            >
                                <SelectTrigger id="density" className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="compact">{t('preferences.sections.appearance.density.compact')}</SelectItem>
                                    <SelectItem value="comfortable">{t('preferences.sections.appearance.density.comfortable')}</SelectItem>
                                    <SelectItem value="spacious">{t('preferences.sections.appearance.density.spacious')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('preferences.sections.language.title')}</CardTitle>
                        <CardDescription>
                            {t('preferences.sections.language.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="language-toggle" className="flex flex-col gap-1">
                                <span>{t('preferences.sections.language.language.label')}</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    {t('preferences.sections.language.language.description')}
                                </span>
                            </Label>
                            <div id="language-toggle">
                                <LanguageToggle />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('preferences.sections.accessibility.title')}</CardTitle>
                        <CardDescription>
                            {t('preferences.sections.accessibility.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reduced-motion" className="flex flex-col gap-1">
                                <span>{t('preferences.sections.accessibility.reducedMotion.label')}</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    {t('preferences.sections.accessibility.reducedMotion.description')}
                                    {systemPrefersReducedMotion && (
                                        <span className="block text-xs mt-1 text-amber-600 dark:text-amber-400">
                                            {t('preferences.sections.accessibility.reducedMotion.systemDetected')}
                                        </span>
                                    )}
                                </span>
                            </Label>
                            <Switch
                                id="reduced-motion"
                                checked={preferences.reducedMotion}
                                onCheckedChange={(checked) => updatePreferences({ reducedMotion: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
