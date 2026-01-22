# Strict Database Architecture (Proposed)

This architecture replaces "String Matching" with strict **ObjectId References (Foreign Keys)** to ensure data integrity.

## Legend
- **PK**: Primary Key (Unique ID)
- **FK**: Foreign Key (Reference to another collection)

## 1. TEACHER (`teachers`)
Stores applicant and teacher profiles.

| Field | Name | Type | Key | Reference | Description |
|---|---|---|---|---|---|
| Teacher ID | `_id` | ObjectId | **PK** | | Auto-generated unique ID |
| School ID | `school` | ObjectId | **FK** | `schools._id` | Links to the School they work at. Replaces `personalInfo.serviceSchool`. |
| Stage ID | `pipelineStage` | ObjectId | **FK** | `stages._id` | Current status in Kanban. 'Uncategorized' should be a system Stage. |
| Email | `email` | String | | | Unique index. |
| Documents | `documents` | Object | | | Embedded Core Docs (Passport, etc.) |
| Deleted | `isDeleted` | Boolean | | | Soft Delete flag |

## 2. SCHOOL (`schools`)
Stores partner school information.

| Field | Name | Type | Key | Reference | Description |
|---|---|---|---|---|---|
| School ID | `_id` | ObjectId | **PK** | | Auto-generated unique ID |
| Chinese Name | `name.chinese` | String | | | Used for display/search |
| English Name | `name.english` | String | | | Used for display/search |
| Deleted | `isDeleted` | Boolean | | | Soft Delete flag |

## 3. STAGE (`stages`)
Kanban board columns.

| Field | Name | Type | Key | Reference | Description |
|---|---|---|---|---|---|
| Stage ID | `_id` | ObjectId | **PK** | | Auto-generated unique ID |
| Title | `title` | String | | | e.g., "Applied", "Interviewing" |
| Order | `order` | Number | | | Sorting order |

## 4. DOCUMENT_BOX (Embedded in Teacher)
Virtual folders for organizing other documents.

| Field | Name | Type | Key | Reference | Description |
|---|---|---|---|---|---|
| Box ID | `_id` | ObjectId | **PK** | | Inside `teacher.documentBoxes` |
| Name | `name` | String | | | |

## 5. AD_HOC_DOC (Embedded in Teacher)
User-uploaded extra files.

| Field | Name | Type | Key | Reference | Description |
|---|---|---|---|---|---|
| Doc ID | `_id` | ObjectId | **PK** | | |
| Box ID | `boxId` | ObjectId | **FK** | `teacher.documentBoxes._id` | Links file to a specific box (Intra-document FK) |

---

## Refactoring Plan
1.  **Schema Update**: Change `Teacher.personalInfo.serviceSchool` (String) to `Teacher.school` (ObjectId).
2.  **Data Migration**:
    - Create "Uncategorized" Stage in DB.
    - Script: Find School ID by String Name -> Update Teacher with `school: school_id`.
3.  **Code Update**: Update `SchoolService` and `TeacherService` to use `.populate('school')` instead of string matching.
