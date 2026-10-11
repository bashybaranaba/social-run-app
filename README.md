# RunSide

RunSide connects two runners around a planned run. A runner posts a distance, pace, time and approximate meeting area; another runner discovers the plan and requests to join. The host accepts one person, then both can chat to agree on the exact meeting spot.

## Apps

- `apps/web`: Next.js landing page and MongoDB-backed API.
- `apps/mobile`: Expo Android app. The latest signed APK is published in [GitHub Releases](https://github.com/bashybaranaba/social-run-app/releases/latest).

The first launch is centered on Nairobi. With location permission, discovery searches within 25 km of the runner. Map coordinates are rounded for everyone except the host and matched runner. Chat is available only to matched participants.

## Local setup

Use Node 22 and run `npm ci` at the repository root. Copy `apps/web/.env.example` to `apps/web/.env.local` and set the MongoDB URI, a random JWT secret, and the Google Web OAuth client ID. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`; set the deployed API URL, a Google Maps Android SDK key, and the same Google Web OAuth client ID. Run `npm run dev:web` and `npm run dev:mobile` in separate terminals. Google sign-in uses native Android code and needs a custom build; it is unavailable in Expo Go.

In Google Cloud Console, select the RunSide project and configure the Google Auth Platform for an external audience. Create a **Web application** OAuth client and an **Android** OAuth client for package `io.runside.app` and the SHA-1 fingerprint of the release signing certificate. Put the Web client ID in both environment files. Only basic profile and email access are requested. Google requires OAuth clients to be created in the Console; `gcloud` cannot create standard Sign in with Google clients. Google sign-in verifies the ID token on the API, then issues the same RunSide session used by password sign-in. Existing password accounts can connect Google from Profile after signing in; the Google email must match the account email.

The published APK is built locally with Expo prebuild and Gradle, then signed with a private release key. The `preview` profile in `apps/mobile/eas.json` is prepared for future EAS cloud builds. It requires `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment. The Maps key is restricted to the Android Maps SDK, `io.runside.app`, and the published APK's signing certificate. Future updates must use the same signing key so Android can install them over earlier releases. Keep the keystore and its password backed up outside Git.

## Verification

Run `npm run typecheck`, `npm run build:web`, `cd apps/mobile && npx expo lint && npx expo-doctor`. The CI smoke test uses MongoDB to exercise the complete sign up, plan, discovery, join, approval and chat flow.

## Deployment

The Next.js project deploys on Vercel as `runside`; it needs `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, and `GOOGLE_WEB_CLIENT_ID` in both preview and production environments. The [landing page](https://runside-sigma.vercel.app) links to the latest GitHub release APK; `NEXT_PUBLIC_APK_URL` can override that link. Never commit live environment files or signing keys.

The source lives in a separate repository from Agent Commons. Changes should enter `staging` through a PR and pass CI before promotion to `main`.
