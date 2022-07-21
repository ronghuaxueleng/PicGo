import windowManager from 'apis/app/window/windowManager'
import { IWindowList } from '#/types/enum'
import { Menu, dialog } from 'electron'
import picgo from '@core/picgo'
import pkg from 'root/package.json'
import GuiApi from 'apis/gui'
import { PICGO_CONFIG_PLUGIN, PICGO_HANDLE_PLUGIN_ING, PICGO_TOGGLE_PLUGIN } from '~/universal/events/constants'
import picgoCoreIPC from '~/main/events/picgoCoreIPC'
import { PicGo as PicGoCore } from 'picgo'

interface GuiMenuItem {
  label: string
  handle: (arg0: PicGoCore, arg1: GuiApi) => Promise<void>
}

const buildMainPageMenu = () => {
  const template = [
    {
      label: '关于',
      click () {
        dialog.showMessageBox({
          title: 'NvwaPrint',
          message: '女娲打印平台组件',
          detail: `Version: ${pkg.version}\nAuthor: caoqiang\nEmail: caoqiang@jiuqi.com.cn`
        })
      }
    }
  ]
  // @ts-ignore
  return Menu.buildFromTemplate(template)
}

const handleRestoreState = (item: string, name: string): void => {
  if (item === 'transformer') {
    const current = picgo.getConfig('picBed.transformer')
    if (current === name) {
      picgo.saveConfig({
        'picBed.transformer': 'path'
      })
    }
  }
}

const buildPluginPageMenu = (plugin: IPicGoPlugin) => {
  const menu = [{
    label: '启用插件',
    enabled: !plugin.enabled,
    click () {
      picgo.saveConfig({
        [`picgoPlugins.${plugin.fullName}`]: true
      })
      const window = windowManager.get(IWindowList.SETTING_WINDOW)!
      window.webContents.send(PICGO_TOGGLE_PLUGIN, plugin.fullName, true)
    }
  }, {
    label: '禁用插件',
    enabled: plugin.enabled,
    click () {
      picgo.saveConfig({
        [`picgoPlugins.${plugin.fullName}`]: false
      })
      const window = windowManager.get(IWindowList.SETTING_WINDOW)!
      window.webContents.send(PICGO_HANDLE_PLUGIN_ING, plugin.fullName)
      window.webContents.send(PICGO_TOGGLE_PLUGIN, plugin.fullName, false)
      if (plugin.config.transformer.name) {
        handleRestoreState('transformer', plugin.config.transformer.name)
      }
    }
  }, {
    label: '卸载插件',
    click () {
      const window = windowManager.get(IWindowList.SETTING_WINDOW)!
      window.webContents.send(PICGO_HANDLE_PLUGIN_ING, plugin.fullName)
      picgoCoreIPC.handlePluginUninstall(plugin.fullName)
    }
  }, {
    label: '更新插件',
    click () {
      const window = windowManager.get(IWindowList.SETTING_WINDOW)!
      window.webContents.send(PICGO_HANDLE_PLUGIN_ING, plugin.fullName)
      picgoCoreIPC.handlePluginUpdate(plugin.fullName)
    }
  }]
  for (const i in plugin.config) {
    if (plugin.config[i].config.length > 0) {
      const obj = {
        label: `配置${i} - ${plugin.config[i].fullName || plugin.config[i].name}`,
        click () {
          const window = windowManager.get(IWindowList.SETTING_WINDOW)!
          const currentType = i
          const configName = plugin.config[i].fullName || plugin.config[i].name
          const config = plugin.config[i].config
          window.webContents.send(PICGO_CONFIG_PLUGIN, currentType, configName, config)
        }
      }
      menu.push(obj)
    }
  }

  // handle transformer
  if (plugin.config.transformer.name) {
    const currentTransformer = picgo.getConfig<string>('picBed.transformer') || 'path'
    const pluginTransformer = plugin.config.transformer.name
    const obj = {
      label: `${currentTransformer === pluginTransformer ? '禁用' : '启用'}transformer - ${plugin.config.transformer.name}`,
      click () {
        const transformer = plugin.config.transformer.name
        const currentTransformer = picgo.getConfig<string>('picBed.transformer') || 'path'
        if (currentTransformer === transformer) {
          picgo.saveConfig({
            'picBed.transformer': 'path'
          })
        } else {
          picgo.saveConfig({
            'picBed.transformer': transformer
          })
        }
      }
    }
    menu.push(obj)
  }

  // plugin custom menus
  if (plugin.guiMenu) {
    menu.push({
      // @ts-ignore
      type: 'separator'
    })
    for (const i of plugin.guiMenu) {
      menu.push({
        label: i.label,
        click () {
          // ipcRenderer.send('pluginActions', plugin.fullName, i.label)
          const picgPlugin = picgo.pluginLoader.getPlugin(plugin.fullName)
          if (picgPlugin?.guiMenu?.(picgo)?.length) {
            const menu: GuiMenuItem[] = picgPlugin.guiMenu(picgo)
            menu.forEach(item => {
              if (item.label === i.label) {
                item.handle(picgo, GuiApi.getInstance())
              }
            })
          }
        }
      })
    }
  }

  // @ts-ignore
  return Menu.buildFromTemplate(menu)
}

export {
  buildMainPageMenu,
  buildPluginPageMenu
}
