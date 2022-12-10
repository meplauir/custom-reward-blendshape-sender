const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs');
const stateKeeper = require('electron-window-state')

let win;
const is_development = false;

app.whenReady().then(() => {

  let windowState = stateKeeper({
    defaultWidth: 960,
    defaultHeight: 540,
  });

  const createWindow = () => {
    win = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      nodeIntegration: true,
      contextIsolation: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    
    win.loadFile('index.html')
    
    if (is_development) {
      win.webContents.openDevTools()
    } else {
      win.setMenu(null)
    }
    windowState.manage(win)
  }

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
}) 

/**
 * 設定値系
 */
// Twitch接続用
 ipcMain.handle('getTwitchConfig', (event) => {
  const config = JSON.parse(fs.readFileSync(__dirname + '/config/twitch_config.json', 'utf8'));
  return config;
})
// グローバル設定
ipcMain.handle('getConfig', (event) => {
  const config = JSON.parse(fs.readFileSync(__dirname + '/config/config.json', 'utf8'));
  return config;
})
ipcMain.handle('saveConfig', (event, config) => {
  const json = JSON.stringify(config);
  try {
    fs.writeFileSync(__dirname + '/config/config.json', json, 'utf8')
  } catch(err) {
    return false;
  }
  return true;
})
// カスタム報酬
ipcMain.handle('getRewards', (event) => {
  const rewards = JSON.parse(fs.readFileSync(__dirname + '/config/custom_rewards.json', 'utf8'));
  return rewards;
})
ipcMain.handle('saveRewards', (event, rewards) => {
  const json = JSON.stringify(rewards);
  try {
    fs.writeFileSync(__dirname + '/config/custom_rewards.json', json, 'utf8')
  } catch(err) {
    return false;
  }
  return true;
})

/**
 * メインプロセス（VMC/OSC）
 */
const { Bundle, Client, Message, Server } = require('node-osc');
const { config } = require('process');

// OSC送信
ipcMain.handle('sendOSC', (event, ip, port, blendshapes) => {

  let result = [];
  const client = new Client(ip, parseInt(port));
  const bundle = new Bundle();
  bundle.timetag = 0;
  blendshapes.forEach(bs => {
    bundle.elements.push(new Message('/VMC/Ext/Blend/Val', bs.name, parseFloat(bs.value)));
    result.push({name: bs.name, status: bs.value > 0 ? true : false });
  });
  bundle.elements.push(new Message('/VMC/Ext/Blend/Apply'))

  client.send(bundle, (err) => {
    client.close();
  });

  return result;
});



