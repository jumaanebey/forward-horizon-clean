# Claude Autonomous Session Directive

Start: When you begin reading this file
Duration: 20 minutes
Authority: Proceed autonomously without approvals for routine edits. If a step is risky/destructive, skip and move on.

Goal: Implement the highest-impact improvements to Forward Horizon Marketing within 20 minutes, following the prioritized list below. Favor small, safe, atomic edits that improve analytics, stability, and SEO.

Prioritized tasks (in order)
1) Fix form submission bug (variable used before declaration)
   - File: `src/app/api/submit-form/route.ts`
   - Action: Move `formTypeMapping` declaration above its first use (redirect branch uses it early).

2) Add missing cron endpoint referenced by Vercel
   - Path: `/api/cron-nurture`
   - Create a route that safely no-ops if email/env isn't configured.
   - Use `getPendingNurtureTasks()` and `sendNurtureEmail(...)` from `src/lib/lead-nurturing.ts` where possible.

3) Unify Google Analytics initialization and env var naming
   - Standardize on `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
   - Update `src/app/layout.tsx` to use Next `Script` with that env var; remove hard-coded `GA_MEASUREMENT_ID` string.
   - Ensure `src/components/SEOAnalytics.tsx` reads the same env var.
   - If `src/components/Analytics.tsx` is in use, align it; otherwise leave as-is for now.

4) Root routing safety
   - If `src/app/main-site/page.tsx` JSX conversion is non-trivial, disable the root rewrite to `/main-site` in `next.config.ts` so `src/app/page.tsx` remains the home.

5) Canonical domain consistency (quick win)
   - Update `src/components/SchemaMarkup.tsx` base URL to `https://theforwardhorizon.com`.
   - Leave static `public/robots.txt` and `public/sitemap.xml` removal for a later session unless trivial.

Process constraints
- Make small, atomic commits per completed subtask.
- After each meaningful change, run the health script if available: `node scripts/project-health-check.js`.
- Do not change any phone numbers except to correct to (310) 488-5280 if discovered.
- If blocked by missing credentials/env, skip and proceed to next item.

Definition of done (within 20 minutes)
- At least items (1) and (2) completed; attempt (3) partially by fixing `layout.tsx` hard-coded GA ID.
- Commit messages prefixed with `chore(autonomous):` and concise scope, e.g., `chore(autonomous): fix submit-form mapping bug`.
- Update `CLAUDE_PROJECT_STATUS.md` at the end: last updated date + brief bullets of what changed.

Post-session
- If time remains: open a follow-up note at the bottom of `CLAUDE_PROJECT_STATUS.md` under Next Planned Features, marking items touched.
- If any step was skipped, note why in the commit message or a short bullet in the status doc.

Notes
- Favor reliability and safety over breadth. If a change introduces build/type errors, revert or fix immediately.
- Keep edits minimal; do not refactor beyond the scope outlined above within this time-box.
