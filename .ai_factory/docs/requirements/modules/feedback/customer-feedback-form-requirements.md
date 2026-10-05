# Customer Feedback Form Requirements

- Module: feedback
- Delivery iteration id: customer-feedback-form
- Delivery iteration title: Customer Feedback Form Submission
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Planned story ids: `feedback-public-link-resolution`, `feedback-link-expiry-rule`, `feedback-form-display`, `feedback-server-validation`, `feedback-record-update`, `feedback-repeat-submission-display`, `feedback-form-non-browser-verification`

## Scope

Implement the public customer feedback form reached from the unique feedback request link. The page shall resolve an existing `Feedback` record by its unique identifier, show the stored product name and purchase date from the uploaded purchase record, accept a 1 through 10 star rating and a feedback message up to 200 characters, and update the existing feedback table record on valid submit.

Out of scope for this iteration: authenticated dashboard changes, Feedback Request Excel upload changes, Configure behavior, creating new feedback request rows from the public form, changing welcome-email behavior, changing registration/profile consent, browser execution, Playwright execution, app server startup, deployment, publishing, and contacting real customers.

## Evidence

- Delivery scope for `customer-feedback-form` requires a public unique-link feedback form that resolves an existing feedback record by identifier.
- Delivery scope requires displaying product name and purchase date from the uploaded purchase record.
- Delivery scope requires accepting a 1-10 star rating and feedback message up to 200 characters, then updating the existing feedback table record on submit.
- Delivery scope requires safe handling for invalid, expired, and unknown identifiers.
- Delivery scope requires server-side validation of rating and message.
- Delivery scope requires a defined repeat submission rule and source-level tests for database updates.
- Prior planning preserved the story ids `feedback-public-link-resolution`, `feedback-link-expiry-rule`, `feedback-form-display`, `feedback-server-validation`, `feedback-record-update`, `feedback-repeat-submission-display`, and `feedback-form-non-browser-verification`.
- Recorded human decision defines feedback link validity as 30 days.
- Recorded human decision defines repeat visits after submission as showing the existing feedback.
- `prisma/schema.prisma` contains `FeedbackBatch` and `Feedback` models. `Feedback` includes `productName`, `purchaseDate`, unique `linkIdentifier`, nullable `rating`, nullable `feedbackMessage`, and nullable `submittedAt`.
- `src/features/feedback-request/email.ts` renders customer request links using `/feedback/{linkIdentifier}`.
- Current source has no public `/feedback` route yet; creating that route is delivery work for this iteration.
- Browser verification is not approved for this task run and shall remain pending/not run until a later approved controller run supplies evidence.

## Assumptions And Definitions

- "Public feedback link" means `/feedback/{identifier}`, where `{identifier}` is the existing `Feedback.linkIdentifier` value generated during the batch upload iteration.
- "Valid identifier" means a syntactically acceptable identifier that resolves to exactly one existing feedback row.
- "Unknown identifier" means a syntactically acceptable identifier that does not resolve to a feedback row.
- "Malformed identifier" means a missing, empty, overlong, or character-invalid identifier that should not be sent directly to unrestricted database lookup.
- "Expired link" means a feedback row whose age is greater than 30 days from the row creation timestamp, unless delivery adds a more explicit expiry timestamp.
- "Thirty days" means exactly 30 calendar days measured deterministically from feedback row creation time to the server-side current time.
- "Submitted feedback" means a feedback row with non-null `submittedAt`.
- "Repeat submission rule" means a submitted record is read-only to the customer: repeat visits show the existing rating and message, and repeat submit attempts do not change stored values.
- "Feedback message" means customer-provided text normalized by the server. The message is required in this iteration and must be 1 to 200 characters after trimming and normalization.
- "Safe unavailable state" means customer-facing copy that explains the form is unavailable without exposing internal ids, batch details, stack traces, database errors, admin user information, recipient email, or security-sensitive details.

## Story Requirements

