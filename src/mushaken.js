/* eslint-env node,browser */
/* global createjs */

(() => {
    const co = require("co");
    const loadScore = require("./load_score");
    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;

    /**
     * preload assets
     * @return {Promise}
     */
    function preload() {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.src = "../img/note_arrow.svg";
        });
    }

    /**
     * create note object
     * @param  {string} type type of note
     * @return {DisplayObject}
     */
    function createNote(type, size, options = {}) {
        switch (type) {
            case "a": {
                const note = new createjs.Shape();
                note.graphics.beginFill("#F00").drawCircle(size / 2, size / 2, size / 2);
                note.regX = size / 2;
                note.regY = size / 2;
                return note;
            }
            case "b": {
                const note = new createjs.Shape();
                note.graphics.beginFill("#00F").drawCircle(size / 2, size / 2, size / 2);
                note.regX = size / 2;
                note.regY = size / 2;
                return note;
            }
            case "up": {
                const note = new createjs.Bitmap("../img/note_arrow.svg");
                note.scaleX = size / 200;
                note.scaleY = size / 200;
                note.rotation = -90;
                note.regX = 100;
                note.regY = 100;
                return note;
            }
            case "down": {
                const note = new createjs.Bitmap("../img/note_arrow.svg");
                note.scaleX = size / 200;
                note.scaleY = size / 200;
                note.rotation = 90;
                note.regX = 100;
                note.regY = 100;
                return note;
            }
            case "left": {
                const note = new createjs.Bitmap("../img/note_arrow.svg");
                note.scaleX = size / 200;
                note.scaleY = size / 200;
                note.regX = 100;
                note.regY = 100;
                return note;
            }
            case "right": {
                const note = new createjs.Bitmap("../img/note_arrow.svg");
                note.scaleX = -size / 200;
                note.scaleY = -size / 200;
                note.regX = 100;
                note.regY = 100;
                return note;
            }
            case "a-hold": {
                const note = new createjs.Shape();
                note.graphics.beginFill("#F00").arc(size / 2, size / 2, size / 2, Math.PI / 2, Math.PI * 3 / 2)
                .drawRect(size / 2, 0, options.width, size)
                .arc(size / 2 + options.width, size / 2, size / 2, -Math.PI / 2, Math.PI / 2);
                note.regX = size / 2;
                note.regY = size / 2;
                return note;
            }
            case "b-hold": {
                const note = new createjs.Shape();
                note.graphics.beginFill("#00F").arc(size / 2, size / 2, size / 2, Math.PI / 2, Math.PI * 3 / 2)
                .drawRect(size / 2, 0, options.width, size)
                .arc(size / 2 + options.width, size / 2, size / 2, -Math.PI / 2, Math.PI / 2);
                note.regX = size / 2;
                note.regY = size / 2;
                return note;
            }
            default:
                throw new Error("Invalid note type");
        }
    }

    function startGame(scoreName) {
        return co(function*() {
            yield preload();
            const score = yield loadScore(scoreName);
            const canvas = document.getElementById("mushaken-main");
            canvas.width = gameWidth;
            canvas.height =  gameHeight;

            const stage = new createjs.Stage(canvas);

            const judgeLine = new createjs.Shape();
            judgeLine.graphics.beginFill("black").drawRect(0, 0, 3, gameHeight);
            judgeLine.x = gameWidth / 4;
            judgeLine.y = 0;
            stage.addChild(judgeLine);

            const NOTES_SPEED = 300;

            const notes = [];

            for (let noteData of score.notes) {
                const isHold = noteData.type.includes("hold");
                const note = createNote(noteData.type, 60, isHold ? { width: (noteData.end -  noteData.beginning) * NOTES_SPEED } : {});
                note.x = NOTES_SPEED * score.delay
                + judgeLine.x
                + (60 * NOTES_SPEED / score.BPM) * (isHold ? noteData.beginning - 1 : noteData.timing - 1);
                note.y = gameHeight / 2;
                stage.addChild(note);
                notes.push(note);
            }

            stage.update();

            const ticker = createjs.Ticker;

            ticker.setFPS(50);
            ticker.addEventListener("tick", event => {
                for (let note of notes) {
                    note.x = note.x - NOTES_SPEED / ticker.framerate;
                }
                stage.update();
            });
        });
    }
    startGame("sample1").catch(error => console.error(error));
}) ();
