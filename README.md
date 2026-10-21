# HER VOICE 

## Automatic workspace updates

The sidebar's Refresh workspace button has been removed. Visible dashboards, case lists, open-case status/messages, community feeds and sharing-consent panels update in the background every 15 seconds and when the window regains focus or visibility. Expanded community comments update every 30 seconds. Hidden tabs do not make polling requests. Updates are periodic API reads, not page reloads or server-pushed notifications.

Background requests do not overlap or apply data after page/session changes. They pause during foreground actions, preserve unsent messages, notes, searches and dirty sharing-summary forms, and do not display the blocking Working indicator. A changed sharing draft resets consent/privacy checkboxes. Existing API authorization remains enforced for every request.

Verification: production build and whitespace checks passed. A separate fictional-data browser check confirmed the sidebar button was absent and an open reporter case picked up both a new reviewer message and a status change automatically while preserving the typed, unsent message. No reload or navigation occurred during that check. Temporary preview servers were stopped and the fictional test database was retained.

## Consultant titles and problem-based assignment

The authorization roles remain reporter, reviewer, consultant and admin. Consultants now have a separate support title: General consultant, Support worker, Counselor, Organization representative, Police liaison, Legal advisor, Health specialist, Shelter coordinator or Other specialist. Administrators can also record an organization/team and the report categories each consultant supports. These are descriptive internal profiles, not verification of professional credentials or external agency integration.

In **Admin → Add Staff**, choose Human consultant to configure the title and supported categories. Existing consultants have **Edit consultant specialty** in the account list. Older accounts and clients without specialty settings retain the general-consultant/all-category defaults. Profile edits preserve existing assignments; future assignments must match the current supported categories.

In an accepted case, the assigned reviewer selects an active consultant supporting that case category. The selector displays name, title and organization; the backend independently rejects mismatched assignments. Assigned consultant details appear in case details and consultant titles appear on their dashboard/account chip. All consultants, including police/organization titles, can access only accepted cases assigned to them. No outside organization or police service is automatically contacted, and no new accounts or existing staff specialties are changed by installation.

Verification: **238 API assertions passed**, including titles, category validation, admin-only profile changes, invitation persistence, mismatch rejection, retained existing assignments, assigned-only private access and reporter-visible specialist details. Production build passed. Browser checks used a separate fictional database and covered admin title/category controls and a reviewer assigning the matching counselor. The preview screenshot contains fictional data; temporary preview servers are stopped after verification and test databases are retained.

## Assistant layout and sidebar fit

AI Consultant now uses a dedicated chat layout with topic cards, quick questions, a case-team shortcut, a message composer with a 500-character counter, Enter-to-send / Shift+Enter newline, and clear-conversation control. Replies remain predefined and status results remain restricted to the current reporter's cases. Questions, including suggested questions, remain in the composer if a request fails. The interface clearly identifies the offline assistant and its limits.

Desktop sidebar spacing now fits the navigation into the viewport without a separate internal scroller. Decorative text is omitted on shorter screens. Very short desktop windows use document scrolling so navigation is not clipped; mobile navigation retains its existing horizontal layout.

Verification: frontend production build passed. Browser checks in a separate fictional database covered status suggestions, authorized report-action navigation, conversation retention between pages, keyboard submission, privacy replies and clear conversation. A desktop screenshot confirms all reporter navigation buttons including Logout fit without a sidebar scrollbar. The screenshot uses fictional data; temporary preview servers are stopped and the test database is retained. Broad device/accessibility checks were not repeated.

## Dashboard refresh and Community Posts navigation

Community Posts now has a dedicated feed layout with a welcome banner, category chips, keyword search, expandable lessons and recommendations, a privacy sidebar, and separate My advice / moderation / team-permission sections. Approved comments and the optional anonymous advice composer expand within each post. Pending advice is visible in the reporter's contribution history and remains absent from approved comments.

Latest community UI verification: production build passed. Browser checks covered category filtering, approved-comment expansion, anonymous advice submission into pending moderation, pending/approved contribution history, and expandable guidance/privacy disclosures. Populated-feed checks used only a separate `her_voice_ui_<timestamp>` MongoDB database and temporary preview servers; no existing case was published or modified. The preview screenshot contains fictional data. Test data is retained; the preview servers are stopped after verification. Broad device and accessibility testing remains outstanding.

