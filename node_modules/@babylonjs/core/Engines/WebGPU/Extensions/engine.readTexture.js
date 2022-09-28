import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype._readTexturePixels = function (texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion, x, y) {
    if (faceIndex === void 0) { faceIndex = -1; }
    if (level === void 0) { level = 0; }
    if (buffer === void 0) { buffer = null; }
    if (flushRenderer === void 0) { flushRenderer = true; }
    if (noDataConversion === void 0) { noDataConversion = false; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    var gpuTextureWrapper = texture._hardwareTexture;
    if (flushRenderer) {
        this.flushFramebuffer();
    }
    return this._textureHelper.readPixels(gpuTextureWrapper.underlyingResource, x, y, width, height, gpuTextureWrapper.format, faceIndex, level, buffer, noDataConversion);
};
WebGPUEngine.prototype._readTexturePixelsSync = function () {
    throw "_readTexturePixelsSync is unsupported in WebGPU!";
};
//# sourceMappingURL=engine.readTexture.js.map