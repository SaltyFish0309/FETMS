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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
                    <DialogDescription>Configure document expiry alerts</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Rule Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                            placeholder="e.g., ARC Expiring Soon"
                        />
                    </div>

                    <div>
                        <Label htmlFor="documentType">Document Type</Label>
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
                                <SelectItem value="arcDetails">ARC</SelectItem>
                                <SelectItem value="workPermitDetails">Work Permit</SelectItem>
                                <SelectItem value="passportDetails">Passport</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="conditionType">Condition Type</Label>
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
                                <SelectItem value="DAYS_REMAINING">Days Remaining</SelectItem>
                                <SelectItem value="DATE_THRESHOLD">Date Threshold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="value">
                            {formData.conditionType === 'DAYS_REMAINING' ? 'Days' : 'Date'}
                        </Label>
                        <Input
                            id="value"
                            type={formData.conditionType === 'DAYS_REMAINING' ? 'number' : 'date'}
                            value={formData.value}
                            onChange={(e) => onFormChange({ ...formData, value: e.target.value })}
                            placeholder={formData.conditionType === 'DAYS_REMAINING' ? 'e.g., 30' : ''}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked: boolean) => onFormChange({ ...formData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>{isEditing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
