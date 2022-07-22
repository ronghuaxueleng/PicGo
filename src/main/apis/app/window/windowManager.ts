import { BrowserWindow } from 'electron'
import windowList from './windowList'
import { IWindowList } from '#/types/enum'

class WindowManager implements IWindowManager {
  private windowMap: Map<IWindowList | string, BrowserWindow> = new Map()
  private windowIdMap: Map<number, IWindowList | string> = new Map()
  create (name: IWindowList) {
    const windowConfig: IWindowListItem = windowList.get(name)!
    if (windowConfig.isValid) {
      if (!windowConfig.multiple) {
        if (this.has(name)) return this.windowMap.get(name)!
      }
      const window = new BrowserWindow(windowConfig.options())
      const id = window.id
      if (windowConfig.multiple) {
        this.windowMap.set(`${name}_${window.id}`, window)
        this.windowIdMap.set(window.id, `${name}_${window.id}`)
      } else {
        this.windowMap.set(name, window)
        this.windowIdMap.set(window.id, name)
      }
      // @ts-ignore
      windowConfig.callback(window)
      window.on('close', () => {
        this.deleteById(id)
      })
      return window
    } else {
      return null
    }
  }

  get (name: IWindowList) {
    if (this.has(name)) {
      return this.windowMap.get(name)!
    } else {
      return this.create(name)
    }
  }

  has (name: IWindowList) {
    return this.windowMap.has(name)
  }

  deleteById = (id: number) => {
    const name = this.windowIdMap.get(id)
    if (name) {
      this.windowMap.delete(name)
      this.windowIdMap.delete(id)
    }
  }

  getAvailableWindow () {
    const settingWindow = this.windowMap.get(IWindowList.SETTING_WINDOW)
    const trayWindow = this.windowMap.get(IWindowList.TRAY_WINDOW)
    return settingWindow || trayWindow || this.create(IWindowList.SETTING_WINDOW)!
  }
}

export default new WindowManager()
