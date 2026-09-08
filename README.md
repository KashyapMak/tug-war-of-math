# 🪢 Tug War of Math

A fast-paced, two-team same-screen mathematics competition featuring an animated central tug-of-war arena, customizable team names and photo avatars, configurable arithmetic operations, independent question flows, and responsive dual controls.

---

## 🚀 Features

- **Real-Time Tug of War Arena**: Dynamic SVG animation with a moving rope, center flag, and team characters that pull in real-time according to the score differential.
- **Custom Team Avatars & Names**:
  - Rename the **Blue Team** and **Red Team**.
  - Upload custom team photos via drag-and-drop or file picker (with instant client-side preview).
  - Quick-reset back to the default cartoon team avatars anytime.
- **Tabbed Options & Setup Modal**:
  - **👥 Team Tab**: Configure team names and team photos.
  - **⚙️ Game Setup Tab**: Configure question counts, math operations, digit ranges, carrying/borrowing, timing mode, and custom point scoring rules.
- **Rich Math Operations**:
  - Addition (with optional carrying rules: Any, Required, No Carrying).
  - Subtraction (with optional borrowing rules: Any, Required, No Borrowing, and negative answer toggle).
  - Multiplication (configurable factor ranges: min 1–20, max 1–25).
  - Division (whole-number divisor and dividend generation).
  - Mixed Operations (pick and choose any combination of the four basic operations).
- **Flexible Timing & Scoring**:
  - Timed mode (configurable 5–120 seconds per question with countdown warning) or untimed mode.
  - Configurable points for correct answers, skip penalties, incorrect penalties, and timeout penalties.
  - Optional negative score toggle.
  - Immediate visual answer feedback (green/red flash with explanatory solution).
- **Web Audio Sound Synthesizer**: Clean, procedural sound effects for correct answers, mistakes, rope pulling, countdown alerts, and match victories (can be toggled on/off).
- **Accessible & Responsive Dual Controls**:
  - Independent answer submission for Blue Team (left) and Red Team (right).
  - On-screen touch numeric keypads for tablets and mobile devices.
  - Physical keyboard shortcuts:
    - **Blue Team**: Top number row `0`–`9`, `Minus` (`-`), `Enter` to submit, `Backspace` to delete, `S` or `Tab` to skip.
    - **Red Team**: Numpad `0`–`9`, Numpad `-`, `Numpad Enter` to submit, `Numpad Delete` / `Delete` to clear, `Numpad +` or `PageDown` to skip.
    - **Global**: `Space` / `P` to Hold/Pause, `R` to open Rules, `O` to open Options, `Escape` to close modals.

---

## 🛠️ Tech Stack

- **Framework**: Modern HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) & TypeScript
- **Graphics**: Scalable Vector Graphics (SVG) with inline keyframe animations and filters
- **Audio**: Web Audio API procedural sound synthesizer (no external audio files required)

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/KashyapMak/tug-war-of-math.git
cd tug-war-of-math
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```
The compiled, production-ready static files will be generated in the `dist/` directory.

### 5. Preview production build
```bash
npm run preview
```

---

## 🌐 Publishing to GitHub Pages

This project is pre-configured to be hosted directly on **GitHub Pages**.

### Method 1: Automatic Deployment via GitHub Actions (Recommended)

This repository includes an automated workflow file in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. **Push your code to GitHub** on the `main` branch:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```
2. In your GitHub repository, navigate to:
   - **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - Set **Source** to **GitHub Actions**.
4. That's it! Every time you push to `main`, GitHub Actions will automatically install dependencies, run `npm run build`, and deploy the `dist` folder to your GitHub Pages URL:
   ```
   https://<username>.github.io/<repository-name>/
   ```

### Method 2: Deploying from the `dist` Directory

If you prefer deploying built files directly:

1. Build the production files:
   ```bash
   npm run build
   ```
2. In GitHub repository **Settings** → **Pages**:
   - Choose **Deploy from a branch**.
   - Select your deployment branch (e.g. `gh-pages` or `main`) and root or `/docs` folder.

> **Note on Base URL**:
> The `vite.config.ts` configuration has `base: './'` enabled, ensuring all script, style, and image paths are relative. This allows the game to function properly whether hosted at the root domain (`https://example.com/`) or within a repository subfolder path (`https://<username>.github.io/<repo-name>/`).

---

## 🎮 Keyboard Controls Reference

| Action | Blue Team (Left) | Red Team (Right) |
| :--- | :--- | :--- |
| **Number Inputs** | Top Row `0`–`9` | Numpad `0`–`9` |
| **Negative Sign** | `-` (Minus key) | Numpad `-` (Minus key) |
| **Backspace / Clear** | `Backspace` | `Delete` or Numpad `.` / `Clear` |
| **Submit Answer** | `Enter` | `Numpad Enter` |
| **Skip Question** | `S` or `Tab` | `Numpad +` or `PageDown` |

| Global Action | Shortcut |
| :--- | :--- |
| **Hold / Pause Game** | `Space` or `P` |
| **Open Options** | `O` |
| **Open Game Rules** | `R` |
| **Close Open Modal** | `Escape` |

---

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages CI/CD workflow
├── public/
│   └── assets/             # Default cartoon team graphics & assets
├── src/
│   ├── game.js             # Core math engine, state management & audio synthesis
│   ├── style.css           # Modular stylesheet and responsive game layouts
│   ├── main.tsx            # Main entry point
│   └── types.ts            # TypeScript definitions
├── index.html              # Main application markup and SVG arena
├── vite.config.ts          # Vite build configuration (with base: './')
├── package.json            # Project dependencies and npm scripts
└── README.md               # Documentation and deployment instructions
```

---

## 👤 Author

**Kashyap Makadia**

- GitHub: [@KashyapMak](https://github.com/KashyapMak)
- LinkedIn: [Kashyap Makadia](https://www.linkedin.com/in/kashyapmakadia)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
