# telehash-ws [![Build Status](https://travis-ci.org/bitchan/telehash-ws.svg?branch=master)](https://travis-ci.org/bitchan/telehash-ws)

Network bindings for [telehash](http://telehash.org/) to WebSocket for both client (browserify and node) and server (node).

## Usage

```js
var th = require("telehash");
th.add(require("telehash-ws"));

var idA, idB;
var meshA, meshB;
var linkAB, linkBA;

function initEndpoints() {
  th.generate(function(err, id) {
    idA = id;
    th.generate(function(err, id) {
      idB = id;
      initMesh();
    });
  });
}

function initMesh() {
  th.mesh({id: idA}, function(err, mesh) {
    meshA = mesh;
    th.mesh({id: idB, ws: {host: "127.0.0.1", port: 12345}}, function(err, mesh) {
      meshB = mesh;
      link();
    });
  });
}

function link() {
  var wspath = {type: "ws", url: "ws://127.0.0.1:12345"};
  linkAB = meshA.link({keys: idB.keys, paths: [wspath]});
  linkAB.status(function(err) {
    console.log("CONNECTED");
  });
  linkBA = meshB.link(idA.hashname);
}

initEndpoints();
```

## License

telehash-ws - Network bindings for telehash to WebSocket

Written in 2014-2015 by Kagami Hiiragi <kagami@genshiken.org>

To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
