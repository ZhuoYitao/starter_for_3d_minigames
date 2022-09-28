import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { KeyboardEventTypes } from "../../Events/keyboardEvents.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { Tools } from "../../Misc/tools.js";
/**
 * Manage the keyboard inputs to control the movement of a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraKeyboardMoveInput = /** @class */ (function () {
    function FreeCameraKeyboardMoveInput() {
        /**
         * Gets or Set the list of keyboard keys used to control the forward move of the camera.
         */
        this.keysUp = [38];
        /**
         * Gets or Set the list of keyboard keys used to control the upward move of the camera.
         */
        this.keysUpward = [33];
        /**
         * Gets or Set the list of keyboard keys used to control the backward move of the camera.
         */
        this.keysDown = [40];
        /**
         * Gets or Set the list of keyboard keys used to control the downward move of the camera.
         */
        this.keysDownward = [34];
        /**
         * Gets or Set the list of keyboard keys used to control the left strafe move of the camera.
         */
        this.keysLeft = [37];
        /**
         * Gets or Set the list of keyboard keys used to control the right strafe move of the camera.
         */
        this.keysRight = [39];
        /**
         * Defines the pointer angular sensibility  along the X and Y axis or how fast is the camera rotating.
         */
        this.rotationSpeed = 0.5;
        /**
         * Gets or Set the list of keyboard keys used to control the left rotation move of the camera.
         */
        this.keysRotateLeft = [];
        /**
         * Gets or Set the list of keyboard keys used to control the right rotation move of the camera.
         */
        this.keysRotateRight = [];
        this._keys = new Array();
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraKeyboardMoveInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        if (this._onCanvasBlurObserver) {
            return;
        }
        this._scene = this.camera.getScene();
        this._engine = this._scene.getEngine();
        this._onCanvasBlurObserver = this._engine.onCanvasBlurObservable.add(function () {
            _this._keys = [];
        });
        this._onKeyboardObserver = this._scene.onKeyboardObservable.add(function (info) {
            var evt = info.event;
            if (!evt.metaKey) {
                if (info.type === KeyboardEventTypes.KEYDOWN) {
                    if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysUpward.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDownward.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRotateLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRotateRight.indexOf(evt.keyCode) !== -1) {
                        var index = _this._keys.indexOf(evt.keyCode);
                        if (index === -1) {
                            _this._keys.push(evt.keyCode);
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
                else {
                    if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysUpward.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDownward.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRotateLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRotateRight.indexOf(evt.keyCode) !== -1) {
                        var index = _this._keys.indexOf(evt.keyCode);
                        if (index >= 0) {
                            _this._keys.splice(index, 1);
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
            }
        });
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    FreeCameraKeyboardMoveInput.prototype.detachControl = function () {
        if (this._scene) {
            if (this._onKeyboardObserver) {
                this._scene.onKeyboardObservable.remove(this._onKeyboardObserver);
            }
            if (this._onCanvasBlurObserver) {
                this._engine.onCanvasBlurObservable.remove(this._onCanvasBlurObserver);
            }
            this._onKeyboardObserver = null;
            this._onCanvasBlurObserver = null;
        }
        this._keys = [];
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    FreeCameraKeyboardMoveInput.prototype.checkInputs = function () {
        if (this._onKeyboardObserver) {
            var camera = this.camera;
            // Keyboard
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                var speed = camera._computeLocalCameraSpeed();
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(-speed, 0, 0);
                }
                else if (this.keysUp.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, speed);
                }
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(speed, 0, 0);
                }
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, -speed);
                }
                else if (this.keysUpward.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, speed, 0);
                }
                else if (this.keysDownward.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, -speed, 0);
                }
                else if (this.keysRotateLeft.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, 0);
                    camera.cameraRotation.y -= this._getLocalRotation();
                }
                else if (this.keysRotateRight.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, 0);
                    camera.cameraRotation.y += this._getLocalRotation();
                }
                if (camera.getScene().useRightHandedSystem) {
                    camera._localDirection.z *= -1;
                }
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
                Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
                camera.cameraDirection.addInPlace(camera._transformedDirection);
            }
        }
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    FreeCameraKeyboardMoveInput.prototype.getClassName = function () {
        return "FreeCameraKeyboardMoveInput";
    };
    /** @hidden */
    FreeCameraKeyboardMoveInput.prototype._onLostFocus = function () {
        this._keys = [];
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraKeyboardMoveInput.prototype.getSimpleName = function () {
        return "keyboard";
    };
    FreeCameraKeyboardMoveInput.prototype._getLocalRotation = function () {
        var rotation = (this.rotationSpeed * this._engine.getDeltaTime()) / 1000;
        if (this.camera.getScene().useRightHandedSystem) {
            rotation *= -1;
        }
        if (this.camera.parent && this.camera.parent._getWorldMatrixDeterminant() < 0) {
            rotation *= -1;
        }
        return rotation;
    };
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysUp", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysUpward", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysDown", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysDownward", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysLeft", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysRight", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "rotationSpeed", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysRotateLeft", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysRotateRight", void 0);
    return FreeCameraKeyboardMoveInput;
}());
export { FreeCameraKeyboardMoveInput };
CameraInputTypes["FreeCameraKeyboardMoveInput"] = FreeCameraKeyboardMoveInput;
//# sourceMappingURL=freeCameraKeyboardMoveInput.js.map