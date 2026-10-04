# RunSide

RunSide connects two runners around a planned run. A runner posts a distance, pace, time and approximate meeting area; another runner discovers the plan and requests to join. The host accepts one person, then both can chat to agree on the exact meeting spot.

## Apps

- `apps/web`: Next.js landing page and MongoDB-backed API.
- `apps/mobile`: Expo Android app, built as a downloadable APK with EAS Build.

The first launch is centered on Nairobi. With location permission, discovery searches within 25 km of the runner. Map coordinates are rounded for everyone except the host and matched runner. Chat is available only to matched participants.

## Local setup

Use Node 22 and run `npm ci` at the repository root. Copy `apps/web/.env.example` to `apps/web/.env.local` and set the MongoDB URI and a random JWT secret. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`; set the deployed API URL and a Google Maps Android SDK key. Run `npm run dev:web` and `npm run dev:mobile` in separate terminals.

The Android build uses the `preview` profile in `apps/mobile/eas.json` to produce an APK. It requires `EXPO_PUBLIC_API_URL` and `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment. Restrict the Maps key to the Android Maps SDK and the `io.runside.app` package plus the SHA-1 fingerprint of the EAS signing certificate.

## Verification

Run `npm run typecheck`, `npm run build:web`, `cd apps/mobile && npx expo lint && npx expo-doctor`. The CI smoke test uses MongoDB to exercise the complete sign up, plan, discovery, join, approval and chat flow.

## Deployment

The Next.js project deploys on Vercel as `runside`; it needs `MONGODB_URI`, `MONGODB_DB` and `JWT_SECRET` in both preview and production environments. The landing page's Android button is enabled by `NEXT_PUBLIC_APK_URL`, pointing to a published APK. Never commit live environment files or signing keys.

The source lives in a separate repository from Agent Commons. Changes should enter `staging` through a PR and pass CI before promotion to `main`.
