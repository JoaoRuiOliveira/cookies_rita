const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

let backendProcess;
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Rita's Cookies",
    icon: path.join(__dirname, '../build/cookie.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false  // Don't show the window until it's ready
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();  // Show window when content is ready
    log('Window shown to user');
  });

  // Try to load the Angular build output from multiple possible locations
  let indexPath;
  const isDev = !app.isPackaged;
  if (isDev) {
    indexPath = path.join(__dirname, '../dist/frontend/browser/index.html');
    log('DEV: Trying to load index.html from: ' + indexPath);
    mainWindow.loadURL(`file://${indexPath.replace(/\\/g, '/')}`).catch(err => {
      log('Failed to load index.html: ' + err);
      showError('Failed to load application interface', err.message);
    });
  } else {
    // First try the most likely production path
    indexPath = path.join(__dirname, '../dist/frontend/browser/index.html');
    log('PROD: Trying to load index.html from: ' + indexPath);
    if (fs.existsSync(indexPath)) {
      mainWindow.loadURL(`file://${indexPath.replace(/\\/g, '/')}`).catch(err => {
        log('Failed to load index.html: ' + err);
        showError('Failed to load application interface', err.message);
      });
    } else {
      // Fallback: try resourcesPath
      indexPath = path.join(process.resourcesPath, 'dist', 'frontend', 'browser', 'index.html');
      log('PROD: Fallback, trying to load index.html from: ' + indexPath);
      mainWindow.loadURL(`file://${indexPath.replace(/\\/g, '/')}`).catch(err => {
        log('Failed to load index.html: ' + err);
        showError('Failed to load application interface', err.message);
      });
    }
  }

  return mainWindow;
}

function showError(title, message) {
  log(`Showing error dialog - ${title}: ${message}`);
  if (mainWindow) {
    dialog.showErrorBox(title, message);
  }
}

const logFile = path.join(app.getPath('userData'), 'main.log');
function log(msg) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${msg}`;
  console.log(logMessage);  // Also log to console for development
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function isBackendRunning() {
  try {
    const res = await axios.get('http://localhost:8000/health', { timeout: 1000 });
    log('Backend health check successful');
    return res.data.status === 'ok';
  } catch (e) {
    log('Backend health check failed: ' + e.message);
    return false;
  }
}

async function waitForBackend(retries = 20, delay = 500) {
  log(`Waiting for backend to start (${retries} attempts, ${delay}ms delay)`);
  for (let i = 0; i < retries; i++) {
    if (await isBackendRunning()) {
      log('Backend is now running');
      return true;
    }
    log(`Backend not ready, attempt ${i + 1}/${retries}`);
    await new Promise(res => setTimeout(res, delay));
  }
  return false;
}

app.whenReady().then(async () => {
  const isDev = !app.isPackaged;
  let backendPath;

  if (isDev) {
    backendPath = path.join(__dirname, 'backend', 'app.exe');
  } else {
    backendPath = path.join(process.resourcesPath, 'backend', 'app.exe');
  }

  log('Resolved backendPath: ' + backendPath);

  // Create window first so we can show errors
  mainWindow = createWindow();

  // Check if backend is already running
  let backendRunning = await isBackendRunning();
  if (!backendRunning) {
    // Check if the backend executable exists before spawning
    if (!fs.existsSync(backendPath)) {
      const error = 'Backend executable not found at: ' + backendPath;
      log(error);
      showError('Backend Error', error);
      return;
    }

    try {
      log('Starting backend process...');
      backendProcess = spawn(backendPath, [], {
        cwd: path.dirname(backendPath),
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Log backend stdout and stderr
      backendProcess.stdout.on('data', (data) => {
        log('Backend stdout: ' + data);
      });
      backendProcess.stderr.on('data', (data) => {
        log('Backend stderr: ' + data);
      });

      backendProcess.on('error', (err) => {
        log('Backend process error: ' + err);
        showError('Backend Error', 'Failed to start backend: ' + err.message);
      });

      log('Backend process started successfully. Waiting for backend to be available...');
      
      // Wait for backend to be available
      backendRunning = await waitForBackend();
      if (!backendRunning) {
        const error = 'Backend did not start in time.';
        log(error);
        showError('Backend Error', error);
      }
    } catch (err) {
      const error = 'Failed to start backend process: ' + err;
      log(error);
      showError('Backend Error', error);
    }
  } else {
    log('Backend already running.');
  }
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      log('Killing backend process...');
      backendProcess.kill();
    }
    app.quit();
  }
}); 