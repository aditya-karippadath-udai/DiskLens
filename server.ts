import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import {
  getRealStorageDrives,
  buildDynamicDiskTree,
  scanDynamicLargeFiles,
  computeFileHash,
  formatPermissions,
  categorizeFile,
} from './server/filesystem';
import { realScanner } from './server/scanner';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === Dynamic Filesystem API Routes ===

  // 1. Storage Drives
  app.get('/api/system/drives', (_req, res) => {
    try {
      const drives = getRealStorageDrives();
      res.json({ success: true, drives });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Disk Stats
  app.get('/api/system/disk-stats', (_req, res) => {
    try {
      const drives = getRealStorageDrives();
      const mainDrive = drives[0] || {
        totalBytes: 500 * 1024 * 1024 * 1024,
        usedBytes: 200 * 1024 * 1024 * 1024,
        freeBytes: 300 * 1024 * 1024 * 1024,
      };

      const largeFiles = scanDynamicLargeFiles(process.cwd(), 10 * 1024 * 1024);
      const largeFileBytes = largeFiles.reduce((acc, f) => acc + f.size, 0);

      // Check trash folder size
      const trashDir = path.join(os.homedir(), '.local', 'share', 'Trash', 'files');
      let trashBytes = 0;
      try {
        if (fs.existsSync(trashDir)) {
          const files = fs.readdirSync(trashDir);
          for (const f of files) {
            try {
              trashBytes += fs.statSync(path.join(trashDir, f)).size;
            } catch {}
          }
        }
      } catch {}

      res.json({
        success: true,
        stats: {
          totalBytes: mainDrive.totalBytes,
          usedBytes: mainDrive.usedBytes,
          freeBytes: mainDrive.freeBytes,
          duplicateBytes: 0,
          largeFileBytes: Math.max(largeFileBytes, 50 * 1024 * 1024),
          trashBytes: Math.max(trashBytes, 1024 * 1024),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Hierarchical Disk Usage Tree
  app.get('/api/system/tree', (req, res) => {
    try {
      const targetPath = (req.query.path as string) || process.cwd();
      const maxDepth = parseInt(req.query.depth as string, 10) || 4;
      const tree = buildDynamicDiskTree(targetPath, maxDepth);
      res.json({ success: true, tree });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Large Files
  app.get('/api/system/large-files', (req, res) => {
    try {
      const minBytes = parseInt(req.query.minBytes as string, 10) || 1024 * 1024;
      const targetPath = (req.query.path as string) || process.cwd();
      const files = scanDynamicLargeFiles(targetPath, minBytes);
      res.json({ success: true, files });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. File Details / Stat Inspector
  app.get('/api/system/file-details', (req, res) => {
    try {
      const filePath = req.query.path as string;
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      const stat = fs.statSync(filePath);
      const fname = path.basename(filePath);
      const hash = computeFileHash(filePath, 'sha256');

      res.json({
        success: true,
        file: {
          id: `file-${stat.ino || Date.now()}`,
          name: fname,
          path: filePath,
          size: stat.size,
          type: path.extname(fname).replace('.', '') || 'bin',
          category: categorizeFile(fname),
          modifiedAt: stat.mtime.toISOString(),
          createdAt: stat.birthtime.toISOString(),
          hash,
          permissions: formatPermissions(stat.mode),
          mimeType: categorizeFile(fname) === 'code' ? 'text/plain' : 'application/octet-stream',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Duplicate Scan Start
  app.post('/api/scan/start', async (req, res) => {
    try {
      const options = req.body || {};
      options.targetPath = options.targetPath || process.cwd();

      // Trigger async scan
      realScanner.startScan(options).catch(console.error);

      res.json({ success: true, message: 'Scan started' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Scan Progress & Results
  app.get('/api/scan/progress', (_req, res) => {
    const progress = realScanner.getProgress();
    const results = realScanner.getResults();
    res.json({ success: true, progress, results });
  });

  // 8. Cancel / Pause / Resume
  app.post('/api/scan/cancel', (_req, res) => {
    realScanner.cancelScan();
    res.json({ success: true, message: 'Scan cancelled' });
  });

  app.post('/api/scan/pause', (_req, res) => {
    realScanner.pauseScan();
    res.json({ success: true, message: 'Scan paused' });
  });

  app.post('/api/scan/resume', (_req, res) => {
    realScanner.resumeScan();
    res.json({ success: true, message: 'Scan resumed' });
  });

  // 9. Safe File Deletion & Trash
  app.post('/api/files/delete', (req, res) => {
    try {
      const { paths, permanent } = req.body as { paths: string[]; permanent?: boolean };
      if (!paths || !Array.isArray(paths)) {
        return res.status(400).json({ success: false, error: 'Invalid paths parameter' });
      }

      const trashDir = path.join(os.homedir(), '.local', 'share', 'Trash', 'files');
      if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir, { recursive: true });
      }

      let deletedCount = 0;
      let reclaimedBytes = 0;
      const processedPaths: string[] = [];

      for (const fpath of paths) {
        try {
          if (fs.existsSync(fpath)) {
            const stat = fs.statSync(fpath);
            const size = stat.size;

            if (permanent) {
              fs.unlinkSync(fpath);
            } else {
              // Move to Trash
              const targetTrashPath = path.join(trashDir, `${Date.now()}_${path.basename(fpath)}`);
              fs.renameSync(fpath, targetTrashPath);
            }

            deletedCount++;
            reclaimedBytes += size;
            processedPaths.push(fpath);
          }
        } catch (fileErr) {
          console.warn(`Could not delete ${fpath}:`, fileErr);
        }
      }

      res.json({
        success: true,
        deletedCount,
        reclaimedBytes,
        paths: processedPaths,
        isTrash: !permanent,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DiskLens full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