All four dashboards now use a shared welcome panel and clear actions for their roles. Reporter, reviewer and consultant overviews show actual accessible-case totals, clarification counts, active cases and closed cases. Reviewer queues and assigned caseload shortcuts, reporter conversation/guidance cards and consultant support cards link to existing actions. Administrators have account search, role filters, staff setup and a moderation shortcut.

Case tables and the full reports workspace support keyword search, status filters and newest/oldest sorting. Search applies to the displayed list; the reporter dashboard shows the five most recent reports and the full list is available through View all. Counts reflect the records returned by existing APIs and their existing list limits.

Home navigation now includes **Community Posts**, plus a community callout. Signed-out visitors are asked to sign in and return to the posts after authentication. The community feed uses post cards with category, sanitized content and comment forms. Only already-approved, consented summaries are displayed; pending comments retain moderation. No private case is automatically published by the redesign.

Verification for this UI refresh: production build passed; browser checks covered Home → Community Posts → sign-in → posts, administrator dashboard rendering, and account search/empty state. Existing backend permissions and moderation APIs were preserved. A full browser journey for every role and a broad device/accessibility audit were not repeated.

## Verified Reports & Community Advice (current workflow)

Open **Community Advice** in the signed-in sidebar (`/community`). The library contains only separate sanitized summaries explicitly approved for sharing. Case acceptance, review or closure never publishes a case. “Verified” indicates a sharing review, not proof of an allegation.

1. The assigned reviewer accepts a fictional case and writes four separate fields under **Optional community sharing** in report details: sanitized summary, generalized situation, lessons and recommendations. Remove names, contact information, locations, dates, institutions and indirect identifying combinations. Private report text is never automatically copied.
2. The report owner reads that exact version in their report details and optionally grants consent. Consent is separate from report submission and case support.
3. The assigned reviewer performs separate privacy and indirect-identifier checks and explicitly publishes. Missing consent or privacy approval keeps the summary private. Any edit unpublishes and invalidates prior consent and privacy approval. The owner may withdraw consent to unpublish. Previously saved or read copies cannot be recalled.
4. Authenticated reporters submit constructive advice using an invented alias or Anonymous. All comments await moderation. Contact details, links, common abusive phrases and identifier patterns are rejected; these checks supplement mandatory human review and cannot reliably detect all indirect identification or abuse.
5. Administrators moderate without access to private case content and can grant or revoke community moderation permission for reviewers on the community page. Moderators review privacy and conduct before approving advice, or remove it. Reporting a published comment hides it immediately for a new review. Comments are bound to a summary version, so comments on an earlier version do not appear on a revised summary.

Private report links, ownership, consent and reviewer records are stored separately from the allowlisted community API representation. Public comment responses contain only independent comment ID, alias and text. Account linkage is retained privately for moderation; complete anonymity is not promised. Search operates on sanitized fields only. All community endpoints require authentication. General community access does not grant private case access.

**This workflow supersedes the earlier consultant shared accepted-case queue:** consultants can read and modify only accepted cases assigned to them. They may read approved community guidance. Reviewers retain all-report review access and assignment-based private conversations. Administrators manage accounts and comment permissions without private report access.

Validation: `npm test` in backend includes the existing journey plus community privacy/consent/moderation tests using a separate fictional MongoDB database. `npm run build` in frontend validates the production bundle. Test databases are retained. Use fictional information only; human review, operational safeguarding and deployment security remain necessary for real-world use.

Latest verification: **198 API assertions passed**, plus database, privacy, CORS, rate-limit and restart checks; frontend production build passed. Browser checks covered administrator sign-in, community navigation, privacy notice, filters and the empty library/moderation states at a narrow viewport. The complete publication/consent/comment lifecycle was tested through HTTP, not a full multi-role browser suite. The local backend was restarted with the new routes. No existing case was published and no existing user's moderation permissions were changed for the browser checks.

React + Vite frontend, Express + MongoDB backend. Includes reporter registration and login, private profile codes, reporter-owned reports, reviewer claim/verification flow, private report-based messaging, consultant assignment and internal notes, admin staff creation, and an **offline predefined-response assistant** (not a real AI integration).

**SAFETY:** Use fictional data only. This code is **NOT** production ready for confidential or urgent reporting. Before deploying for real users, obtain safeguarding and security reviews, plan moderation and escalation, consent, privacy disclosures, secure session handling, audit logs, encryption, retention and deletion, and abuse prevention. Reviewer clarification cannot determine truth with certainty. No emergency guarantees. Do not store real personal data in this prototype.

