const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const remoteMain = require("@electron/remote/main");

let main, sec;
remoteMain.initialize();

const createWindow = () => {
  main = new BrowserWindow({
    width: 360,
    minWidth: 360,
    maxWidth: 360,
    height: 500,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  main.loadFile(path.join(__dirname, './view/index.html'));
  // main.webContents.openDevTools();
  remoteMain.enable(main.webContents);
};

const createWindow2 = () => {
  sec = new BrowserWindow({
    // width: 400,
    height: 300,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  sec.loadFile(path.join(__dirname, './view/second.html'));
  sec.setParentWindow(main);
  sec.setAspectRatio(16 / 9);
  // sec.webContents.openDevTools();
};

app.on('ready', () => {
  createWindow();
  createWindow2();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createWindow2();
  }
});

/* code */
ipcMain.on('addImage', (event, args) => {
  dialog
    .showOpenDialog({
      properties: ["openFile"], filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }
      ],
    })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        const fileName = path.parse(filePath).name;
        console.log({ name: fileName, src: filePath });
        main.webContents.send('addImage', { name: fileName, src: filePath })
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on('showImg', (event, args) => {
  sec.webContents.send('showImg', args);
});