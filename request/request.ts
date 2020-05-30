import { IpcRenderer } from "electron"

interface ReceivedParams {
  currentSymbol: string,
  data: any
}

export interface IPCRequestOptions {
  type: string,
  data?: any,
  replace?: boolean,
  // timeout unit ms
  timeout?: undefined | number
}

type Callback = (data: any, err?: IPCRequestError) => void

type IPCRequestErrorCode = 'replace' | 'timeout'
interface IPCRequestError extends Error {
  code: IPCRequestErrorCode
}
class IPCRequestError extends Error {
  constructor (code: IPCRequestErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export interface IpcRequestConfig {
  replace?: boolean,
  // timeout unit ms
  timeout?: undefined | number
}

const _defaultConfig: IpcRequestConfig = {
  replace: false,
  timeout: undefined
}

let _config: IpcRequestConfig = { ... _defaultConfig }

// 缓存标识与回调函数
const _waitMap = new Map<string, Callback>()
const _typeReplaceMap = new Map<string, string>()

export function setConfig (config: IpcRequestConfig = {}) {
  _config = Object.assign({}, _defaultConfig, config)
}

export default function (ipcRenderer: IpcRenderer) {
  // 监听 electron 端发送来的消息
  ipcRenderer.on('from-server', (event, params: ReceivedParams) => {
    // 通过服务器返回的唯一标识，找到对应的回调函数
    const cb = _waitMap.get(params.currentSymbol)
    if (typeof cb === 'function') {
      cb(params.data)
      // 移除当前标识与回调
      _waitMap.delete(params.currentSymbol)
    }
  })

  /**
   * 向 electron 服务端发送 ipc 通信，可以通过 async/await 方式获得服务端返回的结果
   * @param params
   */
  function request(options: IPCRequestOptions): Promise<any>
  function request(type: string, data?: any): Promise<any>
  function request<T>(options: IPCRequestOptions): Promise<T>
  function request<T> (type: string, data?: any): Promise<T>
  function request<T> (type: string | IPCRequestOptions, data?: any): Promise<T> {
    let options: IPCRequestOptions
    if (typeof type === 'object') {
      options = type
    } else {
        options = {
        type,
        data
      }
    }

    // set config
    options = Object.assign({}, _config, options)

    // @FIXME 生成机制有待优化
    // 生成唯一标识
    const currentSymbol = Date.now() + ''

    if (options.replace) {
      const lastSymbol = _typeReplaceMap.get(options.type)
      // 如果存在上一次的 symbol
      if (lastSymbol) {
        // 检查是否已经发生过 ipc 请求了，如果存在， reject 它
        const fn = _waitMap.get(lastSymbol)
        if (typeof fn === 'function') {
          const error = new IPCRequestError('replace', 'This request was replaced by a new request.此请求被后面的覆盖了。')
          fn(undefined, error)
        }
      }
      // 设置本次的
      _typeReplaceMap.set(options.type, currentSymbol)
    }

    let timer: any
    if (options.timeout) {
      timer = setTimeout(() => {
        const fn = _waitMap.get(currentSymbol)
        if (typeof fn === 'function') {
          const error = new IPCRequestError('timeout', `${options.type}: Request timeout(${options.timeout}ms)`)
          fn(undefined, error)
        }
      }, options.timeout)
    }

    return new Promise((resolve, reject) => {
      // 覆盖之前的旧回调，在 promise 中等待回调被执行
      _waitMap.set(currentSymbol, (result: any, err?: IPCRequestError) => {
        // cancel timer
        options.timeout && clearTimeout(timer)
        if (err) {
          reject(err)
        } else {
          // 请求已返回 移除 replace symbol
          _typeReplaceMap.delete(options.type)
          resolve(result)
        }
      })
      // 发送到 electron 服务端
      ipcRenderer.send('from-client', {
        currentSymbol,
        type: options.type,
        data: options.data
      })
    })
  }

  return request
}
