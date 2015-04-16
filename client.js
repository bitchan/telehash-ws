"use strict";

var NAME = exports.name = "ws-client";
var LOGNAME = "[" + NAME + "]";
var lob = require("lob-enc");
var isNode = typeof window === "undefined";

exports.mesh = function(mesh, cbMesh) {
  var WebSocketClient;
  if (isNode) {
    WebSocketClient = require("ws");
  } else {
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

    var ws;
    try {
      ws = new WebSocketClient(id);
    } catch (e) {
      log.error(LOGNAME, "init error from", id, e.message);
      return;
    }

    // Compatibility shims for browser and node WebSocket
    // implementations.
    var getmsgbuf, sendmsg;
    if (isNode) {
      getmsgbuf = function(data) {
        return data;
      };
      sendmsg = function(data, cb) {
        ws.send(data, {binary: true}, cb);
      };
    } else {
      ws.binaryType = "arraybuffer";
      getmsgbuf = function(data) {
        return new Buffer(new Uint8Array(data));
      };
      sendmsg = function(data, cb) {
        ws.send(data);
        cb();
      };
    }

    ws.onopen = function() {
      log.info(LOGNAME, "connected to", id);
      // TODO(Kagami): Keepalive.
      pipe = pipes[id] = new th.Pipe(NAME);
      pipe.id = id;
      pipe.path = path;

      ws.onmessage = function(e) {
        var packet = lob.decode(getmsgbuf(e.data));
        if (!packet) {
          var hex = e.data.toString("hex");
          log.error(LOGNAME, "dropping invalid packet from", id, hex);
          return;
        }
        mesh.receive(packet, pipe);
      };

      ws.onclose = function(e) {
        delete pipes[id];
        ws = null;
        log.info(LOGNAME, "disconnected from", id, e);
      };

      pipe.onSend = function(packet, link, cbSend) {
        if (!ws) return;  // Disconnected
        var buf = lob.encode(packet);
        sendmsg(buf, cbSend);
      };

      cbPipe(pipe);
    };

    ws.onerror = function(e) {
      log.error(LOGNAME, "error from", id, e);
    };
  };

  cbMesh(null, tp);
};
