import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    emailService,
    type EmailTemplate,
    type EmailRecipient,
    type PreviewResult,
    type SendResult,
} from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Step = 'recipients' | 'template' | 'preview' | 'result';

interface Props {
    initialRecipients?: EmailRecipient[];
}

export function EmailCompose({ initialRecipients = [] }: Props) {
    const { t } = useTranslation('email');
    const [step, setStep] = useState<Step>('recipients');
    const [recipients, setRecipients] = useState<EmailRecipient[]>(initialRecipients);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [previews, setPreviews] = useState<PreviewResult[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<SendResult | null>(null);

    const loadTemplates = useCallback(async () => {
        try {
            const data = await emailService.getTemplates();
            setTemplates(data);
        } catch {
            toast.error(t('templates.errors.fetchFailed'));
        }
    }, [t]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const removeRecipient = (idx: number) => {
        setRecipients((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleGoToPreview = async () => {
        try {
            const data = await emailService.previewEmails(selectedTemplateId, recipients);
            setPreviews(data);
            setPreviewIndex(0);
            setStep('preview');
        } catch {
            toast.error(t('compose.errors.sendFailed'));
        }
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const data = await emailService.sendEmails({
                templateId: selectedTemplateId,
                recipients,
                triggeredBy: 'manual',
            });
            setResult(data);
            setStep('result');
        } catch {
            toast.error(t('compose.errors.sendFailed'));
        } finally {
            setSending(false);
        }
    };

    if (step === 'result' && result) {
        return (
            <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">{t('compose.result.title')}</h3>
                <p className="text-muted-foreground">
                    {t('compose.result.summary', { sent: result.sent, failed: result.failed })}
                </p>
            </div>
        );
    }

    if (step === 'preview') {
        const preview = previews[previewIndex];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('compose.preview.title')}</h3>
                    <span className="text-sm text-muted-foreground">
                        {previewIndex + 1} {t('compose.preview.of')} {previews.length}
                    </span>
                </div>
                {preview && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <p className="font-medium">{preview.subject}</p>
                        <p className="text-sm">{preview.body}</p>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                            disabled={previewIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('compose.preview.prev')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewIndex((i) => Math.min(previews.length - 1, i + 1))}
                            disabled={previewIndex === previews.length - 1}
                        >
                            {t('compose.preview.next')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                    <Button onClick={handleSend} disabled={sending}>
                        {sending ? t('compose.preview.sending') : t('compose.preview.send')}
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'template') {
        const selectedTemplate = templates.find((tmpl) => tmpl._id === selectedTemplateId);
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('compose.template.title')}</h3>
                <select
                    className="w-full border rounded p-2 bg-background"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                    <option value="">{t('compose.template.placeholder')}</option>
                    {templates.map((tmpl) => (
                        <option key={tmpl._id} value={tmpl._id}>
                            {tmpl.name}
                        </option>
                    ))}
                </select>
                {selectedTemplate && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <p className="text-sm font-medium text-muted-foreground">{t('compose.template.subject')}</p>
                        <p>{selectedTemplate.subject}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-2">{t('compose.template.body')}</p>
                        <p className="text-sm">{selectedTemplate.body}</p>
                    </div>
                )}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep('recipients')}>
                        {t('compose.steps.back')}
                    </Button>
                    <Button onClick={handleGoToPreview} disabled={!selectedTemplateId}>
                        {t('compose.steps.next')}
                    </Button>
                </div>
            </div>
        );
    }

    // Step 1: recipients
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('compose.recipients.title')}</h3>
            {recipients.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t('compose.recipients.empty')}</p>
            ) : (
                <div className="space-y-2">
                    {recipients.map((r, idx) => (
                        <div key={r.email} className="flex items-center justify-between rounded border p-3">
                            <div>
                                <span className="font-medium">{r.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">{r.email}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeRecipient(idx)}>
                                {t('compose.recipients.remove')}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end">
                <Button onClick={() => setStep('template')} disabled={recipients.length === 0}>
                    {t('compose.steps.next')}
                </Button>
            </div>
        </div>
    );
}
