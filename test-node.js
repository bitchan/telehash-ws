var assert = require("assert");
var th = require("telehash");
delete th.extensions.udp4;
delete th.extensions.tcp4;
delete th.extensions.http;
th.add(require("./"));
th.log({info: function(){}});
// th.log({debug: console.log});

var idB = {
  keys: {"3a": "oh5mgzdlfbkvtim3dfbxdeozc6qot5yn4vazcaundvz77cjlfm6q"},
  secrets: {"3a": "36al6qy6xzrky7ft64ldf2acj2tt2axpjsqakkdmhyr2v5c3hvzq"},
};
var IP = "127.0.0.1";
var PORT = 12345;
var URL = "ws://" + IP + ":" + PORT;

module.exports = function() {
  th.mesh({id: idB, ws: {host: IP, port: PORT}}, function(err, meshB) {
    assert(err == null);
    assert(meshB);

    // Accept all incoming links;
    meshB.accept = function(from) {
      meshB.link(from);
    };

    // Simple echo service.
    meshB.stream(function(link, args, cbAccept) {
      var streamBA = cbAccept();
      streamBA.on("data", function(chunk) {
        streamBA.write(chunk);
      });
    });
  });
};
