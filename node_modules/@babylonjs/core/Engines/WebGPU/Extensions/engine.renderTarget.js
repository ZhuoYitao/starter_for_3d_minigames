import { __assign } from "tslib";
import { InternalTexture, InternalTextureSource } from "../../../Materials/Textures/internalTexture.js";

import { WebGPUEngine } from "../../webgpuEngine.js";
import { WebGPURenderTargetWrapper } from "../webgpuRenderTargetWrapper.js";
WebGPUEngine.prototype._createHardwareRenderTargetWrapper = function (isMulti, isCube, size) {
    var rtWrapper = new WebGPURenderTargetWrapper(isMulti, isCube, size, this);
    this._renderTargetWrapperCache.push(rtWrapper);
    return rtWrapper;
};
WebGPUEngine.prototype.createRenderTargetTexture = function (size, options) {
    var _a;
    var rtWrapper = this._createHardwareRenderTargetWrapper(false, false, size);
    var fullOptions = {};
    if (options !== undefined && typeof options === "object") {
        fullOptions.generateMipMaps = options.generateMipMaps;
        fullOptions.generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
        fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && options.generateStencilBuffer;
        fullOptions.samplingMode = options.samplingMode === undefined ? 3 : options.samplingMode;
        fullOptions.creationFlags = (_a = options.creationFlags) !== null && _a !== void 0 ? _a : 0;
        fullOptions.noColorTarget = !!options.noColorTarget;
    }
    else {
        fullOptions.generateMipMaps = options;
        fullOptions.generateDepthBuffer = true;
        fullOptions.generateStencilBuffer = false;
        fullOptions.samplingMode = 3;
        fullOptions.creationFlags = 0;
        fullOptions.noColorTarget = false;
    }
    var texture = fullOptions.noColorTarget ? null : this._createInternalTexture(size, options, true, InternalTextureSource.RenderTarget);
    rtWrapper._generateDepthBuffer = fullOptions.generateDepthBuffer;
    rtWrapper._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;
    rtWrapper.setTextures(texture);
    if (rtWrapper._generateDepthBuffer || rtWrapper._generateStencilBuffer) {
        rtWrapper.createDepthStencilTexture(0, fullOptions.samplingMode === undefined ||
            fullOptions.samplingMode === 2 ||
            fullOptions.samplingMode === 2 ||
            fullOptions.samplingMode === 3 ||
            fullOptions.samplingMode === 3 ||
            fullOptions.samplingMode === 5 ||
            fullOptions.samplingMode === 6 ||
            fullOptions.samplingMode === 7 ||
            fullOptions.samplingMode === 11, rtWrapper._generateStencilBuffer, rtWrapper.samples);
    }
    if (texture) {
        if (options !== undefined && typeof options === "object" && options.createMipMaps && !fullOptions.generateMipMaps) {
            texture.generateMipMaps = true;
        }
        this._textureHelper.createGPUTextureForInternalTexture(texture, undefined, undefined, undefined, fullOptions.creationFlags);
        if (options !== undefined && typeof options === "object" && options.createMipMaps && !fullOptions.generateMipMaps) {
            texture.generateMipMaps = false;
        }
    }
    return rtWrapper;
};
WebGPUEngine.prototype._createDepthStencilTexture = function (size, options) {
    var internalTexture = new InternalTexture(this, InternalTextureSource.DepthStencil);
    var internalOptions = __assign({ bilinearFiltering: false, comparisonFunction: 0, generateStencil: false, samples: 1, depthTextureFormat: options.generateStencil ? 13 : 14 }, options);
    internalTexture.format = internalOptions.depthTextureFormat;
    this._setupDepthStencilTexture(internalTexture, size, internalOptions.generateStencil, internalOptions.bilinearFiltering, internalOptions.comparisonFunction, internalOptions.samples);
    this._textureHelper.createGPUTextureForInternalTexture(internalTexture);
    this._internalTexturesCache.push(internalTexture);
    return internalTexture;
};
WebGPUEngine.prototype._setupDepthStencilTexture = function (internalTexture, size, generateStencil, bilinearFiltering, comparisonFunction, samples) {
    if (samples === void 0) { samples = 1; }
    var width = size.width || size;
    var height = size.height || size;
    var layers = size.layers || 0;
    internalTexture.baseWidth = width;
    internalTexture.baseHeight = height;
    internalTexture.width = width;
    internalTexture.height = height;
    internalTexture.is2DArray = layers > 0;
    internalTexture.depth = layers;
    internalTexture.isReady = true;
    internalTexture.samples = samples;
    internalTexture.generateMipMaps = false;
    internalTexture.samplingMode = bilinearFiltering ? 2 : 1;
    internalTexture.type = 1;
    internalTexture._comparisonFunction = comparisonFunction;
    internalTexture._cachedWrapU = 0;
    internalTexture._cachedWrapV = 0;
};
WebGPUEngine.prototype.updateRenderTargetTextureSampleCount = function (rtWrapper, samples) {
    if (!rtWrapper || !rtWrapper.texture || rtWrapper.samples === samples) {
        return samples;
    }
    samples = Math.min(samples, this.getCaps().maxMSAASamples);
    this._textureHelper.createMSAATexture(rtWrapper.texture, samples);
    if (rtWrapper._depthStencilTexture) {
        this._textureHelper.createMSAATexture(rtWrapper._depthStencilTexture, samples);
        rtWrapper._depthStencilTexture.samples = samples;
    }
    rtWrapper.texture.samples = samples;
    return samples;
};
//# sourceMappingURL=engine.renderTarget.js.map