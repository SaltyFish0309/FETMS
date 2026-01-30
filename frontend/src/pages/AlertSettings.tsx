import { useEffect, useState, useCallback } from 'react';
import { alertService, type AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AlertRuleTable } from '@/components/settings/AlertRuleTable';
import { AlertRuleDialog, type AlertRuleFormData } from '@/components/settings/AlertRuleDialog';
import { useTranslation } from 'react-i18next';

const initialFormData: AlertRuleFormData = {
  name: '',
  documentType: 'arcDetails',
  conditionType: 'DAYS_REMAINING',
  value: '',
  isActive: true,
};

export default function AlertSettings() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<AlertRuleFormData>(initialFormData);

  const loadRules = useCallback(async () => {
    try {
      const data = await alertService.getAll();
      setRules(data);
    } catch (error) {
      console.error('Failed to load alert rules', error);
      toast.error(t('alerts.toast.loadError'));
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRules();
  }, [loadRules]);

  const handleOpenDialog = (rule?: AlertRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        documentType: rule.documentType,
        conditionType: rule.conditionType,
        value: String(rule.value),
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        value: formData.conditionType === 'DAYS_REMAINING'
          ? Number(formData.value)
          : new Date(formData.value),
      };

      if (editingRule) {
        await alertService.update(editingRule._id, payload);
        toast.success(t('alerts.toast.updateSuccess'));
      } else {
        await alertService.create(payload);
        toast.success(t('alerts.toast.createSuccess'));
      }

      setIsDialogOpen(false);
      await loadRules();
    } catch (error) {
      console.error('Failed to save alert rule', error);
      toast.error(t('alerts.toast.saveError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('alerts.deleteConfirm.description'))) return;

    try {
      await alertService.delete(id);
      toast.success(t('alerts.toast.deleteSuccess'));
      await loadRules();
    } catch (error) {
      console.error('Failed to delete alert rule', error);
      toast.error(t('alerts.toast.deleteError'));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{t('alerts.page.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('alerts.page.subtitle')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('alerts.page.addButton')}
        </Button>
      </div>

      <AlertRuleTable rules={rules} onEdit={handleOpenDialog} onDelete={handleDelete} />

      <AlertRuleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSave}
        isEditing={!!editingRule}
      />
    </div>
  );
}
