module.exports = function(array, element) {
    const index = array.indexOf(element);
    if (index === -1) {
        return;
    }
    array.splice(index, 1);
};
