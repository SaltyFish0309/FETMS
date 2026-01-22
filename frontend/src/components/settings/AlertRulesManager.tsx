
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define Types
interface AlertRule {
    _id: string;
    name: string;
    documentType: string;
    conditionType: 'DAYS_REMAINING' | 'DATE_THRESHOLD';
    value: string | number;
    isActive: boolean;
}

interface AlertRulesManagerProps {
    onUpdated?: () => void;
}

export function AlertRulesManager({ onUpdated }: AlertRulesManagerProps) {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(false);

    // New Rule Form State
    const [newName, setNewName] = useState("");
    const [newDocType, setNewDocType] = useState("arcDetails");
    const [newCondition, setNewCondition] = useState<'DAYS_REMAINING' | 'DATE_THRESHOLD'>("DAYS_REMAINING");
    const [newValue, setNewValue] = useState("");

    // Errors
    const [errors, setErrors] = useState<{ name?: boolean, value?: boolean }>({});

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/alerts");
            const data = await res.json();
            setRules(data);
        } catch {
            toast.error("Failed to fetch alert rules");
        }
    };

    const handleAddRule = async () => {
        // Validation
        const newErrors = {
            name: !newName.trim(),
            value: !newValue.trim()
        };

        if (newErrors.name || newErrors.value) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields", { position: 'top-center' }); // Optional backup
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: newName,
                documentType: newDocType,
                conditionType: newCondition,
                value: newCondition === 'DAYS_REMAINING' ? parseInt(newValue) : newValue,
                isActive: true
            };

            const res = await fetch("http://localhost:5000/api/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Rule added successfully");
                setNewName("");
                setNewValue("");
                setErrors({});
                fetchRules();
                if (onUpdated) onUpdated();
            } else {
                toast.error("Failed to add rule");
            }
        } catch {
            toast.error("Error creating rule");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/api/alerts/${id}`, { method: "DELETE" });
            toast.success("Rule deleted");
            setRules(rules.filter(r => r._id !== id));
            if (onUpdated) onUpdated();
        } catch {
            toast.error("Failed to delete rule");
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Rule Form */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Rule Name <span className="text-red-500">*</span></label>
                    <Input
                        placeholder="e.g. Early Warning"
                        value={newName}
                        onChange={e => { setNewName(e.target.value); if (errors.name) setErrors({ ...errors, name: false }); }}
                        className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.name && <p className="text-xs text-red-500">Name is required</p>}
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Document</label>
                    <Select value={newDocType} onValueChange={setNewDocType}>
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
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Condition</label>
                    <Select value={newCondition} onValueChange={(val: 'DAYS_REMAINING' | 'DATE_THRESHOLD') => setNewCondition(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAYS_REMAINING">Expires in (Days)</SelectItem>
                            <SelectItem value="DATE_THRESHOLD">Expires Before (Date)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Value <span className="text-red-500">*</span></label>
                    {newCondition === 'DAYS_REMAINING' ? (
                        <Input
                            type="number"
                            placeholder="90"
                            value={newValue}
                            onChange={e => { setNewValue(e.target.value); if (errors.value) setErrors({ ...errors, value: false }); }}
                            className={cn(errors.value && "border-red-500 focus-visible:ring-red-500")}
                        />
                    ) : (
                        <Input
                            type="date"
                            value={newValue}
                            onChange={e => { setNewValue(e.target.value); if (errors.value) setErrors({ ...errors, value: false }); }}
                            className={cn(errors.value && "border-red-500 focus-visible:ring-red-500")}
                        />
                    )}
                    {errors.value && <p className="text-xs text-red-500">Value is required</p>}
                </div>
                <div className="flex items-end pb-1">
                    <Button onClick={handleAddRule} disabled={loading}>
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                </div>
            </div>

            {/* Rules Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map((rule) => (
                            <TableRow key={rule._id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell>
                                    {rule.documentType === 'arcDetails' && "ARC"}
                                    {rule.documentType === 'workPermitDetails' && "Work Permit"}
                                    {rule.documentType === 'passportDetails' && "Passport"}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING' ? "Expires In" : "Expires Before"}
                                </TableCell>
                                <TableCell>
                                    {rule.conditionType === 'DAYS_REMAINING'
                                        ? `${rule.value} Days`
                                        : rule.value ? format(new Date(rule.value as string), 'yyyy/MM/dd') : 'N/A'
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteRule(rule._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rules.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                    No alert rules defined.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
