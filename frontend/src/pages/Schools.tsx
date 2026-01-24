import { useEffect, useState, useMemo } from "react";
import { schoolService, type School } from "@/services/schoolService";
import { teacherService, type Teacher } from "@/services/teacherService";
import { useProjectContext } from "@/contexts/ProjectContext";
import { ProjectToggle } from "@/components/teachers/list/ProjectToggle";
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

export default function Schools() {
    const navigate = useNavigate();
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Schools</h1>
                    <p className="text-slate-500 mt-2">Manage partner schools and their profiles.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ImportSchoolsDialog onSuccess={loadData} />
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add School
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New School</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">Chinese School Name</Label>
                                    <Input
                                        id="schoolName"
                                        value={newSchoolName}
                                        onChange={(e) => setNewSchoolName(e.target.value)}
                                        placeholder="e.g. 臺北市立第一女子高級中學"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    Create School
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Project Toggle */}
            <ProjectToggle value={selectedProjectId} onChange={setSelectedProjectId} />

            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search schools..."
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
                            Delete ({selectedIds.size})
                        </Button>
                    )}
                    <Button
                        variant={isSelectionMode ? "secondary" : "outline"}
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedIds(new Set());
                        }}
                    >
                        {isSelectionMode ? "Cancel Selection" : "Select Schools"}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
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
                            <TableHead>School Name (Chinese)</TableHead>
                            <TableHead>Address (Chinese)</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Contact Window</TableHead>
                            <TableHead>Contact Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSchools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No schools found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSchools.map((school) => (
                                <TableRow
                                    key={school._id}
                                    className="cursor-pointer hover:bg-slate-50"
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
                                                <span className="text-xs text-slate-500">{school.contact.position}</span>
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected schools.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
