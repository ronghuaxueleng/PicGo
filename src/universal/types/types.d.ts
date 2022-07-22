// global
interface IObj {
  [propName: string]: any
}

interface IObjT<T> {
  [propName: string]: T
}

declare interface ErrnoException extends Error {
  errno?: number | string;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

declare let __static: string
// Server
type routeHandler = (ctx: IServerCTX) => Promise<void>

type IHttpResponse = import('http').ServerResponse

interface IServerCTX {
  response: IHttpResponse
  [propName: string]: any
}

interface IServerConfig {
  port: number | string
  host: string
  enable: boolean
}

// Image && PicBed
interface ImgInfo {
  buffer?: Buffer
  base64Image?: string
  fileName?: string
  width?: number
  height?: number
  extname?: string
  imgUrl?: string
  id?: string
  type?: string
  [propName: string]: any
}

interface IPicBedType {
  type: string
  name: string
  visible: boolean
}

// Main process
interface IBrowserWindowOptions {
  height: number,
  width: number,
  show: boolean,
  fullscreenable: boolean,
  resizable: boolean,
  webPreferences: {
    nodeIntegration: boolean,
    nodeIntegrationInWorker: boolean,
    contextIsolation: boolean,
    backgroundThrottling: boolean
    webSecurity?: boolean
  },
  vibrancy?: string | any,
  frame?: boolean
  center?: boolean
  title?: string
  titleBarStyle?: string | any
  backgroundColor?: string
  autoHideMenuBar?: boolean
  transparent?: boolean
  icon?: string
  skipTaskbar?: boolean
  alwaysOnTop?: boolean
}
interface IBounds {
  x: number
  y: number
}

// PicGo Types
type ICtx = import('picgo').PicGo
// GuiApi
interface IGuiApi {
  showInputBox: (options: IShowInputBoxOption) => Promise<string>
  showFileExplorer: (options: IShowFileExplorerOption) => Promise<string>
  showNotification: (options?: IShowNotificationOption) => void
  showMessageBox: (options?: IShowMessageBoxOption) => Promise<IShowMessageBoxResult>
}
interface IShowInputBoxOption {
  value?: string
  title: string
  placeholder: string
}

type IShowFileExplorerOption = IObj
interface IShowNotificationOption {
  title: string
  body: string
  icon?: string | import('electron').NativeImage
}

interface IPrivateShowNotificationOption extends IShowNotificationOption{
  /**
   * click notification to copy the body
   */
  clickToCopy?: boolean
}

interface IShowMessageBoxOption {
  title: string
  message: string
  type: string
  buttons: string[]
}

interface IShowMessageBoxResult {
  result: number
  checkboxChecked: boolean
}
interface IAppNotification {
  title: string
  body: string
  icon?: string
}

interface ITalkingDataOptions {
  EventId: string
  Label?: string
  MapKv?: IStringKeyMap
}
interface IStringKeyMap {
  [propName: string]: any
}

type ILogArgvType = string | number

type ILogArgvTypeWithError = ILogArgvType | Error
