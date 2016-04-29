/* eslint-env browser */
const EventEmitter = require("events");
module.exports = function keyboardInput() {
    function getKeyName(code) {
        const keyCodes = new Map([
            [65, "a"],
            [66, "b"],
            [37, "left"],
            [38, "up"],
            [39, "right"],
            [40, "down"]
        ]);
        return keyCodes.get(code);
    }
    const emitter = new EventEmitter();
    const keydownCallback = event => {
        const keyName = getKeyName(event.keyCode);
        if (keyName === undefined) {
            return;
        }
        emitter.emit("data", { event: "down", key: keyName });
    };
    document.addEventListener("keydown", keydownCallback, false);
    const keyupCallback = event => {
        const keyName = getKeyName(event.keyCode);
        if (keyName === undefined) {
            return;
        }
        emitter.emit("data", { event: "up", key: keyName });
    };
    document.addEventListener("keyup", keyupCallback, false);
    emitter.close = () => {
        document.removeEventListener("keydown", keydownCallback, false);
        document.removeEventListener("keyup", keyupCallback, false);
    };
    return emitter;
};
