import type { ColumnDef, GroupLabel } from './columnConfig.types';

// Static filter options
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const HIRING_STATUS_OPTIONS = ['Newly Hired', 'Re-Hired'];
const DEGREE_OPTIONS = ['Bachelor', 'Master', 'Doctorate', 'Associate', 'Other'];
const ARC_PURPOSE_OPTIONS = ['Work', 'Study', 'Dependent', 'Other'];
const YES_NO_OPTIONS = ['Yes', 'No'];

// ============ ALL COLUMNS ============
export const ALL_COLUMNS: ColumnDef[] = [
    // GL1: Personal Information
    { id: 'hiringStatus', labelKey: 'columns.hiringStatus', accessor: (t) => t.personalInfo?.hiringStatus,
      filterable: true, filterType: 'select', filterOptions: HIRING_STATUS_OPTIONS },
    { id: 'chineseName', labelKey: 'columns.chineseName', accessor: (t) => t.personalInfo?.chineseName,
      filterable: true, filterType: 'text' },
    { id: 'englishName', labelKey: 'columns.englishName',
      accessor: (t) => `${t.firstName} ${t.middleName ? t.middleName + ' ' : ''}${t.lastName}`,
      frozen: true, filterable: true, filterType: 'text' },
    { id: 'email', labelKey: 'columns.email', accessor: (t) => t.email, filterable: true, filterType: 'text' },
    { id: 'phone', labelKey: 'columns.phone', accessor: (t) => t.personalInfo?.phone,
      filterable: true, filterType: 'text' },
    { id: 'dob', labelKey: 'columns.dob',
      accessor: (t) => t.personalInfo?.dob ? new Date(t.personalInfo.dob).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'gender', labelKey: 'columns.gender', accessor: (t) => t.personalInfo?.gender,
      filterable: true, filterType: 'select', filterOptions: GENDER_OPTIONS },
    { id: 'nationalityEn', labelKey: 'columns.nationalityEn', accessor: (t) => t.personalInfo?.nationality?.english,
      filterable: true, filterType: 'multi-select' },
    { id: 'nationalityCn', labelKey: 'columns.nationalityCn', accessor: (t) => t.personalInfo?.nationality?.chinese },
    { id: 'addressTaiwan', labelKey: 'columns.addressTaiwan', accessor: (t) => t.personalInfo?.address?.taiwan,
      filterable: true, filterType: 'text' },
    { id: 'addressHome', labelKey: 'columns.addressHome', accessor: (t) => t.personalInfo?.address?.home,
      filterable: true, filterType: 'text' },
    { id: 'emergencyName', labelKey: 'columns.emergencyName', accessor: (t) => t.emergencyContact?.name,
      filterable: true, filterType: 'text' },
    { id: 'emergencyRelationship', labelKey: 'columns.emergencyRelationship',
      accessor: (t) => t.emergencyContact?.relationship },
    { id: 'emergencyPhone', labelKey: 'columns.emergencyPhone', accessor: (t) => t.emergencyContact?.phone,
      filterable: true, filterType: 'text' },
    { id: 'emergencyEmail', labelKey: 'columns.emergencyEmail', accessor: (t) => t.emergencyContact?.email,
      filterable: true, filterType: 'text' },

    // GL2: Education
    { id: 'degree', labelKey: 'columns.degree', accessor: (t) => t.education?.degree,
      filterable: true, filterType: 'select', filterOptions: DEGREE_OPTIONS },
    { id: 'major', labelKey: 'columns.major', accessor: (t) => t.education?.major,
      filterable: true, filterType: 'multi-select' },
    { id: 'school', labelKey: 'columns.school', accessor: (t) => t.education?.school,
      filterable: true, filterType: 'multi-select' },

    // GL3: Legal Documents - Passport
    { id: 'passportNumber', labelKey: 'columns.passportNumber', accessor: (t) => t.passportDetails?.number },
    { id: 'passportExpiry', labelKey: 'columns.passportExpiry',
      accessor: (t) => t.passportDetails?.expiryDate
          ? new Date(t.passportDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'passportIssueDate', labelKey: 'columns.passportIssueDate',
      accessor: (t) => t.passportDetails?.issueDate
          ? new Date(t.passportDetails.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'passportCountry', labelKey: 'columns.passportCountry', accessor: (t) => t.passportDetails?.issuingCountry,
      filterable: true, filterType: 'multi-select' },
    { id: 'passportAuthority', labelKey: 'columns.passportAuthority', accessor: (t) => t.passportDetails?.issuingAuthority },

    // GL3: Legal Documents - ARC
    { id: 'arcExpiry', labelKey: 'columns.arcExpiry',
      accessor: (t) => t.arcDetails?.expiryDate
          ? new Date(t.arcDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'arcPurpose', labelKey: 'columns.arcPurpose', accessor: (t) => t.arcDetails?.purpose,
      filterable: true, filterType: 'select', filterOptions: ARC_PURPOSE_OPTIONS },

    // GL3: Legal Documents - Work Permit
    { id: 'workPermitNumber', labelKey: 'columns.workPermitNumber', accessor: (t) => t.workPermitDetails?.permitNumber },
    { id: 'workPermitExpiry', labelKey: 'columns.workPermitExpiry',
      accessor: (t) => t.workPermitDetails?.expiryDate
          ? new Date(t.workPermitDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'workPermitIssueDate', labelKey: 'columns.workPermitIssue',
      accessor: (t) => t.workPermitDetails?.issueDate
          ? new Date(t.workPermitDetails.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'workPermitStartDate', labelKey: 'columns.workPermitStart',
      accessor: (t) => t.workPermitDetails?.startDate
          ? new Date(t.workPermitDetails.startDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },

    // GL3: Legal Documents - Teaching License & Criminal Record
    { id: 'teachingLicenseExpiry', labelKey: 'columns.teachingLicenseExpiry',
      accessor: (t) => t.teachingLicense?.expiryDate
          ? new Date(t.teachingLicense.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'criminalRecordIssue', labelKey: 'columns.criminalRecordIssue',
      accessor: (t) => t.criminalRecord?.issueDate
          ? new Date(t.criminalRecord.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },

    // GL4: Employment
    { id: 'serviceSchool', labelKey: 'columns.serviceSchool', accessor: (t) => t.personalInfo?.serviceSchool,
      frozen: true, filterable: true, filterType: 'multi-select' },
    { id: 'contractStart', labelKey: 'columns.contractStart',
      accessor: (t) => t.contractDetails?.contractStartDate
          ? new Date(t.contractDetails.contractStartDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'contractEnd', labelKey: 'columns.contractEnd',
      accessor: (t) => t.contractDetails?.contractEndDate
          ? new Date(t.contractDetails.contractEndDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'payStart', labelKey: 'columns.payStart',
      accessor: (t) => t.contractDetails?.payStartDate
          ? new Date(t.contractDetails.payStartDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'payEnd', labelKey: 'columns.payEnd',
      accessor: (t) => t.contractDetails?.payEndDate
          ? new Date(t.contractDetails.payEndDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'salary', labelKey: 'columns.salary', accessor: (t) => t.contractDetails?.salary,
      filterable: true, filterType: 'number-range' },
    { id: 'senioritySalary', labelKey: 'columns.senioritySalary', accessor: (t) => t.contractDetails?.senioritySalary,
      filterable: true, filterType: 'number-range' },
    { id: 'seniorityLeave', labelKey: 'columns.seniorityLeave', accessor: (t) => t.contractDetails?.seniorityLeave,
      filterable: true, filterType: 'number-range' },
    { id: 'hasSalaryIncrease', labelKey: 'columns.hasSalaryIncrease',
      accessor: (t) => t.contractDetails?.hasSalaryIncrease
          ? 'Yes' : (t.contractDetails?.hasSalaryIncrease === false ? 'No' : undefined),
      filterable: true, filterType: 'select', filterOptions: YES_NO_OPTIONS },
    { id: 'salaryIncreaseDate', labelKey: 'columns.salaryIncreaseDate',
      accessor: (t) => t.contractDetails?.salaryIncreaseDate
          ? new Date(t.contractDetails.salaryIncreaseDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'estimatedPromotedSalary', labelKey: 'columns.estimatedPromotedSalary',
      accessor: (t) => t.contractDetails?.estimatedPromotedSalary,
      filterable: true, filterType: 'number-range' },

    // Pipeline Stage
    { id: 'pipelineStage', labelKey: 'columns.currentStage', accessor: (t) => t.pipelineStage,
      filterable: true, filterType: 'multi-select' },
];

// ============ GROUP LABELS (User specified 4 groups) ============
export const GROUP_LABELS: GroupLabel[] = [
    {
        id: 'personalInfo',
        labelKey: 'groups.personalInfo',
        columnIds: [
            'hiringStatus', 'chineseName', 'englishName', 'email', 'phone', 'dob', 'gender',
            'nationalityEn', 'nationalityCn', 'addressTaiwan', 'addressHome',
            'emergencyName', 'emergencyRelationship', 'emergencyPhone', 'emergencyEmail'
        ],
    },
    {
        id: 'education',
        labelKey: 'groups.education',
        columnIds: ['degree', 'major', 'school'],
    },
    {
        id: 'legalDocs',
        labelKey: 'groups.legalDocs',
        columnIds: [
            'passportNumber', 'passportExpiry', 'passportIssueDate', 'passportCountry', 'passportAuthority',
            'arcExpiry', 'arcPurpose',
            'workPermitNumber', 'workPermitExpiry', 'workPermitIssueDate', 'workPermitStartDate',
            'teachingLicenseExpiry', 'criminalRecordIssue'
        ],
    },
    {
        id: 'employment',
        labelKey: 'groups.employment',
        columnIds: [
            'serviceSchool', 'contractStart', 'contractEnd', 'payStart', 'payEnd',
            'salary', 'senioritySalary', 'seniorityLeave',
            'hasSalaryIncrease', 'salaryIncreaseDate', 'estimatedPromotedSalary', 'pipelineStage'
        ],
    },
];
