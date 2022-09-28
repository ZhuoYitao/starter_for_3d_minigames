import { Observable } from "../Misc/observable.js";
import { IsWindowObjectExist } from "../Misc/domManagement.js";
import { PoseEnabledControllerHelper } from "../Gamepads/Controllers/poseEnabledController.js";
import { Xbox360Pad } from "./xboxGamepad.js";
import { Gamepad, GenericPad } from "./gamepad.js";
import { Engine } from "../Engines/engine.js";
import { DualShockPad } from "./dualShockGamepad.js";
import { Tools } from "../Misc/tools.js";
/**
 * Manager for handling gamepads
 */
var GamepadManager = /** @class */ (function () {
    /**
     * Initializes the gamepad manager
     * @param _scene BabylonJS scene
     */
    function GamepadManager(_scene) {
        var _this = this;
        this._scene = _scene;
        this._babylonGamepads = [];
        this._oneGamepadConnected = false;
        /** @hidden */
        this._isMonitoring = false;
        /**
         * observable to be triggered when the gamepad controller has been disconnected
         */
        this.onGamepadDisconnectedObservable = new Observable();
        if (!IsWindowObjectExist()) {
            this._gamepadEventSupported = false;
        }
        else {
            this._gamepadEventSupported = "GamepadEvent" in window;
            this._gamepadSupport = navigator && (navigator.getGamepads || navigator.webkitGetGamepads || navigator.msGetGamepads || navigator.webkitGamepads);
        }
        this.onGamepadConnectedObservable = new Observable(function (observer) {
            // This will be used to raise the onGamepadConnected for all gamepads ALREADY connected
            for (var i in _this._babylonGamepads) {
                var gamepad = _this._babylonGamepads[i];
                if (gamepad && gamepad._isConnected) {
                    _this.onGamepadConnectedObservable.notifyObserver(observer, gamepad);
                }
            }
        });
        this._onGamepadConnectedEvent = function (evt) {
            var gamepad = evt.gamepad;
            if (gamepad.index in _this._babylonGamepads) {
                if (_this._babylonGamepads[gamepad.index].isConnected) {
                    return;
                }
            }
            var newGamepad;
            if (_this._babylonGamepads[gamepad.index]) {
                newGamepad = _this._babylonGamepads[gamepad.index];
                newGamepad.browserGamepad = gamepad;
                newGamepad._isConnected = true;
            }
            else {
                newGamepad = _this._addNewGamepad(gamepad);
            }
            _this.onGamepadConnectedObservable.notifyObservers(newGamepad);
            _this._startMonitoringGamepads();
        };
        this._onGamepadDisconnectedEvent = function (evt) {
            var gamepad = evt.gamepad;
            // Remove the gamepad from the list of gamepads to monitor.
            for (var i in _this._babylonGamepads) {
                if (_this._babylonGamepads[i].index === gamepad.index) {
                    var disconnectedGamepad = _this._babylonGamepads[i];
                    disconnectedGamepad._isConnected = false;
                    _this.onGamepadDisconnectedObservable.notifyObservers(disconnectedGamepad);
                    disconnectedGamepad.dispose && disconnectedGamepad.dispose();
                    break;
                }
            }
        };
        if (this._gamepadSupport) {
            //first add already-connected gamepads
            this._updateGamepadObjects();
            if (this._babylonGamepads.length) {
                this._startMonitoringGamepads();
            }
            // Checking if the gamepad connected event is supported (like in Firefox)
            if (this._gamepadEventSupported) {
                var hostWindow = this._scene ? this._scene.getEngine().getHostWindow() : window;
                if (hostWindow) {
                    hostWindow.addEventListener("gamepadconnected", this._onGamepadConnectedEvent, false);
                    hostWindow.addEventListener("gamepaddisconnected", this._onGamepadDisconnectedEvent, false);
                }
            }
            else {
                this._startMonitoringGamepads();
            }
        }
    }
    Object.defineProperty(GamepadManager.prototype, "gamepads", {
        /**
         * The gamepads in the game pad manager
         */
        get: function () {
            return this._babylonGamepads;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the gamepad controllers based on type
     * @param type The type of gamepad controller
     * @returns Nullable gamepad
     */
    GamepadManager.prototype.getGamepadByType = function (type) {
        if (type === void 0) { type = Gamepad.XBOX; }
        for (var _i = 0, _a = this._babylonGamepads; _i < _a.length; _i++) {
            var gamepad = _a[_i];
            if (gamepad && gamepad.type === type) {
                return gamepad;
            }
        }
        return null;
    };
    /**
     * Disposes the gamepad manager
     */
    GamepadManager.prototype.dispose = function () {
        if (this._gamepadEventSupported) {
            if (this._onGamepadConnectedEvent) {
                window.removeEventListener("gamepadconnected", this._onGamepadConnectedEvent);
            }
            if (this._onGamepadDisconnectedEvent) {
                window.removeEventListener("gamepaddisconnected", this._onGamepadDisconnectedEvent);
            }
            this._onGamepadConnectedEvent = null;
            this._onGamepadDisconnectedEvent = null;
        }
        this._babylonGamepads.forEach(function (gamepad) {
            gamepad.dispose();
        });
        this.onGamepadConnectedObservable.clear();
        this.onGamepadDisconnectedObservable.clear();
        this._oneGamepadConnected = false;
        this._stopMonitoringGamepads();
        this._babylonGamepads = [];
    };
    GamepadManager.prototype._addNewGamepad = function (gamepad) {
        if (!this._oneGamepadConnected) {
            this._oneGamepadConnected = true;
        }
        var newGamepad;
        var dualShock = gamepad.id.search("054c") !== -1 && gamepad.id.search("0ce6") === -1;
        var xboxOne = gamepad.id.search("Xbox One") !== -1;
        if (xboxOne ||
            gamepad.id.search("Xbox 360") !== -1 ||
            gamepad.id.search("xinput") !== -1 ||
            (gamepad.id.search("045e") !== -1 && gamepad.id.search("Surface Dock") === -1)) {
            // make sure the Surface Dock Extender is not detected as an xbox controller
            newGamepad = new Xbox360Pad(gamepad.id, gamepad.index, gamepad, xboxOne);
        }
        else if (dualShock) {
            newGamepad = new DualShockPad(gamepad.id, gamepad.index, gamepad);
        }
        // if pose is supported, use the (WebVR) pose enabled controller
        else if (gamepad.pose) {
            newGamepad = PoseEnabledControllerHelper.InitiateController(gamepad);
        }
        else {
            newGamepad = new GenericPad(gamepad.id, gamepad.index, gamepad);
        }
        this._babylonGamepads[newGamepad.index] = newGamepad;
        return newGamepad;
    };
    GamepadManager.prototype._startMonitoringGamepads = function () {
        if (!this._isMonitoring) {
            this._isMonitoring = true;
            //back-comp
            if (!this._scene) {
                this._checkGamepadsStatus();
            }
        }
    };
    GamepadManager.prototype._stopMonitoringGamepads = function () {
        this._isMonitoring = false;
    };
    /** @hidden */
    GamepadManager.prototype._checkGamepadsStatus = function () {
        var _this = this;
        // Hack to be compatible Chrome
        this._updateGamepadObjects();
        for (var i in this._babylonGamepads) {
            var gamepad = this._babylonGamepads[i];
            if (!gamepad || !gamepad.isConnected) {
                continue;
            }
            try {
                gamepad.update();
            }
            catch (_a) {
                if (this._loggedErrors.indexOf(gamepad.index) === -1) {
                    Tools.Warn("Error updating gamepad ".concat(gamepad.id));
                    this._loggedErrors.push(gamepad.index);
                }
            }
        }
        if (this._isMonitoring && !this._scene) {
            Engine.QueueNewFrame(function () {
                _this._checkGamepadsStatus();
            });
        }
    };
    // This function is called only on Chrome, which does not properly support
    // connection/disconnection events and forces you to recopy again the gamepad object
    GamepadManager.prototype._updateGamepadObjects = function () {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
        for (var i = 0; i < gamepads.length; i++) {
            var gamepad = gamepads[i];
            if (gamepad) {
                if (!this._babylonGamepads[gamepad.index]) {
                    var newGamepad = this._addNewGamepad(gamepad);
                    this.onGamepadConnectedObservable.notifyObservers(newGamepad);
                }
                else {
                    // Forced to copy again this object for Chrome for unknown reason
                    this._babylonGamepads[i].browserGamepad = gamepad;
                    if (!this._babylonGamepads[i].isConnected) {
                        this._babylonGamepads[i]._isConnected = true;
                        this.onGamepadConnectedObservable.notifyObservers(this._babylonGamepads[i]);
                    }
                }
            }
        }
    };
    return GamepadManager;
}());
export { GamepadManager };
//# sourceMappingURL=gamepadManager.js.map