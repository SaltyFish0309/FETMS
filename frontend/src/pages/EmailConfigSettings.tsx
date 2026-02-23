import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { EmailConfigSection } from '@/components/settings/EmailConfigSection';

export default function EmailConfigSettings() {
  const { t } = useTranslation('settings');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam === 'connected') {
      toast.success(t('emailConfig.toast.connectionSuccess'));
      setSearchParams({});
    } else if (emailParam === 'error') {
      toast.error(t('emailConfig.toast.connectionError'));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, t]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('emailConfig.page.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('emailConfig.page.subtitle')}</p>
      </div>
      <EmailConfigSection />
    </div>
  );
}
