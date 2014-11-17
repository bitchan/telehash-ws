"use strict";

exports.name = "ws-client";

// TODO(Kagami): Maybe we need to distinguish node and browser using
// some better way (see <http://stackoverflow.com/q/4224606>).
if (typeof window === "undefined") {
  var WebSocket = require("ws");  // jshint ignore: line
} else {
  if (typeof WebSocket === "undefined") {
    throw new Error("WebSocket not available");
  }
}
