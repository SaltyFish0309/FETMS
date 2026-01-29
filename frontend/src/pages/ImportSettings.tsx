import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ImportSettings() {
    const { t } = useTranslation('settings');
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{t('import.page.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('import.page.subtitle')}
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('import.sections.bulkImport.title')}</CardTitle>
                        <CardDescription>
                            {t('import.sections.bulkImport.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted border-border">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">{t('import.sections.bulkImport.comingSoon')}</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                {t('import.sections.bulkImport.comingSoonDesc')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

