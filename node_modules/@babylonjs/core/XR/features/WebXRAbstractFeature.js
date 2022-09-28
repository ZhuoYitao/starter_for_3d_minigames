/**
 * This is the base class for all WebXR features.
 * Since most features require almost the same resources and callbacks, this class can be used to simplify the development
 * Note that since the features manager is using the `IWebXRFeature` you are in no way obligated to use this class
 */
var WebXRAbstractFeature = /** @class */ (function () {
    /**
     * Construct a new (abstract) WebXR feature
     * @param _xrSessionManager the xr session manager for this feature
     */
    function WebXRAbstractFeature(_xrSessionManager) {
        this._xrSessionManager = _xrSessionManager;
        this._attached = false;
        this._removeOnDetach = [];
        /**
         * Is this feature disposed?
         */
        this.isDisposed = false;
        /**
         * Should auto-attach be disabled?
         */
        this.disableAutoAttach = false;
        /**
         * The name of the native xr feature name (like anchor, hit-test, or hand-tracking)
         */
        this.xrNativeFeatureName = "";
    }
    Object.defineProperty(WebXRAbstractFeature.prototype, "attached", {
        /**
         * Is this feature attached
         */
        get: function () {
            return this._attached;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * attach this feature
     *
     * @param force should attachment be forced (even when already attached)
     * @returns true if successful, false is failed or already attached
     */
    WebXRAbstractFeature.prototype.attach = function (force) {
        var _this = this;
        // do not attach a disposed feature
        if (this.isDisposed) {
            return false;
        }
        if (!force) {
            if (this.attached) {
                return false;
            }
        }
        else {
            if (this.attached) {
                // detach first, to be sure
                this.detach();
            }
        }
        this._attached = true;
        this._addNewAttachObserver(this._xrSessionManager.onXRFrameObservable, function (frame) { return _this._onXRFrame(frame); });
        return true;
    };
    /**
     * detach this feature.
     *
     * @returns true if successful, false if failed or already detached
     */
    WebXRAbstractFeature.prototype.detach = function () {
        if (!this._attached) {
            this.disableAutoAttach = true;
            return false;
        }
        this._attached = false;
        this._removeOnDetach.forEach(function (toRemove) {
            toRemove.observable.remove(toRemove.observer);
        });
        return true;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRAbstractFeature.prototype.dispose = function () {
        this.detach();
        this.isDisposed = true;
    };
    /**
     * This function will be executed during before enabling the feature and can be used to not-allow enabling it.
     * Note that at this point the session has NOT started, so this is purely checking if the browser supports it
     *
     * @returns whether or not the feature is compatible in this environment
     */
    WebXRAbstractFeature.prototype.isCompatible = function () {
        return true;
    };
    /**
     * This is used to register callbacks that will automatically be removed when detach is called.
     * @param observable the observable to which the observer will be attached
     * @param callback the callback to register
     */
    WebXRAbstractFeature.prototype._addNewAttachObserver = function (observable, callback) {
        this._removeOnDetach.push({
            observable: observable,
            observer: observable.add(callback),
        });
    };
    return WebXRAbstractFeature;
}());
export { WebXRAbstractFeature };
//# sourceMappingURL=WebXRAbstractFeature.js.map