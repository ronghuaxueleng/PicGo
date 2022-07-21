import { DBStore } from '@picgo/store'
import ConfigStore from '~/main/apis/core/datastore'
import path from 'path'
import fse from 'fs-extra'
import { PicGo as PicGoCore } from 'picgo'
// from v2.1.2
const updateShortKeyFromVersion212 = (db: typeof ConfigStore, shortKeyConfig: IShortKeyConfigs) => {
  // #557 极端情况可能会出现配置不存在，需要重新写入
  if (shortKeyConfig === undefined) {
    return true
  }
  return false
}

const migrateGalleryFromVersion230 = async (configDB: typeof ConfigStore, galleryDB: DBStore, picgo: PicGoCore) => {
  const originGallery: ImgInfo[] = configDB.get('uploaded')
  const configPath = configDB.getConfigPath()
  const configBakPath = path.join(path.dirname(configPath), 'config.bak.json')
  // migrate gallery from config to gallery db
  if (originGallery && Array.isArray(originGallery) && originGallery?.length > 0) {
    if (fse.existsSync(configBakPath)) {
      fse.copyFileSync(configPath, configBakPath)
    }
    await galleryDB.insertMany(originGallery)
  }
}

export {
  updateShortKeyFromVersion212,
  migrateGalleryFromVersion230
}
