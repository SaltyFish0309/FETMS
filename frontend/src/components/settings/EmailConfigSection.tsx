import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { emailConfigService, type EmailConfigStatus } from '@/services/emailConfigService';

export function EmailConfigSection() {
  const { t } = useTranslation('settings');
  const [status, setStatus] = useState<EmailConfigStatus | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStatus = async () => {
    try {
      setStatus(await emailConfigService.getStatus());
    } catch {
      // non-critical status fetch — silently fail
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleSave = async () => {
    if (!clientId || !clientSecret) return;
    setSaving(true);
    try {
      await emailConfigService.saveCredentials(clientId, clientSecret);
      toast.success(t('emailConfig.toast.saveSuccess'));
      await loadStatus();
    } catch {
      toast.error(t('emailConfig.toast.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await emailConfigService.getAuthUrl();
      window.location.href = url;
    } catch {
      toast.error(t('emailConfig.toast.connectionError'));
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await emailConfigService.disconnect();
      toast.success(t('emailConfig.toast.disconnectSuccess'));
      await loadStatus();
    } catch {
      toast.error(t('emailConfig.toast.disconnectError'));
    } finally {
      setDisconnecting(false);
    }
  };

  if (!status) return null;

  if (status.connected) {
    return (
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">{t('emailConfig.connected.connectedBadge')}</span>
        </div>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">{t('emailConfig.connected.sendingAs')}: </span>
            <span className="font-medium">{status.connectedEmail}</span>
          </p>
          <p className="text-muted-foreground">{t('emailConfig.connected.notice')}</p>
        </div>
        <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
          {t('emailConfig.connected.disconnectButton')}
        </Button>
      </div>
    );
  }

  if (status.configured) {
    return (
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">{t('emailConfig.notConnected.savedBadge')}</span>
        </div>
        <p className="text-sm text-muted-foreground">{t('emailConfig.notConnected.step2')}</p>
        <Button onClick={handleConnect} disabled={connecting}>
          {t('emailConfig.notConnected.connectButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div>
        <h3 className="font-semibold">{t('emailConfig.notConfigured.heading')}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t('emailConfig.notConfigured.description')}</p>
      </div>
      <p className="text-sm">{t('emailConfig.notConfigured.step1')}</p>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="clientId">{t('emailConfig.notConfigured.clientIdLabel')}</Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder={t('emailConfig.notConfigured.clientIdPlaceholder')}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientSecret">{t('emailConfig.notConfigured.clientSecretLabel')}</Label>
          <Input
            id="clientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={t('emailConfig.notConfigured.clientSecretPlaceholder')}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving || !clientId || !clientSecret}>
        {t('emailConfig.notConfigured.saveButton')}
      </Button>
    </div>
  );
}
