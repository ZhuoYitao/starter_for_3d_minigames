import { __extends } from "tslib";
import { Camera } from "../../Cameras/camera.js";
import { UniversalCamera } from "../../Cameras/universalCamera.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { Node } from "../../node.js";
import { setStereoscopicAnaglyphRigMode } from "../RigModes/stereoscopicAnaglyphRigMode.js";
Node.AddNodeConstructor("AnaglyphUniversalCamera", function (name, scene, options) {
    return function () { return new AnaglyphUniversalCamera(name, Vector3.Zero(), options.interaxial_distance, scene); };
});
/**
 * Camera used to simulate anaglyphic rendering (based on UniversalCamera)
 * @see https://doc.babylonjs.com/features/cameras#anaglyph-cameras
 */
var AnaglyphUniversalCamera = /** @class */ (function (_super) {
    __extends(AnaglyphUniversalCamera, _super);
    /**
     * Creates a new AnaglyphUniversalCamera
     * @param name defines camera name
     * @param position defines initial position
     * @param interaxialDistance defines distance between each color axis
     * @param scene defines the hosting scene
     */
    function AnaglyphUniversalCamera(name, position, interaxialDistance, scene) {
        var _this = _super.call(this, name, position, scene) || this;
        _this._setRigMode = setStereoscopicAnaglyphRigMode.bind(null, _this);
        _this.interaxialDistance = interaxialDistance;
        _this.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH, { interaxialDistance: interaxialDistance });
        return _this;
    }
    /**
     * Gets camera class name
     * @returns AnaglyphUniversalCamera
     */
    AnaglyphUniversalCamera.prototype.getClassName = function () {
        return "AnaglyphUniversalCamera";
    };
    return AnaglyphUniversalCamera;
}(UniversalCamera));
export { AnaglyphUniversalCamera };
//# sourceMappingURL=anaglyphUniversalCamera.js.map