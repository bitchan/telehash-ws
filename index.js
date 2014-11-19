"use strict";

exports.name = "ws";
exports.client = require("./client");

// Wrapper to load both client and server.
exports.mesh = function(mesh, cbMesh) {
  mesh.extend(exports.client, function(err) {
    if (err) return cbMesh(err);

    if (require("./util").isNode) {
      exports.server = require("./server");
      mesh.extend(exports.server, cbMesh);
    } else {
      cbMesh();
    }
  });
};
