"use strict";

exports.name = "ws";
exports.client = require("./client");
var isNode = typeof window === "undefined";

// Wrapper to load both client and server.
exports.mesh = function(mesh, cbMesh) {
  mesh.extend(exports.client, function(err) {
    if (err) return cbMesh(err);

    if (isNode) {
      exports.server = require("./server");
      mesh.extend(exports.server, cbMesh);
    } else {
      cbMesh();
    }
  });
};
