# Brain Match – Final Web Build (COMP3850 – Group 34)

This folder contains the complete deployable build of **Brain Match**, a browser-based memory-matching game created for the Yiliyapinya Indigenous Corporation as part of the Macquarie University COMP3850 PACE: Computing Industry Project.

This is a **self-contained HTML/CSS/JavaScript build**.  
It can be hosted on any standard web server with **no backend requirements**.

---

## 📁 Project Contents

- `index.html` — Main game entry point  
- `style.css` — User interface and layout styling  
- `index.js` — Core gameplay logic  
- `shuffle.js` — Shuffle + preview logic  
- `levels.js` — Level configuration and difficulty progression  
- `countdown.js` — 3-2-1 countdown overlay logic  
- `background.js` — Animated sky/canvas background  
- `audio.js` — Flip/match/wrong/win sound controller  
- `/assets/` — Images, card artwork, UI assets, audio files  
- `/data/cards.json` — Card metadata  
- `/data/funfacts.json` — Fun fact dataset  
- `README.md` — Deployment instructions (this file)

---

## 🚀 Deployment Instructions (For Web Team)

1. Upload **all files and folders exactly as provided** to your hosting environment.  
2. Maintain the same folder structure (especially `/assets/` and `/data/`).  
3. No installation or build steps are required.  
4. After uploading, open the game by visiting the URL where `index.html` is hosted  
   (example: `https://your-domain/brainmatch/index.html`).

### ⚠ Important Notes  
- Because the game uses `fetch()` to load JSON files, it **must be hosted on a web server**.  
- Opening via `file://` (double-clicking index.html) will block JSON and audio due to browser security.  
- Once hosted, all functions (Start Game, Choose Level, Audio, Fun Facts) will work correctly.

---

## 🌐 Hosting Requirements

- Any standard web server (Apache, Nginx, IIS, cPanel, Netlify, etc.)  
- No backend or database required  
- Fully client-side application  
- Works on all modern browsers: Chrome, Edge, Firefox, Safari  
- Runs offline once loaded

---

## 📘 Documentation

A full **Help & Training Manual (D4)** is included separately.  
It covers:

- Setup instructions  
- Gameplay overview  
- Troubleshooting  
- Accessibility notes  
- Developer & maintenance guidance  

---

## 🤝 Credits

**Brain Match** was developed by:

**Group 34 – COMP3850 PACE Project**  
Macquarie University  

In partnership with:  
**Yiliyapinya Indigenous Corporation**

---

## 📬 Contact (Development Team)

For support or enquiries, please contact:

- spondonroy.rohan@students.mq.edu.au  
- youssef.alsabaawi@students.mq.edu.au  
- efehan.hancer@students.mq.edu.au  
- shuowen.chang@students.mq.edu.au  
- terrence.gunawan1@students.mq.edu.au  

