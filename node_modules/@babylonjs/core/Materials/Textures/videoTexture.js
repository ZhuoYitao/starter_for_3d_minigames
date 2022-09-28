import { __assign, __extends } from "tslib";
import { Observable } from "../../Misc/observable.js";
import { Tools } from "../../Misc/tools.js";
import { Logger } from "../../Misc/logger.js";
import { Texture } from "../../Materials/Textures/texture.js";
import "../../Engines/Extensions/engine.videoTexture.js";
import "../../Engines/Extensions/engine.dynamicTexture.js";
function removeSource(video) {
    // Remove any <source> elements, etc.
    while (video.firstChild) {
        video.removeChild(video.firstChild);
    }
    // detach srcObject
    video.srcObject = null;
    // Set a blank src (https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements)
    video.src = "";
    // Prevent non-important errors maybe (https://twitter.com/beraliv/status/1205214277956775936)
    video.removeAttribute("src");
}
/**
 * If you want to display a video in your scene, this is the special texture for that.
 * This special texture works similar to other textures, with the exception of a few parameters.
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/videoTexture
 */
var VideoTexture = /** @class */ (function (_super) {
    __extends(VideoTexture, _super);
    /**
     * Creates a video texture.
     * If you want to display a video in your scene, this is the special texture for that.
     * This special texture works similar to other textures, with the exception of a few parameters.
     * @see https://doc.babylonjs.com/how_to/video_texture
     * @param name optional name, will detect from video source, if not defined
     * @param src can be used to provide an url, array of urls or an already setup HTML video element.
     * @param scene is obviously the current scene.
     * @param generateMipMaps can be used to turn on mipmaps (Can be expensive for videoTextures because they are often updated).
     * @param invertY is false by default but can be used to invert video on Y axis
     * @param samplingMode controls the sampling method and is set to TRILINEAR_SAMPLINGMODE by default
     * @param settings allows finer control over video usage
     * @param onError defines a callback triggered when an error occurred during the loading session
     */
    function VideoTexture(name, src, scene, generateMipMaps, invertY, samplingMode, settings, onError) {
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, null, scene, !generateMipMaps, invertY) || this;
        _this._onUserActionRequestedObservable = null;
        _this._stillImageCaptured = false;
        _this._displayingPosterTexture = false;
        _this._frameId = -1;
        _this._currentSrc = null;
        _this._errorFound = false;
        _this._createInternalTexture = function () {
            if (_this._texture != null) {
                if (_this._displayingPosterTexture) {
                    _this._texture.dispose();
                    _this._displayingPosterTexture = false;
                }
                else {
                    return;
                }
            }
            if (!_this._getEngine().needPOTTextures || (Tools.IsExponentOfTwo(_this.video.videoWidth) && Tools.IsExponentOfTwo(_this.video.videoHeight))) {
                _this.wrapU = Texture.WRAP_ADDRESSMODE;
                _this.wrapV = Texture.WRAP_ADDRESSMODE;
            }
            else {
                _this.wrapU = Texture.CLAMP_ADDRESSMODE;
                _this.wrapV = Texture.CLAMP_ADDRESSMODE;
                _this._generateMipMaps = false;
            }
            _this._texture = _this._getEngine().createDynamicTexture(_this.video.videoWidth, _this.video.videoHeight, _this._generateMipMaps, _this.samplingMode);
            if (!_this.video.autoplay && !_this._settings.poster) {
                var oldHandler_1 = _this.video.onplaying;
                var oldMuted_1 = _this.video.muted;
                _this.video.muted = true;
                _this.video.onplaying = function () {
                    _this.video.muted = oldMuted_1;
                    _this.video.onplaying = oldHandler_1;
                    _this._updateInternalTexture();
                    if (!_this._errorFound) {
                        _this.video.pause();
                    }
                    if (_this.onLoadObservable.hasObservers()) {
                        _this.onLoadObservable.notifyObservers(_this);
                    }
                };
                _this._handlePlay();
            }
            else {
                _this._updateInternalTexture();
                if (_this.onLoadObservable.hasObservers()) {
                    _this.onLoadObservable.notifyObservers(_this);
                }
            }
        };
        _this._reset = function () {
            if (_this._texture == null) {
                return;
            }
            if (!_this._displayingPosterTexture) {
                _this._texture.dispose();
                _this._texture = null;
            }
        };
        _this._updateInternalTexture = function () {
            if (_this._texture == null) {
                return;
            }
            if (_this.video.readyState < _this.video.HAVE_CURRENT_DATA) {
                return;
            }
            if (_this._displayingPosterTexture) {
                return;
            }
            var frameId = _this.getScene().getFrameId();
            if (_this._frameId === frameId) {
                return;
            }
            _this._frameId = frameId;
            _this._getEngine().updateVideoTexture(_this._texture, _this.video, _this._invertY);
        };
        _this._settings = __assign({ autoPlay: true, loop: true, autoUpdateTexture: true }, settings);
        _this._onError = onError;
        _this._generateMipMaps = generateMipMaps;
        _this._initialSamplingMode = samplingMode;
        _this.autoUpdateTexture = _this._settings.autoUpdateTexture;
        _this._currentSrc = src;
        _this.name = name || _this._getName(src);
        _this.video = _this._getVideo(src);
        if (_this._settings.poster) {
            _this.video.poster = _this._settings.poster;
        }
        if (_this._settings.autoPlay !== undefined) {
            _this.video.autoplay = _this._settings.autoPlay;
        }
        if (_this._settings.loop !== undefined) {
            _this.video.loop = _this._settings.loop;
        }
        if (_this._settings.muted !== undefined) {
            _this.video.muted = _this._settings.muted;
        }
        _this.video.setAttribute("playsinline", "");
        _this.video.addEventListener("paused", _this._updateInternalTexture);
        _this.video.addEventListener("seeked", _this._updateInternalTexture);
        _this.video.addEventListener("emptied", _this._reset);
        _this._createInternalTextureOnEvent = _this._settings.poster && !_this._settings.autoPlay ? "play" : "canplay";
        _this.video.addEventListener(_this._createInternalTextureOnEvent, _this._createInternalTexture);
        if (_this._settings.autoPlay) {
            _this._handlePlay();
        }
        var videoHasEnoughData = _this.video.readyState >= _this.video.HAVE_CURRENT_DATA;
        if (_this._settings.poster && (!_this._settings.autoPlay || !videoHasEnoughData)) {
            _this._texture = _this._getEngine().createTexture(_this._settings.poster, false, !_this.invertY, scene);
            _this._displayingPosterTexture = true;
        }
        else if (videoHasEnoughData) {
            _this._createInternalTexture();
        }
        return _this;
    }
    Object.defineProperty(VideoTexture.prototype, "onUserActionRequestedObservable", {
        /**
         * Event triggered when a dom action is required by the user to play the video.
         * This happens due to recent changes in browser policies preventing video to auto start.
         */
        get: function () {
            if (!this._onUserActionRequestedObservable) {
                this._onUserActionRequestedObservable = new Observable();
            }
            return this._onUserActionRequestedObservable;
        },
        enumerable: false,
        configurable: true
    });
    VideoTexture.prototype._processError = function (reason) {
        this._errorFound = true;
        if (this._onError) {
            this._onError(reason === null || reason === void 0 ? void 0 : reason.message);
        }
        else {
            Logger.Error(reason === null || reason === void 0 ? void 0 : reason.message);
        }
    };
    VideoTexture.prototype._handlePlay = function () {
        var _this = this;
        this._errorFound = false;
        this.video.play().catch(function (reason) {
            if ((reason === null || reason === void 0 ? void 0 : reason.name) === "NotAllowedError") {
                if (_this._onUserActionRequestedObservable && _this._onUserActionRequestedObservable.hasObservers()) {
                    _this._onUserActionRequestedObservable.notifyObservers(_this);
                    return;
                }
                else if (!_this.video.muted) {
                    Logger.Warn("Unable to autoplay a video with sound. Trying again with muted turned true");
                    _this.video.muted = true;
                    _this._errorFound = false;
                    _this.video.play().catch(function (otherReason) {
                        _this._processError(otherReason);
                    });
                    return;
                }
            }
            _this._processError(reason);
        });
    };
    /**
     * Get the current class name of the video texture useful for serialization or dynamic coding.
     * @returns "VideoTexture"
     */
    VideoTexture.prototype.getClassName = function () {
        return "VideoTexture";
    };
    VideoTexture.prototype._getName = function (src) {
        if (src instanceof HTMLVideoElement) {
            return src.currentSrc;
        }
        if (typeof src === "object") {
            return src.toString();
        }
        return src;
    };
    VideoTexture.prototype._getVideo = function (src) {
        if (src.isNative) {
            return src;
        }
        if (src instanceof HTMLVideoElement) {
            Tools.SetCorsBehavior(src.currentSrc, src);
            return src;
        }
        var video = document.createElement("video");
        if (typeof src === "string") {
            Tools.SetCorsBehavior(src, video);
            video.src = src;
        }
        else {
            Tools.SetCorsBehavior(src[0], video);
            src.forEach(function (url) {
                var source = document.createElement("source");
                source.src = url;
                video.appendChild(source);
            });
        }
        this.onDisposeObservable.addOnce(function () {
            removeSource(video);
        });
        return video;
    };
    /**
     * @hidden Internal method to initiate `update`.
     */
    VideoTexture.prototype._rebuild = function () {
        this.update();
    };
    /**
     * Update Texture in the `auto` mode. Does not do anything if `settings.autoUpdateTexture` is false.
     */
    VideoTexture.prototype.update = function () {
        if (!this.autoUpdateTexture) {
            // Expecting user to call `updateTexture` manually
            return;
        }
        this.updateTexture(true);
    };
    /**
     * Update Texture in `manual` mode. Does not do anything if not visible or paused.
     * @param isVisible Visibility state, detected by user using `scene.getActiveMeshes()` or otherwise.
     */
    VideoTexture.prototype.updateTexture = function (isVisible) {
        if (!isVisible) {
            return;
        }
        if (this.video.paused && this._stillImageCaptured) {
            return;
        }
        this._stillImageCaptured = true;
        this._updateInternalTexture();
    };
    /**
     * Change video content. Changing video instance or setting multiple urls (as in constructor) is not supported.
     * @param url New url.
     */
    VideoTexture.prototype.updateURL = function (url) {
        this.video.src = url;
        this._currentSrc = url;
    };
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    VideoTexture.prototype.clone = function () {
        return new VideoTexture(this.name, this._currentSrc, this.getScene(), this._generateMipMaps, this.invertY, this.samplingMode, this._settings);
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    VideoTexture.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._currentSrc = null;
        if (this._onUserActionRequestedObservable) {
            this._onUserActionRequestedObservable.clear();
            this._onUserActionRequestedObservable = null;
        }
        this.video.removeEventListener(this._createInternalTextureOnEvent, this._createInternalTexture);
        this.video.removeEventListener("paused", this._updateInternalTexture);
        this.video.removeEventListener("seeked", this._updateInternalTexture);
        this.video.removeEventListener("emptied", this._reset);
        this.video.pause();
    };
    /**
     * Creates a video texture straight from a stream.
     * @param scene Define the scene the texture should be created in
     * @param stream Define the stream the texture should be created from
     * @param constraints video constraints
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     * @returns The created video texture as a promise
     */
    VideoTexture.CreateFromStreamAsync = function (scene, stream, constraints, invertY) {
        if (invertY === void 0) { invertY = true; }
        var video = scene.getEngine().createVideoElement(constraints);
        if (scene.getEngine()._badOS) {
            // Yes... I know and I hope to remove it soon...
            document.body.appendChild(video);
            video.style.transform = "scale(0.0001, 0.0001)";
            video.style.opacity = "0";
            video.style.position = "fixed";
            video.style.bottom = "0px";
            video.style.right = "0px";
        }
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "true");
        video.setAttribute("playsinline", "");
        video.muted = true;
        if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
        }
        else {
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            }
            else {
                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                // older API. See https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#using_object_urls_for_media_streams
                video.src = window.URL && window.URL.createObjectURL(stream);
            }
        }
        return new Promise(function (resolve) {
            var onPlaying = function () {
                var videoTexture = new VideoTexture("video", video, scene, true, invertY);
                if (scene.getEngine()._badOS) {
                    videoTexture.onDisposeObservable.addOnce(function () {
                        video.remove();
                    });
                }
                videoTexture.onDisposeObservable.addOnce(function () {
                    removeSource(video);
                });
                resolve(videoTexture);
                video.removeEventListener("playing", onPlaying);
            };
            video.addEventListener("playing", onPlaying);
            video.play();
        });
    };
    /**
     * Creates a video texture straight from your WebCam video feed.
     * @param scene Define the scene the texture should be created in
     * @param constraints Define the constraints to use to create the web cam feed from WebRTC
     * @param audioConstaints Define the audio constraints to use to create the web cam feed from WebRTC
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     * @returns The created video texture as a promise
     */
    VideoTexture.CreateFromWebCamAsync = function (scene, constraints, audioConstaints, invertY) {
        var _this = this;
        if (audioConstaints === void 0) { audioConstaints = false; }
        if (invertY === void 0) { invertY = true; }
        var constraintsDeviceId;
        if (constraints && constraints.deviceId) {
            constraintsDeviceId = {
                exact: constraints.deviceId,
            };
        }
        if (navigator.mediaDevices) {
            return navigator.mediaDevices
                .getUserMedia({
                video: constraints,
                audio: audioConstaints,
            })
                .then(function (stream) {
                return _this.CreateFromStreamAsync(scene, stream, constraints, invertY);
            });
        }
        else {
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (getUserMedia) {
                getUserMedia({
                    video: {
                        deviceId: constraintsDeviceId,
                        width: {
                            min: (constraints && constraints.minWidth) || 256,
                            max: (constraints && constraints.maxWidth) || 640,
                        },
                        height: {
                            min: (constraints && constraints.minHeight) || 256,
                            max: (constraints && constraints.maxHeight) || 480,
                        },
                    },
                    audio: audioConstaints,
                }, function (stream) {
                    return _this.CreateFromStreamAsync(scene, stream, constraints, invertY);
                }, function (e) {
                    Logger.Error(e.name);
                });
            }
        }
        return Promise.reject("No support for userMedia on this device");
    };
    /**
     * Creates a video texture straight from your WebCam video feed.
     * @param scene Defines the scene the texture should be created in
     * @param onReady Defines a callback to triggered once the texture will be ready
     * @param constraints Defines the constraints to use to create the web cam feed from WebRTC
     * @param audioConstaints Defines the audio constraints to use to create the web cam feed from WebRTC
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     */
    VideoTexture.CreateFromWebCam = function (scene, onReady, constraints, audioConstaints, invertY) {
        if (audioConstaints === void 0) { audioConstaints = false; }
        if (invertY === void 0) { invertY = true; }
        this.CreateFromWebCamAsync(scene, constraints, audioConstaints, invertY)
            .then(function (videoTexture) {
            if (onReady) {
                onReady(videoTexture);
            }
        })
            .catch(function (err) {
            Logger.Error(err.name);
        });
    };
    return VideoTexture;
}(Texture));
export { VideoTexture };
//# sourceMappingURL=videoTexture.js.map