## Install on Windows

1. Install Node.js 22.12+ or 24 LTS, Git, MongoDB Community Server and optionally MongoDB Compass.
2. Extract ZIP. Open the `Her Voice` folder in VS Code.
3. Make sure local MongoDB is running; Compass can connect to `mongodb://127.0.0.1:27017`.
4. Terminal 1:
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```
   Edit `.env`: choose a **unique random JWT_SECRET of 32+ characters** and a **unique ADMIN_PASSWORD of 8+ characters**. Keep `MONGO_URI=mongodb://127.0.0.1:27017/her_voice_demo`.
   ```powershell
   npm install
   npm run seed:admin
   npm run dev
   ```
5. Terminal 2 (from the project root):
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
6. Visit `http://localhost:5173`. Use Register for a fictional reporter. Login using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from backend/.env to access admin and create reviewer and consultant users.
7. Test: Reporter registration â†’ submit fictional report â†’ administrator adds reviewer and consultant â†’ reviewer logs in and claims unassigned report â†’ reviewer messages reporter and assigns consultant â†’ reporter logs in and reads messages â†’ consultant sees assigned case â†’ reporter tries predefined AI chat.

## Privacy-oriented design notes

* Backend derives report owner from verified login token, never from a client-supplied code.
* Private profile code is an identifier, NOT authentication; access requires a logged-in account.
* Reviewers must explicitly claim cases. Staff can see only assigned reports, and admin cannot read report contents via these routes.
* Messages belong to a report and require authorization. Reporters cannot see consultant internal notes.
* AI chat returns fixed, canned answers only. It is a classroom UI demonstration; no AI API is configured.
* For real systems, replace localStorage-less in-memory tokens with carefully designed secure auth/session management and implement comprehensive security and safeguarding testing.


## Verified local run — 21 October 2026

Node 24.19.0 and the running Windows MongoDB service were available. Both npm installations completed and each reported zero known vulnerabilities at installation time. React production build passed. Backend dev server and frontend dev server started; HTTP health returned `ok: true, database: connected`; frontend returned HTTP 200. The existing logo rendered in the browser. Colors and logo were preserved; fonts now use local fallbacks without sending requests to Google Fonts.

