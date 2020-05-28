"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.setConfig = void 0;
var IPCRequestError = /** @class */ (function (_super) {
    __extends(IPCRequestError, _super);
    function IPCRequestError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        return _this;
    }
    return IPCRequestError;
}(Error));
var _defaultConfig = {
    replace: false,
    timeout: undefined
};
var _config = __assign({}, _defaultConfig);
// 缓存标识与回调函数
var _waitMap = new Map();
var _typeReplaceMap = new Map();
function setConfig(config) {
    if (config === void 0) { config = {}; }
    _config = Object.assign({}, _defaultConfig, config);
}
exports.setConfig = setConfig;
function default_1(ipcRenderer) {
    // 监听 electron 端发送来的消息
    ipcRenderer.on('from-server', function (event, params) {
        // 通过服务器返回的唯一标识，找到对应的回调函数
        var cb = _waitMap.get(params.currentSymbol);
        if (typeof cb === 'function') {
            cb(params.data);
            // 移除当前标识与回调
            _waitMap["delete"](params.currentSymbol);
        }
    });
    function request(type, data) {
        var options;
        if (typeof type === 'object') {
            options = type;
        }
        else {
            options = {
                type: type,
                data: data
            };
        }
        // set config
        options = Object.assign({}, _config, options);
        // @FIXME 生成机制有待优化
        // 生成唯一标识
        var currentSymbol = Date.now() + '';
        if (options.replace) {
            var lastSymbol = _typeReplaceMap.get(options.type);
            // 如果存在上一次的 symbol
            if (lastSymbol) {
                // 检查是否已经发生过 ipc 请求了，如果存在， reject 它
                var fn = _waitMap.get(lastSymbol);
                if (typeof fn === 'function') {
                    var error = new IPCRequestError('replace', 'This request was replaced by a new request.此请求被后面的覆盖了。');
                    fn(undefined, error);
                }
            }
            // 设置本次的
            _typeReplaceMap.set(options.type, currentSymbol);
        }
        var timer;
        if (options.timeout) {
            timer = setTimeout(function () {
                var fn = _waitMap.get(currentSymbol);
                if (typeof fn === 'function') {
                    var error = new IPCRequestError('timeout', options.type + ": Request timeout(" + options.timeout + "ms)");
                    fn(undefined, error);
                }
            }, options.timeout);
        }
        return new Promise(function (resolve, reject) {
            // 覆盖之前的旧回调，在 promise 中等待回调被执行
            _waitMap.set(currentSymbol, function (result, err) {
                // cancel timer
                options.timeout && clearTimeout(timer);
                if (err) {
                    reject(err);
                }
                else {
                    // 请求已返回 移除 replace symbol
                    _typeReplaceMap["delete"](options.type);
                    resolve(result);
                }
            });
            // 发送到 electron 服务端
            ipcRenderer.send('from-client', {
                currentSymbol: currentSymbol,
                type: options.type,
                data: options.data
            });
        });
    }
    return request;
}
exports["default"] = default_1;
