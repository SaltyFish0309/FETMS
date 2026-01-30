# Codebase Concerns

**Analysis Date:** 2026-01-27

## Tech Debt

**Async File Deletion Without Error Handling:**
- Issue: `deleteFile()` function uses non-blocking `fs.unlink()` with only error logging, no retry or recovery mechanism
- Files: `backend/src/services/teacherService.ts:9-14`
- Impact: File deletion failures are silently logged; storage grows with orphaned files; no way to know if cleanup succeeded
- Fix approach: Convert to `fs.promises.unlink()` with proper error handling and logging. Consider implementing a file cleanup job for orphaned uploads.

**Hardcoded Localhost URLs Throughout Frontend:**
- Issue: Direct hardcoded `http://localhost:5000` in 14+ frontend files instead of using centralized API configuration
- Files:
  - `frontend/src/services/api.ts:4`
  - `frontend/src/components/dashboard/CandidateList.tsx:67`
  - `frontend/src/components/dashboard/ExpiryWidget.tsx:50`
  - `frontend/src/components/documents/DocumentCard.tsx:21`
  - `frontend/src/components/documents/useDocumentManager.ts:203`
  - `frontend/src/components/schools/ImportSchoolsDialog.tsx:126`
  - `frontend/src/components/settings/AlertRulesManager.tsx:45,76,101`
  - `frontend/src/components/teachers/import/useImportTeacher.ts:109`
  - `frontend/src/components/teachers/list/columns.tsx:114`
  - `frontend/src/components/teachers/TeacherKanbanBoard.tsx:69,111,168`
  - `frontend/src/pages/TeacherProfile.tsx:349,1184`
  - `frontend/src/services/schoolService.ts:3`
- Impact: Breaking changes require updating 14+ locations; environment-specific deployment becomes error-prone; no support for different backend URLs per environment
- Fix approach: Create centralized API base URL config in environment variables. Export helper function `getApiUrl(path)` from `api.ts` and use throughout.

**Unused Export Script with Hardcoded Path:**
- Issue: `backend/src/export_seniority.ts` contains hardcoded output path `e:\Coding_things\tfetp-management-v3\SENIORITY_DATA.md` (different version directory)
- Files: `backend/src/export_seniority.ts:46`
- Impact: Script is unmaintainable and references wrong file system path; unclear purpose and usage; no error recovery
- Fix approach: Remove or convert to proper CLI tool with environment-aware paths. If needed, move to dedicated scripts directory with configuration.

**Type Safety Violations (any casts):**
- Issue: Multiple `eslint-disable @typescript-eslint/no-explicit-any` comments and `as any` casts bypass type checking
- Files:
  - `frontend/src/components/teachers/list/DataTableToolbar.tsx:36-37` (table.options.meta cast)
  - `frontend/src/components/teachers/list/filters/__tests__/FilterSheet.test.tsx:31,49,67` (test mocks)
  - `frontend/src/components/teachers/list/__tests__/DataTable.test.tsx:32-33`
  - `backend/src/services/teacherService.ts:27` (cast to any)
  - Multiple test files
- Impact: Loses compile-time type safety; runtime errors from mismatched types; harder to refactor
- Fix approach: Replace `any` with proper type definitions. For table metadata, create proper types. For tests, use `as const` or proper mock builders.

**Inconsistent Error Handling Pattern:**
- Issue: Services return `null` for not found, but controllers/routes don't consistently handle all null cases
- Files:
  - `backend/src/services/teacherService.ts` (returns null in 20+ methods)
  - `backend/src/controllers/teacherController.ts` (only checks some nulls)
- Impact: Silent failures possible in edge cases; no distinction between "not found" and "error occurred"; harder to debug
- Fix approach: Adopt Either<Error, T> pattern or custom error types. Throw specific errors in services; handle in controllers.

## Known Bugs

**File Deletion Race Condition on Document Update:**
- Symptoms: User updates a document and the old file may not be deleted if system crashes between DB update and file deletion
- Files: `backend/src/services/teacherService.ts:106-127` (uploadCoreDocument method)
- Trigger: Update core document with large file while system under heavy load
- Workaround: Files accumulate but data remains consistent; orphaned files can be manually cleaned up
- Root cause: File deletion is async and happens after DB write; no transaction support

**Avatar Upload Path Inconsistency:**
- Symptoms: Different avatar URL patterns used in different components (some use `/uploads/{id}/profile.jpg`, others use stored `profilePicture` path)
- Files:
  - `frontend/src/components/teachers/TeacherKanbanBoard.tsx:69,111,168` (hardcoded path pattern)
  - `frontend/src/components/teachers/list/columns.tsx:114` (uses stored path)
- Trigger: Avatar endpoints may have changed but hardcoded paths not updated
- Workaround: Use actual profilePicture field instead of assumed path

**CSV Import Field Mapping Fragile:**
- Symptoms: School/Teacher import fails silently if CSV headers don't match expected format exactly
- Files: `backend/src/services/schoolService.ts:56-92` (unflatten logic), `backend/src/services/teacherService.ts` (import via CSV)
- Trigger: When CSV uses different header names or structure than expected
- Workaround: Manual data entry or CSV pre-processing
- Root cause: No validation of CSV structure before processing