The local `backend/.env` was created with a random JWT secret and administrator password, and `frontend/.env` with the local API URL. Existing env files are never overwritten. Read `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your local backend/.env to sign in. Do not share that file. Passwords must contain at least 8 characters and at most 72 UTF-8 bytes (bcrypt's input limit). Tokens expire after two hours and stay in memory; refresh requires login again.

### Exact commands from this workspace

Terminal 1:
```powershell
Set-Location 'C:\Users\Admin\Downloads\Her Voice\backend'
npm install
# On a fresh copy only, if .env does not exist:
# Copy-Item .env.example .env
# Replace both placeholder secrets before continuing.
npm run seed:admin
npm run dev
```

Terminal 2:
```powershell
Set-Location 'C:\Users\Admin\Downloads\Her Voice\frontend'
npm install
npm run dev
```
Open http://localhost:5173 or http://127.0.0.1:5173; both are explicitly allowed in the example/local CORS configuration. API: http://localhost:5000/api. Backend binds only to loopback. If port 5000 or 5173 is occupied, stop the other demo server with Ctrl+C; use consistent ports in env files. If npm is configured offline, use `npm install --offline=false`. Node watch mode and Vite build need permission to spawn processes in restricted agent environments; ordinary Windows terminals are not subject to that agent restriction. `npm start` runs the backend without watch mode.

### Repeatable integration tests
```powershell
Set-Location 'C:\Users\Admin\Downloads\Her Voice\backend'
npm test
Set-Location '..\frontend'
npm run build
```
The test uses port 5099 and creates a separate `her_voice_test_<timestamp>` database on local MongoDB with fictional example.test accounts and random credentials. It never wipes or modifies the demo database. Test databases are retained to avoid deleting data; manage those separately in Compass if desired. No reports or personal information are sent to external services.

All 13 requested journey steps passed through real HTTP endpoints and MongoDB: registration, reporter login, report submission, direct database save confirmation, reviewer login, claim/read, reviewer message, reporter reply, consultant assignment, consultant assigned-case access, consultant status update, reporter updated-status read, and server restart with report/status/messages still present. Administrator login/staff creation also passed. Total: 42 API assertions plus database, CORS, malformed JSON, privacy, rate-limit and restart assertions. Security checks deny unauthenticated access, other reporter access, unassigned reviewer/consultant access, admin report/message reads, reporter staff creation and reporter status changes. Notes are absent from both reporter list and detail responses. Invalid fields, invalid tokens and overlong bcrypt inputs are rejected.

Initial command failures were environment restrictions (npm cache-only mode and child-process EPERM); reruns with network/subprocess permissions passed. No failing assertions remained. No automated browser test suite was present. Only homepage browser rendering was checked; the full role journey was tested at API level. Broad browser/device, keyboard, screen-reader and mobile visual QA remain outstanding. Do not interpret the build or API checks as certification of all frontend interactions.

## Changes and remaining review

Changed source files: backend/src/server.js, backend/src/createAdmin.js, backend/.env.example, backend/package.json, frontend/src/App.jsx, frontend/src/style.css, .gitignore, README.md. Added backend/tests/journey.mjs and both package-lock.json files; created ignored local backend/.env and frontend/.env configuration.

Fixed reporter-list disclosure of internal notes; bcrypt truncation acceptance; placeholder secret acceptance; malformed JSON/oversized body errors; non-JSON missing-route/rate-limit errors; database-blind health status; staff home-button blank navigation; nested request/loading handling; retained private UI data across logouts; unlabeled message/note fields; long-text wrapping and focus indicators. Added visible loading feedback and guarded duplicate actions, consultant status controls, and disabled messaging before reviewer assignment. Internal notes remain staff-only. Case assignment is restricted to the assigned reviewer; unassigned-case queue exposes metadata only. No commit or push was made.

Before any real-world use, obtain professional safeguarding and security reviews. Remaining work includes consent and escalation procedures, incident response, moderation, audit logs, secure token revocation/session design, authenticated/encrypted MongoDB and backups, retention/deletion policy, account recovery, per-user/distributed abuse controls, pagination beyond current list limits, concurrent reassignment/write review, and an independent penetration/accessibility assessment. Rate limits currently share one process's memory and reset on restart. Existing bearer tokens cannot be individually revoked. The account list exposes emails to administrators for classroom account management. The canned assistant is not counseling or a live AI service. Use fictional data only.
## Dashboard design and source organization

The interface now follows the supplied dashboard showcase: navy sidebar, lavender background, purple active navigation, pastel status cards, report table, and messaging/assistant panels. The existing hijabi woman logo is preserved. Core CSS variables in `frontend/src/style.css` are purple `#6C4AB6`, lavender `#F3EDFF`, pink `#E9D5E8`, navy `#263248`, background `#FAF9FD`, and teal `#287D72`. Additional soft blue, pink and green tints distinguish status cards.

All eleven requested page files are in `frontend/src/pages`. Shared navigation, report cards and private messages are in `frontend/src/components`, alongside dashboard summary/table components. `context/AuthContext.jsx` owns the in-memory user/token; `lib/api.js` is the shared API client. `App.jsx` coordinates navigation and case actions.

Backend models are in `backend/src/models`, routes in `backend/src/routes`, authentication in `backend/src/middleware/authMiddleware.js`, and shared serializers/authorization helpers in `backend/src/utils/helpers.js`. `models.js` retains compatibility exports for seeding/tests. API URLs and access rules are preserved.

After reorganization, the fictional MongoDB journey passed all 42 API assertions. Browser verification covered reporter registration, dashboard counts, fictional report submission, the report table, details and disabled messaging before assignment. The UI shows actual account data, not the example names/counts in the reference image. No real report was used.


### Local frontend port changes

The frontend now uses `VITE_API_URL=/api` and Vite proxies `/api` to `http://127.0.0.1:5000`. This works when Vite selects 5174 because 5173 is occupied, without allowing arbitrary CORS origins. Restart Vite after changing `.env`, then reload the page. Both the backend and MongoDB must remain running. The proxy also applies to `npm run preview`; production hosting must configure an equivalent `/api` reverse proxy or a separately configured API URL and explicit allowed origin.


### Illustrated home page

