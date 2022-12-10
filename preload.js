const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('myapi', {

    sendOSC: async (ip, port, blendshapes) => await ipcRenderer.invoke('sendOSC', ip, port, blendshapes).then((result) => {
      return result;
    }),
    getTwitchConfig: async () => await ipcRenderer.invoke('getTwitchConfig').then((result) => {
      return result;
    }),
    getConfig: async () => await ipcRenderer.invoke('getConfig').then((result) => {
      return result;
    }),
    saveConfig: async (config) => await ipcRenderer.invoke('saveConfig', config).then((result) => {
      return result;
    }),
    getRewards: async () => await ipcRenderer.invoke('getRewards').then((result) => {
      return result;
    }),
    saveRewards: async (rewards) => await ipcRenderer.invoke('saveRewards', rewards).then((result) => {
      return result;
    }),


    // メイン → レンダラー
    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
)