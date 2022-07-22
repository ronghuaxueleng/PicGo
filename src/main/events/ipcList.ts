import {
  app,
  ipcMain,
  shell,
  Notification,
  IpcMainEvent,
  BrowserWindow
} from 'electron'
import windowManager from 'apis/app/window/windowManager'
import { IWindowList } from '#/types/enum'
import server from '~/main/server'
import bus from '@core/bus'
import {
  OPEN_DEVTOOLS,
  CLOSE_WINDOW,
  SHOW_MAIN_PAGE_MENU,
  OPEN_USER_STORE_FILE,
  OPEN_URL,
  RELOAD_APP
} from '#/events/constants'
import picgoCoreIPC from './picgoCoreIPC'
import { buildMainPageMenu } from './remotes/menu'
import path from 'path'

const STORE_PATH = app.getPath('userData')

export default {
  listen () {
    picgoCoreIPC.listen()

    ipcMain.on('updateCustomLink', () => {
      const notification = new Notification({
        title: '操作成功',
        body: '你的自定义链接格式已经修改成功'
      })
      notification.show()
    })

    ipcMain.on('autoStart', (evt: IpcMainEvent, val: boolean) => {
      app.setLoginItemSettings({
        openAtLogin: val
      })
    })

    ipcMain.on('openSettingWindow', () => {
      windowManager.get(IWindowList.SETTING_WINDOW)!.show()
    })

    //  from mini window
    ipcMain.on('syncPicBed', () => {
      if (windowManager.has(IWindowList.SETTING_WINDOW)) {
        windowManager.get(IWindowList.SETTING_WINDOW)!.webContents.send('syncPicBed')
      }
    })

    ipcMain.on('updateServer', () => {
      server.restart()
    })
    ipcMain.on(OPEN_DEVTOOLS, (event: IpcMainEvent) => {
      event.sender.openDevTools()
    })
    ipcMain.on(SHOW_MAIN_PAGE_MENU, () => {
      const window = windowManager.get(IWindowList.SETTING_WINDOW)!
      const menu = buildMainPageMenu()
      menu.popup({
        window
      })
    })
    ipcMain.on(CLOSE_WINDOW, () => {
      const window = BrowserWindow.getFocusedWindow()
      if (process.platform === 'linux') {
        window?.hide()
      } else {
        window?.close()
      }
    })
    ipcMain.on(OPEN_USER_STORE_FILE, (evt: IpcMainEvent, filePath: string) => {
      const abFilePath = path.join(STORE_PATH, filePath)
      shell.openPath(abFilePath)
    })
    ipcMain.on(OPEN_URL, (evt: IpcMainEvent, url: string) => {
      shell.openExternal(url)
    })
    ipcMain.on(RELOAD_APP, () => {
      app.relaunch()
      app.exit(0)
    })
  },
  dispose () {}
}
