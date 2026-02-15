import { useEffect, useState, useMemo } from "react";
import { schoolService, type School } from "@/services/schoolService";
import { teacherService, type Teacher } from "@/services/teacherService";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, School as SchoolIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImportSchoolsDialog } from "@/components/schools/ImportSchoolsDialog";
import { useTranslation } from "react-i18next";

export default function Schools() {
    const navigate = useNavigate();
    const { t } = useTranslation(['schools', 'common']);
    const { selectedProjectId } = useProjectContext();
    const [schools, setSchools] = useState<School[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const loadData = async () => {
        try {
            const schoolsData = await schoolService.getAll(searchQuery);
            setSchools(schoolsData);

            if (selectedProjectId) {
                const teachersData = await teacherService.getAll(selectedProjectId);
                setTeachers(teachersData);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedProjectId]);

    // Frontend filtering: show only schools with teachers in the selected project
    const filteredSchools = useMemo(() => {
        if (!selectedProjectId) return schools;

        const schoolIdsInProject = new Set(
            teachers
                .map(t => {
                    if (!t.school) return null;
                    return typeof t.school === 'string' ? t.school : t.school._id;
                })
                .filter(Boolean) as string[]
        );

        return schools.filter(s => schoolIdsInProject.has(s._id));
    }, [schools, teachers, selectedProjectId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await schoolService.create({ name: { chinese: newSchoolName } });
            setIsOpen(false);
            setNewSchoolName("");
            loadData();
        } catch (error) {
            console.error("Failed to create school", error);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredSchools.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSchools.map(s => s._id)));
        }
    };

    const handleDeleteSelected = async () => {
        try {
            await Promise.all(Array.from(selectedIds).map(id => schoolService.delete(id)));
            await loadData();
            setSelectedIds(new Set());
            setShowDeleteAlert(false);
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Failed to delete schools", error);
        }
    };

    const handleRowClick = (id: string) => {
        if (isSelectionMode) {
            toggleSelection(id);
        } else {
            navigate(`/schools/${id}`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('schools:title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('schools:subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <ImportSchoolsDialog onSuccess={loadData} />
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> {t('schools:buttons.addSchool')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('schools:dialog.addTitle')}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">{t('schools:dialog.chineseNameLabel')}</Label>
                                    <Input
                                        id="schoolName"
                                        value={newSchoolName}
                                        onChange={(e) => setNewSchoolName(e.target.value)}
                                        placeholder={t('schools:dialog.chineseNamePlaceholder')}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    {t('schools:dialog.createButton')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('schools:search.placeholder')}
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteAlert(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common:actions.delete')} ({selectedIds.size})
                        </Button>
                    )}
                    <Button
                        variant={isSelectionMode ? "secondary" : "outline"}
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedIds(new Set());
                        }}
                    >
                        {isSelectionMode ? t('schools:buttons.cancelSelection') : t('schools:buttons.selectSchools')}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                {isSelectionMode && (
                                    <Checkbox
                                        checked={selectedIds.size === filteredSchools.length && filteredSchools.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                )}
                            </TableHead>
                            <TableHead>{t('schools:table.columns.schoolName')}</TableHead>
                            <TableHead>{t('schools:table.columns.address')}</TableHead>
                            <TableHead>{t('schools:table.columns.principal')}</TableHead>
                            <TableHead>{t('schools:table.columns.contactWindow')}</TableHead>
                            <TableHead>{t('schools:table.columns.contactEmail')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSchools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('schools:table.noResults')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSchools.map((school) => (
                                <TableRow
                                    key={school._id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleRowClick(school._id)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        {isSelectionMode && (
                                            <Checkbox
                                                checked={selectedIds.has(school._id)}
                                                onCheckedChange={() => toggleSelection(school._id)}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <SchoolIcon className="h-4 w-4" />
                                            </div>
                                            {school.name.chinese}
                                        </div>
                                    </TableCell>
                                    <TableCell>{school.address?.chinese || '-'}</TableCell>
                                    <TableCell>{school.principal?.chineseName || '-'}</TableCell>
                                    <TableCell>
                                        {school.contact?.name ? (
                                            <div className="flex flex-col">
                                                <span>{school.contact.name}</span>
                                                <span className="text-xs text-muted-foreground">{school.contact.position}</span>
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>{school.contact?.email || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('schools:dialog.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('schools:dialog.deleteDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
                            {t('schools:dialog.deleteButton')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
