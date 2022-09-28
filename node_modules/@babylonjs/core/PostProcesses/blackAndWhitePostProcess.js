import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import "../Shaders/blackAndWhite.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
/**
 * Post process used to render in black and white
 */
var BlackAndWhitePostProcess = /** @class */ (function (_super) {
    __extends(BlackAndWhitePostProcess, _super);
    /**
     * Creates a black and white post process
     * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#black-and-white
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     */
    function BlackAndWhitePostProcess(name, options, camera, samplingMode, engine, reusable) {
        var _this = _super.call(this, name, "blackAndWhite", ["degree"], null, options, camera, samplingMode, engine, reusable) || this;
        /**
         * Linear about to convert he result to black and white (default: 1)
         */
        _this.degree = 1;
        _this.onApplyObservable.add(function (effect) {
            effect.setFloat("degree", _this.degree);
        });
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "BlackAndWhitePostProcess" string
     */
    BlackAndWhitePostProcess.prototype.getClassName = function () {
        return "BlackAndWhitePostProcess";
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    BlackAndWhitePostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new BlackAndWhitePostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], BlackAndWhitePostProcess.prototype, "degree", void 0);
    return BlackAndWhitePostProcess;
}(PostProcess));
export { BlackAndWhitePostProcess };
RegisterClass("BABYLON.BlackAndWhitePostProcess", BlackAndWhitePostProcess);
//# sourceMappingURL=blackAndWhitePostProcess.js.map