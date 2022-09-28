import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import { ToGammaSpace } from "../Maths/math.constants.js";

import "../Shaders/extractHighlights.fragment.js";
import { serialize } from "../Misc/decorators.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * The extract highlights post process sets all pixels to black except pixels above the specified luminance threshold. Used as the first step for a bloom effect.
 */
var ExtractHighlightsPostProcess = /** @class */ (function (_super) {
    __extends(ExtractHighlightsPostProcess, _super);
    function ExtractHighlightsPostProcess(name, options, camera, samplingMode, engine, reusable, textureType, blockCompilation) {
        if (textureType === void 0) { textureType = 0; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        var _this = _super.call(this, name, "extractHighlights", ["threshold", "exposure"], null, options, camera, samplingMode, engine, reusable, null, textureType, undefined, null, blockCompilation) || this;
        /**
         * The luminance threshold, pixels below this value will be set to black.
         */
        _this.threshold = 0.9;
        /** @hidden */
        _this._exposure = 1;
        /**
         * Post process which has the input texture to be used when performing highlight extraction
         * @hidden
         */
        _this._inputPostProcess = null;
        _this.onApplyObservable.add(function (effect) {
            _this.externalTextureSamplerBinding = !!_this._inputPostProcess;
            if (_this._inputPostProcess) {
                effect.setTextureFromPostProcess("textureSampler", _this._inputPostProcess);
            }
            effect.setFloat("threshold", Math.pow(_this.threshold, ToGammaSpace));
            effect.setFloat("exposure", _this._exposure);
        });
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "ExtractHighlightsPostProcess" string
     */
    ExtractHighlightsPostProcess.prototype.getClassName = function () {
        return "ExtractHighlightsPostProcess";
    };
    __decorate([
        serialize()
    ], ExtractHighlightsPostProcess.prototype, "threshold", void 0);
    return ExtractHighlightsPostProcess;
}(PostProcess));
export { ExtractHighlightsPostProcess };
RegisterClass("BABYLON.ExtractHighlightsPostProcess", ExtractHighlightsPostProcess);
//# sourceMappingURL=extractHighlightsPostProcess.js.map