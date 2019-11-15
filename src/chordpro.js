// Returns an ElementTree-based DOM using output from tokenizer()'
module.exports.Node = function () {
    this.type = 'node';
    this.children = [];
}

module.exports.NodeDoc = function () {
        this.body = [];
        this.title = null;
        this.subTitle = null;
        this.artist = null;
}

module.exports.NodeMeta = function () {
    module.exports.Node.call(this);
}

module.exports.NodeHead = function () {
    module.exports.Node.call(this);
}

module.exports.NodeBody = function () {
    module.exports.Node.call(this);
}

module.exports.NodeComment = function () {
    module.exports.Node.call(this);
    this.text = '';
}

module.exports.NodeChord = function(chord = null) {
    module.exports.Node.call(this);
    this.chord = chord
    this.text = '';
}

module.exports.NodeRow = function() {
    module.exports.Node.call(this);
}

module.exports.NodeVerse = function() {
    module.exports.Node.call(this);
}

module.exports.NodeChorus = function() {
    module.exports.Node.call(this);
}

module.exports.NodeTab = function() {
    module.exports.Node.call(this);
}
