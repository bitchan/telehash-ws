"use strict";

var NAME = exports.name = "ws-server";
var LOGNAME = "[" + NAME + "]";
var WebSocketServer = require("ws").Server;
var lob = require("lob-enc");

exports.mesh = function(mesh, cbMesh) {
  var log = mesh.log;
  var th = mesh.lib;
  var tp = {};
  var args = mesh.args.ws || {};
  if (!args.port) {
    args.port = Math.floor(Math.random() * 64511) + 1024;
  }
  var humanhost = (args.host || "127.0.0.1") + ":" + args.port;

  tp.paths = function() {
    // TODO(Kagami): See `tp.paths` in telehash-http.
    return [{type: "ws", url: "ws://" + humanhost}];
  };

  log.info(LOGNAME, "listening on", humanhost);
  var wss = tp.server = new WebSocketServer(args);

  wss.on("connection", function(ws) {
    var id = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    var pipe = new th.Pipe(NAME);
    pipe.id = id;
    log.info(LOGNAME, "got connection from", id);

    ws.onmessage = function(e) {
      var packet = lob.decode(e.data);
      if (!packet) {
        var hex = e.data.toString("hex");
        log.warn(LOGNAME, "dropping invalid packet from", id, hex);
        return;
      }
      mesh.receive(packet, pipe);
    };

    ws.onclose = function(e) {
      ws = null;
      log.info(LOGNAME, "disconnected", id, e);
    };

    ws.onerror = function(e) {
      log.warn(LOGNAME, "error from", id, e.message);
    };

    pipe.onSend = function(packet, link, cbSend) {
      if (!ws) return;  // Disconnected
      var buf = lob.encode(packet);
      ws.send(buf, cbSend);
    };
  });

  cbMesh(null, tp);
};
