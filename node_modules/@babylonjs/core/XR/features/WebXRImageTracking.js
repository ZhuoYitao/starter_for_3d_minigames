import { __awaiter, __extends, __generator } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { Observable } from "../../Misc/observable.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Matrix } from "../../Maths/math.vector.js";
import { Tools } from "../../Misc/tools.js";
/**
 * Enum that describes the state of the image trackability score status for this session.
 */
var ImageTrackingScoreStatus;
(function (ImageTrackingScoreStatus) {
    // AR Session has not yet assessed image trackability scores.
    ImageTrackingScoreStatus[ImageTrackingScoreStatus["NotReceived"] = 0] = "NotReceived";
    // A request to retrieve trackability scores has been sent, but no response has been received.
    ImageTrackingScoreStatus[ImageTrackingScoreStatus["Waiting"] = 1] = "Waiting";
    // Image trackability scores have been received for this session
    ImageTrackingScoreStatus[ImageTrackingScoreStatus["Received"] = 2] = "Received";
})(ImageTrackingScoreStatus || (ImageTrackingScoreStatus = {}));
/**
 * Image tracking for immersive AR sessions.
 * Providing a list of images and their estimated widths will enable tracking those images in the real world.
 */
var WebXRImageTracking = /** @class */ (function (_super) {
    __extends(WebXRImageTracking, _super);
    /**
     * constructs the image tracking feature
     * @param _xrSessionManager the session manager for this module
     * @param options read-only options to be used in this module
     */
    function WebXRImageTracking(_xrSessionManager, 
    /**
     * read-only options to be used in this module
     */
    options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this.options = options;
        /**
         * This will be triggered if the underlying system deems an image untrackable.
         * The index is the index of the image from the array used to initialize the feature.
         */
        _this.onUntrackableImageFoundObservable = new Observable();
        /**
         * An image was deemed trackable, and the system will start tracking it.
         */
        _this.onTrackableImageFoundObservable = new Observable();
        /**
         * The image was found and its state was updated.
         */
        _this.onTrackedImageUpdatedObservable = new Observable();
        _this._trackableScoreStatus = ImageTrackingScoreStatus.NotReceived;
        _this._trackedImages = [];
        _this.xrNativeFeatureName = "image-tracking";
        return _this;
    }
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRImageTracking.prototype.attach = function () {
        return _super.prototype.attach.call(this);
    };
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRImageTracking.prototype.detach = function () {
        return _super.prototype.detach.call(this);
    };
    /**
     * Get a tracked image by its ID.
     *
     * @param id the id of the image to load (position in the init array)
     * @returns a trackable image, if exists in this location
     */
    WebXRImageTracking.prototype.getTrackedImageById = function (id) {
        return this._trackedImages[id] || null;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRImageTracking.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._trackedImages.forEach(function (trackedImage) {
            trackedImage.originalBitmap.close();
        });
        this._trackedImages.length = 0;
        this.onTrackableImageFoundObservable.clear();
        this.onUntrackableImageFoundObservable.clear();
        this.onTrackedImageUpdatedObservable.clear();
    };
    /**
     * Extends the session init object if needed
     * @returns augmentation object fo the xr session init object.
     */
    WebXRImageTracking.prototype.getXRSessionInitExtension = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, images, ex_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.options.images || !this.options.images.length) {
                            return [2 /*return*/, {}];
                        }
                        promises = this.options.images.map(function (image) {
                            if (typeof image.src === "string") {
                                return _this._xrSessionManager.scene.getEngine()._createImageBitmapFromSource(image.src);
                            }
                            else {
                                return Promise.resolve(image.src); // resolve is probably unneeded
                            }
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        images = _a.sent();
                        this._originalTrackingRequest = images.map(function (image, idx) {
                            return {
                                image: image,
                                widthInMeters: _this.options.images[idx].estimatedRealWorldWidth,
                            };
                        });
                        return [2 /*return*/, {
                                trackedImages: this._originalTrackingRequest,
                            }];
                    case 3:
                        ex_1 = _a.sent();
                        Tools.Error("Error loading images for tracking, WebXRImageTracking disabled for this session.");
                        return [2 /*return*/, {}];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WebXRImageTracking.prototype._onXRFrame = function (_xrFrame) {
        if (!_xrFrame.getImageTrackingResults || this._trackableScoreStatus === ImageTrackingScoreStatus.Waiting) {
            return;
        }
        // Image tracking scores may be generated a few frames after the XR Session initializes.
        // If we haven't received scores yet, then kick off the task to check scores and return immediately.
        if (this._trackableScoreStatus === ImageTrackingScoreStatus.NotReceived) {
            this._checkScoresAsync();
            return;
        }
        var imageTrackedResults = _xrFrame.getImageTrackingResults();
        for (var _i = 0, imageTrackedResults_1 = imageTrackedResults; _i < imageTrackedResults_1.length; _i++) {
            var result = imageTrackedResults_1[_i];
            var changed = false;
            var imageIndex = result.index;
            var imageObject = this._trackedImages[imageIndex];
            if (!imageObject) {
                // something went wrong!
                continue;
            }
            imageObject.xrTrackingResult = result;
            if (imageObject.realWorldWidth !== result.measuredWidthInMeters) {
                imageObject.realWorldWidth = result.measuredWidthInMeters;
                changed = true;
            }
            // Get the pose of the image relative to a reference space.
            var pose = _xrFrame.getPose(result.imageSpace, this._xrSessionManager.referenceSpace);
            if (pose) {
                var mat = imageObject.transformationMatrix;
                Matrix.FromArrayToRef(pose.transform.matrix, 0, mat);
                if (!this._xrSessionManager.scene.useRightHandedSystem) {
                    mat.toggleModelMatrixHandInPlace();
                }
                changed = true;
            }
            var state = result.trackingState;
            var emulated = state === "emulated";
            if (imageObject.emulated !== emulated) {
                imageObject.emulated = emulated;
                changed = true;
            }
            if (changed) {
                this.onTrackedImageUpdatedObservable.notifyObservers(imageObject);
            }
        }
    };
    WebXRImageTracking.prototype._checkScoresAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var imageScores, idx, originalBitmap, imageObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._xrSessionManager.session.getTrackedImageScores || this._trackableScoreStatus !== ImageTrackingScoreStatus.NotReceived) {
                            return [2 /*return*/];
                        }
                        this._trackableScoreStatus = ImageTrackingScoreStatus.Waiting;
                        return [4 /*yield*/, this._xrSessionManager.session.getTrackedImageScores()];
                    case 1:
                        imageScores = _a.sent();
                        if (!imageScores || imageScores.length === 0) {
                            this._trackableScoreStatus = ImageTrackingScoreStatus.NotReceived;
                            return [2 /*return*/];
                        }
                        // check the scores for all
                        for (idx = 0; idx < imageScores.length; ++idx) {
                            if (imageScores[idx] == "untrackable") {
                                this.onUntrackableImageFoundObservable.notifyObservers(idx);
                            }
                            else {
                                originalBitmap = this._originalTrackingRequest[idx].image;
                                imageObject = {
                                    id: idx,
                                    originalBitmap: originalBitmap,
                                    transformationMatrix: new Matrix(),
                                    ratio: originalBitmap.width / originalBitmap.height,
                                };
                                this._trackedImages[idx] = imageObject;
                                this.onTrackableImageFoundObservable.notifyObservers(imageObject);
                            }
                        }
                        this._trackableScoreStatus = imageScores.length > 0 ? ImageTrackingScoreStatus.Received : ImageTrackingScoreStatus.NotReceived;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * The module's name
     */
    WebXRImageTracking.Name = WebXRFeatureName.IMAGE_TRACKING;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRImageTracking.Version = 1;
    return WebXRImageTracking;
}(WebXRAbstractFeature));
export { WebXRImageTracking };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRImageTracking.Name, function (xrSessionManager, options) {
    return function () { return new WebXRImageTracking(xrSessionManager, options); };
}, WebXRImageTracking.Version, false);
//# sourceMappingURL=WebXRImageTracking.js.map