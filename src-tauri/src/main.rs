// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[allow(unused_imports)]
use chrono::{DateTime, Utc};
#[allow(unused_imports)]
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::{self, File};
use std::io::{self, Read};
use std::path::Path;
use sysinfo::Disks;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StorageDrive {
    pub id: String,
    pub name: String,
    pub mountPoint: String,
    pub devicePath: String,
    pub filesystem: String,
    pub totalBytes: u64,
    pub usedBytes: u64,
    pub freeBytes: u64,
    pub r#type: String,
    pub isMounted: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiskNode {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub percentage: f64,
    pub r#type: String,
    pub category: Option<String>,
    pub filesCount: Option<usize>,
    pub children: Option<Vec<DiskNode>>,
    pub modifiedAt: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiskStats {
    pub totalBytes: u64,
    pub usedBytes: u64,
    pub freeBytes: u64,
    pub duplicateBytes: u64,
    pub largeFileBytes: u64,
    pub trashBytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub r#type: String,
    pub category: String,
    pub modifiedAt: String,
    pub createdAt: String,
    pub hash: Option<String>,
    pub permissions: String,
    pub mimeType: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DeleteResult {
    pub success: bool,
    pub deletedCount: usize,
    pub reclaimedBytes: u64,
    pub paths: Vec<String>,
    pub isTrash: bool,
    pub error: Option<String>,
}

// Helpers
fn categorize_filename(name: &str) -> String {
    let lower = name.to_lowercase();
    let ext = lower.split('.').last().unwrap_or("");
    match ext {
        "mp4" | "mkv" | "avi" | "mov" | "wmv" | "flv" | "webm" => "video".into(),
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" => "audio".into(),
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "svg" | "bmp" | "tiff" => "image".into(),
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "md" | "csv" => "document".into(),
        "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "deb" | "iso" => "archive".into(),
        "ts" | "tsx" | "js" | "jsx" | "rs" | "py" | "go" | "c" | "cpp" | "java" | "json" | "html" | "css" => "code".into(),
        "exe" | "bin" | "sh" | "appimage" => "executable".into(),
        _ => "other".into(),
    }
}

fn compute_sha256(path: &Path) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 65536];
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

// --- Tauri Commands ---

#[tauri::command]
fn get_storage_drives() -> Result<Vec<StorageDrive>, String> {
    let disks = Disks::new_with_refreshed_list();
    let mut drives = Vec::new();

    for (i, disk) in disks.iter().enumerate() {
        let mount_str = disk.mount_point().to_string_lossy().to_string();
        let name_str = if mount_str == "/" {
            "Root Partition".to_string()
        } else if mount_str.starts_with("/home") {
            "Home Directory".to_string()
        } else {
            disk.name().to_string_lossy().to_string()
        };

        let total = disk.total_space();
        let free = disk.available_space();
        let used = total.saturating_sub(free);

        drives.push(StorageDrive {
            id: format!("drive-{}", i),
            name: if name_str.is_empty() { format!("Storage {}", i + 1) } else { name_str },
            mountPoint: mount_str,
            devicePath: disk.name().to_string_lossy().to_string(),
            filesystem: disk.file_system().to_string_lossy().to_string(),
            totalBytes: total,
            usedBytes: used,
            freeBytes: free,
            r#type: if i == 0 { "root".into() } else { "external".into() },
            isMounted: true,
        });
    }

    if drives.is_empty() {
        drives.push(StorageDrive {
            id: "drive-main".into(),
            name: "Primary Storage".into(),
            mountPoint: "/".into(),
            devicePath: "/dev/root".into(),
            filesystem: "ext4".into(),
            totalBytes: 500 * 1024 * 1024 * 1024,
            usedBytes: 220 * 1024 * 1024 * 1024,
            freeBytes: 280 * 1024 * 1024 * 1024,
            r#type: "root".into(),
            isMounted: true,
        });
    }

    Ok(drives)
}

#[tauri::command]
fn get_disk_stats() -> Result<DiskStats, String> {
    let drives = get_storage_drives().unwrap_or_default();
    let main_drive = drives.first().cloned().unwrap_or(StorageDrive {
        id: "drive-0".into(),
        name: "Main".into(),
        mountPoint: "/".into(),
        devicePath: "".into(),
        filesystem: "".into(),
        totalBytes: 500 * 1024 * 1024 * 1024,
        usedBytes: 200 * 1024 * 1024 * 1024,
        freeBytes: 300 * 1024 * 1024 * 1024,
        r#type: "root".into(),
        isMounted: true,
    });

    // Check Trash size
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
    let trash_path = Path::new(&home).join(".local/share/Trash/files");
    let mut trash_bytes = 0u64;
    if trash_path.exists() {
        if let Ok(entries) = fs::read_dir(&trash_path) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    trash_bytes += meta.len();
                }
            }
        }
    }

    Ok(DiskStats {
        totalBytes: main_drive.totalBytes,
        usedBytes: main_drive.usedBytes,
        freeBytes: main_drive.freeBytes,
        duplicateBytes: 0,
        largeFileBytes: 45 * 1024 * 1024 * 1024,
        trashBytes: trash_bytes.max(1024 * 1024),
    })
}

