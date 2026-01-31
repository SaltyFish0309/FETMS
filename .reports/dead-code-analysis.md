# Dead Code Analysis Report
Generated: 2026-01-31

## Executive Summary

Analysis completed on both frontend and backend using knip and depcheck tools.

### Key Findings
- **5 unused files** detected in frontend
- **3 unused files** detected in backend
- **Multiple unused exports** across UI components
- **Unused dependencies** in both frontend and backend
- **Missing dependency** (zod) in frontend

---

## 🔴 CRITICAL - Unused Files

### Frontend Files (SAFE to delete after test verification)

#### 1. `src/App.css`
- **Severity**: SAFE
- **Reason**: Likely replaced by Tailwind CSS
- **Action**: Verify no styles are referenced, then delete

#### 2. `src/types/i18next.d.ts`
- **Severity**: CAUTION
- **Reason**: TypeScript declaration file - may be needed for type safety
- **Action**: Check if i18n types work without it before deleting

#### 3. `src/components/ui/date-picker-with-input.tsx`
- **Severity**: SAFE
- **Reason**: UI component not imported anywhere
- **Action**: Delete if not needed, or add to exports if future use planned

#### 4. `src/components/teachers/list/index.ts`
- **Severity**: SAFE
- **Reason**: Barrel export file not being used
- **Action**: Delete and import components directly

#### 5. `src/components/teachers/list/filters/index.ts`
- **Severity**: SAFE
- **Reason**: Barrel export file not being used
- **Action**: Delete and import components directly

### Backend Files (SAFE to delete after verification)

#### 1. `vitest.config.d.ts`
- **Severity**: SAFE
- **Reason**: Auto-generated TypeScript declaration file
- **Action**: Safe to delete (will be regenerated if needed)

#### 2. `src/export_seniority.ts`
- **Severity**: CAUTION
- **Reason**: May be a utility script
- **Action**: Verify not used in deployment scripts before deleting

#### 3. `src/seedAlerts.ts`
- **Severity**: CAUTION
- **Reason**: Database seeding script
- **Action**: Keep for development/deployment purposes

---

## 🟡 MEDIUM - Unused Exports

### Frontend UI Components (SAFE to remove exports)

These components have unused exports but the components themselves are used:

1. **phone-input.tsx**
   - Unused exports: `phoneSchema`
   - Unused types: `CountryData`
   - Missing dependency: `zod` (needs to be added to package.json)

2. **chartColors.ts**
   - Unused export: `GENDER_COLORS`
   - Action: Remove export or add usage

3. **badge.tsx**
   - Unused export: `badgeVariants`
   - Unused type: `BadgeProps`

4. **card.tsx**
   - Unused export: `CardFooter`

