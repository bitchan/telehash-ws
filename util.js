// TODO(Kagami): Maybe we need to distinguish node and browser using
// some better way (see <http://stackoverflow.com/q/4224606>).
exports.isNode = typeof window === "undefined";
