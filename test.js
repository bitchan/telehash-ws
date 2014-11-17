var expect = require("chai").expect;

var th = require("telehash");
th.log({info: function(){}});
var tpws = require("./");

// A is ws-client, B is ws-server.
var idA, idB;
var meshA, meshB;
var linkAB, linkBA;

function initEndpoints(done) {
  th.generate(function(err, id) {
    if (err) return done(err);
    idA = id;
    th.generate(function(err, id) {
      if (err) return done(err);
      idB = id;
      done();
    });
  });
}

function initMesh(done) {
  th.mesh({id: idA}, function(err, mesh) {
    if (err) return done(err);
    meshA = mesh;
    th.mesh({id: idB}, function(err, mesh) {
      if (err) return done(err);
      meshB = mesh;
      done();
    });
  });
}

describe("telehash-ws", function() {
  before(function(done) {
    initEndpoints(function(err) {
      if (err) return done(err);
      initMesh(done);
    });
  });

  it("should allow to link ws-client with ws-server", function(done) {
    done();
  });

  it("should allow to communicate b/w ws-client and ws-server", function(done) {
    done();
  });
});
