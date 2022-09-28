import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype.updateVideoTexture = function (texture, video, invertY) {
    var _this = this;
    var _a;
    if (!texture || texture._isDisabled) {
        return;
    }
    if (this._videoTextureSupported === undefined) {
        this._videoTextureSupported = true;
    }
    var gpuTextureWrapper = texture._hardwareTexture;
    if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
        gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture);
    }
    this.createImageBitmap(video)
        .then(function (bitmap) {
        _this._textureHelper.updateTexture(bitmap, texture, texture.width, texture.height, texture.depth, gpuTextureWrapper.format, 0, 0, !invertY, false, 0, 0);
        if (texture.generateMipMaps) {
            _this._generateMipmaps(texture, _this._uploadEncoder);
        }
        texture.isReady = true;
    })
        .catch(function () {
        // Sometimes createImageBitmap(video) fails with "Failed to execute 'createImageBitmap' on 'Window': The provided element's player has no current data."
        // Just keep going on
        texture.isReady = true;
    });
};
//# sourceMappingURL=engine.videoTexture.js.map