import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { Tools } from "../../Misc/tools.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
/**
 * Base class for Camera Pointer Inputs.
 * See FollowCameraPointersInput in src/Cameras/Inputs/followCameraPointersInput.ts
 * for example usage.
 */
var BaseCameraPointersInput = /** @class */ (function () {
    function BaseCameraPointersInput() {
        this._currentActiveButton = -1;
        /**
         * Defines the buttons associated with the input to handle camera move.
         */
        this.buttons = [0, 1, 2];
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    BaseCameraPointersInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        var previousPinchSquaredDistance = 0;
        var previousMultiTouchPanPosition = null;
        this._pointA = null;
        this._pointB = null;
        this._altKey = false;
        this._ctrlKey = false;
        this._metaKey = false;
        this._shiftKey = false;
        this._buttonsPressed = 0;
        this._pointerInput = function (p) {
            var evt = p.event;
            var isTouch = evt.pointerType === "touch";
            if (engine.isInVRExclusivePointerMode) {
                return;
            }
            if (p.type !== PointerEventTypes.POINTERMOVE && _this.buttons.indexOf(evt.button) === -1) {
                return;
            }
            var srcElement = (evt.srcElement || evt.target);
            _this._altKey = evt.altKey;
            _this._ctrlKey = evt.ctrlKey;
            _this._metaKey = evt.metaKey;
            _this._shiftKey = evt.shiftKey;
            _this._buttonsPressed = evt.buttons;
            if (engine.isPointerLock) {
                var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
                var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
                _this.onTouch(null, offsetX, offsetY);
                _this._pointA = null;
                _this._pointB = null;
            }
            else if (p.type === PointerEventTypes.POINTERDOWN && (_this._currentActiveButton === -1 || isTouch)) {
                try {
                    srcElement === null || srcElement === void 0 ? void 0 : srcElement.setPointerCapture(evt.pointerId);
                }
                catch (e) {
                    //Nothing to do with the error. Execution will continue.
                }
                if (_this._pointA === null) {
                    _this._pointA = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                }
                else if (_this._pointB === null) {
                    _this._pointB = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                }
                if (_this._currentActiveButton === -1 && !isTouch) {
                    _this._currentActiveButton = evt.button;
                }
                _this.onButtonDown(evt);
                if (!noPreventDefault) {
                    evt.preventDefault();
                    element && element.focus();
                }
            }
            else if (p.type === PointerEventTypes.POINTERDOUBLETAP) {
                _this.onDoubleTap(evt.pointerType);
            }
            else if (p.type === PointerEventTypes.POINTERUP && (_this._currentActiveButton === evt.button || isTouch)) {
                try {
                    srcElement === null || srcElement === void 0 ? void 0 : srcElement.releasePointerCapture(evt.pointerId);
                }
                catch (e) {
                    //Nothing to do with the error.
                }
                if (!isTouch) {
                    _this._pointB = null; // Mouse and pen are mono pointer
                }
                //would be better to use pointers.remove(evt.pointerId) for multitouch gestures,
                //but emptying completely pointers collection is required to fix a bug on iPhone :
                //when changing orientation while pinching camera,
                //one pointer stay pressed forever if we don't release all pointers
                //will be ok to put back pointers.remove(evt.pointerId); when iPhone bug corrected
                if (engine._badOS) {
                    _this._pointA = _this._pointB = null;
                }
                else {
                    //only remove the impacted pointer in case of multitouch allowing on most
                    //platforms switching from rotate to zoom and pan seamlessly.
                    if (_this._pointB && _this._pointA && _this._pointA.pointerId == evt.pointerId) {
                        _this._pointA = _this._pointB;
                        _this._pointB = null;
                    }
                    else if (_this._pointA && _this._pointB && _this._pointB.pointerId == evt.pointerId) {
                        _this._pointB = null;
                    }
                    else {
                        _this._pointA = _this._pointB = null;
                    }
                }
                if (previousPinchSquaredDistance !== 0 || previousMultiTouchPanPosition) {
                    // Previous pinch data is populated but a button has been lifted
                    // so pinch has ended.
                    _this.onMultiTouch(_this._pointA, _this._pointB, previousPinchSquaredDistance, 0, // pinchSquaredDistance
                    previousMultiTouchPanPosition, null // multiTouchPanPosition
                    );
                    previousPinchSquaredDistance = 0;
                    previousMultiTouchPanPosition = null;
                }
                _this._currentActiveButton = -1;
                _this.onButtonUp(evt);
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            }
            else if (p.type === PointerEventTypes.POINTERMOVE) {
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
                // One button down
                if (_this._pointA && _this._pointB === null) {
                    var offsetX = evt.clientX - _this._pointA.x;
                    var offsetY = evt.clientY - _this._pointA.y;
                    _this.onTouch(_this._pointA, offsetX, offsetY);
                    _this._pointA.x = evt.clientX;
                    _this._pointA.y = evt.clientY;
                }
                // Two buttons down: pinch
                else if (_this._pointA && _this._pointB) {
                    var ed = _this._pointA.pointerId === evt.pointerId ? _this._pointA : _this._pointB;
                    ed.x = evt.clientX;
                    ed.y = evt.clientY;
                    var distX = _this._pointA.x - _this._pointB.x;
                    var distY = _this._pointA.y - _this._pointB.y;
                    var pinchSquaredDistance = distX * distX + distY * distY;
                    var multiTouchPanPosition = {
                        x: (_this._pointA.x + _this._pointB.x) / 2,
                        y: (_this._pointA.y + _this._pointB.y) / 2,
                        pointerId: evt.pointerId,
                        type: p.type,
                    };
                    _this.onMultiTouch(_this._pointA, _this._pointB, previousPinchSquaredDistance, pinchSquaredDistance, previousMultiTouchPanPosition, multiTouchPanPosition);
                    previousMultiTouchPanPosition = multiTouchPanPosition;
                    previousPinchSquaredDistance = pinchSquaredDistance;
                }
            }
        };
        this._observer = this.camera
            .getScene()
            .onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE | PointerEventTypes.POINTERDOUBLETAP);
        this._onLostFocus = function () {
            _this._pointA = _this._pointB = null;
            previousPinchSquaredDistance = 0;
            previousMultiTouchPanPosition = null;
            _this.onLostFocus();
        };
        this._contextMenuBind = this.onContextMenu.bind(this);
        element && element.addEventListener("contextmenu", this._contextMenuBind, false);
        var hostWindow = this.camera.getScene().getEngine().getHostWindow();
        if (hostWindow) {
            Tools.RegisterTopRootEvents(hostWindow, [{ name: "blur", handler: this._onLostFocus }]);
        }
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    BaseCameraPointersInput.prototype.detachControl = function () {
        if (this._onLostFocus) {
            var hostWindow = this.camera.getScene().getEngine().getHostWindow();
            if (hostWindow) {
                Tools.UnregisterTopRootEvents(hostWindow, [{ name: "blur", handler: this._onLostFocus }]);
            }
        }
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;
            if (this._contextMenuBind) {
                var inputElement = this.camera.getScene().getEngine().getInputElement();
                inputElement && inputElement.removeEventListener("contextmenu", this._contextMenuBind);
            }
            this._onLostFocus = null;
        }
        this._altKey = false;
        this._ctrlKey = false;
        this._metaKey = false;
        this._shiftKey = false;
        this._buttonsPressed = 0;
        this._currentActiveButton = -1;
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    BaseCameraPointersInput.prototype.getClassName = function () {
        return "BaseCameraPointersInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    BaseCameraPointersInput.prototype.getSimpleName = function () {
        return "pointers";
    };
    /**
     * Called on pointer POINTERDOUBLETAP event.
     * Override this method to provide functionality on POINTERDOUBLETAP event.
     * @param type
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseCameraPointersInput.prototype.onDoubleTap = function (type) { };
    /**
     * Called on pointer POINTERMOVE event if only a single touch is active.
     * Override this method to provide functionality.
     * @param point
     * @param offsetX
     * @param offsetY
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseCameraPointersInput.prototype.onTouch = function (point, offsetX, offsetY) { };
    /**
     * Called on pointer POINTERMOVE event if multiple touches are active.
     * Override this method to provide functionality.
     * @param _pointA
     * @param _pointB
     * @param previousPinchSquaredDistance
     * @param pinchSquaredDistance
     * @param previousMultiTouchPanPosition
     * @param multiTouchPanPosition
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseCameraPointersInput.prototype.onMultiTouch = function (_pointA, _pointB, previousPinchSquaredDistance, pinchSquaredDistance, previousMultiTouchPanPosition, multiTouchPanPosition) { };
    /**
     * Called on JS contextmenu event.
     * Override this method to provide functionality.
     * @param evt
     */
    BaseCameraPointersInput.prototype.onContextMenu = function (evt) {
        evt.preventDefault();
    };
    /**
     * Called each time a new POINTERDOWN event occurs. Ie, for each button
     * press.
     * Override this method to provide functionality.
     * @param evt
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseCameraPointersInput.prototype.onButtonDown = function (evt) { };
    /**
     * Called each time a new POINTERUP event occurs. Ie, for each button
     * release.
     * Override this method to provide functionality.
     * @param evt
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseCameraPointersInput.prototype.onButtonUp = function (evt) { };
    /**
     * Called when window becomes inactive.
     * Override this method to provide functionality.
     */
    BaseCameraPointersInput.prototype.onLostFocus = function () { };
    __decorate([
        serialize()
    ], BaseCameraPointersInput.prototype, "buttons", void 0);
    return BaseCameraPointersInput;
}());
export { BaseCameraPointersInput };
//# sourceMappingURL=BaseCameraPointersInput.js.map