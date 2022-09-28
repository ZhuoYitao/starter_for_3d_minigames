import { __decorate, __extends } from "tslib";
import { serialize, SerializationHelper, serializeAsVector3 } from "../Misc/decorators.js";
import { SmartArray } from "../Misc/smartArray.js";
import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { Matrix, Vector3, Quaternion } from "../Maths/math.vector.js";
import { Node } from "../node.js";
import { Logger } from "../Misc/logger.js";
import { GetClass } from "../Misc/typeStore.js";
import { _WarnImport } from "../Misc/devTools.js";
import { Viewport } from "../Maths/math.viewport.js";
import { Frustum } from "../Maths/math.frustum.js";

/**
 * This is the base class of all the camera used in the application.
 * @see https://doc.babylonjs.com/features/cameras
 */
var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    /**
     * Instantiates a new camera object.
     * This should not be used directly but through the inherited cameras: ArcRotate, Free...
     * @see https://doc.babylonjs.com/features/cameras
     * @param name Defines the name of the camera in the scene
     * @param position Defines the position of the camera
     * @param scene Defines the scene the camera belongs too
     * @param setActiveOnSceneIfNoneActive Defines if the camera should be set as active after creation if no other camera have been defined in the scene
     */
    function Camera(name, position, scene, setActiveOnSceneIfNoneActive) {
        if (setActiveOnSceneIfNoneActive === void 0) { setActiveOnSceneIfNoneActive = true; }
        var _this = _super.call(this, name, scene) || this;
        /** @hidden */
        _this._position = Vector3.Zero();
        _this._upVector = Vector3.Up();
        /**
         * Define the current limit on the left side for an orthographic camera
         * In scene unit
         */
        _this.orthoLeft = null;
        /**
         * Define the current limit on the right side for an orthographic camera
         * In scene unit
         */
        _this.orthoRight = null;
        /**
         * Define the current limit on the bottom side for an orthographic camera
         * In scene unit
         */
        _this.orthoBottom = null;
        /**
         * Define the current limit on the top side for an orthographic camera
         * In scene unit
         */
        _this.orthoTop = null;
        /**
         * Field Of View is set in Radians. (default is 0.8)
         */
        _this.fov = 0.8;
        /**
         * Projection plane tilt around the X axis (horizontal), set in Radians. (default is 0)
         * Can be used to make vertical lines in world space actually vertical on the screen.
         * See https://forum.babylonjs.com/t/add-vertical-shift-to-3ds-max-exporter-babylon-cameras/17480
         */
        _this.projectionPlaneTilt = 0;
        /**
         * Define the minimum distance the camera can see from.
         * This is important to note that the depth buffer are not infinite and the closer it starts
         * the more your scene might encounter depth fighting issue.
         */
        _this.minZ = 1;
        /**
         * Define the maximum distance the camera can see to.
         * This is important to note that the depth buffer are not infinite and the further it end
         * the more your scene might encounter depth fighting issue.
         */
        _this.maxZ = 10000.0;
        /**
         * Define the default inertia of the camera.
         * This helps giving a smooth feeling to the camera movement.
         */
        _this.inertia = 0.9;
        /**
         * Define the mode of the camera (Camera.PERSPECTIVE_CAMERA or Camera.ORTHOGRAPHIC_CAMERA)
         */
        _this.mode = Camera.PERSPECTIVE_CAMERA;
        /**
         * Define whether the camera is intermediate.
         * This is useful to not present the output directly to the screen in case of rig without post process for instance
         */
        _this.isIntermediate = false;
        /**
         * Define the viewport of the camera.
         * This correspond to the portion of the screen the camera will render to in normalized 0 to 1 unit.
         */
        _this.viewport = new Viewport(0, 0, 1.0, 1.0);
        /**
         * Restricts the camera to viewing objects with the same layerMask.
         * A camera with a layerMask of 1 will render mesh.layerMask & camera.layerMask!== 0
         */
        _this.layerMask = 0x0fffffff;
        /**
         * fovMode sets the camera frustum bounds to the viewport bounds. (default is FOVMODE_VERTICAL_FIXED)
         */
        _this.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
        /**
         * Rig mode of the camera.
         * This is useful to create the camera with two "eyes" instead of one to create VR or stereoscopic scenes.
         * This is normally controlled byt the camera themselves as internal use.
         */
        _this.cameraRigMode = Camera.RIG_MODE_NONE;
        /**
         * Defines the list of custom render target which are rendered to and then used as the input to this camera's render. Eg. display another camera view on a TV in the main scene
         * This is pretty helpful if you wish to make a camera render to a texture you could reuse somewhere
         * else in the scene. (Eg. security camera)
         *
         * To change the final output target of the camera, camera.outputRenderTarget should be used instead (eg. webXR renders to a render target corresponding to an HMD)
         */
        _this.customRenderTargets = new Array();
        /**
         * When set, the camera will render to this render target instead of the default canvas
         *
         * If the desire is to use the output of a camera as a texture in the scene consider using camera.customRenderTargets instead
         */
        _this.outputRenderTarget = null;
        /**
         * Observable triggered when the camera view matrix has changed.
         */
        _this.onViewMatrixChangedObservable = new Observable();
        /**
         * Observable triggered when the camera Projection matrix has changed.
         */
        _this.onProjectionMatrixChangedObservable = new Observable();
        /**
         * Observable triggered when the inputs have been processed.
         */
        _this.onAfterCheckInputsObservable = new Observable();
        /**
         * Observable triggered when reset has been called and applied to the camera.
         */
        _this.onRestoreStateObservable = new Observable();
        /**
         * Is this camera a part of a rig system?
         */
        _this.isRigCamera = false;
        /** @hidden */
        _this._rigCameras = new Array();
        _this._webvrViewMatrix = Matrix.Identity();
        /** @hidden */
        _this._skipRendering = false;
        /** @hidden */
        _this._projectionMatrix = new Matrix();
        /** @hidden */
        _this._postProcesses = new Array();
        /** @hidden */
        _this._activeMeshes = new SmartArray(256);
        _this._globalPosition = Vector3.Zero();
        /** @hidden */
        _this._computedViewMatrix = Matrix.Identity();
        _this._doNotComputeProjectionMatrix = false;
        _this._transformMatrix = Matrix.Zero();
        _this._refreshFrustumPlanes = true;
        _this._absoluteRotation = Quaternion.Identity();
        /** @hidden */
        _this._isCamera = true;
        /** @hidden */
        _this._isLeftCamera = false;
        /** @hidden */
        _this._isRightCamera = false;
        _this.getScene().addCamera(_this);
        if (setActiveOnSceneIfNoneActive && !_this.getScene().activeCamera) {
            _this.getScene().activeCamera = _this;
        }
        _this.position = position;
        _this.renderPassId = _this.getScene().getEngine().createRenderPassId("Camera ".concat(name));
        return _this;
    }
    Object.defineProperty(Camera.prototype, "position", {
        /**
         * Define the current local position of the camera in the scene
         */
        get: function () {
            return this._position;
        },
        set: function (newPosition) {
            this._position = newPosition;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "upVector", {
        get: function () {
            return this._upVector;
        },
        /**
         * The vector the camera should consider as up.
         * (default is Vector3(0, 1, 0) aka Vector3.Up())
         */
        set: function (vec) {
            this._upVector = vec;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "screenArea", {
        /**
         * The screen area in scene units squared
         */
        get: function () {
            var _a, _b, _c, _d;
            var x = 0;
            var y = 0;
            if (this.mode === Camera.PERSPECTIVE_CAMERA) {
                if (this.fovMode === Camera.FOVMODE_VERTICAL_FIXED) {
                    y = this.minZ * 2 * Math.tan(this.fov / 2);
                    x = this.getEngine().getAspectRatio(this) * y;
                }
                else {
                    x = this.minZ * 2 * Math.tan(this.fov / 2);
                    y = x / this.getEngine().getAspectRatio(this);
                }
            }
            else {
                var halfWidth = this.getEngine().getRenderWidth() / 2.0;
                var halfHeight = this.getEngine().getRenderHeight() / 2.0;
                x = ((_a = this.orthoRight) !== null && _a !== void 0 ? _a : halfWidth) - ((_b = this.orthoLeft) !== null && _b !== void 0 ? _b : -halfWidth);
                y = ((_c = this.orthoTop) !== null && _c !== void 0 ? _c : halfHeight) - ((_d = this.orthoBottom) !== null && _d !== void 0 ? _d : -halfHeight);
            }
            return x * y;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Store current camera state (fov, position, etc..)
     * @returns the camera
     */
    Camera.prototype.storeState = function () {
        this._stateStored = true;
        this._storedFov = this.fov;
        return this;
    };
    /**
     * Restores the camera state values if it has been stored. You must call storeState() first
     */
    Camera.prototype._restoreStateValues = function () {
        if (!this._stateStored) {
            return false;
        }
        this.fov = this._storedFov;
        return true;
    };
    /**
     * Restored camera state. You must call storeState() first.
     * @returns true if restored and false otherwise
     */
    Camera.prototype.restoreState = function () {
        if (this._restoreStateValues()) {
            this.onRestoreStateObservable.notifyObservers(this);
            return true;
        }
        return false;
    };
    /**
     * Gets the class name of the camera.
     * @returns the class name
     */
    Camera.prototype.getClassName = function () {
        return "Camera";
    };
    /**
     * Gets a string representation of the camera useful for debug purpose.
     * @param fullDetails Defines that a more verbose level of logging is required
     * @returns the string representation
     */
    Camera.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name;
        ret += ", type: " + this.getClassName();
        if (this.animations) {
            for (var i = 0; i < this.animations.length; i++) {
                ret += ", animation[0]: " + this.animations[i].toString(fullDetails);
            }
        }
        return ret;
    };
    /**
     * Automatically tilts the projection plane, using `projectionPlaneTilt`, to correct the perspective effect on vertical lines.
     */
    Camera.prototype.applyVerticalCorrection = function () {
        var rot = this.absoluteRotation.toEulerAngles();
        this.projectionPlaneTilt = this._scene.useRightHandedSystem ? -rot.x : rot.x;
    };
    Object.defineProperty(Camera.prototype, "globalPosition", {
        /**
         * Gets the current world space position of the camera.
         */
        get: function () {
            return this._globalPosition;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the list of active meshes this frame (meshes no culled or excluded by lod s in the frame)
     * @returns the active meshe list
     */
    Camera.prototype.getActiveMeshes = function () {
        return this._activeMeshes;
    };
    /**
     * Check whether a mesh is part of the current active mesh list of the camera
     * @param mesh Defines the mesh to check
     * @returns true if active, false otherwise
     */
    Camera.prototype.isActiveMesh = function (mesh) {
        return this._activeMeshes.indexOf(mesh) !== -1;
    };
    /**
     * Is this camera ready to be used/rendered
     * @param completeCheck defines if a complete check (including post processes) has to be done (false by default)
     * @return true if the camera is ready
     */
    Camera.prototype.isReady = function (completeCheck) {
        if (completeCheck === void 0) { completeCheck = false; }
        if (completeCheck) {
            for (var _i = 0, _a = this._postProcesses; _i < _a.length; _i++) {
                var pp = _a[_i];
                if (pp && !pp.isReady()) {
                    return false;
                }
            }
        }
        return _super.prototype.isReady.call(this, completeCheck);
    };
    /** @hidden */
    Camera.prototype._initCache = function () {
        _super.prototype._initCache.call(this);
        this._cache.position = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.upVector = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.mode = undefined;
        this._cache.minZ = undefined;
        this._cache.maxZ = undefined;
        this._cache.fov = undefined;
        this._cache.fovMode = undefined;
        this._cache.aspectRatio = undefined;
        this._cache.orthoLeft = undefined;
        this._cache.orthoRight = undefined;
        this._cache.orthoBottom = undefined;
        this._cache.orthoTop = undefined;
        this._cache.renderWidth = undefined;
        this._cache.renderHeight = undefined;
    };
    /**
     * @param ignoreParentClass
     * @hidden
     */
    Camera.prototype._updateCache = function (ignoreParentClass) {
        if (!ignoreParentClass) {
            _super.prototype._updateCache.call(this);
        }
        this._cache.position.copyFrom(this.position);
        this._cache.upVector.copyFrom(this.upVector);
    };
    /** @hidden */
    Camera.prototype._isSynchronized = function () {
        return this._isSynchronizedViewMatrix() && this._isSynchronizedProjectionMatrix();
    };
    /** @hidden */
    Camera.prototype._isSynchronizedViewMatrix = function () {
        if (!_super.prototype._isSynchronized.call(this)) {
            return false;
        }
        return this._cache.position.equals(this.position) && this._cache.upVector.equals(this.upVector) && this.isSynchronizedWithParent();
    };
    /** @hidden */
    Camera.prototype._isSynchronizedProjectionMatrix = function () {
        var check = this._cache.mode === this.mode && this._cache.minZ === this.minZ && this._cache.maxZ === this.maxZ;
        if (!check) {
            return false;
        }
        var engine = this.getEngine();
        if (this.mode === Camera.PERSPECTIVE_CAMERA) {
            check =
                this._cache.fov === this.fov &&
                    this._cache.fovMode === this.fovMode &&
                    this._cache.aspectRatio === engine.getAspectRatio(this) &&
                    this._cache.projectionPlaneTilt === this.projectionPlaneTilt;
        }
        else {
            check =
                this._cache.orthoLeft === this.orthoLeft &&
                    this._cache.orthoRight === this.orthoRight &&
                    this._cache.orthoBottom === this.orthoBottom &&
                    this._cache.orthoTop === this.orthoTop &&
                    this._cache.renderWidth === engine.getRenderWidth() &&
                    this._cache.renderHeight === engine.getRenderHeight();
        }
        return check;
    };
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * This function is here because typescript removes the typing of the last function.
     * @param _ignored defines an ignored parameter kept for backward compatibility.
     * @param _noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    Camera.prototype.attachControl = function (_ignored, _noPreventDefault) { };
    /**
     * Detach the current controls from the specified dom element.
     * This function is here because typescript removes the typing of the last function.
     * @param _ignored defines an ignored parameter kept for backward compatibility.
     */
    Camera.prototype.detachControl = function (_ignored) { };
    /**
     * Update the camera state according to the different inputs gathered during the frame.
     */
    Camera.prototype.update = function () {
        this._checkInputs();
        if (this.cameraRigMode !== Camera.RIG_MODE_NONE) {
            this._updateRigCameras();
        }
    };
    /** @hidden */
    Camera.prototype._checkInputs = function () {
        this.onAfterCheckInputsObservable.notifyObservers(this);
    };
    Object.defineProperty(Camera.prototype, "rigCameras", {
        /** @hidden */
        get: function () {
            return this._rigCameras;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "rigPostProcess", {
        /**
         * Gets the post process used by the rig cameras
         */
        get: function () {
            return this._rigPostProcess;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Internal, gets the first post process.
     * @returns the first post process to be run on this camera.
     */
    Camera.prototype._getFirstPostProcess = function () {
        for (var ppIndex = 0; ppIndex < this._postProcesses.length; ppIndex++) {
            if (this._postProcesses[ppIndex] !== null) {
                return this._postProcesses[ppIndex];
            }
        }
        return null;
    };
    Camera.prototype._cascadePostProcessesToRigCams = function () {
        // invalidate framebuffer
        var firstPostProcess = this._getFirstPostProcess();
        if (firstPostProcess) {
            firstPostProcess.markTextureDirty();
        }
        // glue the rigPostProcess to the end of the user postprocesses & assign to each sub-camera
        for (var i = 0, len = this._rigCameras.length; i < len; i++) {
            var cam = this._rigCameras[i];
            var rigPostProcess = cam._rigPostProcess;
            // for VR rig, there does not have to be a post process
            if (rigPostProcess) {
                var isPass = rigPostProcess.getEffectName() === "pass";
                if (isPass) {
                    // any rig which has a PassPostProcess for rig[0], cannot be isIntermediate when there are also user postProcesses
                    cam.isIntermediate = this._postProcesses.length === 0;
                }
                cam._postProcesses = this._postProcesses.slice(0).concat(rigPostProcess);
                rigPostProcess.markTextureDirty();
            }
            else {
                cam._postProcesses = this._postProcesses.slice(0);
            }
        }
    };
    /**
     * Attach a post process to the camera.
     * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#attach-postprocess
     * @param postProcess The post process to attach to the camera
     * @param insertAt The position of the post process in case several of them are in use in the scene
     * @returns the position the post process has been inserted at
     */
    Camera.prototype.attachPostProcess = function (postProcess, insertAt) {
        if (insertAt === void 0) { insertAt = null; }
        if (!postProcess.isReusable() && this._postProcesses.indexOf(postProcess) > -1) {
            Logger.Error("You're trying to reuse a post process not defined as reusable.");
            return 0;
        }
        if (insertAt == null || insertAt < 0) {
            this._postProcesses.push(postProcess);
        }
        else if (this._postProcesses[insertAt] === null) {
            this._postProcesses[insertAt] = postProcess;
        }
        else {
            this._postProcesses.splice(insertAt, 0, postProcess);
        }
        this._cascadePostProcessesToRigCams(); // also ensures framebuffer invalidated
        // Update prePass
        if (this._scene.prePassRenderer) {
            this._scene.prePassRenderer.markAsDirty();
        }
        return this._postProcesses.indexOf(postProcess);
    };
    /**
     * Detach a post process to the camera.
     * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#attach-postprocess
     * @param postProcess The post process to detach from the camera
     */
    Camera.prototype.detachPostProcess = function (postProcess) {
        var idx = this._postProcesses.indexOf(postProcess);
        if (idx !== -1) {
            this._postProcesses[idx] = null;
        }
        // Update prePass
        if (this._scene.prePassRenderer) {
            this._scene.prePassRenderer.markAsDirty();
        }
        this._cascadePostProcessesToRigCams(); // also ensures framebuffer invalidated
    };
    /**
     * Gets the current world matrix of the camera
     */
    Camera.prototype.getWorldMatrix = function () {
        if (this._isSynchronizedViewMatrix()) {
            return this._worldMatrix;
        }
        // Getting the the view matrix will also compute the world matrix.
        this.getViewMatrix();
        return this._worldMatrix;
    };
    /** @hidden */
    Camera.prototype._getViewMatrix = function () {
        return Matrix.Identity();
    };
    /**
     * Gets the current view matrix of the camera.
     * @param force forces the camera to recompute the matrix without looking at the cached state
     * @returns the view matrix
     */
    Camera.prototype.getViewMatrix = function (force) {
        if (!force && this._isSynchronizedViewMatrix()) {
            return this._computedViewMatrix;
        }
        this.updateCache();
        this._computedViewMatrix = this._getViewMatrix();
        this._currentRenderId = this.getScene().getRenderId();
        this._childUpdateId++;
        this._refreshFrustumPlanes = true;
        if (this._cameraRigParams && this._cameraRigParams.vrPreViewMatrix) {
            this._computedViewMatrix.multiplyToRef(this._cameraRigParams.vrPreViewMatrix, this._computedViewMatrix);
        }
        // Notify parent camera if rig camera is changed
        if (this.parent && this.parent.onViewMatrixChangedObservable) {
            this.parent.onViewMatrixChangedObservable.notifyObservers(this.parent);
        }
        this.onViewMatrixChangedObservable.notifyObservers(this);
        this._computedViewMatrix.invertToRef(this._worldMatrix);
        return this._computedViewMatrix;
    };
    /**
     * Freeze the projection matrix.
     * It will prevent the cache check of the camera projection compute and can speed up perf
     * if no parameter of the camera are meant to change
     * @param projection Defines manually a projection if necessary
     */
    Camera.prototype.freezeProjectionMatrix = function (projection) {
        this._doNotComputeProjectionMatrix = true;
        if (projection !== undefined) {
            this._projectionMatrix = projection;
        }
    };
    /**
     * Unfreeze the projection matrix if it has previously been freezed by freezeProjectionMatrix.
     */
    Camera.prototype.unfreezeProjectionMatrix = function () {
        this._doNotComputeProjectionMatrix = false;
    };
    /**
     * Gets the current projection matrix of the camera.
     * @param force forces the camera to recompute the matrix without looking at the cached state
     * @returns the projection matrix
     */
    Camera.prototype.getProjectionMatrix = function (force) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this._doNotComputeProjectionMatrix || (!force && this._isSynchronizedProjectionMatrix())) {
            return this._projectionMatrix;
        }
        // Cache
        this._cache.mode = this.mode;
        this._cache.minZ = this.minZ;
        this._cache.maxZ = this.maxZ;
        // Matrix
        this._refreshFrustumPlanes = true;
        var engine = this.getEngine();
        var scene = this.getScene();
        if (this.mode === Camera.PERSPECTIVE_CAMERA) {
            this._cache.fov = this.fov;
            this._cache.fovMode = this.fovMode;
            this._cache.aspectRatio = engine.getAspectRatio(this);
            this._cache.projectionPlaneTilt = this.projectionPlaneTilt;
            if (this.minZ <= 0) {
                this.minZ = 0.1;
            }
            var reverseDepth = engine.useReverseDepthBuffer;
            var getProjectionMatrix = void 0;
            if (scene.useRightHandedSystem) {
                getProjectionMatrix = Matrix.PerspectiveFovRHToRef;
            }
            else {
                getProjectionMatrix = Matrix.PerspectiveFovLHToRef;
            }
            getProjectionMatrix(this.fov, engine.getAspectRatio(this), reverseDepth ? this.maxZ : this.minZ, reverseDepth ? this.minZ : this.maxZ, this._projectionMatrix, this.fovMode === Camera.FOVMODE_VERTICAL_FIXED, engine.isNDCHalfZRange, this.projectionPlaneTilt, engine.useReverseDepthBuffer);
        }
        else {
            var halfWidth = engine.getRenderWidth() / 2.0;
            var halfHeight = engine.getRenderHeight() / 2.0;
            if (scene.useRightHandedSystem) {
                Matrix.OrthoOffCenterRHToRef((_a = this.orthoLeft) !== null && _a !== void 0 ? _a : -halfWidth, (_b = this.orthoRight) !== null && _b !== void 0 ? _b : halfWidth, (_c = this.orthoBottom) !== null && _c !== void 0 ? _c : -halfHeight, (_d = this.orthoTop) !== null && _d !== void 0 ? _d : halfHeight, this.minZ, this.maxZ, this._projectionMatrix, engine.isNDCHalfZRange);
            }
            else {
                Matrix.OrthoOffCenterLHToRef((_e = this.orthoLeft) !== null && _e !== void 0 ? _e : -halfWidth, (_f = this.orthoRight) !== null && _f !== void 0 ? _f : halfWidth, (_g = this.orthoBottom) !== null && _g !== void 0 ? _g : -halfHeight, (_h = this.orthoTop) !== null && _h !== void 0 ? _h : halfHeight, this.minZ, this.maxZ, this._projectionMatrix, engine.isNDCHalfZRange);
            }
            this._cache.orthoLeft = this.orthoLeft;
            this._cache.orthoRight = this.orthoRight;
            this._cache.orthoBottom = this.orthoBottom;
            this._cache.orthoTop = this.orthoTop;
            this._cache.renderWidth = engine.getRenderWidth();
            this._cache.renderHeight = engine.getRenderHeight();
        }
        this.onProjectionMatrixChangedObservable.notifyObservers(this);
        return this._projectionMatrix;
    };
    /**
     * Gets the transformation matrix (ie. the multiplication of view by projection matrices)
     * @returns a Matrix
     */
    Camera.prototype.getTransformationMatrix = function () {
        this._computedViewMatrix.multiplyToRef(this._projectionMatrix, this._transformMatrix);
        return this._transformMatrix;
    };
    Camera.prototype._updateFrustumPlanes = function () {
        if (!this._refreshFrustumPlanes) {
            return;
        }
        this.getTransformationMatrix();
        if (!this._frustumPlanes) {
            this._frustumPlanes = Frustum.GetPlanes(this._transformMatrix);
        }
        else {
            Frustum.GetPlanesToRef(this._transformMatrix, this._frustumPlanes);
        }
        this._refreshFrustumPlanes = false;
    };
    /**
     * Checks if a cullable object (mesh...) is in the camera frustum
     * This checks the bounding box center. See isCompletelyInFrustum for a full bounding check
     * @param target The object to check
     * @param checkRigCameras If the rig cameras should be checked (eg. with webVR camera both eyes should be checked) (Default: false)
     * @returns true if the object is in frustum otherwise false
     */
    Camera.prototype.isInFrustum = function (target, checkRigCameras) {
        if (checkRigCameras === void 0) { checkRigCameras = false; }
        this._updateFrustumPlanes();
        if (checkRigCameras && this.rigCameras.length > 0) {
            var result_1 = false;
            this.rigCameras.forEach(function (cam) {
                cam._updateFrustumPlanes();
                result_1 = result_1 || target.isInFrustum(cam._frustumPlanes);
            });
            return result_1;
        }
        else {
            return target.isInFrustum(this._frustumPlanes);
        }
    };
    /**
     * Checks if a cullable object (mesh...) is in the camera frustum
     * Unlike isInFrustum this checks the full bounding box
     * @param target The object to check
     * @returns true if the object is in frustum otherwise false
     */
    Camera.prototype.isCompletelyInFrustum = function (target) {
        this._updateFrustumPlanes();
        return target.isCompletelyInFrustum(this._frustumPlanes);
    };
    /**
     * Gets a ray in the forward direction from the camera.
     * @param length Defines the length of the ray to create
     * @param transform Defines the transform to apply to the ray, by default the world matrix is used to create a workd space ray
     * @param origin Defines the start point of the ray which defaults to the camera position
     * @returns the forward ray
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Camera.prototype.getForwardRay = function (length, transform, origin) {
        if (length === void 0) { length = 100; }
        throw _WarnImport("Ray");
    };
    /**
     * Gets a ray in the forward direction from the camera.
     * @param refRay the ray to (re)use when setting the values
     * @param length Defines the length of the ray to create
     * @param transform Defines the transform to apply to the ray, by default the world matrx is used to create a workd space ray
     * @param origin Defines the start point of the ray which defaults to the camera position
     * @returns the forward ray
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Camera.prototype.getForwardRayToRef = function (refRay, length, transform, origin) {
        if (length === void 0) { length = 100; }
        throw _WarnImport("Ray");
    };
    /**
     * Releases resources associated with this node.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    Camera.prototype.dispose = function (doNotRecurse, disposeMaterialAndTextures) {
        if (disposeMaterialAndTextures === void 0) { disposeMaterialAndTextures = false; }
        // Observables
        this.onViewMatrixChangedObservable.clear();
        this.onProjectionMatrixChangedObservable.clear();
        this.onAfterCheckInputsObservable.clear();
        this.onRestoreStateObservable.clear();
        // Inputs
        if (this.inputs) {
            this.inputs.clear();
        }
        // Animations
        this.getScene().stopAnimation(this);
        // Remove from scene
        this.getScene().removeCamera(this);
        while (this._rigCameras.length > 0) {
            var camera = this._rigCameras.pop();
            if (camera) {
                camera.dispose();
            }
        }
        if (this._parentContainer) {
            var index = this._parentContainer.cameras.indexOf(this);
            if (index > -1) {
                this._parentContainer.cameras.splice(index, 1);
            }
            this._parentContainer = null;
        }
        // Postprocesses
        if (this._rigPostProcess) {
            this._rigPostProcess.dispose(this);
            this._rigPostProcess = null;
            this._postProcesses = [];
        }
        else if (this.cameraRigMode !== Camera.RIG_MODE_NONE) {
            this._rigPostProcess = null;
            this._postProcesses = [];
        }
        else {
            var i_1 = this._postProcesses.length;
            while (--i_1 >= 0) {
                var postProcess = this._postProcesses[i_1];
                if (postProcess) {
                    postProcess.dispose(this);
                }
            }
        }
        // Render targets
        var i = this.customRenderTargets.length;
        while (--i >= 0) {
            this.customRenderTargets[i].dispose();
        }
        this.customRenderTargets = [];
        // Active Meshes
        this._activeMeshes.dispose();
        this.getScene().getEngine().releaseRenderPassId(this.renderPassId);
        _super.prototype.dispose.call(this, doNotRecurse, disposeMaterialAndTextures);
    };
    Object.defineProperty(Camera.prototype, "isLeftCamera", {
        /**
         * Gets the left camera of a rig setup in case of Rigged Camera
         */
        get: function () {
            return this._isLeftCamera;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "isRightCamera", {
        /**
         * Gets the right camera of a rig setup in case of Rigged Camera
         */
        get: function () {
            return this._isRightCamera;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "leftCamera", {
        /**
         * Gets the left camera of a rig setup in case of Rigged Camera
         */
        get: function () {
            if (this._rigCameras.length < 1) {
                return null;
            }
            return this._rigCameras[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "rightCamera", {
        /**
         * Gets the right camera of a rig setup in case of Rigged Camera
         */
        get: function () {
            if (this._rigCameras.length < 2) {
                return null;
            }
            return this._rigCameras[1];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the left camera target of a rig setup in case of Rigged Camera
     * @returns the target position
     */
    Camera.prototype.getLeftTarget = function () {
        if (this._rigCameras.length < 1) {
            return null;
        }
        return this._rigCameras[0].getTarget();
    };
    /**
     * Gets the right camera target of a rig setup in case of Rigged Camera
     * @returns the target position
     */
    Camera.prototype.getRightTarget = function () {
        if (this._rigCameras.length < 2) {
            return null;
        }
        return this._rigCameras[1].getTarget();
    };
    /**
     * @param mode
     * @param rigParams
     * @hidden
     */
    Camera.prototype.setCameraRigMode = function (mode, rigParams) {
        if (this.cameraRigMode === mode) {
            return;
        }
        while (this._rigCameras.length > 0) {
            var camera = this._rigCameras.pop();
            if (camera) {
                camera.dispose();
            }
        }
        this.cameraRigMode = mode;
        this._cameraRigParams = {};
        //we have to implement stereo camera calcultating left and right viewpoints from interaxialDistance and target,
        //not from a given angle as it is now, but until that complete code rewriting provisional stereoHalfAngle value is introduced
        this._cameraRigParams.interaxialDistance = rigParams.interaxialDistance || 0.0637;
        this._cameraRigParams.stereoHalfAngle = Tools.ToRadians(this._cameraRigParams.interaxialDistance / 0.0637);
        // create the rig cameras, unless none
        if (this.cameraRigMode !== Camera.RIG_MODE_NONE) {
            var leftCamera = this.createRigCamera(this.name + "_L", 0);
            if (leftCamera) {
                leftCamera._isLeftCamera = true;
            }
            var rightCamera = this.createRigCamera(this.name + "_R", 1);
            if (rightCamera) {
                rightCamera._isRightCamera = true;
            }
            if (leftCamera && rightCamera) {
                this._rigCameras.push(leftCamera);
                this._rigCameras.push(rightCamera);
            }
        }
        this._setRigMode(rigParams);
        this._cascadePostProcessesToRigCams();
        this.update();
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Camera.prototype._setRigMode = function (rigParams) {
        // no-op
    };
    /** @hidden */
    Camera.prototype._getVRProjectionMatrix = function () {
        Matrix.PerspectiveFovLHToRef(this._cameraRigParams.vrMetrics.aspectRatioFov, this._cameraRigParams.vrMetrics.aspectRatio, this.minZ, this.maxZ, this._cameraRigParams.vrWorkMatrix, true, this.getEngine().isNDCHalfZRange);
        this._cameraRigParams.vrWorkMatrix.multiplyToRef(this._cameraRigParams.vrHMatrix, this._projectionMatrix);
        return this._projectionMatrix;
    };
    Camera.prototype._updateCameraRotationMatrix = function () {
        //Here for WebVR
    };
    Camera.prototype._updateWebVRCameraRotationMatrix = function () {
        //Here for WebVR
    };
    /**
     * This function MUST be overwritten by the different WebVR cameras available.
     * The context in which it is running is the RIG camera. So 'this' is the TargetCamera, left or right.
     * @hidden
     */
    Camera.prototype._getWebVRProjectionMatrix = function () {
        return Matrix.Identity();
    };
    /**
     * This function MUST be overwritten by the different WebVR cameras available.
     * The context in which it is running is the RIG camera. So 'this' is the TargetCamera, left or right.
     * @hidden
     */
    Camera.prototype._getWebVRViewMatrix = function () {
        return Matrix.Identity();
    };
    /**
     * @param name
     * @param value
     * @hidden
     */
    Camera.prototype.setCameraRigParameter = function (name, value) {
        if (!this._cameraRigParams) {
            this._cameraRigParams = {};
        }
        this._cameraRigParams[name] = value;
        //provisionnally:
        if (name === "interaxialDistance") {
            this._cameraRigParams.stereoHalfAngle = Tools.ToRadians(value / 0.0637);
        }
    };
    /**
     * needs to be overridden by children so sub has required properties to be copied
     * @param name
     * @param cameraIndex
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Camera.prototype.createRigCamera = function (name, cameraIndex) {
        return null;
    };
    /**
     * May need to be overridden by children
     * @hidden
     */
    Camera.prototype._updateRigCameras = function () {
        for (var i = 0; i < this._rigCameras.length; i++) {
            this._rigCameras[i].minZ = this.minZ;
            this._rigCameras[i].maxZ = this.maxZ;
            this._rigCameras[i].fov = this.fov;
            this._rigCameras[i].upVector.copyFrom(this.upVector);
        }
        // only update viewport when ANAGLYPH
        if (this.cameraRigMode === Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH) {
            this._rigCameras[0].viewport = this._rigCameras[1].viewport = this.viewport;
        }
    };
    /** @hidden */
    Camera.prototype._setupInputs = function () { };
    /**
     * Serialiaze the camera setup to a json representation
     * @returns the JSON representation
     */
    Camera.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.uniqueId = this.uniqueId;
        // Type
        serializationObject.type = this.getClassName();
        // Parent
        if (this.parent) {
            serializationObject.parentId = this.parent.uniqueId;
        }
        if (this.inputs) {
            this.inputs.serialize(serializationObject);
        }
        // Animations
        SerializationHelper.AppendSerializedAnimations(this, serializationObject);
        serializationObject.ranges = this.serializeAnimationRanges();
        serializationObject.isEnabled = this.isEnabled();
        return serializationObject;
    };
    /**
     * Clones the current camera.
     * @param name The cloned camera name
     * @param newParent The cloned camera's new parent (none by default)
     * @returns the cloned camera
     */
    Camera.prototype.clone = function (name, newParent) {
        if (newParent === void 0) { newParent = null; }
        var camera = SerializationHelper.Clone(Camera.GetConstructorFromName(this.getClassName(), name, this.getScene(), this.interaxialDistance, this.isStereoscopicSideBySide), this);
        camera.name = name;
        camera.parent = newParent;
        this.onClonedObservable.notifyObservers(camera);
        return camera;
    };
    /**
     * Gets the direction of the camera relative to a given local axis.
     * @param localAxis Defines the reference axis to provide a relative direction.
     * @return the direction
     */
    Camera.prototype.getDirection = function (localAxis) {
        var result = Vector3.Zero();
        this.getDirectionToRef(localAxis, result);
        return result;
    };
    Object.defineProperty(Camera.prototype, "absoluteRotation", {
        /**
         * Returns the current camera absolute rotation
         */
        get: function () {
            this.getWorldMatrix().decompose(undefined, this._absoluteRotation);
            return this._absoluteRotation;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the direction of the camera relative to a given local axis into a passed vector.
     * @param localAxis Defines the reference axis to provide a relative direction.
     * @param result Defines the vector to store the result in
     */
    Camera.prototype.getDirectionToRef = function (localAxis, result) {
        Vector3.TransformNormalToRef(localAxis, this.getWorldMatrix(), result);
    };
    /**
     * Gets a camera constructor for a given camera type
     * @param type The type of the camera to construct (should be equal to one of the camera class name)
     * @param name The name of the camera the result will be able to instantiate
     * @param scene The scene the result will construct the camera in
     * @param interaxial_distance In case of stereoscopic setup, the distance between both eyes
     * @param isStereoscopicSideBySide In case of stereoscopic setup, should the sereo be side b side
     * @returns a factory method to construct the camera
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Camera.GetConstructorFromName = function (type, name, scene, interaxial_distance, isStereoscopicSideBySide) {
        if (interaxial_distance === void 0) { interaxial_distance = 0; }
        if (isStereoscopicSideBySide === void 0) { isStereoscopicSideBySide = true; }
        var constructorFunc = Node.Construct(type, name, scene, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            interaxial_distance: interaxial_distance,
            isStereoscopicSideBySide: isStereoscopicSideBySide,
        });
        if (constructorFunc) {
            return constructorFunc;
        }
        // Default to universal camera
        return function () { return Camera._CreateDefaultParsedCamera(name, scene); };
    };
    /**
     * Compute the world  matrix of the camera.
     * @returns the camera world matrix
     */
    Camera.prototype.computeWorldMatrix = function () {
        return this.getWorldMatrix();
    };
    /**
     * Parse a JSON and creates the camera from the parsed information
     * @param parsedCamera The JSON to parse
     * @param scene The scene to instantiate the camera in
     * @returns the newly constructed camera
     */
    Camera.Parse = function (parsedCamera, scene) {
        var type = parsedCamera.type;
        var construct = Camera.GetConstructorFromName(type, parsedCamera.name, scene, parsedCamera.interaxial_distance, parsedCamera.isStereoscopicSideBySide);
        var camera = SerializationHelper.Parse(construct, parsedCamera, scene);
        // Parent
        if (parsedCamera.parentId !== undefined) {
            camera._waitingParentId = parsedCamera.parentId;
        }
        //If camera has an input manager, let it parse inputs settings
        if (camera.inputs) {
            camera.inputs.parse(parsedCamera);
            camera._setupInputs();
        }
        if (parsedCamera.upVector) {
            camera.upVector = Vector3.FromArray(parsedCamera.upVector); // need to force the upVector
        }
        if (camera.setPosition) {
            // need to force position
            camera.position.copyFromFloats(0, 0, 0);
            camera.setPosition(Vector3.FromArray(parsedCamera.position));
        }
        // Target
        if (parsedCamera.target) {
            if (camera.setTarget) {
                camera.setTarget(Vector3.FromArray(parsedCamera.target));
            }
        }
        // Apply 3d rig, when found
        if (parsedCamera.cameraRigMode) {
            var rigParams = parsedCamera.interaxial_distance ? { interaxialDistance: parsedCamera.interaxial_distance } : {};
            camera.setCameraRigMode(parsedCamera.cameraRigMode, rigParams);
        }
        // Animations
        if (parsedCamera.animations) {
            for (var animationIndex = 0; animationIndex < parsedCamera.animations.length; animationIndex++) {
                var parsedAnimation = parsedCamera.animations[animationIndex];
                var internalClass = GetClass("BABYLON.Animation");
                if (internalClass) {
                    camera.animations.push(internalClass.Parse(parsedAnimation));
                }
            }
            Node.ParseAnimationRanges(camera, parsedCamera, scene);
        }
        if (parsedCamera.autoAnimate) {
            scene.beginAnimation(camera, parsedCamera.autoAnimateFrom, parsedCamera.autoAnimateTo, parsedCamera.autoAnimateLoop, parsedCamera.autoAnimateSpeed || 1.0);
        }
        // Check if isEnabled is defined to be back compatible with prior serialized versions.
        if (parsedCamera.isEnabled !== undefined) {
            camera.setEnabled(parsedCamera.isEnabled);
        }
        return camera;
    };
    /**
     * @param name
     * @param scene
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Camera._CreateDefaultParsedCamera = function (name, scene) {
        throw _WarnImport("UniversalCamera");
    };
    /**
     * This is the default projection mode used by the cameras.
     * It helps recreating a feeling of perspective and better appreciate depth.
     * This is the best way to simulate real life cameras.
     */
    Camera.PERSPECTIVE_CAMERA = 0;
    /**
     * This helps creating camera with an orthographic mode.
     * Orthographic is commonly used in engineering as a means to produce object specifications that communicate dimensions unambiguously, each line of 1 unit length (cm, meter..whatever) will appear to have the same length everywhere on the drawing. This allows the drafter to dimension only a subset of lines and let the reader know that other lines of that length on the drawing are also that length in reality. Every parallel line in the drawing is also parallel in the object.
     */
    Camera.ORTHOGRAPHIC_CAMERA = 1;
    /**
     * This is the default FOV mode for perspective cameras.
     * This setting aligns the upper and lower bounds of the viewport to the upper and lower bounds of the camera frustum.
     */
    Camera.FOVMODE_VERTICAL_FIXED = 0;
    /**
     * This setting aligns the left and right bounds of the viewport to the left and right bounds of the camera frustum.
     */
    Camera.FOVMODE_HORIZONTAL_FIXED = 1;
    /**
     * This specifies there is no need for a camera rig.
     * Basically only one eye is rendered corresponding to the camera.
     */
    Camera.RIG_MODE_NONE = 0;
    /**
     * Simulates a camera Rig with one blue eye and one red eye.
     * This can be use with 3d blue and red glasses.
     */
    Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH = 10;
    /**
     * Defines that both eyes of the camera will be rendered side by side with a parallel target.
     */
    Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL = 11;
    /**
     * Defines that both eyes of the camera will be rendered side by side with a none parallel target.
     */
    Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED = 12;
    /**
     * Defines that both eyes of the camera will be rendered over under each other.
     */
    Camera.RIG_MODE_STEREOSCOPIC_OVERUNDER = 13;
    /**
     * Defines that both eyes of the camera will be rendered on successive lines interlaced for passive 3d monitors.
     */
    Camera.RIG_MODE_STEREOSCOPIC_INTERLACED = 14;
    /**
     * Defines that both eyes of the camera should be renderered in a VR mode (carbox).
     */
    Camera.RIG_MODE_VR = 20;
    /**
     * Defines that both eyes of the camera should be renderered in a VR mode (webVR).
     */
    Camera.RIG_MODE_WEBVR = 21;
    /**
     * Custom rig mode allowing rig cameras to be populated manually with any number of cameras
     */
    Camera.RIG_MODE_CUSTOM = 22;
    /**
     * Defines if by default attaching controls should prevent the default javascript event to continue.
     */
    Camera.ForceAttachControlToAlwaysPreventDefault = false;
    __decorate([
        serializeAsVector3("position")
    ], Camera.prototype, "_position", void 0);
    __decorate([
        serializeAsVector3("upVector")
    ], Camera.prototype, "_upVector", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "orthoLeft", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "orthoRight", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "orthoBottom", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "orthoTop", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "fov", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "projectionPlaneTilt", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "minZ", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "maxZ", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "inertia", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "mode", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "layerMask", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "fovMode", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "cameraRigMode", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "interaxialDistance", void 0);
    __decorate([
        serialize()
    ], Camera.prototype, "isStereoscopicSideBySide", void 0);
    return Camera;
}(Node));
export { Camera };
//# sourceMappingURL=camera.js.map