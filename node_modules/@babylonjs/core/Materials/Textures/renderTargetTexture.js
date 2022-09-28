import { __extends } from "tslib";
import { Observable } from "../../Misc/observable.js";
import { Tools } from "../../Misc/tools.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { Texture } from "../../Materials/Textures/texture.js";
import { PostProcessManager } from "../../PostProcesses/postProcessManager.js";
import { RenderingManager } from "../../Rendering/renderingManager.js";

import "../../Engines/Extensions/engine.renderTarget.js";
import "../../Engines/Extensions/engine.renderTargetCube.js";
import { Engine } from "../../Engines/engine.js";
/**
 * This Helps creating a texture that will be created from a camera in your scene.
 * It is basically a dynamic texture that could be used to create special effects for instance.
 * Actually, It is the base of lot of effects in the framework like post process, shadows, effect layers and rendering pipelines...
 */
var RenderTargetTexture = /** @class */ (function (_super) {
    __extends(RenderTargetTexture, _super);
    /**
     * Instantiate a render target texture. This is mainly used to render of screen the scene to for instance apply post process
     * or used a shadow, depth texture...
     * @param name The friendly name of the texture
     * @param size The size of the RTT (number if square, or {width: number, height:number} or {ratio:} to define a ratio from the main scene)
     * @param scene The scene the RTT belongs to. The latest created scene will be used if not precised.
     * @param generateMipMaps True if mip maps need to be generated after render.
     * @param doNotChangeAspectRatio True to not change the aspect ratio of the scene in the RTT
     * @param type The type of the buffer in the RTT (int, half float, float...)
     * @param isCube True if a cube texture needs to be created
     * @param samplingMode The sampling mode to be usedwith the render target (Linear, Nearest...)
     * @param generateDepthBuffer True to generate a depth buffer
     * @param generateStencilBuffer True to generate a stencil buffer
     * @param isMulti True if multiple textures need to be created (Draw Buffers)
     * @param format The internal format of the buffer in the RTT (RED, RG, RGB, RGBA, ALPHA...)
     * @param delayAllocation if the texture allocation should be delayed (default: false)
     * @param samples sample count to use when creating the RTT
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     * @param noColorTarget True to indicate that no color target should be created. Useful if you only want to write to the depth buffer, for eg
     * @param useSRGBBuffer True to create a SRGB texture
     */
    function RenderTargetTexture(name, size, scene, generateMipMaps, doNotChangeAspectRatio, type, isCube, samplingMode, generateDepthBuffer, generateStencilBuffer, isMulti, format, delayAllocation, samples, creationFlags, noColorTarget, useSRGBBuffer) {
        if (doNotChangeAspectRatio === void 0) { doNotChangeAspectRatio = true; }
        if (type === void 0) { type = 0; }
        if (isCube === void 0) { isCube = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (generateDepthBuffer === void 0) { generateDepthBuffer = true; }
        if (generateStencilBuffer === void 0) { generateStencilBuffer = false; }
        if (isMulti === void 0) { isMulti = false; }
        if (format === void 0) { format = 5; }
        if (delayAllocation === void 0) { delayAllocation = false; }
        if (noColorTarget === void 0) { noColorTarget = false; }
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        var _this = this;
        var _a;
        _this = _super.call(this, null, scene, !generateMipMaps, undefined, samplingMode, undefined, undefined, undefined, undefined, format) || this;
        /**
         * Define if particles should be rendered in your texture.
         */
        _this.renderParticles = true;
        /**
         * Define if sprites should be rendered in your texture.
         */
        _this.renderSprites = false;
        /**
         * Define if the camera viewport should be respected while rendering the texture or if the render should be done to the entire texture.
         */
        _this.ignoreCameraViewport = false;
        /**
         * An event triggered when the texture is unbind.
         */
        _this.onBeforeBindObservable = new Observable();
        /**
         * An event triggered when the texture is unbind.
         */
        _this.onAfterUnbindObservable = new Observable();
        /**
         * An event triggered before rendering the texture
         */
        _this.onBeforeRenderObservable = new Observable();
        /**
         * An event triggered after rendering the texture
         */
        _this.onAfterRenderObservable = new Observable();
        /**
         * An event triggered after the texture clear
         */
        _this.onClearObservable = new Observable();
        /**
         * An event triggered when the texture is resized.
         */
        _this.onResizeObservable = new Observable();
        /** @hidden */
        _this._cleared = false;
        /**
         * Skip the initial clear of the rtt at the beginning of the frame render loop
         */
        _this.skipInitialClear = false;
        _this._currentRefreshId = -1;
        _this._refreshRate = 1;
        _this._samples = 1;
        _this._canRescale = true;
        _this._renderTarget = null;
        /**
         * Gets or sets the center of the bounding box associated with the texture (when in cube mode)
         * It must define where the camera used to render the texture is set
         */
        _this.boundingBoxPosition = Vector3.Zero();
        scene = _this.getScene();
        if (!scene) {
            return _this;
        }
        var engine = _this.getScene().getEngine();
        _this._coordinatesMode = Texture.PROJECTION_MODE;
        _this.renderList = new Array();
        _this.name = name;
        _this.isRenderTarget = true;
        _this._initialSizeParameter = size;
        _this._renderPassIds = [];
        _this._isCubeData = isCube;
        _this._processSizeParameter(size);
        _this.renderPassId = _this._renderPassIds[0];
        _this._resizeObserver = engine.onResizeObservable.add(function () { });
        _this._generateMipMaps = generateMipMaps ? true : false;
        _this._doNotChangeAspectRatio = doNotChangeAspectRatio;
        // Rendering groups
        _this._renderingManager = new RenderingManager(scene);
        _this._renderingManager._useSceneAutoClearSetup = true;
        if (isMulti) {
            return _this;
        }
        _this._renderTargetOptions = {
            generateMipMaps: generateMipMaps,
            type: type,
            format: (_a = _this._format) !== null && _a !== void 0 ? _a : undefined,
            samplingMode: _this.samplingMode,
            generateDepthBuffer: generateDepthBuffer,
            generateStencilBuffer: generateStencilBuffer,
            samples: samples,
            creationFlags: creationFlags,
            noColorTarget: noColorTarget,
            useSRGBBuffer: useSRGBBuffer,
        };
        if (_this.samplingMode === Texture.NEAREST_SAMPLINGMODE) {
            _this.wrapU = Texture.CLAMP_ADDRESSMODE;
            _this.wrapV = Texture.CLAMP_ADDRESSMODE;
        }
        if (!delayAllocation) {
            if (isCube) {
                _this._renderTarget = scene.getEngine().createRenderTargetCubeTexture(_this.getRenderSize(), _this._renderTargetOptions);
                _this.coordinatesMode = Texture.INVCUBIC_MODE;
                _this._textureMatrix = Matrix.Identity();
            }
            else {
                _this._renderTarget = scene.getEngine().createRenderTargetTexture(_this._size, _this._renderTargetOptions);
            }
            _this._texture = _this._renderTarget.texture;
            if (samples !== undefined) {
                _this.samples = samples;
            }
        }
        return _this;
    }
    Object.defineProperty(RenderTargetTexture.prototype, "renderList", {
        /**
         * Use this list to define the list of mesh you want to render.
         */
        get: function () {
            return this._renderList;
        },
        set: function (value) {
            this._renderList = value;
            if (this._renderList) {
                this._hookArray(this._renderList);
            }
        },
        enumerable: false,
        configurable: true
    });
    RenderTargetTexture.prototype._hookArray = function (array) {
        var _this = this;
        var oldPush = array.push;
        array.push = function () {
            var _a;
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var wasEmpty = array.length === 0;
            var result = oldPush.apply(array, items);
            if (wasEmpty) {
                (_a = _this.getScene()) === null || _a === void 0 ? void 0 : _a.meshes.forEach(function (mesh) {
                    mesh._markSubMeshesAsLightDirty();
                });
            }
            return result;
        };
        var oldSplice = array.splice;
        array.splice = function (index, deleteCount) {
            var _a;
            var deleted = oldSplice.apply(array, [index, deleteCount]);
            if (array.length === 0) {
                (_a = _this.getScene()) === null || _a === void 0 ? void 0 : _a.meshes.forEach(function (mesh) {
                    mesh._markSubMeshesAsLightDirty();
                });
            }
            return deleted;
        };
    };
    Object.defineProperty(RenderTargetTexture.prototype, "postProcesses", {
        /**
         * Post-processes for this render target
         */
        get: function () {
            return this._postProcesses;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "_prePassEnabled", {
        get: function () {
            return !!this._prePassRenderTarget && this._prePassRenderTarget.enabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "onAfterUnbind", {
        /**
         * Set a after unbind callback in the texture.
         * This has been kept for backward compatibility and use of onAfterUnbindObservable is recommended.
         */
        set: function (callback) {
            if (this._onAfterUnbindObserver) {
                this.onAfterUnbindObservable.remove(this._onAfterUnbindObserver);
            }
            this._onAfterUnbindObserver = this.onAfterUnbindObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "onBeforeRender", {
        /**
         * Set a before render callback in the texture.
         * This has been kept for backward compatibility and use of onBeforeRenderObservable is recommended.
         */
        set: function (callback) {
            if (this._onBeforeRenderObserver) {
                this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
            }
            this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "onAfterRender", {
        /**
         * Set a after render callback in the texture.
         * This has been kept for backward compatibility and use of onAfterRenderObservable is recommended.
         */
        set: function (callback) {
            if (this._onAfterRenderObserver) {
                this.onAfterRenderObservable.remove(this._onAfterRenderObserver);
            }
            this._onAfterRenderObserver = this.onAfterRenderObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "onClear", {
        /**
         * Set a clear callback in the texture.
         * This has been kept for backward compatibility and use of onClearObservable is recommended.
         */
        set: function (callback) {
            if (this._onClearObserver) {
                this.onClearObservable.remove(this._onClearObserver);
            }
            this._onClearObserver = this.onClearObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "renderPassIds", {
        /**
         * Gets the render pass ids used by the render target texture. For a single render target the array length will be 1, for a cube texture it will be 6 and for
         * a 2D texture array it will return an array of ids the size of the 2D texture array
         */
        get: function () {
            return this._renderPassIds;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "currentRefreshId", {
        /**
         * Gets the current value of the refreshId counter
         */
        get: function () {
            return this._currentRefreshId;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes in this render target texture
     * @param mesh mesh or array of meshes
     * @param material material or array of materials to use for this render pass. If undefined is passed, no specific material will be used but the regular material instead (mesh.material). It's possible to provide an array of materials to use a different material for each rendering in the case of a cube texture (6 rendering) and a 2D texture array (as many rendering as the length of the array)
     */
    RenderTargetTexture.prototype.setMaterialForRendering = function (mesh, material) {
        var meshes;
        if (!Array.isArray(mesh)) {
            meshes = [mesh];
        }
        else {
            meshes = mesh;
        }
        for (var j = 0; j < meshes.length; ++j) {
            for (var i = 0; i < this._renderPassIds.length; ++i) {
                meshes[j].setMaterialForRenderPass(this._renderPassIds[i], material !== undefined ? (Array.isArray(material) ? material[i] : material) : undefined);
            }
        }
    };
    Object.defineProperty(RenderTargetTexture.prototype, "renderTargetOptions", {
        /**
         * Gets render target creation options that were used.
         */
        get: function () {
            return this._renderTargetOptions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "renderTarget", {
        /**
         * Gets the render target wrapper associated with this render target
         */
        get: function () {
            return this._renderTarget;
        },
        enumerable: false,
        configurable: true
    });
    RenderTargetTexture.prototype._onRatioRescale = function () {
        if (this._sizeRatio) {
            this.resize(this._initialSizeParameter);
        }
    };
    Object.defineProperty(RenderTargetTexture.prototype, "boundingBoxSize", {
        get: function () {
            return this._boundingBoxSize;
        },
        /**
         * Gets or sets the size of the bounding box associated with the texture (when in cube mode)
         * When defined, the cubemap will switch to local mode
         * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
         * @example https://www.babylonjs-playground.com/#RNASML
         */
        set: function (value) {
            if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
                return;
            }
            this._boundingBoxSize = value;
            var scene = this.getScene();
            if (scene) {
                scene.markAllMaterialsAsDirty(1);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "depthStencilTexture", {
        /**
         * In case the RTT has been created with a depth texture, get the associated
         * depth texture.
         * Otherwise, return null.
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a._depthStencilTexture) !== null && _b !== void 0 ? _b : null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a depth stencil texture.
     * This is only available in WebGL 2 or with the depth texture extension available.
     * @param comparisonFunction Specifies the comparison function to set on the texture. If 0 or undefined, the texture is not in comparison mode (default: 0)
     * @param bilinearFiltering Specifies whether or not bilinear filtering is enable on the texture (default: true)
     * @param generateStencil Specifies whether or not a stencil should be allocated in the texture (default: false)
     * @param samples sample count of the depth/stencil texture (default: 1)
     * @param format format of the depth texture (default: 14)
     */
    RenderTargetTexture.prototype.createDepthStencilTexture = function (comparisonFunction, bilinearFiltering, generateStencil, samples, format) {
        var _a;
        if (comparisonFunction === void 0) { comparisonFunction = 0; }
        if (bilinearFiltering === void 0) { bilinearFiltering = true; }
        if (generateStencil === void 0) { generateStencil = false; }
        if (samples === void 0) { samples = 1; }
        if (format === void 0) { format = 14; }
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.createDepthStencilTexture(comparisonFunction, bilinearFiltering, generateStencil, samples, format);
    };
    RenderTargetTexture.prototype._releaseRenderPassId = function () {
        if (this._scene) {
            var engine = this._scene.getEngine();
            for (var i = 0; i < this._renderPassIds.length; ++i) {
                engine.releaseRenderPassId(this._renderPassIds[i]);
            }
        }
        this._renderPassIds = [];
    };
    RenderTargetTexture.prototype._createRenderPassId = function () {
        this._releaseRenderPassId();
        var engine = this._scene.getEngine(); // scene can't be null in a RenderTargetTexture, see constructor
        var numPasses = this._isCubeData ? 6 : this.getRenderLayers() || 1;
        for (var i = 0; i < numPasses; ++i) {
            this._renderPassIds[i] = engine.createRenderPassId("RenderTargetTexture - ".concat(this.name, "#").concat(i));
        }
    };
    RenderTargetTexture.prototype._processSizeParameter = function (size) {
        if (size.ratio) {
            this._sizeRatio = size.ratio;
            var engine = this._getEngine();
            this._size = {
                width: this._bestReflectionRenderTargetDimension(engine.getRenderWidth(), this._sizeRatio),
                height: this._bestReflectionRenderTargetDimension(engine.getRenderHeight(), this._sizeRatio),
            };
        }
        else {
            this._size = size;
        }
        this._createRenderPassId();
    };
    Object.defineProperty(RenderTargetTexture.prototype, "samples", {
        /**
         * Define the number of samples to use in case of MSAA.
         * It defaults to one meaning no MSAA has been enabled.
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.samples) !== null && _b !== void 0 ? _b : this._samples;
        },
        set: function (value) {
            if (this._renderTarget) {
                this._samples = this._renderTarget.setSamples(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Resets the refresh counter of the texture and start bak from scratch.
     * Could be useful to regenerate the texture if it is setup to render only once.
     */
    RenderTargetTexture.prototype.resetRefreshCounter = function () {
        this._currentRefreshId = -1;
    };
    Object.defineProperty(RenderTargetTexture.prototype, "refreshRate", {
        /**
         * Define the refresh rate of the texture or the rendering frequency.
         * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
         */
        get: function () {
            return this._refreshRate;
        },
        set: function (value) {
            this._refreshRate = value;
            this.resetRefreshCounter();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds a post process to the render target rendering passes.
     * @param postProcess define the post process to add
     */
    RenderTargetTexture.prototype.addPostProcess = function (postProcess) {
        if (!this._postProcessManager) {
            var scene = this.getScene();
            if (!scene) {
                return;
            }
            this._postProcessManager = new PostProcessManager(scene);
            this._postProcesses = new Array();
        }
        this._postProcesses.push(postProcess);
        this._postProcesses[0].autoClear = false;
    };
    /**
     * Clear all the post processes attached to the render target
     * @param dispose define if the cleared post processes should also be disposed (false by default)
     */
    RenderTargetTexture.prototype.clearPostProcesses = function (dispose) {
        if (dispose === void 0) { dispose = false; }
        if (!this._postProcesses) {
            return;
        }
        if (dispose) {
            for (var _i = 0, _a = this._postProcesses; _i < _a.length; _i++) {
                var postProcess = _a[_i];
                postProcess.dispose();
            }
        }
        this._postProcesses = [];
    };
    /**
     * Remove one of the post process from the list of attached post processes to the texture
     * @param postProcess define the post process to remove from the list
     */
    RenderTargetTexture.prototype.removePostProcess = function (postProcess) {
        if (!this._postProcesses) {
            return;
        }
        var index = this._postProcesses.indexOf(postProcess);
        if (index === -1) {
            return;
        }
        this._postProcesses.splice(index, 1);
        if (this._postProcesses.length > 0) {
            this._postProcesses[0].autoClear = false;
        }
    };
    /** @hidden */
    RenderTargetTexture.prototype._shouldRender = function () {
        if (this._currentRefreshId === -1) {
            // At least render once
            this._currentRefreshId = 1;
            return true;
        }
        if (this.refreshRate === this._currentRefreshId) {
            this._currentRefreshId = 1;
            return true;
        }
        this._currentRefreshId++;
        return false;
    };
    /**
     * Gets the actual render size of the texture.
     * @returns the width of the render size
     */
    RenderTargetTexture.prototype.getRenderSize = function () {
        return this.getRenderWidth();
    };
    /**
     * Gets the actual render width of the texture.
     * @returns the width of the render size
     */
    RenderTargetTexture.prototype.getRenderWidth = function () {
        if (this._size.width) {
            return this._size.width;
        }
        return this._size;
    };
    /**
     * Gets the actual render height of the texture.
     * @returns the height of the render size
     */
    RenderTargetTexture.prototype.getRenderHeight = function () {
        if (this._size.width) {
            return this._size.height;
        }
        return this._size;
    };
    /**
     * Gets the actual number of layers of the texture.
     * @returns the number of layers
     */
    RenderTargetTexture.prototype.getRenderLayers = function () {
        var layers = this._size.layers;
        if (layers) {
            return layers;
        }
        return 0;
    };
    /**
     * Don't allow this render target texture to rescale. Mainly used to prevent rescaling by the scene optimizer.
     */
    RenderTargetTexture.prototype.disableRescaling = function () {
        this._canRescale = false;
    };
    Object.defineProperty(RenderTargetTexture.prototype, "canRescale", {
        /**
         * Get if the texture can be rescaled or not.
         */
        get: function () {
            return this._canRescale;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Resize the texture using a ratio.
     * @param ratio the ratio to apply to the texture size in order to compute the new target size
     */
    RenderTargetTexture.prototype.scale = function (ratio) {
        var newSize = Math.max(1, this.getRenderSize() * ratio);
        this.resize(newSize);
    };
    /**
     * Get the texture reflection matrix used to rotate/transform the reflection.
     * @returns the reflection matrix
     */
    RenderTargetTexture.prototype.getReflectionTextureMatrix = function () {
        if (this.isCube) {
            return this._textureMatrix;
        }
        return _super.prototype.getReflectionTextureMatrix.call(this);
    };
    /**
     * Resize the texture to a new desired size.
     * Be careful as it will recreate all the data in the new texture.
     * @param size Define the new size. It can be:
     *   - a number for squared texture,
     *   - an object containing { width: number, height: number }
     *   - or an object containing a ratio { ratio: number }
     */
    RenderTargetTexture.prototype.resize = function (size) {
        var _a;
        var wasCube = this.isCube;
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.dispose();
        this._renderTarget = null;
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this._processSizeParameter(size);
        if (wasCube) {
            this._renderTarget = scene.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions);
        }
        else {
            this._renderTarget = scene.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions);
        }
        this._texture = this._renderTarget.texture;
        if (this._renderTargetOptions.samples !== undefined) {
            this.samples = this._renderTargetOptions.samples;
        }
        if (this.onResizeObservable.hasObservers()) {
            this.onResizeObservable.notifyObservers(this);
        }
    };
    /**
     * Renders all the objects from the render list into the texture.
     * @param useCameraPostProcess Define if camera post processes should be used during the rendering
     * @param dumpForDebug Define if the rendering result should be dumped (copied) for debugging purpose
     */
    RenderTargetTexture.prototype.render = function (useCameraPostProcess, dumpForDebug) {
        if (useCameraPostProcess === void 0) { useCameraPostProcess = false; }
        if (dumpForDebug === void 0) { dumpForDebug = false; }
        this._render(useCameraPostProcess, dumpForDebug);
    };
    /**
     * This function will check if the render target texture can be rendered (textures are loaded, shaders are compiled)
     * @return true if all required resources are ready
     */
    RenderTargetTexture.prototype.isReadyForRendering = function () {
        return this._render(false, false, true);
    };
    RenderTargetTexture.prototype._render = function (useCameraPostProcess, dumpForDebug, checkReadiness) {
        var _a;
        if (useCameraPostProcess === void 0) { useCameraPostProcess = false; }
        if (dumpForDebug === void 0) { dumpForDebug = false; }
        if (checkReadiness === void 0) { checkReadiness = false; }
        var scene = this.getScene();
        if (!scene) {
            return checkReadiness;
        }
        var engine = scene.getEngine();
        if (this.useCameraPostProcesses !== undefined) {
            useCameraPostProcess = this.useCameraPostProcesses;
        }
        if (this._waitingRenderList) {
            this.renderList = [];
            for (var index = 0; index < this._waitingRenderList.length; index++) {
                var id = this._waitingRenderList[index];
                var mesh = scene.getMeshById(id);
                if (mesh) {
                    this.renderList.push(mesh);
                }
            }
            this._waitingRenderList = undefined;
        }
        // Is predicate defined?
        if (this.renderListPredicate) {
            if (this.renderList) {
                this.renderList.length = 0; // Clear previous renderList
            }
            else {
                this.renderList = [];
            }
            var scene_1 = this.getScene();
            if (!scene_1) {
                return checkReadiness;
            }
            var sceneMeshes = scene_1.meshes;
            for (var index = 0; index < sceneMeshes.length; index++) {
                var mesh = sceneMeshes[index];
                if (this.renderListPredicate(mesh)) {
                    this.renderList.push(mesh);
                }
            }
        }
        var currentRenderPassId = engine.currentRenderPassId;
        this.onBeforeBindObservable.notifyObservers(this);
        // Set custom projection.
        // Needs to be before binding to prevent changing the aspect ratio.
        var camera = (_a = this.activeCamera) !== null && _a !== void 0 ? _a : scene.activeCamera;
        if (camera) {
            if (camera !== scene.activeCamera) {
                scene.setTransformMatrix(camera.getViewMatrix(), camera.getProjectionMatrix(true));
            }
            engine.setViewport(camera.viewport, this.getRenderWidth(), this.getRenderHeight());
        }
        this._defaultRenderListPrepared = false;
        var returnValue = checkReadiness;
        if (!checkReadiness) {
            if (this.is2DArray) {
                for (var layer = 0; layer < this.getRenderLayers(); layer++) {
                    this._renderToTarget(0, useCameraPostProcess, dumpForDebug, layer, camera);
                    scene.incrementRenderId();
                    scene.resetCachedMaterial();
                }
            }
            else if (this.isCube) {
                for (var face = 0; face < 6; face++) {
                    this._renderToTarget(face, useCameraPostProcess, dumpForDebug, undefined, camera);
                    scene.incrementRenderId();
                    scene.resetCachedMaterial();
                }
            }
            else {
                this._renderToTarget(0, useCameraPostProcess, dumpForDebug, undefined, camera);
            }
        }
        else {
            if (!scene.getViewMatrix()) {
                // We probably didn't execute scene.render() yet, so make sure we have a view/projection matrix setup for the scene
                scene.updateTransformMatrix();
            }
            var numLayers = this.is2DArray ? this.getRenderLayers() : this.isCube ? 6 : 1;
            for (var layer = 0; layer < numLayers && returnValue; layer++) {
                var currentRenderList = null;
                var defaultRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
                var defaultRenderListLength = this.renderList ? this.renderList.length : scene.getActiveMeshes().length;
                engine.currentRenderPassId = this._renderPassIds[layer];
                this.onBeforeRenderObservable.notifyObservers(layer);
                if (this.getCustomRenderList) {
                    currentRenderList = this.getCustomRenderList(layer, defaultRenderList, defaultRenderListLength);
                }
                if (!currentRenderList) {
                    currentRenderList = defaultRenderList;
                }
                if (!this._doNotChangeAspectRatio) {
                    scene.updateTransformMatrix(true);
                }
                for (var i = 0; i < currentRenderList.length && returnValue; ++i) {
                    var mesh = currentRenderList[i];
                    if (!mesh.isEnabled() || mesh.isBlocked || !mesh.isVisible || !mesh.subMeshes) {
                        continue;
                    }
                    if (this.customIsReadyFunction) {
                        if (!this.customIsReadyFunction(mesh, this.refreshRate)) {
                            returnValue = false;
                            break;
                        }
                    }
                    else if (!mesh.isReady(true)) {
                        returnValue = false;
                        break;
                    }
                }
                this.onAfterRenderObservable.notifyObservers(layer);
            }
        }
        this.onAfterUnbindObservable.notifyObservers(this);
        engine.currentRenderPassId = currentRenderPassId;
        if (scene.activeCamera) {
            // Do not avoid setting uniforms when multiple scenes are active as another camera may have overwrite these
            if (scene.getEngine().scenes.length > 1 || (this.activeCamera && this.activeCamera !== scene.activeCamera)) {
                scene.setTransformMatrix(scene.activeCamera.getViewMatrix(), scene.activeCamera.getProjectionMatrix(true));
            }
            engine.setViewport(scene.activeCamera.viewport);
        }
        scene.resetCachedMaterial();
        return returnValue;
    };
    RenderTargetTexture.prototype._bestReflectionRenderTargetDimension = function (renderDimension, scale) {
        var minimum = 128;
        var x = renderDimension * scale;
        var curved = Engine.NearestPOT(x + (minimum * minimum) / (minimum + x));
        // Ensure we don't exceed the render dimension (while staying POT)
        return Math.min(Engine.FloorPOT(renderDimension), curved);
    };
    RenderTargetTexture.prototype._prepareRenderingManager = function (currentRenderList, currentRenderListLength, camera, checkLayerMask) {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this._renderingManager.reset();
        var sceneRenderId = scene.getRenderId();
        for (var meshIndex = 0; meshIndex < currentRenderListLength; meshIndex++) {
            var mesh = currentRenderList[meshIndex];
            if (mesh && !mesh.isBlocked) {
                if (this.customIsReadyFunction) {
                    if (!this.customIsReadyFunction(mesh, this.refreshRate)) {
                        this.resetRefreshCounter();
                        continue;
                    }
                }
                else if (!mesh.isReady(this.refreshRate === 0)) {
                    this.resetRefreshCounter();
                    continue;
                }
                if (!mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate && scene.activeCamera) {
                    mesh._internalAbstractMeshDataInfo._currentLOD = scene.customLODSelector
                        ? scene.customLODSelector(mesh, this.activeCamera || scene.activeCamera)
                        : mesh.getLOD(this.activeCamera || scene.activeCamera);
                    mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate = true;
                }
                if (!mesh._internalAbstractMeshDataInfo._currentLOD) {
                    continue;
                }
                var meshToRender = mesh._internalAbstractMeshDataInfo._currentLOD;
                meshToRender._preActivateForIntermediateRendering(sceneRenderId);
                var isMasked = void 0;
                if (checkLayerMask && camera) {
                    isMasked = (mesh.layerMask & camera.layerMask) === 0;
                }
                else {
                    isMasked = false;
                }
                if (mesh.isEnabled() && mesh.isVisible && mesh.subMeshes && !isMasked) {
                    if (meshToRender !== mesh) {
                        meshToRender._activate(sceneRenderId, true);
                    }
                    if (mesh._activate(sceneRenderId, true) && mesh.subMeshes.length) {
                        if (!mesh.isAnInstance) {
                            meshToRender._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = false;
                        }
                        else {
                            if (mesh._internalAbstractMeshDataInfo._actAsRegularMesh) {
                                meshToRender = mesh;
                            }
                        }
                        meshToRender._internalAbstractMeshDataInfo._isActiveIntermediate = true;
                        for (var subIndex = 0; subIndex < meshToRender.subMeshes.length; subIndex++) {
                            var subMesh = meshToRender.subMeshes[subIndex];
                            this._renderingManager.dispatch(subMesh, meshToRender);
                        }
                    }
                }
            }
        }
        for (var particleIndex = 0; particleIndex < scene.particleSystems.length; particleIndex++) {
            var particleSystem = scene.particleSystems[particleIndex];
            var emitter = particleSystem.emitter;
            if (!particleSystem.isStarted() || !emitter || !emitter.position || !emitter.isEnabled()) {
                continue;
            }
            if (currentRenderList.indexOf(emitter) >= 0) {
                this._renderingManager.dispatchParticles(particleSystem);
            }
        }
    };
    /**
     * @hidden
     * @param faceIndex face index to bind to if this is a cubetexture
     * @param layer defines the index of the texture to bind in the array
     */
    RenderTargetTexture.prototype._bindFrameBuffer = function (faceIndex, layer) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (layer === void 0) { layer = 0; }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = scene.getEngine();
        if (this._renderTarget) {
            engine.bindFramebuffer(this._renderTarget, this.isCube ? faceIndex : undefined, undefined, undefined, this.ignoreCameraViewport, 0, layer);
        }
    };
    RenderTargetTexture.prototype._unbindFrameBuffer = function (engine, faceIndex) {
        var _this = this;
        if (!this._renderTarget) {
            return;
        }
        engine.unBindFramebuffer(this._renderTarget, this.isCube, function () {
            _this.onAfterRenderObservable.notifyObservers(faceIndex);
        });
    };
    /**
     * @param scene
     * @param faceIndex
     * @param layer
     * @param useCameraPostProcess
     * @hidden
     */
    RenderTargetTexture.prototype._prepareFrame = function (scene, faceIndex, layer, useCameraPostProcess) {
        if (this._postProcessManager) {
            if (!this._prePassEnabled) {
                this._postProcessManager._prepareFrame(this._texture, this._postProcesses);
            }
        }
        else if (!useCameraPostProcess || !scene.postProcessManager._prepareFrame(this._texture)) {
            this._bindFrameBuffer(faceIndex, layer);
        }
    };
    RenderTargetTexture.prototype._renderToTarget = function (faceIndex, useCameraPostProcess, dumpForDebug, layer, camera) {
        var _a, _b, _c, _d, _e, _f;
        if (layer === void 0) { layer = 0; }
        if (camera === void 0) { camera = null; }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = scene.getEngine();
        (_a = engine._debugPushGroup) === null || _a === void 0 ? void 0 : _a.call(engine, "render to face #".concat(faceIndex, " layer #").concat(layer), 1);
        // Bind
        this._prepareFrame(scene, faceIndex, layer, useCameraPostProcess);
        if (this.is2DArray) {
            engine.currentRenderPassId = this._renderPassIds[layer];
            this.onBeforeRenderObservable.notifyObservers(layer);
        }
        else {
            engine.currentRenderPassId = this._renderPassIds[faceIndex];
            this.onBeforeRenderObservable.notifyObservers(faceIndex);
        }
        var fastPath = engine.snapshotRendering && engine.snapshotRenderingMode === 1;
        if (!fastPath) {
            // Get the list of meshes to render
            var currentRenderList = null;
            var defaultRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
            var defaultRenderListLength = this.renderList ? this.renderList.length : scene.getActiveMeshes().length;
            if (this.getCustomRenderList) {
                currentRenderList = this.getCustomRenderList(this.is2DArray ? layer : faceIndex, defaultRenderList, defaultRenderListLength);
            }
            if (!currentRenderList) {
                // No custom render list provided, we prepare the rendering for the default list, but check
                // first if we did not already performed the preparation before so as to avoid re-doing it several times
                if (!this._defaultRenderListPrepared) {
                    this._prepareRenderingManager(defaultRenderList, defaultRenderListLength, camera, !this.renderList);
                    this._defaultRenderListPrepared = true;
                }
                currentRenderList = defaultRenderList;
            }
            else {
                // Prepare the rendering for the custom render list provided
                this._prepareRenderingManager(currentRenderList, currentRenderList.length, camera, false);
            }
            // Before clear
            for (var _i = 0, _g = scene._beforeRenderTargetClearStage; _i < _g.length; _i++) {
                var step = _g[_i];
                step.action(this, faceIndex, layer);
            }
            // Clear
            if (this.onClearObservable.hasObservers()) {
                this.onClearObservable.notifyObservers(engine);
            }
            else {
                if (!this.skipInitialClear) {
                    engine.clear(this.clearColor || scene.clearColor, true, true, true);
                }
            }
            if (!this._doNotChangeAspectRatio) {
                scene.updateTransformMatrix(true);
            }
            // Before Camera Draw
            for (var _h = 0, _j = scene._beforeRenderTargetDrawStage; _h < _j.length; _h++) {
                var step = _j[_h];
                step.action(this, faceIndex, layer);
            }
            // Render
            this._renderingManager.render(this.customRenderFunction, currentRenderList, this.renderParticles, this.renderSprites);
            // After Camera Draw
            for (var _k = 0, _l = scene._afterRenderTargetDrawStage; _k < _l.length; _k++) {
                var step = _l[_k];
                step.action(this, faceIndex, layer);
            }
            var saveGenerateMipMaps = (_c = (_b = this._texture) === null || _b === void 0 ? void 0 : _b.generateMipMaps) !== null && _c !== void 0 ? _c : false;
            if (this._texture) {
                this._texture.generateMipMaps = false; // if left true, the mipmaps will be generated (if this._texture.generateMipMaps = true) when the first post process binds its own RTT: by doing so it will unbind the current RTT,
                // which will trigger a mipmap generation. We don't want this because it's a wasted work, we will do an unbind of the current RTT at the end of the process (see unbindFrameBuffer) which will
                // trigger the generation of the final mipmaps
            }
            if (this._postProcessManager) {
                this._postProcessManager._finalizeFrame(false, (_d = this._renderTarget) !== null && _d !== void 0 ? _d : undefined, faceIndex, this._postProcesses, this.ignoreCameraViewport);
            }
            else if (useCameraPostProcess) {
                scene.postProcessManager._finalizeFrame(false, (_e = this._renderTarget) !== null && _e !== void 0 ? _e : undefined, faceIndex);
            }
            if (this._texture) {
                this._texture.generateMipMaps = saveGenerateMipMaps;
            }
            if (!this._doNotChangeAspectRatio) {
                scene.updateTransformMatrix(true);
            }
            // Dump ?
            if (dumpForDebug) {
                Tools.DumpFramebuffer(this.getRenderWidth(), this.getRenderHeight(), engine);
            }
        }
        else {
            // Clear
            if (this.onClearObservable.hasObservers()) {
                this.onClearObservable.notifyObservers(engine);
            }
            else {
                if (!this.skipInitialClear) {
                    engine.clear(this.clearColor || scene.clearColor, true, true, true);
                }
            }
        }
        // Unbind
        this._unbindFrameBuffer(engine, faceIndex);
        if (this._texture && this.isCube && faceIndex === 5) {
            engine.generateMipMapsForCubemap(this._texture);
        }
        (_f = engine._debugPopGroup) === null || _f === void 0 ? void 0 : _f.call(engine, 1);
    };
    /**
     * Overrides the default sort function applied in the rendering group to prepare the meshes.
     * This allowed control for front to back rendering or reversely depending of the special needs.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
     * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
     * @param transparentSortCompareFn The transparent queue comparison function use to sort.
     */
    RenderTargetTexture.prototype.setRenderingOrder = function (renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn) {
        if (opaqueSortCompareFn === void 0) { opaqueSortCompareFn = null; }
        if (alphaTestSortCompareFn === void 0) { alphaTestSortCompareFn = null; }
        if (transparentSortCompareFn === void 0) { transparentSortCompareFn = null; }
        this._renderingManager.setRenderingOrder(renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn);
    };
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     */
    RenderTargetTexture.prototype.setRenderingAutoClearDepthStencil = function (renderingGroupId, autoClearDepthStencil) {
        this._renderingManager.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil);
        this._renderingManager._useSceneAutoClearSetup = false;
    };
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    RenderTargetTexture.prototype.clone = function () {
        var textureSize = this.getSize();
        var newTexture = new RenderTargetTexture(this.name, textureSize, this.getScene(), this._renderTargetOptions.generateMipMaps, this._doNotChangeAspectRatio, this._renderTargetOptions.type, this.isCube, this._renderTargetOptions.samplingMode, this._renderTargetOptions.generateDepthBuffer, this._renderTargetOptions.generateStencilBuffer, undefined, this._renderTargetOptions.format, undefined, this._renderTargetOptions.samples);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        if (this.renderList) {
            newTexture.renderList = this.renderList.slice(0);
        }
        return newTexture;
    };
    /**
     * Serialize the texture to a JSON representation we can easily use in the respective Parse function.
     * @returns The JSON representation of the texture
     */
    RenderTargetTexture.prototype.serialize = function () {
        if (!this.name) {
            return null;
        }
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.renderTargetSize = this.getRenderSize();
        serializationObject.renderList = [];
        if (this.renderList) {
            for (var index = 0; index < this.renderList.length; index++) {
                serializationObject.renderList.push(this.renderList[index].id);
            }
        }
        return serializationObject;
    };
    /**
     *  This will remove the attached framebuffer objects. The texture will not be able to be used as render target anymore
     */
    RenderTargetTexture.prototype.disposeFramebufferObjects = function () {
        var _a;
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.dispose(true);
    };
    /**
     * Release and destroy the underlying lower level texture aka internalTexture.
     */
    RenderTargetTexture.prototype.releaseInternalTexture = function () {
        var _a;
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.releaseTextures();
        this._texture = null;
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    RenderTargetTexture.prototype.dispose = function () {
        var _a;
        this.onResizeObservable.clear();
        this.onClearObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onAfterUnbindObservable.clear();
        this.onBeforeBindObservable.clear();
        this.onBeforeRenderObservable.clear();
        if (this._postProcessManager) {
            this._postProcessManager.dispose();
            this._postProcessManager = null;
        }
        if (this._prePassRenderTarget) {
            this._prePassRenderTarget.dispose();
        }
        this._releaseRenderPassId();
        this.clearPostProcesses(true);
        if (this._resizeObserver) {
            this.getScene().getEngine().onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        this.renderList = null;
        // Remove from custom render targets
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var index = scene.customRenderTargets.indexOf(this);
        if (index >= 0) {
            scene.customRenderTargets.splice(index, 1);
        }
        for (var _i = 0, _b = scene.cameras; _i < _b.length; _i++) {
            var camera = _b[_i];
            index = camera.customRenderTargets.indexOf(this);
            if (index >= 0) {
                camera.customRenderTargets.splice(index, 1);
            }
        }
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.dispose();
        this._renderTarget = null;
        this._texture = null;
        _super.prototype.dispose.call(this);
    };
    /** @hidden */
    RenderTargetTexture.prototype._rebuild = function () {
        if (this.refreshRate === RenderTargetTexture.REFRESHRATE_RENDER_ONCE) {
            this.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        }
        if (this._postProcessManager) {
            this._postProcessManager._rebuild();
        }
    };
    /**
     * Clear the info related to rendering groups preventing retention point in material dispose.
     */
    RenderTargetTexture.prototype.freeRenderingGroups = function () {
        if (this._renderingManager) {
            this._renderingManager.freeRenderingGroups();
        }
    };
    /**
     * Gets the number of views the corresponding to the texture (eg. a MultiviewRenderTarget will have > 1)
     * @returns the view count
     */
    RenderTargetTexture.prototype.getViewCount = function () {
        return 1;
    };
    /**
     * The texture will only be rendered once which can be useful to improve performance if everything in your render is static for instance.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONCE = 0;
    /**
     * The texture will only be rendered rendered every frame and is recommended for dynamic contents.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME = 1;
    /**
     * The texture will be rendered every 2 frames which could be enough if your dynamic objects are not
     * the central point of your effect and can save a lot of performances.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = 2;
    return RenderTargetTexture;
}(Texture));
export { RenderTargetTexture };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Texture._CreateRenderTargetTexture = function (name, renderTargetSize, scene, generateMipMaps, creationFlags) {
    return new RenderTargetTexture(name, renderTargetSize, scene, generateMipMaps);
};
//# sourceMappingURL=renderTargetTexture.js.map