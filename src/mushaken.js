/* eslint-env node,browser */
/* global createjs */
(() => {
    // const FPS = 60;
    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;

    const canvas = document.getElementById("mushaken-main");
    canvas.width = gameWidth;
    canvas.height =  gameHeight;

    const stage = new createjs.Stage("mushaken-main");

    const judgeLine = new createjs.Shape();
    judgeLine.graphics.beginFill("black").drawRect(0, 0, 3, gameHeight);
    judgeLine.x = gameWidth / 4;
    judgeLine.y = 0;

    stage.addChild(judgeLine);

    stage.update();
}) ();
