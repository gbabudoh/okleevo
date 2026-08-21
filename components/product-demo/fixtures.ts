// ─── Scripted demo content ──────────────────────────────────────────────────
// This is entirely static, hardcoded fixture data for the homepage's product
// simulator. Deliberately NOT wired to any API, database, or real
// business/appointment/chat row — this sits on the fully public,
// unauthenticated homepage, so it never fetches anything and never exposes
// real workspace data. If you want this content editable without a deploy,
// that's a reasonable follow-up (mirroring the existing admin-editable
// LandingPreviewConfig pattern this replaces), not something baked in here.

export const internalHqFixture = {
  chatMessages: [
    { initials: 'AR', name: 'Alex River', time: '10:42 AM', text: 'Client booking page is live — branding matches their site now.' },
    { initials: 'ER', name: 'Elvis Rostova', time: '10:44 AM', text: 'AI picked up 3 action items from this morning’s kickoff call.' },
  ],
  kanban: {
    todo: [{ title: 'Set up team timezone tracker', tag: 'Setup' }],
    inProgress: [{ title: 'Finalize Q3 booking page branding', tag: 'High Priority' }],
    done: [{ title: 'Client drop-box UI polish', tag: 'Design' }],
  },
  aiInsight: {
    actionPoint: 'Send updated project brief to Acme Digital Agency before Friday.',
    keyDecision: 'Client requested a passcode-only video room — no account required on their end.',
  },
};

export const externalPortalFixture = {
  companyName: 'Acme Digital Agency',
  serviceName: 'Strategic Consulting Session',
  slots: ['Aug 19 · 10:00 AM', 'Aug 19 · 11:30 AM'],
  uploadHint: 'Drag & drop a project brief or asset',
  uploadSubtext: 'Secure, sandboxed upload · max 25MB',
  pinLabel: '6-digit access code required',
  ctaLabel: 'Confirm Booking',
};
