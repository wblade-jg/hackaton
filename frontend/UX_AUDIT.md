# UX/UI Audit — FinBatch Transaction Processor

---

## Screen 1: Available Files

### Objective
Allow the user to browse unprocessed CSV files in the input directory and trigger batch processing.

### User Profile
Banking operator or financial analyst who needs to process daily transaction batches.

### Problem Solved
Eliminates manual file inspection and processing. Provides a clear list of pending files with one-click processing.

### Interface Structure
- **Header**: Title + subtitle + Refresh button (right-aligned)
- **Content area**: Paper container with a table (filename, date, action)
- **States**: Loading skeleton → Empty state (illustration + message) → Error state (retry button) → Data table
- **Feedback**: Snackbar on success/failure of processing

### User Flow
1. User lands on screen → `GET /files/available` loads automatically
2. User sees list of files with filenames and dates
3. User clicks "Process" button on desired file
4. Button shows loading state ("Processing...")
5. Success → snackbar + list refreshes (processed file disappears)
6. Error → snackbar with error message, file remains available

### UI Components
| Component | Usage |
|-----------|-------|
| `Paper` | Container for the table, provides visual separation |
| `Table`, `TableHead`, `TableBody` | Structured data display |
| `IconButton` (Process) | Combined icon+text for clear affordance |
| `Snackbar` + `Alert` | Non-blocking success/error feedback |
| `EmptyState` | Custom illustration + message + action button |
| `ErrorState` | Error explanation + retry CTA |
| `LoadingState` | Spinner while fetching |

### Justification UX

**Visibility of system status (Nielsen 1):**
- Loading spinner appears during API calls
- Process button shows "Processing..." text while busy
- Snackbar confirms success or failure explicitly
- File disappears from the list after successful processing (system state change is visible)

**Control and user freedom (Nielsen 3):**
- Refresh button lets user manually reload the file list
- User chooses which file to process (not automatic)
- No irreversible actions without confirmation

**Consistency and standards (Nielsen 4):**
- Consistent table layout across all screens
- MUI components follow platform conventions
- Buttons, icons, and interactions are uniform

**Error prevention (Nielsen 5):**
- Process button disabled while processing another file prevents double-submission
- Confirmation via snackbar provides clear outcome

**Recognition rather than recall (Nielsen 6):**
- Filenames, dates, and actions visible at a glance
- Icon + text labels reduce cognitive load
- Status is immediately recognizable

### Gestalt Laws Applied

| Law | Application |
|-----|-------------|
| **Proximity** | Filename + icon grouped together; date placed adjacent; actions grouped on the right |
| **Similarity** | All rows use identical typography and spacing; all process buttons have same shape |
| **Figure-Ground** | Paper container creates clear figure on grey background; table rows alternate subtly |
| **Continuity** | Table columns create vertical alignment guides for scanning |
| **Common Region** | Each table row is a perceptual unit; the Paper bounds the entire list as one region |
| **Uniform Connectedness** | Process button is visually connected to its row by being in the same row |

### Accessibility (WCAG 2.2)
- All interactive elements have `aria-label` attributes
- Color is not the only means of conveying information (icons + text + labels)
- Keyboard navigable (Table rows, buttons are focusable)
- Sufficient contrast ratio (dark text on light background)
- Touch targets ≥ 44px for mobile

### Usability Score (Nielsen Heuristics)
| Heuristic | Score | Reason |
|-----------|-------|--------|
| Visibility of status | 10/10 | Loading, processing, success/failure all visible |
| System-world match | 9/10 | Financial terminology matches user expectations |
| User control | 9/10 | Refresh available, no automatic processing |
| Consistency | 10/10 | Matches MUI conventions and app-wide patterns |
| Error prevention | 9/10 | Double-submit prevented via loading state |
| Recognition | 9/10 | Clear file info at a glance |
| Flexibility | 7/10 | No bulk select or advanced filters (acceptable for MVP) |
| Aesthetic design | 9/10 | Clean, minimal, good spacing |
| Error recovery | 8/10 | Errors shown with retry option |
| Help | 6/10 | No inline help (contextual text present) |

