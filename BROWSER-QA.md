# Browser verification — 2026-09-11

## Fixed login

A valid-password login returned to the sign-in page. Browser network diagnostics showed HTTP 200 with a rejected cookie (`InvalidDomain`). The shared domain helper selected `.railway.app`, which is a shared public suffix. Cookies now use the configured frontend hostname; the frontend and API share that hostname in this deployment.

Verified in the actual browser after deployment:
- Email/password login reaches Calendar.
- Reload preserves the signed-in session.
- Logout clears the session; a fresh login succeeds.
- Found logout landed on the disabled registration page. Verified the final branded build redirects `/auth` to Sign In when registration is disabled.

Runnable root-cause check: `node --experimental-strip-types libraries/helpers/src/subdomain/subdomain.management.check.mjs`.

## Screen-by-screen results

| Screen | Browser result |
|---|---|
| Calendar | Renders weekly schedule and empty channel state |
| Add Channel | Lists social providers; Instagram opens OAuth with `client_id=undefined`, confirming missing app credentials |
| Media | Uploaded disposable `sm-browser-check.png` through the file chooser; it appeared in the library |
| Analytics | Loads; clearly requires connected social channels |
| Plugs | Loads; requires X, LinkedIn Page, Threads or Bluesky |
| Integrations | HeyGen and Reel.Farm setup options render |
| Global Settings | Date format, notification and shortlink settings render |
| Teams | Team Members and invitation control render; no invitation sent |
| Webhooks | Empty list and Add control render; no webhook sent |
| Auto Post | RSS automation screen and Add control render |
| Sets | Empty list and Add control render |
| Signatures | Empty list and Add control render |
| Developers / Access | API, CLI and MCP setup render; secrets stayed masked |
| Developers / Apps | OAuth application description and Create control render |
| Approved Apps | Empty approved-app list renders |
| Agent | Chat screen renders, but test greeting gets no response; backend confirms missing OpenAI API key |
| Password recovery | Form renders; email delivery untested because no email provider is configured |

This is screen and login/media workflow verification, not a claim that every possible feature works. Publishing, channel analytics, automatic posting, provider authorization and AI generation remain blocked by missing external credentials. No social posts or DMs were sent. No team invites or external webhooks were sent.

## GitHub deployment verification

Fork: https://github.com/AshrithSathu/sm-tooling. Railway production builds branch `feat/sm-tooling-branding`; its GitHub push trigger is configured. Commit `76e6e5e` deployed successfully as `688379cf-98a4-4bbb-8a4e-f63ef6fd1dd2`. Frontend, backend and orchestrator builds passed. The live browser shows SM tooling on sign-in, sidebar and Settings; fresh login and logout pass. API login/cookie and media checks pass. The downloadable modified source includes LICENSE and no private environment files.
