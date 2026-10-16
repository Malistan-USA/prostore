import {
    ReadableStream,
    WritableStream,
    TransformStream,
} from "node:stream/web";

globalThis.ReadableStream ??= ReadableStream;
globalThis.WritableStream ??= WritableStream;
globalThis.TransformStream ??= TransformStream;

console.log(
    "[web-streams preload]",
    typeof globalThis.WritableStream
);