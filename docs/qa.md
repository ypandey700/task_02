# QA evidence

Verified on 21 November 2026 with Playwright 1.65.1 and installed Chrome on Windows.

`npm test`: **5 unit tests and 7 browser tests passed**.

| Check | Result |
| --- | --- |
| Original five seed IDs | Preserved |
| Case-insensitive title/skill/location search | Pass |
| Multiple search terms and combined domain/work-mode filters | Pass |
| Empty result and clear filters | Pass; restores all five cards and focuses search |
| Request failure and retry | Pass; successful retry restores cards |
| Malformed data | Pass; error state shown |
| Loading announcement and busy state | Pass |
| Detail dialog opened with Enter | Pass |
| Dialog focus containment, Escape, trigger focus restoration | Pass |
| 360px viewport | One column, no horizontal overflow |
| 768px viewport | Two columns, no horizontal overflow |
| 1440px viewport | Three columns, no horizontal overflow |
| Browser JavaScript errors during viewport checks | None |

Screenshots were generated from the actual local application by the viewport tests in `tests/browser/board.spec.js`. Desktop and mobile screenshots were visually inspected. No full screen-reader or cross-browser audit was performed.

Two issues found during testing were fixed: duplicate input/change rendering could replace an empty-state button between pointer-down and click; native dialog focus behavior with a single control needed explicit Tab wrapping. Both have regression coverage.

Production application submissions, database persistence, and server-side validation are outside this frontend exercise and were not tested or claimed.
