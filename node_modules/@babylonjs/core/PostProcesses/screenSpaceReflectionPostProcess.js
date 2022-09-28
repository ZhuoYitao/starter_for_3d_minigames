import { __decorate, __extends } from "tslib";
import { PostProcess } from "./postProcess.js";

import { GeometryBufferRenderer } from "../Rendering/geometryBufferRenderer.js";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
import { ScreenSpaceReflectionsConfiguration } from "../Rendering/screenSpaceReflectionsConfiguration.js";
import "../Shaders/screenSpaceReflection.fragment.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * The ScreenSpaceReflectionPostProcess performs realtime reflections using only and only the available informations on the screen (positions and normals).
 * Basically, the screen space reflection post-process will compute reflections according the material's reflectivity.
 */
var ScreenSpaceReflectionPostProcess = /** @class */ (function (_super) {
    __extends(ScreenSpaceReflectionPostProcess, _super);
    /**
     * Creates a new instance of ScreenSpaceReflectionPostProcess.
     * @param name The name of the effect.
     * @param scene The scene containing the objects to calculate reflections.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: true)
     * @param forceGeometryBuffer If this post process should use geometry buffer instead of prepass (default: false)
     */
    function ScreenSpaceReflectionPostProcess(name, scene, options, camera, samplingMode, engine, reusable, textureType, blockCompilation, forceGeometryBuffer) {
        if (textureType === void 0) { textureType = 0; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        if (forceGeometryBuffer === void 0) { forceGeometryBuffer = false; }
        var _this = _super.call(this, name, "screenSpaceReflection", ["projection", "view", "threshold", "reflectionSpecularFalloffExponent", "strength", "stepSize", "roughnessFactor"], ["textureSampler", "normalSampler", "positionSampler", "reflectivitySampler"], options, camera, samplingMode, engine, reusable, "#define SSR_SUPPORTED\n#define REFLECTION_SAMPLES 64\n#define SMOOTH_STEPS 5\n", textureType, undefined, null, blockCompilation) || this;
        /**
         * Gets or sets a reflection threshold mainly used to adjust the reflection's height.
         */
        _this.threshold = 1.2;
        /**
         * Gets or sets the current reflection strength. 1.0 is an ideal value but can be increased/decreased for particular results.
         */
        _this.strength = 1;
        /**
         * Gets or sets the falloff exponent used while computing fresnel. More the exponent is high, more the reflections will be discrete.
         */
        _this.reflectionSpecularFalloffExponent = 3;
        /**
         * Gets or sets the step size used to iterate until the effect finds the color of the reflection's pixel. Typically in interval [0.1, 1.0]
         */
        _this.step = 1.0;
        /**
         * Gets or sets the factor applied when computing roughness. Default value is 0.2.
         */
        _this.roughnessFactor = 0.2;
        _this._forceGeometryBuffer = false;
        _this._enableSmoothReflections = false;
        _this._reflectionSamples = 64;
        _this._smoothSteps = 5;
        _this._forceGeometryBuffer = forceGeometryBuffer;
        if (_this._forceGeometryBuffer) {
            // Get geometry buffer renderer and update effect
            var geometryBufferRenderer = scene.enableGeometryBufferRenderer();
            if (geometryBufferRenderer) {
                if (geometryBufferRenderer.isSupported) {
                    geometryBufferRenderer.enablePosition = true;
                    geometryBufferRenderer.enableReflectivity = true;
                }
            }
        }
        else {
            var prePassRenderer = scene.enablePrePassRenderer();
            prePassRenderer === null || prePassRenderer === void 0 ? void 0 : prePassRenderer.markAsDirty();
            _this._prePassEffectConfiguration = new ScreenSpaceReflectionsConfiguration();
        }
        _this._updateEffectDefines();
        // On apply, send uniforms
        _this.onApply = function (effect) {
            var geometryBufferRenderer = _this._geometryBufferRenderer;
            var prePassRenderer = _this._prePassRenderer;
            if (!prePassRenderer && !geometryBufferRenderer) {
                return;
            }
            if (geometryBufferRenderer) {
                // Samplers
                var positionIndex = geometryBufferRenderer.getTextureIndex(GeometryBufferRenderer.POSITION_TEXTURE_TYPE);
                var roughnessIndex = geometryBufferRenderer.getTextureIndex(GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE);
                effect.setTexture("normalSampler", geometryBufferRenderer.getGBuffer().textures[1]);
                effect.setTexture("positionSampler", geometryBufferRenderer.getGBuffer().textures[positionIndex]);
                effect.setTexture("reflectivitySampler", geometryBufferRenderer.getGBuffer().textures[roughnessIndex]);
            }
            else if (prePassRenderer) {
                // Samplers
                var positionIndex = prePassRenderer.getIndex(1);
                var roughnessIndex = prePassRenderer.getIndex(3);
                var normalIndex = prePassRenderer.getIndex(6);
                effect.setTexture("normalSampler", prePassRenderer.getRenderTarget().textures[normalIndex]);
                effect.setTexture("positionSampler", prePassRenderer.getRenderTarget().textures[positionIndex]);
                effect.setTexture("reflectivitySampler", prePassRenderer.getRenderTarget().textures[roughnessIndex]);
            }
            // Uniforms
            var camera = scene.activeCamera;
            if (!camera) {
                return;
            }
            var viewMatrix = camera.getViewMatrix(true);
            var projectionMatrix = camera.getProjectionMatrix(true);
            effect.setMatrix("projection", projectionMatrix);
            effect.setMatrix("view", viewMatrix);
            effect.setFloat("threshold", _this.threshold);
            effect.setFloat("reflectionSpecularFalloffExponent", _this.reflectionSpecularFalloffExponent);
            effect.setFloat("strength", _this.strength);
            effect.setFloat("stepSize", _this.step);
            effect.setFloat("roughnessFactor", _this.roughnessFactor);
        };
        _this._isSceneRightHanded = scene.useRightHandedSystem;
        return _this;
    }
    Object.defineProperty(ScreenSpaceReflectionPostProcess.prototype, "_geometryBufferRenderer", {
        get: function () {
            if (!this._forceGeometryBuffer) {
                return null;
            }
            return this._scene.geometryBufferRenderer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceReflectionPostProcess.prototype, "_prePassRenderer", {
        get: function () {
            if (this._forceGeometryBuffer) {
                return null;
            }
            return this._scene.prePassRenderer;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets a string identifying the name of the class
     * @returns "ScreenSpaceReflectionPostProcess" string
     */
    ScreenSpaceReflectionPostProcess.prototype.getClassName = function () {
        return "ScreenSpaceReflectionPostProcess";
    };
    Object.defineProperty(ScreenSpaceReflectionPostProcess.prototype, "enableSmoothReflections", {
        /**
         * Gets whether or not smoothing reflections is enabled.
         * Enabling smoothing will require more GPU power and can generate a drop in FPS.
         */
        get: function () {
            return this._enableSmoothReflections;
        },
        /**
         * Sets whether or not smoothing reflections is enabled.
         * Enabling smoothing will require more GPU power and can generate a drop in FPS.
         */
        set: function (enabled) {
            if (enabled === this._enableSmoothReflections) {
                return;
            }
            this._enableSmoothReflections = enabled;
            this._updateEffectDefines();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceReflectionPostProcess.prototype, "reflectionSamples", {
        /**
         * Gets the number of samples taken while computing reflections. More samples count is high,
         * more the post-process wil require GPU power and can generate a drop in FPS. Basically in interval [25, 100].
         */
        get: function () {
            return this._reflectionSamples;
        },
        /**
         * Sets the number of samples taken while computing reflections. More samples count is high,
         * more the post-process wil require GPU power and can generate a drop in FPS. Basically in interval [25, 100].
         */
        set: function (samples) {
            if (samples === this._reflectionSamples) {
                return;
            }
            this._reflectionSamples = samples;
            this._updateEffectDefines();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceReflectionPostProcess.prototype, "smoothSteps", {
        /**
         * Gets the number of samples taken while smoothing reflections. More samples count is high,
         * more the post-process will require GPU power and can generate a drop in FPS.
         * Default value (5.0) work pretty well in all cases but can be adjusted.
         */
        get: function () {
            return this._smoothSteps;
        },
        /*
         * Sets the number of samples taken while smoothing reflections. More samples count is high,
         * more the post-process will require GPU power and can generate a drop in FPS.
         * Default value (5.0) work pretty well in all cases but can be adjusted.
         */
        set: function (steps) {
            if (steps === this._smoothSteps) {
                return;
            }
            this._smoothSteps = steps;
            this._updateEffectDefines();
        },
        enumerable: false,
        configurable: true
    });
    ScreenSpaceReflectionPostProcess.prototype._updateEffectDefines = function () {
        var defines = [];
        if (this._geometryBufferRenderer || this._prePassRenderer) {
            defines.push("#define SSR_SUPPORTED");
        }
        if (this._enableSmoothReflections) {
            defines.push("#define ENABLE_SMOOTH_REFLECTIONS");
        }
        if (this._isSceneRightHanded) {
            defines.push("#define RIGHT_HANDED_SCENE");
        }
        defines.push("#define REFLECTION_SAMPLES " + (this._reflectionSamples >> 0));
        defines.push("#define SMOOTH_STEPS " + (this._smoothSteps >> 0));
        this.updateEffect(defines.join("\n"));
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    ScreenSpaceReflectionPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new ScreenSpaceReflectionPostProcess(parsedPostProcess.name, scene, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.textureType, parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "threshold", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "strength", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "reflectionSpecularFalloffExponent", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "step", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "roughnessFactor", void 0);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "enableSmoothReflections", null);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "reflectionSamples", null);
    __decorate([
        serialize()
    ], ScreenSpaceReflectionPostProcess.prototype, "smoothSteps", null);
    return ScreenSpaceReflectionPostProcess;
}(PostProcess));
export { ScreenSpaceReflectionPostProcess };
RegisterClass("BABYLON.ScreenSpaceReflectionPostProcess", ScreenSpaceReflectionPostProcess);
//# sourceMappingURL=screenSpaceReflectionPostProcess.js.map