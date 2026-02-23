import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { emailService, type EmailTemplate } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface FormData {
    name: string;
    subject: string;
    body: string;
    variables: string;
    isDefault: boolean;
}

const emptyForm: FormData = {
    name: '',
    subject: '',
    body: '',
    variables: '',
    isDefault: false,
};

interface FormErrors {
    name?: string;
    subject?: string;
    body?: string;
}

export function EmailTemplateManager() {
    const { t } = useTranslation('email');
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);

    const loadTemplates = useCallback(async () => {
        try {
            const data = await emailService.getTemplates();
            setTemplates(data);
        } catch {
            toast.error(t('templates.errors.fetchFailed'));
        }
    }, [t]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTemplates();
    }, [loadTemplates]);

    const openCreate = () => {
        setEditingTemplate(null);
        setForm(emptyForm);
        setErrors({});
        setIsDialogOpen(true);
    };

    const openEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setForm({
            name: template.name,
            subject: template.subject,
            body: template.body,
            variables: template.variables.join(', '),
            isDefault: template.isDefault,
        });
        setErrors({});
        setIsDialogOpen(true);
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.name.trim()) newErrors.name = t('templates.errors.nameRequired');
        if (!form.subject.trim()) newErrors.subject = t('templates.errors.subjectRequired');
        if (!form.body.trim()) newErrors.body = t('templates.errors.bodyRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            name: form.name.trim(),
            subject: form.subject.trim(),
            body: form.body.trim(),
            variables: form.variables.split(',').map((v) => v.trim()).filter(Boolean),
            isDefault: form.isDefault,
        };

        try {
            if (editingTemplate) {
                await emailService.updateTemplate(editingTemplate._id, payload);
                toast.success(t('templates.success.updated'));
            } else {
                await emailService.createTemplate(payload);
                toast.success(t('templates.success.created'));
            }
            setIsDialogOpen(false);
            await loadTemplates();
        } catch {
            toast.error(editingTemplate
                ? t('templates.errors.updateFailed')
                : t('templates.errors.createFailed')
            );
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await emailService.deleteTemplate(deleteTarget._id);
            toast.success(t('templates.success.deleted'));
            setDeleteTarget(null);
            await loadTemplates();
        } catch {
            toast.error(t('templates.errors.deleteFailed'));
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('templates.create')}
                </Button>
            </div>

            {templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('templates.empty')}</p>
            ) : (
                <div className="space-y-2">
                    {templates.map((tmpl) => (
                        <div
                            key={tmpl._id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div>
                                <p className="font-medium">{tmpl.name}</p>
                                <p className="text-sm text-muted-foreground">{tmpl.subject}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(tmpl)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => setDeleteTarget(tmpl)}
                                    aria-label="delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? t('templates.edit') : t('templates.create')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="tmpl-name">{t('templates.form.name')}</Label>
                            <Input
                                id="tmpl-name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={t('templates.form.namePlaceholder')}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="tmpl-subject">{t('templates.form.subject')}</Label>
                            <Input
                                id="tmpl-subject"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder={t('templates.form.subjectPlaceholder')}
                            />
                            {errors.subject && (
                                <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="tmpl-body">{t('templates.form.body')}</Label>
                            <textarea
                                id="tmpl-body"
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                placeholder={t('templates.form.bodyPlaceholder')}
                            />
                            {errors.body && (
                                <p className="text-sm text-destructive mt-1">{errors.body}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="tmpl-vars">{t('templates.form.variables')}</Label>
                            <Input
                                id="tmpl-vars"
                                value={form.variables}
                                onChange={(e) => setForm({ ...form, variables: e.target.value })}
                                placeholder={t('templates.form.variablesPlaceholder')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('templates.deleteConfirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('templates.deleteConfirm.description', { name: deleteTarget?.name ?? '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('templates.deleteConfirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            {t('templates.deleteConfirm.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
