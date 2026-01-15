import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { Teacher } from "@/services/teacherService";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { Link } from "react-router-dom";
import type { DateRangeValue } from "./filters/DateRangeFilter";
import type { NumberRangeValue } from "./filters/NumberRangeFilter";

// Helper to format date strings
const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return dateStr;
    }
};

// ============ CUSTOM FILTER FUNCTIONS ============

// Custom filter for date ranges
const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue: DateRangeValue) => {
    if (!filterValue?.from && !filterValue?.to) return true;

    const cellValue = row.getValue(columnId) as string | undefined;
    if (!cellValue) return false;

    const cellDate = new Date(cellValue);
    if (isNaN(cellDate.getTime())) return false;

    if (filterValue.from) {
        const fromDate = new Date(filterValue.from);
        if (cellDate < fromDate) return false;
    }

    if (filterValue.to) {
        const toDate = new Date(filterValue.to);
        if (cellDate > toDate) return false;
    }

    return true;
};

// Custom filter for number ranges
const numberRangeFilter: FilterFn<any> = (row, columnId, filterValue: NumberRangeValue) => {
    if (filterValue?.min === undefined && filterValue?.max === undefined) return true;

    const cellValue = row.getValue(columnId) as number | undefined;
    if (cellValue === undefined || cellValue === null) return false;

    if (filterValue.min !== undefined && cellValue < filterValue.min) return false;
    if (filterValue.max !== undefined && cellValue > filterValue.max) return false;

    return true;
};

