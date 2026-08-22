# <p align="center">🔍 DiskLens — Modern Disk Visualizer & Cleaner</p>

<p align="center">
  <img src="assets/Icon.png" alt="DiskLens Logo" width="140" height="140" style="border-radius: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.25);" />
</p>

<p align="center">
  <strong>An ultra-fast, visually stunning disk space analyzer, storage explorer, and duplicate cleaner built for Linux & desktop systems.</strong>
</p>

<p align="center">
  <!-- Status & Release Badges -->
  <img src="https://img.shields.io/badge/Release-v0.1.0-emerald?style=for-the-badge&logo=rocket&logoColor=white" alt="Release v0.1.0" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="License MIT" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Cross--Platform-orange?style=for-the-badge&logo=linux&logoColor=white" alt="Platform Linux" />
</p>

<p align="center">
  <!-- Core Tech Badges -->
  <img src="https://img.shields.io/badge/Tauri_v2-FFC131?style=flat-square&logo=tauri&logoColor=white" alt="Tauri" />
  <img src="https://img.shields.io/badge/Rust_2021-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/D3.js-F9A03C?style=flat-square&logo=d3dotjs&logoColor=white" alt="D3.js" />
  <img src="https://img.shields.io/badge/Arch_Linux-1793D1?style=flat-square&logo=archlinux&logoColor=white" alt="Arch Linux" />
  <img src="https://img.shields.io/badge/Ubuntu-E95420?style=flat-square&logo=ubuntu&logoColor=white" alt="Ubuntu" />
  <img src="https://img.shields.io/badge/Debian-A81D33?style=flat-square&logo=debian&logoColor=white" alt="Debian" />
</p>

<p align="center">
  <a href="#-key-features">✨ Features</a> •
  <a href="#-visual-highlights--modes">🎨 Visual Modes</a> •
  <a href="#-architecture--tech-stack">🏗️ Architecture</a> •
  <a href="#-prerequisites--system-dependencies">🐧 Prerequisites</a> •
  <a href="#-quick-start--development">🚀 Quick Start</a> •
  <a href="#-building-native-binaries--packages">📦 Packaging</a> •
  <a href="#-troubleshooting--faq">❓ FAQ</a>
</p>

---

## 🌟 Highlights at a Glance

