
import { ipcMain, ipcRenderer } from '../test-driver'
import serverService from '../src/server/server'
import requestService, { IPCRequestOptions } from '../src/request/request'

describe('use ipc request', () => {
  
  // @ts-ignore
  const server = serverService(ipcMain)
  // @ts-ignore
  const request = requestService(ipcRenderer)

  test('normal request', async () => {
    const type = 'normal request'
    const value = { foo: 'foo' }

    server.use(type, (ctx, data) => {
      ctx.reply(data.foo)
    })

    const result = await request(type, value)
    expect(result).toBe(value.foo)
  })

  test('replace', async () => {
    const options: IPCRequestOptions = {
      type: 'request test',
      replace: true
    }
    let i = 1
    server.use(options.type, (ctx, data) => {
      setTimeout(() => {
        i++
        ctx.reply(i)
      }, 0)
    })

    // 此次请求结果应该是 2，如果此次请求没有被替换的话
    request(options).catch(err => {
      expect(err.code).toMatch('replace')
    })
    const result = await request(options)
    expect(result).toBe(2)
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
