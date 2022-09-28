import { __decorate } from "tslib";
import { Observable } from "../../Misc/observable.js";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Tools } from "../../Misc/tools.js";
/**
 * Manage the mouse inputs to control the movement of a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraMouseInput = /** @class */ (function () {
    /**
     * Manage the mouse inputs to control the movement of a free camera.
     * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
     * @param touchEnabled Defines if touch is enabled or not
     */
    function FreeCameraMouseInput(
    /**
     * Define if touch is enabled in the mouse input
     */
    touchEnabled) {
        if (touchEnabled === void 0) { touchEnabled = true; }
        this.touchEnabled = touchEnabled;
        /**
         * Defines the buttons associated with the input to handle camera move.
         */
        this.buttons = [0, 1, 2];
        /**
         * Defines the pointer angular sensibility  along the X and Y axis or how fast is the camera rotating.
         */
        this.angularSensibility = 2000.0;
        this._previousPosition = null;
        /**
         * Observable for when a pointer move event occurs containing the move offset
         */
        this.onPointerMovedObservable = new Observable();
        /**
         * @hidden
         * If the camera should be rotated automatically based on pointer movement
         */
        this._allowCameraRotation = true;
        this._currentActiveButton = -1;
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraMouseInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (!this._pointerInput) {
            this._pointerInput = function (p) {
                var evt = p.event;
                var isTouch = evt.pointerType === "touch";
                if (engine.isInVRExclusivePointerMode) {
                    return;
                }
                if (!_this.touchEnabled && isTouch) {
                    return;
                }
                if (p.type !== PointerEventTypes.POINTERMOVE && _this.buttons.indexOf(evt.button) === -1) {
                    return;
                }
                var srcElement = (evt.srcElement || evt.target);
                if (p.type === PointerEventTypes.POINTERDOWN && (_this._currentActiveButton === -1 || isTouch)) {
                    try {
                        srcElement === null || srcElement === void 0 ? void 0 : srcElement.setPointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error. Execution will continue.
                    }
                    if (_this._currentActiveButton === -1) {
                        _this._currentActiveButton = evt.button;
                    }
                    _this._previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY,
                    };
                    if (!noPreventDefault) {
                        evt.preventDefault();
                        element && element.focus();
                    }
                    // This is required to move while pointer button is down
                    if (engine.isPointerLock && _this._onMouseMove) {
                        _this._onMouseMove(p.event);
                    }
                }
                else if (p.type === PointerEventTypes.POINTERUP && (_this._currentActiveButton === evt.button || isTouch)) {
                    try {
                        srcElement === null || srcElement === void 0 ? void 0 : srcElement.releasePointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error.
                    }
                    _this._currentActiveButton = -1;
                    _this._previousPosition = null;
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
                else if (p.type === PointerEventTypes.POINTERMOVE) {
                    if (engine.isPointerLock && _this._onMouseMove) {
                        _this._onMouseMove(p.event);
                    }
                    else if (_this._previousPosition) {
                        var offsetX = evt.clientX - _this._previousPosition.x;
                        var offsetY = evt.clientY - _this._previousPosition.y;
                        if (_this.camera.getScene().useRightHandedSystem) {
                            offsetX *= -1;
                        }
                        if (_this.camera.parent && _this.camera.parent._getWorldMatrixDeterminant() < 0) {
                            offsetX *= -1;
                        }
                        if (_this._allowCameraRotation) {
                            _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
                            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
                        }
                        _this.onPointerMovedObservable.notifyObservers({ offsetX: offsetX, offsetY: offsetY });
                        _this._previousPosition = {
                            x: evt.clientX,
                            y: evt.clientY,
                        };
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
            };
        }
        this._onMouseMove = function (evt) {
            if (!engine.isPointerLock) {
                return;
            }
            if (engine.isInVRExclusivePointerMode) {
                return;
            }
            var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
            if (_this.camera.getScene().useRightHandedSystem) {
                offsetX *= -1;
            }
            if (_this.camera.parent && _this.camera.parent._getWorldMatrixDeterminant() < 0) {
                offsetX *= -1;
            }
            _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
            var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
            _this._previousPosition = null;
            if (!noPreventDefault) {
                evt.preventDefault();
            }
        };
        this._observer = this.camera
            .getScene()
            .onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
        if (element) {
            this._contextMenuBind = this.onContextMenu.bind(this);
            element.addEventListener("contextmenu", this._contextMenuBind, false); // TODO: We need to figure out how to handle this for Native
        }
    };
    /**
     * Called on JS contextmenu event.
     * Override this method to provide functionality.
     * @param evt
     */
    FreeCameraMouseInput.prototype.onContextMenu = function (evt) {
        evt.preventDefault();
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    FreeCameraMouseInput.prototype.detachControl = function () {
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            if (this._contextMenuBind) {
                var engine = this.camera.getEngine();
                var element = engine.getInputElement();
                element && element.removeEventListener("contextmenu", this._contextMenuBind);
            }
            if (this.onPointerMovedObservable) {
                this.onPointerMovedObservable.clear();
            }
            this._observer = null;
            this._onMouseMove = null;
            this._previousPosition = null;
        }
        this._currentActiveButton = -1;
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    FreeCameraMouseInput.prototype.getClassName = function () {
        return "FreeCameraMouseInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraMouseInput.prototype.getSimpleName = function () {
        return "mouse";
    };
    __decorate([
        serialize()
    ], FreeCameraMouseInput.prototype, "buttons", void 0);
    __decorate([
        serialize()
    ], FreeCameraMouseInput.prototype, "angularSensibility", void 0);
    return FreeCameraMouseInput;
}());
export { FreeCameraMouseInput };
CameraInputTypes["FreeCameraMouseInput"] = FreeCameraMouseInput;
//# sourceMappingURL=freeCameraMouseInput.js.map