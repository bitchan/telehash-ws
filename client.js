"use strict";

exports.name = "ws-client";

if (typeof window === "undefined") {
    var WebSocket = require("ws");
} else {
    if (typeof WebSocket === "undefined") {
        throw new Error("WebSocket not available");
    }
}
