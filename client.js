"use strict";

var NAME = exports.name = "ws-client";
var lob = require("lob-enc");

// TODO(Kagami): Maybe we need to distinguish node and browser using
// some better way (see <http://stackoverflow.com/q/4224606>).
if (typeof window === "undefined") {
  var WebSocket = require("ws");  // jshint ignore: line
} else {
  if (typeof WebSocket === "undefined") {
    throw new Error("WebSocket not available");
  }
}

exports.mesh = function(mesh, cbMesh) {
  var log = mesh.log;
  var th = mesh.lib;
  var pipes = {};
  var tp = {pipes: pipes};

  tp.pipe = function(hn, path, cbPipe) {
    var id = path.url;
    if (path.type !== "ws" || id == null) return;
    var pipe = pipes[id];
    if (pipe) return cbPipe(pipe);

    // TODO(Kagami): binaryType blob?
    var ws;
    try {
      ws = new WebSocket(id);
    } catch (e) {
      log.info("[ws] init error", id, e.message);
      return;
    }

    ws.onopen = function() {
      log.debug("[ws] connected", id);
      // TODO(Kagami): Think about keepalive.
      pipe = pipes[id] = new th.Pipe(NAME);
      pipe.id = id;
      pipe.path = path;

      ws.onmessage = function(e) {
        var msg = e.data;
        var packet = lob.decode(msg);
        if (!packet) {
          log.info("[ws] dropping invalid packet", id, msg.toString("hex"));
          return;
        }
        mesh.receive(packet, pipe);
      };

      ws.onclose = function(e) {
        log.debug("[ws] disconnected", id, e);
        delete pipes[id];
        ws = null;
      };

      pipe.onSend = function(packet, link, cbSend) {
        if (!ws) return;  // Disconnected
        var buf = lob.encode(packet);
        // node-ws provides asynchronous `.send` but browser's API
        // doesn't so use synchronous one.
        ws.send(buf);
        cbSend();
      };
    };

    ws.onerror = function(e) {
      log.info("[ws] error", id, e);
    };
  };

  cbMesh(null, tp);
};
