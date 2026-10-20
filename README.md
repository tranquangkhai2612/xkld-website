# XKLD - かな道場 (Frontend: `xkld-website`)

A modern, clean Japanese Hiragana and Katakana study web application built with **React**, **TypeScript**, and **Vite**, featuring modern Japanese typography, native audio pronunciation, typing recall tests, stroke order guides, and spaced repetition.

## ✨ Features

- **🥋 Practice Dojo (Random Romaji Typing)**:
  - Randomly presents Hiragana (or Katakana / mixed) characters.
  - Interactive input testing your Romaji recall (`ka`, `shi`, `tsu`, etc.).
  - Supports standard spelling variations (e.g. `shi`/`si`, `tsu`/`tu`, `chi`/`ti`, `fu`/`hu`).
  - Instant tactile feedback: Mokugyo wooden block chime, celebratory bells, and native Japanese speech synthesis (`ja-JP`).
  - Spaced repetition: any missed characters are automatically re-queued for practice.
  - Custom row filters: practice specific rows (`あ行`, `か行`, `さ行`, etc.) or all Gojūon + Dakuon.

- **📜 Interactive Kana Chart**:
  - Full Gojūon 50-sound matrix & Dakuon rows.
  - Hear native pronunciations with a single click.
  - View memory mnemonics, stroke order info, and vocabulary examples.

- **📊 Mastery & Stats**:
  - Tracks streak records, accuracy rates, and total answers.
  - Highlights troubled characters with a one-click targeted focus drill.

- **⛩ Modern Clean Aesthetics**:
  - Light & Zen Dark themes with electric indigo accents and glassmorphic cards.
  - Modern Japanese handwriting typography (*Zen Maru Gothic*, *Klee One*, *Noto Sans JP*, and *Plus Jakarta Sans*).
  - Quadrant handwriting canvas (田 grid) with animated stroke-by-stroke guides.

## 🚀 Getting Started

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