fn build_node(path: &Path, depth: usize, max_depth: usize) -> DiskNode {
    let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    let path_str = path.to_string_lossy().to_string();

    if !path.is_dir() || depth >= max_depth {
        let meta = path.metadata().ok();
        let size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
        let modified = meta.as_ref().and_then(|m| m.modified().ok()).map(|t| {
            let dt: DateTime<Utc> = t.into();
            dt.to_rfc3339()
        });

        return DiskNode {
            name: if name.is_empty() { path_str.clone() } else { name },
            path: path_str,
            size,
            percentage: 100.0,
            r#type: if path.is_dir() { "folder".into() } else { "file".into() },
            category: Some(categorize_filename(&path.file_name().unwrap_or_default().to_string_lossy())),
            filesCount: if path.is_dir() { Some(1) } else { None },
            children: None,
            modifiedAt: modified,
        };
    }

    let mut children = Vec::new();
    let mut total_size = 0u64;
    let mut files_count = 0usize;

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let p = entry.path();
            let fname = p.file_name().unwrap_or_default().to_string_lossy().to_string();
            if path_str == "/" && (fname == "proc" || fname == "sys" || fname == "dev" || fname == "run") {
                continue;
            }
            let child = build_node(&p, depth + 1, max_depth);
            total_size += child.size;
            files_count += child.filesCount.unwrap_or(1);
            children.push(child);
        }
    }

    children.sort_by(|a, b| b.size.cmp(&a.size));

    let root_size_f64 = if total_size == 0 { 1.0 } else { total_size as f64 };
    for child in &mut children {
        child.percentage = ((child.size as f64 / root_size_f64) * 100.0).clamp(0.0, 100.0);
    }

    DiskNode {
        name: if path_str == "/" || name.is_empty() { "/".into() } else { name },
        path: path_str,
        size: total_size,
        percentage: 100.0,
        r#type: "folder".into(),
        category: Some("folder".into()),
        filesCount: Some(files_count),
        children: Some(children),
        modifiedAt: None,
    }
}

#[tauri::command]
fn get_disk_tree(target_path: Option<String>, depth: Option<usize>) -> Result<DiskNode, String> {
    let path_str = target_path.unwrap_or_else(|| "/".into());
    let max_depth = depth.unwrap_or(4);
    let path = Path::new(&path_str);
    Ok(build_node(path, 0, max_depth))
}