| 🚀 **Performance** | 🛡️ **Safety First** | 🎯 **Precision** | 🎨 **Modern UX** |
| :---: | :---: | :---: | :---: |
| Parallel Rayon multithreading reads >100k files/sec | Non-destructive FreeDesktop Trash support | Dual-pass SHA-256 byte-by-byte duplicate validation | Smooth D3 Sunburst & dynamic Treemap drill-down |
| ![](https://img.shields.io/badge/Speed-Blazing_Fast-success?style=flat-square) | ![](https://img.shields.io/badge/Security-Safe_Trash-blue?style=flat-square) | ![](https://img.shields.io/badge/Accuracy-100%25_Cryptographic-purple?style=flat-square) | ![](https://img.shields.io/badge/Design-React19_+_Tailwind-cyan?style=flat-square) |

---

## 🌟 Overview

> **DiskLens** bridges the gap between raw CLI disk performance (like `ncdu` / `dust`) and rich interactive desktop analysis (like `Baobab` / `WinDirStat` / `DaisyDisk`). Engineered with a lightweight **Rust (Tauri v2)** backend and a reactive **React 19 / Vite / Tailwind** frontend, DiskLens brings instantaneous insights into disk usage, system caches, and duplicates without sluggish Electron memory overhead.

---

## ✨ Key Features

### 1. 📊 Interactive Visualizations
- 🌀 **Hierarchical Sunburst Charts**: Multi-level radial partition diagrams built with D3.js allowing seamless zoom, drill-down, and slice isolation.
- 🔲 **Squarified Treemaps**: Dynamic nested bounding boxes proportional to size for instant visual discovery of large files and folders.
- 🧭 **Visual Breadcrumbs & Navigation**: Click into any folder level to recalculate and zoom into local directory allocations with smooth animated transitions.
- 📋 **Tabular Deep Dive**: Sort by size, modification date, file count, and category with search-as-you-type filtering.

### 2. ⚡ High-Throughput Native Scanner
- 🧵 **Multi-Threaded Parallel Traversal**: Leverages Rust's `rayon` and `walkdir` to scan hundreds of thousands of files across standard Linux ext4, btrfs, xfs, ZFS, and mounted external drives in seconds.
- 📡 **Real-Time Scanning Telemetry**: Live progress indicators displaying current file paths, throughput speed, and scanned count.

### 3. 👯 Deep Duplicate Finder
- 🔑 **Two-Pass Heuristic Hashing**:
  1. *Fast Size Bucket*: Pre-filters candidate groups matching exact byte lengths.
  2. *Cryptographic Verification*: Computes streaming SHA-256 hashes to guarantee 100% duplicate accuracy without false positives.
- 🪄 **Smart Auto-Select Strategies**:
  - 🟢 Keep newest / 🔵 keep oldest file.
  - 📏 Keep shortest directory path.
  - 📑 Custom multi-file selection with bulk move-to-trash support.

### 4. 🧹 Large File Hunter & Smart Cleaner
- 🎯 **Threshold-Based Filtering**: Search and filter by file size (e.g. `> 100 MB`, `> 1 GB`, `> 5 GB`), category (Videos, Archives, ISOs, Virtual Disks, Code), or modified dates.
- 🧼 **System Cache & Temp Cleaners**: Guided cleanup for package manager caches (`apt`, `pacman`, `dnf`), browser cache, thumbnail caches, and crash logs.
- 🗑️ **Safe Trashing**: Integrates with standard FreeDesktop Trash (`trash-cli` / `gio trash` specs via Rust `trash` crate) to prevent accidental permanent data loss.

### 5. 💽 Drive & Partition Monitor
- 🎛️ **Drive Dashboard**: Auto-detects mounted filesystems, external USB drives, and NVMe/SATA partitions with usage meters (`sysinfo` integration).

---

## 🎨 Visual Modes & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          🔍 DISKLENS DASHBOARD                         │
├───────────────┬────────────────────────────────────────────────────────┤
│  📁 Drives    │  [ Primary Storage: /dev/nvme0n1p2  |  412 GB / 512 GB ] │
│  📊 Visuals   │  ───────────────────────────────────────────────────── │
│  👥 Duplicates│     [ 🌀 Sunburst ]     [ 🔲 Treemap ]    [ 📋 Table ]  │
│  🧹 Cleaner   │                                                        │
│  ⚙️ Settings  │   ┌────────────────────────────────────────────────┐   │
│               │   │      D3 Reactive Multi-Tier Radial Canvas      │   │
│               │   │       ├── /usr/lib (18.4 GB)                   │   │
│               │   │       ├── /home/user (124.6 GB)                │   │
│               │   │       │    ├── Downloads (42.1 GB)             │   │
│               │   │       │    └── .local/share (19.8 GB)          │   │
│               │   │       └── /var/cache (8.2 GB)                  │   │
│               │   └────────────────────────────────────────────────┘   │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 🏗 Architecture & Tech Stack

```
DiskLens/
├── 📁 assets/                  # High-resolution master branding & icons
│   └── Icon.png
├── 📁 public/                  # Web static files & browser favicons
├── 📁 scripts/                 # Automated cross-platform packaging utilities
│   └── generate-tauri-icons.cjs
├── 📁 src/                     # Modern React 19 Frontend
│   ├── 📁 assets/              # Static frontend assets & bundled icons
│   ├── 📁 components/          # Modular UI components
│   │   ├── 📁 analyzer/        # 🌀 Sunburst, 🔲 Treemap, 📋 List visualizers
│   │   ├── 📁 duplicates/      # 👯 Deep SHA-256 duplicate scanning & bulk actions
│   │   ├── 📁 cleaner/         # 🧹 System cache cleaners & large file hunter
│   │   ├── 📁 layout/          # 🧭 Header, Sidebar navigation, Drive switcher
│   │   └── 📁 common/          # 🎛️ Modals, tooltips, buttons, progress bars
│   ├── 📁 store/               # Zustand state stores (scanStore, appStore, settingsStore)
│   ├── 📁 types/               # TypeScript interface schemas
│   ├── App.tsx                 # Core UI orchestrator
│   └── main.tsx                # Client entrypoint
├── 📁 src-tauri/               # Native Rust Core (Tauri v2)
│   ├── 📁 src/
│   │   └── main.rs             # Multi-threaded filesystem commands & IPC handlers
│   ├── 📁 icons/               # Platform-specific icon sets (PNG, ICO, ICNS)
│   ├── tauri.conf.json         # Window, bundle & security permissions
│   └── Cargo.toml              # Rust crate manifest & dependencies
└── package.json                # Project dependencies & build lifecycle scripts
```

---

## 🐧 Prerequisites & System Dependencies

Choose your Linux distribution below to install the necessary build tools and system libraries:

<details open>
<summary><strong>🔹 Arch Linux / Manjaro / EndeavourOS</strong></summary>

```bash
sudo pacman -Syu --needed \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  gtk3 \
  webkit2gtk-4.1 \
  libayatana-appindicator \
  imagemagick \
  ffmpeg \
  nodejs \
  npm \
  rust \
  cargo
```
</details>

<details>
<summary><strong>🔸 Ubuntu / Debian / Linux Mint / Pop!_OS</strong></summary>

```bash
sudo apt update && sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  imagemagick \
  ffmpeg \
  nodejs \
  npm

# Install latest stable Rust toolchain if not present:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
</details>

<details>
<summary><strong>🔹 Fedora / RHEL / CentOS Stream</strong></summary>

```bash
sudo dnf install \
  @development-tools \
  curl \
  wget \
  openssl-devel \
  gtk3-devel \
  webkit2gtk4.1-devel \
  libayatana-appindicator-gtk3-devel \
  ImageMagick \
  ffmpeg \
  nodejs \
  npm \
  rust \
  cargo
```
</details>

---

## 🚀 Quick Start & Development

### 1️⃣ Clone & Install Dependencies
```bash
git clone https://github.com/disklens/disklens.git
cd disklens
npm install
```

### 2️⃣ Regenerate Multi-Platform Icons *(Optional)*
If you ever update `assets/Icon.png`:
```bash
npm run generate:icons
```

### 3️⃣ Run in Web Browser Mode
Launches the full-stack Vite development server at `http://localhost:3000`:
```bash
npm run dev
```

### 4️⃣ Run Native Desktop App (Live Reload)
Launches the native Tauri desktop window with instant HMR:
```bash
npm run tauri:dev
```

---

## 📦 Building Native Binaries & Packages

### 🛠️ 1. Native Release Build (Auto-Detect)
```bash
npm run tauri:build
```
The optimized native binary will be generated under `src-tauri/target/release/`.

---

### 📦 2. Build Linux `.deb` Installer
Generates a complete Debian package with desktop launcher entry, icon integrations, and MIME associations:
```bash
npm run build:deb
```
- **Output Artifact**: `src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb`
- **Installation**:
  ```bash
  sudo dpkg -i src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb
  # Fix any missing runtime packages:
  sudo apt-get install -f
  ```

---

### 📦 3. Build Universal Linux `AppImage`
Bundles all dependencies into a single executable file that runs anywhere:
```bash
npx tauri build --bundles appimage
```
- **Output Artifact**: `src-tauri/target/release/bundle/appimage/disklens_0.1.0_amd64.AppImage`
- **Running**:
  ```bash
  chmod +x disklens_0.1.0_amd64.AppImage
  ./disklens_0.1.0_amd64.AppImage
  ```

---

## 🛠 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| ⚡ **Dev Server** | `npm run dev` | Launches Express + Vite local web server (`:3000`) |
| 🌐 **Build Web** | `npm run build:web` | Compiles React 19 frontend into static `dist/` bundle |
| 💻 **Tauri Dev** | `npm run tauri:dev` | Launches native desktop window connected to dev server |
| 🏗️ **Tauri Build** | `npm run tauri:build` | Compiles release-mode native desktop binaries |
| 📦 **Debian Package** | `npm run build:deb` | Builds standalone Linux `.deb` package |
| 🎨 **Generate Icons** | `npm run generate:icons` | Generates all platform icons from `assets/Icon.png` |
| 🔍 **Typecheck** | `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| 🧹 **Clean Workspace** | `npm run clean` | Cleans `dist/` and `src-tauri/target/` build caches |

---

## 🛡 Tauri IPC Commands Reference

DiskLens communicates with the native operating system through type-safe Rust commands:

| Rust Command | Arguments | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `get_system_drives` | — | `Vec<DriveInfo>` | Enumerates mounted partitions, filesystem types & available capacity |
| `scan_directory` | `path: Option<String>` | `FileNode` | Parallel recursive file tree traversal with size & category tagging |
| `find_duplicates` | `path: Option<String>` | `Vec<DuplicateGroup>` | Two-pass size bucket + SHA-256 cryptographic verification |
| `get_system_caches` | — | `Vec<CacheItem>` | Inspects package manager caches (`pacman`/`apt`), logs & temp files |
| `clean_caches` | `cache_ids: Vec<String>` | `CleanupResult` | Safely purges selected temporary directories |
| `delete_files` | `paths: Vec<String>, permanent: bool` | `DeleteResult` | Moves files to system Trash (or deletes permanently if requested) |
| `open_file_in_folder` | `path: String` | `Result<(), String>` | Reveals file in native file manager (Nautilus, Dolphin, Thunar) |

---

## ❓ Troubleshooting & FAQ

> [!TIP]
> ### 1. `failed to read icon: Invalid PNG signature`
> Make sure all icon files in `src-tauri/icons/` have valid 8-bit RGBA PNG headers. You can regenerate the entire bundle anytime using:
> ```bash
> npm run generate:icons
> ```

> [!NOTE]
> ### 2. WebKitGTK Errors on Wayland Compositors
> If you encounter GPU acceleration or WebKit issues on certain Wayland setups (Hyprland / Sway / GNOME):
> ```bash
> WEBKIT_DISABLE_COMPOSITING_MODE=1 npm run tauri:dev
> ```

> [!IMPORTANT]
> ### 3. Rust Compiler Type Dereference (`SystemTime`)
> In `src-tauri/src/main.rs`, use `t.into()` (not `(*t).into()`) when converting `std::time::SystemTime` to `chrono::DateTime<Utc>`.

---

## 🤝 Contributing

Contributions, feature requests, and issue reports are always welcome!

1. Fork the Project (`https://github.com/disklens/disklens/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add awesome feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20,24,30&height=100&section=footer" width="100%" />
</p>

<p align="center">
  <sub>Crafted with ❤️ for the Linux & Open Source Desktop Community</sub>
</p>
