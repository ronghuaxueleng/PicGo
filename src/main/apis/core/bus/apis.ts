import bus from '.'
import {
  GET_WINDOW_ID,
  GET_WINDOW_ID_REPONSE,
  GET_SETTING_WINDOW_ID,
  GET_SETTING_WINDOW_ID_RESPONSE
} from './constants'

// get available window id:
// miniWindow or settingWindow or trayWindow
export const getWindowId = (): Promise<number> => {
  return new Promise((resolve) => {
    bus.once(GET_WINDOW_ID_REPONSE, (id: number) => {
      resolve(id)
    })
    bus.emit(GET_WINDOW_ID)
  })
}

// get settingWindow id:
export const getSettingWindowId = (): Promise<number> => {
  return new Promise((resolve) => {
    bus.once(GET_SETTING_WINDOW_ID_RESPONSE, (id: number) => {
      resolve(id)
    })
    bus.emit(GET_SETTING_WINDOW_ID)
  })
}
