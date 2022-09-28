import { __extends } from "tslib";
import { ExternalTexture } from "../../Materials/Textures/externalTexture.js";
/**
 * Nothing specific to WebGPU in this class, but the spec is not final yet so let's remove it later on
 * if it is not needed
 * @hidden
 **/
var WebGPUExternalTexture = /** @class */ (function (_super) {
    __extends(WebGPUExternalTexture, _super);
    function WebGPUExternalTexture(video) {
        return _super.call(this, video) || this;
    }
    return WebGPUExternalTexture;
}(ExternalTexture));
export { WebGPUExternalTexture };
//# sourceMappingURL=webgpuExternalTexture.js.map