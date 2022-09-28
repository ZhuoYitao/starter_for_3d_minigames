import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Observable } from "../../Misc/observable.js";
import { Vector3, TmpVectors } from "../../Maths/math.vector.js";
import { Ray } from "../../Culling/ray.js";
/**
 * The WebXR Eye Tracking feature grabs eye data from the device and provides it in an easy-access format.
 * Currently only enabled for BabylonNative applications.
 */
var WebXREyeTracking = /** @class */ (function (_super) {
    __extends(WebXREyeTracking, _super);
    /**
     * Creates a new instance of the XR eye tracking feature.
     * @param _xrSessionManager An instance of WebXRSessionManager.
     */
    function WebXREyeTracking(_xrSessionManager) {
        var _this = _super.call(this, _xrSessionManager) || this;
        /**
         * This observable will notify registered observers when eye tracking starts
         */
        _this.onEyeTrackingStartedObservable = new Observable();
        /**
         * This observable will notify registered observers when eye tracking ends
         */
        _this.onEyeTrackingEndedObservable = new Observable();
        /**
         * This observable will notify registered observers on each frame that has valid tracking
         */
        _this.onEyeTrackingFrameUpdateObservable = new Observable();
        _this._eyeTrackingStartListener = function (event) {
            _this._latestEyeSpace = event.gazeSpace;
            _this._gazeRay = new Ray(Vector3.Zero(), Vector3.Forward());
            _this.onEyeTrackingStartedObservable.notifyObservers(_this._gazeRay);
        };
        _this._eyeTrackingEndListener = function () {
            _this._latestEyeSpace = null;
            _this._gazeRay = null;
            _this.onEyeTrackingEndedObservable.notifyObservers();
        };
        _this.xrNativeFeatureName = "eye-tracking";
        if (_this._xrSessionManager.session) {
            _this._init();
        }
        else {
            _this._xrSessionManager.onXRSessionInit.addOnce(function () {
                _this._init();
            });
        }
        return _this;
    }
    /**
     * Dispose this feature and all of the resources attached.
     */
    WebXREyeTracking.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._xrSessionManager.session.removeEventListener("eyetrackingstart", this._eyeTrackingStartListener);
        this._xrSessionManager.session.removeEventListener("eyetrackingend", this._eyeTrackingEndListener);
        this.onEyeTrackingStartedObservable.clear();
        this.onEyeTrackingEndedObservable.clear();
        this.onEyeTrackingFrameUpdateObservable.clear();
    };
    Object.defineProperty(WebXREyeTracking.prototype, "isEyeGazeValid", {
        /**
         * Returns whether the gaze data is valid or not
         * @returns true if the data is valid
         */
        get: function () {
            return !!this._gazeRay;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get a reference to the gaze ray. This data is valid while eye tracking persists, and will be set to null when gaze data is no longer available
     * @returns a reference to the gaze ray if it exists and is valid, returns null otherwise.
     */
    WebXREyeTracking.prototype.getEyeGaze = function () {
        return this._gazeRay;
    };
    WebXREyeTracking.prototype._onXRFrame = function (frame) {
        if (!this.attached || !frame) {
            return;
        }
        if (this._latestEyeSpace && this._gazeRay) {
            var pose = frame.getPose(this._latestEyeSpace, this._xrSessionManager.referenceSpace);
            if (pose) {
                this._gazeRay.origin.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                var quat = pose.transform.orientation;
                TmpVectors.Quaternion[0].set(quat.x, quat.y, quat.z, quat.w);
                if (!this._xrSessionManager.scene.useRightHandedSystem) {
                    this._gazeRay.origin.z *= -1;
                    TmpVectors.Quaternion[0].z *= -1;
                    TmpVectors.Quaternion[0].w *= -1;
                    Vector3.LeftHandedForwardReadOnly.rotateByQuaternionToRef(TmpVectors.Quaternion[0], this._gazeRay.direction);
                }
                else {
                    Vector3.RightHandedForwardReadOnly.rotateByQuaternionToRef(TmpVectors.Quaternion[0], this._gazeRay.direction);
                }
                this.onEyeTrackingFrameUpdateObservable.notifyObservers(this._gazeRay);
            }
        }
    };
    WebXREyeTracking.prototype._init = function () {
        // Only supported by BabylonNative
        if (this._xrSessionManager.isNative) {
            this._xrSessionManager.session.addEventListener("eyetrackingstart", this._eyeTrackingStartListener);
            this._xrSessionManager.session.addEventListener("eyetrackingend", this._eyeTrackingEndListener);
        }
    };
    /**
     * The module's name
     */
    WebXREyeTracking.Name = WebXRFeatureName.EYE_TRACKING;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXREyeTracking.Version = 1;
    return WebXREyeTracking;
}(WebXRAbstractFeature));
export { WebXREyeTracking };
WebXRFeaturesManager.AddWebXRFeature(WebXREyeTracking.Name, function (xrSessionManager) {
    return function () { return new WebXREyeTracking(xrSessionManager); };
}, WebXREyeTracking.Version, false);
//# sourceMappingURL=WebXREyeTracking.js.map