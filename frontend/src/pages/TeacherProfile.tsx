import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { teacherService, type Teacher } from "@/services/teacherService";
import { schoolService, type School } from "@/services/schoolService";

import { DocumentManager } from "@/components/documents/DocumentManager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { PhoneInput } from "@/components/ui/phone-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CheckCircle, AlertCircle, Upload, FileText, Trash2, Save, Pencil, MapPin, Phone, Mail, GraduationCap, Briefcase, X, Camera, Check, ChevronsUpDown } from "lucide-react";
import { AvatarEditor } from "@/components/teachers/AvatarEditor";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { countries } from "country-data-list";
import { useNavigate } from "react-router-dom";

export default function TeacherProfile() {
    const { t } = useTranslation('teachers');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [stages, setStages] = useState<{ _id: string; title: string }[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    // Local Edit States
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Teacher>>({});

    // Document State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'core' | 'adhoc' } | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<{ id: string; name: string } | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Avatar State
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [avatarHover, setAvatarHover] = useState(false);

    const loadTeacher = useCallback(async (teacherId: string) => {
        try {
            const data = await teacherService.getById(teacherId);
            setTeacher(data);
            setFormData(data);
        } catch (error) {
            console.error("Failed to load teacher", error);
            toast.error(t('profile.messages.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const loadStages = useCallback(async () => {
        try {
            const data = await teacherService.getStages();
            setStages(data);
        } catch (error) {
            console.error("Failed to load stages", error);
        }
    }, []);

    const loadSchools = useCallback(async () => {
        try {
            const data = await schoolService.getAll();
            setSchools(data);
        } catch (error) {
            console.error("Failed to load schools", error);
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadTeacher(id);
            loadStages();
            loadSchools();
        }
    }, [id, loadTeacher, loadStages, loadSchools]);

    const getStageName = (stageId?: string) => {
        if (!stageId) return 'Uncategorized';
        const stage = stages.find(s => s._id === stageId);
        return stage ? stage.title : stageId; // Fallback to ID if not found (or 'Uncategorized' if logic dictates)
    };

    const handleAvatarClick = () => {
        document.getElementById('avatar-upload')?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string);
                setAvatarEditorOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = async (file: File) => {
        if (!teacher || !id) return;
        try {
            const updatedTeacher = await teacherService.uploadAvatar(id, file);
            setTeacher(updatedTeacher);
            toast.success(t('profile.avatar.updateSuccess'));
        } catch {
            toast.error(t('profile.avatar.updateError'));
        }
    };

    const handleDeleteAvatar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!teacher || !id) return;
        if (confirm(t('profile.avatar.deleteConfirm'))) {
            try {
                const updatedTeacher = await teacherService.deleteAvatar(id);
                setTeacher(updatedTeacher);
                toast.success(t('profile.avatar.removeSuccess'));
            } catch {
                toast.error(t('profile.avatar.removeError'));
            }
        }
    };

    const handleInputChange = (section: keyof Teacher, field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...((prev[section] as Record<string, unknown>) || {}),
                [field]: value
            }
        }));
    };

    const handleNestedInputChange = (section: keyof Teacher, subSection: string, field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...((prev[section] as Record<string, unknown>) || {}),
                [subSection]: {
                    ...((prev[section] as Record<string, Record<string, unknown>>)?.[subSection] || {}),
                    [field]: value
                }
            }
        }));
    };

    const handleRootInputChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSection = async () => {
        if (!id) return;
        try {
            const updatedTeacher = await teacherService.update(id, formData);
            setTeacher(updatedTeacher);
            setEditingSection(null);
            toast.success(t('profile.messages.updateSuccess'));
        } catch (error) {
            console.error("Update failed", error);
            toast.error(t('profile.messages.updateError'));
        }
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        if (teacher) setFormData(teacher); // Reset form data
    };

    // --- Document Handlers ---
    const handleCoreUpload = async (type: string, file: File) => {
        if (!teacher || !id) return;
        try {
            const updatedTeacher = await teacherService.uploadDocument(id, type, file);
            setTeacher(updatedTeacher);
            toast.success(t('profile.messages.uploadSuccess'));
        } catch {
            toast.error(t('profile.messages.uploadError'));
        }
    };

    const handleAdHocUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!teacher || !id) return;
        const formData = new FormData(e.currentTarget);
        try {
            const updatedTeacher = await teacherService.uploadAdHocDocument(id, formData.get("name") as string, formData.get("file") as File);
            setTeacher(updatedTeacher);
            setUploadDialogOpen(false);
            toast.success(t('profile.messages.uploadSuccess'));
        } catch {
            toast.error(t('profile.messages.uploadError'));
        }
    };

    const confirmDelete = (targetId: string, type: 'core' | 'adhoc') => {
        setDeleteTarget({ id: targetId, type });
        setDeleteConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!teacher || !id || !deleteTarget) return;
        try {
            let updatedTeacher;
            if (deleteTarget.type === 'core') {
                updatedTeacher = await teacherService.deleteDocument(id, deleteTarget.id);
            } else {
                updatedTeacher = await teacherService.deleteAdHocDocument(id, deleteTarget.id);
            }
            setTeacher(updatedTeacher);
            setDeleteConfirmOpen(false);
            toast.success(t('profile.messages.deleteSuccess'));
        } catch {
            toast.error(t('profile.messages.deleteError'));
        }
    };

    const openEditDialog = (docId: string, currentName: string) => {
        setEditingDoc({ id: docId, name: currentName });
        setEditDialogOpen(true);
    };

    const handleUpdateAdHoc = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!teacher || !id || !editingDoc) return;
        const formData = new FormData(e.currentTarget);
        const file = formData.get("file") as File;
        try {
            const updatedTeacher = await teacherService.updateAdHocDocument(id, editingDoc.id, formData.get("name") as string, file.size > 0 ? file : undefined);
            setTeacher(updatedTeacher);
            setEditDialogOpen(false);
            toast.success(t('profile.messages.uploadSuccess'));
        } catch {
            toast.error(t('profile.messages.uploadError'));
        }
    };

    const coreDocs = [
        { key: "passport", label: t('profile.documents.passport') },
        { key: "arc", label: t('profile.documents.arc') },
        { key: "contract", label: t('profile.documents.contract') },
        { key: "workPermit", label: t('profile.documents.workPermit') },
    ];

    const renderSectionHeader = (title: string, icon: React.ReactNode, sectionKey: string) => (
        <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">{icon}</div>
                {title}
            </div>
            {editingSection === sectionKey ? (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <div
                        role="button"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "cursor-pointer")}
                        onClick={handleCancelEdit}
                    >
                        <X className="w-4 h-4" />
                    </div>
                    <div
                        role="button"
                        className={cn(buttonVariants({ size: "sm" }), "cursor-pointer")}
                        onClick={handleSaveSection}
                    >
                        <Save className="w-4 h-4" />
                    </div>
                </div>
            ) : (
                <div
                    role="button"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "cursor-pointer")}
                    onClick={(e) => { e.stopPropagation(); setEditingSection(sectionKey); }}
                >
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </div>
            )}
        </div>
    );

    const isEditing = (section: string) => editingSection === section;

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('profile.loading')}</div>;
    if (!teacher) return <div className="p-8 text-center text-red-500">{t('profile.notFound')}</div>;

    return (
        <div className="space-y-6">
            {/* Header & Remarks Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: Profile Header */}
                <div className="flex items-start justify-between bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
                        </Button>
                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setAvatarHover(true)}
                            onMouseLeave={() => setAvatarHover(false)}
                            onClick={handleAvatarClick}
                        >
                            <Avatar className="h-24 w-24 border-4 border-border transition-opacity group-hover:opacity-75">
                                <AvatarImage src={teacher.profilePicture ? `http://localhost:5000/${teacher.profilePicture}` : undefined} />
                                <AvatarFallback className="text-2xl bg-muted text-muted-foreground">{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                            </Avatar>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>

                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                onClick={(e) => e.stopPropagation()}
                            />

                            {teacher.profilePicture && avatarHover && (
                                <div
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                                    onClick={handleDeleteAvatar}
                                    title="Remove photo"
                                >
                                    <X className="w-3 h-3" />
                                </div>
                            )}
                        </div>

                        <AvatarEditor
                            isOpen={avatarEditorOpen}
                            imageSrc={selectedImage}
                            onClose={() => setAvatarEditorOpen(false)}
                            onSave={handleSaveAvatar}
                        />
                        <div className="space-y-2">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {teacher.firstName} {teacher.middleName ? teacher.middleName + " " : ""}{teacher.lastName}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{teacher.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {teacher.personalInfo?.hiringStatus && (
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                                        {t(('enums.status.' + teacher.personalInfo.hiringStatus.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')) as never)}
                                    </Badge>
                                )}
                                {teacher.personalInfo?.nationality?.english && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                        {teacher.personalInfo.nationality.english}
                                    </Badge>
                                )}
                                {teacher.personalInfo?.serviceSchool && (
                                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                                        {teacher.personalInfo.serviceSchool}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="border-border">
                                    {getStageName(teacher.pipelineStage)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Remarks Section */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col relative group">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-lg font-semibold text-foreground">{t('profile.remarks')}</Label>
                        {/* Save Button for Remarks */}
                        {formData.remarks !== teacher.remarks && (
                            <Button
                                size="sm"
                                onClick={async () => {
                                    if (!id) return;
                                    try {
                                        const updated = await teacherService.update(id, { remarks: formData.remarks });
                                        setTeacher(updated);
                                        setFormData(prev => ({ ...prev, remarks: updated.remarks }));
                                        toast.success(t('profile.messages.remarksSuccess'));
                                    } catch { toast.error(t('profile.messages.remarksError')); }
                                }}
                            >
                                <Save className="w-4 h-4 mr-1" /> {t('actions.save')}
                            </Button>
                        )}
                    </div>
                    <textarea
                        className="flex-1 w-full p-3 text-sm rounded-md border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] bg-background"
                        placeholder={t('profile.remarksPlaceholder')}
                        value={formData.remarks || ''}
                        onChange={(e) => handleRootInputChange('remarks', e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="info">{t('profile.tabs.info')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('profile.tabs.documents')}</TabsTrigger>
                </TabsList>

                {/* TAB 1: PROFILE INFORMATION */}
                <TabsContent value="info" className="mt-6 space-y-6">
                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={[]}>

                        {/* 1. Personal Info */}
                        <AccordionItem value="personal" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.personal'), <MapPin className="w-4 h-4 text-blue-600" />, "personal")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.hiringStatus')}</Label>
                                        <Select
                                            disabled={!isEditing('personal')}
                                            value={formData.personalInfo?.hiringStatus || ''}
                                            onValueChange={(value) => handleInputChange('personalInfo', 'hiringStatus', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.fields.selectStatus')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Newly Hired">{t('enums.status.newly hired')}</SelectItem>
                                                <SelectItem value="Re-Hired">{t('enums.status.re-hired')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.chineseName')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.personalInfo?.chineseName || ''} onChange={e => handleInputChange('personalInfo', 'chineseName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.firstName')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.firstName || ''} onChange={e => handleRootInputChange('firstName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.middleName')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.middleName || ''} onChange={e => handleRootInputChange('middleName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.lastName')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.lastName || ''} onChange={e => handleRootInputChange('lastName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.email')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.email || ''} onChange={e => handleRootInputChange('email', e.target.value)} />
                                    </div>
                                    <div className="space-y-2 flex flex-col">
                                        <Label>{t('profile.fields.serviceSchool')}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !formData.personalInfo?.serviceSchool && "text-muted-foreground"
                                                    )}
                                                    disabled={!isEditing('personal')}
                                                >
                                                    {formData.personalInfo?.serviceSchool
                                                        ? schools.find(
                                                            (school) => school.name.chinese === formData.personalInfo?.serviceSchool
                                                        )?.name.chinese || formData.personalInfo.serviceSchool
                                                        : t('profile.fields.selectSchool')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder={t('profile.fields.searchSchool')} />
                                                    <CommandList>
                                                        <CommandEmpty>{t('profile.fields.noSchool')}</CommandEmpty>
                                                        <CommandGroup>
                                                            {schools.map((school) => (
                                                                <CommandItem
                                                                    value={school.name.chinese}
                                                                    key={school._id}
                                                                    onSelect={() => {
                                                                        handleInputChange('personalInfo', 'serviceSchool', school.name.chinese);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            school.name.chinese === formData.personalInfo?.serviceSchool
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {school.name.chinese}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.nationalityChinese')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.personalInfo?.nationality?.chinese || ''} onChange={e => handleNestedInputChange('personalInfo', 'nationality', 'chinese', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.nationalityEnglish')}</Label>
                                        <CountryDropdown
                                            disabled={!isEditing('personal')}
                                            defaultValue={formData.personalInfo?.nationality?.english ? countries.all.find(c => c.name === formData.personalInfo?.nationality?.english)?.alpha3 : undefined}
                                            onChange={(country) => handleNestedInputChange('personalInfo', 'nationality', 'english', country.name)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.dob')}</Label>
                                        <DatePicker
                                            value={
                                                formData.personalInfo?.dob
                                                    ? new Date(formData.personalInfo.dob)
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "personalInfo",
                                                    "dob",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('personal')}
                                            startYear={1900}
                                            endYear={new Date().getFullYear()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.gender')}</Label>
                                        <Select
                                            disabled={!isEditing('personal')}
                                            value={formData.personalInfo?.gender || ''}
                                            onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.fields.selectGender')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">{t('enums.gender.male')}</SelectItem>
                                                <SelectItem value="Female">{t('enums.gender.female')}</SelectItem>
                                                <SelectItem value="Others">{t('enums.gender.others')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.phone')}</Label>
                                        <PhoneInput
                                            disabled={!isEditing('personal')}
                                            value={formData.personalInfo?.phone || ''}
                                            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                                            defaultCountry="TW"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>{t('profile.fields.addressTaiwan')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.personalInfo?.address?.taiwan || ''} onChange={e => handleNestedInputChange('personalInfo', 'address', 'taiwan', e.target.value)} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>{t('profile.fields.addressHome')}</Label>
                                        <Input readOnly={!isEditing('personal')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.personalInfo?.address?.home || ''} onChange={e => handleNestedInputChange('personalInfo', 'address', 'home', e.target.value)} />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 2. Emergency Contact */}
                        <AccordionItem value="emergency" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.emergency'), <Phone className="w-4 h-4 text-red-600" />, "emergency")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.emergencyName')}</Label>
                                        <Input readOnly={!isEditing('emergency')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.emergencyContact?.name || ''} onChange={e => handleInputChange('emergencyContact', 'name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.emergencyRelationship')}</Label>
                                        <Input readOnly={!isEditing('emergency')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.emergencyContact?.relationship || ''} onChange={e => handleInputChange('emergencyContact', 'relationship', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.phone')}</Label>
                                        <PhoneInput
                                            disabled={!isEditing('emergency')}
                                            value={formData.emergencyContact?.phone || ''}
                                            onChange={(e) => handleInputChange('emergencyContact', 'phone', e.target.value)}
                                            defaultCountry="TW"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.emergencyEmail')}</Label>
                                        <Input readOnly={!isEditing('emergency')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.emergencyContact?.email || ''} onChange={e => handleInputChange('emergencyContact', 'email', e.target.value)} />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 3. Passport & ARC */}
                        <AccordionItem value="passport" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.passport'), <Briefcase className="w-4 h-4 text-amber-600" />, "passport")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 border border-border p-4 rounded-md bg-muted/50">
                                        <h4 className="font-medium text-foreground">{t('profile.documents.passport')}</h4>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.passportNumber')}</Label>
                                            <Input readOnly={!isEditing('passport')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.passportDetails?.number || ''} onChange={e => handleInputChange('passportDetails', 'number', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.passportCountry')}</Label>
                                            <Input readOnly={!isEditing('passport')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.passportDetails?.issuingCountry || ''} onChange={e => handleInputChange('passportDetails', 'issuingCountry', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.passportAuthority')}</Label>
                                            <Input readOnly={!isEditing('passport')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.passportDetails?.issuingAuthority || ''} onChange={e => handleInputChange('passportDetails', 'issuingAuthority', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.issueDate')}</Label>
                                            <DatePicker
                                                value={
                                                    formData.passportDetails
                                                        ?.issueDate
                                                        ? new Date(
                                                            formData.passportDetails.issueDate
                                                        )
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    handleInputChange(
                                                        "passportDetails",
                                                        "issueDate",
                                                        date ? date.toISOString() : null
                                                    )
                                                }
                                                disabled={!isEditing('passport')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.expiryDate')}</Label>
                                            <DatePicker
                                                value={
                                                    formData.passportDetails
                                                        ?.expiryDate
                                                        ? new Date(
                                                            formData.passportDetails.expiryDate
                                                        )
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    handleInputChange(
                                                        "passportDetails",
                                                        "expiryDate",
                                                        date ? date.toISOString() : null
                                                    )
                                                }
                                                disabled={!isEditing('passport')}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border border-border p-4 rounded-md bg-muted/50">
                                        <h4 className="font-medium text-foreground">{t('profile.documents.arc')}</h4>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.expiryDate')}</Label>
                                            <DatePicker
                                                value={
                                                    formData.arcDetails?.expiryDate
                                                        ? new Date(
                                                            formData.arcDetails.expiryDate
                                                        )
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    handleInputChange(
                                                        "arcDetails",
                                                        "expiryDate",
                                                        date ? date.toISOString() : null
                                                    )
                                                }
                                                disabled={!isEditing('passport')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.arcPurpose')}</Label>
                                            <Select
                                                disabled={!isEditing('passport')}
                                                value={formData.arcDetails?.purpose || ''}
                                                onValueChange={(value) => handleInputChange('arcDetails', 'purpose', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('profile.fields.selectPurpose')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Employed">{t('enums.arcPurpose.employed')}</SelectItem>
                                                    <SelectItem value="Dependent">{t('enums.arcPurpose.dependent')}</SelectItem>
                                                    <SelectItem value="APRC">{t('enums.arcPurpose.aprc')}</SelectItem>
                                                    <SelectItem value="Others">{t('enums.gender.others')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 4. Education & Licenses */}
                        <AccordionItem value="education" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.education'), <GraduationCap className="w-4 h-4 text-green-600" />, "education")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Education Block */}
                                    <div className="space-y-4 border border-border p-4 rounded-md bg-muted/50">
                                        <h4 className="font-medium text-foreground">{t('profile.sections.education')}</h4>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.degree')}</Label>
                                            <Select
                                                disabled={!isEditing('education')}
                                                value={formData.education?.degree || ''}
                                                onValueChange={(value) => handleInputChange('education', 'degree', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('profile.fields.selectDegree')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bachelor">{t('enums.degree.bachelor')}</SelectItem>
                                                    <SelectItem value="Master">{t('enums.degree.master')}</SelectItem>
                                                    <SelectItem value="Doctor">{t('enums.degree.doctor')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.major')}</Label>
                                            <Input readOnly={!isEditing('education')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.education?.major || ''} onChange={e => handleInputChange('education', 'major', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.school')}</Label>
                                            <Input readOnly={!isEditing('education')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.education?.school || ''} onChange={e => handleInputChange('education', 'school', e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Licenses Block */}
                                    <div className="space-y-4 border border-border p-4 rounded-md bg-muted/50">
                                        <h4 className="font-medium text-foreground">{t('profile.sections.education')}</h4>
                                        <div className="space-y-2">
                                            <Label>{t('profile.fields.expiryDate')}</Label>
                                            <DatePicker
                                                value={
                                                    formData.teachingLicense
                                                        ?.expiryDate
                                                        ? new Date(
                                                            formData.teachingLicense.expiryDate
                                                        )
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    handleInputChange(
                                                        "teachingLicense",
                                                        "expiryDate",
                                                        date ? date.toISOString() : null
                                                    )
                                                }
                                                disabled={!isEditing('education')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 5. Work Permit */}
                        <AccordionItem value="workPermit" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.workPermit'), <FileText className="w-4 h-4 text-indigo-600" />, "workPermit")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.permitNumber')}</Label>
                                        <Input readOnly={!isEditing('workPermit')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.workPermitDetails?.permitNumber || ''} onChange={e => handleInputChange('workPermitDetails', 'permitNumber', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.startDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.workPermitDetails?.startDate
                                                    ? new Date(
                                                        formData.workPermitDetails.startDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "workPermitDetails",
                                                    "startDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('workPermit')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.expiryDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.workPermitDetails?.expiryDate
                                                    ? new Date(
                                                        formData.workPermitDetails.expiryDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "workPermitDetails",
                                                    "expiryDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('workPermit')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.issueDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.workPermitDetails?.issueDate
                                                    ? new Date(
                                                        formData.workPermitDetails.issueDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "workPermitDetails",
                                                    "issueDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('workPermit')}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 6. Contract Details */}
                        <AccordionItem value="contract" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.contract'), <Briefcase className="w-4 h-4 text-emerald-600" />, "contract")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.contractStart')}</Label>
                                        <DatePicker
                                            value={
                                                formData.contractDetails?.contractStartDate
                                                    ? new Date(
                                                        formData.contractDetails.contractStartDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "contractDetails",
                                                    "contractStartDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('contract')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.contractEnd')}</Label>
                                        <DatePicker
                                            value={
                                                formData.contractDetails?.contractEndDate
                                                    ? new Date(
                                                        formData.contractDetails.contractEndDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "contractDetails",
                                                    "contractEndDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('contract')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.salary')}</Label>
                                        <Input type="number" readOnly={!isEditing('contract')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.contractDetails?.salary || ''} onChange={e => handleInputChange('contractDetails', 'salary', Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.senioritySalary')}</Label>
                                        {!isEditing('contract') ? (
                                            <Input readOnly className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.contractDetails?.senioritySalary || ''} />
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.contractDetails?.senioritySalary?.match(/(\d+)\s*year/)?.[1] || ''}
                                                        onChange={(e) => {
                                                            const y = e.target.value || '0';
                                                            const m = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*month/)?.[1] || '0';
                                                            const d = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*day/)?.[1] || '0';
                                                            handleInputChange('contractDetails', 'senioritySalary', `${y} year(s)/${m} month(s)/${d} day(s)`);
                                                        }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">Yr</span>
                                                </div>
                                                <div className="flex-1 flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.contractDetails?.senioritySalary?.match(/(\d+)\s*month/)?.[1] || ''}
                                                        onChange={(e) => {
                                                            const y = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*year/)?.[1] || '0';
                                                            const m = e.target.value || '0';
                                                            const d = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*day/)?.[1] || '0';
                                                            handleInputChange('contractDetails', 'senioritySalary', `${y} year(s)/${m} month(s)/${d} day(s)`);
                                                        }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">Mo</span>
                                                </div>
                                                <div className="flex-1 flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.contractDetails?.senioritySalary?.match(/(\d+)\s*day/)?.[1] || ''}
                                                        onChange={(e) => {
                                                            const y = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*year/)?.[1] || '0';
                                                            const m = formData.contractDetails?.senioritySalary?.match(/(\d+)\s*month/)?.[1] || '0';
                                                            const d = e.target.value || '0';
                                                            handleInputChange('contractDetails', 'senioritySalary', `${y} year(s)/${m} month(s)/${d} day(s)`);
                                                        }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">Day</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.seniorityLeave')}</Label>
                                        <Input readOnly={!isEditing('contract')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.contractDetails?.seniorityLeave || ''} onChange={e => handleInputChange('contractDetails', 'seniorityLeave', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.payStartDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.contractDetails?.payStartDate
                                                    ? new Date(
                                                        formData.contractDetails.payStartDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "contractDetails",
                                                    "payStartDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('contract')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.payEndDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.contractDetails?.payEndDate
                                                    ? new Date(
                                                        formData.contractDetails.payEndDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "contractDetails",
                                                    "payEndDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('contract')}
                                        />
                                    </div>

                                    {/* Salary Increase Logic */}
                                    <div className="md:col-span-2 space-y-4 border-t pt-4 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasSalaryIncrease"
                                                disabled={!isEditing('contract')}
                                                checked={formData.contractDetails?.hasSalaryIncrease || false}
                                                onCheckedChange={(checked) => handleInputChange('contractDetails', 'hasSalaryIncrease', checked)}
                                            />
                                            <Label htmlFor="hasSalaryIncrease" className="cursor-pointer">{t('profile.fields.hasSalaryIncrease')}</Label>
                                        </div>

                                        {formData.contractDetails?.hasSalaryIncrease && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-border">
                                                <div className="space-y-2">
                                                    <Label>{t('profile.fields.salaryIncreaseDate')}</Label>
                                                    <DatePicker
                                                        value={
                                                            formData.contractDetails
                                                                ?.salaryIncreaseDate
                                                                ? new Date(
                                                                    formData.contractDetails.salaryIncreaseDate
                                                                )
                                                                : undefined
                                                        }
                                                        onChange={(date) =>
                                                            handleInputChange(
                                                                "contractDetails",
                                                                "salaryIncreaseDate",
                                                                date ? date.toISOString() : null
                                                            )
                                                        }
                                                        disabled={!isEditing('contract')}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('profile.fields.estimatedPromotedSalary')}</Label>
                                                    <Input type="number" readOnly={!isEditing('contract')} className="read-only:bg-muted read-only:text-muted-foreground read-only:cursor-default" value={formData.contractDetails?.estimatedPromotedSalary || ''} onChange={e => handleInputChange('contractDetails', 'estimatedPromotedSalary', Number(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 7. Criminal Record */}
                        <AccordionItem value="criminal" className="bg-card border border-border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                {renderSectionHeader(t('profile.sections.criminal'), <AlertCircle className="w-4 h-4 text-muted-foreground" />, "criminal")}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('profile.fields.issueDate')}</Label>
                                        <DatePicker
                                            value={
                                                formData.criminalRecord?.issueDate
                                                    ? new Date(
                                                        formData.criminalRecord.issueDate
                                                    )
                                                    : undefined
                                            }
                                            onChange={(date) =>
                                                handleInputChange(
                                                    "criminalRecord",
                                                    "issueDate",
                                                    date ? date.toISOString() : null
                                                )
                                            }
                                            disabled={!isEditing('criminal')}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </TabsContent>

                {/* TAB 2: DOCUMENTS */}
                <TabsContent value="documents" className="mt-6 space-y-8">
                    {/* Core Documents Grid */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('profile.documents.coreTitle')}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {coreDocs.map((doc) => {
                                const docStatus = teacher.documents[doc.key as keyof typeof teacher.documents];
                                const isUploaded = docStatus.status === "valid";

                                return (
                                    <Card key={doc.key} className={isUploaded ? "border-green-200 bg-green-50" : ""}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                                {doc.label}
                                                {isUploaded ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-muted-foreground/50" />
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <p className="text-xs text-muted-foreground">
                                                    {t('profile.documents.status')}: <span className="font-medium capitalize">{docStatus.status}</span>
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        id={`file-${doc.key}`}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleCoreUpload(doc.key, file);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`file-${doc.key}`}
                                                        className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                                    >
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        {isUploaded ? t('profile.documents.update') : t('profile.documents.upload')}
                                                    </Label>
                                                    {isUploaded && (
                                                        <>
                                                            <Button variant="outline" size="icon" asChild>
                                                                <a href={`http://localhost:5000/${docStatus.filePath}`} target="_blank" rel="noreferrer">
                                                                    <FileText className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(doc.key, 'core')}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Document Organization */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{t('profile.documents.otherTitle')}</h2>
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" /> {t('profile.documents.uploadDocument')}
                            </Button>
                        </div>

                        <DocumentManager
                            teacherId={teacher._id}
                            boxes={teacher.documentBoxes || []}
                            documents={teacher.otherDocuments}
                            onRefresh={() => loadTeacher(teacher._id)}
                            onEditDoc={(docId, name) => openEditDialog(docId, name)}
                            onDeleteDoc={(docId) => confirmDelete(docId, 'adhoc')}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Upload Document Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('profile.documents.uploadDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('profile.documents.uploadDialog.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdHocUpload} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="docName">{t('profile.documents.uploadDialog.nameLabel')}</Label>
                            <Input id="docName" name="name" placeholder={t('profile.documents.uploadDialog.namePlaceholder')} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="docFile">{t('profile.documents.uploadDialog.fileLabel')}</Label>
                            <Input id="docFile" name="file" type="file" required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>{t('profile.documents.uploadDialog.cancel')}</Button>
                            <Button type="submit">{t('profile.documents.uploadDialog.upload')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Rename Document Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('profile.documents.editDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('profile.documents.editDialog.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateAdHoc} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editDocName">{t('profile.documents.editDialog.nameLabel')}</Label>
                            <Input
                                id="editDocName"
                                name="name"
                                defaultValue={editingDoc?.name}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editDocFile">{t('profile.documents.editDialog.fileLabel')}</Label>
                            <Input id="editDocFile" name="file" type="file" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>{t('profile.documents.editDialog.cancel')}</Button>
                            <Button type="submit">{t('profile.documents.editDialog.save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('profile.documents.deleteDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('profile.documents.deleteDialog.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>{t('profile.documents.deleteDialog.cancel')}</Button>
                        <Button variant="destructive" onClick={executeDelete}>{t('profile.documents.deleteDialog.delete')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
