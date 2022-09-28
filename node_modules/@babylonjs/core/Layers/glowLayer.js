import { __assign, __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { serialize, SerializationHelper } from "../Misc/decorators.js";
import { Vector2 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Texture } from "../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { Material } from "../Materials/material.js";
import { BlurPostProcess } from "../PostProcesses/blurPostProcess.js";
import { EffectLayer } from "./effectLayer.js";
import { AbstractScene } from "../abstractScene.js";

import { RegisterClass } from "../Misc/typeStore.js";
import { Engine } from "../Engines/engine.js";
import { Color4 } from "../Maths/math.color.js";
import "../Shaders/glowMapMerge.fragment.js";
import "../Shaders/glowMapMerge.vertex.js";
import "../Layers/effectLayerSceneComponent.js";
AbstractScene.prototype.getGlowLayerByName = function (name) {
    for (var index = 0; index < this.effectLayers.length; index++) {
        if (this.effectLayers[index].name === name && this.effectLayers[index].getEffectName() === GlowLayer.EffectName) {
            return this.effectLayers[index];
        }
    }
    return null;
};
/**
 * The glow layer Helps adding a glow effect around the emissive parts of a mesh.
 *
 * Once instantiated in a scene, by default, all the emissive meshes will glow.
 *
 * Documentation: https://doc.babylonjs.com/how_to/glow_layer
 */
var GlowLayer = /** @class */ (function (_super) {
    __extends(GlowLayer, _super);
    /**
     * Instantiates a new glow Layer and references it to the scene.
     * @param name The name of the layer
     * @param scene The scene to use the layer in
     * @param options Sets of none mandatory options to use with the layer (see IGlowLayerOptions for more information)
     */
    function GlowLayer(name, scene, options) {
        var _this = _super.call(this, name, scene) || this;
        _this._intensity = 1.0;
        _this._includedOnlyMeshes = [];
        _this._excludedMeshes = [];
        _this._meshesUsingTheirOwnMaterials = [];
        _this.neutralColor = new Color4(0, 0, 0, 1);
        // Adapt options
        _this._options = __assign({ mainTextureRatio: GlowLayer.DefaultTextureRatio, blurKernelSize: 32, mainTextureFixedSize: undefined, camera: null, mainTextureSamples: 1, renderingGroupId: -1, ldrMerge: false, alphaBlendingMode: 1 }, options);
        // Initialize the layer
        _this._init({
            alphaBlendingMode: _this._options.alphaBlendingMode,
            camera: _this._options.camera,
            mainTextureFixedSize: _this._options.mainTextureFixedSize,
            mainTextureRatio: _this._options.mainTextureRatio,
            renderingGroupId: _this._options.renderingGroupId,
        });
        return _this;
    }
    Object.defineProperty(GlowLayer.prototype, "blurKernelSize", {
        /**
         * Gets the kernel size of the blur.
         */
        get: function () {
            return this._horizontalBlurPostprocess1.kernel;
        },
        /**
         * Sets the kernel size of the blur.
         */
        set: function (value) {
            this._horizontalBlurPostprocess1.kernel = value;
            this._verticalBlurPostprocess1.kernel = value;
            this._horizontalBlurPostprocess2.kernel = value;
            this._verticalBlurPostprocess2.kernel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GlowLayer.prototype, "intensity", {
        /**
         * Gets the glow intensity.
         */
        get: function () {
            return this._intensity;
        },
        /**
         * Sets the glow intensity.
         */
        set: function (value) {
            this._intensity = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the effect name of the layer.
     * @return The effect name
     */
    GlowLayer.prototype.getEffectName = function () {
        return GlowLayer.EffectName;
    };
    /**
     * Create the merge effect. This is the shader use to blit the information back
     * to the main canvas at the end of the scene rendering.
     */
    GlowLayer.prototype._createMergeEffect = function () {
        var defines = "#define EMISSIVE \n";
        if (this._options.ldrMerge) {
            defines += "#define LDR \n";
        }
        // Effect
        return this._engine.createEffect("glowMapMerge", [VertexBuffer.PositionKind], ["offset"], ["textureSampler", "textureSampler2"], defines);
    };
    /**
     * Creates the render target textures and post processes used in the glow layer.
     */
    GlowLayer.prototype._createTextureAndPostProcesses = function () {
        var _this = this;
        var blurTextureWidth = this._mainTextureDesiredSize.width;
        var blurTextureHeight = this._mainTextureDesiredSize.height;
        blurTextureWidth = this._engine.needPOTTextures ? Engine.GetExponentOfTwo(blurTextureWidth, this._maxSize) : blurTextureWidth;
        blurTextureHeight = this._engine.needPOTTextures ? Engine.GetExponentOfTwo(blurTextureHeight, this._maxSize) : blurTextureHeight;
        var textureType = 0;
        if (this._engine.getCaps().textureHalfFloatRender) {
            textureType = 2;
        }
        else {
            textureType = 0;
        }
        this._blurTexture1 = new RenderTargetTexture("GlowLayerBlurRTT", {
            width: blurTextureWidth,
            height: blurTextureHeight,
        }, this._scene, false, true, textureType);
        this._blurTexture1.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture1.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture1.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
        this._blurTexture1.renderParticles = false;
        this._blurTexture1.ignoreCameraViewport = true;
        var blurTextureWidth2 = Math.floor(blurTextureWidth / 2);
        var blurTextureHeight2 = Math.floor(blurTextureHeight / 2);
        this._blurTexture2 = new RenderTargetTexture("GlowLayerBlurRTT2", {
            width: blurTextureWidth2,
            height: blurTextureHeight2,
        }, this._scene, false, true, textureType);
        this._blurTexture2.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture2.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture2.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
        this._blurTexture2.renderParticles = false;
        this._blurTexture2.ignoreCameraViewport = true;
        this._textures = [this._blurTexture1, this._blurTexture2];
        this._horizontalBlurPostprocess1 = new BlurPostProcess("GlowLayerHBP1", new Vector2(1.0, 0), this._options.blurKernelSize / 2, {
            width: blurTextureWidth,
            height: blurTextureHeight,
        }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
        this._horizontalBlurPostprocess1.width = blurTextureWidth;
        this._horizontalBlurPostprocess1.height = blurTextureHeight;
        this._horizontalBlurPostprocess1.externalTextureSamplerBinding = true;
        this._horizontalBlurPostprocess1.onApplyObservable.add(function (effect) {
            effect.setTexture("textureSampler", _this._mainTexture);
        });
        this._verticalBlurPostprocess1 = new BlurPostProcess("GlowLayerVBP1", new Vector2(0, 1.0), this._options.blurKernelSize / 2, {
            width: blurTextureWidth,
            height: blurTextureHeight,
        }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
        this._horizontalBlurPostprocess2 = new BlurPostProcess("GlowLayerHBP2", new Vector2(1.0, 0), this._options.blurKernelSize / 2, {
            width: blurTextureWidth2,
            height: blurTextureHeight2,
        }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
        this._horizontalBlurPostprocess2.width = blurTextureWidth2;
        this._horizontalBlurPostprocess2.height = blurTextureHeight2;
        this._horizontalBlurPostprocess2.externalTextureSamplerBinding = true;
        this._horizontalBlurPostprocess2.onApplyObservable.add(function (effect) {
            effect.setTexture("textureSampler", _this._blurTexture1);
        });
        this._verticalBlurPostprocess2 = new BlurPostProcess("GlowLayerVBP2", new Vector2(0, 1.0), this._options.blurKernelSize / 2, {
            width: blurTextureWidth2,
            height: blurTextureHeight2,
        }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
        this._postProcesses = [this._horizontalBlurPostprocess1, this._verticalBlurPostprocess1, this._horizontalBlurPostprocess2, this._verticalBlurPostprocess2];
        this._postProcesses1 = [this._horizontalBlurPostprocess1, this._verticalBlurPostprocess1];
        this._postProcesses2 = [this._horizontalBlurPostprocess2, this._verticalBlurPostprocess2];
        this._mainTexture.samples = this._options.mainTextureSamples;
        this._mainTexture.onAfterUnbindObservable.add(function () {
            var internalTexture = _this._blurTexture1.renderTarget;
            if (internalTexture) {
                _this._scene.postProcessManager.directRender(_this._postProcesses1, internalTexture, true);
                var internalTexture2 = _this._blurTexture2.renderTarget;
                if (internalTexture2) {
                    _this._scene.postProcessManager.directRender(_this._postProcesses2, internalTexture2, true);
                }
                _this._engine.unBindFramebuffer(internalTexture2 !== null && internalTexture2 !== void 0 ? internalTexture2 : internalTexture, true);
            }
        });
        // Prevent autoClear.
        this._postProcesses.map(function (pp) {
            pp.autoClear = false;
        });
    };
    /**
     * Checks for the readiness of the element composing the layer.
     * @param subMesh the mesh to check for
     * @param useInstances specify whether or not to use instances to render the mesh
     * @return true if ready otherwise, false
     */
    GlowLayer.prototype.isReady = function (subMesh, useInstances) {
        var material = subMesh.getMaterial();
        var mesh = subMesh.getRenderingMesh();
        if (!material || !mesh) {
            return false;
        }
        var emissiveTexture = material.emissiveTexture;
        return _super.prototype._isReady.call(this, subMesh, useInstances, emissiveTexture);
    };
    /**
     * Returns whether or not the layer needs stencil enabled during the mesh rendering.
     */
    GlowLayer.prototype.needStencil = function () {
        return false;
    };
    /**
     * Returns true if the mesh can be rendered, otherwise false.
     * @param mesh The mesh to render
     * @param material The material used on the mesh
     * @returns true if it can be rendered otherwise false
     */
    GlowLayer.prototype._canRenderMesh = function (mesh, material) {
        return true;
    };
    /**
     * Implementation specific of rendering the generating effect on the main canvas.
     * @param effect The effect used to render through
     */
    GlowLayer.prototype._internalRender = function (effect) {
        // Texture
        effect.setTexture("textureSampler", this._blurTexture1);
        effect.setTexture("textureSampler2", this._blurTexture2);
        effect.setFloat("offset", this._intensity);
        // Cache
        var engine = this._engine;
        var previousStencilBuffer = engine.getStencilBuffer();
        // Draw order
        engine.setStencilBuffer(false);
        engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        // Draw order
        engine.setStencilBuffer(previousStencilBuffer);
    };
    /**
     * Sets the required values for both the emissive texture and and the main color.
     * @param mesh
     * @param subMesh
     * @param material
     */
    GlowLayer.prototype._setEmissiveTextureAndColor = function (mesh, subMesh, material) {
        var _a;
        var textureLevel = 1.0;
        if (this.customEmissiveTextureSelector) {
            this._emissiveTextureAndColor.texture = this.customEmissiveTextureSelector(mesh, subMesh, material);
        }
        else {
            if (material) {
                this._emissiveTextureAndColor.texture = material.emissiveTexture;
                if (this._emissiveTextureAndColor.texture) {
                    textureLevel = this._emissiveTextureAndColor.texture.level;
                }
            }
            else {
                this._emissiveTextureAndColor.texture = null;
            }
        }
        if (this.customEmissiveColorSelector) {
            this.customEmissiveColorSelector(mesh, subMesh, material, this._emissiveTextureAndColor.color);
        }
        else {
            if (material.emissiveColor) {
                var emissiveIntensity = (_a = material.emissiveIntensity) !== null && _a !== void 0 ? _a : 1;
                textureLevel *= emissiveIntensity;
                this._emissiveTextureAndColor.color.set(material.emissiveColor.r * textureLevel, material.emissiveColor.g * textureLevel, material.emissiveColor.b * textureLevel, material.alpha);
            }
            else {
                this._emissiveTextureAndColor.color.set(this.neutralColor.r, this.neutralColor.g, this.neutralColor.b, this.neutralColor.a);
            }
        }
    };
    /**
     * Returns true if the mesh should render, otherwise false.
     * @param mesh The mesh to render
     * @returns true if it should render otherwise false
     */
    GlowLayer.prototype._shouldRenderMesh = function (mesh) {
        return this.hasMesh(mesh);
    };
    /**
     * Adds specific effects defines.
     * @param defines The defines to add specifics to.
     */
    GlowLayer.prototype._addCustomEffectDefines = function (defines) {
        defines.push("#define GLOW");
    };
    /**
     * Add a mesh in the exclusion list to prevent it to impact or being impacted by the glow layer.
     * @param mesh The mesh to exclude from the glow layer
     */
    GlowLayer.prototype.addExcludedMesh = function (mesh) {
        if (this._excludedMeshes.indexOf(mesh.uniqueId) === -1) {
            this._excludedMeshes.push(mesh.uniqueId);
        }
    };
    /**
     * Remove a mesh from the exclusion list to let it impact or being impacted by the glow layer.
     * @param mesh The mesh to remove
     */
    GlowLayer.prototype.removeExcludedMesh = function (mesh) {
        var index = this._excludedMeshes.indexOf(mesh.uniqueId);
        if (index !== -1) {
            this._excludedMeshes.splice(index, 1);
        }
    };
    /**
     * Add a mesh in the inclusion list to impact or being impacted by the glow layer.
     * @param mesh The mesh to include in the glow layer
     */
    GlowLayer.prototype.addIncludedOnlyMesh = function (mesh) {
        if (this._includedOnlyMeshes.indexOf(mesh.uniqueId) === -1) {
            this._includedOnlyMeshes.push(mesh.uniqueId);
        }
    };
    /**
     * Remove a mesh from the Inclusion list to prevent it to impact or being impacted by the glow layer.
     * @param mesh The mesh to remove
     */
    GlowLayer.prototype.removeIncludedOnlyMesh = function (mesh) {
        var index = this._includedOnlyMeshes.indexOf(mesh.uniqueId);
        if (index !== -1) {
            this._includedOnlyMeshes.splice(index, 1);
        }
    };
    /**
     * Determine if a given mesh will be used in the glow layer
     * @param mesh The mesh to test
     * @returns true if the mesh will be highlighted by the current glow layer
     */
    GlowLayer.prototype.hasMesh = function (mesh) {
        if (!_super.prototype.hasMesh.call(this, mesh)) {
            return false;
        }
        // Included Mesh
        if (this._includedOnlyMeshes.length) {
            return this._includedOnlyMeshes.indexOf(mesh.uniqueId) !== -1;
        }
        // Excluded Mesh
        if (this._excludedMeshes.length) {
            return this._excludedMeshes.indexOf(mesh.uniqueId) === -1;
        }
        return true;
    };
    /**
     * Defines whether the current material of the mesh should be use to render the effect.
     * @param mesh defines the current mesh to render
     */
    GlowLayer.prototype._useMeshMaterial = function (mesh) {
        if (this._meshesUsingTheirOwnMaterials.length == 0) {
            return false;
        }
        return this._meshesUsingTheirOwnMaterials.indexOf(mesh.uniqueId) > -1;
    };
    /**
     * Add a mesh to be rendered through its own material and not with emissive only.
     * @param mesh The mesh for which we need to use its material
     */
    GlowLayer.prototype.referenceMeshToUseItsOwnMaterial = function (mesh) {
        var _this = this;
        mesh.resetDrawCache(this._mainTexture.renderPassId);
        this._meshesUsingTheirOwnMaterials.push(mesh.uniqueId);
        mesh.onDisposeObservable.add(function () {
            _this._disposeMesh(mesh);
        });
    };
    /**
     * Remove a mesh from being rendered through its own material and not with emissive only.
     * @param mesh The mesh for which we need to not use its material
     */
    GlowLayer.prototype.unReferenceMeshFromUsingItsOwnMaterial = function (mesh) {
        var index = this._meshesUsingTheirOwnMaterials.indexOf(mesh.uniqueId);
        while (index >= 0) {
            this._meshesUsingTheirOwnMaterials.splice(index, 1);
            index = this._meshesUsingTheirOwnMaterials.indexOf(mesh.uniqueId);
        }
        mesh.resetDrawCache(this._mainTexture.renderPassId);
    };
    /**
     * Free any resources and references associated to a mesh.
     * Internal use
     * @param mesh The mesh to free.
     * @hidden
     */
    GlowLayer.prototype._disposeMesh = function (mesh) {
        this.removeIncludedOnlyMesh(mesh);
        this.removeExcludedMesh(mesh);
    };
    /**
     * Gets the class name of the effect layer
     * @returns the string with the class name of the effect layer
     */
    GlowLayer.prototype.getClassName = function () {
        return "GlowLayer";
    };
    /**
     * Serializes this glow layer
     * @returns a serialized glow layer object
     */
    GlowLayer.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.GlowLayer";
        var index;
        // Included meshes
        serializationObject.includedMeshes = [];
        if (this._includedOnlyMeshes.length) {
            for (index = 0; index < this._includedOnlyMeshes.length; index++) {
                var mesh = this._scene.getMeshByUniqueId(this._includedOnlyMeshes[index]);
                if (mesh) {
                    serializationObject.includedMeshes.push(mesh.id);
                }
            }
        }
        // Excluded meshes
        serializationObject.excludedMeshes = [];
        if (this._excludedMeshes.length) {
            for (index = 0; index < this._excludedMeshes.length; index++) {
                var mesh = this._scene.getMeshByUniqueId(this._excludedMeshes[index]);
                if (mesh) {
                    serializationObject.excludedMeshes.push(mesh.id);
                }
            }
        }
        return serializationObject;
    };
    /**
     * Creates a Glow Layer from parsed glow layer data
     * @param parsedGlowLayer defines glow layer data
     * @param scene defines the current scene
     * @param rootUrl defines the root URL containing the glow layer information
     * @returns a parsed Glow Layer
     */
    GlowLayer.Parse = function (parsedGlowLayer, scene, rootUrl) {
        var gl = SerializationHelper.Parse(function () { return new GlowLayer(parsedGlowLayer.name, scene, parsedGlowLayer.options); }, parsedGlowLayer, scene, rootUrl);
        var index;
        // Excluded meshes
        for (index = 0; index < parsedGlowLayer.excludedMeshes.length; index++) {
            var mesh = scene.getMeshById(parsedGlowLayer.excludedMeshes[index]);
            if (mesh) {
                gl.addExcludedMesh(mesh);
            }
        }
        // Included meshes
        for (index = 0; index < parsedGlowLayer.includedMeshes.length; index++) {
            var mesh = scene.getMeshById(parsedGlowLayer.includedMeshes[index]);
            if (mesh) {
                gl.addIncludedOnlyMesh(mesh);
            }
        }
        return gl;
    };
    /**
     * Effect Name of the layer.
     */
    GlowLayer.EffectName = "GlowLayer";
    /**
     * The default blur kernel size used for the glow.
     */
    GlowLayer.DefaultBlurKernelSize = 32;
    /**
     * The default texture size ratio used for the glow.
     */
    GlowLayer.DefaultTextureRatio = 0.5;
    __decorate([
        serialize()
    ], GlowLayer.prototype, "blurKernelSize", null);
    __decorate([
        serialize()
    ], GlowLayer.prototype, "intensity", null);
    __decorate([
        serialize("options")
    ], GlowLayer.prototype, "_options", void 0);
    return GlowLayer;
}(EffectLayer));
export { GlowLayer };
RegisterClass("BABYLON.GlowLayer", GlowLayer);
//# sourceMappingURL=glowLayer.js.map