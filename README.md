# Project Rules — Simple Android Web App

## Purpose
A personal-use static web app accessed via a home-screen shortcut on my phone.

## Scope
- Intended for my own use only, possibly shared with a couple of others.
- Will **not** be published to any app store.

## Constraints
- **No app bundling.** No APK, no AAB, no WebView wrapper, no Cordova/Capacitor, no React Native, no native code.
- **Static HTML only.** Single-file or minimal static files (HTML + CSS + JS). No build step, no bundler, no transpiler.
- **Deployed as a website.** I will access it by visiting a URL or opening a browser shortcut.
- Keep everything as simple and maintainable as possible.

## Technology
- HTML5, CSS3, vanilla JavaScript.
- No frameworks, no libraries unless explicitly requested.
- No server-side code — fully client-side.

## Source Control
- Git repository at `C:/Users/varun/hermes-workspace/android-app/`.
- Commit messages should be descriptive and concise.

## File Structure
```
android-app/
├── .gitignore
├── README.md          ← this file
├── index.html         ← main entry point
├── css/               ← stylesheets
├── js/                ← scripts
└── assets/            ← images, icons, etc.
```

## Deployment
- I will host this myself. No CI/CD pipeline required at this time.
