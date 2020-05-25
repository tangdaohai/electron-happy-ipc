import request, { setConfig as _setConfig } from './request'
const { ipcRenderer } = window.require('electron')

export default request(ipcRenderer)
export const setConfig =  _setConfig
