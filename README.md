# 🤝 DealBreaker — Multiplayer WebRTC Card Game

A fast-paced, real-time multiplayer card trading and property empire game built with **React 19**, **TypeScript**, **Tailwind CSS**, and **PeerJS (WebRTC)**. Designed to be hosted **100% free on Vercel** with zero backend infrastructure required.

---

## 🌟 Highlights

- **100% Free Forever:** Uses browser-to-browser WebRTC DataChannels via PeerJS. Zero server hosting costs.
- **Authentic Rules:** Complete 106-card deck with Deal Breaker, Sly Deal, Forced Deal, Just Say No, Rent & Wild Rent, Pass Go, Houses, Hotels, and Wildcards.
- **Real-Time Multiplayer (2–5 Players):** Instant synchronization with low-latency WebRTC.
- **AI Bot Mode:** Click **"+ Add AI Bot"** in the lobby to test or practice solo anytime.
- **Built-In Sound FX:** Web Audio API synthesizer for card dealing, money banking, deal breaking, rent collection, and victory fanfare (0 external audio files needed).
- **Vercel Ready:** Includes `vercel.json` for single-click deployment.

---

## 🚀 Quick Start (Local Development)

```bash
cd business-deal
npm install
npm run dev
```

Open your browser to `http://localhost:3000`.

---

## 🌐 Deploy to Vercel for Free

### Option 1: Vercel CLI (Fastest)

```bash
npm install -g vercel
cd business-deal
vercel
```

Follow the prompts:
- **Link to existing project?** No
- **What’s your project’s name?** `business-deal`
- **In which directory is your code located?** `./`
- **Want to modify settings?** No

Your game is now live with a free `.vercel.app` URL!

### Option 2: Push to GitHub & Connect to Vercel

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Business Deal"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework preset will automatically detect **Vite**.
5. Click **Deploy**!

---

## 🎮 How to Play

### The Winning Goal
Be the **first player to collect 3 complete property sets** of different colors!

### Turn Sequence
1. **Draw:** Draw 2 cards from the deck (or 5 if your hand is empty).
2. **Play:** Play up to **3 cards** from your hand onto the table:
   - **Bank:** Deposit Cash or Action cards into your Bank for rent/debt protection.
   - **Properties:** Lay down single properties, wildcards, or upgrade full sets with Houses ($3M) and Hotels ($4M).
   - **Actions:** Steal sets with *Deal Breaker*, charge rent, collect birthday gifts, or draw with *Pass Go*.
3. **End Turn:** Discard down to 7 cards if your hand exceeds the limit.

### Key Rules
- **Debts are ONLY paid from cards on your table** (Bank or Properties), never from your hand!
- **No Change is Given:** Overpaying a debt forfeits the difference.
- **Just Say No:** Can be played at any time to block attacks against you.

