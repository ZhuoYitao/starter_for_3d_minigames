import { __assign } from "tslib";
import { InternalTexture, InternalTextureSource } from "../../../Materials/Textures/internalTexture.js";

import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype._createDepthStencilCubeTexture = function (size, options) {
    var internalTexture = new InternalTexture(this, InternalTextureSource.DepthStencil);
    internalTexture.isCube = true;
    var internalOptions = __assign({ bilinearFiltering: false, comparisonFunction: 0, generateStencil: false, samples: 1 }, options);
    // TODO WEBGPU allow to choose the format?
    internalTexture.format = internalOptions.generateStencil ? 13 : 14;
    this._setupDepthStencilTexture(internalTexture, size, internalOptions.generateStencil, internalOptions.bilinearFiltering, internalOptions.comparisonFunction, internalOptions.samples);
    this._textureHelper.createGPUTextureForInternalTexture(internalTexture);
    this._internalTexturesCache.push(internalTexture);
    return internalTexture;
};
WebGPUEngine.prototype.createCubeTexture = function (rootUrl, scene, files, noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, useSRGBBuffer) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (forcedExtension === void 0) { forcedExtension = null; }
    if (createPolynomials === void 0) { createPolynomials = false; }
    if (lodScale === void 0) { lodScale = 0; }
    if (lodOffset === void 0) { lodOffset = 0; }
    if (fallback === void 0) { fallback = null; }
    if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
    return this.createCubeTextureBase(rootUrl, scene, files, !!noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, null, function (texture, imgs) {
        var imageBitmaps = imgs; // we will always get an ImageBitmap array in WebGPU
        var width = imageBitmaps[0].width;
        var height = width;
        _this._setCubeMapTextureParams(texture, !noMipmap);
        texture.format = format !== null && format !== void 0 ? format : -1;
        var gpuTextureWrapper = _this._textureHelper.createGPUTextureForInternalTexture(texture, width, height);
        _this._textureHelper.updateCubeTextures(imageBitmaps, gpuTextureWrapper.underlyingResource, width, height, gpuTextureWrapper.format, false, false, 0, 0);
        if (!noMipmap) {
            _this._generateMipmaps(texture, _this._uploadEncoder);
        }
        texture.isReady = true;
        texture.onLoadedObservable.notifyObservers(texture);
        texture.onLoadedObservable.clear();
        if (onLoad) {
            onLoad();
        }
    }, !!useSRGBBuffer);
};
WebGPUEngine.prototype._setCubeMapTextureParams = function (texture, loadMipmap, maxLevel) {
    texture.samplingMode = loadMipmap ? 3 : 2;
    texture._cachedWrapU = 0;
    texture._cachedWrapV = 0;
    if (maxLevel) {
        texture._maxLodLevel = maxLevel;
    }
};
//# sourceMappingURL=engine.cubeTexture.js.map