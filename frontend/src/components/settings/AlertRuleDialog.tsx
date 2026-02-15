import type { AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export interface AlertRuleFormData {
    name: string;
    documentType: AlertRule['documentType'];
    conditionType: AlertRule['conditionType'];
    value: string;
    isActive: boolean;
}

interface AlertRuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: AlertRuleFormData;
    onFormChange: (data: AlertRuleFormData) => void;
    onSave: () => void;
    isEditing: boolean;
}

export function AlertRuleDialog({
    open,
    onOpenChange,
    formData,
    onFormChange,
    onSave,
    isEditing,
}: AlertRuleDialogProps) {
    const { t } = useTranslation('settings');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? t('alerts.dialog.editTitle') : t('alerts.dialog.createTitle')}</DialogTitle>
                    <DialogDescription>{t('alerts.dialog.description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('alerts.dialog.fields.name.label')}</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                            placeholder={t('alerts.dialog.fields.name.placeholder')}
                        />
                    </div>

                    <div>
                        <Label htmlFor="documentType">{t('alerts.dialog.fields.documentType.label')}</Label>
                        <Select
                            value={formData.documentType}
                            onValueChange={(value) =>
                                onFormChange({ ...formData, documentType: value as AlertRule['documentType'] })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="arcDetails">{t('alertRulesTable.documentTypes.arcDetails')}</SelectItem>
                                <SelectItem value="workPermitDetails">{t('alertRulesTable.documentTypes.workPermitDetails')}</SelectItem>
                                <SelectItem value="passportDetails">{t('alertRulesTable.documentTypes.passportDetails')}</SelectItem>
                                <SelectItem value="teachingLicense">{t('alertRulesTable.documentTypes.teachingLicense')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="conditionType">{t('alerts.dialog.fields.condition.label')}</Label>
                        <Select
                            value={formData.conditionType}
                            onValueChange={(value) =>
                                onFormChange({ ...formData, conditionType: value as AlertRule['conditionType'] })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DAYS_REMAINING">{t('alertRulesTable.conditionTypes.daysRemaining')}</SelectItem>
                                <SelectItem value="DATE_THRESHOLD">{t('alertRulesTable.conditionTypes.dateThreshold')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="value">
                            {formData.conditionType === 'DAYS_REMAINING' 
                                ? t('alerts.dialog.fields.value.daysLabel') 
                                : t('alerts.dialog.fields.value.dateLabel')}
                        </Label>
                        <Input
                            id="value"
                            type={formData.conditionType === 'DAYS_REMAINING' ? 'number' : 'date'}
                            value={formData.value}
                            onChange={(e) => onFormChange({ ...formData, value: e.target.value })}
                            placeholder={formData.conditionType === 'DAYS_REMAINING' ? t('alerts.dialog.fields.daysThreshold.placeholder') : ''}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked: boolean) => onFormChange({ ...formData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">{t('alerts.dialog.statuses.active')}</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('alerts.dialog.buttons.cancel')}
                    </Button>
                    <Button onClick={onSave}>{isEditing ? t('alerts.dialog.buttons.save') : t('alerts.dialog.buttons.create')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
