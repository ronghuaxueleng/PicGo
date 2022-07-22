import {
  SETTING_WINDOW_URL,
  TRAY_WINDOW_URL
} from './constants'
import { IWindowList } from '#/types/enum'
import { app } from 'electron'

const windowList = new Map<IWindowList, IWindowListItem>()

windowList.set(IWindowList.TRAY_WINDOW, {
  isValid: process.platform !== 'linux',
  multiple: false,
  options () {
    return {
      height: 350,
      width: 196, // 196
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: true,
      vibrancy: 'ultra-dark',
      webPreferences: {
        nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        nodeIntegrationInWorker: true,
        backgroundThrottling: false
      }
    }
  },
  callback (window) {
    window.loadURL(TRAY_WINDOW_URL)
    window.on('blur', () => {
      window.hide()
    })
  }
})

windowList.set(IWindowList.SETTING_WINDOW, {
  isValid: true,
  multiple: false,
  options () {
    const options: IBrowserWindowOptions = {
      height: 450,
      width: 800,
      show: false,
      frame: true,
      center: true,
      fullscreenable: false,
      resizable: false,
      title: 'PicGo',
      vibrancy: 'ultra-dark',
      transparent: true,
      titleBarStyle: 'hidden',
      webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        nodeIntegrationInWorker: true,
        webSecurity: false
      }
    }
    if (process.platform !== 'darwin') {
      options.show = false
      options.frame = false
      options.backgroundColor = '#3f3c37'
      options.transparent = false
      options.icon = `${__static}/logo.png`
    }
    return options
  },
  callback (window) {
    window.loadURL(SETTING_WINDOW_URL)
    window.on('closed', () => {
      if (process.platform === 'linux') {
        process.nextTick(() => {
          app.quit()
        })
      }
    })
  }
})

export default windowList
