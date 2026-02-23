import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { emailService, type EmailLogEntry } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function EmailHistory() {
    const { t } = useTranslation('email');
    const [logs, setLogs] = useState<EmailLogEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        try {
            const result = await emailService.getHistory({ page: 1, limit: 20 });
            setLogs(result.logs);
        } catch {
            toast.error(t('history.errors.fetchFailed'));
        }
    }, [t]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadHistory();
    }, [loadHistory]);

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (logs.length === 0) {
        return (
            <p className="text-center text-muted-foreground py-8">{t('history.empty')}</p>
        );
    }

    return (
        <div className="space-y-2">
            {logs.map((log) => (
                <div key={log._id} className="rounded-lg border">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{log.subject}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(log.sentAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                            <div className="flex gap-2 text-sm">
                                <span className="text-green-600 font-medium">
                                    {t('history.columns.sent')}: {log.totalSent}
                                </span>
                                {log.totalFailed > 0 && (
                                    <span className="text-destructive font-medium">
                                        {t('history.columns.failed')}: {log.totalFailed}
                                    </span>
                                )}
                            </div>
                            <Badge variant="outline">
                                {t(`history.triggeredBy.${log.triggeredBy}`)}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(log._id)}
                            >
                                {expandedId === log._id ? (
                                    <>
                                        <ChevronUp className="h-4 w-4 mr-1" />
                                        {t('history.hideDetails')}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4 mr-1" />
                                        {t('history.details')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {expandedId === log._id && (
                        <div className="border-t px-4 pb-4 pt-2 space-y-1">
                            {log.recipients.map((recipient, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm py-1"
                                >
                                    <div>
                                        <span className="font-medium">{recipient.name}</span>
                                        <span className="text-muted-foreground ml-2">{recipient.email}</span>
                                    </div>
                                    <Badge
                                        variant={recipient.status === 'sent' ? 'default' : 'destructive'}
                                    >
                                        {t(`history.recipientStatus.${recipient.status}`)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
