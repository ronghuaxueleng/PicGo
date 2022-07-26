import './errorHandler'
import {
  app,
  globalShortcut,
  protocol,
  Notification
} from 'electron'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import beforeOpen from '~/main/utils/beforeOpen'
import ipcList from '~/main/events/ipcList'
import busEventList from '~/main/events/busEventList'
import { IWindowList } from '#/types/enum'
import windowManager from 'apis/app/window/windowManager'
import {
  migrateGalleryFromVersion230
} from '~/main/migrate'
import {
  createTray
} from 'apis/app/system'
import db, { GalleryDB } from '~/main/apis/core/datastore'
import bus from '@core/bus'
import picgo from 'apis/core/picgo'

const isDevelopment = process.env.NODE_ENV !== 'production'

class LifeCycle {
  private async beforeReady () {
    protocol.registerSchemesAsPrivileged([{ scheme: 'picgo', privileges: { secure: true, standard: true } }])
    // https://stackoverflow.com/questions/56691391/dynamic-loading-of-external-modules-in-webpack-fails
    const fixPath = (await import(/* webpackIgnore: true */ 'fix-path')).default
    // fix the $PATH in macOS & linux
    fixPath()
    beforeOpen()
    ipcList.listen()
    busEventList.listen()
    await migrateGalleryFromVersion230(db, GalleryDB.getInstance(), picgo)
  }

  private onReady () {
    const readyFunction = async () => {
      console.log('on ready')
      createProtocol('picgo')
      windowManager.create(IWindowList.TRAY_WINDOW)
      windowManager.create(IWindowList.SETTING_WINDOW)
      createTray()
      db.set('needReload', false)
      if (global.notificationList && global.notificationList?.length > 0) {
        while (global.notificationList?.length) {
          const option = global.notificationList.pop()
          const notice = new Notification(option!)
          notice.show()
        }
      }
    }
    if (!app.isReady()) {
      app.on('ready', readyFunction)
    } else {
      readyFunction()
    }
  }

  private onRunning () {
    app.on('activate', () => {
      createProtocol('picgo')
      if (!windowManager.has(IWindowList.TRAY_WINDOW)) {
        windowManager.create(IWindowList.TRAY_WINDOW)
      }
      if (!windowManager.has(IWindowList.SETTING_WINDOW)) {
        windowManager.create(IWindowList.SETTING_WINDOW)
      }
    })
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.molunerfinn.picgo')
    }

    if (process.env.XDG_CURRENT_DESKTOP && process.env.XDG_CURRENT_DESKTOP.includes('Unity')) {
      process.env.XDG_CURRENT_DESKTOP = 'Unity'
    }
  }

  private onQuit () {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
      bus.removeAllListeners()
    })
    // Exit cleanly on request from parent process in development mode.
    if (isDevelopment) {
      if (process.platform === 'win32') {
        process.on('message', data => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
  }

  async launchApp () {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      await this.beforeReady()
      this.onReady()
      this.onRunning()
      this.onQuit()
    }
  }
}

const bootstrap = new LifeCycle()

export {
  bootstrap
}
