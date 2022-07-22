import { Menu, dialog } from 'electron'
import pkg from 'root/package.json'
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

export {
  buildMainPageMenu
}
