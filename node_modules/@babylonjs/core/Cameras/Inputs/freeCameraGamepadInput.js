import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { Matrix, Vector3, Vector2 } from "../../Maths/math.vector.js";
import { Gamepad } from "../../Gamepads/gamepad.js";
/**
 * Manage the gamepad inputs to control a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraGamepadInput = /** @class */ (function () {
    function FreeCameraGamepadInput() {
        /**
         * Defines the gamepad rotation sensibility.
         * This is the threshold from when rotation starts to be accounted for to prevent jittering.
         */
        this.gamepadAngularSensibility = 200;
        /**
         * Defines the gamepad move sensibility.
         * This is the threshold from when moving starts to be accounted for for to prevent jittering.
         */
        this.gamepadMoveSensibility = 40;
        /**
         * Defines the minimum value at which any analog stick input is ignored.
         * Note: This value should only be a value between 0 and 1.
         */
        this.deadzoneDelta = 0.1;
        this._yAxisScale = 1.0;
        this._cameraTransform = Matrix.Identity();
        this._deltaTransform = Vector3.Zero();
        this._vector3 = Vector3.Zero();
        this._vector2 = Vector2.Zero();
    }
    Object.defineProperty(FreeCameraGamepadInput.prototype, "invertYAxis", {
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
    FreeCameraGamepadInput.prototype.attachControl = function () {
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
        // check if there are already other controllers connected
        this.gamepad = manager.getGamepadByType(Gamepad.XBOX);
        // if no xbox controller was found, but there are gamepad controllers, take the first one
        if (!this.gamepad && manager.gamepads.length) {
            this.gamepad = manager.gamepads[0];
        }
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    FreeCameraGamepadInput.prototype.detachControl = function () {
        this.camera.getScene().gamepadManager.onGamepadConnectedObservable.remove(this._onGamepadConnectedObserver);
        this.camera.getScene().gamepadManager.onGamepadDisconnectedObservable.remove(this._onGamepadDisconnectedObserver);
        this.gamepad = null;
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    FreeCameraGamepadInput.prototype.checkInputs = function () {
        if (this.gamepad && this.gamepad.leftStick) {
            var camera = this.camera;
            var lsValues = this.gamepad.leftStick;
            if (this.gamepadMoveSensibility !== 0) {
                lsValues.x = Math.abs(lsValues.x) > this.deadzoneDelta ? lsValues.x / this.gamepadMoveSensibility : 0;
                lsValues.y = Math.abs(lsValues.y) > this.deadzoneDelta ? lsValues.y / this.gamepadMoveSensibility : 0;
            }
            var rsValues = this.gamepad.rightStick;
            if (rsValues && this.gamepadAngularSensibility !== 0) {
                rsValues.x = Math.abs(rsValues.x) > this.deadzoneDelta ? rsValues.x / this.gamepadAngularSensibility : 0;
                rsValues.y = (Math.abs(rsValues.y) > this.deadzoneDelta ? rsValues.y / this.gamepadAngularSensibility : 0) * this._yAxisScale;
            }
            else {
                rsValues = { x: 0, y: 0 };
            }
            if (!camera.rotationQuaternion) {
                Matrix.RotationYawPitchRollToRef(camera.rotation.y, camera.rotation.x, 0, this._cameraTransform);
            }
            else {
                camera.rotationQuaternion.toRotationMatrix(this._cameraTransform);
            }
            var speed = camera._computeLocalCameraSpeed() * 50.0;
            this._vector3.copyFromFloats(lsValues.x * speed, 0, -lsValues.y * speed);
            Vector3.TransformCoordinatesToRef(this._vector3, this._cameraTransform, this._deltaTransform);
            camera.cameraDirection.addInPlace(this._deltaTransform);
            this._vector2.copyFromFloats(rsValues.y, rsValues.x);
            camera.cameraRotation.addInPlace(this._vector2);
        }
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    FreeCameraGamepadInput.prototype.getClassName = function () {
        return "FreeCameraGamepadInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraGamepadInput.prototype.getSimpleName = function () {
        return "gamepad";
    };
    __decorate([
        serialize()
    ], FreeCameraGamepadInput.prototype, "gamepadAngularSensibility", void 0);
    __decorate([
        serialize()
    ], FreeCameraGamepadInput.prototype, "gamepadMoveSensibility", void 0);
    return FreeCameraGamepadInput;
}());
export { FreeCameraGamepadInput };
CameraInputTypes["FreeCameraGamepadInput"] = FreeCameraGamepadInput;
//# sourceMappingURL=freeCameraGamepadInput.js.map