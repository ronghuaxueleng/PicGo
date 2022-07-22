import {
  app,
  Menu,
  Tray,
  dialog
} from 'electron'
import windowManager from 'apis/app/window/windowManager'
import { IWindowList } from '#/types/enum'
import pkg from 'root/package.json'
let contextMenu: Menu | null
let menu: Menu | null
let tray: Tray | null
export function createContextMenu () {
  if (process.platform === 'darwin' || process.platform === 'win32') {
    contextMenu = Menu.buildFromTemplate([
      {
        label: '关于',
        click () {
          dialog.showMessageBox({
            title: 'NvwaPrint',
            message: '女娲打印平台组件',
            detail: `Version: ${pkg.version}\nAuthor: caoqiang\nEmail: caoqiang@jiuqi.com.cn`
          })
        }
      },
      {
        label: '打开详细窗口',
        click () {
          const settingWindow = windowManager.get(IWindowList.SETTING_WINDOW)
          settingWindow!.show()
          settingWindow!.focus()
        }
      },
      // @ts-ignore
      {
        role: 'quit',
        label: '退出'
      }
    ])
  } else if (process.platform === 'linux') {
    contextMenu = Menu.buildFromTemplate([
      {
        label: '打开详细窗口',
        click () {
          const settingWindow = windowManager.get(IWindowList.SETTING_WINDOW)
          settingWindow!.show()
          settingWindow!.focus()
        }
      },
      {
        label: '关于应用',
        click () {
          dialog.showMessageBox({
            title: 'NvwaPrint',
            message: '女娲打印平台组件',
            buttons: ['Ok'],
            detail: `Version: ${pkg.version}\nAuthor: caoqiang\nEmail: caoqiang@jiuqi.com.cn`
          })
        }
      },
      // @ts-ignore
      {
        role: 'quit',
        label: '退出'
      }
    ])
  }
}

export function createTray () {
  const menubarPic = process.platform === 'darwin' ? `${__static}/menubar.png` : `${__static}/menubar-nodarwin.png`
  tray = new Tray(menubarPic)
  // click事件在Mac和Windows上可以触发（在Ubuntu上无法触发，Unity不支持）
  if (process.platform === 'darwin' || process.platform === 'win32') {
    tray.on('right-click', () => {
      if (windowManager.has(IWindowList.TRAY_WINDOW)) {
        windowManager.get(IWindowList.TRAY_WINDOW)!.hide()
      }
      createContextMenu()
      tray!.popUpContextMenu(contextMenu!)
    })
    tray.on('click', (event, bounds) => {
      if (process.platform === 'darwin') {
        toggleWindow(bounds)
      } else {
        if (windowManager.has(IWindowList.TRAY_WINDOW)) {
          windowManager.get(IWindowList.TRAY_WINDOW)!.hide()
        }
        const settingWindow = windowManager.get(IWindowList.SETTING_WINDOW)
        settingWindow!.show()
        settingWindow!.focus()
      }
    })
  } else if (process.platform === 'linux') {
  // click事件在Ubuntu上无法触发，Unity不支持（在Mac和Windows上可以触发）
  // 需要使用 setContextMenu 设置菜单
    createContextMenu()
    tray!.setContextMenu(contextMenu)
  }
}

export function createMenu () {
  if (process.env.NODE_ENV !== 'development') {
    const template = [{
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click () {
            app.quit()
          }
        }
      ]
    }]
    // @ts-ignore
    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}

const toggleWindow = (bounds: IBounds) => {
  const trayWindow = windowManager.get(IWindowList.TRAY_WINDOW)!
  if (trayWindow.isVisible()) {
    trayWindow.hide()
  } else {
    trayWindow.setPosition(bounds.x - 98 + 11, bounds.y, false)
    trayWindow.webContents.send('updateFiles')
    trayWindow.show()
    trayWindow.focus()
  }
}
