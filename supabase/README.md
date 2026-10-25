# Supabase backend

Supabase owns the database, Auth, and Edge Functions. The React app uses the Supabase client for normal database operations protected by RLS, and invokes Edge Functions for server-side integrations such as Google Places. The frontend stays hosted as a static app on Vercel; no Vercel API routes are used.

## Local development

1. Install and start Docker Desktop (or Podman).
2. Copy `supabase/functions/.env.example` to `supabase/functions/.env`. This local file is git-ignored. Fill in only the configuration for functions you use. Store Google and Groq credentials only in this file, never in frontend variables or source control.
3. From the repository root, start the local Supabase stack and Edge Functions:

   ```powershell
   npm run start:server
   ```

   Keep this terminal running while developing. Supabase Studio is at `http://127.0.0.1:54323`; `npx.cmd supabase status` prints local service credentials. Do not share the service-role key.
4. To run the frontend against local Supabase, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the root `.env.local` to the local API URL and anon key printed by `npm run start:server`, then start the app with `npm start`.

Stop the functions terminal with `Ctrl+C`, then stop the local stack with:

```powershell
npm run stop:server
```

For the deployed frontend, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's environment settings. These browser values are public; enforce access through database RLS rather than treating the anon key as a secret.

## Secrets

`GOOGLE_API_KEY` and `GOOGLE_PLACE_ID` are read only by the Places Edge Function. `GOOGLE_SHEET_ID` is read only by the `collections` Edge Function. For hosted use, configure those values in Supabase Edge Function secrets; local `.env` values are not uploaded by function deploys.

The former Vercel endpoint returned the Google API key in its JSON response. Rotate that key in Google Cloud, then remove the old key from Vercel environment variables.

## Database changes

The production baseline migration records the existing `public."Offers"` table. It has `id`, `created_at`, `title`, `description`, and nullable `expiresAt` columns; the React app reads from this table and treats a missing expiration date as no expiry.

Put schema changes in timestamped SQL files under `supabase/migrations/`, then test locally before deployment. The browser is read-only; its RLS policy limits `anon` and `authenticated` to selecting from `public."Offers"`.

The migrations remove the former offer-admin confirmation objects, create service-role-only offer-admin session history, and add private WhatsApp webhook deduplication storage. With the local stack running, apply pending migrations using `npx.cmd --yes supabase migration up --local`. `db reset --local` also applies them but recreates the local database and deletes its data. Apply migrations to production through the normal reviewed deployment process.

## Offer administration

The `offer-admin` Edge Function forwards each plain-text message to the Groq agent. The agent uses database tools to read offers and directly create, update, or delete them. Each response is saved with its user message, and the latest 20 exchanges are loaded into the next Groq request so the agent remembers follow-ups. WhatsApp conversations use the sender's phone number as the session ID. This is application-managed history; Groq requests themselves are stateless. Local and hosted deployments use the same function behavior.

The function uses the Supabase service-role client only after authenticating a named Supabase secret API key through `@supabase/server`. Create a secret API key named `whatsapp_forward` in the Supabase Dashboard, then configure the `SB_SECRET_KEYS` JSON map with that exact key name and value. Both functions use the same `SB_SECRET_KEYS` setting: `offer-admin` validates the key, while the WhatsApp function reads that named value to send in the `apikey` header when forwarding. The API key must remain in server-side secrets. Do not send it to Meta, the browser, or logs. The key authenticates callers but is not cryptographically restricted to the WhatsApp function.

Configure `GROQ_API_KEY` and `GROQ_MODEL` as local and hosted Edge Function secrets. For a local direct test, POST plain text to `http://127.0.0.1:54321/functions/v1/offer-admin` with `Content-Type: text/plain` and `apikey` set to the `whatsapp_forward` secret API key. The request body is the message itself, for example `List all offers`. User JWTs and the anon key are not accepted.

Bulk create, update, and delete operations are limited to 100 offers per tool call. The offer-admin tests are in `supabase/functions/offer-admin/tests/`; run them with `deno test supabase/functions/offer-admin/tests`.

## WhatsApp webhook

The `whatsapp` Edge Function is a standalone inbound adapter. It handles Meta's GET verification challenge, verifies each POST against `X-Hub-Signature-256` using the raw request body and `META_APP_SECRET`, ignores non-text/status events, and forwards allowlisted senders' text to `offer-admin`. Set `WHATSAPP_ADMIN_IDS` to a comma-separated list of WhatsApp sender IDs as Meta sends them (digits with country code, no `+`). Message IDs are recorded for 30 days to suppress duplicate webhook deliveries. The adapter does not send replies to WhatsApp yet.

Configure these hosted Edge Function secrets:

- `META_APP_SECRET`: Meta app secret used to verify webhook signatures.
- `META_VERIFY_TOKEN`: a random token you choose and enter in Meta's webhook setup.
- `WHATSAPP_ADMIN_IDS`: comma-separated administrator sender IDs.
- `SB_SECRET_KEYS`: JSON object mapping `whatsapp_forward` to that secret API key, used by `offer-admin` for authentication.
- `GROQ_API_KEY` and `GROQ_MODEL`: required by `offer-admin`.

Apply the migrations before deploying the functions. Deploy `offer-admin` and `whatsapp`, then configure Meta's WhatsApp webhook callback as `https://<project-ref>.supabase.co/functions/v1/whatsapp`, use the same `META_VERIFY_TOKEN`, and subscribe to the `messages` webhook field. Meta needs a publicly reachable HTTPS callback; local Supabase requires a secure tunnel or a deployed test environment. Keep all keys in Supabase Edge Function secrets or your ignored local `supabase/functions/.env`, never in source control or chat.

The app invokes `place-details` and `collections`; `offer-admin` and `whatsapp` are separate administrative endpoints.