The home page follows the supplied Stronger Tomorrow reference with a lavender hero, purple calls to action, four feature cards, a four-step process, and About, Resources and Support sections. Public navigation links scroll to working sections. No unverified usage statistics or safety guarantees are shown. The original logo is preserved. Home-specific styling is in `frontend/src/home.css`. The hero asset is `frontend/public/home-hero.png`, generated with the built-in imagegen tool. Prompt: polished editorial digital painting of a woman with warm brown skin in a lavender hijab and navy modest clothing looking hopefully upward to the right, pastel lavender botanical garden and distant city, warm peach light, left side pale negative space, no text, logos or interface.


### Account creation and staff invitations

Public registration always creates a reporter and an automatic unique profile code; there is no public role selector. New passwords require at least 8 characters and at most 72 UTF-8 bytes. Registration and invitation setup include confirmation and a show/hide control. All roles use the normal Login page and open the appropriate dashboard.

Only an authenticated administrator can create reviewer/consultant invitations in Manage Staff → Add Staff. Staff passwords are set by the invitee, not by the administrator. Pending accounts cannot log in or appear in the assignable consultant list. Invitations use 32 random bytes, store only a SHA-256 token hash in MongoDB, expire in 24 hours, and are consumed atomically once. Re-inviting a pending account invalidates the old link. No route can create administrator invitations. Existing active accounts cannot be overwritten by this workflow.

Local mode is configured in backend/.env with `INVITATION_DELIVERY=local`. The administrator sees a private password-setup link; **no email is sent**. Treat the link as a credential. The browser captures the fragment token into memory and removes it from the address bar. Open invitations in a separate tab so the administrator's workspace stays available. `PUBLIC_FRONTEND_URL` must match a running frontend address (default http://localhost:5173).

To enable delivery, configure `INVITATION_DELIVERY=smtp`, `SMTP_HOST`, `SMTP_PORT` (normally 587), `SMTP_SECURE` (true for port 465), `SMTP_FROM`, and optionally `SMTP_USER`/`SMTP_PASSWORD` in backend/.env, then restart the backend. SMTP requires TLS; delivery failures are reported and the account stays pending for re-invitation. SMTP delivery has not been verified against a real mail provider because no provider credentials are configured. Tests use local invitations and fictional addresses only.

The first administrator is created by `npm run seed:admin` using the ignored backend/.env credentials. An existing matching account is preserved. If another administrator already exists, the script refuses additional admin creation unless the local operator explicitly sets `$env:ALLOW_ADDITIONAL_ADMIN='true'` for that setup command; remove that environment variable afterward. This is a trusted local operator process, not a public endpoint. The requested local administrator was created and its login/role were verified; its password is not recorded in source or this README. Existing demo accounts were preserved.

Home portrait positioning was adjusted to separate the face from the information cards. The professional Login and Register pages reuse the local hero illustration, with isolated styles in frontend/src/auth.css and a shared AuthForm component.

Latest account-flow verification: frontend production build passed; 60 API assertions plus database/privacy/CORS/rate-limit/persistence checks passed. The requested administrator login and admin role were verified locally. Browser inspection covered the new Login and Register layouts and mismatched-password rejection. Actual SMTP delivery and a broad mobile/device accessibility audit remain unverified. Changed account-flow files: backend/src/models/User.js, backend/src/routes/authRoutes.js, backend/src/routes/staffRoutes.js, backend/src/middleware/authMiddleware.js, backend/src/createAdmin.js, backend/tests/journey.mjs, backend/package.json, backend/package-lock.json, backend/.env.example, frontend/src/components/AuthForm.jsx, frontend/src/pages/Login.jsx, frontend/src/pages/Register.jsx, frontend/src/pages/AdminDashboard.jsx, frontend/src/App.jsx, frontend/src/auth.css, frontend/src/main.jsx, and README.md. Local backend/.env was updated without exposing its password in tracked source.


### Current password and Add Staff behavior

New reporter, staff and invitation passwords must be **exactly 8 characters**, enforced in the form and API. Existing account passwords remain valid at login, including the administrator password explicitly preserved by the user. No existing credentials were changed. The initial-admin seed also requires exactly 8 characters when creating a new account, while preserving an existing account.

Manage Staff → Add Staff now includes a required Password field and creates an active reviewer/consultant account directly, without email. The invitation API remains supported for invitation-based account setup; public signup still assigns only reporter. No admin role can be created through Add Staff.

Latest verification: frontend build passed; 69 API assertions and database/privacy/restart checks passed, including direct staff login and rejection of 7- and 9-character new passwords.


### URL navigation

