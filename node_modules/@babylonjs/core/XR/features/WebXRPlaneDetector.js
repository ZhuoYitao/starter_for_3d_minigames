import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { Observable } from "../../Misc/observable.js";
import { Vector3, Matrix } from "../../Maths/math.vector.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
var planeIdProvider = 0;
/**
 * The plane detector is used to detect planes in the real world when in AR
 * For more information see https://github.com/immersive-web/real-world-geometry/
 */
var WebXRPlaneDetector = /** @class */ (function (_super) {
    __extends(WebXRPlaneDetector, _super);
    /**
     * construct a new Plane Detector
     * @param _xrSessionManager an instance of xr Session manager
     * @param _options configuration to use when constructing this feature
     */
    function WebXRPlaneDetector(_xrSessionManager, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._detectedPlanes = [];
        _this._enabled = false;
        _this._lastFrameDetected = new Set();
        /**
         * Observers registered here will be executed when a new plane was added to the session
         */
        _this.onPlaneAddedObservable = new Observable();
        /**
         * Observers registered here will be executed when a plane is no longer detected in the session
         */
        _this.onPlaneRemovedObservable = new Observable();
        /**
         * Observers registered here will be executed when an existing plane updates (for example - expanded)
         * This can execute N times every frame
         */
        _this.onPlaneUpdatedObservable = new Observable();
        _this.xrNativeFeatureName = "plane-detection";
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
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRPlaneDetector.prototype.detach = function () {
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        if (!this._options.doNotRemovePlanesOnSessionEnded) {
            while (this._detectedPlanes.length) {
                var toRemove = this._detectedPlanes.pop();
                if (toRemove) {
                    this.onPlaneRemovedObservable.notifyObservers(toRemove);
                }
            }
        }
        return true;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRPlaneDetector.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onPlaneAddedObservable.clear();
        this.onPlaneRemovedObservable.clear();
        this.onPlaneUpdatedObservable.clear();
    };
    /**
     * Check if the needed objects are defined.
     * This does not mean that the feature is enabled, but that the objects needed are well defined.
     */
    WebXRPlaneDetector.prototype.isCompatible = function () {
        return typeof XRPlane !== "undefined";
    };
    WebXRPlaneDetector.prototype._onXRFrame = function (frame) {
        var _this = this;
        var _a;
        if (!this.attached || !this._enabled || !frame) {
            return;
        }
        var detectedPlanes = frame.detectedPlanes || ((_a = frame.worldInformation) === null || _a === void 0 ? void 0 : _a.detectedPlanes);
        if (detectedPlanes) {
            // remove all planes that are not currently detected in the frame
            for (var planeIdx = 0; planeIdx < this._detectedPlanes.length; planeIdx++) {
                var plane = this._detectedPlanes[planeIdx];
                if (!detectedPlanes.has(plane.xrPlane)) {
                    this._detectedPlanes.splice(planeIdx--, 1);
                    this.onPlaneRemovedObservable.notifyObservers(plane);
                }
            }
            // now check for new ones
            detectedPlanes.forEach(function (xrPlane) {
                if (!_this._lastFrameDetected.has(xrPlane)) {
                    var newPlane = {
                        id: planeIdProvider++,
                        xrPlane: xrPlane,
                        polygonDefinition: [],
                    };
                    var plane = _this._updatePlaneWithXRPlane(xrPlane, newPlane, frame);
                    _this._detectedPlanes.push(plane);
                    _this.onPlaneAddedObservable.notifyObservers(plane);
                }
                else {
                    // updated?
                    if (xrPlane.lastChangedTime === _this._xrSessionManager.currentTimestamp) {
                        var index = _this._findIndexInPlaneArray(xrPlane);
                        var plane = _this._detectedPlanes[index];
                        _this._updatePlaneWithXRPlane(xrPlane, plane, frame);
                        _this.onPlaneUpdatedObservable.notifyObservers(plane);
                    }
                }
            });
            this._lastFrameDetected = detectedPlanes;
        }
    };
    WebXRPlaneDetector.prototype._init = function () {
        var _this = this;
        var internalInit = function () {
            _this._enabled = true;
            if (_this._detectedPlanes.length) {
                _this._detectedPlanes.length = 0;
            }
        };
        // Only supported by BabylonNative
        if (!!this._xrSessionManager.isNative && !!this._options.preferredDetectorOptions && !!this._xrSessionManager.session.trySetPreferredPlaneDetectorOptions) {
            this._xrSessionManager.session.trySetPreferredPlaneDetectorOptions(this._options.preferredDetectorOptions);
        }
        if (!this._xrSessionManager.session.updateWorldTrackingState) {
            internalInit();
            return;
        }
        this._xrSessionManager.session.updateWorldTrackingState({ planeDetectionState: { enabled: true } });
        internalInit();
    };
    WebXRPlaneDetector.prototype._updatePlaneWithXRPlane = function (xrPlane, plane, xrFrame) {
        var _this = this;
        plane.polygonDefinition = xrPlane.polygon.map(function (xrPoint) {
            var rightHandedSystem = _this._xrSessionManager.scene.useRightHandedSystem ? 1 : -1;
            return new Vector3(xrPoint.x, xrPoint.y, xrPoint.z * rightHandedSystem);
        });
        // matrix
        var pose = xrFrame.getPose(xrPlane.planeSpace, this._xrSessionManager.referenceSpace);
        if (pose) {
            var mat = plane.transformationMatrix || new Matrix();
            Matrix.FromArrayToRef(pose.transform.matrix, 0, mat);
            if (!this._xrSessionManager.scene.useRightHandedSystem) {
                mat.toggleModelMatrixHandInPlace();
            }
            plane.transformationMatrix = mat;
            if (this._options.worldParentNode) {
                mat.multiplyToRef(this._options.worldParentNode.getWorldMatrix(), mat);
            }
        }
        return plane;
    };
    /**
     * avoiding using Array.find for global support.
     * @param xrPlane the plane to find in the array
     */
    WebXRPlaneDetector.prototype._findIndexInPlaneArray = function (xrPlane) {
        for (var i = 0; i < this._detectedPlanes.length; ++i) {
            if (this._detectedPlanes[i].xrPlane === xrPlane) {
                return i;
            }
        }
        return -1;
    };
    /**
     * The module's name
     */
    WebXRPlaneDetector.Name = WebXRFeatureName.PLANE_DETECTION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRPlaneDetector.Version = 1;
    return WebXRPlaneDetector;
}(WebXRAbstractFeature));
export { WebXRPlaneDetector };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRPlaneDetector.Name, function (xrSessionManager, options) {
    return function () { return new WebXRPlaneDetector(xrSessionManager, options); };
}, WebXRPlaneDetector.Version);
//# sourceMappingURL=WebXRPlaneDetector.js.map