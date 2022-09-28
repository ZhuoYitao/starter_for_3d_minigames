import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";
import { Texture } from "../Materials/Textures/texture.js";
import "../Shaders/colorCorrection.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { SerializationHelper, serialize } from "../Misc/decorators.js";
/**
 *
 * This post-process allows the modification of rendered colors by using
 * a 'look-up table' (LUT). This effect is also called Color Grading.
 *
 * The object needs to be provided an url to a texture containing the color
 * look-up table: the texture must be 256 pixels wide and 16 pixels high.
 * Use an image editing software to tweak the LUT to match your needs.
 *
 * For an example of a color LUT, see here:
 * @see http://udn.epicgames.com/Three/rsrc/Three/ColorGrading/RGBTable16x1.png
 * For explanations on color grading, see here:
 * @see http://udn.epicgames.com/Three/ColorGrading.html
 *
 */
var ColorCorrectionPostProcess = /** @class */ (function (_super) {
    __extends(ColorCorrectionPostProcess, _super);
    function ColorCorrectionPostProcess(name, colorTableUrl, options, camera, samplingMode, engine, reusable) {
        var _this = _super.call(this, name, "colorCorrection", null, ["colorTable"], options, camera, samplingMode, engine, reusable) || this;
        _this._colorTableTexture = new Texture(colorTableUrl, camera.getScene(), true, false, Texture.TRILINEAR_SAMPLINGMODE);
        _this._colorTableTexture.anisotropicFilteringLevel = 1;
        _this._colorTableTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
        _this._colorTableTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
        _this.colorTableUrl = colorTableUrl;
        _this.onApply = function (effect) {
            effect.setTexture("colorTable", _this._colorTableTexture);
        };
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "ColorCorrectionPostProcess" string
     */
    ColorCorrectionPostProcess.prototype.getClassName = function () {
        return "ColorCorrectionPostProcess";
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    ColorCorrectionPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new ColorCorrectionPostProcess(parsedPostProcess.name, parsedPostProcess.colorTableUrl, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], ColorCorrectionPostProcess.prototype, "colorTableUrl", void 0);
    return ColorCorrectionPostProcess;
}(PostProcess));
export { ColorCorrectionPostProcess };
RegisterClass("BABYLON.ColorCorrectionPostProcess", ColorCorrectionPostProcess);
//# sourceMappingURL=colorCorrectionPostProcess.js.map