### feedback-public-link-resolution

Create the public `/feedback/{identifier}` route that looks up an existing feedback record by its unique link identifier without requiring authentication.

Requirements:

- FCF-LINK-001: The application shall provide a public route matching `/feedback/{identifier}`.
- FCF-LINK-002: The route shall not require an Auth.js user session.
- FCF-LINK-003: The route shall validate the identifier shape before database lookup.
- FCF-LINK-004: The route shall look up feedback by `Feedback.linkIdentifier`, not by raw feedback id, batch id, email, or product code.
- FCF-LINK-005: A valid resolved feedback record shall expose only customer-form fields required for this iteration: product name, purchase date, current submission state, rating/message if already submitted, and a submit target or token as needed.
- FCF-LINK-006: Unknown, malformed, or missing identifiers shall render a safe unavailable state.
- FCF-LINK-007: The public page shall not expose internal batch metadata, admin user id, uploaded source file name, recipient email, database ids, stack traces, or provider details.
- FCF-LINK-008: Lookup behavior shall be covered by source-level tests or source checks.

Acceptance criteria:

- Given a customer opens `/feedback/{knownLinkIdentifier}`, when the identifier resolves to an existing feedback row, then the page can render the customer feedback experience.
- Given a customer opens `/feedback/{unknownIdentifier}`, then the page renders a safe unavailable state and does not disclose whether nearby identifiers exist.
- Given a customer opens `/feedback/` without an identifier, then the page renders or routes to a safe unavailable state.
- Given an identifier contains unsupported characters or is too long, then no unsafe lookup is performed and a safe unavailable state is shown.
- Given a valid row is loaded, then the response includes product/purchase/submission data only and omits internal batch/admin/database details.

Edge cases:

- Identifiers may include URL encoding or trailing slashes; routing should normalize or reject deterministically.
- Very long identifiers should be rejected before database lookup to avoid unnecessary work.
- Database lookup failures should produce safe customer-facing failure handling and server-side evidence appropriate for delivery review.
- Deleted batches or deleted feedback rows should behave like unavailable links.
- Public feedback pages must not redirect customers into the authenticated dashboard or registration flow.
- Link resolution should remain compatible with the `/feedback/{linkIdentifier}` URL contract already used by feedback request emails.

### feedback-link-expiry-rule

Apply the approved rule that customer feedback links remain valid for 30 days.

Requirements:

- FCF-EXPIRY-001: Feedback links shall remain valid for 30 days from the feedback row creation timestamp unless an explicit expiry timestamp is added during delivery.
- FCF-EXPIRY-002: Links older than 30 days shall be treated as expired.
- FCF-EXPIRY-003: Expired links shall not allow new feedback submission or modification.
- FCF-EXPIRY-004: Expired, unknown, and malformed identifiers shall have distinct internal states; customer-facing copy may remain intentionally safe and minimal.
- FCF-EXPIRY-005: Expiry calculation shall be performed server-side.
- FCF-EXPIRY-006: Expiry calculation shall be deterministic and testable with an injectable or parameterized current time.
- FCF-EXPIRY-007: Expiry handling shall not rely only on client-side time, browser state, or hidden form fields.

Acceptance criteria:

- Given a feedback row created 29 days ago, when the link is opened, then the form is still available if the row is otherwise valid and unsubmitted.
- Given a feedback row created exactly at the 30-day boundary, then delivery defines and tests whether the link remains valid through that instant or expires immediately after it.
- Given a feedback row older than 30 days, when the link is opened, then the page renders an expired/unavailable state.
- Given a feedback row older than 30 days, when a submit request is attempted directly, then the database record is not updated.
- Given source-level tests run expiry checks, then they can assert behavior without depending on wall-clock timing.

Edge cases:

