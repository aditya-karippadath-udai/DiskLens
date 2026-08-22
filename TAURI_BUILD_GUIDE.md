# DiskLens - Tauri Linux (.deb) Build Guide

DiskLens is configured with **Tauri v2** and **Rust** to build native standalone desktop executables and Debian `.deb` packages for Linux (Ubuntu, Debian, Pop!_OS, Linux Mint, etc.).

---

## 🚀 Quick Start: Building the `.deb` Package

### 1. Prerequisites (on Debian/Ubuntu/Mint)

Ensure you have Rust and the required GTK/WebKit system libraries installed:

```bash
# 1. Install system build dependencies
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

# 2. Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

---

### 2. Build the `.deb` Package

Run either of the following npm scripts:

```bash
# Build web assets and compile the .deb package
npm run build:deb
```

or with the Tauri CLI directly:

```bash
npm run tauri:build
```

---

## 📦 Output Location

Once compilation finishes, your `.deb` installer will be located in:

```
src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb
```

---

## 💿 Installing the Generated `.deb` Package

To install DiskLens on your system:

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/disklens_0.1.0_amd64.deb

# If there are missing system dependencies, resolve them with:
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
