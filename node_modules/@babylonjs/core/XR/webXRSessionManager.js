import { Logger } from "../Misc/logger.js";
import { Observable } from "../Misc/observable.js";
import { WebXRManagedOutputCanvas, WebXRManagedOutputCanvasOptions } from "./webXRManagedOutputCanvas.js";
import { NativeXRLayerWrapper, NativeXRRenderTarget } from "./native/nativeXRRenderTarget.js";
import { WebXRWebGLLayerWrapper } from "./webXRWebGLLayer.js";
/**
 * Manages an XRSession to work with Babylon's engine
 * @see https://doc.babylonjs.com/how_to/webxr_session_manager
 */
var WebXRSessionManager = /** @class */ (function () {
    /**
     * Constructs a WebXRSessionManager, this must be initialized within a user action before usage
     * @param scene The scene which the session should be created for
     */
    function WebXRSessionManager(
    /** The scene which the session should be created for */
    scene) {
        var _this = this;
        this.scene = scene;
        /** WebXR timestamp updated every frame */
        this.currentTimestamp = -1;
        /**
         * Used just in case of a failure to initialize an immersive session.
         * The viewer reference space is compensated using this height, creating a kind of "viewer-floor" reference space
         */
        this.defaultHeightCompensation = 1.7;
        /**
         * Fires every time a new xrFrame arrives which can be used to update the camera
         */
        this.onXRFrameObservable = new Observable();
        /**
         * Fires when the reference space changed
         */
        this.onXRReferenceSpaceChanged = new Observable();
        /**
         * Fires when the xr session is ended either by the device or manually done
         */
        this.onXRSessionEnded = new Observable();
        /**
         * Fires when the xr session is initialized: right after requestSession was called and returned with a successful result
         */
        this.onXRSessionInit = new Observable();
        /**
         * Are we currently in the XR loop?
         */
        this.inXRFrameLoop = false;
        /**
         * Are we in an XR session?
         */
        this.inXRSession = false;
        this._engine = scene.getEngine();
        this._onEngineDisposedObserver = this._engine.onDisposeObservable.addOnce(function () {
            _this._engine = null;
        });
        scene.onDisposeObservable.addOnce(function () {
            _this.dispose();
        });
    }
    Object.defineProperty(WebXRSessionManager.prototype, "referenceSpace", {
        /**
         * The current reference space used in this session. This reference space can constantly change!
         * It is mainly used to offset the camera's position.
         */
        get: function () {
            return this._referenceSpace;
        },
        /**
         * Set a new reference space and triggers the observable
         */
        set: function (newReferenceSpace) {
            this._referenceSpace = newReferenceSpace;
            this.onXRReferenceSpaceChanged.notifyObservers(this._referenceSpace);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRSessionManager.prototype, "sessionMode", {
        /**
         * The mode for the managed XR session
         */
        get: function () {
            return this._sessionMode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of the session manager
     * This should be called explicitly by the dev, if required.
     */
    WebXRSessionManager.prototype.dispose = function () {
        var _a;
        // disposing without leaving XR? Exit XR first
        if (this.inXRSession) {
            this.exitXRAsync();
        }
        this.onXRFrameObservable.clear();
        this.onXRSessionEnded.clear();
        this.onXRReferenceSpaceChanged.clear();
        this.onXRSessionInit.clear();
        (_a = this._engine) === null || _a === void 0 ? void 0 : _a.onDisposeObservable.remove(this._onEngineDisposedObserver);
        this._engine = null;
    };
    /**
     * Stops the xrSession and restores the render loop
     * @returns Promise which resolves after it exits XR
     */
    WebXRSessionManager.prototype.exitXRAsync = function () {
        if (this.session && this.inXRSession) {
            this.inXRSession = false;
            return this.session.end().catch(function () {
                Logger.Warn("Could not end XR session.");
            });
        }
        return Promise.resolve();
    };
    /**
     * Attempts to set the framebuffer-size-normalized viewport to be rendered this frame for this view.
     * In the event of a failure, the supplied viewport is not updated.
     * @param viewport the viewport to which the view will be rendered
     * @param view the view for which to set the viewport
     * @returns whether the operation was successful
     */
    WebXRSessionManager.prototype.trySetViewportForView = function (viewport, view) {
        var _a;
        return ((_a = this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.trySetViewportForView(viewport, view)) || false;
    };
    /**
     * Gets the correct render target texture to be rendered this frame for this eye
     * @param eye the eye for which to get the render target
     * @returns the render target for the specified eye or null if not available
     */
    WebXRSessionManager.prototype.getRenderTargetTextureForEye = function (eye) {
        var _a;
        return ((_a = this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.getRenderTargetTextureForEye(eye)) || null;
    };
    /**
     * Gets the correct render target texture to be rendered this frame for this view
     * @param view the view for which to get the render target
     * @returns the render target for the specified view or null if not available
     */
    WebXRSessionManager.prototype.getRenderTargetTextureForView = function (view) {
        var _a;
        return ((_a = this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.getRenderTargetTextureForView(view)) || null;
    };
    /**
     * Creates a WebXRRenderTarget object for the XR session
     * @param options optional options to provide when creating a new render target
     * @returns a WebXR render target to which the session can render
     */
    WebXRSessionManager.prototype.getWebXRRenderTarget = function (options) {
        var engine = this.scene.getEngine();
        if (this._xrNavigator.xr.native) {
            return new NativeXRRenderTarget(this);
        }
        else {
            options = options || WebXRManagedOutputCanvasOptions.GetDefaults(engine);
            options.canvasElement = options.canvasElement || engine.getRenderingCanvas() || undefined;
            return new WebXRManagedOutputCanvas(this, options);
        }
    };
    /**
     * Initializes the manager
     * After initialization enterXR can be called to start an XR session
     * @returns Promise which resolves after it is initialized
     */
    WebXRSessionManager.prototype.initializeAsync = function () {
        // Check if the browser supports webXR
        this._xrNavigator = navigator;
        if (!this._xrNavigator.xr) {
            return Promise.reject("WebXR not available");
        }
        return Promise.resolve();
    };
    /**
     * Initializes an xr session
     * @param xrSessionMode mode to initialize
     * @param xrSessionInit defines optional and required values to pass to the session builder
     * @returns a promise which will resolve once the session has been initialized
     */
    WebXRSessionManager.prototype.initializeSessionAsync = function (xrSessionMode, xrSessionInit) {
        var _this = this;
        if (xrSessionMode === void 0) { xrSessionMode = "immersive-vr"; }
        if (xrSessionInit === void 0) { xrSessionInit = {}; }
        return this._xrNavigator.xr.requestSession(xrSessionMode, xrSessionInit).then(function (session) {
            _this.session = session;
            _this._sessionMode = xrSessionMode;
            _this.onXRSessionInit.notifyObservers(session);
            _this.inXRSession = true;
            // handle when the session is ended (By calling session.end or device ends its own session eg. pressing home button on phone)
            _this.session.addEventListener("end", function () {
                var _a;
                _this.inXRSession = false;
                // Notify frame observers
                _this.onXRSessionEnded.notifyObservers(null);
                if (_this._engine) {
                    // make sure dimensions object is restored
                    _this._engine.framebufferDimensionsObject = null;
                    // Restore frame buffer to avoid clear on xr framebuffer after session end
                    _this._engine.restoreDefaultFramebuffer();
                    // Need to restart render loop as after the session is ended the last request for new frame will never call callback
                    _this._engine.customAnimationFrameRequester = null;
                    _this._engine._renderLoop();
                }
                // Dispose render target textures.
                // Only dispose on native because we can't destroy opaque textures on browser.
                if (_this.isNative) {
                    (_a = _this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.dispose();
                }
                _this._baseLayerRTTProvider = null;
                _this._baseLayerWrapper = null;
            }, { once: true });
            return _this.session;
        });
    };
    /**
     * Checks if a session would be supported for the creation options specified
     * @param sessionMode session mode to check if supported eg. immersive-vr
     * @returns A Promise that resolves to true if supported and false if not
     */
    WebXRSessionManager.prototype.isSessionSupportedAsync = function (sessionMode) {
        return WebXRSessionManager.IsSessionSupportedAsync(sessionMode);
    };
    /**
     * Resets the reference space to the one started the session
     */
    WebXRSessionManager.prototype.resetReferenceSpace = function () {
        this.referenceSpace = this.baseReferenceSpace;
    };
    /**
     * Starts rendering to the xr layer
     */
    WebXRSessionManager.prototype.runXRRenderLoop = function () {
        var _this = this;
        var _a;
        if (!this.inXRSession || !this._engine) {
            return;
        }
        // Tell the engine's render loop to be driven by the xr session's refresh rate and provide xr pose information
        this._engine.customAnimationFrameRequester = {
            requestAnimationFrame: this.session.requestAnimationFrame.bind(this.session),
            renderFunction: function (timestamp, xrFrame) {
                var _a;
                if (!_this.inXRSession || !_this._engine) {
                    return;
                }
                // Store the XR frame and timestamp in the session manager
                _this.currentFrame = xrFrame;
                _this.currentTimestamp = timestamp;
                if (xrFrame) {
                    _this.inXRFrameLoop = true;
                    _this._engine.framebufferDimensionsObject = ((_a = _this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.getFramebufferDimensions()) || null;
                    _this.onXRFrameObservable.notifyObservers(xrFrame);
                    _this._engine._renderLoop();
                    _this._engine.framebufferDimensionsObject = null;
                    _this.inXRFrameLoop = false;
                }
            },
        };
        this._engine.framebufferDimensionsObject = ((_a = this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.getFramebufferDimensions()) || null;
        // Stop window's animation frame and trigger sessions animation frame
        if (typeof window !== "undefined" && window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this._engine._frameHandler);
        }
        this._engine._renderLoop();
    };
    /**
     * Sets the reference space on the xr session
     * @param referenceSpaceType space to set
     * @returns a promise that will resolve once the reference space has been set
     */
    WebXRSessionManager.prototype.setReferenceSpaceTypeAsync = function (referenceSpaceType) {
        var _this = this;
        if (referenceSpaceType === void 0) { referenceSpaceType = "local-floor"; }
        return this.session
            .requestReferenceSpace(referenceSpaceType)
            .then(function (referenceSpace) {
            return referenceSpace;
        }, function (rejectionReason) {
            Logger.Error("XR.requestReferenceSpace failed for the following reason: ");
            Logger.Error(rejectionReason);
            Logger.Log('Defaulting to universally-supported "viewer" reference space type.');
            return _this.session.requestReferenceSpace("viewer").then(function (referenceSpace) {
                var heightCompensation = new XRRigidTransform({ x: 0, y: -_this.defaultHeightCompensation, z: 0 });
                return referenceSpace.getOffsetReferenceSpace(heightCompensation);
            }, function (rejectionReason) {
                Logger.Error(rejectionReason);
                throw 'XR initialization failed: required "viewer" reference space type not supported.';
            });
        })
            .then(function (referenceSpace) {
            // create viewer reference space before setting the first reference space
            return _this.session.requestReferenceSpace("viewer").then(function (viewerReferenceSpace) {
                _this.viewerReferenceSpace = viewerReferenceSpace;
                return referenceSpace;
            });
        })
            .then(function (referenceSpace) {
            // initialize the base and offset (currently the same)
            _this.referenceSpace = _this.baseReferenceSpace = referenceSpace;
            return _this.referenceSpace;
        });
    };
    /**
     * Updates the render state of the session.
     * Note that this is deprecated in favor of WebXRSessionManager.updateRenderState().
     * @param state state to set
     * @returns a promise that resolves once the render state has been updated
     * @deprecated
     */
    WebXRSessionManager.prototype.updateRenderStateAsync = function (state) {
        return Promise.resolve(this.session.updateRenderState(state));
    };
    /**
     * @param baseLayerWrapper
     * @hidden
     */
    WebXRSessionManager.prototype._setBaseLayerWrapper = function (baseLayerWrapper) {
        var _a, _b;
        if (this.isNative) {
            (_a = this._baseLayerRTTProvider) === null || _a === void 0 ? void 0 : _a.dispose();
        }
        this._baseLayerWrapper = baseLayerWrapper;
        this._baseLayerRTTProvider = ((_b = this._baseLayerWrapper) === null || _b === void 0 ? void 0 : _b.createRenderTargetTextureProvider(this)) || null;
    };
    /**
     * Updates the render state of the session
     * @param state state to set
     */
    WebXRSessionManager.prototype.updateRenderState = function (state) {
        if (state.baseLayer) {
            this._setBaseLayerWrapper(this.isNative ? new NativeXRLayerWrapper(state.baseLayer) : new WebXRWebGLLayerWrapper(state.baseLayer));
        }
        this.session.updateRenderState(state);
    };
    /**
     * Returns a promise that resolves with a boolean indicating if the provided session mode is supported by this browser
     * @param sessionMode defines the session to test
     * @returns a promise with boolean as final value
     */
    WebXRSessionManager.IsSessionSupportedAsync = function (sessionMode) {
        if (!navigator.xr) {
            return Promise.resolve(false);
        }
        // When the specs are final, remove supportsSession!
        var functionToUse = navigator.xr.isSessionSupported || navigator.xr.supportsSession;
        if (!functionToUse) {
            return Promise.resolve(false);
        }
        else {
            return functionToUse
                .call(navigator.xr, sessionMode)
                .then(function (result) {
                var returnValue = typeof result === "undefined" ? true : result;
                return Promise.resolve(returnValue);
            })
                .catch(function (e) {
                Logger.Warn(e);
                return Promise.resolve(false);
            });
        }
    };
    Object.defineProperty(WebXRSessionManager.prototype, "isNative", {
        /**
         * Returns true if Babylon.js is using the BabylonNative backend, otherwise false
         */
        get: function () {
            var _a;
            return (_a = this._xrNavigator.xr.native) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRSessionManager.prototype, "currentFrameRate", {
        /**
         * The current frame rate as reported by the device
         */
        get: function () {
            var _a;
            return (_a = this.session) === null || _a === void 0 ? void 0 : _a.frameRate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRSessionManager.prototype, "supportedFrameRates", {
        /**
         * A list of supported frame rates (only available in-session!
         */
        get: function () {
            var _a;
            return (_a = this.session) === null || _a === void 0 ? void 0 : _a.supportedFrameRates;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set the framerate of the session.
     * @param rate the new framerate. This value needs to be in the supportedFrameRates array
     * @returns a promise that resolves once the framerate has been set
     */
    WebXRSessionManager.prototype.updateTargetFrameRate = function (rate) {
        return this.session.updateTargetFrameRate(rate);
    };
    /**
     * Run a callback in the xr render loop
     * @param callback the callback to call when in XR Frame
     * @param ignoreIfNotInSession if no session is currently running, run it first thing on the next session
     */
    WebXRSessionManager.prototype.runInXRFrame = function (callback, ignoreIfNotInSession) {
        if (ignoreIfNotInSession === void 0) { ignoreIfNotInSession = true; }
        if (this.inXRFrameLoop) {
            callback();
        }
        else if (this.inXRSession || !ignoreIfNotInSession) {
            this.onXRFrameObservable.addOnce(callback);
        }
    };
    Object.defineProperty(WebXRSessionManager.prototype, "isFixedFoveationSupported", {
        /**
         * Check if fixed foveation is supported on this device
         */
        get: function () {
            var _a;
            return ((_a = this._baseLayerWrapper) === null || _a === void 0 ? void 0 : _a.isFixedFoveationSupported) || false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRSessionManager.prototype, "fixedFoveation", {
        /**
         * Get the fixed foveation currently set, as specified by the webxr specs
         * If this returns null, then fixed foveation is not supported
         */
        get: function () {
            var _a;
            return ((_a = this._baseLayerWrapper) === null || _a === void 0 ? void 0 : _a.fixedFoveation) || null;
        },
        /**
         * Set the fixed foveation to the specified value, as specified by the webxr specs
         * This value will be normalized to be between 0 and 1, 1 being max foveation, 0 being no foveation
         */
        set: function (value) {
            var val = Math.max(0, Math.min(1, value || 0));
            if (this._baseLayerWrapper) {
                this._baseLayerWrapper.fixedFoveation = val;
            }
        },
        enumerable: false,
        configurable: true
    });
    return WebXRSessionManager;
}());
export { WebXRSessionManager };
//# sourceMappingURL=webXRSessionManager.js.map