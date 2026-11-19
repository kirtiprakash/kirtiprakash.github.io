# ClaimWeave 3.0 | Expense evidence reconciler

**An independent prototype, not an official ARU or Business World application.** Its output is intended as a *supporting evidence pack*. It does not submit expenses, interpret university policy, authenticate an approver or prove a payment took place.

The app runs on a static site at `https://kirtiprakash.github.io/tools/claimweave/`. All documents are processed locally in browser memory; the app defines no file-upload API and keeps no personal claim data in browser storage or GitHub. The browser downloads pinned third-party libraries for PDF parsing, PDFs, MSG/EML and optional OCR. Use only with your institution's approval for confidential financial or email data. Offline capabilities are best-effort after the necessary libraries have been cached; **a fresh/offline install cannot guarantee PDF export or MSG parsing**.

## Release sequence

### v1.1: submission integrity
- Two modes: a clearly marked **DRAFT** PDF (may contain incomplete expenses) and a **submission-ready** PDF blocked by missing amounts, unreconciled FX values, missing linked evidence and unverified expense lines.
- Full review log. No more cover sheet showing only two of several warnings.
- Early £0.00 claims are blocked. Original cost, GBP claim and FX basis must be entered and each reimbursable line manually verified.
- Compact cover/index: no empty divider page for every item. Source invoice/receipt PDFs are copied unmodified as PDF pages.

### v1.2: searchable, accessible PDFs
- The cover, index, review log and English-language email text are composed as native, selectable PDF text using pdf-lib.
- The original PDF page content is preserved. Images are embedded directly rather than being redrawn as lossy JPEG pages.
- PDF bookmarks are added on a best-effort basis using the document outline API.
- Non-Latin lines can be printed with a browser-supplied, suitable **.ttf/.otf Unicode font**; without a suitable font, unsupported glyphs are rendered as images to avoid corruption. **Those fallback lines are not searchable.**
- Optional, explicit download of an evidence manifest with source SHA-256, associations and review items.

### v2.0: reconciliation and document intelligence
- Transparent, deterministic classification: Receipt, Invoice, Statement, Exchange rate, Payment proof, Approval, Booking/Ticket and Correspondence.
- Amount/date/currency suggestions are explicitly unverified, with support for Chinese invoice markers, Chinese/English dates, and RMB/CNY/GBP cases.
- User-confirmed document linking, exact-file SHA-256 duplicates, repeated invoice-number alerts, candidate amount matches and potential duplicate expense flags.
- Sum-to-statement suggestions (e.g., **CNY 1,605 + CNY 1,600 = CNY 3,205**) with **no automatic merging or double-counting**.

### v2.1: correspondence and multilingual evidence
- Positive approval phrases in imported/pasted email threads are surfaced as **candidates**, not authoritative verification. Users may mark them reviewed.
- User-reviewed candidate approval text appears near the corresponding email evidence in the output.
- Optional on-device OCR (English + Simplified Chinese) for image files and up to the first two pages of image-only PDFs, using pinned Tesseract.js and downloaded language data. Image OCR values require manual checking.
- Original text/PDF is preserved; no machine-generated translations are introduced.
- Manual currency conversion and source/date details, and a conservative ARU/BW information checklist, without claiming to enforce official exchange-rate rules or attachment limits.

### v3.0: privacy, provenance and offline resilience
- Passphrase-protected, **AES-256-GCM** encrypted case save and restore, including original file bytes, using PBKDF2-SHA256 (310,000 iterations). Minimum 12-character passphrase. **No account reset or passphrase recovery.**
- SHA-256 manifest of original evidence. Optional incidental email-contact redaction in *generated email pages*; it does **not** redact original PDF/image pages or the encrypted working file. Generated PDF does not embed the raw original MSG/EML binary; keep the encrypted case for provenance.
- Local service worker caches the application shell and attempts to cache pinned PDF dependencies after an online load. Some dynamic MSG/EML/OCR dependencies may still require access to a CDN on first use or after cache eviction.
- The core deterministic validation/reconciliation and case encryption functions have no network dependencies and are regression-tested in Node.

## How to use

1. Open the site via **HTTPS** (required for encrypted cases and SHA-256 hashes). Add receipts, invoices, scanned images, emails and exchange-rate evidence. The email copy/paste tool is provided for Outlook issues.
2. Inspect each document's category, amount/currency suggestions and any OCR text. Treat these as candidate observations, not verified facts.
3. Create one expense line **per actual reimbursable charge**, not one line per document. Link related statements, approval emails and FX screenshots as supporting evidence, rather than creating duplicate expenses.
4. Complete amount, original currency, GBP claim, rate reference/date, business reason, and confirm each expense is distinct. Review all approval suggestions against the original email.
5. Use **Download watermarked draft** at any point. The submission-ready button is available only when blocking errors have been resolved. It may still present non-blocking matters to review.
6. Review the completed PDF and confirm relevant employer-specific policies. When needed, save an encrypted `.cwc` working case, retain its passphrase separately, and download the JSON evidence manifest.

## Security and limitations

- **Do not publish real expenses or personal emails in GitHub issues, PRs, Pages or source-control history.** This repository contains source code and synthetic tests only.
- The PDF and email libraries are loaded from pinned third-party URLs. The app has **not** completed an independent university security audit. Under institutional policy, production deployment should vendor and integrity-pin the dependencies, implement an appropriate Content Security Policy, and conduct a privacy/security review.
- Offline after warmup is best effort, not guaranteed. Do not interpret the green network indicator as evidence that all dependencies work offline.
- Document extraction and categorisation are heuristic, not accounting/financial validation. BW input fields, account codes, per-attachment limits, HR/Finance rules, exchange-rate policy and evidence acceptance criteria are not automatically verified.
- OCR may misread decimal places, invoice numbers and dates. Images and scanned PDFs need manual checks. Source PDFs and unredacted original evidence may still contain contact details even if the derived email copy is redacted.
- ClaimWeave does not prove that payment occurred. Supporting emails referring to future cash payments are not equivalent to payment confirmation.

## Tests

```bash
node --test tools/claimweave/tests/*.cjs
```

Browser smoke tests (requires Python, Playwright and Chromium) can be run locally after installing optional dependencies. They use **synthetic** receipts, not user data. A real browser run against pinned PDF/MSG/OCR libraries should be performed before institutional production use.

## Sources and dependencies

- [pdf-lib](https://github.com/Hopding/pdf-lib) `1.17.1` (MIT)
- [PDF.js](https://mozilla.github.io/pdf.js/) `3.11.174` (Apache 2.0)
- [@pdf-lib/fontkit](https://www.npmjs.com/package/@pdf-lib/fontkit) `1.1.1` (MIT)
- [postal-mime](https://github.com/postalsys/postal-mime) `2.7.4` (MIT)
- [@kenjiuno/msgreader](https://www.npmjs.com/package/@kenjiuno/msgreader) `1.28.0` (MIT)
- [Tesseract.js](https://github.com/naptha/tesseract.js) `5.1.1` (Apache 2.0), loaded only when the user requests OCR.

No real user receipts or email attachments are bundled.
