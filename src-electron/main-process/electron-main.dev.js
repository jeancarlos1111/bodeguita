/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

import electronDebug from 'electron-debug'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  // allow for a small delay for mainWindow to be created
  setTimeout(() => {
    // Install `electron-debug` with `devtron`
    electronDebug({ showDevTools: true })

    // Install vuejs devtools - DISABLED due to connection/header errors
    // installExtension(VUEJS_DEVTOOLS)
    //   .then(name => {
    //      ...
    //   })
    //   .catch(err => {
    //      ...
    //   })
    
    // Manual fallback also disabled here, moved to electron-main.js
    // const win = BrowserWindow.getFocusedWindow()
    // ...
  }, 250)
})

import './electron-main'
