"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var server_1 = require("./server");
exports["default"] = server_1["default"](electron_1.ipcMain);
