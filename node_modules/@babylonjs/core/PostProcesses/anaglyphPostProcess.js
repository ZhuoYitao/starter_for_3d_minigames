import { __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import "../Shaders/anaglyph.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * Postprocess used to generate anaglyphic rendering
 */
var AnaglyphPostProcess = /** @class */ (function (_super) {
    __extends(AnaglyphPostProcess, _super);
    /**
     * Creates a new AnaglyphPostProcess
     * @param name defines postprocess name
     * @param options defines creation options or target ratio scale
     * @param rigCameras defines cameras using this postprocess
     * @param samplingMode defines required sampling mode (BABYLON.Texture.NEAREST_SAMPLINGMODE by default)
     * @param engine defines hosting engine
     * @param reusable defines if the postprocess will be reused multiple times per frame
     */
    function AnaglyphPostProcess(name, options, rigCameras, samplingMode, engine, reusable) {
        var _this = _super.call(this, name, "anaglyph", null, ["leftSampler"], options, rigCameras[1], samplingMode, engine, reusable) || this;
        _this._passedProcess = rigCameras[0]._rigPostProcess;
        _this.onApplyObservable.add(function (effect) {
            effect.setTextureFromPostProcess("leftSampler", _this._passedProcess);
        });
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "AnaglyphPostProcess" string
     */
    AnaglyphPostProcess.prototype.getClassName = function () {
        return "AnaglyphPostProcess";
    };
    return AnaglyphPostProcess;
}(PostProcess));
export { AnaglyphPostProcess };
RegisterClass("BABYLON.AnaglyphPostProcess", AnaglyphPostProcess);
//# sourceMappingURL=anaglyphPostProcess.js.map