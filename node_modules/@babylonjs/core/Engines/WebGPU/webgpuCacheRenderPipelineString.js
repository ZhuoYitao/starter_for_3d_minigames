import { __extends } from "tslib";
import { WebGPUCacheRenderPipeline } from "./webgpuCacheRenderPipeline.js";
/**
 * Class not used, WebGPUCacheRenderPipelineTree is faster
 * @hidden
 */
var WebGPUCacheRenderPipelineString = /** @class */ (function (_super) {
    __extends(WebGPUCacheRenderPipelineString, _super);
    function WebGPUCacheRenderPipelineString() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WebGPUCacheRenderPipelineString.prototype._getRenderPipeline = function (param) {
        var hash = this._states.join();
        param.token = hash;
        param.pipeline = WebGPUCacheRenderPipelineString._Cache[hash];
    };
    WebGPUCacheRenderPipelineString.prototype._setRenderPipeline = function (param) {
        WebGPUCacheRenderPipelineString._Cache[param.token] = param.pipeline;
    };
    WebGPUCacheRenderPipelineString._Cache = {};
    return WebGPUCacheRenderPipelineString;
}(WebGPUCacheRenderPipeline));
export { WebGPUCacheRenderPipelineString };
//# sourceMappingURL=webgpuCacheRenderPipelineString.js.map