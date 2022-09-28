import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype.updateDynamicTexture = function (texture, canvas, invertY, premulAlpha, format, forceBindTexture, allowGPUOptimization) {
    var _a;
    if (premulAlpha === void 0) { premulAlpha = false; }
    if (!texture) {
        return;
    }
    var width = canvas.width, height = canvas.height;
    var gpuTextureWrapper = texture._hardwareTexture;
    if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
        gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture, width, height);
    }
    this._textureHelper.updateTexture(canvas, texture, width, height, texture.depth, gpuTextureWrapper.format, 0, 0, invertY, premulAlpha, 0, 0, allowGPUOptimization);
    if (texture.generateMipMaps) {
        this._generateMipmaps(texture, this._uploadEncoder);
    }
    texture.isReady = true;
};
//# sourceMappingURL=engine.dynamicTexture.js.map