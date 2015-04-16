// For Browser tests nodes are being run from karma.conf.js because we
// are _already_ in browser context here.
if (!process.browser) require("./test-node")();
var expect = require("chai").expect;

var bkeys = {"3a": "oh5mgzdlfbkvtim3dfbxdeozc6qot5yn4vazcaundvz77cjlfm6q"};
var IP = "127.0.0.1";
var PORT = 12345;
var URL = "ws://" + IP + ":" + PORT;

var th = require("telehash");
delete th.extensions.udp4;
delete th.extensions.tcp4;
delete th.extensions.http;
th.add(require("./"));
th.log({info: function(){}});
// th.log({debug: console.log});

describe("telehash-ws", function() {
  var idA, meshA, streamAB, linkAB;

  function initEndpoint(done) {
    th.generate(function(err, id) {
      expect(err).to.not.exist;
      expect(id).to.exist;
      idA = id;
      done();
    });
  }

  function initMesh(done) {
    th.mesh({id: idA}, function(err, mesh) {
      expect(err).to.not.exist;
      expect(mesh).to.exist;
      meshA = mesh;
      done();
    });
  }

  before(function(done) {
    this.timeout(10000);
    initEndpoint(function(err) {
      expect(err).to.not.exist;
      initMesh(done);
    });
  });

  it("should allow to link ws-client with ws-server", function(done) {
    linkAB = meshA.link({keys: bkeys, paths: [{type: "ws", url: URL}]});
    linkAB.status(function(err) {
      expect(err).to.not.exist;
      done();
    });
  });

  it("should allow to communicate b/w ws-client and ws-server", function(done) {
    streamAB = linkAB.stream();
    streamAB.write("echo-test");
    streamAB.once("data", function(chunk) {
      expect(chunk.toString()).to.equal("echo-test");
      done();
    });
  });

  it("should allow to send and receive binary data", function(done) {
    streamAB.write(Buffer("01020304", "hex"));
    streamAB.once("data", function(chunk) {
      expect(Buffer.isBuffer(chunk)).to.be.true;
      expect(chunk.toString("hex")).to.equal("01020304");
      done();
    });
  });
});
