import { useEffect, useState, useMemo, useCallback } from "react";
import { teacherService, type Teacher } from "@/services/teacherService";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { TeacherKanbanBoard } from "@/components/teachers/TeacherKanbanBoard";
import { ImportTeachersDialog } from "@/components/teachers/ImportTeachersDialog";
import { DataTable } from "@/components/teachers/list/DataTable";
import { columns } from "@/components/teachers/list/columns";
import { ViewModeToggle } from "@/components/teachers/list/ViewModeToggle";
import { ProjectToggle } from "@/components/teachers/list/ProjectToggle";

export default function Teachers() {
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [stages, setStages] = useState<{ _id: string; title: string }[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [isOpen, setIsOpen] = useState(false);

    // Deletion State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
    });

    // Kanban search
    const [searchQuery, setSearchQuery] = useState("");

    const loadTeachers = useCallback(async () => {
        if (!selectedProjectId) return;
        try {
            const data = await teacherService.getAll(selectedProjectId);
            setTeachers(data);
        } catch (error) {
            console.error("Failed to load teachers", error);
        }
    }, [selectedProjectId]);

    const loadStages = useCallback(async () => {
        try {
            const data = await teacherService.getStages();
            setStages(data);
        } catch (error) {
            console.error("Failed to load stages", error);
        }
    }, []);

    // Initial data loading on mount - standard React pattern
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        loadTeachers();
        loadStages();
    }, [loadTeachers, loadStages]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }

        try {
            const newTeacher = await teacherService.create({
                ...formData,
                project: selectedProjectId
            });
            setTeachers([...teachers, newTeacher]);
            setIsOpen(false);
            setFormData({ firstName: "", middleName: "", lastName: "", email: "" });
        } catch (error) {
            console.error("Failed to create teacher", error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await Promise.all(Array.from(selectedIds).map(id => teacherService.delete(id)));
            await loadTeachers();
            setSelectedIds(new Set());
            setShowDeleteAlert(false);
        } catch (error) {
            console.error("Failed to delete teachers", error);
        }
    };

    // Kanban 搜尋過濾（後端已根據專案過濾）
    const kanbanFilteredTeachers = useMemo(() => {
        if (!searchQuery) return teachers;

        return teachers.filter(teacher => {
            const fullName = `${teacher.firstName} ${teacher.middleName || ''} ${teacher.lastName}`.toLowerCase();
            const school = teacher.personalInfo?.serviceSchool?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();
            return fullName.includes(query) || school.includes(query);
        });
    }, [teachers, searchQuery]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teachers</h1>
                    <p className="text-slate-500 mt-2">Manage your Foreign English Teachers.</p>
                </div>
                <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>
            {/* 新增專案切換器 */}
            <ProjectToggle value={selectedProjectId} onChange={setSelectedProjectId} />

            {viewMode === 'list' ? (
                <DataTable
                    columns={columns}
                    data={teachers}
                    meta={{ stages }}
                    onDeleteSelected={(ids) => {
                        setSelectedIds(new Set(ids));
                        setShowDeleteAlert(true);
                    }}
                    actionButtons={
                        <>
                            <ImportTeachersDialog onSuccess={() => {
                                loadTeachers();
                                loadStages();
                            }} />
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" /> Add Teacher
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Teacher</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="middleName">Middle Name</Label>
                                            <Input
                                                id="middleName"
                                                value={formData.middleName}
                                                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">Create Teacher</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </>
                    }
                />
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by name or school..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <TeacherKanbanBoard
                        teachers={kanbanFilteredTeachers}
                        onRefresh={loadTeachers}
                    />
                </>
            )}

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.size} teacher(s) and remove all associated data, including uploaded documents and profile information.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
