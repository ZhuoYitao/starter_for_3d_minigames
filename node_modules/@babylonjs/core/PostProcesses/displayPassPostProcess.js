import { __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import "../Shaders/displayPass.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { SerializationHelper } from "../Misc/decorators.js";
/**
 * DisplayPassPostProcess which produces an output the same as it's input
 */
var DisplayPassPostProcess = /** @class */ (function (_super) {
    __extends(DisplayPassPostProcess, _super);
    /**
     * Creates the DisplayPassPostProcess
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     */
    function DisplayPassPostProcess(name, options, camera, samplingMode, engine, reusable) {
        return _super.call(this, name, "displayPass", ["passSampler"], ["passSampler"], options, camera, samplingMode, engine, reusable) || this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "DisplayPassPostProcess" string
     */
    DisplayPassPostProcess.prototype.getClassName = function () {
        return "DisplayPassPostProcess";
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    DisplayPassPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new DisplayPassPostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    return DisplayPassPostProcess;
}(PostProcess));
export { DisplayPassPostProcess };
RegisterClass("BABYLON.DisplayPassPostProcess", DisplayPassPostProcess);
//# sourceMappingURL=displayPassPostProcess.js.map