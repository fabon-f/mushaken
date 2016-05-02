/* eslint-env node,browser */
/* global createjs */

(() => {
    const electron = require("electron");
    const ipcRenderer = electron.ipcRenderer;
    const co = require("co");
    const loadScore = require("./load_score");
    const deleteElement = require("./array_delete");
    const startTiming = require("./start_timing");
    const calculateScore = require("./calculate_score");
    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;

    /**
     * preload assets
     * @return {Promise}
     */
    function preload(musicFile) {
        return Promise.all([new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.src = "../img/note_arrow.svg";
        }), new Promise(resolve => {
            const music = new Audio();
            music.src = `../musics/${musicFile}`;
            music.addEventListener("canplaythrough", () => {
                resolve(music);
            });
        })]);
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
                note.rotation = 90;
                note.regX = 100;
                note.regY = 100;
                return note;
            }
            case "down": {
                const note = new createjs.Bitmap("../img/note_arrow.svg");
                note.scaleX = size / 200;
                note.scaleY = size / 200;
                note.rotation = -90;
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
                note.graphics.beginFill("#F00")
                .drawRect(0, 0, options.width, size);
                note.regX = 0;
                note.regY = size / 2;
                return note;
            }
            case "b-hold": {
                const note = new createjs.Shape();
                note.graphics.beginFill("#00F")
                .drawRect(0, 0, options.width, size);
                note.regX = 0;
                note.regY = size / 2;
                return note;
            }
            default:
                throw new Error("Invalid note type");
        }
    }

    function judge(gap, maxGap) {
        if (0 <= gap / maxGap && gap / maxGap < 0.3) {
            return "perfect";
        }
        if (0.3 <= gap / maxGap && gap / maxGap < 0.75) {
            return "good";
        }
        if (0.75 <= gap / maxGap && gap / maxGap <= 1) {
            return "bad";
        }
        return "miss";
    }

    function startGame(scoreName, inputSource) {
        return co(function*() {
            const score = yield loadScore(scoreName);
            const [,music] = yield preload(score.source);
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
            const JUDGE_RANGE = 0.2; // 0.2 sec

            const notes = [];

            for (let noteData of score.notes) {
                const isHold = noteData.type.includes("hold");
                const noteObject = createNote(noteData.type, 60, isHold ? { width: (noteData.end - noteData.beginning) * NOTES_SPEED } : {});
                noteObject.x = NOTES_SPEED * score.delay
                + judgeLine.x
                + (60 * NOTES_SPEED / score.BPM) * (isHold ? noteData.beginning - 1 : noteData.timing - 1);
                noteObject.y = gameHeight / 2;
                stage.addChild(noteObject);
                if (isHold) {
                    notes.push({
                        type: noteData.type,
                        beginning: noteData.beginning,
                        end: noteData.end,
                        displayObject: noteObject
                    });
                } else {
                    notes.push({
                        type: noteData.type,
                        timing: noteData.timing,
                        displayObject: noteObject
                    });
                }
            }

            music.play();

            stage.update();

            const ticker = createjs.Ticker;
            ticker.reset();
            ticker.init();

            ticker.framerate = 50;

            const gameStartTime = Date.now();

            let currentHoldNote = null;

            let result = {
                perfect: 0,
                good: 0,
                bad: 0
            };

            const scoreBoard = document.getElementById("mushaken-score");

            ticker.addEventListener("tick", () => {
                for (let note of notes) {
                    note.displayObject.x = NOTES_SPEED * score.delay
                    + judgeLine.x
                    + (60 * NOTES_SPEED / score.BPM) * (note.type.includes("hold") ? note.beginning - 1 : note.timing - 1)
                    - (Date.now() - gameStartTime) / 1000 * NOTES_SPEED;
                }
                const elapsedTime = (Date.now() - gameStartTime) / 1000 - score.delay;
                if (currentHoldNote !== null && elapsedTime - (currentHoldNote.end - 1) * 60 / score.BPM > JUDGE_RANGE) {
                    console.log("hold failed");
                    stage.removeChild(currentHoldNote.displayObject);
                    deleteElement(notes, currentHoldNote);
                    currentHoldNote = null;
                }
                if (music.duration + 0.5 < elapsedTime + score.delay) {
                    ticker.removeAllEventListeners("tick");
                    inputSource.close();
                    console.log(calculateScore(result, score.notes.length));
                }
                stage.update();
            });
            inputSource.on("data", ({ event, key }) => {
                const elapsedTime = (Date.now() - gameStartTime) / 1000 - score.delay;
                const isArrowKey = ["left","right","up","down"].includes(key);
                if (event === "down" && isArrowKey) {
                    let nearestNote = null;
                    for (let note of notes) {
                        const gap = Math.abs(elapsedTime - (note.timing - 1) * 60 / score.BPM);
                        if (note.type !== key) { continue; }
                        if (gap > JUDGE_RANGE) { continue; }
                        if (nearestNote === null) {
                            nearestNote = note;
                        } else {
                            if (gap < Math.abs(elapsedTime - (nearestNote.timing - 1) * 60 / score.BPM)) {
                                nearestNote = note;
                            }
                        }
                    }
                    if (nearestNote === null) { return; }

                    result[judge(Math.abs(elapsedTime - (nearestNote.timing - 1) * 60 / score.BPM), JUDGE_RANGE)]++;
                    scoreBoard.textContent = calculateScore(result, score.notes.length);

                    stage.removeChild(nearestNote.displayObject);
                    deleteElement(notes, nearestNote);
                    return;
                }
                if (event === "down" && ["a","b"].includes(key)) {
                    let nearestNote = null;
                    for (let note of notes) {
                        if (note.type !== key && note.type !== `${key}-hold`) { continue; }
                        if (Math.abs(elapsedTime - (startTiming(note) - 1) * 60 / score.BPM) > JUDGE_RANGE) { continue; }
                        if (nearestNote === null) {
                            nearestNote = note;
                        } else if (Math.abs(elapsedTime - (startTiming(note) - 1) * 60 / score.BPM) < Math.abs(elapsedTime - (startTiming(nearestNote) - 1)) * 60 / score.BPM) {
                            nearestNote = note;
                        }
                    }
                    if (nearestNote === null) { return; }
                    if (nearestNote.type.includes("hold")) {
                        currentHoldNote = nearestNote;
                        currentHoldNote.displayObject.graphics.beginFill(currentHoldNote.type === "a-hold" ? "#b33" : "#22c")
                        .drawRect(0,0,(currentHoldNote.end - currentHoldNote.beginning) * NOTES_SPEED,60);
                        currentHoldNote.startGap = Math.abs(elapsedTime - (nearestNote.beginning - 1) * 60 / score.BPM);
                    } else {
                        result[judge(Math.abs(elapsedTime - (nearestNote.timing - 1) * 60 / score.BPM), JUDGE_RANGE)]++;
                        stage.removeChild(nearestNote.displayObject);
                        deleteElement(notes, nearestNote);

                        scoreBoard.textContent = calculateScore(result, score.notes.length);
                    }
                    return;
                }
                if (event === "up" && !isArrowKey && currentHoldNote !== null) {
                    const gap = Math.abs(elapsedTime - (currentHoldNote.end - 1) * 60 / score.BPM);
                    if (gap <= JUDGE_RANGE) {
                        result[judge(gap + currentHoldNote.startGap, JUDGE_RANGE * 2)]++;
                        scoreBoard.textContent = calculateScore(result, score.notes.length);
                    }
                    stage.removeChild(currentHoldNote.displayObject);
                    deleteElement(notes, currentHoldNote);
                    currentHoldNote = null;
                }
            });
        });
    }

    ipcRenderer.on("input", (event, inputType) => {
        const button = document.getElementById("start-button");
        if (inputType === "key") {
            button.addEventListener("click", () => {
                document.getElementById("start").parentNode.removeChild(document.getElementById("start"));
                document.getElementById("mushaken").style.display = "block";
                startGame("zousan", require("./keyboard_input")()).catch(error => console.error(error));
            });
        } else {
            button.addEventListener("click", () => {
                document.getElementById("start").parentNode.removeChild(document.getElementById("start"));
                document.getElementById("mushaken").style.display = "block";
                startGame("zousan", require("./wiimote_input")()).catch(error => console.error(error));
            });
        }
    });
    ipcRenderer.send("input");
}) ();
