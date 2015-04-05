"use strict";

var NAME = exports.name = "ws-server";
var LOGNAME = "[" + NAME + "]";
var WebSocketServer = require("ws").Server;
var lob = require("lob-enc");

exports.mesh = function(mesh, cbMesh) {
  if (!require("./util").isNode) {
    throw new Error("Browserify not supported");
  }

  var log = mesh.log;
  var th = mesh.lib;
  var tp = {};
  var args = mesh.args.ws || {};
  if (!args.port && !args.server) {
    args.port = 0;
  }
  var humanhost = (args.host || "0.0.0.0") + ":" + args.port;

  tp.paths = function() {
    // TODO(Kagami);
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
      var packet = lob.decode(new Buffer(e.data,'binary'));
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
      ws.send(buf.toString('binary'), cbSend);
    };
  });

  cbMesh(null, tp);
};
