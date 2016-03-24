const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
fs.symlink(path.join(root, "src", "index.html"), path.join(root, "dest", "index.html"), () => {
    process.stdout.write("symlink\n");
});
