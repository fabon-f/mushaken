"use strict";

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");

var mainWindow = null;

app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", () => {
    const { width, height } =  electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({ width, height });
    mainWindow.loadURL("file://" + path.join(__dirname, "index.html"));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});
