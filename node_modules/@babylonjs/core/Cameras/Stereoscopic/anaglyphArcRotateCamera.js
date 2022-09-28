import { __extends } from "tslib";
import { Camera } from "../../Cameras/camera.js";
import { ArcRotateCamera } from "../../Cameras/arcRotateCamera.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { Node } from "../../node.js";
import { setStereoscopicAnaglyphRigMode } from "../RigModes/stereoscopicAnaglyphRigMode.js";
Node.AddNodeConstructor("AnaglyphArcRotateCamera", function (name, scene, options) {
    return function () { return new AnaglyphArcRotateCamera(name, 0, 0, 1.0, Vector3.Zero(), options.interaxial_distance, scene); };
});
/**
 * Camera used to simulate anaglyphic rendering (based on ArcRotateCamera)
 * @see https://doc.babylonjs.com/features/cameras#anaglyph-cameras
 */
var AnaglyphArcRotateCamera = /** @class */ (function (_super) {
    __extends(AnaglyphArcRotateCamera, _super);
    /**
     * Creates a new AnaglyphArcRotateCamera
     * @param name defines camera name
     * @param alpha defines alpha angle (in radians)
     * @param beta defines beta angle (in radians)
     * @param radius defines radius
     * @param target defines camera target
     * @param interaxialDistance defines distance between each color axis
     * @param scene defines the hosting scene
     */
    function AnaglyphArcRotateCamera(name, alpha, beta, radius, target, interaxialDistance, scene) {
        var _this = _super.call(this, name, alpha, beta, radius, target, scene) || this;
        _this._setRigMode = setStereoscopicAnaglyphRigMode.bind(null, _this);
        _this.interaxialDistance = interaxialDistance;
        _this.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH, { interaxialDistance: interaxialDistance });
        return _this;
    }
    /**
     * Gets camera class name
     * @returns AnaglyphArcRotateCamera
     */
    AnaglyphArcRotateCamera.prototype.getClassName = function () {
        return "AnaglyphArcRotateCamera";
    };
    return AnaglyphArcRotateCamera;
}(ArcRotateCamera));
export { AnaglyphArcRotateCamera };
//# sourceMappingURL=anaglyphArcRotateCamera.js.map