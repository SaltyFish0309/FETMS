import { useEffect, useState, useCallback } from 'react';
import { alertService, type AlertRule } from '@/services/alertService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const documentTypeLabels = {
  arcDetails: 'ARC',
  workPermitDetails: 'Work Permit',
  passportDetails: 'Passport',
};

export default function AlertSettings() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'arcDetails' as AlertRule['documentType'],
    conditionType: 'DAYS_REMAINING' as AlertRule['conditionType'],
    value: '',
    isActive: true,
  });

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
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setFormData({
        name: '',
        documentType: 'arcDetails',
        conditionType: 'DAYS_REMAINING',
        value: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        value: formData.conditionType === 'DAYS_REMAINING' ? Number(formData.value) : new Date(formData.value),
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
          <p className="text-slate-500 mt-1">
            Configure expiry alerts for documents
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="rounded-md border bg-white">
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
                  <TableCell>
                    {documentTypeLabels[rule.documentType]}
                  </TableCell>
                  <TableCell>
                    {rule.conditionType === 'DAYS_REMAINING'
                      ? 'Days Remaining'
                      : 'Date Threshold'}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule._id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure document expiry alerts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ARC Expiring Soon"
              />
            </div>

            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentType: value as AlertRule['documentType'] })
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
                  setFormData({ ...formData, conditionType: value as AlertRule['conditionType'] })
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
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={
                  formData.conditionType === 'DAYS_REMAINING' ? 'e.g., 30' : ''
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
