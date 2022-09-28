import { IsWindowObjectExist } from "./domManagement.js";
/**
 * A wrapper for the experimental compute pressure api which allows a callback to be called whenever certain thresholds are met.
 */
var ComputePressureObserverWrapper = /** @class */ (function () {
    /**
     * A compute pressure observer will call this callback, whenever these thresholds are met.
     * @param callback The callback that is called whenever thresholds are met.
     * @param thresholds An object containing the thresholds used to decide what value to to return for each update property (average of start and end of a threshold boundary).
     */
    function ComputePressureObserverWrapper(callback, thresholds) {
        if (ComputePressureObserverWrapper.IsAvailable) {
            this._observer = new window.ComputePressureObserver(callback, thresholds);
        }
    }
    Object.defineProperty(ComputePressureObserverWrapper, "IsAvailable", {
        /**
         * Returns true if ComputePressureObserver is available for use, false otherwise.
         */
        get: function () {
            return IsWindowObjectExist() && "ComputePressureObserver" in window;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Method that must be called to begin observing changes, and triggering callbacks.
     */
    ComputePressureObserverWrapper.prototype.observe = function () {
        var _a, _b;
        ((_a = this._observer) === null || _a === void 0 ? void 0 : _a.observe) && ((_b = this._observer) === null || _b === void 0 ? void 0 : _b.observe());
    };
    /**
     * Method that must be called to stop observing changes and triggering callbacks (cleanup function).
     */
    ComputePressureObserverWrapper.prototype.unobserve = function () {
        var _a, _b;
        ((_a = this._observer) === null || _a === void 0 ? void 0 : _a.unobserve) && ((_b = this._observer) === null || _b === void 0 ? void 0 : _b.unobserve());
    };
    return ComputePressureObserverWrapper;
}());
export { ComputePressureObserverWrapper };
//# sourceMappingURL=computePressure.js.map