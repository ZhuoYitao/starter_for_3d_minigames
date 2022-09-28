import { Color4 } from "../Maths/math.color.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Texture } from "../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { MaterialHelper } from "../Materials/materialHelper.js";
import { Camera } from "../Cameras/camera.js";

import "../Shaders/depth.fragment.js";
import "../Shaders/depth.vertex.js";
import { _WarnImport } from "../Misc/devTools.js";
/**
 * This represents a depth renderer in Babylon.
 * A depth renderer will render to it's depth map every frame which can be displayed or used in post processing
 */
var DepthRenderer = /** @class */ (function () {
    /**
     * Instantiates a depth renderer
     * @param scene The scene the renderer belongs to
     * @param type The texture type of the depth map (default: Engine.TEXTURETYPE_FLOAT)
     * @param camera The camera to be used to render the depth map (default: scene's active camera)
     * @param storeNonLinearDepth Defines whether the depth is stored linearly like in Babylon Shadows or directly like glFragCoord.z
     * @param samplingMode The sampling mode to be used with the render target (Linear, Nearest...)
     */
    function DepthRenderer(scene, type, camera, storeNonLinearDepth, samplingMode) {
        if (type === void 0) { type = 1; }
        if (camera === void 0) { camera = null; }
        if (storeNonLinearDepth === void 0) { storeNonLinearDepth = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        var _this = this;
        /** Enable or disable the depth renderer. When disabled, the depth texture is not updated */
        this.enabled = true;
        /** Force writing the transparent objects into the depth map */
        this.forceDepthWriteTransparentMeshes = false;
        /**
         * Specifies that the depth renderer will only be used within
         * the camera it is created for.
         * This can help forcing its rendering during the camera processing.
         */
        this.useOnlyInActiveCamera = false;
        this._scene = scene;
        this._storeNonLinearDepth = storeNonLinearDepth;
        this.isPacked = type === 0;
        if (this.isPacked) {
            this._clearColor = new Color4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            this._clearColor = new Color4(1.0, 0.0, 0.0, 1.0);
        }
        DepthRenderer._SceneComponentInitialization(this._scene);
        var engine = scene.getEngine();
        this._camera = camera;
        if (samplingMode !== Texture.NEAREST_SAMPLINGMODE) {
            if (type === 1 && !engine._caps.textureFloatLinearFiltering) {
                samplingMode = Texture.NEAREST_SAMPLINGMODE;
            }
            if (type === 2 && !engine._caps.textureHalfFloatLinearFiltering) {
                samplingMode = Texture.NEAREST_SAMPLINGMODE;
            }
        }
        // Render target
        var format = this.isPacked || !engine._features.supportExtendedTextureFormats ? 5 : 6;
        this._depthMap = new RenderTargetTexture("DepthRenderer", { width: engine.getRenderWidth(), height: engine.getRenderHeight() }, this._scene, false, true, type, false, samplingMode, undefined, undefined, undefined, format);
        this._depthMap.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._depthMap.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._depthMap.refreshRate = 1;
        this._depthMap.renderParticles = false;
        this._depthMap.renderList = null;
        // Camera to get depth map from to support multiple concurrent cameras
        this._depthMap.activeCamera = this._camera;
        this._depthMap.ignoreCameraViewport = true;
        this._depthMap.useCameraPostProcesses = false;
        // set default depth value to 1.0 (far away)
        this._depthMap.onClearObservable.add(function (engine) {
            engine.clear(_this._clearColor, true, true, true);
        });
        this._depthMap.onBeforeBindObservable.add(function () {
            var _a;
            (_a = engine._debugPushGroup) === null || _a === void 0 ? void 0 : _a.call(engine, "depth renderer", 1);
        });
        this._depthMap.onAfterUnbindObservable.add(function () {
            var _a;
            (_a = engine._debugPopGroup) === null || _a === void 0 ? void 0 : _a.call(engine, 1);
        });
        this._depthMap.customIsReadyFunction = function (mesh, refreshRate) {
            if (!mesh.isReady(false)) {
                return false;
            }
            if (refreshRate === 0 && mesh.subMeshes) {
                // full check: check that the effects are ready
                for (var i = 0; i < mesh.subMeshes.length; ++i) {
                    var subMesh = mesh.subMeshes[i];
                    var renderingMesh = subMesh.getRenderingMesh();
                    var batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
                    var hardwareInstancedRendering = engine.getCaps().instancedArrays &&
                        ((batch.visibleInstances[subMesh._id] !== null && batch.visibleInstances[subMesh._id] !== undefined) || renderingMesh.hasThinInstances);
                    if (!_this.isReady(subMesh, hardwareInstancedRendering)) {
                        return false;
                    }
                }
            }
            return true;
        };
        // Custom render function
        var renderSubMesh = function (subMesh) {
            var _a, _b;
            var renderingMesh = subMesh.getRenderingMesh();
            var effectiveMesh = subMesh.getEffectiveMesh();
            var scene = _this._scene;
            var engine = scene.getEngine();
            var material = subMesh.getMaterial();
            effectiveMesh._internalAbstractMeshDataInfo._isActiveIntermediate = false;
            if (!material || effectiveMesh.infiniteDistance || material.disableDepthWrite || subMesh.verticesCount === 0 || subMesh._renderId === scene.getRenderId()) {
                return;
            }
            // Culling
            var detNeg = effectiveMesh._getWorldMatrixDeterminant() < 0;
            var sideOrientation = (_a = renderingMesh.overrideMaterialSideOrientation) !== null && _a !== void 0 ? _a : material.sideOrientation;
            if (detNeg) {
                sideOrientation =
                    sideOrientation === 0
                        ? 1
                        : 0;
            }
            var reverseSideOrientation = sideOrientation === 0;
            engine.setState(material.backFaceCulling, 0, false, reverseSideOrientation, material.cullBackFaces);
            // Managing instances
            var batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
            if (batch.mustReturn) {
                return;
            }
            var hardwareInstancedRendering = engine.getCaps().instancedArrays &&
                ((batch.visibleInstances[subMesh._id] !== null && batch.visibleInstances[subMesh._id] !== undefined) || renderingMesh.hasThinInstances);
            var camera = _this._camera || scene.activeCamera;
            if (_this.isReady(subMesh, hardwareInstancedRendering) && camera) {
                subMesh._renderId = scene.getRenderId();
                var renderingMaterial = (_b = effectiveMesh._internalAbstractMeshDataInfo._materialForRenderPass) === null || _b === void 0 ? void 0 : _b[engine.currentRenderPassId];
                var drawWrapper = subMesh._getDrawWrapper();
                if (!drawWrapper && renderingMaterial) {
                    drawWrapper = renderingMaterial._getDrawWrapper();
                }
                var cameraIsOrtho = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;
                if (!drawWrapper) {
                    return;
                }
                var effect_1 = drawWrapper.effect;
                engine.enableEffect(drawWrapper);
                if (!hardwareInstancedRendering) {
                    renderingMesh._bind(subMesh, effect_1, material.fillMode);
                }
                if (!renderingMaterial) {
                    effect_1.setMatrix("viewProjection", scene.getTransformMatrix());
                    effect_1.setMatrix("world", effectiveMesh.getWorldMatrix());
                }
                else {
                    renderingMaterial.bindForSubMesh(effectiveMesh.getWorldMatrix(), effectiveMesh, subMesh);
                }
                var minZ = void 0, maxZ = void 0;
                if (cameraIsOrtho) {
                    minZ = !engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : 1;
                    maxZ = engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : 1;
                }
                else {
                    minZ = engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? camera.minZ : engine.isNDCHalfZRange ? 0 : camera.minZ;
                    maxZ = engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : camera.maxZ;
                }
                effect_1.setFloat2("depthValues", minZ, minZ + maxZ);
                if (!renderingMaterial) {
                    // Alpha test
                    if (material && material.needAlphaTesting()) {
                        var alphaTexture = material.getAlphaTestTexture();
                        if (alphaTexture) {
                            effect_1.setTexture("diffuseSampler", alphaTexture);
                            effect_1.setMatrix("diffuseMatrix", alphaTexture.getTextureMatrix());
                        }
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
                }
                // Draw
                renderingMesh._processRendering(effectiveMesh, subMesh, effect_1, material.fillMode, batch, hardwareInstancedRendering, function (isInstance, world) {
                    return effect_1.setMatrix("world", world);
                });
            }
        };
        this._depthMap.customRenderFunction = function (opaqueSubMeshes, alphaTestSubMeshes, transparentSubMeshes, depthOnlySubMeshes) {
            var index;
            if (depthOnlySubMeshes.length) {
                for (index = 0; index < depthOnlySubMeshes.length; index++) {
                    renderSubMesh(depthOnlySubMeshes.data[index]);
                }
            }
            for (index = 0; index < opaqueSubMeshes.length; index++) {
                renderSubMesh(opaqueSubMeshes.data[index]);
            }
            for (index = 0; index < alphaTestSubMeshes.length; index++) {
                renderSubMesh(alphaTestSubMeshes.data[index]);
            }
            if (_this.forceDepthWriteTransparentMeshes) {
                for (index = 0; index < transparentSubMeshes.length; index++) {
                    renderSubMesh(transparentSubMeshes.data[index]);
                }
            }
            else {
                for (index = 0; index < transparentSubMeshes.length; index++) {
                    transparentSubMeshes.data[index].getEffectiveMesh()._internalAbstractMeshDataInfo._isActiveIntermediate = false;
                }
            }
        };
    }
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes by the depth renderer
     * @param mesh mesh or array of meshes
     * @param material material to use by the depth render when rendering the mesh(es). If undefined is passed, the specific material created by the depth renderer will be used.
     */
    DepthRenderer.prototype.setMaterialForRendering = function (mesh, material) {
        this._depthMap.setMaterialForRendering(mesh, material);
    };
    /**
     * Creates the depth rendering effect and checks if the effect is ready.
     * @param subMesh The submesh to be used to render the depth map of
     * @param useInstances If multiple world instances should be used
     * @returns if the depth renderer is ready to render the depth map
     */
    DepthRenderer.prototype.isReady = function (subMesh, useInstances) {
        var _a;
        var engine = this._scene.getEngine();
        var mesh = subMesh.getMesh();
        var renderingMaterial = (_a = mesh._internalAbstractMeshDataInfo._materialForRenderPass) === null || _a === void 0 ? void 0 : _a[engine.currentRenderPassId];
        if (renderingMaterial) {
            return renderingMaterial.isReadyForSubMesh(mesh, subMesh, useInstances);
        }
        var material = subMesh.getMaterial();
        if (!material || material.disableDepthWrite) {
            return false;
        }
        var defines = [];
        var attribs = [VertexBuffer.PositionKind];
        // Alpha test
        if (material && material.needAlphaTesting() && material.getAlphaTestTexture()) {
            defines.push("#define ALPHATEST");
            if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                attribs.push(VertexBuffer.UVKind);
                defines.push("#define UV1");
            }
            if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind)) {
                attribs.push(VertexBuffer.UV2Kind);
                defines.push("#define UV2");
            }
        }
        // Bones
        if (mesh.useBones && mesh.computeBonesUsingShaders) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            defines.push("#define BonesPerMesh " + (mesh.skeleton ? mesh.skeleton.bones.length + 1 : 0));
            var skeleton = subMesh.getRenderingMesh().skeleton;
            if (skeleton === null || skeleton === void 0 ? void 0 : skeleton.isUsingTextureForMatrices) {
                defines.push("#define BONETEXTURE");
            }
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Morph targets
        var morphTargetManager = mesh.morphTargetManager;
        var numMorphInfluencers = 0;
        if (morphTargetManager) {
            if (morphTargetManager.numInfluencers > 0) {
                numMorphInfluencers = morphTargetManager.numInfluencers;
                defines.push("#define MORPHTARGETS");
                defines.push("#define NUM_MORPH_INFLUENCERS " + numMorphInfluencers);
                if (morphTargetManager.isUsingTextureForTargets) {
                    defines.push("#define MORPHTARGETS_TEXTURE");
                }
                MaterialHelper.PrepareAttributesForMorphTargetsInfluencers(attribs, mesh, numMorphInfluencers);
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
        // None linear depth
        if (this._storeNonLinearDepth) {
            defines.push("#define NONLINEARDEPTH");
        }
        // Float Mode
        if (this.isPacked) {
            defines.push("#define PACKED");
        }
        // Get correct effect
        var drawWrapper = subMesh._getDrawWrapper(undefined, true);
        var cachedDefines = drawWrapper.defines;
        var join = defines.join("\n");
        if (cachedDefines !== join) {
            drawWrapper.setEffect(engine.createEffect("depth", attribs, [
                "world",
                "mBones",
                "boneTextureWidth",
                "viewProjection",
                "diffuseMatrix",
                "depthValues",
                "morphTargetInfluences",
                "morphTargetTextureInfo",
                "morphTargetTextureIndices",
            ], ["diffuseSampler", "morphTargets", "boneSampler"], join, undefined, undefined, undefined, { maxSimultaneousMorphTargets: numMorphInfluencers }), join);
        }
        return drawWrapper.effect.isReady();
    };
    /**
     * Gets the texture which the depth map will be written to.
     * @returns The depth map texture
     */
    DepthRenderer.prototype.getDepthMap = function () {
        return this._depthMap;
    };
    /**
     * Disposes of the depth renderer.
     */
    DepthRenderer.prototype.dispose = function () {
        var keysToDelete = [];
        for (var key in this._scene._depthRenderer) {
            var depthRenderer = this._scene._depthRenderer[key];
            if (depthRenderer === this) {
                keysToDelete.push(key);
            }
        }
        if (keysToDelete.length > 0) {
            this._depthMap.dispose();
            for (var _i = 0, keysToDelete_1 = keysToDelete; _i < keysToDelete_1.length; _i++) {
                var key = keysToDelete_1[_i];
                delete this._scene._depthRenderer[key];
            }
        }
    };
    /**
     * @param _
     * @hidden
     */
    DepthRenderer._SceneComponentInitialization = function (_) {
        throw _WarnImport("DepthRendererSceneComponent");
    };
    return DepthRenderer;
}());
export { DepthRenderer };
//# sourceMappingURL=depthRenderer.js.map