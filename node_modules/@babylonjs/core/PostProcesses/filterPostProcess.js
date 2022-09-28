import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import "../Shaders/filter.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { serializeAsMatrix, SerializationHelper } from "../Misc/decorators.js";
/**
 * Applies a kernel filter to the image
 */
var FilterPostProcess = /** @class */ (function (_super) {
    __extends(FilterPostProcess, _super);
    /**
     *
     * @param name The name of the effect.
     * @param kernelMatrix The matrix to be applied to the image
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     */
    function FilterPostProcess(name, kernelMatrix, options, camera, samplingMode, engine, reusable) {
        var _this = _super.call(this, name, "filter", ["kernelMatrix"], null, options, camera, samplingMode, engine, reusable) || this;
        _this.kernelMatrix = kernelMatrix;
        _this.onApply = function (effect) {
            effect.setMatrix("kernelMatrix", _this.kernelMatrix);
        };
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "FilterPostProcess" string
     */
    FilterPostProcess.prototype.getClassName = function () {
        return "FilterPostProcess";
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    FilterPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new FilterPostProcess(parsedPostProcess.name, parsedPostProcess.kernelMatrix, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serializeAsMatrix()
    ], FilterPostProcess.prototype, "kernelMatrix", void 0);
    return FilterPostProcess;
}(PostProcess));
export { FilterPostProcess };
RegisterClass("BABYLON.FilterPostProcess", FilterPostProcess);
//# sourceMappingURL=filterPostProcess.js.map