import { __assign, __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { serialize, SerializationHelper } from "../Misc/decorators.js";
import { Observable } from "../Misc/observable.js";
import { Vector2 } from "../Maths/math.vector.js";
import { Engine } from "../Engines/engine.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Material } from "../Materials/material.js";
import { Texture } from "../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { PostProcess } from "../PostProcesses/postProcess.js";
import { PassPostProcess } from "../PostProcesses/passPostProcess.js";
import { BlurPostProcess } from "../PostProcesses/blurPostProcess.js";
import { EffectLayer } from "./effectLayer.js";
import { AbstractScene } from "../abstractScene.js";

import { Logger } from "../Misc/logger.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { Color4, Color3 } from "../Maths/math.color.js";
import "../Shaders/glowMapMerge.fragment.js";
import "../Shaders/glowMapMerge.vertex.js";
import "../Shaders/glowBlurPostProcess.fragment.js";
import "../Layers/effectLayerSceneComponent.js";
AbstractScene.prototype.getHighlightLayerByName = function (name) {
    var _a;
    for (var index = 0; index < ((_a = this.effectLayers) === null || _a === void 0 ? void 0 : _a.length); index++) {
        if (this.effectLayers[index].name === name && this.effectLayers[index].getEffectName() === HighlightLayer.EffectName) {
            return this.effectLayers[index];
        }
    }
    return null;
};
/**
 * Special Glow Blur post process only blurring the alpha channel
 * It enforces keeping the most luminous color in the color channel.
 */
var GlowBlurPostProcess = /** @class */ (function (_super) {
    __extends(GlowBlurPostProcess, _super);
    function GlowBlurPostProcess(name, direction, kernel, options, camera, samplingMode, engine, reusable) {
        if (samplingMode === void 0) { samplingMode = Texture.BILINEAR_SAMPLINGMODE; }
        var _this = _super.call(this, name, "glowBlurPostProcess", ["screenSize", "direction", "blurWidth"], null, options, camera, samplingMode, engine, reusable) || this;
        _this.direction = direction;
        _this.kernel = kernel;
        _this.onApplyObservable.add(function (effect) {
            effect.setFloat2("screenSize", _this.width, _this.height);
            effect.setVector2("direction", _this.direction);
            effect.setFloat("blurWidth", _this.kernel);
        });
        return _this;
    }
    return GlowBlurPostProcess;
}(PostProcess));
/**
 * The highlight layer Helps adding a glow effect around a mesh.
 *
 * Once instantiated in a scene, simply use the addMesh or removeMesh method to add or remove
 * glowy meshes to your scene.
 *
 * !!! THIS REQUIRES AN ACTIVE STENCIL BUFFER ON THE CANVAS !!!
 */
var HighlightLayer = /** @class */ (function (_super) {
    __extends(HighlightLayer, _super);
    /**
     * Instantiates a new highlight Layer and references it to the scene..
     * @param name The name of the layer
     * @param scene The scene to use the layer in
     * @param options Sets of none mandatory options to use with the layer (see IHighlightLayerOptions for more information)
     */
    function HighlightLayer(name, scene, options) {
        var _this = _super.call(this, name, scene) || this;
        _this.name = name;
        /**
         * Specifies whether or not the inner glow is ACTIVE in the layer.
         */
        _this.innerGlow = true;
        /**
         * Specifies whether or not the outer glow is ACTIVE in the layer.
         */
        _this.outerGlow = true;
        /**
         * An event triggered when the highlight layer is being blurred.
         */
        _this.onBeforeBlurObservable = new Observable();
        /**
         * An event triggered when the highlight layer has been blurred.
         */
        _this.onAfterBlurObservable = new Observable();
        _this._instanceGlowingMeshStencilReference = HighlightLayer.GlowingMeshStencilReference++;
        _this._meshes = {};
        _this._excludedMeshes = {};
        _this.neutralColor = HighlightLayer.NeutralColor;
        // Warn on stencil
        if (!_this._engine.isStencilEnable) {
            Logger.Warn("Rendering the Highlight Layer requires the stencil to be active on the canvas. var engine = new Engine(canvas, antialias, { stencil: true }");
        }
        // Adapt options
        _this._options = __assign({ mainTextureRatio: 0.5, blurTextureSizeRatio: 0.5, blurHorizontalSize: 1.0, blurVerticalSize: 1.0, alphaBlendingMode: 2, camera: null, renderingGroupId: -1 }, options);
        // Initialize the layer
        _this._init({
            alphaBlendingMode: _this._options.alphaBlendingMode,
            camera: _this._options.camera,
            mainTextureFixedSize: _this._options.mainTextureFixedSize,
            mainTextureRatio: _this._options.mainTextureRatio,
            renderingGroupId: _this._options.renderingGroupId,
        });
        // Do not render as long as no meshes have been added
        _this._shouldRender = false;
        return _this;
    }
    Object.defineProperty(HighlightLayer.prototype, "blurHorizontalSize", {
        /**
         * Gets the horizontal size of the blur.
         */
        get: function () {
            return this._horizontalBlurPostprocess.kernel;
        },
        /**
         * Specifies the horizontal size of the blur.
         */
        set: function (value) {
            this._horizontalBlurPostprocess.kernel = value;
            this._options.blurHorizontalSize = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HighlightLayer.prototype, "blurVerticalSize", {
        /**
         * Gets the vertical size of the blur.
         */
        get: function () {
            return this._verticalBlurPostprocess.kernel;
        },
        /**
         * Specifies the vertical size of the blur.
         */
        set: function (value) {
            this._verticalBlurPostprocess.kernel = value;
            this._options.blurVerticalSize = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the effect name of the layer.
     * @return The effect name
     */
    HighlightLayer.prototype.getEffectName = function () {
        return HighlightLayer.EffectName;
    };
    HighlightLayer.prototype._numInternalDraws = function () {
        return 2; // we need two rendering, one for the inner glow and the other for the outer glow
    };
    /**
     * Create the merge effect. This is the shader use to blit the information back
     * to the main canvas at the end of the scene rendering.
     */
    HighlightLayer.prototype._createMergeEffect = function () {
        // Effect
        return this._engine.createEffect("glowMapMerge", [VertexBuffer.PositionKind], ["offset"], ["textureSampler"], this._options.isStroke ? "#define STROKE \n" : undefined);
    };
    /**
     * Creates the render target textures and post processes used in the highlight layer.
     */
    HighlightLayer.prototype._createTextureAndPostProcesses = function () {
        var _this = this;
        var blurTextureWidth = this._mainTextureDesiredSize.width * this._options.blurTextureSizeRatio;
        var blurTextureHeight = this._mainTextureDesiredSize.height * this._options.blurTextureSizeRatio;
        blurTextureWidth = this._engine.needPOTTextures ? Engine.GetExponentOfTwo(blurTextureWidth, this._maxSize) : blurTextureWidth;
        blurTextureHeight = this._engine.needPOTTextures ? Engine.GetExponentOfTwo(blurTextureHeight, this._maxSize) : blurTextureHeight;
        var textureType = 0;
        if (this._engine.getCaps().textureHalfFloatRender) {
            textureType = 2;
        }
        else {
            textureType = 0;
        }
        this._blurTexture = new RenderTargetTexture("HighlightLayerBlurRTT", {
            width: blurTextureWidth,
            height: blurTextureHeight,
        }, this._scene, false, true, textureType);
        this._blurTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._blurTexture.anisotropicFilteringLevel = 16;
        this._blurTexture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
        this._blurTexture.renderParticles = false;
        this._blurTexture.ignoreCameraViewport = true;
        this._textures = [this._blurTexture];
        if (this._options.alphaBlendingMode === 2) {
            this._downSamplePostprocess = new PassPostProcess("HighlightLayerPPP", this._options.blurTextureSizeRatio, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine());
            this._downSamplePostprocess.externalTextureSamplerBinding = true;
            this._downSamplePostprocess.onApplyObservable.add(function (effect) {
                effect.setTexture("textureSampler", _this._mainTexture);
            });
            this._horizontalBlurPostprocess = new GlowBlurPostProcess("HighlightLayerHBP", new Vector2(1.0, 0), this._options.blurHorizontalSize, 1, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine());
            this._horizontalBlurPostprocess.onApplyObservable.add(function (effect) {
                effect.setFloat2("screenSize", blurTextureWidth, blurTextureHeight);
            });
            this._verticalBlurPostprocess = new GlowBlurPostProcess("HighlightLayerVBP", new Vector2(0, 1.0), this._options.blurVerticalSize, 1, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine());
            this._verticalBlurPostprocess.onApplyObservable.add(function (effect) {
                effect.setFloat2("screenSize", blurTextureWidth, blurTextureHeight);
            });
            this._postProcesses = [this._downSamplePostprocess, this._horizontalBlurPostprocess, this._verticalBlurPostprocess];
        }
        else {
            this._horizontalBlurPostprocess = new BlurPostProcess("HighlightLayerHBP", new Vector2(1.0, 0), this._options.blurHorizontalSize / 2, {
                width: blurTextureWidth,
                height: blurTextureHeight,
            }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
            this._horizontalBlurPostprocess.width = blurTextureWidth;
            this._horizontalBlurPostprocess.height = blurTextureHeight;
            this._horizontalBlurPostprocess.externalTextureSamplerBinding = true;
            this._horizontalBlurPostprocess.onApplyObservable.add(function (effect) {
                effect.setTexture("textureSampler", _this._mainTexture);
            });
            this._verticalBlurPostprocess = new BlurPostProcess("HighlightLayerVBP", new Vector2(0, 1.0), this._options.blurVerticalSize / 2, {
                width: blurTextureWidth,
                height: blurTextureHeight,
            }, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, textureType);
            this._postProcesses = [this._horizontalBlurPostprocess, this._verticalBlurPostprocess];
        }
        this._mainTexture.onAfterUnbindObservable.add(function () {
            _this.onBeforeBlurObservable.notifyObservers(_this);
            var internalTexture = _this._blurTexture.renderTarget;
            if (internalTexture) {
                _this._scene.postProcessManager.directRender(_this._postProcesses, internalTexture, true);
                _this._engine.unBindFramebuffer(internalTexture, true);
            }
            _this.onAfterBlurObservable.notifyObservers(_this);
        });
        // Prevent autoClear.
        this._postProcesses.map(function (pp) {
            pp.autoClear = false;
        });
    };
    /**
     * Returns whether or not the layer needs stencil enabled during the mesh rendering.
     */
    HighlightLayer.prototype.needStencil = function () {
        return true;
    };
    /**
     * Checks for the readiness of the element composing the layer.
     * @param subMesh the mesh to check for
     * @param useInstances specify whether or not to use instances to render the mesh
     * @return true if ready otherwise, false
     */
    HighlightLayer.prototype.isReady = function (subMesh, useInstances) {
        var material = subMesh.getMaterial();
        var mesh = subMesh.getRenderingMesh();
        if (!material || !mesh || !this._meshes) {
            return false;
        }
        var emissiveTexture = null;
        var highlightLayerMesh = this._meshes[mesh.uniqueId];
        if (highlightLayerMesh && highlightLayerMesh.glowEmissiveOnly && material) {
            emissiveTexture = material.emissiveTexture;
        }
        return _super.prototype._isReady.call(this, subMesh, useInstances, emissiveTexture);
    };
    /**
     * Implementation specific of rendering the generating effect on the main canvas.
     * @param effect The effect used to render through
     * @param renderIndex
     */
    HighlightLayer.prototype._internalRender = function (effect, renderIndex) {
        // Texture
        effect.setTexture("textureSampler", this._blurTexture);
        // Cache
        var engine = this._engine;
        engine.cacheStencilState();
        // Stencil operations
        engine.setStencilOperationPass(7681);
        engine.setStencilOperationFail(7680);
        engine.setStencilOperationDepthFail(7680);
        // Draw order
        engine.setStencilMask(0x00);
        engine.setStencilBuffer(true);
        engine.setStencilFunctionReference(this._instanceGlowingMeshStencilReference);
        // 2 passes inner outer
        if (this.outerGlow && renderIndex === 0) {
            // the outer glow is rendered the first time _internalRender is called, so when renderIndex == 0 (and only if outerGlow is enabled)
            effect.setFloat("offset", 0);
            engine.setStencilFunction(517);
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        if (this.innerGlow && renderIndex === 1) {
            // the inner glow is rendered the second time _internalRender is called, so when renderIndex == 1 (and only if innerGlow is enabled)
            effect.setFloat("offset", 1);
            engine.setStencilFunction(514);
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        // Restore Cache
        engine.restoreStencilState();
    };
    /**
     * Returns true if the layer contains information to display, otherwise false.
     */
    HighlightLayer.prototype.shouldRender = function () {
        if (_super.prototype.shouldRender.call(this)) {
            return this._meshes ? true : false;
        }
        return false;
    };
    /**
     * Returns true if the mesh should render, otherwise false.
     * @param mesh The mesh to render
     * @returns true if it should render otherwise false
     */
    HighlightLayer.prototype._shouldRenderMesh = function (mesh) {
        // Excluded Mesh
        if (this._excludedMeshes && this._excludedMeshes[mesh.uniqueId]) {
            return false;
        }
        if (!_super.prototype.hasMesh.call(this, mesh)) {
            return false;
        }
        return true;
    };
    /**
     * Returns true if the mesh can be rendered, otherwise false.
     * @param mesh The mesh to render
     * @param material The material used on the mesh
     * @returns true if it can be rendered otherwise false
     */
    HighlightLayer.prototype._canRenderMesh = function (mesh, material) {
        // all meshes can be rendered in the highlight layer, even transparent ones
        return true;
    };
    /**
     * Adds specific effects defines.
     * @param defines The defines to add specifics to.
     */
    HighlightLayer.prototype._addCustomEffectDefines = function (defines) {
        defines.push("#define HIGHLIGHT");
    };
    /**
     * Sets the required values for both the emissive texture and and the main color.
     * @param mesh
     * @param subMesh
     * @param material
     */
    HighlightLayer.prototype._setEmissiveTextureAndColor = function (mesh, subMesh, material) {
        var highlightLayerMesh = this._meshes[mesh.uniqueId];
        if (highlightLayerMesh) {
            this._emissiveTextureAndColor.color.set(highlightLayerMesh.color.r, highlightLayerMesh.color.g, highlightLayerMesh.color.b, 1.0);
        }
        else {
            this._emissiveTextureAndColor.color.set(this.neutralColor.r, this.neutralColor.g, this.neutralColor.b, this.neutralColor.a);
        }
        if (highlightLayerMesh && highlightLayerMesh.glowEmissiveOnly && material) {
            this._emissiveTextureAndColor.texture = material.emissiveTexture;
            this._emissiveTextureAndColor.color.set(1.0, 1.0, 1.0, 1.0);
        }
        else {
            this._emissiveTextureAndColor.texture = null;
        }
    };
    /**
     * Add a mesh in the exclusion list to prevent it to impact or being impacted by the highlight layer.
     * @param mesh The mesh to exclude from the highlight layer
     */
    HighlightLayer.prototype.addExcludedMesh = function (mesh) {
        if (!this._excludedMeshes) {
            return;
        }
        var meshExcluded = this._excludedMeshes[mesh.uniqueId];
        if (!meshExcluded) {
            this._excludedMeshes[mesh.uniqueId] = {
                mesh: mesh,
                beforeBind: mesh.onBeforeBindObservable.add(function (mesh) {
                    mesh.getEngine().setStencilBuffer(false);
                }),
                afterRender: mesh.onAfterRenderObservable.add(function (mesh) {
                    mesh.getEngine().setStencilBuffer(true);
                }),
            };
        }
    };
    /**
     * Remove a mesh from the exclusion list to let it impact or being impacted by the highlight layer.
     * @param mesh The mesh to highlight
     */
    HighlightLayer.prototype.removeExcludedMesh = function (mesh) {
        if (!this._excludedMeshes) {
            return;
        }
        var meshExcluded = this._excludedMeshes[mesh.uniqueId];
        if (meshExcluded) {
            if (meshExcluded.beforeBind) {
                mesh.onBeforeBindObservable.remove(meshExcluded.beforeBind);
            }
            if (meshExcluded.afterRender) {
                mesh.onAfterRenderObservable.remove(meshExcluded.afterRender);
            }
        }
        this._excludedMeshes[mesh.uniqueId] = null;
    };
    /**
     * Determine if a given mesh will be highlighted by the current HighlightLayer
     * @param mesh mesh to test
     * @returns true if the mesh will be highlighted by the current HighlightLayer
     */
    HighlightLayer.prototype.hasMesh = function (mesh) {
        if (!this._meshes) {
            return false;
        }
        if (!_super.prototype.hasMesh.call(this, mesh)) {
            return false;
        }
        return this._meshes[mesh.uniqueId] !== undefined && this._meshes[mesh.uniqueId] !== null;
    };
    /**
     * Add a mesh in the highlight layer in order to make it glow with the chosen color.
     * @param mesh The mesh to highlight
     * @param color The color of the highlight
     * @param glowEmissiveOnly Extract the glow from the emissive texture
     */
    HighlightLayer.prototype.addMesh = function (mesh, color, glowEmissiveOnly) {
        var _this = this;
        if (glowEmissiveOnly === void 0) { glowEmissiveOnly = false; }
        if (!this._meshes) {
            return;
        }
        var meshHighlight = this._meshes[mesh.uniqueId];
        if (meshHighlight) {
            meshHighlight.color = color;
        }
        else {
            this._meshes[mesh.uniqueId] = {
                mesh: mesh,
                color: color,
                // Lambda required for capture due to Observable this context
                observerHighlight: mesh.onBeforeBindObservable.add(function (mesh) {
                    if (_this.isEnabled) {
                        if (_this._excludedMeshes && _this._excludedMeshes[mesh.uniqueId]) {
                            _this._defaultStencilReference(mesh);
                        }
                        else {
                            mesh.getScene().getEngine().setStencilFunctionReference(_this._instanceGlowingMeshStencilReference);
                        }
                    }
                }),
                observerDefault: mesh.onAfterRenderObservable.add(function (mesh) {
                    if (_this.isEnabled) {
                        _this._defaultStencilReference(mesh);
                    }
                }),
                glowEmissiveOnly: glowEmissiveOnly,
            };
            mesh.onDisposeObservable.add(function () {
                _this._disposeMesh(mesh);
            });
        }
        this._shouldRender = true;
    };
    /**
     * Remove a mesh from the highlight layer in order to make it stop glowing.
     * @param mesh The mesh to highlight
     */
    HighlightLayer.prototype.removeMesh = function (mesh) {
        if (!this._meshes) {
            return;
        }
        var meshHighlight = this._meshes[mesh.uniqueId];
        if (meshHighlight) {
            if (meshHighlight.observerHighlight) {
                mesh.onBeforeBindObservable.remove(meshHighlight.observerHighlight);
            }
            if (meshHighlight.observerDefault) {
                mesh.onAfterRenderObservable.remove(meshHighlight.observerDefault);
            }
            delete this._meshes[mesh.uniqueId];
        }
        this._shouldRender = false;
        for (var meshHighlightToCheck in this._meshes) {
            if (this._meshes[meshHighlightToCheck]) {
                this._shouldRender = true;
                break;
            }
        }
    };
    /**
     * Remove all the meshes currently referenced in the highlight layer
     */
    HighlightLayer.prototype.removeAllMeshes = function () {
        if (!this._meshes) {
            return;
        }
        for (var uniqueId in this._meshes) {
            if (Object.prototype.hasOwnProperty.call(this._meshes, uniqueId)) {
                var mesh = this._meshes[uniqueId];
                if (mesh) {
                    this.removeMesh(mesh.mesh);
                }
            }
        }
    };
    /**
     * Force the stencil to the normal expected value for none glowing parts
     * @param mesh
     */
    HighlightLayer.prototype._defaultStencilReference = function (mesh) {
        mesh.getScene().getEngine().setStencilFunctionReference(HighlightLayer.NormalMeshStencilReference);
    };
    /**
     * Free any resources and references associated to a mesh.
     * Internal use
     * @param mesh The mesh to free.
     * @hidden
     */
    HighlightLayer.prototype._disposeMesh = function (mesh) {
        this.removeMesh(mesh);
        this.removeExcludedMesh(mesh);
    };
    /**
     * Dispose the highlight layer and free resources.
     */
    HighlightLayer.prototype.dispose = function () {
        if (this._meshes) {
            // Clean mesh references
            for (var id in this._meshes) {
                var meshHighlight = this._meshes[id];
                if (meshHighlight && meshHighlight.mesh) {
                    if (meshHighlight.observerHighlight) {
                        meshHighlight.mesh.onBeforeBindObservable.remove(meshHighlight.observerHighlight);
                    }
                    if (meshHighlight.observerDefault) {
                        meshHighlight.mesh.onAfterRenderObservable.remove(meshHighlight.observerDefault);
                    }
                }
            }
            this._meshes = null;
        }
        if (this._excludedMeshes) {
            for (var id in this._excludedMeshes) {
                var meshHighlight = this._excludedMeshes[id];
                if (meshHighlight) {
                    if (meshHighlight.beforeBind) {
                        meshHighlight.mesh.onBeforeBindObservable.remove(meshHighlight.beforeBind);
                    }
                    if (meshHighlight.afterRender) {
                        meshHighlight.mesh.onAfterRenderObservable.remove(meshHighlight.afterRender);
                    }
                }
            }
            this._excludedMeshes = null;
        }
        _super.prototype.dispose.call(this);
    };
    /**
     * Gets the class name of the effect layer
     * @returns the string with the class name of the effect layer
     */
    HighlightLayer.prototype.getClassName = function () {
        return "HighlightLayer";
    };
    /**
     * Serializes this Highlight layer
     * @returns a serialized Highlight layer object
     */
    HighlightLayer.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.HighlightLayer";
        // Highlighted meshes
        serializationObject.meshes = [];
        if (this._meshes) {
            for (var m in this._meshes) {
                var mesh = this._meshes[m];
                if (mesh) {
                    serializationObject.meshes.push({
                        glowEmissiveOnly: mesh.glowEmissiveOnly,
                        color: mesh.color.asArray(),
                        meshId: mesh.mesh.id,
                    });
                }
            }
        }
        // Excluded meshes
        serializationObject.excludedMeshes = [];
        if (this._excludedMeshes) {
            for (var e in this._excludedMeshes) {
                var excludedMesh = this._excludedMeshes[e];
                if (excludedMesh) {
                    serializationObject.excludedMeshes.push(excludedMesh.mesh.id);
                }
            }
        }
        return serializationObject;
    };
    /**
     * Creates a Highlight layer from parsed Highlight layer data
     * @param parsedHightlightLayer defines the Highlight layer data
     * @param scene defines the current scene
     * @param rootUrl defines the root URL containing the Highlight layer information
     * @returns a parsed Highlight layer
     */
    HighlightLayer.Parse = function (parsedHightlightLayer, scene, rootUrl) {
        var hl = SerializationHelper.Parse(function () { return new HighlightLayer(parsedHightlightLayer.name, scene, parsedHightlightLayer.options); }, parsedHightlightLayer, scene, rootUrl);
        var index;
        // Excluded meshes
        for (index = 0; index < parsedHightlightLayer.excludedMeshes.length; index++) {
            var mesh = scene.getMeshById(parsedHightlightLayer.excludedMeshes[index]);
            if (mesh) {
                hl.addExcludedMesh(mesh);
            }
        }
        // Included meshes
        for (index = 0; index < parsedHightlightLayer.meshes.length; index++) {
            var highlightedMesh = parsedHightlightLayer.meshes[index];
            var mesh = scene.getMeshById(highlightedMesh.meshId);
            if (mesh) {
                hl.addMesh(mesh, Color3.FromArray(highlightedMesh.color), highlightedMesh.glowEmissiveOnly);
            }
        }
        return hl;
    };
    /**
     * Effect Name of the highlight layer.
     */
    HighlightLayer.EffectName = "HighlightLayer";
    /**
     * The neutral color used during the preparation of the glow effect.
     * This is black by default as the blend operation is a blend operation.
     */
    HighlightLayer.NeutralColor = new Color4(0, 0, 0, 0);
    /**
     * Stencil value used for glowing meshes.
     */
    HighlightLayer.GlowingMeshStencilReference = 0x02;
    /**
     * Stencil value used for the other meshes in the scene.
     */
    HighlightLayer.NormalMeshStencilReference = 0x01;
    __decorate([
        serialize()
    ], HighlightLayer.prototype, "innerGlow", void 0);
    __decorate([
        serialize()
    ], HighlightLayer.prototype, "outerGlow", void 0);
    __decorate([
        serialize()
    ], HighlightLayer.prototype, "blurHorizontalSize", null);
    __decorate([
        serialize()
    ], HighlightLayer.prototype, "blurVerticalSize", null);
    __decorate([
        serialize("options")
    ], HighlightLayer.prototype, "_options", void 0);
    return HighlightLayer;
}(EffectLayer));
export { HighlightLayer };
RegisterClass("BABYLON.HighlightLayer", HighlightLayer);
//# sourceMappingURL=highlightLayer.js.map