5. **select.tsx**
   - Unused exports: `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

6. **alert-dialog.tsx**
   - Unused exports: `AlertDialogPortal`, `AlertDialogOverlay`

7. **table.tsx**
   - Unused exports: `TableFooter`, `TableCaption`

8. **dialog.tsx**
   - Unused exports: `DialogPortal`, `DialogOverlay`, `DialogClose`

9. **utils.ts**
   - Unused export: `createImage`

10. **command.tsx**
    - Unused exports: `CommandDialog`, `CommandShortcut`

11. **dropdown-menu.tsx**
    - Multiple unused exports (8 total)

12. **scroll-area.tsx**
    - Unused export: `ScrollBar`

13. **sheet.tsx**
    - Unused exports: `SheetPortal`, `SheetOverlay`, `SheetTrigger`, `SheetClose`, `SheetFooter`

### Frontend Type Exports (SAFE to remove)

1. **exportService.ts**
   - Unused type: `ExportColumn`

2. **columnConfig.ts**
   - Unused types: `FilterType`, `GroupLabel`

3. **ViewModeToggle.tsx**
   - Unused type: `ViewMode`

4. **button.tsx**
   - Unused type: `ButtonProps`

5. **country-dropdown.tsx**
   - Unused type: `Country`

6. **useTeacherKanban.ts**
   - Unused type: `Stage`

### Backend Model Types (CAUTION)

1. **Stage.ts**
   - Unused type: `IStage`
   - Action: May be used for type safety - verify before removing

2. **AlertRule.ts**
   - Unused type: `IAlertRule`
   - Action: May be used for type safety - verify before removing

---

## 🟢 LOW - Unused Dependencies

### Frontend Dependencies to Remove

1. **baseline-browser-mapping** (dependency)
   - Not used anywhere
   - Safe to remove: `npm uninstall baseline-browser-mapping`

2. **react-grab** (devDependency)
   - Not used anywhere
   - Safe to remove: `npm uninstall -D @react-grab/claude-code react-grab`

### Frontend DevDependencies to Remove

All of these are only used in config files and can be kept or removed based on preference:
- `tailwindcss-animate`
- `@tailwindcss/postcss`
- `@vitest/coverage-v8`
- `autoprefixer`
- `postcss`
- `tailwindcss`

### Backend Dependencies to Remove

1. **form-data** (dependency)
   - Not used anywhere
   - Safe to remove: `npm uninstall form-data`

2. **node-fetch** (dependency)
   - Not used anywhere
   - Safe to remove: `npm uninstall node-fetch`

### Backend DevDependencies to Remove

1. **@types/mongoose** (devDependency)
   - Not used directly (types come from mongoose package)
   - Safe to remove: `npm uninstall -D @types/mongoose`

2. **nodemon** (devDependency)
   - Replaced by tsx watch
   - Check package.json scripts before removing

3. **ts-node** (devDependency)
   - Replaced by tsx
   - Check package.json scripts before removing

---

## 🔧 Missing Dependencies

### Frontend

1. **zod** (missing)
   - Used in: `src/components/ui/phone-input.tsx`
   - Action: Add to dependencies: `npm install zod`

---

## 📋 Recommended Actions Plan

### Phase 1: Quick Wins (SAFE - No Tests Needed)
1. Remove unused npm dependencies:
   ```bash
   cd frontend && npm uninstall baseline-browser-mapping
   cd backend && npm uninstall form-data node-fetch
   ```

2. Add missing dependency:
   ```bash
   cd frontend && npm install zod
   ```

### Phase 2: File Deletions (Requires Test Verification)
Delete files in this order, running tests after each:

1. **Frontend barrel exports** (lowest risk):
   - Delete `src/components/teachers/list/index.ts`
   - Delete `src/components/teachers/list/filters/index.ts`
   - Run: `npm run test --prefix frontend`

2. **Frontend unused component**:
   - Delete `src/components/ui/date-picker-with-input.tsx`
   - Run: `npm run test --prefix frontend && npm run build --prefix frontend`

3. **Frontend CSS file**:
   - Delete `src/App.css`
   - Run: `npm run test --prefix frontend && npm run build --prefix frontend`

4. **Backend auto-generated file**:
   - Delete `vitest.config.d.ts`
   - Run: `npm run test --prefix backend`

### Phase 3: Unused Exports (Optional Cleanup)
These don't affect bundle size much but improve code clarity:
- Remove unused exports from UI components (13 components affected)
- Remove unused type exports (6 files affected)

### Phase 4: Keep for Now (May be needed)
- `src/types/i18next.d.ts` - May provide type safety
- `src/export_seniority.ts` - May be a utility script
- `src/seedAlerts.ts` - Database seeding for development
- Backend Model types (`IStage`, `IAlertRule`) - May be used for type safety

---

## 📊 Impact Summary

### Potential Savings
- **Files**: 8 files can be safely deleted
- **Dependencies**: 5 unused dependencies to remove
- **Bundle Size**: Minimal impact (most unused code is in devDependencies)
- **Code Clarity**: Significant improvement by removing unused exports

### Risk Assessment
- **LOW RISK**: Dependency removal, barrel export deletion
- **MEDIUM RISK**: Component file deletion (requires test verification)
- **HIGH RISK**: Type definition removal (may break TypeScript compilation)

---

## Next Steps

1. Run Phase 1 actions (dependency cleanup)
2. Execute Phase 2 with test verification
3. Consider Phase 3 for long-term code health
4. Review Phase 4 items periodically

**IMPORTANT**: Always run the full test suite after each deletion to ensure no regressions.
