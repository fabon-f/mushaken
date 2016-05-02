const EventEmitter = require("events");
const ipcRenderer = require("electron").ipcRenderer;
module.exports = function() {
    const emitter = new EventEmitter();
    const callback = (event, data) => {
        emitter.emit("data", data);
    };
    ipcRenderer.on("wiimote", callback);
    emitter.close = function() {
        ipcRenderer.removeListener("wiimote", callback);
    };
    return emitter;
};
