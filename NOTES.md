# Restaurant Finder App — What's Built

## Files Created

| File | Purpose |
|---|---|
| `README.md` | Project rules and constraints |
| `.gitignore` | Git ignore patterns for Android/static projects |
| `index.html` | Main entry point (served statically) |
| `css/style.css` | Mobile-first styles |
| `js/app.js` | App logic — loads JSON, renders list/detail views |
| `data/restaurants.json` | Structured restaurant data |
| `preview.html` | Self-contained preview (embedded data) |

## What's in the App

### Restaurant Data (3 restaurants)

1. **Potluck Cafe** — Chinese (Fuzhou), Chinatown Boston
   - Rating: 4.2 (286 reviews)
   - Your note: "Pork fried buns"
   - 36 menu items across 6 categories

2. **McGonagle's Pub & Restaurant** — Irish Pub, Dorchester
   - Rating: 4.5 (310 reviews)
   - Your note: "Spice Bag!!"
   - 14 menu items across 5 categories

3. **Aatma At Widowmaker** — Modern Indian, Brighton
   - Rating: 4.7 (817 reviews)
   - No personalized note yet
   - 15 menu items across 6 categories

### Features

- **List view** — all restaurants with name, cuisine, address, rating, review count, phone, and your notes
- **Detail view** — tap any restaurant to see:
  - Full contact info
  - Hours for every day of the week
  - Your personalized notes
  - Google Maps link
  - Full menu organized by section with prices and descriptions
- **Mobile-first design** — optimized for phone viewing
- **Back button** — navigate between list and detail views
- **Tap-to-call phone numbers** on mobile

## How to Use

Serve from the project directory:
```bash
cd C:/Users/varun/hermes-workspace/android-app
npx serve .
```

Then open on your phone at the local IP address, or serve it to a web host later.

## What's Pending

- Your actual Google Maps list links (currently using placeholder URLs)
- Full menu extraction for Aatma (some items missing — need to fetch from their website)
- Your complete restaurant list (you mentioned a longer list coming)
- Any design tweaks or additional features
