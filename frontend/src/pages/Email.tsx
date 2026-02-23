import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplateManager } from '@/components/email/EmailTemplateManager';
import { EmailHistory } from '@/components/email/EmailHistory';
import { EmailCompose } from '@/components/email/EmailCompose';
import type { EmailRecipient } from '@/services/emailService';

interface LocationState {
    recipients?: EmailRecipient[];
}

export default function Email() {
    const { t } = useTranslation('email');
    const location = useLocation();
    const state = location.state as LocationState | null;
    const initialRecipients = state?.recipients ?? [];

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t('page.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('page.description')}</p>
            </div>

            <Tabs defaultValue={initialRecipients.length > 0 ? 'compose' : 'compose'}>
                <TabsList>
                    <TabsTrigger value="compose">{t('tabs.compose')}</TabsTrigger>
                    <TabsTrigger value="templates">{t('tabs.templates')}</TabsTrigger>
                    <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="mt-6">
                    <EmailCompose initialRecipients={initialRecipients} />
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <EmailTemplateManager />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <EmailHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
