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
import { useTranslation } from "react-i18next";

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
const dateRangeFilter: FilterFn<Teacher> = (row, columnId, filterValue: DateRangeValue) => {
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
const numberRangeFilter: FilterFn<Teacher> = (row, columnId, filterValue: NumberRangeValue) => {
    if (filterValue?.min === undefined && filterValue?.max === undefined) return true;

    const cellValue = row.getValue(columnId) as number | undefined;
    if (cellValue === undefined || cellValue === null) return false;

    if (filterValue.min !== undefined && cellValue < filterValue.min) return false;
    if (filterValue.max !== undefined && cellValue > filterValue.max) return false;

    return true;
};

// Text contains filter
const textFilter: FilterFn<Teacher> = (row, columnId, filterValue: string) => {
    if (!filterValue) return true;
    const cellValue = row.getValue(columnId) as string | undefined;
    if (!cellValue) return false;
    return cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

export const useTeacherColumns = (): ColumnDef<Teacher>[] => {
    const { t } = useTranslation('teachers');

    return [
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
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
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.englishName')} />,
            cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue("englishName")}</div>,
            size: 180,
            filterFn: textFilter,
            enableHiding: false,
        },
        {
            id: "hiringStatus",
            accessorFn: (row) => row.personalInfo?.hiringStatus,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.hiringStatus')} />,
            cell: ({ row }) => {
                const status = row.getValue("hiringStatus") as string;
                if (!status) return null;
                const translatedStatus = t(`enums.status.${status.toLowerCase()}`, status);
                return (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 whitespace-nowrap">
                        {translatedStatus}
                    </Badge>
                );
            },
            size: 110,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "chineseName",
            accessorFn: (row) => row.personalInfo?.chineseName,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.chineseName')} />,
            size: 120,
            filterFn: textFilter,
        },
        {
            id: "email",
            accessorKey: "email",
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} />,
            size: 220,
            filterFn: textFilter,
        },
        {
            id: "phone",
            accessorFn: (row) => row.personalInfo?.phone,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
            size: 120,
            filterFn: textFilter,
        },
        {
            id: "dob",
            accessorFn: (row) => row.personalInfo?.dob,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dob')} />,
            cell: ({ row }) => formatDate(row.getValue("dob")),
            size: 110,
            filterFn: dateRangeFilter,
        },
        {
            id: "gender",
            accessorFn: (row) => row.personalInfo?.gender,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.gender')} />,
            cell: ({ row }) => {
                const gender = row.getValue("gender") as string;
                if (!gender) return null;
                return t(`enums.gender.${gender.toLowerCase()}`, gender);
            },
            size: 80,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "nationalityEn",
            accessorFn: (row) => row.personalInfo?.nationality?.english,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nationalityEn')} />,
            size: 130,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "nationalityCn",
            accessorFn: (row) => row.personalInfo?.nationality?.chinese,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nationalityCn')} />,
            size: 130,
            filterFn: textFilter,
        },
        {
            id: "addressTaiwan",
            accessorFn: (row) => row.personalInfo?.address?.taiwan,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.addressTaiwan')} />,
            size: 250,
            filterFn: textFilter,
        },
        {
            id: "addressHome",
            accessorFn: (row) => row.personalInfo?.address?.home,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.addressHome')} />,
            size: 250,
            filterFn: textFilter,
        },
        {
            id: "emergencyName",
            accessorFn: (row) => row.emergencyContact?.name,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.emergencyName')} />,
            size: 150,
            filterFn: textFilter,
        },
        {
            id: "emergencyRelationship",
            accessorFn: (row) => row.emergencyContact?.relationship,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.emergencyRelationship')} />,
            size: 160,
            filterFn: textFilter,
        },
        {
            id: "emergencyPhone",
            accessorFn: (row) => row.emergencyContact?.phone,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.emergencyPhone')} />,
            size: 130,
            filterFn: textFilter,
        },
        {
            id: "emergencyEmail",
            accessorFn: (row) => row.emergencyContact?.email,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.emergencyEmail')} />,
            size: 180,
            filterFn: textFilter,
        },

        // ============ GL2: Education ============
        {
            id: "degree",
            accessorFn: (row) => row.education?.degree,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.degree')} />,
            cell: ({ row }) => {
                const degree = row.getValue("degree") as string;
                if (!degree) return null;
                return t(`enums.degree.${degree.toLowerCase()}`, degree);
            },
            size: 100,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "major",
            accessorFn: (row) => row.education?.major,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.major')} />,
            size: 120,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "school",
            accessorFn: (row) => row.education?.school,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.school')} />,
            size: 150,
            filterFn: 'arrIncludesSome',
        },

        // ============ GL3: Legal Documents - Passport ============
        {
            id: "passportNumber",
            accessorFn: (row) => row.passportDetails?.number,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.passportNumber')} />,
            size: 130,
            filterFn: textFilter,
        },
        {
            id: "passportExpiry",
            accessorFn: (row) => row.passportDetails?.expiryDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.passportExpiry')} />,
            cell: ({ row }) => formatDate(row.getValue("passportExpiry")),
            size: 120,
            filterFn: dateRangeFilter,
        },
        {
            id: "passportIssueDate",
            accessorFn: (row) => row.passportDetails?.issueDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.passportIssueDate')} />,
            cell: ({ row }) => formatDate(row.getValue("passportIssueDate")),
            size: 140,
            filterFn: dateRangeFilter,
        },
        {
            id: "passportCountry",
            accessorFn: (row) => row.passportDetails?.issuingCountry,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.passportCountry')} />,
            size: 130,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "passportAuthority",
            accessorFn: (row) => row.passportDetails?.issuingAuthority,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.passportAuthority')} />,
            size: 140,
            filterFn: textFilter,
        },

        // ============ GL3: Legal Documents - ARC ============
        {
            id: "arcExpiry",
            accessorFn: (row) => row.arcDetails?.expiryDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.arcExpiry')} />,
            cell: ({ row }) => formatDate(row.getValue("arcExpiry")),
            size: 110,
            filterFn: dateRangeFilter,
        },
        {
            id: "arcPurpose",
            accessorFn: (row) => row.arcDetails?.purpose,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.arcPurpose')} />,
            cell: ({ row }) => {
                const purpose = row.getValue("arcPurpose") as string;
                if (!purpose) return null;
                return t(`enums.arcPurpose.${purpose.toLowerCase()}`, purpose);
            },
            size: 110,
            filterFn: 'arrIncludesSome',
        },

        // ============ GL3: Legal Documents - Work Permit ============
        {
            id: "workPermitNumber",
            accessorFn: (row) => row.workPermitDetails?.permitNumber,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.workPermitNumber')} />,
            size: 140,
            filterFn: textFilter,
        },
        {
            id: "workPermitExpiry",
            accessorFn: (row) => row.workPermitDetails?.expiryDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.workPermitExpiry')} />,
            cell: ({ row }) => formatDate(row.getValue("workPermitExpiry")),
            size: 140,
            filterFn: dateRangeFilter,
        },
        {
            id: "workPermitIssueDate",
            accessorFn: (row) => row.workPermitDetails?.issueDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.workPermitIssue')} />,
            cell: ({ row }) => formatDate(row.getValue("workPermitIssueDate")),
            size: 140,
            filterFn: dateRangeFilter,
        },
        {
            id: "workPermitStartDate",
            accessorFn: (row) => row.workPermitDetails?.startDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.workPermitStart')} />,
            cell: ({ row }) => formatDate(row.getValue("workPermitStartDate")),
            size: 140,
            filterFn: dateRangeFilter,
        },

        // ============ GL3: Legal Documents - Teaching License & Criminal Record ============
        {
            id: "teachingLicenseExpiry",
            accessorFn: (row) => row.teachingLicense?.expiryDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.teachingLicenseExpiry')} />,
            cell: ({ row }) => formatDate(row.getValue("teachingLicenseExpiry")),
            size: 160,
            filterFn: dateRangeFilter,
        },
        {
            id: "criminalRecordIssue",
            accessorFn: (row) => row.criminalRecord?.issueDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.criminalRecordIssue')} />,
            cell: ({ row }) => formatDate(row.getValue("criminalRecordIssue")),
            size: 150,
            filterFn: dateRangeFilter,
        },

        // ============ GL4: Employment ============
        {
            id: "serviceSchool",
            accessorFn: (row) => row.personalInfo?.serviceSchool,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.serviceSchool')} />,
            size: 180,
            filterFn: 'arrIncludesSome',
            enableHiding: false,
        },
        {
            id: "contractStart",
            accessorFn: (row) => row.contractDetails?.contractStartDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.contractStart')} />,
            cell: ({ row }) => formatDate(row.getValue("contractStart")),
            size: 110,
            filterFn: dateRangeFilter,
        },
        {
            id: "contractEnd",
            accessorFn: (row) => row.contractDetails?.contractEndDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.contractEnd')} />,
            cell: ({ row }) => formatDate(row.getValue("contractEnd")),
            size: 110,
            filterFn: dateRangeFilter,
        },
        {
            id: "payStart",
            accessorFn: (row) => row.contractDetails?.payStartDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.payStart')} />,
            cell: ({ row }) => formatDate(row.getValue("payStart")),
            size: 100,
            filterFn: dateRangeFilter,
        },
        {
            id: "payEnd",
            accessorFn: (row) => row.contractDetails?.payEndDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.payEnd')} />,
            cell: ({ row }) => formatDate(row.getValue("payEnd")),
            size: 100,
            filterFn: dateRangeFilter,
        },
        {
            id: "salary",
            accessorFn: (row) => row.contractDetails?.salary,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.salary')} />,
            cell: ({ row }) => {
                const salary = row.getValue("salary") as number;
                return salary ? `$${salary.toLocaleString()}` : null;
            },
            size: 100,
            filterFn: numberRangeFilter,
        },
        {
            id: "senioritySalary",
            accessorFn: (row) => row.contractDetails?.senioritySalary,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.senioritySalary')} />,
            size: 130,
            filterFn: numberRangeFilter,
        },
        {
            id: "seniorityLeave",
            accessorFn: (row) => row.contractDetails?.seniorityLeave,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.seniorityLeave')} />,
            size: 120,
            filterFn: numberRangeFilter,
        },
        {
            id: "hasSalaryIncrease",
            accessorFn: (row) => row.contractDetails?.hasSalaryIncrease,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.hasSalaryIncrease')} />,
            cell: ({ row }) => {
                const val = row.getValue("hasSalaryIncrease");
                if (val === true) return <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">{t('profile.values.yes')}</Badge>;
                if (val === false) return <Badge variant="outline" className="text-destructive border-destructive/50">{t('profile.values.no')}</Badge>;
                return null;
            },
            size: 140,
            filterFn: 'arrIncludesSome',
        },
        {
            id: "salaryIncreaseDate",
            accessorFn: (row) => row.contractDetails?.salaryIncreaseDate,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.salaryIncreaseDate')} />,
            cell: ({ row }) => formatDate(row.getValue("salaryIncreaseDate")),
            size: 140,
            filterFn: dateRangeFilter,
        },
        {
            id: "estimatedPromotedSalary",
            accessorFn: (row) => row.contractDetails?.estimatedPromotedSalary,
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.estimatedPromotedSalary')} />,
            cell: ({ row }) => {
                const salary = row.getValue("estimatedPromotedSalary") as number;
                return salary ? `$${salary.toLocaleString()}` : null;
            },
            size: 150,
            filterFn: numberRangeFilter,
        },

        // ============ Pipeline Stage ============
        {
            id: "pipelineStage",
            accessorKey: "pipelineStage",
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.currentStage')} />,
            cell: ({ row, table }) => {
                const stageId = row.getValue("pipelineStage") as string;
                // @ts-expect-error - accessing meta.stages which may not have type definition
                const stages = table.options.meta?.stages as { _id: string; title: string }[] || [];
                const stage = stages.find(s => s._id === stageId);
                const title = stage ? stage.title : stageId || 'Uncategorized';

                return (
                    <Badge variant="outline" className="border-border whitespace-nowrap">
                        {title}
                    </Badge>
                );
            },
            size: 140,
            filterFn: 'arrIncludesSome',
        }
    ];
};

// Column IDs that should be pinned to the left
export const PINNED_COLUMN_IDS = ['select', 'actions', 'avatar', 'englishName', 'serviceSchool'];
