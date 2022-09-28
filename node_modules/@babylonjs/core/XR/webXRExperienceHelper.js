import { __awaiter, __generator } from "tslib";
import { Observable } from "../Misc/observable.js";
import { WebXRSessionManager } from "./webXRSessionManager.js";
import { WebXRCamera } from "./webXRCamera.js";
import { WebXRState } from "./webXRTypes.js";
import { WebXRFeatureName, WebXRFeaturesManager } from "./webXRFeaturesManager.js";
import { Logger } from "../Misc/logger.js";
import { UniversalCamera } from "../Cameras/universalCamera.js";
import { Quaternion, Vector3 } from "../Maths/math.vector.js";
/**
 * Base set of functionality needed to create an XR experience (WebXRSessionManager, Camera, StateManagement, etc.)
 * @see https://doc.babylonjs.com/how_to/webxr_experience_helpers
 */
var WebXRExperienceHelper = /** @class */ (function () {
    /**
     * Creates a WebXRExperienceHelper
     * @param _scene The scene the helper should be created in
     */
    function WebXRExperienceHelper(_scene) {
        var _this = this;
        this._scene = _scene;
        this._nonVRCamera = null;
        this._attachedToElement = false;
        this._spectatorCamera = null;
        this._originalSceneAutoClear = true;
        this._supported = false;
        this._spectatorMode = false;
        /**
         * Observers registered here will be triggered after the camera's initial transformation is set
         * This can be used to set a different ground level or an extra rotation.
         *
         * Note that ground level is considered to be at 0. The height defined by the XR camera will be added
         * to the position set after this observable is done executing.
         */
        this.onInitialXRPoseSetObservable = new Observable();
        /**
         * Fires when the state of the experience helper has changed
         */
        this.onStateChangedObservable = new Observable();
        /**
         * The current state of the XR experience (eg. transitioning, in XR or not in XR)
         */
        this.state = WebXRState.NOT_IN_XR;
        this.sessionManager = new WebXRSessionManager(_scene);
        this.camera = new WebXRCamera("webxr", _scene, this.sessionManager);
        this.featuresManager = new WebXRFeaturesManager(this.sessionManager);
        _scene.onDisposeObservable.addOnce(function () {
            _this.dispose();
        });
    }
    /**
     * Creates the experience helper
     * @param scene the scene to attach the experience helper to
     * @returns a promise for the experience helper
     */
    WebXRExperienceHelper.CreateAsync = function (scene) {
        var helper = new WebXRExperienceHelper(scene);
        return helper.sessionManager
            .initializeAsync()
            .then(function () {
            helper._supported = true;
            return helper;
        })
            .catch(function (e) {
            helper._setState(WebXRState.NOT_IN_XR);
            helper.dispose();
            throw e;
        });
    };
    /**
     * Disposes of the experience helper
     */
    WebXRExperienceHelper.prototype.dispose = function () {
        var _a;
        this.exitXRAsync();
        this.camera.dispose();
        this.onStateChangedObservable.clear();
        this.onInitialXRPoseSetObservable.clear();
        this.sessionManager.dispose();
        (_a = this._spectatorCamera) === null || _a === void 0 ? void 0 : _a.dispose();
        if (this._nonVRCamera) {
            this._scene.activeCamera = this._nonVRCamera;
        }
    };
    /**
     * Enters XR mode (This must be done within a user interaction in most browsers eg. button click)
     * @param sessionMode options for the XR session
     * @param referenceSpaceType frame of reference of the XR session
     * @param renderTarget the output canvas that will be used to enter XR mode
     * @param sessionCreationOptions optional XRSessionInit object to init the session with
     * @returns promise that resolves after xr mode has entered
     */
    WebXRExperienceHelper.prototype.enterXRAsync = function (sessionMode, referenceSpaceType, renderTarget, sessionCreationOptions) {
        var _a, _b;
        if (renderTarget === void 0) { renderTarget = this.sessionManager.getWebXRRenderTarget(); }
        if (sessionCreationOptions === void 0) { sessionCreationOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var baseLayer, xrRenderState, e_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this._supported) {
                            throw "WebXR not supported in this browser or environment";
                        }
                        this._setState(WebXRState.ENTERING_XR);
                        if (referenceSpaceType !== "viewer" && referenceSpaceType !== "local") {
                            sessionCreationOptions.optionalFeatures = sessionCreationOptions.optionalFeatures || [];
                            sessionCreationOptions.optionalFeatures.push(referenceSpaceType);
                        }
                        return [4 /*yield*/, this.featuresManager._extendXRSessionInitObject(sessionCreationOptions)];
                    case 1:
                        sessionCreationOptions = _c.sent();
                        // we currently recommend "unbounded" space in AR (#7959)
                        if (sessionMode === "immersive-ar" && referenceSpaceType !== "unbounded") {
                            Logger.Warn("We recommend using 'unbounded' reference space type when using 'immersive-ar' session mode");
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.sessionManager.initializeSessionAsync(sessionMode, sessionCreationOptions)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.sessionManager.setReferenceSpaceTypeAsync(referenceSpaceType)];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, renderTarget.initializeXRLayerAsync(this.sessionManager.session)];
                    case 5:
                        baseLayer = _c.sent();
                        xrRenderState = {
                            depthFar: this.camera.maxZ,
                            depthNear: this.camera.minZ,
                        };
                        // The layers feature will have already initialized the xr session's layers on session init.
                        if (!this.featuresManager.getEnabledFeature(WebXRFeatureName.LAYERS)) {
                            xrRenderState.baseLayer = baseLayer;
                        }
                        this.sessionManager.updateRenderState(xrRenderState);
                        // run the render loop
                        this.sessionManager.runXRRenderLoop();
                        // Cache pre xr scene settings
                        this._originalSceneAutoClear = this._scene.autoClear;
                        this._nonVRCamera = this._scene.activeCamera;
                        this._attachedToElement = !!((_a = this._nonVRCamera) === null || _a === void 0 ? void 0 : _a.inputs.attachedToElement);
                        (_b = this._nonVRCamera) === null || _b === void 0 ? void 0 : _b.detachControl();
                        this._scene.activeCamera = this.camera;
                        // do not compensate when AR session is used
                        if (sessionMode !== "immersive-ar") {
                            this._nonXRToXRCamera();
                        }
                        else {
                            // Kept here, TODO - check if needed
                            this._scene.autoClear = false;
                            this.camera.compensateOnFirstFrame = false;
                            // reset the camera's position to the origin
                            this.camera.position.set(0, 0, 0);
                            this.camera.rotationQuaternion.set(0, 0, 0, 1);
                        }
                        this.sessionManager.onXRSessionEnded.addOnce(function () {
                            // when using the back button and not the exit button (default on mobile), the session is ending but the EXITING state was not set
                            if (_this.state !== WebXRState.EXITING_XR) {
                                _this._setState(WebXRState.EXITING_XR);
                            }
                            // Reset camera rigs output render target to ensure sessions render target is not drawn after it ends
                            _this.camera.rigCameras.forEach(function (c) {
                                c.outputRenderTarget = null;
                            });
                            // Restore scene settings
                            _this._scene.autoClear = _this._originalSceneAutoClear;
                            _this._scene.activeCamera = _this._nonVRCamera;
                            if (_this._attachedToElement && _this._nonVRCamera) {
                                _this._nonVRCamera.attachControl(!!_this._nonVRCamera.inputs.noPreventDefault);
                            }
                            if (sessionMode !== "immersive-ar" && _this.camera.compensateOnFirstFrame) {
                                if (_this._nonVRCamera.setPosition) {
                                    _this._nonVRCamera.setPosition(_this.camera.position);
                                }
                                else {
                                    _this._nonVRCamera.position.copyFrom(_this.camera.position);
                                }
                            }
                            _this._setState(WebXRState.NOT_IN_XR);
                        });
                        // Wait until the first frame arrives before setting state to in xr
                        this.sessionManager.onXRFrameObservable.addOnce(function () {
                            _this._setState(WebXRState.IN_XR);
                        });
                        return [2 /*return*/, this.sessionManager];
                    case 6:
                        e_1 = _c.sent();
                        console.log(e_1);
                        console.log(e_1.message);
                        this._setState(WebXRState.NOT_IN_XR);
                        throw e_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exits XR mode and returns the scene to its original state
     * @returns promise that resolves after xr mode has exited
     */
    WebXRExperienceHelper.prototype.exitXRAsync = function () {
        // only exit if state is IN_XR
        if (this.state !== WebXRState.IN_XR) {
            return Promise.resolve();
        }
        this._setState(WebXRState.EXITING_XR);
        return this.sessionManager.exitXRAsync();
    };
    /**
     * Enable spectator mode for desktop VR experiences.
     * When spectator mode is enabled a camera will be attached to the desktop canvas and will
     * display the first rig camera's view on the desktop canvas.
     * Please note that this will degrade performance, as it requires another camera render.
     * It is also not recommended to enable this in devices like the quest, as it brings no benefit there.
     */
    WebXRExperienceHelper.prototype.enableSpectatorMode = function () {
        var _this = this;
        if (!this._spectatorMode) {
            var updateSpectatorCamera_1 = function () {
                if (_this._spectatorCamera) {
                    _this._spectatorCamera.position.copyFrom(_this.camera.rigCameras[0].globalPosition);
                    _this._spectatorCamera.rotationQuaternion.copyFrom(_this.camera.rigCameras[0].absoluteRotation);
                }
            };
            var onStateChanged = function () {
                if (_this.state === WebXRState.IN_XR) {
                    _this._spectatorCamera = new UniversalCamera("webxr-spectator", Vector3.Zero(), _this._scene);
                    _this._spectatorCamera.rotationQuaternion = new Quaternion();
                    _this._scene.activeCameras = [_this.camera, _this._spectatorCamera];
                    _this.sessionManager.onXRFrameObservable.add(updateSpectatorCamera_1);
                    _this._scene.onAfterRenderCameraObservable.add(function (camera) {
                        if (camera === _this.camera) {
                            // reset the dimensions object for correct resizing
                            _this._scene.getEngine().framebufferDimensionsObject = null;
                        }
                    });
                }
                else if (_this.state === WebXRState.EXITING_XR) {
                    _this.sessionManager.onXRFrameObservable.removeCallback(updateSpectatorCamera_1);
                    _this._scene.activeCameras = null;
                }
            };
            this._spectatorMode = true;
            this.onStateChangedObservable.add(onStateChanged);
            onStateChanged();
        }
    };
    WebXRExperienceHelper.prototype._nonXRToXRCamera = function () {
        this.camera.setTransformationFromNonVRCamera(this._nonVRCamera);
        this.onInitialXRPoseSetObservable.notifyObservers(this.camera);
    };
    WebXRExperienceHelper.prototype._setState = function (val) {
        if (this.state === val) {
            return;
        }
        this.state = val;
        this.onStateChangedObservable.notifyObservers(this.state);
    };
    return WebXRExperienceHelper;
}());
export { WebXRExperienceHelper };
//# sourceMappingURL=webXRExperienceHelper.js.map