- Time zone differences must not shift the expiry window unexpectedly for customers.
- System clock precision should be handled consistently at the boundary.
- A previously submitted but now expired record should show a safe read-only state only if delivery explicitly chooses to show submitted feedback after expiry; otherwise expiry takes precedence for public display.
- Backfilled feedback rows without `createdAt` are not expected because the schema defines `createdAt`; if encountered, they should fail safely.
- Expiry must be enforced on both page rendering and form submission.
- Client attempts to alter a hidden creation or expiry field must be ignored.

### feedback-form-display

Render the customer feedback form for valid, unexpired feedback requests.

Requirements:

- FCF-DISPLAY-001: A valid, unexpired, unsubmitted feedback row shall render a public feedback form.
- FCF-DISPLAY-002: The form shall display `productName` from the resolved feedback row.
- FCF-DISPLAY-003: The form shall display `purchaseDate` from the resolved feedback row in a clear date-only format.
- FCF-DISPLAY-004: The form shall present rating as a 1 through 10 star scale.
- FCF-DISPLAY-005: The form shall provide a feedback message textarea.
- FCF-DISPLAY-006: The textarea shall communicate or enforce a 200 character limit as a client convenience.
- FCF-DISPLAY-007: The page shall remain usable without an authenticated session.
- FCF-DISPLAY-008: Customer-facing display shall escape product names and feedback content to prevent script injection.
- FCF-DISPLAY-009: Missing or unexpectedly blank product fields shall not crash the page; delivery shall use a safe fallback or unavailable state.
- FCF-DISPLAY-010: The public form shall not show admin dashboard navigation, admin identity controls, or upload controls.

Acceptance criteria:

- Given a valid unsubmitted feedback link, then the page shows the product name, purchase date, rating control, message textarea, and submit action.
- Given `productName` contains special HTML characters, then the page displays it as text rather than executing markup.
- Given the purchase date is stored with time information, then the displayed customer date remains the intended purchase calendar date.
- Given the customer is not signed in, then the form can still be viewed and submitted if the link is valid and unexpired.
- Given optional styling or client-side scripts fail, then server-side validation still protects the submission path.

Edge cases:

- Long product names should wrap without covering rating or submit controls.
- The 10-star scale should remain understandable and keyboard accessible.
- A customer may reload the page before submitting; no database update should occur until valid submit.
- Browser autofill or pasted text may exceed the visible textarea limit; server validation remains authoritative.
- Mobile layout must not rely on dashboard shell styles that are unavailable on the public route.
- Public page metadata should avoid exposing recipient email or internal identifiers.

### feedback-server-validation

Validate all submitted feedback values on the server before updating the feedback record.

Requirements:

- FCF-VALID-001: The submit handler shall resolve the feedback row server-side by identifier.
- FCF-VALID-002: The submit handler shall re-check identifier validity, link expiry, and submission state before validating the payload.
- FCF-VALID-003: Rating shall be required.
- FCF-VALID-004: Rating shall be an integer from 1 through 10.
- FCF-VALID-005: Non-integer, decimal, blank, negative, zero, and greater-than-10 ratings shall be rejected.
- FCF-VALID-006: Feedback message shall be required.
- FCF-VALID-007: Feedback message shall be trimmed or normalized server-side before persistence.
- FCF-VALID-008: Feedback message shall be at most 200 characters after normalization.
- FCF-VALID-009: Empty or whitespace-only feedback messages shall be rejected.
- FCF-VALID-010: Invalid submissions shall return useful form errors without updating the database.
- FCF-VALID-011: Client-side attributes and hidden fields shall be treated as convenience only and not trusted.
- FCF-VALID-012: Validation errors shall not expose database ids, stack traces, secrets, or internal query details.

Acceptance criteria:

- Given rating `1`, then rating validation passes when the message is valid.
- Given rating `10`, then rating validation passes when the message is valid.
- Given rating `0`, `11`, `5.5`, blank, or non-numeric text, then validation fails and no update occurs.
- Given a message with 200 normalized characters, then validation passes with a valid rating.
- Given a message with 201 normalized characters, then validation fails and no update occurs.
- Given a whitespace-only message, then validation fails and no update occurs.
- Given a direct POST for an expired, unknown, malformed, or already-submitted identifier, then the database record is not updated.

