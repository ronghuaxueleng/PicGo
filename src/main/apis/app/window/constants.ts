const isDevelopment = process.env.NODE_ENV !== 'production'

export const TRAY_WINDOW_URL = isDevelopment
  ? (process.env.WEBPACK_DEV_SERVER_URL as string)
  : 'picgo://./index.html'

export const SETTING_WINDOW_URL = isDevelopment
  ? `${(process.env.WEBPACK_DEV_SERVER_URL as string)}#main-page/gallery`
  : 'picgo://./index.html#main-page/gallery'

export const MINI_WINDOW_URL = isDevelopment
  ? `${(process.env.WEBPACK_DEV_SERVER_URL as string)}#mini-page`
  : 'picgo://./index.html#mini-page'
