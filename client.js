"use strict";

var NAME = exports.name = "ws-client";
var LOGNAME = "[" + NAME + "]";
var lob = require("lob-enc");
var isNode = require("./util").isNode;

exports.mesh = function(mesh, cbMesh) {
  var WebSocketClient;
  if (isNode) {
    WebSocketClient = require("ws");
  } else {
    // TODO(Kagami): Export some function to check WebSocket
    // availability instead of failing?
    if (typeof WebSocket === "undefined") {
      throw new Error("WebSocket not available");
    }
    WebSocketClient = WebSocket;
  }

  var log = mesh.log;
  var th = mesh.lib;
  var pipes = {};
  var tp = {pipes: pipes};

  tp.pipe = function(link, path, cbPipe) {
    var id = path.url;
    if (path.type !== "ws" || id == null) return;
    var pipe = pipes[id];
    if (pipe) return cbPipe(pipe);

    // TODO(Kagami): binaryType blob?
    var ws;
    log.debug(LOGNAME, "making new connection to", id);
    try {
      ws = new WebSocketClient(id);
    } catch (e) {
      log.info(LOGNAME, "init error from", id, e.message);
      return;
    }

    ws.onopen = function() {
      log.debug(LOGNAME, "connected to", id);
      // TODO(Kagami): Keepalive.
      pipe = pipes[id] = new th.Pipe(NAME);
      pipe.id = id;
      pipe.path = path;

      ws.onmessage = function(e) {
        var packet = lob.decode(e.data);
        if (!packet) {
          var hex = e.data.toString("hex");
          log.info(LOGNAME, "dropping invalid packet from", id, hex);
          return;
        }
        mesh.receive(packet, pipe);
      };

      ws.onclose = function(e) {
        delete pipes[id];
        ws = null;
        log.debug(LOGNAME, "disconnected from", id, e);
      };

      pipe.onSend = function(packet, link, cbSend) {
        if (!ws) return;  // Disconnected
        var buf = lob.encode(packet);
        if (isNode) {
          ws.send(buf, cbSend);
        } else {
          ws.send(buf);
          cbSend();
        }
      };

      cbPipe(pipe);
    };

    ws.onerror = function(e) {
      log.info(LOGNAME, "error from", id, e);
    };
  };

  cbMesh(null, tp);
};
