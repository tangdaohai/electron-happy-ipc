
import { ipcMain, ipcRenderer } from '../test-driver'
import serverService from '../server/server'
import requestService, { setConfig, IPCRequestOptions } from '../request/request'

// @ts-ignore
const server = serverService(ipcMain)
// @ts-ignore
const request = requestService(ipcRenderer)

describe('use ipc request', () => {

  test('normal request', async () => {
    const type = 'normal request'
    const value = { foo: 'foo' }

    server.use(type, (ctx, data) => {
      ctx.reply(data.foo)
    })

    const result = await request(type, value)
    expect(result).toBe(value.foo)
  })

  test('replace',(done) => {
    const options: IPCRequestOptions = {
      type: 'request test',
      replace: true
    }
    let i = 1
    server.use(options.type, (ctx, data) => {
      i++
      ctx.reply(i)
    })

    // 此次请求结果应该是 2，如果此次请求没有被替换的话
    request(options).catch(err => {
      expect(err.code).toMatch('replace')
    })
    
    // @FIXME 因为 request symbol 生成的机制，同步运行 可能会产生相同的 symbol
    setTimeout(async () => {
      const result = await request(options)
      expect(result).toBe(3)
      done()
    }, 0)
  })

  test('timeout', async () => {
    const options: IPCRequestOptions = {
      type: 'timeout test',
      timeout: 500
    }

    server.use(options.type, ctx => {
      setTimeout(() => {
        ctx.reply('result')
      }, 600)
    })

    try {
      await request(options)
    } catch (err) {
      expect(err.code).toMatch('timeout')
    }
  })
})

describe ('use ipc request with config', () => {

  beforeEach(() => {
    setConfig({
      replace: true,
      timeout: 500
    })
  })

  test('global config: replace is true', async (done) => {
    const type = 'global config: replace'
    server.use(type, (ctx, data) => {
      setTimeout(() => {
        ctx.reply(data)
      }, 50)
    })

    request(type, 1).catch(err => {
      expect(err.code).toMatch('replace')
    })

    setTimeout(async () => {
      const result = await request(type, 2)
      expect(result).toBe(2)
      done()
    }, 0)
  })

  afterEach(() => {
    // clean
    setConfig()
  })
})
