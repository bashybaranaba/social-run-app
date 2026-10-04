# RunSide

RunSide connects two runners around a planned run. A runner posts a distance, pace, time and approximate meeting area; another runner discovers the plan and requests to join. The host accepts one person, then both can chat to agree on the exact meeting spot.

## Apps

- `apps/web`: Next.js landing page and MongoDB-backed API.
- `apps/mobile`: Expo Android app. The latest signed APK is published in [GitHub Releases](https://github.com/bashybaranaba/social-run-app/releases/latest).

The first launch is centered on Nairobi. With location permission, discovery searches within 25 km of the runner. Map coordinates are rounded for everyone except the host and matched runner. Chat is available only to matched participants.

## Local setup

Use Node 22 and run `npm ci` at the repository root. Copy `apps/web/.env.example` to `apps/web/.env.local` and set the MongoDB URI and a random JWT secret. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`; set the deployed API URL and a Google Maps Android SDK key. Run `npm run dev:web` and `npm run dev:mobile` in separate terminals.

The published APK is built locally with Expo prebuild and Gradle, then signed with a private release key. The `preview` profile in `apps/mobile/eas.json` is prepared for future EAS cloud builds. It requires `EXPO_PUBLIC_API_URL` and `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment. The Maps key is restricted to the Android Maps SDK, `io.runside.app`, and the published APK's signing certificate. Future updates must use the same signing key so Android can install them over earlier releases. Keep the keystore and its password backed up outside Git.

## Verification

Run `npm run typecheck`, `npm run build:web`, `cd apps/mobile && npx expo lint && npx expo-doctor`. The CI smoke test uses MongoDB to exercise the complete sign up, plan, discovery, join, approval and chat flow.

## Deployment

The Next.js project deploys on Vercel as `runside`; it needs `MONGODB_URI`, `MONGODB_DB` and `JWT_SECRET` in both preview and production environments. The [landing page](https://runside-sigma.vercel.app) links to the latest GitHub release APK; `NEXT_PUBLIC_APK_URL` can override that link. Never commit live environment files or signing keys.

The source lives in a separate repository from Agent Commons. Changes should enter `staging` through a PR and pass CI before promotion to `main`.
