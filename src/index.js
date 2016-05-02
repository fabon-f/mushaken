"use strict";

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const childProcess = require("child_process");
const ipcMain = electron.ipcMain;

var mainWindow = null;

let state = {
    x: null,
    z: null
};

app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", () => {
    ipcMain.on("input", ({ sender }) => {
        if (process.argv[2] === "key") {
            sender.send("input", "key");
        } else {
            sender.send("input", "wiimote");
        }
    });
    if (process.argv[2] === "key") {
        const { width, height } =  electron.screen.getPrimaryDisplay().workAreaSize;
        mainWindow = new BrowserWindow({ width, height });
        mainWindow.loadURL("file://" + path.join(__dirname, "index.html"));
        mainWindow.on("closed", () => {
            mainWindow = null;
        });
        return;
    }
    let flag = 0;
    const wiimote = childProcess.spawn(path.join(__dirname, "../build/bin/wiimote-connect"));
    process.on("exit", () => {
        wiimote.kill("SIGINT");
    });
    wiimote.on("error", (error) => {
        console.error(error);
    });
    wiimote.on("close", () => {
        console.log("Unable to connect to wiimote");
        app.quit();
    });
    wiimote.stderr.pipe(process.stderr);
    wiimote.stdout.on("data", data => {
        if (flag === 0) {
            flag++;
            return;
        }
        if (flag === 1) {
            flag++;
            const { width, height } =  electron.screen.getPrimaryDisplay().workAreaSize;
            mainWindow = new BrowserWindow({ width, height });
            mainWindow.loadURL("file://" + path.join(__dirname, "index.html"));
            mainWindow.on("closed", () => {
                mainWindow = null;
            });
        }
        const out = data.toString("utf8").split("\n");
        for (let line of out) {
            switch (line) {
                case "A":
                    mainWindow.webContents.send("wiimote", {
                        event: "down",
                        key: "a"
                    });
                    break;
                case "B":
                    mainWindow.webContents.send("wiimote", {
                        event: "down",
                        key: "b"
                    });
                    break;
                case "A released":
                    mainWindow.webContents.send("wiimote", {
                        event: "up",
                        key: "a"
                    });
                    break;
                case "B released":
                    mainWindow.webContents.send("wiimote", {
                        event: "up",
                        key: "b"
                    });
                    break;
                default: {
                    if (!/^\d{1,3}\s\d{1,3}$/.test(line)) {
                        break;
                    }
                    const [x, z] = line.split(" ").map(num => parseInt(num));

                    // console.log((x - 133) / 256);

                    if (x < 100) {
                        if (state.x !== "left") {
                            state.x = "left";
                            mainWindow.webContents.send("wiimote", {
                                event: "down",
                                key: "left"
                            });
                        }
                    }
                    if (x > 165) {
                        if (state.x !== "right") {
                            state.x = "right";
                            mainWindow.webContents.send("wiimote", {
                                event: "down",
                                key: "right"
                            });
                        }
                    }

                    // console.log((z - 156) / 256);
                    if (z < 120 && state.z !== "up") {
                        state.z = "up";
                        mainWindow.webContents.send("wiimote", {
                            event: "down",
                            key: "up"
                        });
                    }
                    if (z > 190 && state.z !== "down") {
                        state.z = "down";
                        mainWindow.webContents.send("wiimote", {
                            event: "down",
                            key: "down"
                        });
                    }
                    break;
                }
            }
        }
    });
});
