import {
  SETTING_WINDOW_URL,
  TRAY_WINDOW_URL,
  RENAME_WINDOW_URL
} from './constants'
import { IWindowList } from '#/types/enum'
import bus from '@core/bus'
import { CREATE_APP_MENU } from '@core/bus/constants'
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
    bus.emit(CREATE_APP_MENU)
  }
})

windowList.set(IWindowList.RENAME_WINDOW, {
  isValid: true,
  multiple: true,
  options () {
    const options: IBrowserWindowOptions = {
      height: 175,
      width: 300,
      show: true,
      fullscreenable: false,
      resizable: false,
      vibrancy: 'ultra-dark',
      webPreferences: {
        nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        nodeIntegrationInWorker: true,
        backgroundThrottling: false
      }
    }
    if (process.platform !== 'darwin') {
      options.show = true
      options.backgroundColor = '#3f3c37'
      options.autoHideMenuBar = true
      options.transparent = false
    }
    return options
  },
  async callback (window, windowManager) {
    window.loadURL(RENAME_WINDOW_URL)
    const currentWindow = windowManager.getAvailableWindow()
    if (currentWindow && currentWindow.isVisible()) {
    // bounds: { x: 821, y: 75, width: 800, height: 450 }
      const bounds = currentWindow.getBounds()
      const positionX = bounds.x + bounds.width / 2 - 150
      let positionY
      // if is the settingWindow
      if (bounds.height > 400) {
        positionY = bounds.y + bounds.height / 2 - 88
      } else { // if is the miniWindow
        positionY = bounds.y + bounds.height / 2
      }
      window.setPosition(positionX, positionY, false)
    }
  }
})

export default windowList
