import { __awaiter, __extends, __generator } from "tslib";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { Observable } from "../../Misc/observable.js";
import { Matrix, Vector3, Quaternion } from "../../Maths/math.vector.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Tools } from "../../Misc/tools.js";
var anchorIdProvider = 0;
/**
 * An implementation of the anchor system for WebXR.
 * For further information see https://github.com/immersive-web/anchors/
 */
var WebXRAnchorSystem = /** @class */ (function (_super) {
    __extends(WebXRAnchorSystem, _super);
    /**
     * constructs a new anchor system
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param _options configuration object for this feature
     */
    function WebXRAnchorSystem(_xrSessionManager, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._lastFrameDetected = new Set();
        _this._trackedAnchors = [];
        _this._futureAnchors = [];
        /**
         * Observers registered here will be executed when a new anchor was added to the session
         */
        _this.onAnchorAddedObservable = new Observable();
        /**
         * Observers registered here will be executed when an anchor was removed from the session
         */
        _this.onAnchorRemovedObservable = new Observable();
        /**
         * Observers registered here will be executed when an existing anchor updates
         * This can execute N times every frame
         */
        _this.onAnchorUpdatedObservable = new Observable();
        _this._tmpVector = new Vector3();
        _this._tmpQuaternion = new Quaternion();
        _this.xrNativeFeatureName = "anchors";
        return _this;
    }
    Object.defineProperty(WebXRAnchorSystem.prototype, "referenceSpaceForFrameAnchors", {
        /**
         * Set the reference space to use for anchor creation, when not using a hit test.
         * Will default to the session's reference space if not defined
         */
        set: function (referenceSpace) {
            this._referenceSpaceForFrameAnchors = referenceSpace;
        },
        enumerable: false,
        configurable: true
    });
    WebXRAnchorSystem.prototype._populateTmpTransformation = function (position, rotationQuaternion) {
        this._tmpVector.copyFrom(position);
        this._tmpQuaternion.copyFrom(rotationQuaternion);
        if (!this._xrSessionManager.scene.useRightHandedSystem) {
            this._tmpVector.z *= -1;
            this._tmpQuaternion.z *= -1;
            this._tmpQuaternion.w *= -1;
        }
        return {
            position: this._tmpVector,
            rotationQuaternion: this._tmpQuaternion,
        };
    };
    /**
     * Create a new anchor point using a hit test result at a specific point in the scene
     * An anchor is tracked only after it is added to the trackerAnchors in xrFrame. The promise returned here does not yet guaranty that.
     * Use onAnchorAddedObservable to get newly added anchors if you require tracking guaranty.
     *
     * @param hitTestResult The hit test result to use for this anchor creation
     * @param position an optional position offset for this anchor
     * @param rotationQuaternion an optional rotation offset for this anchor
     * @returns A promise that fulfills when babylon has created the corresponding WebXRAnchor object and tracking has begun
     */
    WebXRAnchorSystem.prototype.addAnchorPointUsingHitTestResultAsync = function (hitTestResult, position, rotationQuaternion) {
        if (position === void 0) { position = new Vector3(); }
        if (rotationQuaternion === void 0) { rotationQuaternion = new Quaternion(); }
        return __awaiter(this, void 0, void 0, function () {
            var m, nativeAnchor_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // convert to XR space (right handed) if needed
                        this._populateTmpTransformation(position, rotationQuaternion);
                        m = new XRRigidTransform({ x: this._tmpVector.x, y: this._tmpVector.y, z: this._tmpVector.z }, { x: this._tmpQuaternion.x, y: this._tmpQuaternion.y, z: this._tmpQuaternion.z, w: this._tmpQuaternion.w });
                        if (!!hitTestResult.xrHitResult.createAnchor) return [3 /*break*/, 1];
                        this.detach();
                        throw new Error("Anchors not enabled in this environment/browser");
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, hitTestResult.xrHitResult.createAnchor(m)];
                    case 2:
                        nativeAnchor_1 = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this._futureAnchors.push({
                                    nativeAnchor: nativeAnchor_1,
                                    resolved: false,
                                    submitted: true,
                                    xrTransformation: m,
                                    resolve: resolve,
                                    reject: reject,
                                });
                            })];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error(error_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a new anchor at a specific position and rotation
     * This function will add a new anchor per default in the next available frame. Unless forced, the createAnchor function
     * will be called in the next xrFrame loop to make sure that the anchor can be created correctly.
     * An anchor is tracked only after it is added to the trackerAnchors in xrFrame. The promise returned here does not yet guaranty that.
     * Use onAnchorAddedObservable to get newly added anchors if you require tracking guaranty.
     *
     * @param position the position in which to add an anchor
     * @param rotationQuaternion an optional rotation for the anchor transformation
     * @param forceCreateInCurrentFrame force the creation of this anchor in the current frame. Must be called inside xrFrame loop!
     * @returns A promise that fulfills when babylon has created the corresponding WebXRAnchor object and tracking has begun
     */
    WebXRAnchorSystem.prototype.addAnchorAtPositionAndRotationAsync = function (position, rotationQuaternion, forceCreateInCurrentFrame) {
        if (rotationQuaternion === void 0) { rotationQuaternion = new Quaternion(); }
        if (forceCreateInCurrentFrame === void 0) { forceCreateInCurrentFrame = false; }
        return __awaiter(this, void 0, void 0, function () {
            var xrTransformation, xrAnchor, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // convert to XR space (right handed) if needed
                        this._populateTmpTransformation(position, rotationQuaternion);
                        xrTransformation = new XRRigidTransform({ x: this._tmpVector.x, y: this._tmpVector.y, z: this._tmpVector.z }, { x: this._tmpQuaternion.x, y: this._tmpQuaternion.y, z: this._tmpQuaternion.z, w: this._tmpQuaternion.w });
                        if (!(forceCreateInCurrentFrame && this.attached && this._xrSessionManager.currentFrame)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createAnchorAtTransformation(xrTransformation, this._xrSessionManager.currentFrame)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = undefined;
                        _b.label = 3;
                    case 3:
                        xrAnchor = _a;
                        // add the transformation to the future anchors list
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this._futureAnchors.push({
                                    nativeAnchor: xrAnchor,
                                    resolved: false,
                                    submitted: false,
                                    xrTransformation: xrTransformation,
                                    resolve: resolve,
                                    reject: reject,
                                });
                            })];
                }
            });
        });
    };
    Object.defineProperty(WebXRAnchorSystem.prototype, "anchors", {
        /**
         * Get the list of anchors currently being tracked by the system
         */
        get: function () {
            return this._trackedAnchors;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRAnchorSystem.prototype.detach = function () {
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        if (!this._options.doNotRemoveAnchorsOnSessionEnded) {
            while (this._trackedAnchors.length) {
                var toRemove = this._trackedAnchors.pop();
                if (toRemove) {
                    try {
                        // try to natively remove it as well
                        toRemove.remove();
                    }
                    catch (e) {
                        // no-op
                    }
                    // as the xr frame loop is removed, we need to notify manually
                    this.onAnchorRemovedObservable.notifyObservers(toRemove);
                }
            }
        }
        return true;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRAnchorSystem.prototype.dispose = function () {
        this._futureAnchors.length = 0;
        _super.prototype.dispose.call(this);
        this.onAnchorAddedObservable.clear();
        this.onAnchorRemovedObservable.clear();
        this.onAnchorUpdatedObservable.clear();
    };
    WebXRAnchorSystem.prototype._onXRFrame = function (frame) {
        var _this = this;
        if (!this.attached || !frame) {
            return;
        }
        var trackedAnchors = frame.trackedAnchors;
        if (trackedAnchors) {
            var toRemove = this._trackedAnchors
                .filter(function (anchor) { return !trackedAnchors.has(anchor.xrAnchor); })
                .map(function (anchor) {
                var index = _this._trackedAnchors.indexOf(anchor);
                return index;
            });
            var idxTracker_1 = 0;
            toRemove.forEach(function (index) {
                var anchor = _this._trackedAnchors.splice(index - idxTracker_1, 1)[0];
                _this.onAnchorRemovedObservable.notifyObservers(anchor);
                idxTracker_1++;
            });
            // now check for new ones
            trackedAnchors.forEach(function (xrAnchor) {
                if (!_this._lastFrameDetected.has(xrAnchor)) {
                    var newAnchor = {
                        id: anchorIdProvider++,
                        xrAnchor: xrAnchor,
                        remove: function () { return xrAnchor.delete(); },
                    };
                    var anchor = _this._updateAnchorWithXRFrame(xrAnchor, newAnchor, frame);
                    _this._trackedAnchors.push(anchor);
                    _this.onAnchorAddedObservable.notifyObservers(anchor);
                    // search for the future anchor promise that matches this
                    var results = _this._futureAnchors.filter(function (futureAnchor) { return futureAnchor.nativeAnchor === xrAnchor; });
                    var result = results[0];
                    if (result) {
                        result.resolve(anchor);
                        result.resolved = true;
                    }
                }
                else {
                    var index = _this._findIndexInAnchorArray(xrAnchor);
                    var anchor = _this._trackedAnchors[index];
                    try {
                        // anchors update every frame
                        _this._updateAnchorWithXRFrame(xrAnchor, anchor, frame);
                        if (anchor.attachedNode) {
                            anchor.attachedNode.rotationQuaternion = anchor.attachedNode.rotationQuaternion || new Quaternion();
                            anchor.transformationMatrix.decompose(anchor.attachedNode.scaling, anchor.attachedNode.rotationQuaternion, anchor.attachedNode.position);
                        }
                        _this.onAnchorUpdatedObservable.notifyObservers(anchor);
                    }
                    catch (e) {
                        Tools.Warn("Anchor could not be updated");
                    }
                }
            });
            this._lastFrameDetected = trackedAnchors;
        }
        // process future anchors
        this._futureAnchors.forEach(function (futureAnchor) {
            if (!futureAnchor.resolved && !futureAnchor.submitted) {
                _this._createAnchorAtTransformation(futureAnchor.xrTransformation, frame).then(function (nativeAnchor) {
                    futureAnchor.nativeAnchor = nativeAnchor;
                }, function (error) {
                    futureAnchor.resolved = true;
                    futureAnchor.reject(error);
                });
                futureAnchor.submitted = true;
            }
        });
    };
    /**
     * avoiding using Array.find for global support.
     * @param xrAnchor the plane to find in the array
     */
    WebXRAnchorSystem.prototype._findIndexInAnchorArray = function (xrAnchor) {
        for (var i = 0; i < this._trackedAnchors.length; ++i) {
            if (this._trackedAnchors[i].xrAnchor === xrAnchor) {
                return i;
            }
        }
        return -1;
    };
    WebXRAnchorSystem.prototype._updateAnchorWithXRFrame = function (xrAnchor, anchor, xrFrame) {
        // matrix
        var pose = xrFrame.getPose(xrAnchor.anchorSpace, this._xrSessionManager.referenceSpace);
        if (pose) {
            var mat = anchor.transformationMatrix || new Matrix();
            Matrix.FromArrayToRef(pose.transform.matrix, 0, mat);
            if (!this._xrSessionManager.scene.useRightHandedSystem) {
                mat.toggleModelMatrixHandInPlace();
            }
            anchor.transformationMatrix = mat;
            if (!this._options.worldParentNode) {
                // Logger.Warn("Please provide a world parent node to apply world transformation");
            }
            else {
                mat.multiplyToRef(this._options.worldParentNode.getWorldMatrix(), mat);
            }
        }
        return anchor;
    };
    WebXRAnchorSystem.prototype._createAnchorAtTransformation = function (xrTransformation, xrFrame) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                if (xrFrame.createAnchor) {
                    try {
                        return [2 /*return*/, xrFrame.createAnchor(xrTransformation, (_a = this._referenceSpaceForFrameAnchors) !== null && _a !== void 0 ? _a : this._xrSessionManager.referenceSpace)];
                    }
                    catch (error) {
                        throw new Error(error);
                    }
                }
                else {
                    this.detach();
                    throw new Error("Anchors are not enabled in your browser");
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * The module's name
     */
    WebXRAnchorSystem.Name = WebXRFeatureName.ANCHOR_SYSTEM;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRAnchorSystem.Version = 1;
    return WebXRAnchorSystem;
}(WebXRAbstractFeature));
export { WebXRAnchorSystem };
// register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRAnchorSystem.Name, function (xrSessionManager, options) {
    return function () { return new WebXRAnchorSystem(xrSessionManager, options); };
}, WebXRAnchorSystem.Version);
//# sourceMappingURL=WebXRAnchorSystem.js.map