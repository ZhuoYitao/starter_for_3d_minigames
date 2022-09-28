import { __extends } from "tslib";
import { Camera } from "../../Cameras/camera.js";
import { UniversalCamera } from "../../Cameras/universalCamera.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { TargetCamera } from "../targetCamera.js";
import { TransformNode } from "../../Meshes/transformNode.js";
import { Viewport } from "../../Maths/math.viewport.js";
/**
 * Camera used to simulate stereoscopic rendering on real screens (based on UniversalCamera)
 * @see https://doc.babylonjs.com/features/cameras
 */
var StereoscopicScreenUniversalCamera = /** @class */ (function (_super) {
    __extends(StereoscopicScreenUniversalCamera, _super);
    /**
     * Creates a new StereoscopicScreenUniversalCamera
     * @param name defines camera name
     * @param position defines initial position
     * @param scene defines the hosting scene
     * @param distanceToProjectionPlane defines distance between each color axis. The rig cameras will receive this as their negative z position!
     * @param distanceBetweenEyes defines is stereoscopic is done side by side or over under
     */
    function StereoscopicScreenUniversalCamera(name, position, scene, distanceToProjectionPlane, distanceBetweenEyes) {
        if (distanceToProjectionPlane === void 0) { distanceToProjectionPlane = 1; }
        if (distanceBetweenEyes === void 0) { distanceBetweenEyes = 0.065; }
        var _this = _super.call(this, name, position, scene) || this;
        _this._distanceBetweenEyes = distanceBetweenEyes;
        _this._distanceToProjectionPlane = distanceToProjectionPlane;
        _this.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL, {
            stereoHalfAngle: 0,
        });
        _this._cameraRigParams.stereoHalfAngle = 0;
        _this._cameraRigParams.interaxialDistance = distanceBetweenEyes;
        return _this;
    }
    Object.defineProperty(StereoscopicScreenUniversalCamera.prototype, "distanceBetweenEyes", {
        /**
         * distance between the eyes
         */
        get: function () {
            return this._distanceBetweenEyes;
        },
        set: function (newValue) {
            this._distanceBetweenEyes = newValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StereoscopicScreenUniversalCamera.prototype, "distanceToProjectionPlane", {
        /**
         * Distance to projection plane (should be the same units the like distance between the eyes)
         */
        get: function () {
            return this._distanceToProjectionPlane;
        },
        set: function (newValue) {
            this._distanceToProjectionPlane = newValue;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets camera class name
     * @returns StereoscopicScreenUniversalCamera
     */
    StereoscopicScreenUniversalCamera.prototype.getClassName = function () {
        return "StereoscopicUniversalCamera";
    };
    /**
     * @param name
     * @hidden
     */
    StereoscopicScreenUniversalCamera.prototype.createRigCamera = function (name) {
        var camera = new TargetCamera(name, Vector3.Zero(), this.getScene());
        var transform = new TransformNode("tm_" + name, this.getScene());
        camera.parent = transform;
        transform.setPivotMatrix(Matrix.Identity(), false);
        camera.isRigCamera = true;
        camera.rigParent = this;
        return camera;
    };
    /**
     * @hidden
     */
    StereoscopicScreenUniversalCamera.prototype._updateRigCameras = function () {
        for (var cameraIndex = 0; cameraIndex < this._rigCameras.length; cameraIndex++) {
            var cam = this._rigCameras[cameraIndex];
            cam.minZ = this.minZ;
            cam.maxZ = this.maxZ;
            cam.fov = this.fov;
            cam.upVector.copyFrom(this.upVector);
            if (cam.rotationQuaternion) {
                cam.rotationQuaternion.copyFrom(this.rotationQuaternion);
            }
            else {
                cam.rotation.copyFrom(this.rotation);
            }
            this._updateCamera(this._rigCameras[cameraIndex], cameraIndex);
        }
    };
    StereoscopicScreenUniversalCamera.prototype._updateCamera = function (camera, cameraIndex) {
        var b = this.distanceBetweenEyes / 2;
        var z = b / this.distanceToProjectionPlane;
        camera.position.copyFrom(this.position);
        camera.position.addInPlaceFromFloats(cameraIndex === 0 ? -b : b, 0, -this._distanceToProjectionPlane);
        var transform = camera.parent;
        var m = transform.getPivotMatrix();
        m.setTranslationFromFloats(cameraIndex === 0 ? b : -b, 0, 0);
        m.setRowFromFloats(2, cameraIndex === 0 ? z : -z, 0, 1, 0);
        transform.setPivotMatrix(m, false);
    };
    StereoscopicScreenUniversalCamera.prototype._setRigMode = function () {
        this._rigCameras[0].viewport = new Viewport(0, 0, 0.5, 1);
        this._rigCameras[1].viewport = new Viewport(0.5, 0, 0.5, 1.0);
        for (var cameraIndex = 0; cameraIndex < this._rigCameras.length; cameraIndex++) {
            this._updateCamera(this._rigCameras[cameraIndex], cameraIndex);
        }
    };
    return StereoscopicScreenUniversalCamera;
}(UniversalCamera));
export { StereoscopicScreenUniversalCamera };
//# sourceMappingURL=stereoscopicScreenUniversalCamera.js.map