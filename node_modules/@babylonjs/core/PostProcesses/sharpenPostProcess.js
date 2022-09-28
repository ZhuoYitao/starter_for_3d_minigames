import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";

import "../Shaders/sharpen.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
/**
 * The SharpenPostProcess applies a sharpen kernel to every pixel
 * See http://en.wikipedia.org/wiki/Kernel_(image_processing)
 */
var SharpenPostProcess = /** @class */ (function (_super) {
    __extends(SharpenPostProcess, _super);
    /**
     * Creates a new instance ConvolutionPostProcess
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
     */
    function SharpenPostProcess(name, options, camera, samplingMode, engine, reusable, textureType, blockCompilation) {
        if (textureType === void 0) { textureType = 0; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        var _this = _super.call(this, name, "sharpen", ["sharpnessAmounts", "screenSize"], null, options, camera, samplingMode, engine, reusable, null, textureType, undefined, null, blockCompilation) || this;
        /**
         * How much of the original color should be applied. Setting this to 0 will display edge detection. (default: 1)
         */
        _this.colorAmount = 1.0;
        /**
         * How much sharpness should be applied (default: 0.3)
         */
        _this.edgeAmount = 0.3;
        _this.onApply = function (effect) {
            effect.setFloat2("screenSize", _this.width, _this.height);
            effect.setFloat2("sharpnessAmounts", _this.edgeAmount, _this.colorAmount);
        };
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "SharpenPostProcess" string
     */
    SharpenPostProcess.prototype.getClassName = function () {
        return "SharpenPostProcess";
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    SharpenPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new SharpenPostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.textureType, parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], SharpenPostProcess.prototype, "colorAmount", void 0);
    __decorate([
        serialize()
    ], SharpenPostProcess.prototype, "edgeAmount", void 0);
    return SharpenPostProcess;
}(PostProcess));
export { SharpenPostProcess };
RegisterClass("BABYLON.SharpenPostProcess", SharpenPostProcess);
//# sourceMappingURL=sharpenPostProcess.js.map