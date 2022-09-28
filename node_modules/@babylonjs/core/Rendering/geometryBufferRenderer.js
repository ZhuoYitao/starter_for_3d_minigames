import { Matrix } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";

import { Texture } from "../Materials/Textures/texture.js";
import { MultiRenderTarget } from "../Materials/Textures/multiRenderTarget.js";
import { MaterialHelper } from "../Materials/materialHelper.js";
import { Color4 } from "../Maths/math.color.js";
import { _WarnImport } from "../Misc/devTools.js";
import { Material } from "../Materials/material.js";
import "../Shaders/geometry.fragment.js";
import "../Shaders/geometry.vertex.js";
import { MaterialFlags } from "../Materials/materialFlags.js";
/**
 * This renderer is helpful to fill one of the render target with a geometry buffer.
 */
var GeometryBufferRenderer = /** @class */ (function () {
    /**
     * Creates a new G Buffer for the scene
     * @param scene The scene the buffer belongs to
     * @param ratio How big is the buffer related to the main canvas.
     */
    function GeometryBufferRenderer(scene, ratio) {
        if (ratio === void 0) { ratio = 1; }
        /**
         * Dictionary used to store the previous transformation matrices of each rendered mesh
         * in order to compute objects velocities when enableVelocity is set to "true"
         * @hidden
         */
        this._previousTransformationMatrices = {};
        /**
         * Dictionary used to store the previous bones transformation matrices of each rendered mesh
         * in order to compute objects velocities when enableVelocity is set to "true"
         * @hidden
         */
        this._previousBonesTransformationMatrices = {};
        /**
         * Array used to store the ignored skinned meshes while computing velocity map (typically used by the motion blur post-process).
         * Avoids computing bones velocities and computes only mesh's velocity itself (position, rotation, scaling).
         */
        this.excludedSkinnedMeshesFromVelocity = [];
        /** Gets or sets a boolean indicating if transparent meshes should be rendered */
        this.renderTransparentMeshes = true;
        this._resizeObserver = null;
        this._enablePosition = false;
        this._enableVelocity = false;
        this._enableReflectivity = false;
        this._positionIndex = -1;
        this._velocityIndex = -1;
        this._reflectivityIndex = -1;
        this._depthIndex = -1;
        this._normalIndex = -1;
        this._linkedWithPrePass = false;
        this._scene = scene;
        this._ratio = ratio;
        this._useUbo = scene.getEngine().supportsUniformBuffers;
        GeometryBufferRenderer._SceneComponentInitialization(this._scene);
        // Render target
        this._createRenderTargets();
    }
    /**
     * @param prePassRenderer
     * @hidden
     * Sets up internal structures to share outputs with PrePassRenderer
     * This method should only be called by the PrePassRenderer itself
     */
    GeometryBufferRenderer.prototype._linkPrePassRenderer = function (prePassRenderer) {
        this._linkedWithPrePass = true;
        this._prePassRenderer = prePassRenderer;
        if (this._multiRenderTarget) {
            // prevents clearing of the RT since it's done by prepass
            this._multiRenderTarget.onClearObservable.clear();
            this._multiRenderTarget.onClearObservable.add(function () {
                // pass
            });
        }
    };
    /**
     * @hidden
     * Separates internal structures from PrePassRenderer so the geometry buffer can now operate by itself.
     * This method should only be called by the PrePassRenderer itself
     */
    GeometryBufferRenderer.prototype._unlinkPrePassRenderer = function () {
        this._linkedWithPrePass = false;
        this._createRenderTargets();
    };
    /**
     * @hidden
     * Resets the geometry buffer layout
     */
    GeometryBufferRenderer.prototype._resetLayout = function () {
        this._enablePosition = false;
        this._enableReflectivity = false;
        this._enableVelocity = false;
        this._attachments = [];
    };
    /**
     * @param geometryBufferType
     * @param index
     * @hidden
     * Replaces a texture in the geometry buffer renderer
     * Useful when linking textures of the prepass renderer
     */
    GeometryBufferRenderer.prototype._forceTextureType = function (geometryBufferType, index) {
        if (geometryBufferType === GeometryBufferRenderer.POSITION_TEXTURE_TYPE) {
            this._positionIndex = index;
            this._enablePosition = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE) {
            this._velocityIndex = index;
            this._enableVelocity = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE) {
            this._reflectivityIndex = index;
            this._enableReflectivity = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.DEPTH_TEXTURE_TYPE) {
            this._depthIndex = index;
        }
        else if (geometryBufferType === GeometryBufferRenderer.NORMAL_TEXTURE_TYPE) {
            this._normalIndex = index;
        }
    };
    /**
     * @param attachments
     * @hidden
     * Sets texture attachments
     * Useful when linking textures of the prepass renderer
     */
    GeometryBufferRenderer.prototype._setAttachments = function (attachments) {
        this._attachments = attachments;
    };
    /**
     * @param internalTexture
     * @hidden
     * Replaces the first texture which is hard coded as a depth texture in the geometry buffer
     * Useful when linking textures of the prepass renderer
     */
    GeometryBufferRenderer.prototype._linkInternalTexture = function (internalTexture) {
        this._multiRenderTarget.setInternalTexture(internalTexture, 0, false);
    };
    Object.defineProperty(GeometryBufferRenderer.prototype, "renderList", {
        /**
         * Gets the render list (meshes to be rendered) used in the G buffer.
         */
        get: function () {
            return this._multiRenderTarget.renderList;
        },
        /**
         * Set the render list (meshes to be rendered) used in the G buffer.
         */
        set: function (meshes) {
            this._multiRenderTarget.renderList = meshes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryBufferRenderer.prototype, "isSupported", {
        /**
         * Gets whether or not G buffer are supported by the running hardware.
         * This requires draw buffer supports
         */
        get: function () {
            return this._multiRenderTarget.isSupported;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the index of the given texture type in the G-Buffer textures array
     * @param textureType The texture type constant. For example GeometryBufferRenderer.POSITION_TEXTURE_INDEX
     * @returns the index of the given texture type in the G-Buffer textures array
     */
    GeometryBufferRenderer.prototype.getTextureIndex = function (textureType) {
        switch (textureType) {
            case GeometryBufferRenderer.POSITION_TEXTURE_TYPE:
                return this._positionIndex;
            case GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE:
                return this._velocityIndex;
            case GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE:
                return this._reflectivityIndex;
            default:
                return -1;
        }
    };
    Object.defineProperty(GeometryBufferRenderer.prototype, "enablePosition", {
        /**
         * Gets a boolean indicating if objects positions are enabled for the G buffer.
         */
        get: function () {
            return this._enablePosition;
        },
        /**
         * Sets whether or not objects positions are enabled for the G buffer.
         */
        set: function (enable) {
            this._enablePosition = enable;
            // PrePass handles index and texture links
            if (!this._linkedWithPrePass) {
                this.dispose();
                this._createRenderTargets();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryBufferRenderer.prototype, "enableVelocity", {
        /**
         * Gets a boolean indicating if objects velocities are enabled for the G buffer.
         */
        get: function () {
            return this._enableVelocity;
        },
        /**
         * Sets whether or not objects velocities are enabled for the G buffer.
         */
        set: function (enable) {
            this._enableVelocity = enable;
            if (!enable) {
                this._previousTransformationMatrices = {};
            }
            if (!this._linkedWithPrePass) {
                this.dispose();
                this._createRenderTargets();
            }
            this._scene.needsPreviousWorldMatrices = enable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryBufferRenderer.prototype, "enableReflectivity", {
        /**
         * Gets a boolean indicating if objects roughness are enabled in the G buffer.
         */
        get: function () {
            return this._enableReflectivity;
        },
        /**
         * Sets whether or not objects roughness are enabled for the G buffer.
         */
        set: function (enable) {
            this._enableReflectivity = enable;
            if (!this._linkedWithPrePass) {
                this.dispose();
                this._createRenderTargets();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryBufferRenderer.prototype, "scene", {
        /**
         * Gets the scene associated with the buffer.
         */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryBufferRenderer.prototype, "ratio", {
        /**
         * Gets the ratio used by the buffer during its creation.
         * How big is the buffer related to the main canvas.
         */
        get: function () {
            return this._ratio;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Checks whether everything is ready to render a submesh to the G buffer.
     * @param subMesh the submesh to check readiness for
     * @param useInstances is the mesh drawn using instance or not
     * @returns true if ready otherwise false
     */
    GeometryBufferRenderer.prototype.isReady = function (subMesh, useInstances) {
        var material = subMesh.getMaterial();
        if (material && material.disableDepthWrite) {
            return false;
        }
        var defines = [];
        var attribs = [VertexBuffer.PositionKind, VertexBuffer.NormalKind];
        var mesh = subMesh.getMesh();
        // Alpha test
        if (material) {
            var needUv = false;
            if (material.needAlphaTesting() && material.getAlphaTestTexture()) {
                defines.push("#define ALPHATEST");
                defines.push("#define ALPHATEST_UV".concat(material.getAlphaTestTexture().coordinatesIndex + 1));
                needUv = true;
            }
            if (material.bumpTexture && MaterialFlags.BumpTextureEnabled) {
                defines.push("#define BUMP");
                defines.push("#define BUMP_UV".concat(material.bumpTexture.coordinatesIndex + 1));
                needUv = true;
            }
            if (this._enableReflectivity) {
                if (material.specularTexture) {
                    defines.push("#define HAS_SPECULAR");
                    defines.push("#define REFLECTIVITY_UV".concat(material.specularTexture.coordinatesIndex + 1));
                    needUv = true;
                }
                else if (material.reflectivityTexture) {
                    defines.push("#define HAS_REFLECTIVITY");
                    defines.push("#define REFLECTIVITY_UV".concat(material.reflectivityTexture.coordinatesIndex + 1));
                    needUv = true;
                }
            }
            if (needUv) {
                defines.push("#define NEED_UV");
                if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                    attribs.push(VertexBuffer.UVKind);
                    defines.push("#define UV1");
                }
                if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind)) {
                    attribs.push(VertexBuffer.UV2Kind);
                    defines.push("#define UV2");
                }
            }
        }
        // PrePass
        if (this._linkedWithPrePass) {
            defines.push("#define PREPASS");
            if (this._depthIndex !== -1) {
                defines.push("#define DEPTH_INDEX " + this._depthIndex);
                defines.push("#define PREPASS_DEPTH");
            }
            if (this._normalIndex !== -1) {
                defines.push("#define NORMAL_INDEX " + this._normalIndex);
                defines.push("#define PREPASS_NORMAL");
            }
        }
        // Buffers
        if (this._enablePosition) {
            defines.push("#define POSITION");
            defines.push("#define POSITION_INDEX " + this._positionIndex);
        }
        if (this._enableVelocity) {
            defines.push("#define VELOCITY");
            defines.push("#define VELOCITY_INDEX " + this._velocityIndex);
            if (this.excludedSkinnedMeshesFromVelocity.indexOf(mesh) === -1) {
                defines.push("#define BONES_VELOCITY_ENABLED");
            }
        }
        if (this._enableReflectivity) {
            defines.push("#define REFLECTIVITY");
            defines.push("#define REFLECTIVITY_INDEX " + this._reflectivityIndex);
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
            MaterialHelper.PushAttributesForInstances(attribs, this._enableVelocity);
            if (subMesh.getRenderingMesh().hasThinInstances) {
                defines.push("#define THIN_INSTANCES");
            }
        }
        // Setup textures count
        if (this._linkedWithPrePass) {
            defines.push("#define RENDER_TARGET_COUNT " + this._attachments.length);
        }
        else {
            defines.push("#define RENDER_TARGET_COUNT " + this._multiRenderTarget.textures.length);
        }
        // Get correct effect
        var drawWrapper = subMesh._getDrawWrapper(undefined, true);
        var cachedDefines = drawWrapper.defines;
        var join = defines.join("\n");
        if (cachedDefines !== join) {
            drawWrapper.setEffect(this._scene.getEngine().createEffect("geometry", {
                attributes: attribs,
                uniformsNames: [
                    "world",
                    "mBones",
                    "viewProjection",
                    "diffuseMatrix",
                    "view",
                    "previousWorld",
                    "previousViewProjection",
                    "mPreviousBones",
                    "bumpMatrix",
                    "reflectivityMatrix",
                    "vTangentSpaceParams",
                    "vBumpInfos",
                    "morphTargetInfluences",
                    "morphTargetTextureInfo",
                    "morphTargetTextureIndices",
                ],
                samplers: ["diffuseSampler", "bumpSampler", "reflectivitySampler", "morphTargets"],
                defines: join,
                onCompiled: null,
                fallbacks: null,
                onError: null,
                uniformBuffersNames: ["Scene"],
                indexParameters: { buffersCount: this._multiRenderTarget.textures.length - 1, maxSimultaneousMorphTargets: numMorphInfluencers },
            }, this._scene.getEngine()), join);
        }
        return drawWrapper.effect.isReady();
    };
    /**
     * Gets the current underlying G Buffer.
     * @returns the buffer
     */
    GeometryBufferRenderer.prototype.getGBuffer = function () {
        return this._multiRenderTarget;
    };
    Object.defineProperty(GeometryBufferRenderer.prototype, "samples", {
        /**
         * Gets the number of samples used to render the buffer (anti aliasing).
         */
        get: function () {
            return this._multiRenderTarget.samples;
        },
        /**
         * Sets the number of samples used to render the buffer (anti aliasing).
         */
        set: function (value) {
            this._multiRenderTarget.samples = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes the renderer and frees up associated resources.
     */
    GeometryBufferRenderer.prototype.dispose = function () {
        if (this._resizeObserver) {
            var engine = this._scene.getEngine();
            engine.onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        this.getGBuffer().dispose();
    };
    GeometryBufferRenderer.prototype._assignRenderTargetIndices = function () {
        var textureNames = [];
        var count = 2;
        textureNames.push("gBuffer_Depth", "gBuffer_Normal");
        if (this._enablePosition) {
            this._positionIndex = count;
            count++;
            textureNames.push("gBuffer_Position");
        }
        if (this._enableVelocity) {
            this._velocityIndex = count;
            count++;
            textureNames.push("gBuffer_Velocity");
        }
        if (this._enableReflectivity) {
            this._reflectivityIndex = count;
            count++;
            textureNames.push("gBuffer_Reflectivity");
        }
        return [count, textureNames];
    };
    GeometryBufferRenderer.prototype._createRenderTargets = function () {
        var _this = this;
        var engine = this._scene.getEngine();
        var _a = this._assignRenderTargetIndices(), count = _a[0], textureNames = _a[1];
        var type = 0;
        if (engine._caps.textureFloat && engine._caps.textureFloatLinearFiltering) {
            type = 1;
        }
        else if (engine._caps.textureHalfFloat && engine._caps.textureHalfFloatLinearFiltering) {
            type = 2;
        }
        this._multiRenderTarget = new MultiRenderTarget("gBuffer", { width: engine.getRenderWidth() * this._ratio, height: engine.getRenderHeight() * this._ratio }, count, this._scene, { generateMipMaps: false, generateDepthTexture: true, defaultType: type }, textureNames.concat("gBuffer_DepthBuffer"));
        if (!this.isSupported) {
            return;
        }
        this._multiRenderTarget.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._multiRenderTarget.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._multiRenderTarget.refreshRate = 1;
        this._multiRenderTarget.renderParticles = false;
        this._multiRenderTarget.renderList = null;
        // set default depth value to 1.0 (far away)
        this._multiRenderTarget.onClearObservable.add(function (engine) {
            engine.clear(new Color4(0.0, 0.0, 0.0, 0.0), true, true, true);
        });
        this._resizeObserver = engine.onResizeObservable.add(function () {
            if (_this._multiRenderTarget) {
                _this._multiRenderTarget.resize({ width: engine.getRenderWidth() * _this._ratio, height: engine.getRenderHeight() * _this._ratio });
            }
        });
        // Custom render function
        var renderSubMesh = function (subMesh) {
            var renderingMesh = subMesh.getRenderingMesh();
            var effectiveMesh = subMesh.getEffectiveMesh();
            var scene = _this._scene;
            var engine = scene.getEngine();
            var material = subMesh.getMaterial();
            if (!material) {
                return;
            }
            effectiveMesh._internalAbstractMeshDataInfo._isActiveIntermediate = false;
            // Velocity
            if (_this._enableVelocity && !_this._previousTransformationMatrices[effectiveMesh.uniqueId]) {
                _this._previousTransformationMatrices[effectiveMesh.uniqueId] = {
                    world: Matrix.Identity(),
                    viewProjection: scene.getTransformMatrix(),
                };
                if (renderingMesh.skeleton) {
                    var bonesTransformations = renderingMesh.skeleton.getTransformMatrices(renderingMesh);
                    _this._previousBonesTransformationMatrices[renderingMesh.uniqueId] = _this._copyBonesTransformationMatrices(bonesTransformations, new Float32Array(bonesTransformations.length));
                }
            }
            // Managing instances
            var batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
            if (batch.mustReturn) {
                return;
            }
            var hardwareInstancedRendering = engine.getCaps().instancedArrays && (batch.visibleInstances[subMesh._id] !== null || renderingMesh.hasThinInstances);
            var world = effectiveMesh.getWorldMatrix();
            if (_this.isReady(subMesh, hardwareInstancedRendering)) {
                var drawWrapper = subMesh._getDrawWrapper();
                if (!drawWrapper) {
                    return;
                }
                var effect_1 = drawWrapper.effect;
                engine.enableEffect(drawWrapper);
                if (!hardwareInstancedRendering) {
                    renderingMesh._bind(subMesh, effect_1, material.fillMode);
                }
                if (!_this._useUbo) {
                    effect_1.setMatrix("viewProjection", scene.getTransformMatrix());
                    effect_1.setMatrix("view", scene.getViewMatrix());
                }
                else {
                    MaterialHelper.BindSceneUniformBuffer(effect_1, _this._scene.getSceneUniformBuffer());
                    _this._scene.finalizeSceneUbo();
                }
                if (material) {
                    var sideOrientation = void 0;
                    var instanceDataStorage = renderingMesh._instanceDataStorage;
                    if (!instanceDataStorage.isFrozen && (material.backFaceCulling || renderingMesh.overrideMaterialSideOrientation !== null)) {
                        var mainDeterminant = effectiveMesh._getWorldMatrixDeterminant();
                        sideOrientation = renderingMesh.overrideMaterialSideOrientation;
                        if (sideOrientation === null) {
                            sideOrientation = material.sideOrientation;
                        }
                        if (mainDeterminant < 0) {
                            sideOrientation = sideOrientation === Material.ClockWiseSideOrientation ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
                        }
                    }
                    else {
                        sideOrientation = instanceDataStorage.sideOrientation;
                    }
                    material._preBind(drawWrapper, sideOrientation);
                    // Alpha test
                    if (material.needAlphaTesting()) {
                        var alphaTexture = material.getAlphaTestTexture();
                        if (alphaTexture) {
                            effect_1.setTexture("diffuseSampler", alphaTexture);
                            effect_1.setMatrix("diffuseMatrix", alphaTexture.getTextureMatrix());
                        }
                    }
                    // Bump
                    if (material.bumpTexture && scene.getEngine().getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled) {
                        effect_1.setFloat3("vBumpInfos", material.bumpTexture.coordinatesIndex, 1.0 / material.bumpTexture.level, material.parallaxScaleBias);
                        effect_1.setMatrix("bumpMatrix", material.bumpTexture.getTextureMatrix());
                        effect_1.setTexture("bumpSampler", material.bumpTexture);
                        effect_1.setFloat2("vTangentSpaceParams", material.invertNormalMapX ? -1.0 : 1.0, material.invertNormalMapY ? -1.0 : 1.0);
                    }
                    // Roughness
                    if (_this._enableReflectivity) {
                        if (material.specularTexture) {
                            effect_1.setMatrix("reflectivityMatrix", material.specularTexture.getTextureMatrix());
                            effect_1.setTexture("reflectivitySampler", material.specularTexture);
                        }
                        else if (material.reflectivityTexture) {
                            effect_1.setMatrix("reflectivityMatrix", material.reflectivityTexture.getTextureMatrix());
                            effect_1.setTexture("reflectivitySampler", material.reflectivityTexture);
                        }
                    }
                }
                // Bones
                if (renderingMesh.useBones && renderingMesh.computeBonesUsingShaders && renderingMesh.skeleton) {
                    effect_1.setMatrices("mBones", renderingMesh.skeleton.getTransformMatrices(renderingMesh));
                    if (_this._enableVelocity) {
                        effect_1.setMatrices("mPreviousBones", _this._previousBonesTransformationMatrices[renderingMesh.uniqueId]);
                    }
                }
                // Morph targets
                MaterialHelper.BindMorphTargetParameters(renderingMesh, effect_1);
                if (renderingMesh.morphTargetManager && renderingMesh.morphTargetManager.isUsingTextureForTargets) {
                    renderingMesh.morphTargetManager._bind(effect_1);
                }
                // Velocity
                if (_this._enableVelocity) {
                    effect_1.setMatrix("previousWorld", _this._previousTransformationMatrices[effectiveMesh.uniqueId].world);
                    effect_1.setMatrix("previousViewProjection", _this._previousTransformationMatrices[effectiveMesh.uniqueId].viewProjection);
                }
                if (hardwareInstancedRendering && renderingMesh.hasThinInstances) {
                    effect_1.setMatrix("world", world);
                }
                // Draw
                renderingMesh._processRendering(effectiveMesh, subMesh, effect_1, material.fillMode, batch, hardwareInstancedRendering, function (isInstance, w) {
                    if (!isInstance) {
                        effect_1.setMatrix("world", w);
                    }
                });
            }
            // Velocity
            if (_this._enableVelocity) {
                _this._previousTransformationMatrices[effectiveMesh.uniqueId].world = world.clone();
                _this._previousTransformationMatrices[effectiveMesh.uniqueId].viewProjection = _this._scene.getTransformMatrix().clone();
                if (renderingMesh.skeleton) {
                    _this._copyBonesTransformationMatrices(renderingMesh.skeleton.getTransformMatrices(renderingMesh), _this._previousBonesTransformationMatrices[effectiveMesh.uniqueId]);
                }
            }
        };
        this._multiRenderTarget.customIsReadyFunction = function (mesh, refreshRate) {
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
                    var hardwareInstancedRendering = engine.getCaps().instancedArrays && (batch.visibleInstances[subMesh._id] !== null || renderingMesh.hasThinInstances);
                    if (!_this.isReady(subMesh, hardwareInstancedRendering)) {
                        return false;
                    }
                }
            }
            return true;
        };
        this._multiRenderTarget.customRenderFunction = function (opaqueSubMeshes, alphaTestSubMeshes, transparentSubMeshes, depthOnlySubMeshes) {
            var index;
            if (_this._linkedWithPrePass) {
                if (!_this._prePassRenderer.enabled) {
                    return;
                }
                _this._scene.getEngine().bindAttachments(_this._attachments);
            }
            if (depthOnlySubMeshes.length) {
                engine.setColorWrite(false);
                for (index = 0; index < depthOnlySubMeshes.length; index++) {
                    renderSubMesh(depthOnlySubMeshes.data[index]);
                }
                engine.setColorWrite(true);
            }
            for (index = 0; index < opaqueSubMeshes.length; index++) {
                renderSubMesh(opaqueSubMeshes.data[index]);
            }
            engine.setDepthWrite(false);
            for (index = 0; index < alphaTestSubMeshes.length; index++) {
                renderSubMesh(alphaTestSubMeshes.data[index]);
            }
            if (_this.renderTransparentMeshes) {
                for (index = 0; index < transparentSubMeshes.length; index++) {
                    renderSubMesh(transparentSubMeshes.data[index]);
                }
            }
            engine.setDepthWrite(true);
        };
    };
    // Copies the bones transformation matrices into the target array and returns the target's reference
    GeometryBufferRenderer.prototype._copyBonesTransformationMatrices = function (source, target) {
        for (var i = 0; i < source.length; i++) {
            target[i] = source[i];
        }
        return target;
    };
    /**
     * Constant used to retrieve the depth texture index in the G-Buffer textures array
     * using getIndex(GeometryBufferRenderer.DEPTH_TEXTURE_INDEX)
     */
    GeometryBufferRenderer.DEPTH_TEXTURE_TYPE = 0;
    /**
     * Constant used to retrieve the normal texture index in the G-Buffer textures array
     * using getIndex(GeometryBufferRenderer.NORMAL_TEXTURE_INDEX)
     */
    GeometryBufferRenderer.NORMAL_TEXTURE_TYPE = 1;
    /**
     * Constant used to retrieve the position texture index in the G-Buffer textures array
     * using getIndex(GeometryBufferRenderer.POSITION_TEXTURE_INDEX)
     */
    GeometryBufferRenderer.POSITION_TEXTURE_TYPE = 2;
    /**
     * Constant used to retrieve the velocity texture index in the G-Buffer textures array
     * using getIndex(GeometryBufferRenderer.VELOCITY_TEXTURE_INDEX)
     */
    GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE = 3;
    /**
     * Constant used to retrieve the reflectivity texture index in the G-Buffer textures array
     * using the getIndex(GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE)
     */
    GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE = 4;
    /**
     * @param _
     * @hidden
     */
    GeometryBufferRenderer._SceneComponentInitialization = function (_) {
        throw _WarnImport("GeometryBufferRendererSceneComponent");
    };
    return GeometryBufferRenderer;
}());
export { GeometryBufferRenderer };
//# sourceMappingURL=geometryBufferRenderer.js.map