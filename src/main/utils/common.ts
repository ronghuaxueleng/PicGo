import { clipboard, Notification, dialog } from 'electron'

/**
 * show notification
 * @param options
 */
export const showNotification = (options: IPrivateShowNotificationOption = {
  title: '',
  body: '',
  clickToCopy: false
}) => {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    icon: options.icon || undefined
  })
  const handleClick = () => {
    if (options.clickToCopy) {
      clipboard.writeText(options.body)
    }
  }
  notification.once('click', handleClick)
  notification.once('close', () => {
    notification.removeListener('click', handleClick)
  })
  notification.show()
}

export const showMessageBox = (options: any) => {
  return new Promise<IShowMessageBoxResult>(async (resolve) => {
    dialog.showMessageBox(
      options
    ).then((res) => {
      resolve({
        result: res.response,
        checkboxChecked: res.checkboxChecked
      })
    })
  })
}
