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

export default function SchoolProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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
            toast.error("Failed to load school details");
        }
    }, []);

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
            toast.success("School updated successfully");
        } catch (error) {
            console.error("Failed to update school", error);
            toast.error("Failed to update school");
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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <SchoolIcon className="h-8 w-8 text-blue-600" />
                            {school.name.chinese}
                        </h1>
                        <p className="text-slate-500">{school.name.english || "No English Name"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </div>

            {/* School Information */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chinese Name</Label>
                                <Input
                                    value={formData.name?.chinese || ""}
                                    onChange={(e) => handleInputChange("name", "chinese", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>English Name</Label>
                                <Input
                                    value={formData.name?.english || ""}
                                    onChange={(e) => handleInputChange("name", "english", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chinese Address</Label>
                                <Input
                                    value={formData.address?.chinese || ""}
                                    onChange={(e) => handleInputChange("address", "chinese", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>English Address</Label>
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
                        <CardTitle>Key Personnel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Principal (Chinese)</Label>
                                <Input
                                    value={formData.principal?.chineseName || ""}
                                    onChange={(e) => handleInputChange("principal", "chineseName", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Principal (English)</Label>
                                <Input
                                    value={formData.principal?.englishName || ""}
                                    onChange={(e) => handleInputChange("principal", "englishName", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-900">Contact Window</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={formData.contact?.name || ""}
                                        onChange={(e) => handleInputChange("contact", "name", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input
                                        value={formData.contact?.position || ""}
                                        onChange={(e) => handleInputChange("contact", "position", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.contact?.email || ""}
                                        onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
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
                    <CardTitle>Employed Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nationality</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {school.employedTeachers && school.employedTeachers.length > 0 ? (
                                school.employedTeachers.map((teacher) => (
                                    <TableRow
                                        key={teacher._id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => navigate(`/teachers/${teacher._id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {teacher.firstName} {teacher.lastName}
                                        </TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{teacher.personalInfo?.nationality?.english || '-'}</TableCell>
                                        <TableCell>{teacher.personalInfo?.hiringStatus || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No teachers currently employed at this school.
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