// Text contains filter
const textFilter: FilterFn<any> = (row, columnId, filterValue: string) => {
    if (!filterValue) return true;
    const cellValue = row.getValue(columnId) as string | undefined;
    if (!cellValue) return false;
    return cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

export const columns: ColumnDef<Teacher>[] = [
    // ============ UTILITY COLUMNS ============
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 30,
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <Link to={`/teachers/${row.original._id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        ),
        size: 40,
        enableHiding: false,
    },
    {
        id: "avatar",
        header: "",
        accessorFn: (row) => row.profilePicture,
        cell: ({ row }) => {
            const teacher = row.original;
            return (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={teacher.profilePicture ? `http://localhost:5000/${teacher.profilePicture}` : undefined} />
                    <AvatarFallback>{teacher.firstName?.[0]}{teacher.lastName?.[0]}</AvatarFallback>
                </Avatar>
            );
        },
        size: 50,
        enableHiding: false,
    },

    // ============ GL1: 個人基本資訊 (Personal Information) ============
    {
        id: "englishName",
        accessorFn: (row) => `${row.firstName} ${row.middleName ? row.middleName + ' ' : ''}${row.lastName}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title="English Name" />,
        cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue("englishName")}</div>,
        size: 180,
        filterFn: textFilter,
    },
    {
        id: "hiringStatus",
        accessorFn: (row) => row.personalInfo?.hiringStatus,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hiring Status" />,
        cell: ({ row }) => {
            const status = row.getValue("hiringStatus") as string;
            if (!status) return null;
            return (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 whitespace-nowrap">
                    {status}
                </Badge>
            );
        },
        filterFn: 'arrIncludesSome',
    },
    {
        id: "chineseName",
        accessorFn: (row) => row.personalInfo?.chineseName,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chinese Name" />,
        filterFn: textFilter,
    },
    {
        id: "email",
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        filterFn: textFilter,
    },
    {
        id: "phone",
        accessorFn: (row) => row.personalInfo?.phone,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        filterFn: textFilter,
    },
    {
        id: "dob",
        accessorFn: (row) => row.personalInfo?.dob,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Birth" />,
        cell: ({ row }) => formatDate(row.getValue("dob")),
        filterFn: dateRangeFilter,
    },
    {
        id: "gender",
        accessorFn: (row) => row.personalInfo?.gender,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "nationalityEn",
        accessorFn: (row) => row.personalInfo?.nationality?.english,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nationality (EN)" />,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "nationalityCn",
        accessorFn: (row) => row.personalInfo?.nationality?.chinese,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nationality (CN)" />,
        filterFn: textFilter,
    },
    {
        id: "addressTaiwan",
        accessorFn: (row) => row.personalInfo?.address?.taiwan,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Address (Taiwan)" />,
        size: 250,
        filterFn: textFilter,
    },
    {
        id: "addressHome",
        accessorFn: (row) => row.personalInfo?.address?.home,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Address (Home)" />,
        size: 250,
        filterFn: textFilter,
    },
    {
        id: "emergencyName",
        accessorFn: (row) => row.emergencyContact?.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Emergency Contact" />,
        filterFn: textFilter,
    },
    {
        id: "emergencyRelationship",
        accessorFn: (row) => row.emergencyContact?.relationship,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Emergency Relationship" />,
        filterFn: textFilter,
    },
    {
        id: "emergencyPhone",
        accessorFn: (row) => row.emergencyContact?.phone,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Emergency Phone" />,
        filterFn: textFilter,
    },
    {
        id: "emergencyEmail",
        accessorFn: (row) => row.emergencyContact?.email,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Emergency Email" />,
        filterFn: textFilter,
    },

    // ============ GL2: Education ============
    {
        id: "degree",
        accessorFn: (row) => row.education?.degree,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Degree" />,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "major",
        accessorFn: (row) => row.education?.major,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Major" />,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "school",
        accessorFn: (row) => row.education?.school,
        header: ({ column }) => <DataTableColumnHeader column={column} title="School" />,
        filterFn: 'arrIncludesSome',
    },

    // ============ GL3: Legal Documents - Passport ============
    {
        id: "passportNumber",
        accessorFn: (row) => row.passportDetails?.number,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport No." />,
        filterFn: textFilter,
    },
    {
        id: "passportExpiry",
        accessorFn: (row) => row.passportDetails?.expiryDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport Expiry" />,
        cell: ({ row }) => formatDate(row.getValue("passportExpiry")),
        filterFn: dateRangeFilter,
    },
    {
        id: "passportIssueDate",
        accessorFn: (row) => row.passportDetails?.issueDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport Issue Date" />,
        cell: ({ row }) => formatDate(row.getValue("passportIssueDate")),
        filterFn: dateRangeFilter,
    },
    {
        id: "passportCountry",
        accessorFn: (row) => row.passportDetails?.issuingCountry,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport Country" />,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "passportAuthority",
        accessorFn: (row) => row.passportDetails?.issuingAuthority,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport Authority" />,
        filterFn: textFilter,
    },

    // ============ GL3: Legal Documents - ARC ============
    {
        id: "arcExpiry",
        accessorFn: (row) => row.arcDetails?.expiryDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="ARC Expiry" />,
        cell: ({ row }) => formatDate(row.getValue("arcExpiry")),
        filterFn: dateRangeFilter,
    },
    {
        id: "arcPurpose",
        accessorFn: (row) => row.arcDetails?.purpose,
        header: ({ column }) => <DataTableColumnHeader column={column} title="ARC Purpose" />,
        filterFn: 'arrIncludesSome',
    },

    // ============ GL3: Legal Documents - Work Permit ============
    {
        id: "workPermitNumber",
        accessorFn: (row) => row.workPermitDetails?.permitNumber,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Work Permit No." />,
        filterFn: textFilter,
    },
    {
        id: "workPermitExpiry",
        accessorFn: (row) => row.workPermitDetails?.expiryDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Work Permit Expiry" />,
        cell: ({ row }) => formatDate(row.getValue("workPermitExpiry")),
        filterFn: dateRangeFilter,
    },
    {
        id: "workPermitIssueDate",
        accessorFn: (row) => row.workPermitDetails?.issueDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Work Permit Issue" />,
        cell: ({ row }) => formatDate(row.getValue("workPermitIssueDate")),
        filterFn: dateRangeFilter,
    },
    {
        id: "workPermitStartDate",
        accessorFn: (row) => row.workPermitDetails?.startDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Work Permit Start" />,
        cell: ({ row }) => formatDate(row.getValue("workPermitStartDate")),
        filterFn: dateRangeFilter,
    },

    // ============ GL3: Legal Documents - Teaching License & Criminal Record ============
    {
        id: "teachingLicenseExpiry",
        accessorFn: (row) => row.teachingLicense?.expiryDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teaching License Expiry" />,
        cell: ({ row }) => formatDate(row.getValue("teachingLicenseExpiry")),
        filterFn: dateRangeFilter,
    },
    {
        id: "criminalRecordIssue",
        accessorFn: (row) => row.criminalRecord?.issueDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Criminal Record Issue" />,
        cell: ({ row }) => formatDate(row.getValue("criminalRecordIssue")),
        filterFn: dateRangeFilter,
    },

    // ============ GL4: Employment ============
    {
        id: "serviceSchool",
        accessorFn: (row) => row.personalInfo?.serviceSchool,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service School" />,
        size: 200,
        filterFn: 'arrIncludesSome',
    },
    {
        id: "contractStart",
        accessorFn: (row) => row.contractDetails?.contractStartDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contract Start" />,
        cell: ({ row }) => formatDate(row.getValue("contractStart")),
        filterFn: dateRangeFilter,
    },
    {
        id: "contractEnd",
        accessorFn: (row) => row.contractDetails?.contractEndDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contract End" />,
        cell: ({ row }) => formatDate(row.getValue("contractEnd")),
        filterFn: dateRangeFilter,
    },
    {
        id: "payStart",
        accessorFn: (row) => row.contractDetails?.payStartDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pay Start" />,
        cell: ({ row }) => formatDate(row.getValue("payStart")),
        filterFn: dateRangeFilter,
    },
    {
        id: "payEnd",
        accessorFn: (row) => row.contractDetails?.payEndDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pay End" />,
        cell: ({ row }) => formatDate(row.getValue("payEnd")),
        filterFn: dateRangeFilter,
    },
    {
        id: "salary",
        accessorFn: (row) => row.contractDetails?.salary,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" />,
        cell: ({ row }) => {
            const salary = row.getValue("salary") as number;
            return salary ? `$${salary.toLocaleString()}` : null;
        },
        filterFn: numberRangeFilter,
    },
    {
        id: "senioritySalary",
        accessorFn: (row) => row.contractDetails?.senioritySalary,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Seniority (Salary)" />,
        filterFn: numberRangeFilter,
    },
    {
        id: "seniorityLeave",
        accessorFn: (row) => row.contractDetails?.seniorityLeave,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Seniority (Leave)" />,
        filterFn: numberRangeFilter,
    },
    {
        id: "hasSalaryIncrease",
        accessorFn: (row) => row.contractDetails?.hasSalaryIncrease,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Has Salary Increase" />,
        cell: ({ row }) => {
            const val = row.getValue("hasSalaryIncrease");
            if (val === true) return <Badge variant="outline" className="bg-green-50">Yes</Badge>;
            if (val === false) return <Badge variant="outline" className="bg-red-50">No</Badge>;
            return null;
        },
        filterFn: 'arrIncludesSome',
    },
    {
        id: "salaryIncreaseDate",
        accessorFn: (row) => row.contractDetails?.salaryIncreaseDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Salary Increase Date" />,
        cell: ({ row }) => formatDate(row.getValue("salaryIncreaseDate")),
        filterFn: dateRangeFilter,
    },
    {
        id: "estimatedPromotedSalary",
        accessorFn: (row) => row.contractDetails?.estimatedPromotedSalary,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Promoted Salary" />,
        cell: ({ row }) => {
            const salary = row.getValue("estimatedPromotedSalary") as number;
            return salary ? `$${salary.toLocaleString()}` : null;
        },
        filterFn: numberRangeFilter,
    },

    // ============ Pipeline Stage ============
    {
        id: "pipelineStage",
        accessorKey: "pipelineStage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current Stage" />,
        cell: ({ row, table }) => {
            const stageId = row.getValue("pipelineStage") as string;
            // @ts-ignore
            const stages = table.options.meta?.stages as { _id: string; title: string }[] || [];
            const stage = stages.find(s => s._id === stageId);
            const title = stage ? stage.title : stageId || 'Uncategorized';

            return (
                <Badge variant="outline" className="border-slate-200 whitespace-nowrap">
                    {title}
                </Badge>
            );
        },
        filterFn: 'arrIncludesSome',
    }
];

// Column IDs that should be pinned to the left
export const PINNED_COLUMN_IDS = ['select', 'actions', 'avatar', 'englishName', 'serviceSchool'];
