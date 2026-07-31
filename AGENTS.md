# UPS Hackathon Project - Financial Batch Transaction Processing System

## Goal
Build a full-stack financial system that processes CSV transaction files from banking correspondents, using React 19.x (Vite) for Frontend and C# (.NET) for Backend with MySQL.

## Est. Time
16 hours

## Tech Stack
- **Frontend:** React 19.x + Vite
- **UI Library:** MUI (Material UI v9, @mui/material 9.2.0) + @mui/icons-material
- **Backend:** C# (.NET)
- **Database:** MySQL
- **File format:** CSV files named `transactions_DDMMYYYY.csv`
- **State:** Local React state + hooks (no Redux); data through `src/services/api.js` adapter with `VITE_USE_MOCK` flag (mock implementation in `src/services/mockApi.js`)

## Frontend Architecture (Vertical Slices)
Code is organized by domain, not by layer. Each slice owns its components, its hooks and its mock data:

- **`src/slices/files/`** - Available files list, processing, processed history (`AvailableFiles.jsx`, `ProcessedFiles.jsx`)
- **`src/slices/transactions/`** - Transaction list + detail dialogs (`TransactionList.jsx`, `RejectReasonModal.jsx`, `EditAmountModal.jsx`)
- **Shared (cross-cutting, NOT per-slice):** routing (`src/App.jsx`), layout shell, theme (`src/theme/theme.js`), API adapter (`src/services/api.js`), UI atoms (`src/components/common/`: `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState`), data hooks (`src/hooks/useFiles.js`, `useTransactions.js`)
- Mock data lives in `src/services/mockApi.js`; swap to the real .NET API by setting `VITE_USE_MOCK=false` and pointing at the backend base URL

## Frontend UI/UX Standards
Decisions agreed during the impeccable critiques (used to drive reviews and fixes):

- **Language:** UI strings in Spanish (file names, statuses, labels, dialogs)
- **Layout:** MUI with 8pt spacing grid; screens keep the page header at top with the "Actualizar" refresh button anchored right; states (loading/empty/error) centered with `minHeight: calc(100vh - 220px)`
- **Typography:** Google Fonts Inter; base size 16px (`body1` 16px, `body2` 15px, `h6` 19.2px, table cells 15px, status chips 0.85rem)
- **Responsive:** tables collapse to stacked card layout below the `sm` breakpoint (e.g. AvailableFiles renders cards on mobile)
- **Error handling:** an inline error banner (keep the data visible) is preferred over replacing the whole view; only show the full error state when there is no data
- **Feedback for async actions:** destructive/async buttons use MUI Button `loading`/`loadingPosition` with disabled rows during processing; confirmation Dialog before processing a file
- **Result consumption:** the process result (`{ success, fileId, processed, rejected }`) is shown in a result Dialog with counters and a link into the transactions screen; never discarded
- **Accessibility / contrast (WCAG AA):** never use `warning.main` (#ED6C02) as a text color; use `warning.dark` = **#8F5C00** on light backgrounds; filled warning chips get `backgroundColor: #8F5C00` with white text (override in `theme.js` → `MuiChip.colorWarning`). All dialog triggers carry `aria-label`
- **ESLint (strict):** `react/prop-types` and `react/no-unescaped-entities` are enforced (use `&quot;` for quotes in JSX text)
- **Verification:** run `npx eslint <changed files>` and `npx vite build` after UI changes; both must be clean

## Git & Commit Conventions
- **Conventional Commits** for every change: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`, `perf:`, `build:`, `ci:` — always a concise imperative summary in the subject
- Only commit when the user asks; stage only intended files
- `.gitignore` already excludes `node_modules` and `dist`; do not commit secrets or env files

## Iteration Log (impeccable critiques → fixes)
- **ProcessedFiles critique → fixed:** showed only a 7-column literal table with wrong statuses. Now shows the real derived file status, a 4-column table with a proportion bar (processed vs rejected), search + sort, and an inline error banner that keeps the table visible
- **AvailableFiles critique (score 22/40) → fixed:** now consumes the process result (Dialog with processed/rejected counters + link to transactions), uses a proper MUI Button with `loading` state instead of an IconButton pill, disables rows while processing, asks for confirmation before processing, renders cards instead of a table on mobile, and keeps an inline error banner when refresh fails

## Features

### Backend (REST API)
1. **GET /files/available** - List unprocessed files in the configured directory
2. **POST /files/process** - Process a selected file (receives filename)
3. **GET /files** - Get all processed file records
4. **GET /files/{id}** - Get transactions for a specific file
5. **POST /transactions/{id}** - Edit transaction amount & re-validate

### Frontend Screens
1. **Available files** - Browse files in the input directory
2. **Process button** - Start processing a selected file
3. **Processed files** - View history & status
4. **Transactions** - View transactions of a processed file
5. **Rejection reason modal** - See why a transaction was rejected
6. **Edit amount modal** - Edit rejected transaction amount for reprocessing

### Transaction Validation Rules
**Status "PROCESSED" when:**
- Account number (10 digits) - Required
- Amount (monetary value) - Required
- Transaction date - Required
- No duplicate (account + date + amount)

**Status "REJECTED" when:**
- Invalid or empty field
- Duplicate record

### File-level Status (Processed Files)
A processed file can have 3 states, derived from its transaction results:
1. **ERRORES** - The CSV has a mix of correct and erroneous transactions (rejectedCount > 0 AND processedCount > 0)
2. **CRITICO** - The CSV has only errors (processedCount === 0, all transactions rejected)
3. **EXITOSO** - Everything is correct (rejectedCount === 0)

The file status is derived from the counts and recomputed when a rejected transaction is reprocessed.

### Technical Notes
- Input directory configurable via env vars or config file
- All endpoints must validate input format/type
- Log all operations (success & error)
- Reprocess: edit amount → re-validate → update status

## Evaluation Criteria
- **Backend (50%)** - Functional correctness of REST API
- **Code Quality (30%)** - Best practices, organization, documentation
- **Efficiency (10%)** - Performance & resource usage
- **Frontend** - Solution design, code structure, architecture, logic, functionality, best practices, DevTools
- **Q&A** - Explain code, architecture, and tech decisions

## Deliverables
- Frontend source code (React/Vite)
- Backend source code (C# .NET)
- MySQL database creation script
- README with setup instructions
