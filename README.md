# R2 Gallery

A minimalist web UI to manage a Cloudflare R2 bucket. 
Easily drag & drop to upload files and or folders.
Bulk copy links, single click downloads.

This project is dev-first and self-hosted. It’s reasonably secure for personal use but not production-hardened. PRs welcome!

## Features

- Browse folders and objects
- Upload (presigned and direct)
- Delete and copy links
- Preview images/videos when possible
- One-click downloads (forced save via same-origin endpoint)

## Quickstart (local)

1. Copy `env.example` → `.env.local` and fill required values.
2. Ensure your R2 bucket CORS allows your app origin for PUT/GET/HEAD.
3. Install deps and run:

```
npm i
npm run dev
```

Open `http://localhost:3423`.

## Configuration

Environment variables (see `env.example`):

- `CLOUDFLARE_ACCOUNT_ID` (required) — your Cloudflare account ID
- `CLOUDFLARE_ACCESS_KEY` (required) — R2 access key
- `CLOUDFLARE_SECRET_ACCESS_KEY` (required) — R2 secret access key
- `CLOUDFLARE_BUCKETNAME` (required) — target R2 bucket
- `CLOUDFLARE_REGION` (optional, default `auto`) — often `auto` for R2
- `CLOUDFLARE_BUCKET_URL` (optional) — public base URL for direct links
- `URL_TTL_SECONDS` (optional, default `900`) — signed URL expiry
- `APP_PASSWORD` (required) — bearer token enforced by `/api/*` middleware
- `NEXT_PUBLIC_APP_PASSWORD` (optional) — dev convenience to call APIs from the browser

Deprecated/removed: `NEXT_PUBLIC_PUBLIC_BASE_URL`, `PUBLIC_READ_DEFAULT`, `MAX_UPLOAD_MB`.

## R2 CORS example

Allow your app origin for GET, PUT, HEAD with appropriate headers (e.g., `Authorization`, `Content-Type`). Example policy (pseudo):

```
{
  "AllowedOrigins": ["http://localhost:3423", "https://your.domain"],
  "AllowedMethods": ["GET", "PUT", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

## Docker (quickstart)

1. Ensure `.env` is populated (same keys as local).
2. Build and run:

```
docker compose up -d --build
```

Open `http://localhost:3423`.

## Downloads and links

- Copy link (chain icon) and bulk Copy Links both use the same logic. If `CLOUDFLARE_BUCKET_URL` is set, links will be public under that base; otherwise signed URLs are returned.
- Download button forces a file save using a same-origin API endpoint with `Content-Disposition: attachment`.

## Ubuntu VM (home server)

1. Install Docker + Compose.
2. Enable Docker to start on boot: `sudo systemctl enable docker`
3. Copy `.env` and run `docker compose up -d`.
4. The container will automatically restart on VM reboot (restart policy: `unless-stopped`).
5. Optional reverse proxy (Caddy example):

```
your.domain.com {
  reverse_proxy 127.0.0.1:3423
}
```

NGINX example:

```
server {
  listen 80;
  server_name your.domain.com;
  location / {
    proxy_pass http://127.0.0.1:3423;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Contributing

See `CONTRIBUTING.md` for setup, coding style, and how to propose changes.

## Troubleshooting

- CORS errors: ensure your R2 CORS allows your app origin for GET/PUT/HEAD and headers like `Authorization` and `Content-Type`.
- 401 Unauthorized: set `APP_PASSWORD` and ensure the client includes the same value (for dev convenience via `NEXT_PUBLIC_APP_PASSWORD`).
- Links mismatch: set `CLOUDFLARE_BUCKET_URL` if you want public links; otherwise signed URLs are used.
- Downloads open in a new tab: ensure you're using the same-origin app URL; check reverse proxy doesn't strip `Content-Disposition` and supports streaming.
- Port conflicts: default port is 3423 (both dev and Docker); update reverse proxy configs if using different ports.

## Security

- API is protected by a simple bearer token (`APP_PASSWORD`) and Next middleware.
- Downloads use a same-origin endpoint with `Content-Disposition: attachment` to avoid cross-origin issues.
- For public exposure, we recommend placing a reverse proxy (Caddy/NGINX) with TLS and optional Basic Auth or IP allowlists.
- To report vulnerabilities, open a private security advisory on GitHub or contact the maintainer.

## License

MIT — see `LICENSE`.

