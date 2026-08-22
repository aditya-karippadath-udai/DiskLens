# DiskLens - Tauri Linux (.deb / Desktop) Build Guide

DiskLens is configured with **Tauri v2** and **Rust** to build native standalone desktop executables and Debian `.deb` / AppImage packages for Linux (Arch Linux, Ubuntu, Debian, Pop!_OS, Linux Mint, Fedora, etc.).

---

## ⚠️ Resolving `sh: line 1: tauri: command not found`

If you encounter `tauri: command not found` when running `npm run tauri build`, it is typically caused by one of the following:

1. **`node_modules` is not installed yet**:
   When you clone or download the repo onto your local machine, run:
   ```bash
   npm install
   ```
   This installs `@tauri-apps/cli` and registers the `tauri` binary inside `./node_modules/.bin/`.

2. **Using `npx` directly without global install**:
   You can run the Tauri CLI directly using `npx`:
   ```bash
   npx @tauri-apps/cli build
   ```

3. **Or install the native Cargo Tauri CLI**:
   ```bash
   cargo install tauri-cli --version "^2.0.0"
   ```

---

## 🚀 System Prerequisites

### For Arch Linux / Manjaro / EndeavourOS (`archvm`):

```bash
# 1. Install base build packages and WebKit/GTK dependencies
sudo pacman -S --needed \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  webkit2gtk-4.1 \
  gtk3 \
  libappindicator-gtk3 \
  librsvg

# 2. Install dpkg from AUR (required on Arch Linux to package .deb files)
# Using yay:
yay -S dpkg
# Or using paru:
# paru -S dpkg

# 3. Ensure Rust is installed
sudo pacman -S --needed rust
```

### For Ubuntu / Debian / Pop!_OS / Linux Mint:

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

---

## 🔨 Building the Application

### 1. Install node dependencies:
```bash
npm install
```

### 2. Build the `.deb` package:
```bash
npm run build:deb
```
*or alternatively:*
```bash
npx @tauri-apps/cli build --bundles deb
```

---

## 📦 Output Location

Once compilation finishes, your installer will be generated in:

```
src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb
```
*(and the standalone binary at `src-tauri/target/release/disklens`)*

---

## 💿 Installing the Generated `.deb` Package

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb

# If any dependencies need resolving on Debian/Ubuntu:
sudo apt-get install -f
```

---

## 🛠️ Tauri Architecture & File Structure

```
├── src-tauri/
│   ├── Cargo.toml         # Rust crate manifest, dependencies (tauri, walkdir, sha2, sysinfo, trash, rayon)
│   ├── tauri.conf.json    # Desktop app config & bundle targets ("deb", "appimage")
│   ├── build.rs           # Tauri build hook
│   ├── icons/             # 32x32, 128x128, 256x256 PNGs and app icons
│   └── src/
│       └── main.rs        # Native Rust backend commands (get_storage_drives, get_disk_tree, scan_large_files, delete_files)
├── src/
│   └── services/
│       ├── tauriBridge.ts # Automatically detects Tauri desktop mode vs Web mode
│       └── filesystemService.ts # Seamless invoke bridge to Rust commands
└── package.json           # Scripts ("build:deb", "tauri:build", "tauri:dev")
```
