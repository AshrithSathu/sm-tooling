# SM tooling

Self-hosted social media scheduling, based on [Postiz v2.23.0](https://github.com/gitroomhq/postiz-app/tree/v2.23.0), under the original AGPL-3.0 license.

## Deployment

The Railway `postiz-app` service runs the `main` branch of this repository. Push code changes to that branch to deploy. It stays based on the installed v2.23.0 release; upstream main contains newer changes that have not been tested in this installation.

App: https://postiz-app-production-7abe.up.railway.app/auth/login

The Dockerfile uses the pinned upstream runtime, installs this repository's dependencies, copies this repository's source, and rebuilds the frontend, backend, and orchestrator. It also provides the corresponding source and original license at `/source.tar.gz`.

Railway variables, secrets, PostgreSQL databases, Redis, Temporal and upload volume remain managed in Railway. Never commit credentials. Social-provider keys must be configured before account connection and publishing work.

## Local changes

- SM tooling branding in logos, titles, translations and notification text.
- Removed upstream promotional testimonials and tutorial video.
- Cookies use the configured frontend hostname, fixing browsers rejecting Railway public-suffix cookies. Frontend and API share a hostname in this deployment.
- Disabled registration redirects to Sign In.

## Check

```sh
node --experimental-strip-types libraries/helpers/src/subdomain/subdomain.management.check.mjs
```

Requires Node 22.13+ for this small source check. A production Docker build checks TypeScript and builds the complete app. See `BROWSER-QA.md` for browser-tested flows and missing integration credentials.

## Upstream and license

Original source: https://github.com/gitroomhq/postiz-app

Copyright and AGPL-3.0 terms are retained in `LICENSE`. The SM tooling modifications are documented in `BRANDING.md`.

## Media storage

Production uses the private Railway `sm-media` S3 bucket. Configure `STORAGE_PROVIDER=s3`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` in Railway. Uploads use the existing validated server upload flow. Stored `/uploads/` links generate fresh one-hour bucket URLs on each request; expiring signatures are never stored in PostgreSQL. Historical object keys preserve existing links. The old upload volume is retained for rollback.

Run `python3 scripts/verify-storage.py /private/path/to/login.json` for upload/download, permanent links, byte ranges and bucket privacy checks. The credentials file must contain `url`, `email`, `password`, and `provider: "LOCAL"`. Never commit credentials.