Edge cases:

- Multi-byte characters and line breaks should be counted consistently by the chosen implementation rule.
- Leading and trailing whitespace should not allow an otherwise empty message.
- Duplicate form submissions from repeat clicks should not bypass already-submitted checks.
- Tampered product name, purchase date, email, batch id, or link identifier fields in the payload must be ignored.
- Malformed form data should produce field-level or form-level errors, not a server crash.
- Validation should be covered independently from visual browser behavior.

### feedback-record-update

Persist a valid customer response to the existing feedback table row.

Requirements:

- FCF-UPDATE-001: A valid submit shall update the existing resolved `Feedback` row.
- FCF-UPDATE-002: The update shall store `rating`.
- FCF-UPDATE-003: The update shall store normalized `feedbackMessage`.
- FCF-UPDATE-004: The update shall set `submittedAt` to the server-side submission time.
- FCF-UPDATE-005: The public submit path shall not overwrite `email`, `type`, `productCode`, `productName`, `purchaseDate`, `batchId`, `linkIdentifier`, or email delivery status fields.
- FCF-UPDATE-006: The update shall be atomic and protected by a condition that prevents changing an already-submitted record where feasible.
- FCF-UPDATE-007: Successful submission shall show confirmation to the customer.
- FCF-UPDATE-008: Database update behavior shall be covered by source-level tests using a safe test strategy.

Acceptance criteria:

- Given a valid unexpired unsubmitted feedback row, when the customer submits rating `8` and a valid message, then only `rating`, `feedbackMessage`, `submittedAt`, and normal update timestamp fields change.
- Given the payload includes tampered product or email fields, then those stored fields remain unchanged.
- Given the database update succeeds, then the customer sees a confirmation or submitted state.
- Given the database update fails, then the customer sees a safe failure state and no success is claimed.
- Given two valid submits arrive close together for the same unsubmitted row, then only one final accepted submission is persisted according to the repeat-submission rule.

Edge cases:

- Normal repeat clicks may send the same request more than once; the implementation should not create duplicate records.
- `submittedAt` should come from the server, not the client.
- Audit-sensitive original upload context must remain immutable from the public form.
- A transaction or conditional update should prevent stale "unsubmitted" reads from allowing overwrites.
- Customers should not need a login session to persist a valid linked response.
- A deleted or expired row during submission should fail safely.

### feedback-repeat-submission-display

Implement the approved repeat-submission rule: after feedback has already been submitted, repeat visits show the existing feedback instead of allowing a new edit.

Requirements:

- FCF-REPEAT-001: A feedback row with non-null `submittedAt` shall render a submitted/read-only state on repeat visits.
- FCF-REPEAT-002: The submitted/read-only state shall display the existing rating safely.
- FCF-REPEAT-003: The submitted/read-only state shall display the existing feedback message safely.
- FCF-REPEAT-004: The submitted/read-only state shall not render an enabled edit or resubmit control.
- FCF-REPEAT-005: Direct submit attempts for an already-submitted row shall be rejected or ignored without changing stored values.
- FCF-REPEAT-006: Repeat-submission behavior shall be enforced server-side, not only through disabled UI controls.
- FCF-REPEAT-007: Repeat-submission behavior shall be covered by source-level tests.

Acceptance criteria:

- Given a submitted feedback row, when the customer opens the link again, then the existing rating and message are shown read-only.
- Given a submitted feedback row, when a direct submit attempts a different rating or message, then the stored rating, message, and original `submittedAt` do not change.
- Given existing feedback message contains special HTML characters, then the read-only display escapes it.
- Given a submitted feedback row is also older than 30 days, then the implementation follows the documented precedence between expired and submitted display states.
- Given source-level tests cover repeat submissions, then they assert no stored values are overwritten.

