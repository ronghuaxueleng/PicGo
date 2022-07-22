import path from 'path'
import GuiApi from 'apis/gui'
import {
  shell,
  IpcMainEvent,
  ipcMain,
  clipboard
} from 'electron'
import { IPasteStyle } from '#/types/enum'
import picgo from '@core/picgo'
import { dbPathChecker } from 'apis/core/datastore/dbChecker'
import {
  PICGO_SAVE_CONFIG,
  PICGO_GET_CONFIG,
  PICGO_GET_DB,
  PICGO_INSERT_DB,
  PICGO_INSERT_MANY_DB,
  PICGO_UPDATE_BY_ID_DB,
  PICGO_GET_BY_ID_DB,
  PICGO_REMOVE_BY_ID_DB,
  PICGO_OPEN_FILE,
  PASTE_TEXT
} from '#/events/constants'

import { GalleryDB } from 'apis/core/datastore'
import { IObject, IFilter } from '@picgo/store/dist/types'
import pasteTemplate from '../utils/pasteTemplate'

// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const STORE_PATH = path.dirname(dbPathChecker())
const handleRemoveFiles = () => {
  ipcMain.on('removeFiles', (event: IpcMainEvent, files: ImgInfo[]) => {
    setTimeout(() => {
      picgo.emit('remove', files, GuiApi.getInstance())
    }, 500)
  })
}

const handlePicGoSaveConfig = () => {
  ipcMain.on(PICGO_SAVE_CONFIG, (event: IpcMainEvent, data: IObj) => {
    picgo.saveConfig(data)
  })
}

const handlePicGoGetConfig = () => {
  ipcMain.on(PICGO_GET_CONFIG, (event: IpcMainEvent, key: string | undefined, callbackId: string) => {
    const result = picgo.getConfig(key)
    event.sender.send(PICGO_GET_CONFIG, result, callbackId)
  })
}

const handlePicGoGalleryDB = () => {
  ipcMain.on(PICGO_GET_DB, async (event: IpcMainEvent, filter: IFilter, callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.get(filter)
    event.sender.send(PICGO_GET_DB, res, callbackId)
  })

  ipcMain.on(PICGO_INSERT_DB, async (event: IpcMainEvent, value: IObject, callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.insert(value)
    event.sender.send(PICGO_INSERT_DB, res, callbackId)
  })

  ipcMain.on(PICGO_INSERT_MANY_DB, async (event: IpcMainEvent, value: IObject[], callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.insertMany(value)
    event.sender.send(PICGO_INSERT_MANY_DB, res, callbackId)
  })

  ipcMain.on(PICGO_UPDATE_BY_ID_DB, async (event: IpcMainEvent, id: string, value: IObject[], callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.updateById(id, value)
    event.sender.send(PICGO_UPDATE_BY_ID_DB, res, callbackId)
  })

  ipcMain.on(PICGO_GET_BY_ID_DB, async (event: IpcMainEvent, id: string, callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.getById(id)
    event.sender.send(PICGO_GET_BY_ID_DB, res, callbackId)
  })

  ipcMain.on(PICGO_REMOVE_BY_ID_DB, async (event: IpcMainEvent, id: string, callbackId: string) => {
    const dbStore = GalleryDB.getInstance()
    const res = await dbStore.removeById(id)
    event.sender.send(PICGO_REMOVE_BY_ID_DB, res, callbackId)
  })

  ipcMain.handle(PASTE_TEXT, async (item: ImgInfo, copy = true) => {
    const pasteStyle = picgo.getConfig<IPasteStyle>('settings.pasteStyle') || IPasteStyle.MARKDOWN
    const customLink = picgo.getConfig<string>('settings.customLink')
    const txt = pasteTemplate(pasteStyle, item, customLink)
    if (copy) {
      clipboard.writeText(txt)
    }
    return txt
  })
}

const handleOpenFile = () => {
  ipcMain.on(PICGO_OPEN_FILE, (event: IpcMainEvent, fileName: string) => {
    const abFilePath = path.join(STORE_PATH, fileName)
    shell.openPath(abFilePath)
  })
}

export default {
  listen () {
    handleRemoveFiles()
    handlePicGoSaveConfig()
    handlePicGoGetConfig()
    handlePicGoGalleryDB()
    handleOpenFile()
  }
}
