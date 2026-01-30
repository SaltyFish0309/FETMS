import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CreateStageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onTitleChange: (title: string) => void;
    onCreate: () => void;
}

export function CreateStageDialog({
    open,
    onOpenChange,
    title,
    onTitleChange,
    onCreate,
}: CreateStageDialogProps) {
    const { t } = useTranslation('settings');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('stages.dialog.title')}</DialogTitle>
                    <DialogDescription>{t('stages.dialog.description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">{t('stages.dialog.fields.name.label')}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder={t('stages.dialog.fields.name.placeholder')}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('stages.dialog.buttons.cancel')}
                    </Button>
                    <Button onClick={onCreate}>{t('stages.dialog.buttons.create')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
