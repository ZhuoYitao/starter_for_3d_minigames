import { __extends } from "tslib";
import { Texture } from "../Materials/Textures/texture.js";
import { PostProcess } from "./postProcess.js";

import "../Shaders/fxaa.fragment.js";
import "../Shaders/fxaa.vertex.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { SerializationHelper } from "../Misc/decorators.js";
/**
 * Fxaa post process
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#fxaa
 */
var FxaaPostProcess = /** @class */ (function (_super) {
    __extends(FxaaPostProcess, _super);
    function FxaaPostProcess(name, options, camera, samplingMode, engine, reusable, textureType) {
        if (camera === void 0) { camera = null; }
        if (textureType === void 0) { textureType = 0; }
        var _this = _super.call(this, name, "fxaa", ["texelSize"], null, options, camera, samplingMode || Texture.BILINEAR_SAMPLINGMODE, engine, reusable, null, textureType, "fxaa", undefined, true) || this;
        var defines = _this._getDefines();
        _this.updateEffect(defines);
        _this.onApplyObservable.add(function (effect) {
            var texelSize = _this.texelSize;
            effect.setFloat2("texelSize", texelSize.x, texelSize.y);
        });
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "FxaaPostProcess" string
     */
    FxaaPostProcess.prototype.getClassName = function () {
        return "FxaaPostProcess";
    };
    FxaaPostProcess.prototype._getDefines = function () {
        var engine = this.getEngine();
        if (!engine) {
            return null;
        }
        var glInfo = engine.getGlInfo();
        if (glInfo && glInfo.renderer && glInfo.renderer.toLowerCase().indexOf("mali") > -1) {
            return "#define MALI 1\n";
        }
        return null;
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    FxaaPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new FxaaPostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    return FxaaPostProcess;
}(PostProcess));
export { FxaaPostProcess };
RegisterClass("BABYLON.FxaaPostProcess", FxaaPostProcess);
//# sourceMappingURL=fxaaPostProcess.js.map