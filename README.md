# Lokal

"Lokal" is a placeholder name. A live, Waze-style map of small, independent food.
Plans: [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md) · Design: [`design/`](design/README.md)

## Preview on an iPhone with Expo Go (from your computer)

Your computer and iPhone must be on the same Wi-Fi.

One time:

1. Install Node.js 22 (nodejs.org) and Git (git-scm.com).
2. In a terminal:
   ```bash
   git clone https://github.com/douggue/qave-app.git
   cd qave-app
   npm install
   npx expo login        # sign in as the project's Expo account
   ```
3. In Expo Go on the iPhone, tap the account icon and sign in with the same Expo account.

Every time:

```bash
cd qave-app
git pull
npx expo start
```

Scan the QR code with the iPhone Camera app. Saved changes appear on the phone in about a second.

If the phone can't connect (some Wi-Fi networks block it), use `npx expo start --tunnel`.
If Expo Go says the project is incompatible, update Expo Go from the App Store.

## Builds and live updates

Every push to `main` runs `.github/workflows/eas-build.yml`: a live update when only
JavaScript changed, or a new Android build when native code changed.
