import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { Gamepad } from "../../Gamepads/gamepad.js";
/**
 * Manage the gamepad inputs to control an arc rotate camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var ArcRotateCameraGamepadInput = /** @class */ (function () {
    function ArcRotateCameraGamepadInput() {
        /**
         * Defines the gamepad rotation sensibility.
         * This is the threshold from when rotation starts to be accounted for to prevent jittering.
         */
        this.gamepadRotationSensibility = 80;
        /**
         * Defines the gamepad move sensibility.
         * This is the threshold from when moving starts to be accounted for for to prevent jittering.
         */
        this.gamepadMoveSensibility = 40;
        this._yAxisScale = 1.0;
    }
    Object.defineProperty(ArcRotateCameraGamepadInput.prototype, "invertYAxis", {
        /**
         * Gets or sets a boolean indicating that Yaxis (for right stick) should be inverted
         */
        get: function () {
            return this._yAxisScale !== 1.0;
        },
        set: function (value) {
            this._yAxisScale = value ? -1.0 : 1.0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Attach the input controls to a specific dom element to get the input from.
     */
    ArcRotateCameraGamepadInput.prototype.attachControl = function () {
        var _this = this;
        var manager = this.camera.getScene().gamepadManager;
        this._onGamepadConnectedObserver = manager.onGamepadConnectedObservable.add(function (gamepad) {
            if (gamepad.type !== Gamepad.POSE_ENABLED) {
                // prioritize XBOX gamepads.
                if (!_this.gamepad || gamepad.type === Gamepad.XBOX) {
                    _this.gamepad = gamepad;
                }
            }
        });
        this._onGamepadDisconnectedObserver = manager.onGamepadDisconnectedObservable.add(function (gamepad) {
            if (_this.gamepad === gamepad) {
                _this.gamepad = null;
            }
        });
        this.gamepad = manager.getGamepadByType(Gamepad.XBOX);
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    ArcRotateCameraGamepadInput.prototype.detachControl = function () {
        this.camera.getScene().gamepadManager.onGamepadConnectedObservable.remove(this._onGamepadConnectedObserver);
        this.camera.getScene().gamepadManager.onGamepadDisconnectedObservable.remove(this._onGamepadDisconnectedObserver);
        this.gamepad = null;
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    ArcRotateCameraGamepadInput.prototype.checkInputs = function () {
        if (this.gamepad) {
            var camera = this.camera;
            var rsValues = this.gamepad.rightStick;
            if (rsValues) {
                if (rsValues.x != 0) {
                    var normalizedRX = rsValues.x / this.gamepadRotationSensibility;
                    if (normalizedRX != 0 && Math.abs(normalizedRX) > 0.005) {
                        camera.inertialAlphaOffset += normalizedRX;
                    }
                }
                if (rsValues.y != 0) {
                    var normalizedRY = (rsValues.y / this.gamepadRotationSensibility) * this._yAxisScale;
                    if (normalizedRY != 0 && Math.abs(normalizedRY) > 0.005) {
                        camera.inertialBetaOffset += normalizedRY;
                    }
                }
            }
            var lsValues = this.gamepad.leftStick;
            if (lsValues && lsValues.y != 0) {
                var normalizedLY = lsValues.y / this.gamepadMoveSensibility;
                if (normalizedLY != 0 && Math.abs(normalizedLY) > 0.005) {
                    this.camera.inertialRadiusOffset -= normalizedLY;
                }
            }
        }
    };
    /**
     * Gets the class name of the current intput.
     * @returns the class name
     */
    ArcRotateCameraGamepadInput.prototype.getClassName = function () {
        return "ArcRotateCameraGamepadInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    ArcRotateCameraGamepadInput.prototype.getSimpleName = function () {
        return "gamepad";
    };
    __decorate([
        serialize()
    ], ArcRotateCameraGamepadInput.prototype, "gamepadRotationSensibility", void 0);
    __decorate([
        serialize()
    ], ArcRotateCameraGamepadInput.prototype, "gamepadMoveSensibility", void 0);
    return ArcRotateCameraGamepadInput;
}());
export { ArcRotateCameraGamepadInput };
CameraInputTypes["ArcRotateCameraGamepadInput"] = ArcRotateCameraGamepadInput;
//# sourceMappingURL=arcRotateCameraGamepadInput.js.map