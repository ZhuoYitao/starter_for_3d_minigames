import { __extends } from "tslib";
import { Color4 } from "../../Maths/math.color.js";
import { ShaderMaterial } from "../shaderMaterial.js";
import "../../Shaders/color.fragment.js";
import "../../Shaders/color.vertex.js";
/**
 * A material to use for fast depth-only rendering.
 * @since 5.0.0
 */
var OcclusionMaterial = /** @class */ (function (_super) {
    __extends(OcclusionMaterial, _super);
    function OcclusionMaterial(name, scene) {
        var _this = _super.call(this, name, scene, "color", {
            attributes: ["position"],
            uniforms: ["world", "viewProjection", "color"],
        }) || this;
        _this.disableColorWrite = true;
        _this.forceDepthWrite = true;
        _this.setColor4("color", new Color4(0, 0, 0, 1));
        return _this;
    }
    return OcclusionMaterial;
}(ShaderMaterial));
export { OcclusionMaterial };
//# sourceMappingURL=occlusionMaterial.js.map