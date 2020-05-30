"use strict";
exports.__esModule = true;
// callback 回调缓存
var _cbMap = new Map();
function default_1(ipcMain) {
    ipcMain.on('from-client', function (event, clientMsg) {
        //  包裹响应函数
        var reply = function (data) {
            // 将 currentSymbol 返回给客户端
            event.reply('from-server', {
                currentSymbol: clientMsg.currentSymbol,
                data: data
            });
        };
        var ctx = {
            reply: reply,
            type: clientMsg.type
        };
        // 获取缓存的函数，并传递客户端发来的参数
        var _cb = _cbMap.get(ctx.type);
        if (typeof _cb === 'function') {
            _cb(ctx, clientMsg.data);
        }
    });
    // 注册函数
    function use(type, cb) {
        _cbMap.set(type, cb);
    }
    return {
        use: use
    };
}
exports["default"] = default_1;
