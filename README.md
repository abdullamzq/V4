# HSK Reboot

A personalized iPad-friendly HSK 3 → HSK 4 trainer.

## What it does

- Saves progress **immediately after every answer** on the device.
- Uses spaced review: wrong words return sooner; strong words wait longer.
- HSK 1–3 recovery comes before heavy HSK 4 expansion.
- HSK 3.0 and Legacy HSK 2.0 vocabulary tracks are separate.
- Pinyin is hidden during recognition and appears after answering.
- Chinese text-to-speech uses the device's Mandarin voice when available.
- 10, 20, and 45 minute session modes.
- Reboot diagnostic for HSK 1–3.
- XP, mastery stages, due cards, streak, weak-word map.
- Export/import backup.

## iPad installation

This is a Progressive Web App (PWA), so it must be served from an HTTPS website before iPadOS can install it as a Home Screen app.

### Simple route: GitHub Pages

1. Create a new GitHub repository.
2. Upload **all files in this folder** to the repository root.
3. In GitHub: Settings → Pages.
4. Choose deployment from the `main` branch/root and save.
5. Open the generated Pages address in Safari on your iPad.
6. In Safari, use Share → Add to Home Screen.
7. Open HSK Reboot from the new Home Screen icon.
8. Tap **Load vocabulary** once while online. After that, your progress is local and the app shell works offline.

If you prefer another static HTTPS host, the files also work on services such as Netlify or Cloudflare Pages.

## Saving

Progress is stored using browser/app local storage after **every correct or incorrect answer**.

The green **Saved ✓** badge confirms the write.

For safety, use Settings → **Export progress backup** occasionally. This creates a JSON backup you can keep in Files/iCloud Drive. You can restore it with **Import progress backup**.

## Vocabulary source

The app downloads HSK vocabulary from:

`drkameleon/complete-hsk-vocabulary`, release v1.4  
MIT License © 2026 Yanis Zafirópulos (Dr.Kameleon)

That release includes both HSK 2.0 and HSK 3.0 level lists. The app downloads only Levels 1–4 and stores a compact local copy.

Source project:
https://github.com/drkameleon/complete-hsk-vocabulary

## Important

The app is a study tool, not an official testing product. Dictionary meanings can occasionally be broader than the meaning expected in an HSK question. Future versions can add hand-curated definitions, example sentences, grammar, writing practice, and richer radical/component stories.
