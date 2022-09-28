import { __decorate, __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { Matrix, Vector2 } from "../Maths/math.vector.js";
import { PostProcess } from "./postProcess.js";

import { GeometryBufferRenderer } from "../Rendering/geometryBufferRenderer.js";
import { MotionBlurConfiguration } from "../Rendering/motionBlurConfiguration.js";
import "../Animations/animatable.js";
import "../Rendering/geometryBufferRendererSceneComponent.js";
import "../Shaders/motionBlur.fragment.js";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * The Motion Blur Post Process which blurs an image based on the objects velocity in scene.
 * Velocity can be affected by each object's rotation, position and scale depending on the transformation speed.
 * As an example, all you have to do is to create the post-process:
 *  var mb = new BABYLON.MotionBlurPostProcess(
 *      'mb', // The name of the effect.
 *      scene, // The scene containing the objects to blur according to their velocity.
 *      1.0, // The required width/height ratio to downsize to before computing the render pass.
 *      camera // The camera to apply the render pass to.
 * );
 * Then, all objects moving, rotating and/or scaling will be blurred depending on the transformation speed.
 */
var MotionBlurPostProcess = /** @class */ (function (_super) {
    __extends(MotionBlurPostProcess, _super);
    /**
     * Creates a new instance MotionBlurPostProcess
     * @param name The name of the effect.
     * @param scene The scene containing the objects to blur according to their velocity.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: true)
     * @param forceGeometryBuffer If this post process should use geometry buffer instead of prepass (default: false)
     */
    function MotionBlurPostProcess(name, scene, options, camera, samplingMode, engine, reusable, textureType, blockCompilation, forceGeometryBuffer) {
        if (textureType === void 0) { textureType = 0; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        if (forceGeometryBuffer === void 0) { forceGeometryBuffer = false; }
        var _this = _super.call(this, name, "motionBlur", ["motionStrength", "motionScale", "screenSize", "inverseViewProjection", "prevViewProjection"], ["velocitySampler"], options, camera, samplingMode, engine, reusable, "#define GEOMETRY_SUPPORTED\n#define SAMPLES 64.0\n#define OBJECT_BASED", textureType, undefined, null, blockCompilation) || this;
        /**
         * Defines how much the image is blurred by the movement. Default value is equal to 1
         */
        _this.motionStrength = 1;
        _this._motionBlurSamples = 32;
        _this._isObjectBased = true;
        _this._forceGeometryBuffer = false;
        _this._invViewProjection = null;
        _this._previousViewProjection = null;
        _this._forceGeometryBuffer = forceGeometryBuffer;
        // Set up assets
        if (_this._forceGeometryBuffer) {
            scene.enableGeometryBufferRenderer();
            if (_this._geometryBufferRenderer) {
                _this._geometryBufferRenderer.enableVelocity = true;
            }
        }
        else {
            scene.enablePrePassRenderer();
            if (_this._prePassRenderer) {
                _this._prePassRenderer.markAsDirty();
                _this._prePassEffectConfiguration = new MotionBlurConfiguration();
            }
        }
        _this._applyMode();
        return _this;
    }
    Object.defineProperty(MotionBlurPostProcess.prototype, "motionBlurSamples", {
        /**
         * Gets the number of iterations are used for motion blur quality. Default value is equal to 32
         */
        get: function () {
            return this._motionBlurSamples;
        },
        /**
         * Sets the number of iterations to be used for motion blur quality
         */
        set: function (samples) {
            this._motionBlurSamples = samples;
            this._updateEffect();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MotionBlurPostProcess.prototype, "isObjectBased", {
        /**
         * Gets whether or not the motion blur post-process is in object based mode.
         */
        get: function () {
            return this._isObjectBased;
        },
        /**
         * Sets whether or not the motion blur post-process is in object based mode.
         */
        set: function (value) {
            if (this._isObjectBased === value) {
                return;
            }
            this._isObjectBased = value;
            this._applyMode();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MotionBlurPostProcess.prototype, "_geometryBufferRenderer", {
        get: function () {
            if (!this._forceGeometryBuffer) {
                return null;
            }
            return this._scene.geometryBufferRenderer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MotionBlurPostProcess.prototype, "_prePassRenderer", {
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
     * @returns "MotionBlurPostProcess" string
     */
    MotionBlurPostProcess.prototype.getClassName = function () {
        return "MotionBlurPostProcess";
    };
    /**
     * Excludes the given skinned mesh from computing bones velocities.
     * Computing bones velocities can have a cost and that cost. The cost can be saved by calling this function and by passing the skinned mesh reference to ignore.
     * @param skinnedMesh The mesh containing the skeleton to ignore when computing the velocity map.
     */
    MotionBlurPostProcess.prototype.excludeSkinnedMesh = function (skinnedMesh) {
        if (skinnedMesh.skeleton) {
            var list = void 0;
            if (this._geometryBufferRenderer) {
                list = this._geometryBufferRenderer.excludedSkinnedMeshesFromVelocity;
            }
            else if (this._prePassRenderer) {
                list = this._prePassRenderer.excludedSkinnedMesh;
            }
            else {
                return;
            }
            list.push(skinnedMesh);
        }
    };
    /**
     * Removes the given skinned mesh from the excluded meshes to integrate bones velocities while rendering the velocity map.
     * @param skinnedMesh The mesh containing the skeleton that has been ignored previously.
     * @see excludeSkinnedMesh to exclude a skinned mesh from bones velocity computation.
     */
    MotionBlurPostProcess.prototype.removeExcludedSkinnedMesh = function (skinnedMesh) {
        if (skinnedMesh.skeleton) {
            var list = void 0;
            if (this._geometryBufferRenderer) {
                list = this._geometryBufferRenderer.excludedSkinnedMeshesFromVelocity;
            }
            else if (this._prePassRenderer) {
                list = this._prePassRenderer.excludedSkinnedMesh;
            }
            else {
                return;
            }
            var index = list.indexOf(skinnedMesh);
            if (index !== -1) {
                list.splice(index, 1);
            }
        }
    };
    /**
     * Disposes the post process.
     * @param camera The camera to dispose the post process on.
     */
    MotionBlurPostProcess.prototype.dispose = function (camera) {
        if (this._geometryBufferRenderer) {
            // Clear previous transformation matrices dictionary used to compute objects velocities
            this._geometryBufferRenderer._previousTransformationMatrices = {};
            this._geometryBufferRenderer._previousBonesTransformationMatrices = {};
            this._geometryBufferRenderer.excludedSkinnedMeshesFromVelocity = [];
        }
        _super.prototype.dispose.call(this, camera);
    };
    /**
     * Called on the mode changed (object based or screen based).
     */
    MotionBlurPostProcess.prototype._applyMode = function () {
        var _this = this;
        if (!this._geometryBufferRenderer && !this._prePassRenderer) {
            // We can't get a velocity or depth texture. So, work as a passthrough.
            Logger.Warn("Multiple Render Target support needed to compute object based motion blur");
            return this.updateEffect();
        }
        this._updateEffect();
        this._invViewProjection = null;
        this._previousViewProjection = null;
        if (this.isObjectBased) {
            if (this._prePassRenderer && this._prePassEffectConfiguration) {
                this._prePassEffectConfiguration.texturesRequired[0] = 2;
            }
            this.onApply = function (effect) { return _this._onApplyObjectBased(effect); };
        }
        else {
            this._invViewProjection = Matrix.Identity();
            this._previousViewProjection = Matrix.Identity();
            if (this._prePassRenderer && this._prePassEffectConfiguration) {
                this._prePassEffectConfiguration.texturesRequired[0] = 5;
            }
            this.onApply = function (effect) { return _this._onApplyScreenBased(effect); };
        }
    };
    /**
     * Called on the effect is applied when the motion blur post-process is in object based mode.
     * @param effect
     */
    MotionBlurPostProcess.prototype._onApplyObjectBased = function (effect) {
        effect.setVector2("screenSize", new Vector2(this.width, this.height));
        effect.setFloat("motionScale", this._scene.getAnimationRatio());
        effect.setFloat("motionStrength", this.motionStrength);
        if (this._geometryBufferRenderer) {
            var velocityIndex = this._geometryBufferRenderer.getTextureIndex(GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE);
            effect.setTexture("velocitySampler", this._geometryBufferRenderer.getGBuffer().textures[velocityIndex]);
        }
        else if (this._prePassRenderer) {
            var velocityIndex = this._prePassRenderer.getIndex(2);
            effect.setTexture("velocitySampler", this._prePassRenderer.getRenderTarget().textures[velocityIndex]);
        }
    };
    /**
     * Called on the effect is applied when the motion blur post-process is in screen based mode.
     * @param effect
     */
    MotionBlurPostProcess.prototype._onApplyScreenBased = function (effect) {
        var viewProjection = this._scene.getProjectionMatrix().multiply(this._scene.getViewMatrix());
        viewProjection.invertToRef(this._invViewProjection);
        effect.setMatrix("inverseViewProjection", this._invViewProjection);
        effect.setMatrix("prevViewProjection", this._previousViewProjection);
        this._previousViewProjection = viewProjection;
        effect.setVector2("screenSize", new Vector2(this.width, this.height));
        effect.setFloat("motionScale", this._scene.getAnimationRatio());
        effect.setFloat("motionStrength", this.motionStrength);
        if (this._geometryBufferRenderer) {
            var depthIndex = this._geometryBufferRenderer.getTextureIndex(GeometryBufferRenderer.DEPTH_TEXTURE_TYPE);
            effect.setTexture("depthSampler", this._geometryBufferRenderer.getGBuffer().textures[depthIndex]);
        }
        else if (this._prePassRenderer) {
            var depthIndex = this._prePassRenderer.getIndex(5);
            effect.setTexture("depthSampler", this._prePassRenderer.getRenderTarget().textures[depthIndex]);
        }
    };
    /**
     * Called on the effect must be updated (changed mode, samples count, etc.).
     */
    MotionBlurPostProcess.prototype._updateEffect = function () {
        if (this._geometryBufferRenderer || this._prePassRenderer) {
            var defines = [
                "#define GEOMETRY_SUPPORTED",
                "#define SAMPLES " + this._motionBlurSamples.toFixed(1),
                this._isObjectBased ? "#define OBJECT_BASED" : "#define SCREEN_BASED",
            ];
            this.updateEffect(defines.join("\n"));
        }
    };
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    MotionBlurPostProcess._Parse = function (parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(function () {
            return new MotionBlurPostProcess(parsedPostProcess.name, scene, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable, parsedPostProcess.textureType, false);
        }, parsedPostProcess, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], MotionBlurPostProcess.prototype, "motionStrength", void 0);
    __decorate([
        serialize()
    ], MotionBlurPostProcess.prototype, "motionBlurSamples", null);
    __decorate([
        serialize()
    ], MotionBlurPostProcess.prototype, "isObjectBased", null);
    return MotionBlurPostProcess;
}(PostProcess));
export { MotionBlurPostProcess };
RegisterClass("BABYLON.MotionBlurPostProcess", MotionBlurPostProcess);
//# sourceMappingURL=motionBlurPostProcess.js.map