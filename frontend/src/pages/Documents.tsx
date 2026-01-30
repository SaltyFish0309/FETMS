import { useTranslation } from "react-i18next";

const Documents = () => {
    const { t } = useTranslation('documents');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <p className="text-muted-foreground">{t('comingSoon')}</p>
            </div>
        </div>
    );
};

export default Documents;
