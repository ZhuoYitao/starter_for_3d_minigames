import { __extends } from "tslib";
import { Texture } from "../Materials/Textures/texture.js";
import { PostProcess } from "./postProcess.js";

import { Logger } from "../Misc/logger.js";
import "../Shaders/imageProcessing.fragment.js";
import "../Shaders/subSurfaceScattering.fragment.js";
import "../Shaders/postprocess.vertex.js";
/**
 * Sub surface scattering post process
 */
var SubSurfaceScatteringPostProcess = /** @class */ (function (_super) {
    __extends(SubSurfaceScatteringPostProcess, _super);
    function SubSurfaceScatteringPostProcess(name, scene, options, camera, samplingMode, engine, reusable, textureType) {
        if (camera === void 0) { camera = null; }
        if (textureType === void 0) { textureType = 0; }
        var _this = _super.call(this, name, "subSurfaceScattering", ["texelSize", "viewportSize", "metersPerUnit"], ["diffusionS", "diffusionD", "filterRadii", "irradianceSampler", "depthSampler", "albedoSampler"], options, camera, samplingMode || Texture.BILINEAR_SAMPLINGMODE, engine, reusable, null, textureType, "postprocess", undefined, true) || this;
        _this._scene = scene;
        _this.updateEffect();
        _this.onApplyObservable.add(function (effect) {
            if (!scene.prePassRenderer || !scene.subSurfaceConfiguration) {
                Logger.Error("PrePass and subsurface configuration needs to be enabled for subsurface scattering.");
                return;
            }
            var texelSize = _this.texelSize;
            effect.setFloat("metersPerUnit", scene.subSurfaceConfiguration.metersPerUnit);
            effect.setFloat2("texelSize", texelSize.x, texelSize.y);
            effect.setTexture("irradianceSampler", scene.prePassRenderer.getRenderTarget().textures[scene.prePassRenderer.getIndex(0)]);
            effect.setTexture("depthSampler", scene.prePassRenderer.getRenderTarget().textures[scene.prePassRenderer.getIndex(5)]);
            effect.setTexture("albedoSampler", scene.prePassRenderer.getRenderTarget().textures[scene.prePassRenderer.getIndex(7)]);
            effect.setFloat2("viewportSize", Math.tan(scene.activeCamera.fov / 2) * scene.getEngine().getAspectRatio(scene.activeCamera, true), Math.tan(scene.activeCamera.fov / 2));
            effect.setArray3("diffusionS", scene.subSurfaceConfiguration.ssDiffusionS);
            effect.setArray("diffusionD", scene.subSurfaceConfiguration.ssDiffusionD);
            effect.setArray("filterRadii", scene.subSurfaceConfiguration.ssFilterRadii);
        });
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "SubSurfaceScatteringPostProcess" string
     */
    SubSurfaceScatteringPostProcess.prototype.getClassName = function () {
        return "SubSurfaceScatteringPostProcess";
    };
    return SubSurfaceScatteringPostProcess;
}(PostProcess));
export { SubSurfaceScatteringPostProcess };
//# sourceMappingURL=subSurfaceScatteringPostProcess.js.map