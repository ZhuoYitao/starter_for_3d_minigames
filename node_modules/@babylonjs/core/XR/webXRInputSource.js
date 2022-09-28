import { Observable } from "../Misc/observable.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { Quaternion, Vector3 } from "../Maths/math.vector.js";
import { WebXRMotionControllerManager } from "./motionController/webXRMotionControllerManager.js";
import { Tools } from "../Misc/tools.js";
var idCount = 0;
/**
 * Represents an XR controller
 */
var WebXRInputSource = /** @class */ (function () {
    /**
     * Creates the input source object
     * @see https://doc.babylonjs.com/how_to/webxr_controllers_support
     * @param _scene the scene which the controller should be associated to
     * @param inputSource the underlying input source for the controller
     * @param _options options for this controller creation
     */
    function WebXRInputSource(_scene, 
    /** The underlying input source for the controller  */
    inputSource, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = this;
        this._scene = _scene;
        this.inputSource = inputSource;
        this._options = _options;
        this._tmpVector = new Vector3();
        this._disposed = false;
        /**
         * Event that fires when the controller is removed/disposed.
         * The object provided as event data is this controller, after associated assets were disposed.
         * uniqueId is still available.
         */
        this.onDisposeObservable = new Observable();
        /**
         * Will be triggered when the mesh associated with the motion controller is done loading.
         * It is also possible that this will never trigger (!) if no mesh was loaded, or if the developer decides to load a different mesh
         * A shortened version of controller -> motion controller -> on mesh loaded.
         */
        this.onMeshLoadedObservable = new Observable();
        /**
         * Observers registered here will trigger when a motion controller profile was assigned to this xr controller
         */
        this.onMotionControllerInitObservable = new Observable();
        this._uniqueId = "controller-".concat(idCount++, "-").concat(inputSource.targetRayMode, "-").concat(inputSource.handedness);
        this.pointer = new AbstractMesh("".concat(this._uniqueId, "-pointer"), _scene);
        this.pointer.rotationQuaternion = new Quaternion();
        if (this.inputSource.gripSpace) {
            this.grip = new AbstractMesh("".concat(this._uniqueId, "-grip"), this._scene);
            this.grip.rotationQuaternion = new Quaternion();
        }
        this._tmpVector.set(0, 0, this._scene.useRightHandedSystem ? -1.0 : 1.0);
        // for now only load motion controllers if gamepad object available
        if (this.inputSource.gamepad && this.inputSource.targetRayMode === "tracked-pointer") {
            WebXRMotionControllerManager.GetMotionControllerWithXRInput(inputSource, _scene, this._options.forceControllerProfile).then(function (motionController) {
                _this.motionController = motionController;
                _this.onMotionControllerInitObservable.notifyObservers(motionController);
                // should the model be loaded?
                if (!_this._options.doNotLoadControllerMesh && !_this.motionController._doNotLoadControllerMesh) {
                    _this.motionController.loadModel().then(function (success) {
                        var _a;
                        if (success && _this.motionController && _this.motionController.rootMesh) {
                            if (_this._options.renderingGroupId) {
                                // anything other than 0?
                                _this.motionController.rootMesh.renderingGroupId = _this._options.renderingGroupId;
                                _this.motionController.rootMesh.getChildMeshes(false).forEach(function (mesh) { return (mesh.renderingGroupId = _this._options.renderingGroupId); });
                            }
                            _this.onMeshLoadedObservable.notifyObservers(_this.motionController.rootMesh);
                            _this.motionController.rootMesh.parent = _this.grip || _this.pointer;
                            _this.motionController.disableAnimation = !!_this._options.disableMotionControllerAnimation;
                        }
                        // make sure to dispose is the controller is already disposed
                        if (_this._disposed) {
                            (_a = _this.motionController) === null || _a === void 0 ? void 0 : _a.dispose();
                        }
                    });
                }
            }, function () {
                Tools.Warn("Could not find a matching motion controller for the registered input source");
            });
        }
    }
    Object.defineProperty(WebXRInputSource.prototype, "uniqueId", {
        /**
         * Get this controllers unique id
         */
        get: function () {
            return this._uniqueId;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of the object
     */
    WebXRInputSource.prototype.dispose = function () {
        if (this.grip) {
            this.grip.dispose(true);
        }
        if (this.motionController) {
            this.motionController.dispose();
        }
        this.pointer.dispose(true);
        this.onMotionControllerInitObservable.clear();
        this.onMeshLoadedObservable.clear();
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this._disposed = true;
    };
    /**
     * Gets a world space ray coming from the pointer or grip
     * @param result the resulting ray
     * @param gripIfAvailable use the grip mesh instead of the pointer, if available
     */
    WebXRInputSource.prototype.getWorldPointerRayToRef = function (result, gripIfAvailable) {
        if (gripIfAvailable === void 0) { gripIfAvailable = false; }
        var object = gripIfAvailable && this.grip ? this.grip : this.pointer;
        Vector3.TransformNormalToRef(this._tmpVector, object.getWorldMatrix(), result.direction);
        result.direction.normalize();
        result.origin.copyFrom(object.absolutePosition);
        result.length = 1000;
    };
    /**
     * Updates the controller pose based on the given XRFrame
     * @param xrFrame xr frame to update the pose with
     * @param referenceSpace reference space to use
     * @param xrCamera the xr camera, used for parenting
     */
    WebXRInputSource.prototype.updateFromXRFrame = function (xrFrame, referenceSpace, xrCamera) {
        var pose = xrFrame.getPose(this.inputSource.targetRaySpace, referenceSpace);
        this._lastXRPose = pose;
        // Update the pointer mesh
        if (pose) {
            var pos = pose.transform.position;
            this.pointer.position.set(pos.x, pos.y, pos.z);
            var orientation_1 = pose.transform.orientation;
            this.pointer.rotationQuaternion.set(orientation_1.x, orientation_1.y, orientation_1.z, orientation_1.w);
            if (!this._scene.useRightHandedSystem) {
                this.pointer.position.z *= -1;
                this.pointer.rotationQuaternion.z *= -1;
                this.pointer.rotationQuaternion.w *= -1;
            }
            this.pointer.parent = xrCamera.parent;
        }
        // Update the grip mesh if it exists
        if (this.inputSource.gripSpace && this.grip) {
            var pose_1 = xrFrame.getPose(this.inputSource.gripSpace, referenceSpace);
            if (pose_1) {
                var pos = pose_1.transform.position;
                var orientation_2 = pose_1.transform.orientation;
                this.grip.position.set(pos.x, pos.y, pos.z);
                this.grip.rotationQuaternion.set(orientation_2.x, orientation_2.y, orientation_2.z, orientation_2.w);
                if (!this._scene.useRightHandedSystem) {
                    this.grip.position.z *= -1;
                    this.grip.rotationQuaternion.z *= -1;
                    this.grip.rotationQuaternion.w *= -1;
                }
            }
            this.grip.parent = xrCamera.parent;
        }
        if (this.motionController) {
            // either update buttons only or also position, if in gamepad mode
            this.motionController.updateFromXRFrame(xrFrame);
        }
    };
    return WebXRInputSource;
}());
export { WebXRInputSource };
//# sourceMappingURL=webXRInputSource.js.map