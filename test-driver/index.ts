const _mainMap = new Map()
const _rendererMap = new Map()

const reply = (type: string, params: any) => {
  const fn = _rendererMap.get(type)
  if (typeof fn === 'function') {
    fn({}, params)
  }
}

export const ipcMain = {
  on: (type: string, cb) => {
    _mainMap.set(type, cb)
  }
}

export const ipcRenderer = {
  on: (type: string, cb) => {
    _rendererMap.set(type, cb)
  },
  send: (type: string, params: any) => {
    const fn = _mainMap.get(type)
    if (typeof fn === 'function') {
      fn({ reply }, params)
    }
  }
}
