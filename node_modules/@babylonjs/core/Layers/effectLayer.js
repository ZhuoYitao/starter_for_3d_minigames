import { __assign, __decorate } from "tslib";
import { serialize, serializeAsColor4, serializeAsCameraReference } from "../Misc/decorators.js";
import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { Color4 } from "../Maths/math.color.js";
import { Engine } from "../Engines/engine.js";
import { EngineStore } from "../Engines/engineStore.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Texture } from "../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { Material } from "../Materials/material.js";
import { MaterialHelper } from "../Materials/materialHelper.js";

import "../Shaders/glowMapGeneration.fragment.js";
import "../Shaders/glowMapGeneration.vertex.js";
import { _WarnImport } from "../Misc/devTools.js";
import { EffectFallbacks } from "../Materials/effectFallbacks.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
/**
 * The effect layer Helps adding post process effect blended with the main pass.
 *
 * This can be for instance use to generate glow or highlight effects on the scene.
 *
 * The effect layer class can not be used directly and is intented to inherited from to be
 * customized per effects.
 */
var EffectLayer = /** @class */ (function () {
    /**
     * Instantiates a new effect Layer and references it in the scene.
     * @param name The name of the layer
     * @param scene The scene to use the layer in
     */
    function EffectLayer(
    /** The Friendly of the effect in the scene */
    name, scene) {
        this._vertexBuffers = {};
        this._maxSize = 0;
        this._mainTextureDesiredSize = { width: 0, height: 0 };
        this._shouldRender = true;
        this._postProcesses = [];
        this._textures = [];
        this._emissiveTextureAndColor = { texture: null, color: new Color4() };
        /**
         * The clear color of the texture used to generate the glow map.
         */
        this.neutralColor = new Color4();
        /**
         * Specifies whether the highlight layer is enabled or not.
         */
        this.isEnabled = true;
        /**
         * Specifies if the bounding boxes should be rendered normally or if they should undergo the effect of the layer
         */
        this.disableBoundingBoxesFromEffectLayer = false;
        /**
         * An event triggered when the effect layer has been disposed.
         */
        this.onDisposeObservable = new Observable();
        /**
         * An event triggered when the effect layer is about rendering the main texture with the glowy parts.
         */
        this.onBeforeRenderMainTextureObservable = new Observable();
        /**
         * An event triggered when the generated texture is being merged in the scene.
         */
        this.onBeforeComposeObservable = new Observable();
        /**
         * An event triggered when the mesh is rendered into the effect render target.
         */
        this.onBeforeRenderMeshToEffect = new Observable();
        /**
         * An event triggered after the mesh has been rendered into the effect render target.
         */
        this.onAfterRenderMeshToEffect = new Observable();
        /**
         * An event triggered when the generated texture has been merged in the scene.
         */
        this.onAfterComposeObservable = new Observable();
        /**
         * An event triggered when the effect layer changes its size.
         */
        this.onSizeChangedObservable = new Observable();
        this._materialForRendering = {};
        this.name = name;
        this._scene = scene || EngineStore.LastCreatedScene;
        EffectLayer._SceneComponentInitialization(this._scene);
        this._engine = this._scene.getEngine();
        this._maxSize = this._engine.getCaps().maxTextureSize;
        this._scene.effectLayers.push(this);
        this._mergeDrawWrapper = [];
        // Generate Buffers
        this._generateIndexBuffer();
        this._generateVertexBuffer();
    }
    Object.defineProperty(EffectLayer.prototype, "camera", {
        /**
         * Gets the camera attached to the layer.
         */
        get: function () {
            return this._effectLayerOptions.camera;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EffectLayer.prototype, "renderingGroupId", {
        /**
         * Gets the rendering group id the layer should render in.
         */
        get: function () {
            return this._effectLayerOptions.renderingGroupId;
        },
        set: function (renderingGroupId) {
            this._effectLayerOptions.renderingGroupId = renderingGroupId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EffectLayer.prototype, "mainTexture", {
        /**
         * Gets the main texture where the effect is rendered
         */
        get: function () {
            return this._mainTexture;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes in the layer
     * @param mesh mesh or array of meshes
     * @param material material to use by the layer when rendering the mesh(es). If undefined is passed, the specific material created by the layer will be used.
     */
    EffectLayer.prototype.setMaterialForRendering = function (mesh, material) {
        this._mainTexture.setMaterialForRendering(mesh, material);
        if (Array.isArray(mesh)) {
            for (var i = 0; i < mesh.length; ++i) {
                var currentMesh = mesh[i];
                if (!material) {
                    delete this._materialForRendering[currentMesh.uniqueId];
                }
                else {
                    this._materialForRendering[currentMesh.uniqueId] = [currentMesh, material];
                }
            }
        }
        else {
            if (!material) {
                delete this._materialForRendering[mesh.uniqueId];
            }
            else {
                this._materialForRendering[mesh.uniqueId] = [mesh, material];
            }
        }
    };
    /**
     * Number of times _internalRender will be called. Some effect layers need to render the mesh several times, so they should override this method with the number of times the mesh should be rendered
     * @returns Number of times a mesh must be rendered in the layer
     */
    EffectLayer.prototype._numInternalDraws = function () {
        return 1;
    };
    /**
     * Initializes the effect layer with the required options.
     * @param options Sets of none mandatory options to use with the layer (see IEffectLayerOptions for more information)
     */
    EffectLayer.prototype._init = function (options) {
        // Adapt options
        this._effectLayerOptions = __assign({ mainTextureRatio: 0.5, alphaBlendingMode: 2, camera: null, renderingGroupId: -1 }, options);
        this._setMainTextureSize();
        this._createMainTexture();
        this._createTextureAndPostProcesses();
    };
    /**
     * Generates the index buffer of the full screen quad blending to the main canvas.
     */
    EffectLayer.prototype._generateIndexBuffer = function () {
        // Indices
        var indices = [];
        indices.push(0);
        indices.push(1);
        indices.push(2);
        indices.push(0);
        indices.push(2);
        indices.push(3);
        this._indexBuffer = this._engine.createIndexBuffer(indices);
    };
    /**
     * Generates the vertex buffer of the full screen quad blending to the main canvas.
     */
    EffectLayer.prototype._generateVertexBuffer = function () {
        // VBO
        var vertices = [];
        vertices.push(1, 1);
        vertices.push(-1, 1);
        vertices.push(-1, -1);
        vertices.push(1, -1);
        var vertexBuffer = new VertexBuffer(this._engine, vertices, VertexBuffer.PositionKind, false, false, 2);
        this._vertexBuffers[VertexBuffer.PositionKind] = vertexBuffer;
    };
    /**
     * Sets the main texture desired size which is the closest power of two
     * of the engine canvas size.
     */
    EffectLayer.prototype._setMainTextureSize = function () {
        if (this._effectLayerOptions.mainTextureFixedSize) {
            this._mainTextureDesiredSize.width = this._effectLayerOptions.mainTextureFixedSize;
            this._mainTextureDesiredSize.height = this._effectLayerOptions.mainTextureFixedSize;
        }
        else {
            this._mainTextureDesiredSize.width = this._engine.getRenderWidth() * this._effectLayerOptions.mainTextureRatio;
            this._mainTextureDesiredSize.height = this._engine.getRenderHeight() * this._effectLayerOptions.mainTextureRatio;
            this._mainTextureDesiredSize.width = this._engine.needPOTTextures
                ? Engine.GetExponentOfTwo(this._mainTextureDesiredSize.width, this._maxSize)
                : this._mainTextureDesiredSize.width;
            this._mainTextureDesiredSize.height = this._engine.needPOTTextures
                ? Engine.GetExponentOfTwo(this._mainTextureDesiredSize.height, this._maxSize)
                : this._mainTextureDesiredSize.height;
        }
        this._mainTextureDesiredSize.width = Math.floor(this._mainTextureDesiredSize.width);
        this._mainTextureDesiredSize.height = Math.floor(this._mainTextureDesiredSize.height);
    };
    /**
     * Creates the main texture for the effect layer.
     */
    EffectLayer.prototype._createMainTexture = function () {
        var _this = this;
        this._mainTexture = new RenderTargetTexture("EffectLayerMainRTT", {
            width: this._mainTextureDesiredSize.width,
            height: this._mainTextureDesiredSize.height,
        }, this._scene, false, true, 0);
        this._mainTexture.activeCamera = this._effectLayerOptions.camera;
        this._mainTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._mainTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._mainTexture.anisotropicFilteringLevel = 1;
        this._mainTexture.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
        this._mainTexture.renderParticles = false;
        this._mainTexture.renderList = null;
        this._mainTexture.ignoreCameraViewport = true;
        for (var id in this._materialForRendering) {
            var _a = this._materialForRendering[id], mesh = _a[0], material = _a[1];
            this._mainTexture.setMaterialForRendering(mesh, material);
        }
        this._mainTexture.customIsReadyFunction = function (mesh, refreshRate) {
            if (!mesh.isReady(false)) {
                return false;
            }
            if (refreshRate === 0 && mesh.subMeshes) {
                // full check: check that the effects are ready
                for (var i = 0; i < mesh.subMeshes.length; ++i) {
                    var subMesh = mesh.subMeshes[i];
                    var material = subMesh.getMaterial();
                    var renderingMesh = subMesh.getRenderingMesh();
                    if (!material) {
                        continue;
                    }
                    var batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
                    var hardwareInstancedRendering = batch.hardwareInstancedRendering[subMesh._id] || renderingMesh.hasThinInstances;
                    _this._setEmissiveTextureAndColor(renderingMesh, subMesh, material);
                    if (!_this._isReady(subMesh, hardwareInstancedRendering, _this._emissiveTextureAndColor.texture)) {
                        return false;
                    }
                }
            }
            return true;
        };
        // Custom render function
        this._mainTexture.customRenderFunction = function (opaqueSubMeshes, alphaTestSubMeshes, transparentSubMeshes, depthOnlySubMeshes) {
            _this.onBeforeRenderMainTextureObservable.notifyObservers(_this);
            var index;
            var engine = _this._scene.getEngine();
            if (depthOnlySubMeshes.length) {
                engine.setColorWrite(false);
                for (index = 0; index < depthOnlySubMeshes.length; index++) {
                    _this._renderSubMesh(depthOnlySubMeshes.data[index]);
                }
                engine.setColorWrite(true);
            }
            for (index = 0; index < opaqueSubMeshes.length; index++) {
                _this._renderSubMesh(opaqueSubMeshes.data[index]);
            }
            for (index = 0; index < alphaTestSubMeshes.length; index++) {
                _this._renderSubMesh(alphaTestSubMeshes.data[index]);
            }
            var previousAlphaMode = engine.getAlphaMode();
            for (index = 0; index < transparentSubMeshes.length; index++) {
                _this._renderSubMesh(transparentSubMeshes.data[index], true);
            }
            engine.setAlphaMode(previousAlphaMode);
        };
        this._mainTexture.onClearObservable.add(function (engine) {
            engine.clear(_this.neutralColor, true, true, true);
        });
        // Prevent package size in es6 (getBoundingBoxRenderer might not be present)
        if (this._scene.getBoundingBoxRenderer) {
            var boundingBoxRendererEnabled_1 = this._scene.getBoundingBoxRenderer().enabled;
            this._mainTexture.onBeforeBindObservable.add(function () {
                _this._scene.getBoundingBoxRenderer().enabled = !_this.disableBoundingBoxesFromEffectLayer && boundingBoxRendererEnabled_1;
            });
            this._mainTexture.onAfterUnbindObservable.add(function () {
                _this._scene.getBoundingBoxRenderer().enabled = boundingBoxRendererEnabled_1;
            });
        }
    };
    /**
     * Adds specific effects defines.
     * @param defines The defines to add specifics to.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EffectLayer.prototype._addCustomEffectDefines = function (defines) {
        // Nothing to add by default.
    };
    /**
     * Checks for the readiness of the element composing the layer.
     * @param subMesh the mesh to check for
     * @param useInstances specify whether or not to use instances to render the mesh
     * @param emissiveTexture the associated emissive texture used to generate the glow
     * @return true if ready otherwise, false
     */
    EffectLayer.prototype._isReady = function (subMesh, useInstances, emissiveTexture) {
        var _a;
        var engine = this._scene.getEngine();
        var mesh = subMesh.getMesh();
        var renderingMaterial = (_a = mesh._internalAbstractMeshDataInfo._materialForRenderPass) === null || _a === void 0 ? void 0 : _a[engine.currentRenderPassId];
        if (renderingMaterial) {
            return renderingMaterial.isReadyForSubMesh(mesh, subMesh, useInstances);
        }
        var material = subMesh.getMaterial();
        if (!material) {
            return false;
        }
        if (this._useMeshMaterial(subMesh.getRenderingMesh())) {
            return material.isReadyForSubMesh(subMesh.getMesh(), subMesh, useInstances);
        }
        var defines = [];
        var attribs = [VertexBuffer.PositionKind];
        var uv1 = false;
        var uv2 = false;
        // Diffuse
        if (material) {
            var needAlphaTest = material.needAlphaTesting();
            var diffuseTexture = material.getAlphaTestTexture();
            var needAlphaBlendFromDiffuse = diffuseTexture && diffuseTexture.hasAlpha && (material.useAlphaFromDiffuseTexture || material._useAlphaFromAlbedoTexture);
            if (diffuseTexture && (needAlphaTest || needAlphaBlendFromDiffuse)) {
                defines.push("#define DIFFUSE");
                if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind) && diffuseTexture.coordinatesIndex === 1) {
                    defines.push("#define DIFFUSEUV2");
                    uv2 = true;
                }
                else if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                    defines.push("#define DIFFUSEUV1");
                    uv1 = true;
                }
                if (needAlphaTest) {
                    defines.push("#define ALPHATEST");
                    defines.push("#define ALPHATESTVALUE 0.4");
                }
                if (!diffuseTexture.gammaSpace) {
                    defines.push("#define DIFFUSE_ISLINEAR");
                }
            }
            var opacityTexture = material.opacityTexture;
            if (opacityTexture) {
                defines.push("#define OPACITY");
                if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind) && opacityTexture.coordinatesIndex === 1) {
                    defines.push("#define OPACITYUV2");
                    uv2 = true;
                }
                else if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                    defines.push("#define OPACITYUV1");
                    uv1 = true;
                }
            }
        }
        // Emissive
        if (emissiveTexture) {
            defines.push("#define EMISSIVE");
            if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind) && emissiveTexture.coordinatesIndex === 1) {
                defines.push("#define EMISSIVEUV2");
                uv2 = true;
            }
            else if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                defines.push("#define EMISSIVEUV1");
                uv1 = true;
            }
            if (!emissiveTexture.gammaSpace) {
                defines.push("#define EMISSIVE_ISLINEAR");
            }
        }
        // Vertex
        if (mesh.useVertexColors && mesh.isVerticesDataPresent(VertexBuffer.ColorKind) && mesh.hasVertexAlpha && material.transparencyMode !== Material.MATERIAL_OPAQUE) {
            attribs.push(VertexBuffer.ColorKind);
            defines.push("#define VERTEXALPHA");
        }
        if (uv1) {
            attribs.push(VertexBuffer.UVKind);
            defines.push("#define UV1");
        }
        if (uv2) {
            attribs.push(VertexBuffer.UV2Kind);
            defines.push("#define UV2");
        }
        // Bones
        var fallbacks = new EffectFallbacks();
        if (mesh.useBones && mesh.computeBonesUsingShaders) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            var skeleton = mesh.skeleton;
            if (skeleton && skeleton.isUsingTextureForMatrices) {
                defines.push("#define BONETEXTURE");
            }
            else {
                defines.push("#define BonesPerMesh " + (skeleton ? skeleton.bones.length + 1 : 0));
            }
            if (mesh.numBoneInfluencers > 0) {
                fallbacks.addCPUSkinningFallback(0, mesh);
            }
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Morph targets
        var manager = mesh.morphTargetManager;
        var morphInfluencers = 0;
        if (manager) {
            if (manager.numInfluencers > 0) {
                defines.push("#define MORPHTARGETS");
                morphInfluencers = manager.numInfluencers;
                defines.push("#define NUM_MORPH_INFLUENCERS " + morphInfluencers);
                if (manager.isUsingTextureForTargets) {
                    defines.push("#define MORPHTARGETS_TEXTURE");
                }
                MaterialHelper.PrepareAttributesForMorphTargetsInfluencers(attribs, mesh, morphInfluencers);
            }
        }
        // Instances
        if (useInstances) {
            defines.push("#define INSTANCES");
            MaterialHelper.PushAttributesForInstances(attribs);
            if (subMesh.getRenderingMesh().hasThinInstances) {
                defines.push("#define THIN_INSTANCES");
            }
        }
        this._addCustomEffectDefines(defines);
        // Get correct effect
        var drawWrapper = subMesh._getDrawWrapper(undefined, true);
        var cachedDefines = drawWrapper.defines;
        var join = defines.join("\n");
        if (cachedDefines !== join) {
            drawWrapper.setEffect(this._engine.createEffect("glowMapGeneration", attribs, [
                "world",
                "mBones",
                "viewProjection",
                "glowColor",
                "morphTargetInfluences",
                "boneTextureWidth",
                "diffuseMatrix",
                "emissiveMatrix",
                "opacityMatrix",
                "opacityIntensity",
                "morphTargetTextureInfo",
                "morphTargetTextureIndices",
            ], ["diffuseSampler", "emissiveSampler", "opacitySampler", "boneSampler", "morphTargets"], join, fallbacks, undefined, undefined, { maxSimultaneousMorphTargets: morphInfluencers }), join);
        }
        return drawWrapper.effect.isReady();
    };
    /**
     * Renders the glowing part of the scene by blending the blurred glowing meshes on top of the rendered scene.
     */
    EffectLayer.prototype.render = function () {
        for (var i = 0; i < this._postProcesses.length; i++) {
            if (!this._postProcesses[i].isReady()) {
                return;
            }
        }
        var engine = this._scene.getEngine();
        var numDraws = this._numInternalDraws();
        // Check
        var isReady = true;
        for (var i = 0; i < numDraws; ++i) {
            var currentEffect = this._mergeDrawWrapper[i];
            if (!currentEffect) {
                currentEffect = this._mergeDrawWrapper[i] = new DrawWrapper(this._engine);
                currentEffect.setEffect(this._createMergeEffect());
            }
            isReady = isReady && currentEffect.effect.isReady();
        }
        if (!isReady) {
            return;
        }
        this.onBeforeComposeObservable.notifyObservers(this);
        var previousAlphaMode = engine.getAlphaMode();
        for (var i = 0; i < numDraws; ++i) {
            var currentEffect = this._mergeDrawWrapper[i];
            // Render
            engine.enableEffect(currentEffect);
            engine.setState(false);
            // VBOs
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, currentEffect.effect);
            // Go Blend.
            engine.setAlphaMode(this._effectLayerOptions.alphaBlendingMode);
            // Blends the map on the main canvas.
            this._internalRender(currentEffect.effect, i);
        }
        // Restore Alpha
        engine.setAlphaMode(previousAlphaMode);
        this.onAfterComposeObservable.notifyObservers(this);
        // Handle size changes.
        var size = this._mainTexture.getSize();
        this._setMainTextureSize();
        if ((size.width !== this._mainTextureDesiredSize.width || size.height !== this._mainTextureDesiredSize.height) &&
            this._mainTextureDesiredSize.width !== 0 &&
            this._mainTextureDesiredSize.height !== 0) {
            // Recreate RTT and post processes on size change.
            this.onSizeChangedObservable.notifyObservers(this);
            this._disposeTextureAndPostProcesses();
            this._createMainTexture();
            this._createTextureAndPostProcesses();
        }
    };
    /**
     * Determine if a given mesh will be used in the current effect.
     * @param mesh mesh to test
     * @returns true if the mesh will be used
     */
    EffectLayer.prototype.hasMesh = function (mesh) {
        if (this.renderingGroupId === -1 || mesh.renderingGroupId === this.renderingGroupId) {
            return true;
        }
        return false;
    };
    /**
     * Returns true if the layer contains information to display, otherwise false.
     * @returns true if the glow layer should be rendered
     */
    EffectLayer.prototype.shouldRender = function () {
        return this.isEnabled && this._shouldRender;
    };
    /**
     * Returns true if the mesh should render, otherwise false.
     * @param mesh The mesh to render
     * @returns true if it should render otherwise false
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EffectLayer.prototype._shouldRenderMesh = function (mesh) {
        return true;
    };
    /**
     * Returns true if the mesh can be rendered, otherwise false.
     * @param mesh The mesh to render
     * @param material The material used on the mesh
     * @returns true if it can be rendered otherwise false
     */
    EffectLayer.prototype._canRenderMesh = function (mesh, material) {
        return !material.needAlphaBlendingForMesh(mesh);
    };
    /**
     * Returns true if the mesh should render, otherwise false.
     * @returns true if it should render otherwise false
     */
    EffectLayer.prototype._shouldRenderEmissiveTextureForMesh = function () {
        return true;
    };
    /**
     * Renders the submesh passed in parameter to the generation map.
     * @param subMesh
     * @param enableAlphaMode
     */
    EffectLayer.prototype._renderSubMesh = function (subMesh, enableAlphaMode) {
        var _a, _b;
        if (enableAlphaMode === void 0) { enableAlphaMode = false; }
        if (!this.shouldRender()) {
            return;
        }
        var material = subMesh.getMaterial();
        var ownerMesh = subMesh.getMesh();
        var replacementMesh = subMesh.getReplacementMesh();
        var renderingMesh = subMesh.getRenderingMesh();
        var effectiveMesh = subMesh.getEffectiveMesh();
        var scene = this._scene;
        var engine = scene.getEngine();
        effectiveMesh._internalAbstractMeshDataInfo._isActiveIntermediate = false;
        if (!material) {
            return;
        }
        // Do not block in blend mode.
        if (!this._canRenderMesh(renderingMesh, material)) {
            return;
        }
        // Culling
        var sideOrientation = (_a = renderingMesh.overrideMaterialSideOrientation) !== null && _a !== void 0 ? _a : material.sideOrientation;
        var mainDeterminant = effectiveMesh._getWorldMatrixDeterminant();
        if (mainDeterminant < 0) {
            sideOrientation = sideOrientation === Material.ClockWiseSideOrientation ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
        }
        var reverse = sideOrientation === Material.ClockWiseSideOrientation;
        engine.setState(material.backFaceCulling, material.zOffset, undefined, reverse, material.cullBackFaces, undefined, material.zOffsetUnits);
        // Managing instances
        var batch = renderingMesh._getInstancesRenderList(subMesh._id, !!replacementMesh);
        if (batch.mustReturn) {
            return;
        }
        // Early Exit per mesh
        if (!this._shouldRenderMesh(renderingMesh)) {
            return;
        }
        var hardwareInstancedRendering = batch.hardwareInstancedRendering[subMesh._id] || renderingMesh.hasThinInstances;
        this._setEmissiveTextureAndColor(renderingMesh, subMesh, material);
        this.onBeforeRenderMeshToEffect.notifyObservers(ownerMesh);
        if (this._useMeshMaterial(renderingMesh)) {
            renderingMesh.render(subMesh, hardwareInstancedRendering, replacementMesh || undefined);
        }
        else if (this._isReady(subMesh, hardwareInstancedRendering, this._emissiveTextureAndColor.texture)) {
            var renderingMaterial = (_b = effectiveMesh._internalAbstractMeshDataInfo._materialForRenderPass) === null || _b === void 0 ? void 0 : _b[engine.currentRenderPassId];
            var drawWrapper = subMesh._getDrawWrapper();
            if (!drawWrapper && renderingMaterial) {
                drawWrapper = renderingMaterial._getDrawWrapper();
            }
            if (!drawWrapper) {
                return;
            }
            var effect_1 = drawWrapper.effect;
            engine.enableEffect(drawWrapper);
            if (!hardwareInstancedRendering) {
                var fillMode = scene.forcePointsCloud ? Material.PointFillMode : scene.forceWireframe ? Material.WireFrameFillMode : material.fillMode;
                renderingMesh._bind(subMesh, effect_1, fillMode);
            }
            if (!renderingMaterial) {
                effect_1.setMatrix("viewProjection", scene.getTransformMatrix());
                effect_1.setMatrix("world", effectiveMesh.getWorldMatrix());
                effect_1.setFloat4("glowColor", this._emissiveTextureAndColor.color.r, this._emissiveTextureAndColor.color.g, this._emissiveTextureAndColor.color.b, this._emissiveTextureAndColor.color.a);
            }
            else {
                renderingMaterial.bindForSubMesh(effectiveMesh.getWorldMatrix(), effectiveMesh, subMesh);
            }
            if (!renderingMaterial) {
                var needAlphaTest = material.needAlphaTesting();
                var diffuseTexture = material.getAlphaTestTexture();
                var needAlphaBlendFromDiffuse = diffuseTexture && diffuseTexture.hasAlpha && (material.useAlphaFromDiffuseTexture || material._useAlphaFromAlbedoTexture);
                if (diffuseTexture && (needAlphaTest || needAlphaBlendFromDiffuse)) {
                    effect_1.setTexture("diffuseSampler", diffuseTexture);
                    var textureMatrix = diffuseTexture.getTextureMatrix();
                    if (textureMatrix) {
                        effect_1.setMatrix("diffuseMatrix", textureMatrix);
                    }
                }
                var opacityTexture = material.opacityTexture;
                if (opacityTexture) {
                    effect_1.setTexture("opacitySampler", opacityTexture);
                    effect_1.setFloat("opacityIntensity", opacityTexture.level);
                    var textureMatrix = opacityTexture.getTextureMatrix();
                    if (textureMatrix) {
                        effect_1.setMatrix("opacityMatrix", textureMatrix);
                    }
                }
                // Glow emissive only
                if (this._emissiveTextureAndColor.texture) {
                    effect_1.setTexture("emissiveSampler", this._emissiveTextureAndColor.texture);
                    effect_1.setMatrix("emissiveMatrix", this._emissiveTextureAndColor.texture.getTextureMatrix());
                }
                // Bones
                if (renderingMesh.useBones && renderingMesh.computeBonesUsingShaders && renderingMesh.skeleton) {
                    var skeleton = renderingMesh.skeleton;
                    if (skeleton.isUsingTextureForMatrices) {
                        var boneTexture = skeleton.getTransformMatrixTexture(renderingMesh);
                        if (!boneTexture) {
                            return;
                        }
                        effect_1.setTexture("boneSampler", boneTexture);
                        effect_1.setFloat("boneTextureWidth", 4.0 * (skeleton.bones.length + 1));
                    }
                    else {
                        effect_1.setMatrices("mBones", skeleton.getTransformMatrices(renderingMesh));
                    }
                }
                // Morph targets
                MaterialHelper.BindMorphTargetParameters(renderingMesh, effect_1);
                if (renderingMesh.morphTargetManager && renderingMesh.morphTargetManager.isUsingTextureForTargets) {
                    renderingMesh.morphTargetManager._bind(effect_1);
                }
                // Alpha mode
                if (enableAlphaMode) {
                    engine.setAlphaMode(material.alphaMode);
                }
            }
            // Draw
            renderingMesh._processRendering(effectiveMesh, subMesh, effect_1, material.fillMode, batch, hardwareInstancedRendering, function (isInstance, world) {
                return effect_1.setMatrix("world", world);
            });
        }
        else {
            // Need to reset refresh rate of the main map
            this._mainTexture.resetRefreshCounter();
        }
        this.onAfterRenderMeshToEffect.notifyObservers(ownerMesh);
    };
    /**
     * Defines whether the current material of the mesh should be use to render the effect.
     * @param mesh defines the current mesh to render
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EffectLayer.prototype._useMeshMaterial = function (mesh) {
        return false;
    };
    /**
     * Rebuild the required buffers.
     * @hidden Internal use only.
     */
    EffectLayer.prototype._rebuild = function () {
        var vb = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vb) {
            vb._rebuild();
        }
        this._generateIndexBuffer();
    };
    /**
     * Dispose only the render target textures and post process.
     */
    EffectLayer.prototype._disposeTextureAndPostProcesses = function () {
        this._mainTexture.dispose();
        for (var i = 0; i < this._postProcesses.length; i++) {
            if (this._postProcesses[i]) {
                this._postProcesses[i].dispose();
            }
        }
        this._postProcesses = [];
        for (var i = 0; i < this._textures.length; i++) {
            if (this._textures[i]) {
                this._textures[i].dispose();
            }
        }
        this._textures = [];
    };
    /**
     * Dispose the highlight layer and free resources.
     */
    EffectLayer.prototype.dispose = function () {
        var vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        if (this._indexBuffer) {
            this._scene.getEngine()._releaseBuffer(this._indexBuffer);
            this._indexBuffer = null;
        }
        for (var _i = 0, _a = this._mergeDrawWrapper; _i < _a.length; _i++) {
            var drawWrapper = _a[_i];
            drawWrapper.dispose();
        }
        this._mergeDrawWrapper = [];
        // Clean textures and post processes
        this._disposeTextureAndPostProcesses();
        // Remove from scene
        var index = this._scene.effectLayers.indexOf(this, 0);
        if (index > -1) {
            this._scene.effectLayers.splice(index, 1);
        }
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.onBeforeRenderMainTextureObservable.clear();
        this.onBeforeComposeObservable.clear();
        this.onBeforeRenderMeshToEffect.clear();
        this.onAfterRenderMeshToEffect.clear();
        this.onAfterComposeObservable.clear();
        this.onSizeChangedObservable.clear();
    };
    /**
     * Gets the class name of the effect layer
     * @returns the string with the class name of the effect layer
     */
    EffectLayer.prototype.getClassName = function () {
        return "EffectLayer";
    };
    /**
     * Creates an effect layer from parsed effect layer data
     * @param parsedEffectLayer defines effect layer data
     * @param scene defines the current scene
     * @param rootUrl defines the root URL containing the effect layer information
     * @returns a parsed effect Layer
     */
    EffectLayer.Parse = function (parsedEffectLayer, scene, rootUrl) {
        var effectLayerType = Tools.Instantiate(parsedEffectLayer.customType);
        return effectLayerType.Parse(parsedEffectLayer, scene, rootUrl);
    };
    /**
     * @param _
     * @hidden
     */
    EffectLayer._SceneComponentInitialization = function (_) {
        throw _WarnImport("EffectLayerSceneComponent");
    };
    __decorate([
        serialize()
    ], EffectLayer.prototype, "name", void 0);
    __decorate([
        serializeAsColor4()
    ], EffectLayer.prototype, "neutralColor", void 0);
    __decorate([
        serialize()
    ], EffectLayer.prototype, "isEnabled", void 0);
    __decorate([
        serializeAsCameraReference()
    ], EffectLayer.prototype, "camera", null);
    __decorate([
        serialize()
    ], EffectLayer.prototype, "renderingGroupId", null);
    __decorate([
        serialize()
    ], EffectLayer.prototype, "disableBoundingBoxesFromEffectLayer", void 0);
    return EffectLayer;
}());
export { EffectLayer };
//# sourceMappingURL=effectLayer.js.map