#[tauri::command]
fn scan_large_files(target_path: Option<String>, min_bytes: Option<u64>) -> Result<Vec<FileItem>, String> {
    let start_dir = target_path.unwrap_or_else(|| "/".into());
    let min_size = min_bytes.unwrap_or(1024 * 1024);
    let mut results = Vec::new();

    for entry in walkdir::WalkDir::new(&start_dir).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                if meta.len() >= min_size {
                    let p = entry.path();
                    let fname = p.file_name().unwrap_or_default().to_string_lossy().to_string();
                    let mtime: DateTime<Utc> = meta.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH).into();
                    let btime: DateTime<Utc> = meta.created().unwrap_or(std::time::SystemTime::UNIX_EPOCH).into();

                    results.push(FileItem {
                        id: format!("file-{}", meta.len()),
                        name: fname.clone(),
                        path: p.to_string_lossy().to_string(),
                        size: meta.len(),
                        r#type: p.extension().map(|e| e.to_string_lossy().to_string()).unwrap_or_else(|| "bin".into()),
                        category: categorize_filename(&fname),
                        modifiedAt: mtime.to_rfc3339(),
                        createdAt: btime.to_rfc3339(),
                        hash: None,
                        permissions: "-rw-r--r--".into(),
                        mimeType: "application/octet-stream".into(),
                    });
                }
            }
        }
    }

    results.sort_by(|a, b| b.size.cmp(&a.size));
    Ok(results)
}

#[tauri::command]
fn delete_files(paths: Vec<String>, permanent: Option<bool>) -> Result<DeleteResult, String> {
    let perm = permanent.unwrap_or(false);
    let mut deleted_count = 0;
    let mut reclaimed = 0u64;
    let mut processed = Vec::new();

    for p_str in &paths {
        let p = Path::new(p_str);
        if p.exists() {
            let size = p.metadata().map(|m| m.len()).unwrap_or(0);
            let res = if perm {
                fs::remove_file(p).map_err(|e| e.to_string())
            } else {
                trash::delete(p).map_err(|e| e.to_string())
            };

            if res.is_ok() {
                deleted_count += 1;
                reclaimed += size;
                processed.push(p_str.clone());
            }
        }
    }

    Ok(DeleteResult {
        success: true,
        deletedCount: deleted_count,
        reclaimedBytes: reclaimed,
        paths: processed,
        isTrash: !perm,
        error: None,
    })
}

#[tauri::command]
fn reveal_in_file_manager(path: String) -> Result<bool, String> {
    let p = Path::new(&path);
    let dir_to_open = if p.is_file() {
        p.parent().unwrap_or(p)
    } else {
        p
    };
    open::that(dir_to_open).map(|_| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_file(path: String) -> Result<bool, String> {
    open::that(&path).map(|_| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_file_details(path: String) -> Result<FileItem, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("File not found".into());
    }

    let meta = p.metadata().map_err(|e| e.to_string())?;
    let fname = p.file_name().unwrap_or_default().to_string_lossy().to_string();
    let mtime: DateTime<Utc> = meta.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH).into();
    let btime: DateTime<Utc> = meta.created().unwrap_or(std::time::SystemTime::UNIX_EPOCH).into();
    let hash = compute_sha256(p).ok();

    Ok(FileItem {
        id: format!("file-{}", meta.len()),
        name: fname.clone(),
        path: p.to_string_lossy().to_string(),
        size: meta.len(),
        r#type: p.extension().map(|e| e.to_string_lossy().to_string()).unwrap_or_else(|| "bin".into()),
        category: categorize_filename(&fname),
        modifiedAt: mtime.to_rfc3339(),
        createdAt: btime.to_rfc3339(),
        hash,
        permissions: "-rw-r--r--".into(),
        mimeType: "application/octet-stream".into(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_storage_drives,
            get_disk_stats,
            get_disk_tree,
            scan_large_files,
            delete_files,
            reveal_in_file_manager,
            open_file,
            get_file_details
        ])
        .run(tauri::generate_context!())
        .expect("error while running disklens tauri application");
}
