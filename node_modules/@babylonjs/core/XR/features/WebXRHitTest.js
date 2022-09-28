import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { Observable } from "../../Misc/observable.js";
import { Vector3, Matrix, Quaternion } from "../../Maths/math.vector.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Tools } from "../../Misc/tools.js";
/**
 * The currently-working hit-test module.
 * Hit test (or Ray-casting) is used to interact with the real world.
 * For further information read here - https://github.com/immersive-web/hit-test
 *
 * Tested on chrome (mobile) 80.
 */
var WebXRHitTest = /** @class */ (function (_super) {
    __extends(WebXRHitTest, _super);
    /**
     * Creates a new instance of the hit test feature
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param options options to use when constructing this feature
     */
    function WebXRHitTest(_xrSessionManager, 
    /**
     * options to use when constructing this feature
     */
    options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, _xrSessionManager) || this;
        _this.options = options;
        _this._tmpMat = new Matrix();
        _this._tmpPos = new Vector3();
        _this._tmpQuat = new Quaternion();
        _this._initHitTestSource = function (referenceSpace) {
            if (!referenceSpace) {
                return;
            }
            var offsetRay = new XRRay(_this.options.offsetRay || {});
            var hitTestOptions = {
                space: _this.options.useReferenceSpace ? referenceSpace : _this._xrSessionManager.viewerReferenceSpace,
                offsetRay: offsetRay,
            };
            if (_this.options.entityTypes) {
                hitTestOptions.entityTypes = _this.options.entityTypes;
            }
            if (!hitTestOptions.space) {
                Tools.Warn("waiting for viewer reference space to initialize");
                return;
            }
            _this._xrSessionManager.session.requestHitTestSource(hitTestOptions).then(function (hitTestSource) {
                if (_this._xrHitTestSource) {
                    _this._xrHitTestSource.cancel();
                }
                _this._xrHitTestSource = hitTestSource;
            });
        };
        /**
         * When set to true, each hit test will have its own position/rotation objects
         * When set to false, position and rotation objects will be reused for each hit test. It is expected that
         * the developers will clone them or copy them as they see fit.
         */
        _this.autoCloneTransformation = false;
        /**
         * Triggered when new babylon (transformed) hit test results are available
         * Note - this will be called when results come back from the device. It can be an empty array!!
         */
        _this.onHitTestResultObservable = new Observable();
        /**
         * Use this to temporarily pause hit test checks.
         */
        _this.paused = false;
        _this.xrNativeFeatureName = "hit-test";
        Tools.Warn("Hit test is an experimental and unstable feature.");
        return _this;
    }
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRHitTest.prototype.attach = function () {
        var _this = this;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        // Feature enabled, but not available
        if (!this._xrSessionManager.session.requestHitTestSource) {
            return false;
        }
        if (!this.options.disablePermanentHitTest) {
            if (this._xrSessionManager.referenceSpace) {
                this._initHitTestSource(this._xrSessionManager.referenceSpace);
            }
            this._xrSessionManager.onXRReferenceSpaceChanged.add(this._initHitTestSource);
        }
        if (this.options.enableTransientHitTest) {
            var offsetRay = new XRRay(this.options.transientOffsetRay || {});
            this._xrSessionManager.session.requestHitTestSourceForTransientInput({
                profile: this.options.transientHitTestProfile || "generic-touchscreen",
                offsetRay: offsetRay,
                entityTypes: this.options.entityTypes,
            }).then(function (hitSource) {
                _this._transientXrHitTestSource = hitSource;
            });
        }
        return true;
    };
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRHitTest.prototype.detach = function () {
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        if (this._xrHitTestSource) {
            this._xrHitTestSource.cancel();
            this._xrHitTestSource = null;
        }
        this._xrSessionManager.onXRReferenceSpaceChanged.removeCallback(this._initHitTestSource);
        if (this._transientXrHitTestSource) {
            this._transientXrHitTestSource.cancel();
            this._transientXrHitTestSource = null;
        }
        return true;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRHitTest.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onHitTestResultObservable.clear();
    };
    WebXRHitTest.prototype._onXRFrame = function (frame) {
        var _this = this;
        // make sure we do nothing if (async) not attached
        if (!this.attached || this.paused) {
            return;
        }
        if (this._xrHitTestSource) {
            var results = frame.getHitTestResults(this._xrHitTestSource);
            this._processWebXRHitTestResult(results);
        }
        if (this._transientXrHitTestSource) {
            var hitTestResultsPerInputSource = frame.getHitTestResultsForTransientInput(this._transientXrHitTestSource);
            hitTestResultsPerInputSource.forEach(function (resultsPerInputSource) {
                _this._processWebXRHitTestResult(resultsPerInputSource.results, resultsPerInputSource.inputSource);
            });
        }
    };
    WebXRHitTest.prototype._processWebXRHitTestResult = function (hitTestResults, inputSource) {
        var _this = this;
        var results = [];
        hitTestResults.forEach(function (hitTestResult) {
            var pose = hitTestResult.getPose(_this._xrSessionManager.referenceSpace);
            if (!pose) {
                return;
            }
            var pos = pose.transform.position;
            var quat = pose.transform.orientation;
            _this._tmpPos.set(pos.x, pos.y, pos.z);
            _this._tmpQuat.set(quat.x, quat.y, quat.z, quat.w);
            Matrix.FromFloat32ArrayToRefScaled(pose.transform.matrix, 0, 1, _this._tmpMat);
            if (!_this._xrSessionManager.scene.useRightHandedSystem) {
                _this._tmpPos.z *= -1;
                _this._tmpQuat.z *= -1;
                _this._tmpQuat.w *= -1;
                _this._tmpMat.toggleModelMatrixHandInPlace();
            }
            var result = {
                position: _this.autoCloneTransformation ? _this._tmpPos.clone() : _this._tmpPos,
                rotationQuaternion: _this.autoCloneTransformation ? _this._tmpQuat.clone() : _this._tmpQuat,
                transformationMatrix: _this.autoCloneTransformation ? _this._tmpMat.clone() : _this._tmpMat,
                inputSource: inputSource,
                isTransient: !!inputSource,
                xrHitResult: hitTestResult,
            };
            results.push(result);
        });
        this.onHitTestResultObservable.notifyObservers(results);
    };
    /**
     * The module's name
     */
    WebXRHitTest.Name = WebXRFeatureName.HIT_TEST;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRHitTest.Version = 2;
    return WebXRHitTest;
}(WebXRAbstractFeature));
export { WebXRHitTest };
//register the plugin versions
WebXRFeaturesManager.AddWebXRFeature(WebXRHitTest.Name, function (xrSessionManager, options) {
    return function () { return new WebXRHitTest(xrSessionManager, options); };
}, WebXRHitTest.Version, false);
//# sourceMappingURL=WebXRHitTest.js.map