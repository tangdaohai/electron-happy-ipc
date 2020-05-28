"use strict";
exports.__esModule = true;
exports.setConfig = void 0;
var request_1 = require("./request");
var ipcRenderer = window.require('electron').ipcRenderer;
exports["default"] = request_1["default"](ipcRenderer);
exports.setConfig = request_1.setConfig;