## Security Considerations

**No Input Validation on Create/Update Endpoints:**
- Risk: Malformed data accepted into database; no checks for required fields, data types, or business rules
- Files:
  - `backend/src/controllers/teacherController.ts:6-13` (createTeacher)
  - `backend/src/controllers/schoolController.ts` (createSchool)
  - `backend/src/services/teacherService.ts:19-31` (createTeacher)
- Current mitigation: Mongoose schema provides some validation, but not all edge cases covered
- Recommendations: Add Zod/Joi validation middleware. Validate before service layer. Document required fields explicitly.

**CORS Unrestricted:**
- Risk: Any domain can make requests to backend API
- Files: `backend/src/index.ts:20` (cors() with no options)
- Current mitigation: None
- Recommendations: Add origin whitelist. Set `credentials: true` if needed. Add CSRF protection.

**File Upload Vulnerability - Insufficient Checks:**
- Risk: Only mime type and size checked; malicious files could be crafted to bypass filter
- Files: `backend/src/middleware/upload.ts:22-29` (fileFilter function)
- Current mitigation: Accepts only `image/*` and `application/pdf`
- Recommendations: Add file magic number verification. Scan uploads for malware. Implement virus scanning integration. Consider storing files outside web root.

**Sensitive Data in Error Responses:**
- Risk: Global error handler returns full error stack in development mode
- Files: `backend/src/index.ts:33-36`
- Current mitigation: Error details logged to console but also sent to client
- Recommendations: Conditional error details based on NODE_ENV. Never expose stack traces in production.

**Database Query Injection via Search:**
- Risk: Search parameters using `$regex` without escaping
- Files: `backend/src/services/schoolService.ts:12-15` (regex search)
- Current mitigation: Uses `$options: 'i'` flag but no explicit escaping
- Recommendations: Use query builder or sanitize regex special characters.

## Performance Bottlenecks

**Dashboard Stats Query Without Pagination:**
- Problem: `getDashboardStats()` fetches all matching teachers without limit, then slices to 100 in application
- Files: `backend/src/services/statsService.ts:34` (Teacher.find with no limit)
- Cause: No pagination in query; calculates stats on potentially thousands of records in-memory
- Improvement path: Add MongoDB aggregation pipeline with $limit and $skip. Pre-calculate stats with indexes. Consider caching.

**N+1 Query Problem in TeacherProfile:**
- Problem: Profile page likely loads teacher, then loads school, then loads related entities separately
- Files: `frontend/src/pages/TeacherProfile.tsx` (1297 lines, complex data loading)
- Cause: React component fetches data sequentially without parallel requests
- Improvement path: Use `useEffect` with multiple requests in parallel or implement GraphQL. Pre-fetch related data in service layer.

**Large Component (1297 lines) - TeacherProfile:**
- Problem: Single component handles rendering of entire teacher profile with multiple sections, dialogs, and complex logic
- Files: `frontend/src/pages/TeacherProfile.tsx`
- Cause: No separation of concerns; mixing UI, form logic, API calls, state management
- Improvement path: Extract sections into sub-components. Use custom hooks for form logic. Consider composition pattern.

**Large DataTable Columns Definition (495 lines):**
- Problem: All column definitions in single file makes changes difficult and re-renders entire table on any change
- Files: `frontend/src/components/teachers/list/columns.tsx`
- Cause: No lazy loading of column definitions; all columns rendered regardless of viewport
- Improvement path: Lazy load column definitions. Memoize column definitions to prevent unnecessary re-renders.

**No Database Indexes on Search Fields:**
- Problem: `isDeleted`, `project`, `pipelineStage` fields queried frequently but some lack indexes
- Files: `backend/src/models/Teacher.ts` (missing index for project, pipelineStage)
- Cause: Indexes defined for name and nationality but not for common filter fields
- Improvement path: Add indexes for: `isDeleted`, `project`, `pipelineStage`, `school`, `createdAt`. Monitor query performance.

## Fragile Areas

**Document Management System - Complex Box/Document Relationship:**
- Files: `backend/src/services/teacherService.ts:211-301` (boxes and document management)
- Why fragile: Documents can be in "uncategorized" or in boxes; reordering requires careful state synchronization; soft references via boxId string
- Safe modification: Always update both otherDocuments and documentBoxes together with `markModified()`. Test reordering thoroughly. Consider database transactions.
- Test coverage: Box creation/deletion/reordering has basic coverage but edge cases untested (box deletion with docs, concurrent updates)

**File Storage and Cleanup System:**
- Files:
  - `backend/src/services/teacherService.ts:68-90` (avatar management)
  - `backend/src/services/teacherService.ts:92-128` (core documents)
  - `backend/src/services/teacherService.ts:149-163` (ad-hoc documents)
- Why fragile: No transactions; files deleted asynchronously; no rollback mechanism if DB fails after file deletion
- Safe modification: Use soft delete at file level. Implement cleanup job that validates DB references before deleting. Add file integrity checks.
- Test coverage: No tests for file deletion success/failure scenarios

