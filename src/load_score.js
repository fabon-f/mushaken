const fs = require("fs");
const path = require("path");

/**
 * load score file asynchronously
 * @param  {string} name name of score file
 * @return {Promise}
 */
module.exports = function loadScore(name) {
    return new Promise((resolve, reject) => {
        const BASE_DIR = path.join(__dirname, "..", "scores");
        fs.readFile(path.join(BASE_DIR, `${name}.json`), "utf8", (error, data) => {
            error ? reject(error) : resolve(JSON.parse(data));
        });
    });
};
