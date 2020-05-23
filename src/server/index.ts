import { ipcMain } from 'electron'
import server from './server'
export default server(ipcMain)