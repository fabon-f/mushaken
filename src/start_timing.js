module.exports = function(note) {
    return note.type.includes("hold") ? note.beginning : note.timing;
};
