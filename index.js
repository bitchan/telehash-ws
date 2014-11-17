"use strict";

exports.name = "ws";
exports.client = require("./client");
exports.server = require("./server");

// Wrapper to load both client and server.
exports.mesh = function(mesh, cbMesh) {
  mesh.extend(exports.client, function(err) {
    if (err) return cbMesh(err);
    mesh.extend(exports.server, cbMesh);
  });
};
