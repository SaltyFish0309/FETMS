# Phase 03: i18n Infrastructure - Research & Planning

## 1. Recommended Stack
Given the current Vite + React ecosystem, the **i18next** ecosystem is the industry standard and most robust choice.

*   **Core**: `i18next` (The main internationalization framework)
*   **React Integration**: `react-i18next` (Hooks and HOCs)
*   **Backend/Loading**: `i18next-http-backend` (Lazy loading translation files)
*   **Detection**: `i18next-browser-languagedetector` (Auto-detect from browser/localStorage)

## 2. Architecture Patterns

### 2.1 File Structure
We will use the standard **public folder** strategy for translation assets to allow lazy loading.

```
frontend/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json   (Global terms: "Save", "Cancel", "Delete")
│       │   ├── navigation.json
│       │   └── dashboard.json
│       └── zh-TW/            (Traditional Chinese)
│           ├── common.json
│           ├── navigation.json
│           └── dashboard.json
├── src/
│   ├── i18n.ts               (Configuration & Initialization)
│   ├── components/
│   │   └── ui/
│   │       └── language-toggle.tsx
│   └── main.tsx              (Provider wrapping)
```

### 2.2 Provider Setup
The `i18next` instance should be initialized in a dedicated file (`src/i18n.ts`) and imported in `main.tsx`.
React's `Suspense` component will be used to handle the loading state while translation files are fetched.

### 2.3 Type Safety
We will implement **TypeScript support** for translation keys. By adding a declaration file (`src/types/i18next.d.ts`), we can ensure that `t('common.save')` is type-checked and autocompleted.

## 3. Critical Decisions

### 3.1 Routing Strategy: **Internal State (LocalStorage)**
*   **Option A: Path-based** (`/en/dashboard`, `/zh-TW/dashboard`)
    *   *Pros*: SEO friendly, shareable links with language context.
    *   *Cons*: High complexity with `react-router-dom` (requires layout wrappers/redirects).
*   **Option B: Internal State** (LocalStorage persistence)
    *   *Pros*: **Recommended**. Simple implementation, cleaner URLs. Best for "App/Dashboard" usage where SEO is irrelevant.
    *   *Decision*: **Internal State**.
        *   We will use `i18next-browser-languagedetector`.
        *   It automatically persists the selection to `localStorage`.
        *   It checks `localStorage` -> `navigator` -> default (`en`).

### 3.2 Locale Codes
*   **English**: `en`
*   **Traditional Chinese**: `zh-TW` (Taiwan standard) - This is the explicit requirement.

## 4. Pitfalls & Solutions

### 4.1 Flash of Untranslated Content (FOUC)
*   **Problem**: Text appears in English for a split second before turning Chinese.
*   **Solution**: Wrap the App in `Suspense` with a fallback loader.
    ```tsx
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
    ```

### 4.2 Interpolation Security
*   **Problem**: XSS attacks via translation files.
*   **Solution**: `react-i18next` escapes values by default. We just need to ensure we don't use `dangerouslySetInnerHTML` with translations unless absolutely necessary (and sanitized).

### 4.3 Date Formatting
*   **Problem**: Dates need to match the locale.
*   **Solution**: We are using `date-fns`. We must load the locale dynamically or import necessary locales (`enUS`, `zhTW`) and pass the correct one to format functions based on the current i18n language.

## 5. Implementation Steps (High Level)

1.  **Install Dependencies**: `npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector`
2.  **Setup Config**: Create `src/i18n.ts` with detection and backend plugins.
3.  **Create JSONs**: Add `public/locales` structure with initial `common.json`.
4.  **Initialize**: Import `i18n` in `main.tsx` and wrap App.
5.  **Create Toggle**: Build `LanguageToggle` component (similar to ThemeToggle).
6.  **Type Definitions**: Add `i18next.d.ts` for strictly typed keys.
7.  **Test**: Verify language switching and persistence.
