# Apex Journal

Responsive blog capstone application built with plain HTML/CSS/vanilla JavaScript and an Express + MongoDB API.

## Setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGO_URI` to a MongoDB Atlas connection string and set `JWT_SECRET` to a long random value.
5. Optionally set `PORT` (default: `5000`).
6. Run `npm run seed`.
7. Run `npm start`.
8. Open `http://localhost:5000`.

Demo login: `demo@example.com` / `password123`

## Features

- JWT registration and login, bcrypt password hashing, logout
- Author-only post and comment deletion
- Author-only post editing
- Search, category filtering, sorting, and pagination
- Likes and comments
- Reading-time estimates
- Persistent light/dark theme
- Loading, validation, success, and error states
- Responsive, accessible, mobile-first UI

## Environment

Never commit `.env`. The repository includes `.env.example` with placeholders only:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/blog
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

## Screenshots

Add final screenshots here after browser testing:

- `screenshots/home.png`
- `screenshots/post.png`
- `screenshots/editor.png`
- `screenshots/mobile.png`

## Cross-browser and mobile testing checklist

- [ ] Chrome desktop: register, login, create, edit, like, comment, delete
- [ ] Chrome desktop: search, category filter, sort, pagination
- [ ] Firefox desktop: theme toggle and localStorage persistence
- [ ] Firefox desktop: form validation and API error states
- [ ] Safari desktop: layout, sticky navigation, date formatting
- [ ] Safari desktop: login and logout in private/normal mode
- [ ] Chrome Android: responsive cards, filters, editor, comment controls
- [ ] Safari iOS: viewport, text input, form submission, sticky navigation
- [ ] Small viewport (320 px): no horizontal overflow
- [ ] Tablet (768 px): grid and navigation remain usable
- [ ] Keyboard: skip through controls, visible focus, dialog confirmation
- [ ] Screen reader: labeled fields, landmarks, and status messages
- [ ] Network throttling: loading states remain usable
- [ ] API failure: clear errors appear and buttons recover

## Minifying CSS and JavaScript

This project intentionally has no build system. Before deployment, optional production files can be produced with a CSS/JavaScript minifier.

Using Node package executables:

```bash
npx esbuild frontend/js/api.js frontend/js/auth.js frontend/js/posts.js frontend/js/app.js --minify --outdir=dist/js
npx lightningcss-cli frontend/css/style.css --minify --output dist/style.css
```

Update script and stylesheet URLs in the HTML files to the generated `dist` files, or use a static hosting/CDN pipeline that performs minification at deploy time.
