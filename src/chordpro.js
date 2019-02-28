
module.exports.Doc = function () {
        this.body = [];
        this.title = null;
        this.subTitle = null;
        this.artist = null;
}

module.exports.Node = function () {
    this.type = 'node';
    this.children = [];
}

module.exports.NodeComment = function () {
    module.exports.Node.call(this);
    this.text = '';
}

module.exports.NodeChord = function(chord = null) {
    module.exports.Node.call(this);
    this.chord = chord;
    this.text = '';
}

module.exports.NodeRow = function() {
    module.exports.Node.call(this);
}

module.exports.NodeVerse = function() {
    module.exports.Node.call(this);
}

module.exports.CHORUS = 'chorus';
module.exports.Chorus = function() {
    module.exports.Node.call(this);
    this.
}

module.exports.NodeTab = function(tab = []) {
    module.exports.Node.call(this);
    this.tab = tab;
}
