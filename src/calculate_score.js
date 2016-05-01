module.exports = function(score, notesCount) {
    const PERFECT = 1;
    const GOOD = 0.6;
    const BAD = 0.3;
    return (score.perfect * PERFECT + score.good * GOOD + score.bad * BAD) / notesCount * 1000000;
};
