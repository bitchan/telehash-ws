"use strict";

exports.name = "ws-server";

if (typeof window !== "undefined") {
    throw new Error("Browserify not supported");
}
