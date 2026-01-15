import { useEffect, useState, useMemo } from "react";
import { teacherService, type Teacher } from "@/services/teacherService";
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
import { Plus, LayoutGrid, List, Search, Filter } from "lucide-react";
import { TeacherKanbanBoard } from "@/components/teachers/TeacherKanbanBoard";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportTeachersDialog } from "@/components/teachers/ImportTeachersDialog";
import { DataTable } from "@/components/teachers/list/DataTable";
import { columns } from "@/components/teachers/list/columns";

export default function Teachers() {
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

    // Kanban-specific Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHiringStatus, setSelectedHiringStatus] = useState<string[]>([]);
    const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);

    const loadTeachers = async () => {
        try {
            const data = await teacherService.getAll();
            setTeachers(data);
        } catch (error) {
            console.error("Failed to load teachers", error);
        }
    };

    const loadStages = async () => {
        try {
            const data = await teacherService.getStages();
            setStages(data);
        } catch (error) {
            console.error("Failed to load stages", error);
        }
    };

    useEffect(() => {
        loadTeachers();
        loadStages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newTeacher = await teacherService.create(formData);
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

    // Derived Data for Kanban Filters: Unique Nationalities
    const uniqueNationalities = useMemo(() => {
        const nationalities = new Set<string>();
        teachers.forEach(t => {
            if (t.personalInfo?.nationality?.english) {
                nationalities.add(t.personalInfo.nationality.english);
            }
        });
        return Array.from(nationalities).sort();
    }, [teachers]);

    // Derived Data for Kanban Board
    const kanbanFilteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            // Search
            const fullName = `${teacher.firstName} ${teacher.middleName || ''} ${teacher.lastName}`.toLowerCase();
            const school = teacher.personalInfo?.serviceSchool?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();
            const matchesSearch = fullName.includes(query) || school.includes(query);

            // Hiring Status Filter
            const matchesHiringStatus = selectedHiringStatus.length === 0 ||
                (teacher.personalInfo?.hiringStatus && selectedHiringStatus.includes(teacher.personalInfo.hiringStatus));

            // Nationality Filter
            const matchesNationality = selectedNationalities.length === 0 ||
                (teacher.personalInfo?.nationality?.english && selectedNationalities.includes(teacher.personalInfo.nationality.english));

            // Stage Filter
            const matchesStage = selectedStages.length === 0 ||
                (teacher.pipelineStage && selectedStages.includes(teacher.pipelineStage)) ||
                (!teacher.pipelineStage && selectedStages.includes('Uncategorized'));

            return matchesSearch && matchesHiringStatus && matchesNationality && matchesStage;
        });
    }, [teachers, searchQuery, selectedHiringStatus, selectedNationalities, selectedStages]);

    const getStageName = (stageId: string) => {
        const stage = stages.find(s => s._id === stageId);
        return stage ? stage.title : stageId;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teachers</h1>
                    <p className="text-slate-500 mt-2">Manage your Foreign English Teachers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ImportTeachersDialog onSuccess={() => {
                        loadTeachers();
                        loadStages();
                    }} />
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
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
                </div>
            </div>

            {/* View Mode Toggle & Kanban Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 order-2 md:order-2">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
                    >
                        <List className="h-4 w-4 mr-2" /> List
                    </Button>
                    <Button
                        variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                        className={viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
                    </Button>
                </div>

                {/* Filters (Kanban Only) */}
                {viewMode === 'kanban' && (
                    <div className="flex flex-1 items-center gap-2 w-full md:w-auto order-1 md:order-1">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by name or school..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Rest of the filters logic for Kanban... reused from before but only shown in Kanban */}
                        {/* Hiring Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Status
                                    {selectedHiringStatus.length > 0 && (
                                        <>
                                            <div className="mx-2 h-4 w-[1px] bg-slate-200" />
                                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                                {selectedHiringStatus.length}
                                            </Badge>
                                            <div className="hidden space-x-1 lg:flex">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {selectedHiringStatus.length} selected
                                                </Badge>
                                            </div>
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {['Newly Hired', 'Re-Hired'].map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        checked={selectedHiringStatus.includes(status)}
                                        onSelect={(e) => e.preventDefault()}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedHiringStatus([...selectedHiringStatus, status]);
                                            else setSelectedHiringStatus(selectedHiringStatus.filter(s => s !== status));
                                        }}
                                    >
                                        {status}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {selectedHiringStatus.length > 0 && (
                                    <DropdownMenuCheckboxItem
                                        checked={false}
                                        onCheckedChange={() => setSelectedHiringStatus([])}
                                        className="justify-center text-center font-medium"
                                    >
                                        Clear filters
                                    </DropdownMenuCheckboxItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Nationality Filter (Simplified for brevity, same logic as before) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Nationality
                                    {selectedNationalities.length > 0 && (
                                        <div className="ml-2 hidden lg:flex">
                                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                                {selectedNationalities.length}
                                            </Badge>
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
                                <DropdownMenuLabel>Filter by Nationality</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniqueNationalities.map((nat) => (
                                    <DropdownMenuCheckboxItem
                                        key={nat}
                                        checked={selectedNationalities.includes(nat)}
                                        onSelect={(e) => e.preventDefault()}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedNationalities([...selectedNationalities, nat]);
                                            else setSelectedNationalities(selectedNationalities.filter(s => s !== nat));
                                        }}
                                    >
                                        {nat}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Stage Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Stage
                                    {selectedStages.length > 0 && (
                                        <div className="ml-2 hidden lg:flex">
                                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                                {selectedStages.length}
                                            </Badge>
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                {stages.map((stage) => (
                                    <DropdownMenuCheckboxItem
                                        key={stage._id}
                                        checked={selectedStages.includes(stage._id)}
                                        onSelect={(e) => e.preventDefault()}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedStages([...selectedStages, stage._id]);
                                            else setSelectedStages(selectedStages.filter(s => s !== stage._id));
                                        }}
                                    >
                                        {stage.title}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Placeholder for list view left align if needed */}
                {viewMode === 'list' && <div className="flex-1 md:order-1"></div>}
            </div>

            {viewMode === 'list' ? (
                <DataTable
                    columns={columns}
                    data={teachers}
                    meta={{ stages }}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onDeleteSelected={(ids) => {
                        setSelectedIds(new Set(ids));
                        setShowDeleteAlert(true);
                    }}
                />
            ) : (
                <TeacherKanbanBoard
                    teachers={kanbanFilteredTeachers}
                    onRefresh={loadTeachers}
                    selectedStages={selectedStages}
                />
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
