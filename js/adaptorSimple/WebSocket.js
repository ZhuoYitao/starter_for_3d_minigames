export default class WebSocket{};

WebSocket.CONNECTING = 0 // The connection is not yet open.
WebSocket.OPEN = 1 // The connection is open and ready to communicate.
WebSocket.CLOSING = 2 // The connection is in the process of closing.
WebSocket.CLOSED = 3 // The connection is closed or couldn't be opened.
