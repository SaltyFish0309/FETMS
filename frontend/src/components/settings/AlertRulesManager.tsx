
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// Define Types
interface AlertRule {
    _id: string;
    name: string;
    documentType: string;
    conditionType: 'DAYS_REMAINING' | 'DATE_THRESHOLD';
    value: string | number;
    isActive: boolean;
}

interface AlertRulesManagerProps {
    onUpdated?: () => void;
}

export function AlertRulesManager({ onUpdated }: AlertRulesManagerProps) {
    const { t } = useTranslation(['settings', 'common']);
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(false);

    // New Rule Form State
    const [newName, setNewName] = useState("");
    const [newDocType, setNewDocType] = useState("arcDetails");
    const [newCondition, setNewCondition] = useState<'DAYS_REMAINING' | 'DATE_THRESHOLD'>("DAYS_REMAINING");
    const [newValue, setNewValue] = useState("");

    // Errors
    const [errors, setErrors] = useState<{ name?: boolean, value?: boolean }>({});

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const fetchRules = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:5000/api/alerts");
            const data = await res.json();
            setRules(data);
        } catch {
            toast.error(t('alerts.toast.loadError', { ns: 'settings' }));
        }
    }, [t]);

    const handleAddRule = async () => {
        // Validation
        const newErrors = {
            name: !newName.trim(),
            value: !newValue.trim()
        };

        if (newErrors.name || newErrors.value) {
            setErrors(newErrors);
            toast.error(t('validation.required', { ns: 'common' }), { position: 'top-center' });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: newName,
                documentType: newDocType,
                conditionType: newCondition,
                value: newCondition === 'DAYS_REMAINING' ? parseInt(newValue) : newValue,
                isActive: true
            };

            const res = await fetch("http://localhost:5000/api/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(t('alerts.toast.createSuccess', { ns: 'settings' }));
                setNewName("");
                setNewValue("");
                setErrors({});
                fetchRules();
                if (onUpdated) onUpdated();
            } else {
                toast.error(t('alerts.toast.saveError', { ns: 'settings' }));
            }
        } catch {
            toast.error(t('alerts.toast.saveError', { ns: 'settings' }));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/api/alerts/${id}`, { method: "DELETE" });
            toast.success(t('alerts.toast.deleteSuccess', { ns: 'settings' }));
            setRules(rules.filter(r => r._id !== id));
            if (onUpdated) onUpdated();
        } catch {
            toast.error(t('alerts.toast.deleteError', { ns: 'settings' }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Rule Form */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">
                        {t('alerts.dialog.fields.name.label', { ns: 'settings' })} <span className="text-destructive">*</span>
                    </label>
                    <Input
                        placeholder={t('alerts.dialog.fields.name.placeholder', { ns: 'settings' })}
                        value={newName}
                        onChange={e => { setNewName(e.target.value); if (errors.name) setErrors({ ...errors, name: false }); }}
                        className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.name && <p className="text-xs text-red-500">{t('validation.required', { ns: 'common' })}</p>}
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{t('alerts.dialog.fields.documentType.label', { ns: 'settings' })}</label>
                    <Select value={newDocType} onValueChange={setNewDocType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="arcDetails">{t('alertRulesTable.documentTypes.arcDetails', { ns: 'settings' })}</SelectItem>
                            <SelectItem value="workPermitDetails">{t('alertRulesTable.documentTypes.workPermitDetails', { ns: 'settings' })}</SelectItem>
                            <SelectItem value="passportDetails">{t('alertRulesTable.documentTypes.passportDetails', { ns: 'settings' })}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{t('alerts.dialog.fields.condition.label', { ns: 'settings' })}</label>
                    <Select value={newCondition} onValueChange={(val: 'DAYS_REMAINING' | 'DATE_THRESHOLD') => setNewCondition(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAYS_REMAINING">{t('alertRulesTable.conditionTypes.daysRemaining', { ns: 'settings' })}</SelectItem>
                            <SelectItem value="DATE_THRESHOLD">{t('alertRulesTable.conditionTypes.dateThreshold', { ns: 'settings' })}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">
                        {newCondition === 'DAYS_REMAINING' 
                            ? t('alerts.dialog.fields.value.daysLabel', { ns: 'settings' }) 
                            : t('alerts.dialog.fields.value.dateLabel', { ns: 'settings' })} <span className="text-red-500">*</span>
                    </label>
                    {newCondition === 'DAYS_REMAINING' ? (
                        <Input
                            type="number"
                            placeholder={t('alerts.dialog.fields.daysThreshold.placeholder', { ns: 'settings' })}
                            value={newValue}
                            onChange={e => { setNewValue(e.target.value); if (errors.value) setErrors({ ...errors, value: false }); }}
                            className={cn(errors.value && "border-red-500 focus-visible:ring-red-500")}
                        />
                    ) : (
                        <Input
                            type="date"
                            value={newValue}
                            onChange={e => { setNewValue(e.target.value); if (errors.value) setErrors({ ...errors, value: false }); }}
                            className={cn(errors.value && "border-red-500 focus-visible:ring-red-500")}
                        />
                    )}
                    {errors.value && <p className="text-xs text-red-500">{t('validation.required', { ns: 'common' })}</p>}
                </div>
                <div className="flex items-end pb-1">
                    <Button onClick={handleAddRule} disabled={loading}>
                        <Plus className="w-4 h-4 mr-2" /> {t('alerts.dialog.buttons.create', { ns: 'settings' })}
                    </Button>
                </div>
            </div>

            {/* Rules Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('alertRulesTable.headers.name', { ns: 'settings' })}</TableHead>
                            <TableHead>{t('alertRulesTable.headers.documentType', { ns: 'settings' })}</TableHead>
                            <TableHead>{t('alertRulesTable.headers.condition', { ns: 'settings' })}</TableHead>
                            <TableHead>{t('alertRulesTable.headers.value', { ns: 'settings' })}</TableHead>
                            <TableHead className="text-right">{t('alertRulesTable.headers.actions', { ns: 'settings' })}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map((rule) => (
                            <TableRow key={rule._id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell>
                                    {rule.documentType === 'arcDetails' && t('alertRulesTable.documentTypes.arcDetails', { ns: 'settings' })}
                                    {rule.documentType === 'workPermitDetails' && t('alertRulesTable.documentTypes.workPermitDetails', { ns: 'settings' })}
                                    {rule.documentType === 'passportDetails' && t('alertRulesTable.documentTypes.passportDetails', { ns: 'settings' })}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING' 
                                        ? t('alertRulesTable.conditionTypes.daysRemaining', { ns: 'settings' })
                                        : t('alertRulesTable.conditionTypes.dateThreshold', { ns: 'settings' })}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING'
                                        ? t('alertRulesTable.daysFormat', { value: rule.value, ns: 'settings' })
                                        : rule.value ? format(new Date(rule.value as string), 'yyyy/MM/dd') : 'N/A'
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteRule(rule._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rules.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    {t('alertRulesTable.noResults', { ns: 'settings' })}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
