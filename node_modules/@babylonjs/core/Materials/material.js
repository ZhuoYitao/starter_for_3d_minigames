import { __assign, __decorate } from "tslib";
import { serialize, SerializationHelper } from "../Misc/decorators.js";
import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { EngineStore } from "../Engines/engineStore.js";
import { SubMesh } from "../Meshes/subMesh.js";
import { UniformBuffer } from "./uniformBuffer.js";

import { Logger } from "../Misc/logger.js";
import { Plane } from "../Maths/math.plane.js";
import { MaterialHelper } from "./materialHelper.js";
import { DrawWrapper } from "./drawWrapper.js";
import { MaterialStencilState } from "./materialStencilState.js";
import { MaterialPluginEvent } from "./materialPluginEvent.js";
/**
 * Base class for the main features of a material in Babylon.js
 */
var Material = /** @class */ (function () {
    /**
     * Creates a material instance
     * @param name defines the name of the material
     * @param scene defines the scene to reference
     * @param doNotAdd specifies if the material should be added to the scene
     */
    function Material(name, scene, doNotAdd) {
        /**
         * Custom shadow depth material to use for shadow rendering instead of the in-built one
         */
        this.shadowDepthWrapper = null;
        /**
         * Gets or sets a boolean indicating that the material is allowed (if supported) to do shader hot swapping.
         * This means that the material can keep using a previous shader while a new one is being compiled.
         * This is mostly used when shader parallel compilation is supported (true by default)
         */
        this.allowShaderHotSwapping = true;
        /**
         * Gets or sets user defined metadata
         */
        this.metadata = null;
        /**
         * For internal use only. Please do not use.
         */
        this.reservedDataStore = null;
        /**
         * Specifies if the ready state should be checked on each call
         */
        this.checkReadyOnEveryCall = false;
        /**
         * Specifies if the ready state should be checked once
         */
        this.checkReadyOnlyOnce = false;
        /**
         * The state of the material
         */
        this.state = "";
        /**
         * The alpha value of the material
         */
        this._alpha = 1.0;
        /**
         * Specifies if back face culling is enabled
         */
        this._backFaceCulling = true;
        /**
         * Specifies if back or front faces should be culled (when culling is enabled)
         */
        this._cullBackFaces = true;
        /**
         * Callback triggered when the material is compiled
         */
        this.onCompiled = null;
        /**
         * Callback triggered when an error occurs
         */
        this.onError = null;
        /**
         * Callback triggered to get the render target textures
         */
        this.getRenderTargetTextures = null;
        /**
         * Specifies if the material should be serialized
         */
        this.doNotSerialize = false;
        /**
         * @hidden
         */
        this._storeEffectOnSubMeshes = false;
        /**
         * Stores the animations for the material
         */
        this.animations = null;
        /**
         * An event triggered when the material is disposed
         */
        this.onDisposeObservable = new Observable();
        /**
         * An observer which watches for dispose events
         */
        this._onDisposeObserver = null;
        this._onUnBindObservable = null;
        /**
         * An observer which watches for bind events
         */
        this._onBindObserver = null;
        /**
         * Stores the value of the alpha mode
         */
        this._alphaMode = 2;
        /**
         * Stores the state of the need depth pre-pass value
         */
        this._needDepthPrePass = false;
        /**
         * Specifies if depth writing should be disabled
         */
        this.disableDepthWrite = false;
        /**
         * Specifies if color writing should be disabled
         */
        this.disableColorWrite = false;
        /**
         * Specifies if depth writing should be forced
         */
        this.forceDepthWrite = false;
        /**
         * Specifies the depth function that should be used. 0 means the default engine function
         */
        this.depthFunction = 0;
        /**
         * Specifies if there should be a separate pass for culling
         */
        this.separateCullingPass = false;
        /**
         * Stores the state specifying if fog should be enabled
         */
        this._fogEnabled = true;
        /**
         * Stores the size of points
         */
        this.pointSize = 1.0;
        /**
         * Stores the z offset Factor value
         */
        this.zOffset = 0;
        /**
         * Stores the z offset Units value
         */
        this.zOffsetUnits = 0;
        /**
         * Gives access to the stencil properties of the material
         */
        this.stencil = new MaterialStencilState();
        /**
         * Specifies if uniform buffers should be used
         */
        this._useUBO = false;
        /**
         * Stores the fill mode state
         */
        this._fillMode = Material.TriangleFillMode;
        /**
         * Specifies if the depth write state should be cached
         */
        this._cachedDepthWriteState = false;
        /**
         * Specifies if the color write state should be cached
         */
        this._cachedColorWriteState = false;
        /**
         * Specifies if the depth function state should be cached
         */
        this._cachedDepthFunctionState = 0;
        /** @hidden */
        this._indexInSceneMaterialArray = -1;
        /** @hidden */
        this.meshMap = null;
        /** @hidden */
        this._parentContainer = null;
        /** @hidden */
        this._uniformBufferLayoutBuilt = false;
        this._eventInfo = {}; // will be initialized before each event notification
        /** @hidden */
        this._callbackPluginEventGeneric = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventIsReadyForSubMesh = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventPrepareDefines = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventHardBindForSubMesh = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventBindForSubMesh = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventHasRenderTargetTextures = function () { return void 0; };
        /** @hidden */
        this._callbackPluginEventFillRenderTargetTextures = function () { return void 0; };
        /**
         * Enforces alpha test in opaque or blend mode in order to improve the performances of some situations.
         */
        this._forceAlphaTest = false;
        /**
         * The transparency mode of the material.
         */
        this._transparencyMode = null;
        this.name = name;
        var setScene = scene || EngineStore.LastCreatedScene;
        if (!setScene) {
            return;
        }
        this._scene = setScene;
        this._dirtyCallbacks = {};
        this._dirtyCallbacks[1] = this._markAllSubMeshesAsTexturesDirty.bind(this);
        this._dirtyCallbacks[2] = this._markAllSubMeshesAsLightsDirty.bind(this);
        this._dirtyCallbacks[4] = this._markAllSubMeshesAsFresnelDirty.bind(this);
        this._dirtyCallbacks[8] = this._markAllSubMeshesAsAttributesDirty.bind(this);
        this._dirtyCallbacks[16] = this._markAllSubMeshesAsMiscDirty.bind(this);
        this._dirtyCallbacks[32] = this._markAllSubMeshesAsPrePassDirty.bind(this);
        this._dirtyCallbacks[63] = this._markAllSubMeshesAsAllDirty.bind(this);
        this.id = name || Tools.RandomId();
        this.uniqueId = this._scene.getUniqueId();
        this._materialContext = this._scene.getEngine().createMaterialContext();
        this._drawWrapper = new DrawWrapper(this._scene.getEngine(), false);
        this._drawWrapper.materialContext = this._materialContext;
        if (this._scene.useRightHandedSystem) {
            this.sideOrientation = Material.ClockWiseSideOrientation;
        }
        else {
            this.sideOrientation = Material.CounterClockWiseSideOrientation;
        }
        this._uniformBuffer = new UniformBuffer(this._scene.getEngine(), undefined, undefined, name);
        this._useUBO = this.getScene().getEngine().supportsUniformBuffers;
        if (!doNotAdd) {
            this._scene.addMaterial(this);
        }
        if (this._scene.useMaterialMeshMap) {
            this.meshMap = {};
        }
        Material.OnEventObservable.notifyObservers(this, MaterialPluginEvent.Created);
    }
    Object.defineProperty(Material.prototype, "canRenderToMRT", {
        /**
         * If the material can be rendered to several textures with MRT extension
         */
        get: function () {
            // By default, shaders are not compatible with MRTs
            // Base classes should override that if their shader supports MRT
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "alpha", {
        /**
         * Gets the alpha value of the material
         */
        get: function () {
            return this._alpha;
        },
        /**
         * Sets the alpha value of the material
         */
        set: function (value) {
            if (this._alpha === value) {
                return;
            }
            var oldValue = this._alpha;
            this._alpha = value;
            // Only call dirty when there is a state change (no alpha / alpha)
            if (oldValue === 1 || value === 1) {
                this.markAsDirty(Material.MiscDirtyFlag);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "backFaceCulling", {
        /**
         * Gets the culling state
         */
        get: function () {
            return this._backFaceCulling;
        },
        /**
         * Sets the culling state (true to enable culling, false to disable)
         */
        set: function (value) {
            if (this._backFaceCulling === value) {
                return;
            }
            this._backFaceCulling = value;
            this.markAsDirty(Material.TextureDirtyFlag);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "cullBackFaces", {
        /**
         * Gets the type of faces that should be culled
         */
        get: function () {
            return this._cullBackFaces;
        },
        /**
         * Sets the type of faces that should be culled (true for back faces, false for front faces)
         */
        set: function (value) {
            if (this._cullBackFaces === value) {
                return;
            }
            this._cullBackFaces = value;
            this.markAsDirty(Material.TextureDirtyFlag);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "hasRenderTargetTextures", {
        /**
         * Gets a boolean indicating that current material needs to register RTT
         */
        get: function () {
            this._eventInfo.hasRenderTargetTextures = false;
            this._callbackPluginEventHasRenderTargetTextures(this._eventInfo);
            return this._eventInfo.hasRenderTargetTextures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "onDispose", {
        /**
         * Called during a dispose event
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "onBindObservable", {
        /**
         * An event triggered when the material is bound
         */
        get: function () {
            if (!this._onBindObservable) {
                this._onBindObservable = new Observable();
            }
            return this._onBindObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "onBind", {
        /**
         * Called during a bind event
         */
        set: function (callback) {
            if (this._onBindObserver) {
                this.onBindObservable.remove(this._onBindObserver);
            }
            this._onBindObserver = this.onBindObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "onUnBindObservable", {
        /**
         * An event triggered when the material is unbound
         */
        get: function () {
            if (!this._onUnBindObservable) {
                this._onUnBindObservable = new Observable();
            }
            return this._onUnBindObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "onEffectCreatedObservable", {
        /**
         * An event triggered when the effect is (re)created
         */
        get: function () {
            if (!this._onEffectCreatedObservable) {
                this._onEffectCreatedObservable = new Observable();
            }
            return this._onEffectCreatedObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "alphaMode", {
        /**
         * Gets the value of the alpha mode
         */
        get: function () {
            return this._alphaMode;
        },
        /**
         * Sets the value of the alpha mode.
         *
         * | Value | Type | Description |
         * | --- | --- | --- |
         * | 0 | ALPHA_DISABLE |   |
         * | 1 | ALPHA_ADD |   |
         * | 2 | ALPHA_COMBINE |   |
         * | 3 | ALPHA_SUBTRACT |   |
         * | 4 | ALPHA_MULTIPLY |   |
         * | 5 | ALPHA_MAXIMIZED |   |
         * | 6 | ALPHA_ONEONE |   |
         * | 7 | ALPHA_PREMULTIPLIED |   |
         * | 8 | ALPHA_PREMULTIPLIED_PORTERDUFF |   |
         * | 9 | ALPHA_INTERPOLATE |   |
         * | 10 | ALPHA_SCREENMODE |   |
         *
         */
        set: function (value) {
            if (this._alphaMode === value) {
                return;
            }
            this._alphaMode = value;
            this.markAsDirty(Material.TextureDirtyFlag);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "needDepthPrePass", {
        /**
         * Gets the depth pre-pass value
         */
        get: function () {
            return this._needDepthPrePass;
        },
        /**
         * Sets the need depth pre-pass value
         */
        set: function (value) {
            if (this._needDepthPrePass === value) {
                return;
            }
            this._needDepthPrePass = value;
            if (this._needDepthPrePass) {
                this.checkReadyOnEveryCall = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "isPrePassCapable", {
        /**
         * Can this material render to prepass
         */
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "fogEnabled", {
        /**
         * Gets the value of the fog enabled state
         */
        get: function () {
            return this._fogEnabled;
        },
        /**
         * Sets the state for enabling fog
         */
        set: function (value) {
            if (this._fogEnabled === value) {
                return;
            }
            this._fogEnabled = value;
            this.markAsDirty(Material.MiscDirtyFlag);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "wireframe", {
        get: function () {
            switch (this._fillMode) {
                case Material.WireFrameFillMode:
                case Material.LineListDrawMode:
                case Material.LineLoopDrawMode:
                case Material.LineStripDrawMode:
                    return true;
            }
            return this._scene.forceWireframe;
        },
        /**
         * Sets the state of wireframe mode
         */
        set: function (value) {
            this.fillMode = value ? Material.WireFrameFillMode : Material.TriangleFillMode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "pointsCloud", {
        /**
         * Gets the value specifying if point clouds are enabled
         */
        get: function () {
            switch (this._fillMode) {
                case Material.PointFillMode:
                case Material.PointListDrawMode:
                    return true;
            }
            return this._scene.forcePointsCloud;
        },
        /**
         * Sets the state of point cloud mode
         */
        set: function (value) {
            this.fillMode = value ? Material.PointFillMode : Material.TriangleFillMode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "fillMode", {
        /**
         * Gets the material fill mode
         */
        get: function () {
            return this._fillMode;
        },
        /**
         * Sets the material fill mode
         */
        set: function (value) {
            if (this._fillMode === value) {
                return;
            }
            this._fillMode = value;
            this.markAsDirty(Material.MiscDirtyFlag);
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    Material.prototype._getDrawWrapper = function () {
        return this._drawWrapper;
    };
    /**
     * @param drawWrapper
     * @hidden
     */
    Material.prototype._setDrawWrapper = function (drawWrapper) {
        this._drawWrapper = drawWrapper;
    };
    /**
     * Returns a string representation of the current material
     * @param fullDetails defines a boolean indicating which levels of logging is desired
     * @returns a string with material information
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name;
        return ret;
    };
    /**
     * Gets the class name of the material
     * @returns a string with the class name of the material
     */
    Material.prototype.getClassName = function () {
        return "Material";
    };
    Object.defineProperty(Material.prototype, "isFrozen", {
        /**
         * Specifies if updates for the material been locked
         */
        get: function () {
            return this.checkReadyOnlyOnce;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Locks updates for the material
     */
    Material.prototype.freeze = function () {
        this.markDirty();
        this.checkReadyOnlyOnce = true;
    };
    /**
     * Unlocks updates for the material
     */
    Material.prototype.unfreeze = function () {
        this.markDirty();
        this.checkReadyOnlyOnce = false;
    };
    /**
     * Specifies if the material is ready to be used
     * @param mesh defines the mesh to check
     * @param useInstances specifies if instances should be used
     * @returns a boolean indicating if the material is ready to be used
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.isReady = function (mesh, useInstances) {
        return true;
    };
    /**
     * Specifies that the submesh is ready to be used
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        var defines = subMesh.materialDefines;
        if (!defines) {
            return false;
        }
        this._eventInfo.isReadyForSubMesh = true;
        this._eventInfo.defines = defines;
        this._callbackPluginEventIsReadyForSubMesh(this._eventInfo);
        return this._eventInfo.isReadyForSubMesh;
    };
    /**
     * Returns the material effect
     * @returns the effect associated with the material
     */
    Material.prototype.getEffect = function () {
        return this._drawWrapper.effect;
    };
    /**
     * Returns the current scene
     * @returns a Scene
     */
    Material.prototype.getScene = function () {
        return this._scene;
    };
    Object.defineProperty(Material.prototype, "transparencyMode", {
        /**
         * Gets the current transparency mode.
         */
        get: function () {
            return this._transparencyMode;
        },
        /**
         * Sets the transparency mode of the material.
         *
         * | Value | Type                                | Description |
         * | ----- | ----------------------------------- | ----------- |
         * | 0     | OPAQUE                              |             |
         * | 1     | ALPHATEST                           |             |
         * | 2     | ALPHABLEND                          |             |
         * | 3     | ALPHATESTANDBLEND                   |             |
         *
         */
        set: function (value) {
            if (this._transparencyMode === value) {
                return;
            }
            this._transparencyMode = value;
            this._forceAlphaTest = value === Material.MATERIAL_ALPHATESTANDBLEND;
            this._markAllSubMeshesAsTexturesAndMiscDirty();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "_disableAlphaBlending", {
        /**
         * Returns true if alpha blending should be disabled.
         */
        get: function () {
            return this._transparencyMode === Material.MATERIAL_OPAQUE || this._transparencyMode === Material.MATERIAL_ALPHATEST;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Specifies whether or not this material should be rendered in alpha blend mode.
     * @returns a boolean specifying if alpha blending is needed
     */
    Material.prototype.needAlphaBlending = function () {
        if (this._disableAlphaBlending) {
            return false;
        }
        return this.alpha < 1.0;
    };
    /**
     * Specifies if the mesh will require alpha blending
     * @param mesh defines the mesh to check
     * @returns a boolean specifying if alpha blending is needed for the mesh
     */
    Material.prototype.needAlphaBlendingForMesh = function (mesh) {
        if (this._disableAlphaBlending && mesh.visibility >= 1.0) {
            return false;
        }
        return this.needAlphaBlending() || mesh.visibility < 1.0 || mesh.hasVertexAlpha;
    };
    /**
     * Specifies whether or not this material should be rendered in alpha test mode.
     * @returns a boolean specifying if an alpha test is needed.
     */
    Material.prototype.needAlphaTesting = function () {
        if (this._forceAlphaTest) {
            return true;
        }
        return false;
    };
    /**
     * Specifies if material alpha testing should be turned on for the mesh
     * @param mesh defines the mesh to check
     */
    Material.prototype._shouldTurnAlphaTestOn = function (mesh) {
        return !this.needAlphaBlendingForMesh(mesh) && this.needAlphaTesting();
    };
    /**
     * Gets the texture used for the alpha test
     * @returns the texture to use for alpha testing
     */
    Material.prototype.getAlphaTestTexture = function () {
        return null;
    };
    /**
     * Marks the material to indicate that it needs to be re-calculated
     */
    Material.prototype.markDirty = function () {
        var meshes = this.getScene().meshes;
        for (var _i = 0, meshes_1 = meshes; _i < meshes_1.length; _i++) {
            var mesh = meshes_1[_i];
            if (!mesh.subMeshes) {
                continue;
            }
            for (var _a = 0, _b = mesh.subMeshes; _a < _b.length; _a++) {
                var subMesh = _b[_a];
                if (subMesh.getMaterial() !== this) {
                    continue;
                }
                if (!subMesh.effect) {
                    continue;
                }
                subMesh.effect._wasPreviouslyReady = false;
            }
        }
    };
    /**
     * @param effect
     * @param overrideOrientation
     * @hidden
     */
    Material.prototype._preBind = function (effect, overrideOrientation) {
        if (overrideOrientation === void 0) { overrideOrientation = null; }
        var engine = this._scene.getEngine();
        var orientation = overrideOrientation == null ? this.sideOrientation : overrideOrientation;
        var reverse = orientation === Material.ClockWiseSideOrientation;
        engine.enableEffect(effect ? effect : this._getDrawWrapper());
        engine.setState(this.backFaceCulling, this.zOffset, false, reverse, this.cullBackFaces, this.stencil, this.zOffsetUnits);
        return reverse;
    };
    /**
     * Binds the material to the mesh
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh to bind the material to
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.bind = function (world, mesh) { };
    /**
     * Initializes the uniform buffer layout for the shader.
     */
    Material.prototype.buildUniformLayout = function () {
        var ubo = this._uniformBuffer;
        this._eventInfo.ubo = ubo;
        this._callbackPluginEventGeneric(MaterialPluginEvent.PrepareUniformBuffer, this._eventInfo);
        ubo.create();
        this._uniformBufferLayoutBuilt = true;
    };
    /**
     * Binds the submesh to the material
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh containing the submesh
     * @param subMesh defines the submesh to bind the material to
     */
    Material.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var effect = subMesh.effect;
        if (!effect) {
            return;
        }
        this._eventInfo.subMesh = subMesh;
        this._callbackPluginEventBindForSubMesh(this._eventInfo);
    };
    /**
     * Binds the world matrix to the material
     * @param world defines the world transformation matrix
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.bindOnlyWorldMatrix = function (world) { };
    /**
     * Binds the view matrix to the effect
     * @param effect defines the effect to bind the view matrix to
     */
    Material.prototype.bindView = function (effect) {
        if (!this._useUBO) {
            effect.setMatrix("view", this.getScene().getViewMatrix());
        }
        else {
            this._needToBindSceneUbo = true;
        }
    };
    /**
     * Binds the view projection and projection matrices to the effect
     * @param effect defines the effect to bind the view projection and projection matrices to
     */
    Material.prototype.bindViewProjection = function (effect) {
        if (!this._useUBO) {
            effect.setMatrix("viewProjection", this.getScene().getTransformMatrix());
            effect.setMatrix("projection", this.getScene().getProjectionMatrix());
        }
        else {
            this._needToBindSceneUbo = true;
        }
    };
    /**
     * Binds the view matrix to the effect
     * @param effect defines the effect to bind the view matrix to
     * @param variableName name of the shader variable that will hold the eye position
     */
    Material.prototype.bindEyePosition = function (effect, variableName) {
        if (!this._useUBO) {
            this._scene.bindEyePosition(effect, variableName);
        }
        else {
            this._needToBindSceneUbo = true;
        }
    };
    /**
     * Processes to execute after binding the material to a mesh
     * @param mesh defines the rendered mesh
     * @param effect
     */
    Material.prototype._afterBind = function (mesh, effect) {
        if (effect === void 0) { effect = null; }
        this._scene._cachedMaterial = this;
        if (this._needToBindSceneUbo) {
            if (effect) {
                this._needToBindSceneUbo = false;
                MaterialHelper.BindSceneUniformBuffer(effect, this.getScene().getSceneUniformBuffer());
                this._scene.finalizeSceneUbo();
            }
        }
        if (mesh) {
            this._scene._cachedVisibility = mesh.visibility;
        }
        else {
            this._scene._cachedVisibility = 1;
        }
        if (this._onBindObservable && mesh) {
            this._onBindObservable.notifyObservers(mesh);
        }
        if (this.disableDepthWrite) {
            var engine = this._scene.getEngine();
            this._cachedDepthWriteState = engine.getDepthWrite();
            engine.setDepthWrite(false);
        }
        if (this.disableColorWrite) {
            var engine = this._scene.getEngine();
            this._cachedColorWriteState = engine.getColorWrite();
            engine.setColorWrite(false);
        }
        if (this.depthFunction !== 0) {
            var engine = this._scene.getEngine();
            this._cachedDepthFunctionState = engine.getDepthFunction() || 0;
            engine.setDepthFunction(this.depthFunction);
        }
    };
    /**
     * Unbinds the material from the mesh
     */
    Material.prototype.unbind = function () {
        if (this._onUnBindObservable) {
            this._onUnBindObservable.notifyObservers(this);
        }
        if (this.depthFunction !== 0) {
            var engine = this._scene.getEngine();
            engine.setDepthFunction(this._cachedDepthFunctionState);
        }
        if (this.disableDepthWrite) {
            var engine = this._scene.getEngine();
            engine.setDepthWrite(this._cachedDepthWriteState);
        }
        if (this.disableColorWrite) {
            var engine = this._scene.getEngine();
            engine.setColorWrite(this._cachedColorWriteState);
        }
    };
    /**
     * Returns the animatable textures.
     * @returns - Array of animatable textures.
     */
    Material.prototype.getAnimatables = function () {
        this._eventInfo.animatables = [];
        this._callbackPluginEventGeneric(MaterialPluginEvent.GetAnimatables, this._eventInfo);
        return this._eventInfo.animatables;
    };
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    Material.prototype.getActiveTextures = function () {
        this._eventInfo.activeTextures = [];
        this._callbackPluginEventGeneric(MaterialPluginEvent.GetActiveTextures, this._eventInfo);
        return this._eventInfo.activeTextures;
    };
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    Material.prototype.hasTexture = function (texture) {
        this._eventInfo.hasTexture = false;
        this._eventInfo.texture = texture;
        this._callbackPluginEventGeneric(MaterialPluginEvent.HasTexture, this._eventInfo);
        return this._eventInfo.hasTexture;
    };
    /**
     * Makes a duplicate of the material, and gives it a new name
     * @param name defines the new name for the duplicated material
     * @returns the cloned material
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.clone = function (name) {
        return null;
    };
    /**
     * Gets the meshes bound to the material
     * @returns an array of meshes bound to the material
     */
    Material.prototype.getBindedMeshes = function () {
        var _this = this;
        if (this.meshMap) {
            var result = new Array();
            for (var meshId in this.meshMap) {
                var mesh = this.meshMap[meshId];
                if (mesh) {
                    result.push(mesh);
                }
            }
            return result;
        }
        else {
            var meshes = this._scene.meshes;
            return meshes.filter(function (mesh) { return mesh.material === _this; });
        }
    };
    /**
     * Force shader compilation
     * @param mesh defines the mesh associated with this material
     * @param onCompiled defines a function to execute once the material is compiled
     * @param options defines the options to configure the compilation
     * @param onError defines a function to execute if the material fails compiling
     */
    Material.prototype.forceCompilation = function (mesh, onCompiled, options, onError) {
        var _this = this;
        var localOptions = __assign({ clipPlane: false, useInstances: false }, options);
        var scene = this.getScene();
        var currentHotSwapingState = this.allowShaderHotSwapping;
        this.allowShaderHotSwapping = false; // Turned off to let us evaluate the real compilation state
        var checkReady = function () {
            if (!_this._scene || !_this._scene.getEngine()) {
                return;
            }
            var clipPlaneState = scene.clipPlane;
            if (localOptions.clipPlane) {
                scene.clipPlane = new Plane(0, 0, 0, 1);
            }
            if (_this._storeEffectOnSubMeshes) {
                var allDone = true, lastError = null;
                if (mesh.subMeshes) {
                    var tempSubMesh = new SubMesh(0, 0, 0, 0, 0, mesh, undefined, false, false);
                    if (tempSubMesh.materialDefines) {
                        tempSubMesh.materialDefines._renderId = -1;
                    }
                    if (!_this.isReadyForSubMesh(mesh, tempSubMesh, localOptions.useInstances)) {
                        if (tempSubMesh.effect && tempSubMesh.effect.getCompilationError() && tempSubMesh.effect.allFallbacksProcessed()) {
                            lastError = tempSubMesh.effect.getCompilationError();
                        }
                        else {
                            allDone = false;
                            setTimeout(checkReady, 16);
                        }
                    }
                }
                if (allDone) {
                    _this.allowShaderHotSwapping = currentHotSwapingState;
                    if (lastError) {
                        if (onError) {
                            onError(lastError);
                        }
                    }
                    if (onCompiled) {
                        onCompiled(_this);
                    }
                }
            }
            else {
                if (_this.isReady()) {
                    _this.allowShaderHotSwapping = currentHotSwapingState;
                    if (onCompiled) {
                        onCompiled(_this);
                    }
                }
                else {
                    setTimeout(checkReady, 16);
                }
            }
            if (localOptions.clipPlane) {
                scene.clipPlane = clipPlaneState;
            }
        };
        checkReady();
    };
    /**
     * Force shader compilation
     * @param mesh defines the mesh that will use this material
     * @param options defines additional options for compiling the shaders
     * @returns a promise that resolves when the compilation completes
     */
    Material.prototype.forceCompilationAsync = function (mesh, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.forceCompilation(mesh, function () {
                resolve();
            }, options, function (reason) {
                reject(reason);
            });
        });
    };
    /**
     * Marks a define in the material to indicate that it needs to be re-computed
     * @param flag defines a flag used to determine which parts of the material have to be marked as dirty
     */
    Material.prototype.markAsDirty = function (flag) {
        if (this.getScene().blockMaterialDirtyMechanism) {
            return;
        }
        Material._DirtyCallbackArray.length = 0;
        if (flag & Material.TextureDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._TextureDirtyCallBack);
        }
        if (flag & Material.LightDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._LightsDirtyCallBack);
        }
        if (flag & Material.FresnelDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._FresnelDirtyCallBack);
        }
        if (flag & Material.AttributesDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._AttributeDirtyCallBack);
        }
        if (flag & Material.MiscDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._MiscDirtyCallBack);
        }
        if (flag & Material.PrePassDirtyFlag) {
            Material._DirtyCallbackArray.push(Material._PrePassDirtyCallBack);
        }
        if (Material._DirtyCallbackArray.length) {
            this._markAllSubMeshesAsDirty(Material._RunDirtyCallBacks);
        }
        this.getScene().resetCachedMaterial();
    };
    /**
     * Resets the draw wrappers cache for all submeshes that are using this material
     */
    Material.prototype.resetDrawCache = function () {
        var meshes = this.getScene().meshes;
        for (var _i = 0, meshes_2 = meshes; _i < meshes_2.length; _i++) {
            var mesh = meshes_2[_i];
            if (!mesh.subMeshes) {
                continue;
            }
            for (var _a = 0, _b = mesh.subMeshes; _a < _b.length; _a++) {
                var subMesh = _b[_a];
                if (subMesh.getMaterial() !== this) {
                    continue;
                }
                subMesh.resetDrawCache();
            }
        }
    };
    /**
     * Marks all submeshes of a material to indicate that their material defines need to be re-calculated
     * @param func defines a function which checks material defines against the submeshes
     */
    Material.prototype._markAllSubMeshesAsDirty = function (func) {
        if (this.getScene().blockMaterialDirtyMechanism) {
            return;
        }
        var meshes = this.getScene().meshes;
        for (var _i = 0, meshes_3 = meshes; _i < meshes_3.length; _i++) {
            var mesh = meshes_3[_i];
            if (!mesh.subMeshes) {
                continue;
            }
            for (var _a = 0, _b = mesh.subMeshes; _a < _b.length; _a++) {
                var subMesh = _b[_a];
                // We want to skip the submeshes which are not using this material or which have not yet rendered at least once
                if (mesh._renderId === 0 || subMesh.getMaterial() !== this) {
                    continue;
                }
                for (var _c = 0, _d = subMesh._drawWrappers; _c < _d.length; _c++) {
                    var drawWrapper = _d[_c];
                    if (!drawWrapper || !drawWrapper.defines || !drawWrapper.defines.markAllAsDirty) {
                        continue;
                    }
                    if (this._materialContext === drawWrapper.materialContext) {
                        func(drawWrapper.defines);
                    }
                }
            }
        }
    };
    /**
     * Indicates that the scene should check if the rendering now needs a prepass
     */
    Material.prototype._markScenePrePassDirty = function () {
        if (this.getScene().blockMaterialDirtyMechanism) {
            return;
        }
        var prePassRenderer = this.getScene().enablePrePassRenderer();
        if (prePassRenderer) {
            prePassRenderer.markAsDirty();
        }
    };
    /**
     * Indicates that we need to re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsAllDirty = function () {
        this._markAllSubMeshesAsDirty(Material._AllDirtyCallBack);
    };
    /**
     * Indicates that image processing needs to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsImageProcessingDirty = function () {
        this._markAllSubMeshesAsDirty(Material._ImageProcessingDirtyCallBack);
    };
    /**
     * Indicates that textures need to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._markAllSubMeshesAsDirty(Material._TextureDirtyCallBack);
    };
    /**
     * Indicates that fresnel needs to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsFresnelDirty = function () {
        this._markAllSubMeshesAsDirty(Material._FresnelDirtyCallBack);
    };
    /**
     * Indicates that fresnel and misc need to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsFresnelAndMiscDirty = function () {
        this._markAllSubMeshesAsDirty(Material._FresnelAndMiscDirtyCallBack);
    };
    /**
     * Indicates that lights need to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsLightsDirty = function () {
        this._markAllSubMeshesAsDirty(Material._LightsDirtyCallBack);
    };
    /**
     * Indicates that attributes need to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsAttributesDirty = function () {
        this._markAllSubMeshesAsDirty(Material._AttributeDirtyCallBack);
    };
    /**
     * Indicates that misc needs to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsMiscDirty = function () {
        this._markAllSubMeshesAsDirty(Material._MiscDirtyCallBack);
    };
    /**
     * Indicates that prepass needs to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsPrePassDirty = function () {
        this._markAllSubMeshesAsDirty(Material._MiscDirtyCallBack);
    };
    /**
     * Indicates that textures and misc need to be re-calculated for all submeshes
     */
    Material.prototype._markAllSubMeshesAsTexturesAndMiscDirty = function () {
        this._markAllSubMeshesAsDirty(Material._TextureAndMiscDirtyCallBack);
    };
    /**
     * Sets the required values to the prepass renderer.
     * @param prePassRenderer defines the prepass renderer to setup.
     * @returns true if the pre pass is needed.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Material.prototype.setPrePassRenderer = function (prePassRenderer) {
        // Do Nothing by default
        return false;
    };
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     * @param notBoundToMesh specifies if the material that is being disposed is known to be not bound to any mesh
     */
    Material.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        var scene = this.getScene();
        // Animations
        scene.stopAnimation(this);
        scene.freeProcessedMaterials();
        // Remove from scene
        scene.removeMaterial(this);
        this._eventInfo.forceDisposeTextures = forceDisposeTextures;
        this._callbackPluginEventGeneric(MaterialPluginEvent.Disposed, this._eventInfo);
        if (this._parentContainer) {
            var index = this._parentContainer.materials.indexOf(this);
            if (index > -1) {
                this._parentContainer.materials.splice(index, 1);
            }
            this._parentContainer = null;
        }
        if (notBoundToMesh !== true) {
            // Remove from meshes
            if (this.meshMap) {
                for (var meshId in this.meshMap) {
                    var mesh = this.meshMap[meshId];
                    if (mesh) {
                        mesh.material = null; // will set the entry in the map to undefined
                        this.releaseVertexArrayObject(mesh, forceDisposeEffect);
                    }
                }
            }
            else {
                var meshes = scene.meshes;
                for (var _i = 0, meshes_4 = meshes; _i < meshes_4.length; _i++) {
                    var mesh = meshes_4[_i];
                    if (mesh.material === this && !mesh.sourceMesh) {
                        mesh.material = null;
                        this.releaseVertexArrayObject(mesh, forceDisposeEffect);
                    }
                }
            }
        }
        this._uniformBuffer.dispose();
        // Shader are kept in cache for further use but we can get rid of this by using forceDisposeEffect
        if (forceDisposeEffect && this._drawWrapper.effect) {
            if (!this._storeEffectOnSubMeshes) {
                this._drawWrapper.effect.dispose();
            }
            this._drawWrapper.effect = null;
        }
        this.metadata = null;
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        if (this._onBindObservable) {
            this._onBindObservable.clear();
        }
        if (this._onUnBindObservable) {
            this._onUnBindObservable.clear();
        }
        if (this._onEffectCreatedObservable) {
            this._onEffectCreatedObservable.clear();
        }
    };
    /**
     * @param mesh
     * @param forceDisposeEffect
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Material.prototype.releaseVertexArrayObject = function (mesh, forceDisposeEffect) {
        if (mesh.geometry) {
            var geometry = mesh.geometry;
            if (this._storeEffectOnSubMeshes) {
                for (var _i = 0, _a = mesh.subMeshes; _i < _a.length; _i++) {
                    var subMesh = _a[_i];
                    geometry._releaseVertexArrayObject(subMesh.effect);
                    if (forceDisposeEffect && subMesh.effect) {
                        subMesh.effect.dispose();
                    }
                }
            }
            else {
                geometry._releaseVertexArrayObject(this._drawWrapper.effect);
            }
        }
    };
    /**
     * Serializes this material
     * @returns the serialized material object
     */
    Material.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.stencil = this.stencil.serialize();
        serializationObject.uniqueId = this.uniqueId;
        return serializationObject;
    };
    /**
     * Creates a material from parsed material data
     * @param parsedMaterial defines parsed material data
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures
     * @returns a new material
     */
    Material.Parse = function (parsedMaterial, scene, rootUrl) {
        if (!parsedMaterial.customType) {
            parsedMaterial.customType = "BABYLON.StandardMaterial";
        }
        else if (parsedMaterial.customType === "BABYLON.PBRMaterial" && parsedMaterial.overloadedAlbedo) {
            parsedMaterial.customType = "BABYLON.LegacyPBRMaterial";
            if (!BABYLON.LegacyPBRMaterial) {
                Logger.Error("Your scene is trying to load a legacy version of the PBRMaterial, please, include it from the materials library.");
                return null;
            }
        }
        var materialType = Tools.Instantiate(parsedMaterial.customType);
        var material = materialType.Parse(parsedMaterial, scene, rootUrl);
        material._loadedUniqueId = parsedMaterial.uniqueId;
        return material;
    };
    /**
     * Returns the triangle fill mode
     */
    Material.TriangleFillMode = 0;
    /**
     * Returns the wireframe mode
     */
    Material.WireFrameFillMode = 1;
    /**
     * Returns the point fill mode
     */
    Material.PointFillMode = 2;
    /**
     * Returns the point list draw mode
     */
    Material.PointListDrawMode = 3;
    /**
     * Returns the line list draw mode
     */
    Material.LineListDrawMode = 4;
    /**
     * Returns the line loop draw mode
     */
    Material.LineLoopDrawMode = 5;
    /**
     * Returns the line strip draw mode
     */
    Material.LineStripDrawMode = 6;
    /**
     * Returns the triangle strip draw mode
     */
    Material.TriangleStripDrawMode = 7;
    /**
     * Returns the triangle fan draw mode
     */
    Material.TriangleFanDrawMode = 8;
    /**
     * Stores the clock-wise side orientation
     */
    Material.ClockWiseSideOrientation = 0;
    /**
     * Stores the counter clock-wise side orientation
     */
    Material.CounterClockWiseSideOrientation = 1;
    /**
     * The dirty texture flag value
     */
    Material.TextureDirtyFlag = 1;
    /**
     * The dirty light flag value
     */
    Material.LightDirtyFlag = 2;
    /**
     * The dirty fresnel flag value
     */
    Material.FresnelDirtyFlag = 4;
    /**
     * The dirty attribute flag value
     */
    Material.AttributesDirtyFlag = 8;
    /**
     * The dirty misc flag value
     */
    Material.MiscDirtyFlag = 16;
    /**
     * The dirty prepass flag value
     */
    Material.PrePassDirtyFlag = 32;
    /**
     * The all dirty flag value
     */
    Material.AllDirtyFlag = 63;
    /**
     * MaterialTransparencyMode: No transparency mode, Alpha channel is not use.
     */
    Material.MATERIAL_OPAQUE = 0;
    /**
     * MaterialTransparencyMode: Alpha Test mode, pixel are discarded below a certain threshold defined by the alpha cutoff value.
     */
    Material.MATERIAL_ALPHATEST = 1;
    /**
     * MaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     */
    Material.MATERIAL_ALPHABLEND = 2;
    /**
     * MaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     * They are also discarded below the alpha cutoff threshold to improve performances.
     */
    Material.MATERIAL_ALPHATESTANDBLEND = 3;
    /**
     * The Whiteout method is used to blend normals.
     * Details of the algorithm can be found here: https://blog.selfshadow.com/publications/blending-in-detail/
     */
    Material.MATERIAL_NORMALBLENDMETHOD_WHITEOUT = 0;
    /**
     * The Reoriented Normal Mapping method is used to blend normals.
     * Details of the algorithm can be found here: https://blog.selfshadow.com/publications/blending-in-detail/
     */
    Material.MATERIAL_NORMALBLENDMETHOD_RNM = 1;
    /**
     * Event observable which raises global events common to all materials (like MaterialPluginEvent.Created)
     */
    Material.OnEventObservable = new Observable();
    Material._AllDirtyCallBack = function (defines) { return defines.markAllAsDirty(); };
    Material._ImageProcessingDirtyCallBack = function (defines) { return defines.markAsImageProcessingDirty(); };
    Material._TextureDirtyCallBack = function (defines) { return defines.markAsTexturesDirty(); };
    Material._FresnelDirtyCallBack = function (defines) { return defines.markAsFresnelDirty(); };
    Material._MiscDirtyCallBack = function (defines) { return defines.markAsMiscDirty(); };
    Material._PrePassDirtyCallBack = function (defines) { return defines.markAsPrePassDirty(); };
    Material._LightsDirtyCallBack = function (defines) { return defines.markAsLightDirty(); };
    Material._AttributeDirtyCallBack = function (defines) { return defines.markAsAttributesDirty(); };
    Material._FresnelAndMiscDirtyCallBack = function (defines) {
        Material._FresnelDirtyCallBack(defines);
        Material._MiscDirtyCallBack(defines);
    };
    Material._TextureAndMiscDirtyCallBack = function (defines) {
        Material._TextureDirtyCallBack(defines);
        Material._MiscDirtyCallBack(defines);
    };
    Material._DirtyCallbackArray = [];
    Material._RunDirtyCallBacks = function (defines) {
        for (var _i = 0, _a = Material._DirtyCallbackArray; _i < _a.length; _i++) {
            var cb = _a[_i];
            cb(defines);
        }
    };
    __decorate([
        serialize()
    ], Material.prototype, "id", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "uniqueId", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "name", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "metadata", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "checkReadyOnEveryCall", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "checkReadyOnlyOnce", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "state", void 0);
    __decorate([
        serialize("alpha")
    ], Material.prototype, "_alpha", void 0);
    __decorate([
        serialize("backFaceCulling")
    ], Material.prototype, "_backFaceCulling", void 0);
    __decorate([
        serialize("cullBackFaces")
    ], Material.prototype, "_cullBackFaces", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "sideOrientation", void 0);
    __decorate([
        serialize("alphaMode")
    ], Material.prototype, "_alphaMode", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "_needDepthPrePass", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "disableDepthWrite", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "disableColorWrite", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "forceDepthWrite", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "depthFunction", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "separateCullingPass", void 0);
    __decorate([
        serialize("fogEnabled")
    ], Material.prototype, "_fogEnabled", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "pointSize", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "zOffset", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "zOffsetUnits", void 0);
    __decorate([
        serialize()
    ], Material.prototype, "pointsCloud", null);
    __decorate([
        serialize()
    ], Material.prototype, "fillMode", null);
    __decorate([
        serialize()
    ], Material.prototype, "transparencyMode", null);
    return Material;
}());
export { Material };
//# sourceMappingURL=material.js.map