Pages now update the address bar: `/`, `/login`, `/register`, `/dashboard`, `/reports`, `/reports/new`, `/reports/:id`, `/ai-consultant`, and `/accept-invitation`. About/Resources/Support navigation uses home section fragments. Browser Back and Forward update the visible page. Unknown paths show a not-found page. Vite serves direct page URLs through its SPA fallback; production hosting must rewrite non-API app paths to index.html.

Authentication remains in memory: refreshing or directly opening a protected URL without an active session redirects to `/login`; it does not expose report data. Invitation tokens remain removed from the URL after capture. Frontend build passed. Browser verification covered direct `/login`, Login/Register Back/Forward, fictional registration to `/dashboard`, submission via `/reports/new`, and opening a report at `/reports/:id` with Back/Forward.


### Current review, support and account management flow

This section supersedes earlier workflow/password descriptions. New passwords may contain **8 or more characters**, up to 72 UTF-8 bytes. The exact-length note below the password field was removed. Existing passwords remain unchanged. All roles get an “Are you sure?” confirmation when logging out; cancelling keeps the session active.

Reviewers can list and read **all reported cases** at `/api/reports/all`, including cases handled by another reviewer. They can modify and message only cases assigned to themselves. The dashboard shows all cases; unassigned cases may be claimed or accepted directly. A reviewer must explicitly accept a case before assigning an active consultant. Consultants can read, message, add notes and update only **accepted cases assigned to them**. Other reviewers cannot read another case team's private conversation or internal notes. Existing consultant assignments from before this change are treated as previously accepted during startup migration; no reports are deleted.

The reporter assistant now offers suggested questions, report-navigation buttons, and live status lookup restricted to the current reporter's latest five cases. Urgency questions take precedence over general reporting answers. It is a functional **offline reporting assistant**, not a remote generative model or professional counseling service; no report data or questions leave the local backend. General questions outside its supported topics receive an honest fallback. Failed requests retain the question so it can be retried.

Administrators can remove reporter/reviewer/consultant accounts from the account list after confirmation. Removal disables login and existing tokens, removes the user from the active account list, and preserves report/message history. Removing a reviewer releases their cases and consultant assignments for reassignment; removing a consultant releases their consultant assignments. Removed emails remain reserved. This is soft removal, not personal-data erasure. Administrator accounts cannot be removed through this general screen; administrator removal requires the controlled local operator process. Self-removal is blocked.

Verification: frontend production build passed. **95 API assertions** plus database, privacy, CORS, rate-limit and restart checks passed, including global reviewer read, assigned-only private messaging, acceptance before consultant assignment, 8+ passwords, assistant status privacy, user removal, token revocation and retained case records. Tests use fictional data only; no real user was removed. Mobile and professional safeguarding/security review remain required before real-world use.

Browser verification for the current workflow: registered a fictional reporter with a 12-character password; confirmed no exact-length password note is rendered; opened `/ai-consultant`; clicked the status suggestion and received the correct own-account empty state. Logout uses a shared in-page dialog for all roles. Browser verification confirmed that Cancel preserves the session, and Yes, log out clears the workspace and returns to the public home URL.


### Rate-limit lockout fix

The former shared budget of 100 API requests per 15 minutes could block normal use, including login. Workspace requests now have a separate 600-request budget per IP per 15 minutes. Health checks and authentication routes do not consume that workspace budget. Login permits 20 unsuccessful attempts per IP per 15 minutes; successful logins are excluded. Registration and invitation activation each retain their own 30-attempt budgets. Login errors now show the Retry-After delay supplied by the backend. These in-memory limits reset on restart and still need a shared store and deployment-specific proxy configuration before production.

Regression verification passed 117 API assertions plus database/privacy/persistence checks, including 105 workspace reads and 22 successful logins without lockout, followed by a failed-login lockout with a valid Retry-After header. Frontend build passed.


### Written reports and shared accepted-case list

Reviewer dashboards display every submitted report with the full written description in the table. Report cards also show the written text. Consultants now use `/api/reports/accepted` to read **all** reports explicitly accepted by a reviewer, including accepted reports not assigned to them. This supersedes the earlier assigned-only consultant read policy. Unaccepted reports remain inaccessible to consultants. Private messages, internal notes and case changes still require assignment to the consultant; reviewers retain assignment-based control of private conversations and changes. The accepted queue and detail responses hide other consultants' internal notes. Reviewer acceptance is required before a case enters this list. Frontend build passed.
