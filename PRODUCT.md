# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is a banking operator or financial analyst at a financial institution who processes daily transaction batches arriving as CSV files from banking correspondents. A secondary audience is supervisors who monitor the processing history and outcome (success, errors, critical).

## Product Purpose

Processes CSV transaction files (`transactions_DDMMYYYY.csv`) received from banking correspondents: validates each transaction (10-digit account, monetary amount, transaction date, no duplicates), stores results, and lets operators correct rejected transactions by editing the amount and reprocessing. Success means a batch is ingested, validated, and any rejected records are corrected without leaving the transaction detail view.

## Positioning

A batch validation and reprocessing engine for incoming correspondent transactions that keeps full audit traceability: every transaction's outcome is visible per file and per record, and rejected items can be corrected and re-validated in place. Not a generic file manager: the value is the validation rules and the correction loop.

## Operating Context

Internal enterprise web tool used at a desk, on desktop first (table lists, batch operations), with a mobile fallback for review. UI language is Spanish. File names follow the `transactions_DDMMYYYY.csv` convention. Operators move between three views: available files to process, processed history, and per-file transaction detail with reject/edit modals.

## Capabilities and Constraints

- List unprocessed files in an input directory.
- Process a file (confirmation required; button shows loading while running).
- Show processed history with derived file status (EXITOSO / ERRORES / CRITICO).
- View transactions per file; rejected rows show reason and allow editing the amount to reprocess.
- Validation rules: 10-digit account (required), amount > 0 (required), date (required), no duplicate (account + date + amount).
- Backend is a separate C# .NET REST API with MySQL (not in this repo); the frontend uses a mock adapter (`VITE_USE_MOCK`) that mirrors the API contract in `src/services/api.js` / `src/services/mockApi.js`.
- Stack already established by the codebase: React 19 + Vite + MUI 9, vertical-slice folders, no Redux.
- Redesign scope: functionality, flows, Spanish language, and API contracts are untouchable; visual identity, microcopy wording, and structure are free to improve.

## Brand Commitments

- New product name and visual identity to be proposed and agreed (work-in-progress; UI strings remain in Spanish).
- Tone must stay sober and enterprise: financial-operations credibility, no playful or loud styling.
- Accessibility contrast rules already agreed (e.g. warning text uses `#8F5C00`, never `warning.main`).

## Evidence on Hand

- `UX_AUDIT.md` records prior heuristic/accessibility audits per screen.
- `AGENTS.md` records product specs, UI standards, and commit conventions.
- No real customer data, testimonials, or screenshots in the repo; mock data is synthetic.

## Product Principles

- The task wins: operators must scan, act, and correct faster, never be distracted by the chrome.
- Sobriety is the brand: restrained palette, one accent, typography with character but no decoration.
- Consistency across screens is a feature: the same button, status, table, and state vocabulary everywhere.
- Audit transparency: status, reasons, and counts must be legible at a glance, never hidden.
- Good engineering: tokens centralized in the theme, reusable shared components, WCAG AA, clean lint/build.

## Accessibility & Inclusion

- WCAG AA contrast targets (warning text `#8F5C00` on light backgrounds, white text on filled warning chips).
- All interactive elements carry `aria-label`; nav uses `aria-current`; async feedback announced via `aria-live`.
- Touch targets >= 44px on mobile; keyboard-operable modals and tables.