### Potential Improvements
- Add search/filter for many files
- Add select-all for bulk processing
- Show file size and last modified date

---

## Screen 2: Processed Files

### Objective
Display the history of all processed batch files with their status and transaction counts.

### User Profile
Same banking operator, also supervisors who monitor processing history.

### Problem Solved
Provides transparency into what files have been processed, when, and with what results.

### Interface Structure
- **Header**: Title + subtitle + Refresh button
- **Summary chips**: Counts (only on detail screen, not here — though could be added)
- **Content**: Paper + table with filename, date, counts, status, action

### User Flow
1. User navigates to "Processed Files" sidebar
2. List loads showing all processed files
3. Each row shows processing date, total/processed/rejected counts, status
4. User clicks eye icon to view transactions of a specific file
5. Empty state when no files have been processed yet (with CTA to navigate to available files)

### UI Components
| Component | Usage |
|-----------|-------|
| `StatusBadge` | Color-coded status chip for file processing state |
| `Visibility IconButton` | Action to drill into transaction detail |
| `EmptyState` with navigation CTA | Guides user to first action |

### Gestalt Laws Applied
| Law | Application |
|-----|-------------|
| **Proximity** | Counts (total/processed/rejected) grouped together; status near counts |
| **Similarity** | All status badges same shape, different colors by meaning |
| **Continuity** | Columns align data for easy vertical scanning |
| **Closure** | Table headers + rows create complete perceptual units |
| **Symmetry** | Balanced layout of data columns |
| **Common Fate** | Hover effect on rows signals interactivity |

### Accessibility
- `StatusBadge` uses icons + color + text (triple encoding)
- All action buttons have `aria-label`
- Table is wrapped in `TableContainer` with proper `aria-label`

### Evaluation
| Heuristic | Score | Reason |
|-----------|-------|--------|
| Visibility | 10/10 | All processing results visible at a glance |
| System-world | 9/10 | Familiar table layout for operators |
| User control | 9/10 | Can navigate to detail, refresh |
| Consistency | 10/10 | Same table pattern as available files |
| Error prevention | 8/10 | No destructive actions here |
| Recognition | 9/10 | Status, counts, dates all visible |
| Flexibility | 7/10 | No sorting/filtering |
| Aesthetics | 9/10 | Clean, good density |
| Error recovery | 8/10 | Retry available |
| Help | 6/10 | Minimal guidance text |

---

## Screen 3: Transaction List

### Objective
Show all transactions within a processed file, distinguishing processed vs rejected.

### User Profile
Operator investigating processing results, looking for rejected transactions.

### Problem Solved
Provides detailed visibility into each transaction's outcome, enabling correction of rejected items.

### Interface Structure
- **Back button** + **File info header** (filename, date, transaction count)
- **Summary chips**: Counts of processed/rejected
- **Table**: #, Account, Date, Amount, Status, Actions (view reason, edit amount)
- **Modals**: Rejection reason modal, Edit amount modal (screen 4 & 5)

### User Flow
1. User clicks eye icon on a processed file → navigates to `/transactions/:fileId`
2. Transactions load with summary chips at top
3. Rejected rows have a subtle red background tint
4. User clicks eye icon on rejected row → rejection reason modal opens
5. User clicks edit icon on rejected row → edit amount modal opens
6. After editing → transaction status updates in list

### UI Components
| Component | Usage |
|-----------|-------|
| `Chip` (summary) | Quick visual summary of processed vs rejected counts |
| `StatusBadge` | Per-transaction status |
| `RejectReasonModal` | Detail view for rejection cause |
| `EditAmountModal` | Form to correct and reprocess |
| Row background tint | Visual cue for rejected transactions |

### Gestalt Laws
| Law | Application |
|-----|-------------|
| **Figure-Ground** | Red-tinted rejected rows stand out from white processed rows |
| **Similarity** | All rejected rows have same tint, all processed are white |
| **Proximity** | Actions (view/edit) grouped together on the right |
| **Continuity** | Consistent vertical rhythm for scanning |
| **Common Fate** | Hover state on rows signals interactivity |

