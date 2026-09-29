# Running the Emulator

Follow these steps to run the emulator:

1. Run the following commands in parallel: `npm run build:watch` & `npm run serve`

2. Uncomment the part in `functions/index.ts` to initialize the database on the emulator.

3. Uncomment the `fieldPath` attribution in `fetchDbConditions.ts`.

# Bot protection

Sign up goes through the `signUp` callable function, which verifies a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) captcha, checks a honeypot field and blocks disposable email domains before creating the user.

Setup:

1. Create a Turnstile widget in the Cloudflare dashboard (add `weatherhub.app` and `localhost` as hostnames).
2. Put the site key in the root `.env` as `VITE_APP_TURNSTILE_SITE_KEY`.
3. Store the secret key: `firebase functions:secrets:set TURNSTILE_SECRET_KEY`
4. Block client side sign ups, otherwise bots can still call the Firebase Auth API directly: upgrade the project to Identity Platform, then in Firebase console → Authentication → Settings → User actions, uncheck **Enable create (sign-up)**.

# Removing bot accounts

`scripts/deleteBotAccounts.js` lists every account created on or after a cutoff date (default `2026-01-01T00:00:00Z`) and writes a CSV report. Accounts with a paid or admin subscription are never deleted.

```sh
# Dry run: only writes bot-accounts-<timestamp>.csv
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run delete-bots

# Keep real users created after the cutoff, then delete
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run delete-bots -- --keep=real@user.com,someUid --delete
```

Use `--since=<ISO date>` to change the cutoff.
