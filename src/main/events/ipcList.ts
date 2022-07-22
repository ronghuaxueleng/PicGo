import {
  app,
  ipcMain,
  shell,
  IpcMainEvent,
  BrowserWindow
} from 'electron'
import windowManager from 'apis/app/window/windowManager'
import { IWindowList } from '#/types/enum'
import {
  OPEN_DEVTOOLS,
  CLOSE_WINDOW,
  SHOW_MAIN_PAGE_MENU,
  OPEN_USER_STORE_FILE
} from '#/events/constants'
import picgoCoreIPC from './picgoCoreIPC'
import { buildMainPageMenu } from './remotes/menu'
import path from 'path'

const STORE_PATH = app.getPath('userData')

export default {
  listen () {
    picgoCoreIPC.listen()

    ipcMain.on('openSettingWindow', () => {
      windowManager.get(IWindowList.SETTING_WINDOW)!.show()
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
  },
  dispose () {}
}