### Accessibility
- Red tint is supplemented by text status and icons (not color-dependent)
- Modals are focus-trapped for keyboard users
- `aria-label` on all action buttons
- Back button has proper `aria-label`

### Evaluation
| Heuristic | Score | Reason |
|-----------|-------|--------|
| Visibility | 10/10 | Status visible per row + summary chips |
| System-world | 9/10 | Amounts formatted as currency, dates readable |
| User control | 9/10 | Back navigation, manual refresh |
| Consistency | 10/10 | Matches other screens |
| Error prevention | 8/10 | Amount validation in edit modal |
| Recognition | 9/10 | Red background = rejected at a glance |
| Flexibility | 7/10 | No inline editing |
| Aesthetics | 9/10 | Clean, well-spaced |
| Error recovery | 8/10 | Retry available |
| Help | 7/10 | Rejection reason modal provides full context |

---

## Screen 4: Rejection Reason Modal

### Objective
Display the detailed reason why a specific transaction was rejected.

### User Profile
Operator who needs to understand the exact validation failure before correcting.

### Problem Solved
Provides clear, actionable error information so the operator knows what to fix.

### Structure
- Dialog with error icon
- Transaction details (account, date, amount) in read-only display
- Rejection reason in a highlighted box (red-tinted)
- Close button

### Gestalt Laws
| Law | Application |
|-----|-------------|
| **Figure-Ground** | Rejection reason box has distinct red background, draws attention |
| **Proximity** | Related fields grouped together |
| **Closure** | Dialog box is a complete, contained unit |

---

## Screen 5: Edit Amount Modal

### Objective
Allow the operator to correct the amount of a rejected transaction and trigger reprocessing.

### User Profile
Operator who has identified the rejection reason and needs to correct the data.

### Problem Solved
Enables correction without leaving the current view, with client-side validation.

### Structure
- Dialog with warning banner ("This transaction was rejected...")
- Read-only fields: account, date, rejection reason
- Editable field: Amount (with $ prefix)
- Client-side validation: required, positive, max 2 decimals
- Save/Cancel buttons

### Interaction Design
- Autofocus on amount field
- Enter key submits
- Loading state on save button ("Reprocessing...")
- Success → modal closes, transaction list updates
- Error → inline error message

### Gestalt Laws
| Law | Application |
|-----|-------------|
| **Proximity** | Read-only fields grouped above, editable field below |
| **Similarity** | All read-only fields use same typography |
| **Figure-Ground** | Warning banner uses amber background to signal attention needed |

---

## Summary: Design Decisions

| Principle | Implementation |
|-----------|---------------|
| **8pt grid** | MUI theme configured with `spacing: 8` — all margins, paddings follow 8px increments |
| **Mobile first** | Responsive Drawer (sidebar → hamburger on mobile), responsive padding |
| **Typography** | Inter font family, responsive font sizes via `responsiveFontSizes()` |
| **Color** | Deep blue for trust (financial domain), teal for accents, red/green for status |
| **Accessibility** | `aria-label`, `role`, keyboard navigation, sufficient contrast, touch targets |
| **Feedback** | Snackbar for toasts, loading spinners, button loading states |
| **Error states** | Inline validation + error boundaries + retry buttons |
| **Empty states** | Custom illustration + descriptive text + action CTA |
| **Consistency** | MUI theme override ensures uniform components across all screens |

---

## Final Checklist

- [x] Screen 1: Available Files (list + process)
- [x] Screen 2: Processed Files (history)
- [x] Screen 3: Transaction List (detail per file)
- [x] Screen 4: Rejection Reason Modal
- [x] Screen 5: Edit Amount Modal
- [x] Sidebar navigation with active state
- [x] Mobile responsive (hamburger menu)
- [x] Loading, empty, error, and success states for all views
- [x] Client-side validation on amount edit
- [x] 10 Nielsen heuristics applied
- [x] Gestalt laws incorporated
- [x] WCAG 2.2 accessibility considerations
- [x] 8pt spacing system
- [x] Clean, minimal aesthetic
- [x] Consistent iconography (MUI Icons)
- [x] Hover, focus, active, disabled, and loading states
