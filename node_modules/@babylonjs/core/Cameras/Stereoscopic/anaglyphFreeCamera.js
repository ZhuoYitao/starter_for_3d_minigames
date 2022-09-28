import { __extends } from "tslib";
import { Camera } from "../../Cameras/camera.js";
import { FreeCamera } from "../../Cameras/freeCamera.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { Node } from "../../node.js";
import { setStereoscopicAnaglyphRigMode } from "../RigModes/stereoscopicAnaglyphRigMode.js";
Node.AddNodeConstructor("AnaglyphFreeCamera", function (name, scene, options) {
    return function () { return new AnaglyphFreeCamera(name, Vector3.Zero(), options.interaxial_distance, scene); };
});
/**
 * Camera used to simulate anaglyphic rendering (based on FreeCamera)
 * @see https://doc.babylonjs.com/features/cameras#anaglyph-cameras
 */
var AnaglyphFreeCamera = /** @class */ (function (_super) {
    __extends(AnaglyphFreeCamera, _super);
    /**
     * Creates a new AnaglyphFreeCamera
     * @param name defines camera name
     * @param position defines initial position
     * @param interaxialDistance defines distance between each color axis
     * @param scene defines the hosting scene
     */
    function AnaglyphFreeCamera(name, position, interaxialDistance, scene) {
        var _this = _super.call(this, name, position, scene) || this;
        _this._setRigMode = setStereoscopicAnaglyphRigMode.bind(null, _this);
        _this.interaxialDistance = interaxialDistance;
        _this.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH, { interaxialDistance: interaxialDistance });
        return _this;
    }
    /**
     * Gets camera class name
     * @returns AnaglyphFreeCamera
     */
    AnaglyphFreeCamera.prototype.getClassName = function () {
        return "AnaglyphFreeCamera";
    };
    return AnaglyphFreeCamera;
}(FreeCamera));
export { AnaglyphFreeCamera };
//# sourceMappingURL=anaglyphFreeCamera.js.map