// Returns an ElementTree-based DOM using output from tokenizer()'
module.exports.Node = function Node () {
    this.type = 'node';
    this.children = [];
}

module.exports.NodeDoc = function NodeDoc() {
        this.body = [];
        this.title = null;
        this.subTitle = null;
        this.artist = null;
}

module.exports.NodeMeta = function NodeMeta() {
    module.exports.Node.call(this);
}

module.exports.NodeHead = function NodeHead() {
    module.exports.Node.call(this);
}

module.exports.NodeBody = function NodeBody() {
    module.exports.Node.call(this);
}

module.exports.NodeComment = function NodeComment() {
    module.exports.Node.call(this);
    this.text = '';
}

module.exports.NodeChord = function NodeChord(chord = null) {
    module.exports.Node.call(this);
    this.chord = chord
    this.text = '';
}

module.exports.NodeRow = function NodeRow() {
    module.exports.Node.call(this);
}

module.exports.NodeVerse = function NodeVerse() {
    module.exports.Node.call(this);
}

module.exports.NodeChorus = function NodeChorus() {
    module.exports.Node.call(this);
}

module.exports.NodeTab = function NodeTab() {
    module.exports.Node.call(this);
}