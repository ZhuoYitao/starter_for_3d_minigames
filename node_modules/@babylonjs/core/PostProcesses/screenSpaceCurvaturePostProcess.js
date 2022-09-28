import { __decorate, __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { PostProcess } from "./postProcess.js";

import "../Rendering/geometryBufferRendererSceneComponent.js";
import "../Shaders/screenSpaceCurvature.fragment.js";
import { EngineStore } from "../Engines/engineStore.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
/**
 * The Screen Space curvature effect can help highlighting ridge and valley of a model.
 */
var ScreenSpaceCurvaturePostProcess = /** @class */ (function (_super) {
    __extends(ScreenSpaceCurvaturePostProcess, _super);
    /**
     * Creates a new instance ScreenSpaceCurvaturePostProcess
     * @param name The name of the effect.
     * @param scene The scene containing the objects to blur according to their velocity.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
     */
    function ScreenSpaceCurvaturePostProcess(name, scene, options, camera, samplingMode, engine, reusable, textureType, blockCompilation) {
        if (textureType === void 0) { textureType = 0; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        var _this = _super.call(this, name, "screenSpaceCurvature", ["curvature_ridge", "curvature_valley"], ["textureSampler", "normalSampler"], options, camera, samplingMode, engine, reusable, undefined, textureType, undefined, null, blockCompilation) || this;
        /**
         * Defines how much ridge the curvature effect displays.
         */
        _this.ridge = 1;
        /**
         * Defines how much valley the curvature effect displays.
         */
        _this.valley = 1;
        _this._geometryBufferRenderer = scene.enableGeometryBufferRenderer();
        if (!_this._geometryBufferRenderer) {
            // Geometry buffer renderer is not supported. So, work as a passthrough.
            Logger.Error("Multiple Render Target support needed for screen space curvature post process. Please use IsSupported test first.");
        }
        else {
            // Geometry buffer renderer is supported.
            _this.onApply = function (effect) {
                effect.setFloat("curvature_ridge", 0.5 / Math.max(_this.ridge * _this.ridge, 1e-4));
                effect.setFloat("curvature_valley", 0.7 / Math.max(_this.valley * _this.valley, 1e-4));
                var normalTexture = _this._geometryBufferRenderer.getGBuffer().textures[1];
                effect.setTexture("normalSampler", normalTexture);
            };
        }
        return _this;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "ScreenSpaceCurvaturePostProcess" string
     */
    ScreenSpaceCurvaturePostProcess.prototype.getClassName = function () {
        return "ScreenSpaceCurvaturePostProcess";
    };
    Object.defineProperty(ScreenSpaceCurvaturePostProcess, "IsSupported", {
        /**
         * Support test.
         */
        get: function () {
            var engine = EngineStore.LastCreatedEngine;
            if (!engine) {
                return false;
            }
            return engine.getCaps().drawBuffersExtension;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    ScreenSpaceCurvaturePostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new ScreenSpaceCurvaturePostProcess(parsedPostProcess.name, scene, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.textureType, parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], ScreenSpaceCurvaturePostProcess.prototype, "ridge", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceCurvaturePostProcess.prototype, "valley", void 0);
    return ScreenSpaceCurvaturePostProcess;
}(PostProcess));
export { ScreenSpaceCurvaturePostProcess };
RegisterClass("BABYLON.ScreenSpaceCurvaturePostProcess", ScreenSpaceCurvaturePostProcess);
//# sourceMappingURL=screenSpaceCurvaturePostProcess.js.map