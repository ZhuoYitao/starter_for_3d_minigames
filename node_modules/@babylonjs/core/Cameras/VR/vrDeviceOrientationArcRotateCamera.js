import { __extends } from "tslib";
import { Camera } from "../../Cameras/camera.js";
import { ArcRotateCamera } from "../../Cameras/arcRotateCamera.js";
import { VRCameraMetrics } from "./vrCameraMetrics.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { Node } from "../../node.js";
import { setVRRigMode } from "../RigModes/vrRigMode.js";
import "../Inputs/arcRotateCameraVRDeviceOrientationInput.js";
Node.AddNodeConstructor("VRDeviceOrientationArcRotateCamera", function (name, scene) {
    return function () { return new VRDeviceOrientationArcRotateCamera(name, 0, 0, 1.0, Vector3.Zero(), scene); };
});
/**
 * Camera used to simulate VR rendering (based on ArcRotateCamera)
 * @see https://doc.babylonjs.com/babylon101/cameras#vr-device-orientation-cameras
 */
var VRDeviceOrientationArcRotateCamera = /** @class */ (function (_super) {
    __extends(VRDeviceOrientationArcRotateCamera, _super);
    /**
     * Creates a new VRDeviceOrientationArcRotateCamera
     * @param name defines camera name
     * @param alpha defines the camera rotation along the longitudinal axis
     * @param beta defines the camera rotation along the latitudinal axis
     * @param radius defines the camera distance from its target
     * @param target defines the camera target
     * @param scene defines the scene the camera belongs to
     * @param compensateDistortion defines if the camera needs to compensate the lens distortion
     * @param vrCameraMetrics defines the vr metrics associated to the camera
     */
    function VRDeviceOrientationArcRotateCamera(name, alpha, beta, radius, target, scene, compensateDistortion, vrCameraMetrics) {
        if (compensateDistortion === void 0) { compensateDistortion = true; }
        if (vrCameraMetrics === void 0) { vrCameraMetrics = VRCameraMetrics.GetDefault(); }
        var _this = _super.call(this, name, alpha, beta, radius, target, scene) || this;
        _this._setRigMode = setVRRigMode.bind(null, _this);
        vrCameraMetrics.compensateDistortion = compensateDistortion;
        _this.setCameraRigMode(Camera.RIG_MODE_VR, { vrCameraMetrics: vrCameraMetrics });
        _this.inputs.addVRDeviceOrientation();
        return _this;
    }
    /**
     * Gets camera class name
     * @returns VRDeviceOrientationArcRotateCamera
     */
    VRDeviceOrientationArcRotateCamera.prototype.getClassName = function () {
        return "VRDeviceOrientationArcRotateCamera";
    };
    return VRDeviceOrientationArcRotateCamera;
}(ArcRotateCamera));
export { VRDeviceOrientationArcRotateCamera };
//# sourceMappingURL=vrDeviceOrientationArcRotateCamera.js.map