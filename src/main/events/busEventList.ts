import bus from '@core/bus'
import {
  createMenu
} from 'apis/app/system'
import { IWindowList } from '#/types/enum'
import windowManager from 'apis/app/window/windowManager'
import {
  GET_WINDOW_ID,
  GET_WINDOW_ID_REPONSE,
  GET_SETTING_WINDOW_ID,
  GET_SETTING_WINDOW_ID_RESPONSE,
  CREATE_APP_MENU
} from '@core/bus/constants'
function initEventCenter () {
  const eventList: any = {
    [GET_WINDOW_ID]: busCallGetWindowId,
    [GET_SETTING_WINDOW_ID]: busCallGetSettingWindowId,
    [CREATE_APP_MENU]: createMenu
  }
  for (const i in eventList) {
    bus.on(i, eventList[i])
  }
}

function busCallGetWindowId () {
  const win = windowManager.getAvailableWindow()
  bus.emit(GET_WINDOW_ID_REPONSE, win.id)
}

function busCallGetSettingWindowId () {
  const settingWindow = windowManager.get(IWindowList.SETTING_WINDOW)!
  bus.emit(GET_SETTING_WINDOW_ID_RESPONSE, settingWindow.id)
}

export default {
  listen () {
    initEventCenter()
  }
}
