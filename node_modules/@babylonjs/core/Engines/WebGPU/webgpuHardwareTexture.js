import { InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { Scalar } from "../../Maths/math.scalar.js";
import * as WebGPUConstants from "./webgpuConstants.js";
/** @hidden */
var WebGPUHardwareTexture = /** @class */ (function () {
    function WebGPUHardwareTexture(existingTexture) {
        if (existingTexture === void 0) { existingTexture = null; }
        this.format = WebGPUConstants.TextureFormat.RGBA8Unorm;
        this.textureUsages = 0;
        this.textureAdditionalUsages = 0;
        this._webgpuTexture = existingTexture;
        this._webgpuMSAATexture = null;
        this.view = null;
        this.viewForWriting = null;
    }
    Object.defineProperty(WebGPUHardwareTexture.prototype, "underlyingResource", {
        get: function () {
            return this._webgpuTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUHardwareTexture.prototype, "msaaTexture", {
        get: function () {
            return this._webgpuMSAATexture;
        },
        set: function (texture) {
            this._webgpuMSAATexture = texture;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUHardwareTexture.prototype.set = function (hardwareTexture) {
        this._webgpuTexture = hardwareTexture;
    };
    WebGPUHardwareTexture.prototype.setUsage = function (textureSource, generateMipMaps, isCube, width, height) {
        generateMipMaps = textureSource === InternalTextureSource.RenderTarget ? false : generateMipMaps;
        this.createView({
            format: this.format,
            dimension: isCube ? WebGPUConstants.TextureViewDimension.Cube : WebGPUConstants.TextureViewDimension.E2d,
            mipLevelCount: generateMipMaps ? Scalar.ILog2(Math.max(width, height)) + 1 : 1,
            baseArrayLayer: 0,
            baseMipLevel: 0,
            arrayLayerCount: isCube ? 6 : 1,
            aspect: WebGPUConstants.TextureAspect.All,
        });
    };
    WebGPUHardwareTexture.prototype.createView = function (descriptor, createViewForWriting) {
        if (createViewForWriting === void 0) { createViewForWriting = false; }
        this.view = this._webgpuTexture.createView(descriptor);
        if (createViewForWriting && descriptor) {
            var saveNumMipMaps = descriptor.mipLevelCount;
            descriptor.mipLevelCount = 1;
            this.viewForWriting = this._webgpuTexture.createView(descriptor);
            descriptor.mipLevelCount = saveNumMipMaps;
        }
    };
    WebGPUHardwareTexture.prototype.reset = function () {
        this._webgpuTexture = null;
        this._webgpuMSAATexture = null;
        this.view = null;
        this.viewForWriting = null;
    };
    WebGPUHardwareTexture.prototype.release = function () {
        var _a, _b, _c;
        (_a = this._webgpuTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this._webgpuMSAATexture) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this._copyInvertYTempTexture) === null || _c === void 0 ? void 0 : _c.destroy();
        this.reset();
    };
    return WebGPUHardwareTexture;
}());
export { WebGPUHardwareTexture };
//# sourceMappingURL=webgpuHardwareTexture.js.map