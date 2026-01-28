import type { AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

const documentTypeLabels: Record<AlertRule['documentType'], string> = {
    arcDetails: 'ARC',
    workPermitDetails: 'Work Permit',
    passportDetails: 'Passport',
};

interface AlertRuleTableProps {
    rules: AlertRule[];
    onEdit: (rule: AlertRule) => void;
    onDelete: (id: string) => void;
}

export function AlertRuleTable({ rules, onEdit, onDelete }: AlertRuleTableProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rules.length > 0 ? (
                        rules.map((rule) => (
                            <TableRow key={rule._id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell>{documentTypeLabels[rule.documentType]}</TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING' ? 'Days Remaining' : 'Date Threshold'}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING'
                                        ? `${rule.value} days`
                                        : new Date(rule.value).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                        {rule.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(rule._id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No alert rules found. Click "Add Rule" to create one.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
