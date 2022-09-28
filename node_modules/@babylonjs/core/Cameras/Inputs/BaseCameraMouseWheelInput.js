import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { Observable } from "../../Misc/observable.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Tools } from "../../Misc/tools.js";
import { EventConstants } from "../../Events/deviceInputEvents.js";
/**
 * Base class for mouse wheel input..
 * See FollowCameraMouseWheelInput in src/Cameras/Inputs/freeCameraMouseWheelInput.ts
 * for example usage.
 */
var BaseCameraMouseWheelInput = /** @class */ (function () {
    function BaseCameraMouseWheelInput() {
        /**
         * How fast is the camera moves in relation to X axis mouseWheel events.
         * Use negative value to reverse direction.
         */
        this.wheelPrecisionX = 3.0;
        /**
         * How fast is the camera moves in relation to Y axis mouseWheel events.
         * Use negative value to reverse direction.
         */
        this.wheelPrecisionY = 3.0;
        /**
         * How fast is the camera moves in relation to Z axis mouseWheel events.
         * Use negative value to reverse direction.
         */
        this.wheelPrecisionZ = 3.0;
        /**
         * Observable for when a mouse wheel move event occurs.
         */
        this.onChangedObservable = new Observable();
        /**
         * Incremental value of multiple mouse wheel movements of the X axis.
         * Should be zero-ed when read.
         */
        this._wheelDeltaX = 0;
        /**
         * Incremental value of multiple mouse wheel movements of the Y axis.
         * Should be zero-ed when read.
         */
        this._wheelDeltaY = 0;
        /**
         * Incremental value of multiple mouse wheel movements of the Z axis.
         * Should be zero-ed when read.
         */
        this._wheelDeltaZ = 0;
        /**
         * Firefox uses a different scheme to report scroll distances to other
         * browsers. Rather than use complicated methods to calculate the exact
         * multiple we need to apply, let's just cheat and use a constant.
         * https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
         * https://stackoverflow.com/questions/20110224/what-is-the-height-of-a-line-in-a-wheel-event-deltamode-dom-delta-line
         */
        this._ffMultiplier = 12;
        /**
         * Different event attributes for wheel data fall into a few set ranges.
         * Some relevant but dated date here:
         * https://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
         */
        this._normalize = 120;
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls
     *   should call preventdefault().
     *   (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    BaseCameraMouseWheelInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        this._wheel = function (pointer) {
            // sanity check - this should be a PointerWheel event.
            if (pointer.type !== PointerEventTypes.POINTERWHEEL) {
                return;
            }
            var event = pointer.event;
            var platformScale = event.deltaMode === EventConstants.DOM_DELTA_LINE ? _this._ffMultiplier : 1; // If this happens to be set to DOM_DELTA_LINE, adjust accordingly
            if (event.deltaY !== undefined) {
                // Most recent browsers versions have delta properties.
                // Firefox >= v17  (Has WebGL >= v4)
                // Chrome >=  v31  (Has WebGL >= v8)
                // Edge >=    v12  (Has WebGl >= v12)
                // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                _this._wheelDeltaX += (_this.wheelPrecisionX * platformScale * event.deltaX) / _this._normalize;
                _this._wheelDeltaY -= (_this.wheelPrecisionY * platformScale * event.deltaY) / _this._normalize;
                _this._wheelDeltaZ += (_this.wheelPrecisionZ * platformScale * event.deltaZ) / _this._normalize;
            }
            else if (event.wheelDeltaY !== undefined) {
                // Unsure whether these catch anything more. Documentation
                // online is contradictory.
                _this._wheelDeltaX += (_this.wheelPrecisionX * platformScale * event.wheelDeltaX) / _this._normalize;
                _this._wheelDeltaY -= (_this.wheelPrecisionY * platformScale * event.wheelDeltaY) / _this._normalize;
                _this._wheelDeltaZ += (_this.wheelPrecisionZ * platformScale * event.wheelDeltaZ) / _this._normalize;
            }
            else if (event.wheelDelta) {
                // IE >= v9   (Has WebGL >= v11)
                // Maybe others?
                _this._wheelDeltaY -= (_this.wheelPrecisionY * event.wheelDelta) / _this._normalize;
            }
            if (event.preventDefault) {
                if (!noPreventDefault) {
                    event.preventDefault();
                }
            }
        };
        this._observer = this.camera.getScene().onPointerObservable.add(this._wheel, PointerEventTypes.POINTERWHEEL);
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    BaseCameraMouseWheelInput.prototype.detachControl = function () {
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;
            this._wheel = null;
        }
        if (this.onChangedObservable) {
            this.onChangedObservable.clear();
        }
    };
    /**
     * Called for each rendered frame.
     */
    BaseCameraMouseWheelInput.prototype.checkInputs = function () {
        this.onChangedObservable.notifyObservers({
            wheelDeltaX: this._wheelDeltaX,
            wheelDeltaY: this._wheelDeltaY,
            wheelDeltaZ: this._wheelDeltaZ,
        });
        // Clear deltas.
        this._wheelDeltaX = 0;
        this._wheelDeltaY = 0;
        this._wheelDeltaZ = 0;
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    BaseCameraMouseWheelInput.prototype.getClassName = function () {
        return "BaseCameraMouseWheelInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    BaseCameraMouseWheelInput.prototype.getSimpleName = function () {
        return "mousewheel";
    };
    __decorate([
        serialize()
    ], BaseCameraMouseWheelInput.prototype, "wheelPrecisionX", void 0);
    __decorate([
        serialize()
    ], BaseCameraMouseWheelInput.prototype, "wheelPrecisionY", void 0);
    __decorate([
        serialize()
    ], BaseCameraMouseWheelInput.prototype, "wheelPrecisionZ", void 0);
    return BaseCameraMouseWheelInput;
}());
export { BaseCameraMouseWheelInput };
//# sourceMappingURL=BaseCameraMouseWheelInput.js.map