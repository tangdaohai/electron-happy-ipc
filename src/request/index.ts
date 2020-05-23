import request from './request'
const { ipcRenderer } = window.require('electron')

export default request(ipcRenderer)
