import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { schoolService, type School } from "@/services/schoolService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Save, School as SchoolIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function SchoolProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(['schools', 'common']);
    const { t: tTeachers } = useTranslation('teachers');
    const [school, setSchool] = useState<School | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<School>>({});

    const loadSchool = useCallback(async (schoolId: string) => {
        try {
            const data = await schoolService.getById(schoolId);
            setSchool(data);
            setFormData(data);
        } catch (error) {
            console.error("Failed to load school", error);
            toast.error(t('schools:toast.loadError'));
        }
    }, [t]);

    // Data loading when route parameter changes - standard React pattern
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (id) {
            loadSchool(id);
        }
    }, [id, loadSchool]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleInputChange = (section: keyof School, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...(prev[section] as Record<string, unknown>),
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!id || !formData) return;
        try {
            await schoolService.update(id, formData);
            setSchool(formData as School);
            setIsEditing(false);
            toast.success(t('schools:toast.updateSuccess'));
        } catch (error) {
            console.error("Failed to update school", error);
            toast.error(t('schools:toast.updateError'));
        }
    };

    if (!school) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/schools")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <SchoolIcon className="h-8 w-8 text-blue-600" />
                            {school.name.chinese}
                        </h1>
                        <p className="text-muted-foreground">{school.name.english || t('schools:profile.noEnglishName')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>{t('common:actions.cancel')}</Button>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="mr-2 h-4 w-4" /> {t('schools:buttons.saveChanges')}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>{t('schools:buttons.editProfile')}</Button>
                    )}
                </div>
            </div>

            {/* School Information */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('schools:profile.sections.basicInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.chineseName')}</Label>
                                <Input
                                    value={formData.name?.chinese || ""}
                                    onChange={(e) => handleInputChange("name", "chinese", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.englishName')}</Label>
                                <Input
                                    value={formData.name?.english || ""}
                                    onChange={(e) => handleInputChange("name", "english", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.chineseAddress')}</Label>
                                <Input
                                    value={formData.address?.chinese || ""}
                                    onChange={(e) => handleInputChange("address", "chinese", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.englishAddress')}</Label>
                                <Input
                                    value={formData.address?.english || ""}
                                    onChange={(e) => handleInputChange("address", "english", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('schools:profile.sections.keyPersonnel')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.principalChinese')}</Label>
                                <Input
                                    value={formData.principal?.chineseName || ""}
                                    onChange={(e) => handleInputChange("principal", "chineseName", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('schools:profile.fields.principalEnglish')}</Label>
                                <Input
                                    value={formData.principal?.englishName || ""}
                                    onChange={(e) => handleInputChange("principal", "englishName", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-foreground">{t('schools:profile.fields.contactWindow')}</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('schools:profile.fields.contactName')}</Label>
                                    <Input
                                        value={formData.contact?.name || ""}
                                        onChange={(e) => handleInputChange("contact", "name", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('schools:profile.fields.contactPosition')}</Label>
                                    <Input
                                        value={formData.contact?.position || ""}
                                        onChange={(e) => handleInputChange("contact", "position", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('schools:profile.fields.contactEmail')}</Label>
                                    <Input
                                        value={formData.contact?.email || ""}
                                        onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('schools:profile.fields.contactPhone')}</Label>
                                    <Input
                                        value={formData.contact?.phone || ""}
                                        onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Employed Teachers */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('schools:profile.sections.employedTeachers')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('schools:profile.teacherTable.name')}</TableHead>
                                <TableHead>{t('schools:profile.teacherTable.email')}</TableHead>
                                <TableHead>{t('schools:profile.teacherTable.nationality')}</TableHead>
                                <TableHead>{t('schools:profile.teacherTable.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {school.employedTeachers && school.employedTeachers.length > 0 ? (
                                school.employedTeachers.map((teacher) => (
                                    <TableRow
                                        key={teacher._id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/teachers/${teacher._id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {teacher.firstName} {teacher.lastName}
                                        </TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{teacher.personalInfo?.nationality?.english || '-'}</TableCell>
                                        <TableCell>
                                            {teacher.personalInfo?.hiringStatus
                                                ? tTeachers(`enums.status.${teacher.personalInfo.hiringStatus.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')}` as never)
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        {t('schools:table.noTeachers')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
