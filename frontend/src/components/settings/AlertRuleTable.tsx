import type { AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AlertRuleTableProps {
    rules: AlertRule[];
    onEdit: (rule: AlertRule) => void;
    onDelete: (id: string) => void;
}

export function AlertRuleTable({ rules, onEdit, onDelete }: AlertRuleTableProps) {
    const { t } = useTranslation('settings');
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('alertRulesTable.headers.name')}</TableHead>
                        <TableHead>{t('alertRulesTable.headers.documentType')}</TableHead>
                        <TableHead>{t('alertRulesTable.headers.condition')}</TableHead>
                        <TableHead>{t('alertRulesTable.headers.value')}</TableHead>
                        <TableHead>{t('alertRulesTable.headers.status')}</TableHead>
                        <TableHead className="text-right">{t('alertRulesTable.headers.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rules.length > 0 ? (
                        rules.map((rule) => (
                            <TableRow key={rule._id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell>{t(`alertRulesTable.documentTypes.${rule.documentType}`)}</TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING'
                                        ? t('alertRulesTable.conditionTypes.daysRemaining')
                                        : t('alertRulesTable.conditionTypes.dateThreshold')}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING'
                                        ? t('alertRulesTable.daysFormat', { value: rule.value })
                                        : new Date(rule.value).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                        {rule.isActive
                                            ? t('alertRulesTable.status.active')
                                            : t('alertRulesTable.status.inactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t('alertRulesTable.actions.edit')}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(rule._id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('alertRulesTable.actions.delete')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                {t('alertRulesTable.noResults')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
