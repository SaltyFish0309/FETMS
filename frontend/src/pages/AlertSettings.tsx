import { useEffect, useState, useCallback } from 'react';
import { alertService, type AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AlertRuleTable } from '@/components/settings/AlertRuleTable';
import { AlertRuleDialog, type AlertRuleFormData } from '@/components/settings/AlertRuleDialog';

const initialFormData: AlertRuleFormData = {
  name: '',
  documentType: 'arcDetails',
  conditionType: 'DAYS_REMAINING',
  value: '',
  isActive: true,
};

export default function AlertSettings() {
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
      toast.error('Failed to load alert rules');
    }
  }, []);

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
        toast.success('Alert rule updated');
      } else {
        await alertService.create(payload);
        toast.success('Alert rule created');
      }

      setIsDialogOpen(false);
      await loadRules();
    } catch (error) {
      console.error('Failed to save alert rule', error);
      toast.error('Failed to save alert rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;

    try {
      await alertService.delete(id);
      toast.success('Alert rule deleted');
      await loadRules();
    } catch (error) {
      console.error('Failed to delete alert rule', error);
      toast.error('Failed to delete alert rule');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Alert Rules</h1>
          <p className="text-muted-foreground mt-1">Configure expiry alerts for documents</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
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
