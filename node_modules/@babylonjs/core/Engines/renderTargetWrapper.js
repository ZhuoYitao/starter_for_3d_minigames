import { InternalTextureSource } from "../Materials/Textures/internalTexture.js";

/**
 * Wrapper around a render target (either single or multi textures)
 */
var RenderTargetWrapper = /** @class */ (function () {
    /**
     * Initializes the render target wrapper
     * @param isMulti true if the wrapper is a multi render target
     * @param isCube true if the wrapper should render to a cube texture
     * @param size size of the render target (width/height/layers)
     * @param engine engine used to create the render target
     */
    function RenderTargetWrapper(isMulti, isCube, size, engine) {
        this._textures = null;
        /** @hidden */
        this._attachments = null;
        /** @hidden */
        this._generateStencilBuffer = false;
        /** @hidden */
        this._generateDepthBuffer = false;
        /** @hidden */
        this._depthStencilTextureWithStencil = false;
        this._isMulti = isMulti;
        this._isCube = isCube;
        this._size = size;
        this._engine = engine;
        this._depthStencilTexture = null;
    }
    Object.defineProperty(RenderTargetWrapper.prototype, "depthStencilTexture", {
        /**
         * Gets the depth/stencil texture (if created by a createDepthStencilTexture() call)
         */
        get: function () {
            return this._depthStencilTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "depthStencilTextureWithStencil", {
        /**
         * Indicates if the depth/stencil texture has a stencil aspect
         */
        get: function () {
            return this._depthStencilTextureWithStencil;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "isCube", {
        /**
         * Defines if the render target wrapper is for a cube texture or if false a 2d texture
         */
        get: function () {
            return this._isCube;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "isMulti", {
        /**
         * Defines if the render target wrapper is for a single or multi target render wrapper
         */
        get: function () {
            return this._isMulti;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "is2DArray", {
        /**
         * Defines if the render target wrapper is for a single or an array of textures
         */
        get: function () {
            return this.layers > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "size", {
        /**
         * Gets the size of the render target wrapper (used for cubes, as width=height in this case)
         */
        get: function () {
            return this.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "width", {
        /**
         * Gets the width of the render target wrapper
         */
        get: function () {
            return this._size.width || this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "height", {
        /**
         * Gets the height of the render target wrapper
         */
        get: function () {
            return this._size.height || this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "layers", {
        /**
         * Gets the number of layers of the render target wrapper (only used if is2DArray is true)
         */
        get: function () {
            return this._size.layers || 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "texture", {
        /**
         * Gets the render texture. If this is a multi render target, gets the first texture
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this._textures) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "textures", {
        /**
         * Gets the list of render textures. If we are not in a multi render target, the list will be null (use the texture getter instead)
         */
        get: function () {
            return this._textures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderTargetWrapper.prototype, "samples", {
        /**
         * Gets the sample count of the render target
         */
        get: function () {
            var _a, _b;
            return (_b = (_a = this.texture) === null || _a === void 0 ? void 0 : _a.samples) !== null && _b !== void 0 ? _b : 1;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the sample count of the render target
     * @param value sample count
     * @param initializeBuffers If set to true, the engine will make an initializing call to drawBuffers (only used when isMulti=true).
     * @param force true to force calling the update sample count engine function even if the current sample count is equal to value
     * @returns the sample count that has been set
     */
    RenderTargetWrapper.prototype.setSamples = function (value, initializeBuffers, force) {
        if (initializeBuffers === void 0) { initializeBuffers = true; }
        if (force === void 0) { force = false; }
        if (this.samples === value && !force) {
            return value;
        }
        return this._isMulti
            ? this._engine.updateMultipleRenderTargetTextureSampleCount(this, value, initializeBuffers)
            : this._engine.updateRenderTargetTextureSampleCount(this, value);
    };
    /**
     * Sets the render target texture(s)
     * @param textures texture(s) to set
     */
    RenderTargetWrapper.prototype.setTextures = function (textures) {
        if (Array.isArray(textures)) {
            this._textures = textures;
        }
        else if (textures) {
            this._textures = [textures];
        }
        else {
            this._textures = null;
        }
    };
    /**
     * Set a texture in the textures array
     * @param texture the texture to set
     * @param index the index in the textures array to set
     * @param disposePrevious If this function should dispose the previous texture
     */
    RenderTargetWrapper.prototype.setTexture = function (texture, index, disposePrevious) {
        if (index === void 0) { index = 0; }
        if (disposePrevious === void 0) { disposePrevious = true; }
        if (!this._textures) {
            this._textures = [];
        }
        if (this._textures[index] && disposePrevious) {
            this._textures[index].dispose();
        }
        this._textures[index] = texture;
    };
    /**
     * Creates the depth/stencil texture
     * @param comparisonFunction Comparison function to use for the texture
     * @param bilinearFiltering true if bilinear filtering should be used when sampling the texture
     * @param generateStencil true if the stencil aspect should also be created
     * @param samples sample count to use when creating the texture
     * @param format format of the depth texture
     * @returns the depth/stencil created texture
     */
    RenderTargetWrapper.prototype.createDepthStencilTexture = function (comparisonFunction, bilinearFiltering, generateStencil, samples, format) {
        var _a;
        if (comparisonFunction === void 0) { comparisonFunction = 0; }
        if (bilinearFiltering === void 0) { bilinearFiltering = true; }
        if (generateStencil === void 0) { generateStencil = false; }
        if (samples === void 0) { samples = 1; }
        if (format === void 0) { format = 14; }
        (_a = this._depthStencilTexture) === null || _a === void 0 ? void 0 : _a.dispose();
        this._depthStencilTextureWithStencil = generateStencil;
        this._depthStencilTexture = this._engine.createDepthStencilTexture(this._size, {
            bilinearFiltering: bilinearFiltering,
            comparisonFunction: comparisonFunction,
            generateStencil: generateStencil,
            isCube: this._isCube,
            samples: samples,
            depthTextureFormat: format,
        }, this);
        return this._depthStencilTexture;
    };
    /**
     * Shares the depth buffer of this render target with another render target.
     * @hidden
     * @param renderTarget Destination renderTarget
     */
    RenderTargetWrapper.prototype._shareDepth = function (renderTarget) {
        if (this._depthStencilTexture) {
            if (renderTarget._depthStencilTexture) {
                renderTarget._depthStencilTexture.dispose();
            }
            renderTarget._depthStencilTexture = this._depthStencilTexture;
            this._depthStencilTexture.incrementReferences();
        }
    };
    /**
     * @param target
     * @hidden
     */
    RenderTargetWrapper.prototype._swapAndDie = function (target) {
        if (this.texture) {
            this.texture._swapAndDie(target);
        }
        this._textures = null;
        this.dispose(true);
    };
    RenderTargetWrapper.prototype._cloneRenderTargetWrapper = function () {
        var _a, _b, _c, _d, _e, _f;
        var rtw = null;
        if (this._isMulti) {
            var textureArray = this.textures;
            if (textureArray && textureArray.length > 0) {
                var generateDepthTexture = false;
                var textureCount = textureArray.length;
                var lastTextureSource = textureArray[textureArray.length - 1]._source;
                if (lastTextureSource === InternalTextureSource.Depth || lastTextureSource === InternalTextureSource.DepthStencil) {
                    generateDepthTexture = true;
                    textureCount--;
                }
                var samplingModes = [];
                var types = [];
                for (var i = 0; i < textureCount; ++i) {
                    var texture = textureArray[i];
                    samplingModes.push(texture.samplingMode);
                    types.push(texture.type);
                }
                var optionsMRT = {
                    samplingModes: samplingModes,
                    generateMipMaps: textureArray[0].generateMipMaps,
                    generateDepthBuffer: this._generateDepthBuffer,
                    generateStencilBuffer: this._generateStencilBuffer,
                    generateDepthTexture: generateDepthTexture,
                    types: types,
                    textureCount: textureCount,
                };
                var size = {
                    width: this.width,
                    height: this.height,
                };
                rtw = this._engine.createMultipleRenderTarget(size, optionsMRT);
            }
        }
        else {
            var options = {};
            options.generateDepthBuffer = this._generateDepthBuffer;
            options.generateMipMaps = (_b = (_a = this.texture) === null || _a === void 0 ? void 0 : _a.generateMipMaps) !== null && _b !== void 0 ? _b : false;
            options.generateStencilBuffer = this._generateStencilBuffer;
            options.samplingMode = (_c = this.texture) === null || _c === void 0 ? void 0 : _c.samplingMode;
            options.type = (_d = this.texture) === null || _d === void 0 ? void 0 : _d.type;
            options.format = (_e = this.texture) === null || _e === void 0 ? void 0 : _e.format;
            if (this.isCube) {
                rtw = this._engine.createRenderTargetCubeTexture(this.width, options);
            }
            else {
                var size = {
                    width: this.width,
                    height: this.height,
                    layers: this.is2DArray ? (_f = this.texture) === null || _f === void 0 ? void 0 : _f.depth : undefined,
                };
                rtw = this._engine.createRenderTargetTexture(size, options);
            }
            rtw.texture.isReady = true;
        }
        return rtw;
    };
    RenderTargetWrapper.prototype._swapRenderTargetWrapper = function (target) {
        if (this._textures && target._textures) {
            for (var i = 0; i < this._textures.length; ++i) {
                this._textures[i]._swapAndDie(target._textures[i], false);
                target._textures[i].isReady = true;
            }
        }
        if (this._depthStencilTexture && target._depthStencilTexture) {
            this._depthStencilTexture._swapAndDie(target._depthStencilTexture);
            target._depthStencilTexture.isReady = true;
        }
        this._textures = null;
        this._depthStencilTexture = null;
    };
    /** @hidden */
    RenderTargetWrapper.prototype._rebuild = function () {
        var rtw = this._cloneRenderTargetWrapper();
        if (!rtw) {
            return;
        }
        if (this._depthStencilTexture) {
            var samplingMode = this._depthStencilTexture.samplingMode;
            var bilinear = samplingMode === 2 ||
                samplingMode === 3 ||
                samplingMode === 11;
            rtw.createDepthStencilTexture(this._depthStencilTexture._comparisonFunction, bilinear, this._depthStencilTextureWithStencil, this._depthStencilTexture.samples);
        }
        if (this.samples > 1) {
            rtw.setSamples(this.samples);
        }
        rtw._swapRenderTargetWrapper(this);
        rtw.dispose();
    };
    /**
     * Releases the internal render textures
     */
    RenderTargetWrapper.prototype.releaseTextures = function () {
        var _a, _b;
        if (this._textures) {
            for (var i = 0; (_b = i < ((_a = this._textures) === null || _a === void 0 ? void 0 : _a.length)) !== null && _b !== void 0 ? _b : 0; ++i) {
                this._textures[i].dispose();
            }
        }
        this._textures = null;
    };
    /**
     * Disposes the whole render target wrapper
     * @param disposeOnlyFramebuffers true if only the frame buffers should be released (used for the WebGL engine). If false, all the textures will also be released
     */
    RenderTargetWrapper.prototype.dispose = function (disposeOnlyFramebuffers) {
        var _a;
        if (disposeOnlyFramebuffers === void 0) { disposeOnlyFramebuffers = false; }
        if (!disposeOnlyFramebuffers) {
            (_a = this._depthStencilTexture) === null || _a === void 0 ? void 0 : _a.dispose();
            this._depthStencilTexture = null;
            this.releaseTextures();
        }
        this._engine._releaseRenderTargetWrapper(this);
    };
    return RenderTargetWrapper;
}());
export { RenderTargetWrapper };
//# sourceMappingURL=renderTargetWrapper.js.map