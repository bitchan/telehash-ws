var expect = require("chai").expect;
var th = require("telehash");
delete th.extensions.udp4;
delete th.extensions.tcp4;
delete th.extensions.http;
th.add(require("./"));
// Debug.
th.log({info: function(){}});
// th.log({debug: console.log});

// A is ws-client, B is ws-server.
var idA, idB;
var meshA, meshB;
var linkAB, linkBA;
var IP = "127.0.0.1"
var PORT = Math.floor(Math.random() * 10000) + 20000;
var URL = "ws://" + IP + ":" + PORT;

function initEndpoints(done) {
  th.generate(function(err, id) {
    expect(err).to.not.exist;
    expect(id).to.exist;
    idA = id;
    th.generate(function(err, id) {
      expect(err).to.not.exist;
      expect(id).to.exist;
      idB = id;
      done();
    });
  });
}

function initMesh(done) {
  th.mesh({id: idA}, function(err, mesh) {
    expect(err).to.not.exist;
    expect(mesh).to.exist;
    meshA = mesh;
    th.mesh({id: idB, ws: {host: IP, port: PORT}}, function(err, mesh) {
      expect(err).to.not.exist;
      expect(mesh).to.exist;
      meshB = mesh;
      done();
    });
  });
}

describe("telehash-ws", function() {
  var streamAB, streamBA;

  before(function(done) {
    initEndpoints(function(err) {
      expect(err).to.not.exist;
      initMesh(done);
    });
  });

  it("should allow to link ws-client with ws-server", function(done) {
    linkAB = meshA.link({keys: idB.keys, paths: [{type: "ws", url: URL}]});
    linkAB.status(function(err) {
      expect(err).to.not.exist;
      done();
    });
    linkBA = meshB.link(idA.hashname);
  });

  it("should allow to communicate b/w ws-client and ws-server", function(done) {
    meshB.stream(function(link, args, cbAccept) {
      streamBA = cbAccept();
      streamBA.once("data", function(chunk) {
        expect(chunk.toString()).to.equal("testAB");
        streamBA.write("testBA");
      });
    });

    streamAB = linkAB.stream();
    streamAB.write("testAB");
    streamAB.once("data", function(chunk) {
      expect(chunk.toString()).to.equal("testBA");
      done();
    });
  });

  it("should allow to send and receive binary data", function(done) {
    streamBA.once("data", function(chunk) {
      expect(Buffer.isBuffer(chunk)).to.be.true;
      expect(chunk.toString("hex")).to.equal("01020304");
      done();
    });

    streamAB.write(Buffer("01020304", "hex"));
  });
});
