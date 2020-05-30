# electron-happy-ipc

[![Github Actions Test](https://github.com/tangdaohai/electron-happy-ipc/workflows/Test/badge.svg)](https://github.com/tangdaohai/electron-happy-ipc/actions?query=workflow%3ATest)[![codecov.io](https://codecov.io/gh/tangdaohai/electron-happy-ipc/branch/master/graph/badge.svg)](https://codecov.io/gh/tangdaohai/electron-happy-ipc)

`electron-happy-ipc` 基于 electron IPC 进行二次封装，使 IPC 的方式像 `http` 请求一样方便简单。

### Why it

在 electron 中，如果使用要使用 node API，则需要使用 [Renderer Process](https://www.electronjs.org/docs/api/ipc-renderer) 向 [Main Process](https://www.electronjs.org/docs/api/ipc-main) 发起通信（IPC），然后 Main Process 中处理相关逻辑。

> 而 IPC 通信则需要两个进程都需要先监听一个事件，在 SPA 带有生命周期的场景中，`Renderer Process` 还需要监听、销毁等繁琐操作。且代码可读性差也不易于后期维护。

### Quick start

1. install

   ```shell
   yarn add electron-happy-ipc
   #或者
   npm install -S electron-happy-ipc
   ```

2. import

   > 1. 在 Main Process 中引用，类似 `Koa router` 的使用方式，作为 controller 方式管理
   > 2. 在 Renderer Process 中引用，类似于 `axios` 使用方式

   * Main Process

     ```typescript
     import server from 'electron-happy-ipc/server'
     
     server.use('test', async (ctx, data) => {
       // data => { a: 1 }  from Renderer Process
       const result = await doSomething(data)
       ctx.reply(['1', '2', '3'])
     })
     ```

   * Renderer Process

     > 这里以 react 组件举例说明

     

     ```react
     import React, { useState, useEffect } from 'react'
     import request from 'electron-happy-ipc/request'
     
     export default function IpcTest () {
       const [list, setList] = useState([])
         
       useEffect(() => {
         init()
       }, [])
       
       const init = async () => {
         // request 取代 ipcRenderer.send 和 ipcRenderer.on
         const result = await request('test', { a: 1 })
         // result => ['1', '2', '3'] from Main Process
         setList(result)
       }
     }
     ```

     

### API

##### cover

*boolean 可选*

默认 `false`。多次调用，避免后续处理逻辑执行多次。

> 比如发起一个分页请求，点击第 2 页后，紧接着又点击了第 3 页，假如 `第 2 页` 的请求执行时间大于 `第 3 页`请求执行时间，那第 3 页的响应会先被 resolve，接着第 2 页的响应又被 resolve 了。
>
> 结果就是当前要展示第 3 页，但数据却是第 2 页的。
>
> 注意：设置 cover 仍会向 Main Process 发送两次通信

```typescript
const init = async () => {
  try {
    const result = await request({
    url: 'test',
    data: { a: 1 },
    replace: true
  })
  console.log(result)
  } catch (err) {
    // 第一次调用 reject
  }
}

init() // 假如 init 需要 500ms 才会返回
init() // 紧接着再次调用，上一次的 init 会立刻 reject。
```

##### timeout

*number 可选*

单位：ms（毫秒）

默认`无`。设置此次请求的超时时间。

> 主要当传递 0 时，不生效。

### 全局 API

##### setConfig

设置全局配置。

```typescript
import request, { setConfig } from 'electron-happy-ipc/request'

 // 所有的 request 都会生效
setConfig({
  replace: true,
  timeout: 1000 * 60
})

// 还原全局设置
setConfig()
```



### License

MIT
