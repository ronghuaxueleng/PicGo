import path from 'path'
import GuiApi from 'apis/gui'
import {
  shell,
  IpcMainEvent,
  ipcMain

} from 'electron'
import picgo from '@core/picgo'
import { dbPathChecker } from 'apis/core/datastore/dbChecker'
import {
  PICGO_SAVE_CONFIG,
  PICGO_GET_CONFIG,
  PICGO_GET_DB,
  PICGO_INSERT_DB,
  PICGO_INSERT_MANY_DB,
  PICGO_GET_BY_ID_DB,
  PICGO_REMOVE_BY_ID_DB,
  PICGO_OPEN_FILE
} from '#/events/constants'

import { GalleryDB } from 'apis/core/datastore'
import { IObject, IFilter } from '@picgo/store/dist/types'

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
