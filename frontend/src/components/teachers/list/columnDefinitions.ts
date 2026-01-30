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
    { id: 'hiringStatus', label: 'Hiring Status', accessor: (t) => t.personalInfo?.hiringStatus,
      filterable: true, filterType: 'select', filterOptions: HIRING_STATUS_OPTIONS },
    { id: 'chineseName', label: 'Chinese Name', accessor: (t) => t.personalInfo?.chineseName,
      filterable: true, filterType: 'text' },
    { id: 'englishName', label: 'English Name',
      accessor: (t) => `${t.firstName} ${t.middleName ? t.middleName + ' ' : ''}${t.lastName}`,
      frozen: true, filterable: true, filterType: 'text' },
    { id: 'email', label: 'Email', accessor: (t) => t.email, filterable: true, filterType: 'text' },
    { id: 'phone', label: 'Phone', accessor: (t) => t.personalInfo?.phone,
      filterable: true, filterType: 'text' },
    { id: 'dob', label: 'Date of Birth',
      accessor: (t) => t.personalInfo?.dob ? new Date(t.personalInfo.dob).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'gender', label: 'Gender', accessor: (t) => t.personalInfo?.gender,
      filterable: true, filterType: 'select', filterOptions: GENDER_OPTIONS },
    { id: 'nationalityEn', label: 'Nationality (EN)', accessor: (t) => t.personalInfo?.nationality?.english,
      filterable: true, filterType: 'multi-select' },
    { id: 'nationalityCn', label: 'Nationality (CN)', accessor: (t) => t.personalInfo?.nationality?.chinese },
    { id: 'addressTaiwan', label: 'Address (Taiwan)', accessor: (t) => t.personalInfo?.address?.taiwan,
      filterable: true, filterType: 'text' },
    { id: 'addressHome', label: 'Address (Home)', accessor: (t) => t.personalInfo?.address?.home,
      filterable: true, filterType: 'text' },
    { id: 'emergencyName', label: 'Emergency Contact', accessor: (t) => t.emergencyContact?.name,
      filterable: true, filterType: 'text' },
    { id: 'emergencyRelationship', label: 'Emergency Relationship',
      accessor: (t) => t.emergencyContact?.relationship },
    { id: 'emergencyPhone', label: 'Emergency Phone', accessor: (t) => t.emergencyContact?.phone,
      filterable: true, filterType: 'text' },
    { id: 'emergencyEmail', label: 'Emergency Email', accessor: (t) => t.emergencyContact?.email,
      filterable: true, filterType: 'text' },

    // GL2: Education
    { id: 'degree', label: 'Degree', accessor: (t) => t.education?.degree,
      filterable: true, filterType: 'select', filterOptions: DEGREE_OPTIONS },
    { id: 'major', label: 'Major', accessor: (t) => t.education?.major,
      filterable: true, filterType: 'multi-select' },
    { id: 'school', label: 'School', accessor: (t) => t.education?.school,
      filterable: true, filterType: 'multi-select' },

    // GL3: Legal Documents - Passport
    { id: 'passportNumber', label: 'Passport No.', accessor: (t) => t.passportDetails?.number },
    { id: 'passportExpiry', label: 'Passport Expiry',
      accessor: (t) => t.passportDetails?.expiryDate
          ? new Date(t.passportDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'passportIssueDate', label: 'Passport Issue Date',
      accessor: (t) => t.passportDetails?.issueDate
          ? new Date(t.passportDetails.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'passportCountry', label: 'Passport Country', accessor: (t) => t.passportDetails?.issuingCountry,
      filterable: true, filterType: 'multi-select' },
    { id: 'passportAuthority', label: 'Passport Authority', accessor: (t) => t.passportDetails?.issuingAuthority },

    // GL3: Legal Documents - ARC
    { id: 'arcExpiry', label: 'ARC Expiry',
      accessor: (t) => t.arcDetails?.expiryDate
          ? new Date(t.arcDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'arcPurpose', label: 'ARC Purpose', accessor: (t) => t.arcDetails?.purpose,
      filterable: true, filterType: 'select', filterOptions: ARC_PURPOSE_OPTIONS },

    // GL3: Legal Documents - Work Permit
    { id: 'workPermitNumber', label: 'Work Permit No.', accessor: (t) => t.workPermitDetails?.permitNumber },
    { id: 'workPermitExpiry', label: 'Work Permit Expiry',
      accessor: (t) => t.workPermitDetails?.expiryDate
          ? new Date(t.workPermitDetails.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'workPermitIssueDate', label: 'Work Permit Issue',
      accessor: (t) => t.workPermitDetails?.issueDate
          ? new Date(t.workPermitDetails.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'workPermitStartDate', label: 'Work Permit Start',
      accessor: (t) => t.workPermitDetails?.startDate
          ? new Date(t.workPermitDetails.startDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },

    // GL3: Legal Documents - Teaching License & Criminal Record
    { id: 'teachingLicenseExpiry', label: 'Teaching License Expiry',
      accessor: (t) => t.teachingLicense?.expiryDate
          ? new Date(t.teachingLicense.expiryDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'criminalRecordIssue', label: 'Criminal Record Issue',
      accessor: (t) => t.criminalRecord?.issueDate
          ? new Date(t.criminalRecord.issueDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },

    // GL4: Employment
    { id: 'serviceSchool', label: 'Service School', accessor: (t) => t.personalInfo?.serviceSchool,
      frozen: true, filterable: true, filterType: 'multi-select' },
    { id: 'contractStart', label: 'Contract Start',
      accessor: (t) => t.contractDetails?.contractStartDate
          ? new Date(t.contractDetails.contractStartDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'contractEnd', label: 'Contract End',
      accessor: (t) => t.contractDetails?.contractEndDate
          ? new Date(t.contractDetails.contractEndDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'payStart', label: 'Pay Start',
      accessor: (t) => t.contractDetails?.payStartDate
          ? new Date(t.contractDetails.payStartDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'payEnd', label: 'Pay End',
      accessor: (t) => t.contractDetails?.payEndDate
          ? new Date(t.contractDetails.payEndDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'salary', label: 'Salary', accessor: (t) => t.contractDetails?.salary,
      filterable: true, filterType: 'number-range' },
    { id: 'senioritySalary', label: 'Seniority (Salary)', accessor: (t) => t.contractDetails?.senioritySalary,
      filterable: true, filterType: 'number-range' },
    { id: 'seniorityLeave', label: 'Seniority (Leave)', accessor: (t) => t.contractDetails?.seniorityLeave,
      filterable: true, filterType: 'number-range' },
    { id: 'hasSalaryIncrease', label: 'Has Salary Increase',
      accessor: (t) => t.contractDetails?.hasSalaryIncrease
          ? 'Yes' : (t.contractDetails?.hasSalaryIncrease === false ? 'No' : undefined),
      filterable: true, filterType: 'select', filterOptions: YES_NO_OPTIONS },
    { id: 'salaryIncreaseDate', label: 'Salary Increase Date',
      accessor: (t) => t.contractDetails?.salaryIncreaseDate
          ? new Date(t.contractDetails.salaryIncreaseDate).toLocaleDateString() : undefined,
      filterable: true, filterType: 'date-range' },
    { id: 'estimatedPromotedSalary', label: 'Est. Promoted Salary',
      accessor: (t) => t.contractDetails?.estimatedPromotedSalary,
      filterable: true, filterType: 'number-range' },

    // Pipeline Stage
    { id: 'pipelineStage', label: 'Current Stage', accessor: (t) => t.pipelineStage,
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
