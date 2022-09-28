import { Logger } from "./logger.js";
import { SceneSerializer } from "./sceneSerializer.js";
import { StartsWith } from "./stringTools.js";
/**
 * Class used to connect with the reflector zone of the sandbox via the reflector bridge
 * @since 5.0.0
 */
var Reflector = /** @class */ (function () {
    /**
     * Constructs a reflector object.
     * @param scene The scene to use
     * @param hostname The hostname of the reflector bridge
     * @param port The port of the reflector bridge
     */
    function Reflector(scene, hostname, port) {
        var _this = this;
        this._scene = scene;
        Logger.Log("[Reflector] Connecting to ws://".concat(hostname, ":").concat(port));
        this._webSocket = new WebSocket("ws://".concat(hostname, ":").concat(port));
        this._webSocket.onmessage = function (event) {
            var message = event.data;
            if (StartsWith(message, Reflector._SERVER_PREFIX)) {
                var serverMessage = message.substr(Reflector._SERVER_PREFIX.length);
                Logger.Log("[Reflector] Received server message: ".concat(serverMessage.substr(0, 64)));
                _this._handleServerMessage(serverMessage);
                return;
            }
            else {
                Logger.Log("[Reflector] Received client message: ".concat(message.substr(0, 64)));
                _this._handleClientMessage();
            }
        };
        this._webSocket.onclose = function (event) {
            Logger.Log("[Reflector] Disconnected ".concat(event.code, " ").concat(event.reason));
        };
    }
    /**
     * Closes the reflector connection
     */
    Reflector.prototype.close = function () {
        this._webSocket.close();
    };
    Reflector.prototype._handleServerMessage = function (message) {
        var _this = this;
        switch (message) {
            case "connected": {
                SceneSerializer.SerializeAsync(this._scene).then(function (serialized) {
                    _this._webSocket.send("load|".concat(JSON.stringify(serialized)));
                });
                break;
            }
        }
    };
    Reflector.prototype._handleClientMessage = function () {
        // do nothing
    };
    Reflector._SERVER_PREFIX = "$$";
    return Reflector;
}());
export { Reflector };
//# sourceMappingURL=reflector.js.map