Edge cases:

- Some legacy submitted rows might have `submittedAt` but missing rating or message; display should fail safely.
- A customer may submit and immediately refresh; the refreshed page should show the submitted/read-only state.
- Concurrent second submit should not race into an overwrite.
- The read-only page should avoid exposing recipient email and internal batch data.
- The read-only state should not imply that support staff will respond unless that workflow exists.
- Browser back-button resubmission should not update existing submitted values.

### feedback-form-non-browser-verification

Add focused non-browser verification for the public feedback form iteration.

Requirements:

- FCF-VERIFY-001: Verification in this Codex task run shall not launch browsers, run Playwright, run `test:e2e`, or start a temporary application server.
- FCF-VERIFY-002: TypeScript verification shall use `npx.cmd tsc --noEmit --incremental false`.
- FCF-VERIFY-003: Prisma validation shall use `npx.cmd prisma validate` if schema or persistence code is involved.
- FCF-VERIFY-004: Lint verification shall use `npm.cmd run lint` if the script remains available.
- FCF-VERIFY-005: Source-level tests shall cover unknown identifiers, malformed identifiers, expired identifiers, valid form display data, rating bounds, message length, successful database update behavior, and repeat-submission display.
- FCF-VERIFY-006: Source-level tests shall not contact Gmail, external providers, browsers, or real customer recipients.
- FCF-VERIFY-007: Verification evidence shall record each command run and the exact failure for any blocker.
- FCF-VERIFY-008: Browser verification shall be reported as pending/not run for this restricted run, never as passed without controller evidence.

Acceptance criteria:

- Given Prisma validation is run, then the result records success or the exact Prisma failure.
- Given TypeScript verification is run, then the result records success or the exact compiler failure.
- Given lint verification is run, then the result records success or the exact lint failure.
- Given source-level tests are run, then their pass/fail count is recorded without claiming unexecuted tests passed.
- Given a browser, Playwright, app server, or page setup failure occurs in another context, then it is classified as an environment blocker rather than an application defect.
- Given this analysis task completes, then it does not claim delivery tests passed because no delivery tests were run.

Edge cases:

- A stalled command should not be repeatedly retried.
- PowerShell `.ps1` shims shall not be used for Node package commands.
- TypeScript verification should disable incremental output to avoid writing build-info cache in restricted workspaces.
- Production build verification is not required for each iteration under recorded process decision and should not be claimed unless explicitly run.
- Test fixtures must avoid real customer data and real Gmail credentials.
- Browser coverage remains pending until a controller-approved run executes it.

## Cross-Story Rules

- Preserve planned story ids exactly: `feedback-public-link-resolution`, `feedback-link-expiry-rule`, `feedback-form-display`, `feedback-server-validation`, `feedback-record-update`, `feedback-repeat-submission-display`, and `feedback-form-non-browser-verification`.
- Do not edit test-design artifacts from this business-analysis task.
- Keep this iteration focused on the public customer feedback form, identifier lookup, 30-day expiry, form rendering, server validation, record update, repeat-submission read-only display, and non-browser verification.
- Do not create new feedback request rows from the public form; valid submissions update only an existing feedback row resolved by link identifier.
- Do not require customer authentication for public linked feedback submission.
- Enforce link expiry, submission state, identifier resolution, rating validation, and message validation on the server.
- The canonical repeat-submission rule is read-only display of the existing feedback after submission.
- The canonical expiry rule is 30 days from feedback row creation unless delivery adds and consistently uses an explicit expiry timestamp.
- Do not expose recipient email, admin user data, batch metadata, OAuth tokens, session tokens, database connection strings, provider secrets, Gmail credentials, raw SMTP transcripts, or auth secrets in public UI, errors, logs, requirement examples, or verification evidence.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, publishing, and real email delivery remain out of scope for this task run unless separately approved by the controller.