**School Import with insertMany (ordered: false):**
- Files: `backend/src/services/schoolService.ts:75` (insertMany with ordered: false)
- Why fragile: Partial failures possible; some records inserted, others rejected; no rollback; reporting says X inserted but doesn't indicate which failed
- Safe modification: Use transactions if available. Return detailed failure list. Validate all records before inserting. Consider smaller batch sizes.
- Test coverage: No tests for import with duplicate names or validation errors

**Alert Rules with Dynamic Document Fields:**
- Files: `backend/src/services/statsService.ts` (references arcDetails, workPermitDetails, passportDetails)
- Why fragile: Hardcoded field names mapped to alert categories; if schema changes, alert logic breaks silently
- Safe modification: Use field constants. Add schema migration tests. Type-safe field references.
- Test coverage: No tests for missing document fields

## Scaling Limits

**File Storage on Local Disk:**
- Current capacity: Upload directory is relative to process working directory with 5MB per file limit
- Limit: Will run out of disk space; cannot distribute across servers; no backup/recovery strategy
- Scaling path: Migrate to S3 or cloud storage. Implement CDN. Add file lifecycle policies for old uploads.

**MongoDB Connection Pool:**
- Current capacity: Default Mongoose connection pool (5 connections)
- Limit: Under load, connection pool exhausted causing query timeouts
- Scaling path: Increase pool size. Implement query batching. Use read replicas for stats queries.

**Dashboard Stats Calculation:**
- Current capacity: Calculates 7 chart distributions in-memory for potentially thousands of records on each request
- Limit: Response time degrades with more teachers; client may timeout
- Scaling path: Pre-calculate charts with aggregation pipeline. Cache results for 5-15 minutes. Use background jobs.

## Dependencies at Risk

**CSV Parser (csv-parser):**
- Risk: Package receives infrequent updates; no type definitions; handles malformed CSV gracefully (silently drops data)
- Impact: Import failures hard to debug; data loss possible
- Migration plan: Consider papaparse or csv-parse with better error handling and TypeScript support

**Archiver (zip creation):**
- Risk: Minimal maintenance; could have security issues with malformed archives
- Impact: Box download feature could fail
- Migration plan: Consider native Node.js zip library or cloud storage native compression

## Missing Critical Features

**No Input Validation Framework:**
- Problem: No Zod/Joi/ajv schemas for validating request data
- Blocks: Cannot ensure data integrity; security vulnerabilities from unexpected data shapes
- Priority: HIGH - Needed before production

**No Rate Limiting:**
- Problem: No protection against bulk operations or API abuse
- Blocks: Can be exploited for DoS; import endpoints vulnerable
- Priority: MEDIUM - Add before scaling

**No File Integrity Checks:**
- Problem: No tracking of which files are still referenced in database
- Blocks: Cannot safely delete old uploads; storage continues to grow
- Priority: MEDIUM - Implement cleanup job

**No Audit Logging:**
- Problem: No record of who changed what or when
- Blocks: Cannot track compliance; security investigations difficult
- Priority: MEDIUM - Important for regulated environments

## Test Coverage Gaps

**TeacherController - No Tests:**
- What's not tested: All endpoints (createTeacher, getTeacherById, updateTeacher, deleteTeacher, uploadAvatar, uploadDocuments, etc.)
- Files: `backend/src/controllers/teacherController.ts` (267 lines, 0 test files)
- Risk: Any change to controller breaks endpoints without immediate feedback
- Priority: CRITICAL

**SchoolController - Partial Tests:**
- What's not tested: Import functionality error cases, edge cases in CSV parsing
- Files: `backend/src/controllers/schoolController.ts` (no dedicated test file)
- Risk: Import errors may cause partial data corruption
- Priority: HIGH

**StatsService - No Edge Case Tests:**
- What's not tested: Filters with missing documents, null pipelineStage, empty teacher list
- Files: `backend/src/services/statsService.ts` (299 lines, minimal test coverage)
- Risk: Dashboard may fail or show incorrect data under edge conditions
- Priority: MEDIUM

**File Upload/Deletion - No Integration Tests:**
- What's not tested: Upload success, file actually written, deletion after update, orphaned file cleanup
- Files: `backend/src/services/teacherService.ts` (file operations)
- Risk: Files may accumulate; deletion failures silent
- Priority: HIGH

**Frontend Components - Limited Unit Tests:**
- What's not tested: DataTable sorting/filtering edge cases, TeacherProfile form validation, Kanban drag-drop failures
- Files: `frontend/src/pages/TeacherProfile.tsx`, `frontend/src/components/teachers/list/` (large components with minimal tests)
- Risk: UI bugs discovered in production; form validation issues
- Priority: MEDIUM

**Route Error Handling - No Tests:**
- What's not tested: Invalid IDs, missing required fields, database errors
- Files: `backend/src/routes/`, `backend/src/controllers/`
- Risk: Unclear error responses; inconsistent status codes
- Priority: MEDIUM

---

*Concerns audit: 2026-01-27*
