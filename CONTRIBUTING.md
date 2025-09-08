# Contributing to R2 Gallery

Thanks for taking the time to contribute!

## Getting started

1. Fork and clone the repo
2. Create `.env.local` from `env.example`
3. Install and run:
   ```
   npm i
   npm run dev
   ```
4. Open http://localhost:3423

## Project scope

- Dev-first, self-hosted, simple bearer auth
- Not production-hardened; avoid heavy auth/infra unless minimal and optional
- Local rendering only (no cloud/Lambda backends)
- Downloads use a same-origin endpoint to force save (no cross-origin downloads)

## Code style

- TypeScript strictness where practical; avoid `any` when reasonable
- Clear naming; prefer full words over abbreviations
- Keep components small and readable
- Handle errors with helpful messages; avoid noisy logs

## Before you start

- Open an issue describing the change/bugfix
- For larger changes, propose a short design outline

## Submitting changes

1. Branch from `main`
2. Make focused commits with clear messages
3. Ensure it builds:
   ```
   npm run build
   ```
4. Lint if you have ESLint configured:
   ```
   npm run lint
   ```
5. Open a PR and link it to the issue

## Notes for contributors

- Links: both single and bulk copy rely on the same server route. If `CLOUDFLARE_BUCKET_URL` is set, they will be public; otherwise signed.
- Downloads: prefer using the same-origin API (`/api/download/file?key=...`) to avoid CORS and ensure `Content-Disposition` is respected.

## Areas that need help

- Docs: R2 setup, CORS troubleshooting
- UI/UX improvements and accessibility
- Better previews and media handling
- Testing: unit/e2e (none yet)
- Docker/compose improvements

## License

By contributing, you agree your contributions will be licensed under the MIT License.
