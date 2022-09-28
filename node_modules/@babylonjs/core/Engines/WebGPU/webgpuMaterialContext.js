import { ExternalTexture } from "../../Materials/Textures/externalTexture.js";

import { WebGPUCacheSampler } from "./webgpuCacheSampler.js";
/** @hidden */
var WebGPUMaterialContext = /** @class */ (function () {
    function WebGPUMaterialContext() {
        this.uniqueId = WebGPUMaterialContext._Counter++;
        this.updateId = 0;
        this.reset();
    }
    Object.defineProperty(WebGPUMaterialContext.prototype, "forceBindGroupCreation", {
        get: function () {
            // If there is at least one external texture to bind, we must recreate the bind groups each time
            // because we need to retrieve a new texture each frame (by calling device.importExternalTexture)
            return this._numExternalTextures > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUMaterialContext.prototype, "hasFloatTextures", {
        get: function () {
            return this._numFloatTextures > 0;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUMaterialContext.prototype.reset = function () {
        this.samplers = {};
        this.textures = {};
        this.isDirty = true;
        this._numFloatTextures = 0;
        this._numExternalTextures = 0;
    };
    WebGPUMaterialContext.prototype.setSampler = function (name, sampler) {
        var samplerCache = this.samplers[name];
        var currentHashCode = -1;
        if (!samplerCache) {
            this.samplers[name] = samplerCache = { sampler: sampler, hashCode: 0 };
        }
        else {
            currentHashCode = samplerCache.hashCode;
        }
        samplerCache.sampler = sampler;
        samplerCache.hashCode = sampler ? WebGPUCacheSampler.GetSamplerHashCode(sampler) : 0;
        var isDirty = currentHashCode !== samplerCache.hashCode;
        if (isDirty) {
            this.updateId++;
        }
        this.isDirty || (this.isDirty = isDirty);
    };
    WebGPUMaterialContext.prototype.setTexture = function (name, texture) {
        var _a, _b, _c;
        var textureCache = this.textures[name];
        var currentTextureId = -1;
        if (!textureCache) {
            this.textures[name] = textureCache = { texture: texture, isFloatTexture: false, isExternalTexture: false };
        }
        else {
            currentTextureId = (_b = (_a = textureCache.texture) === null || _a === void 0 ? void 0 : _a.uniqueId) !== null && _b !== void 0 ? _b : -1;
        }
        if (textureCache.isExternalTexture) {
            this._numExternalTextures--;
        }
        if (textureCache.isFloatTexture) {
            this._numFloatTextures--;
        }
        if (texture) {
            textureCache.isFloatTexture = texture.type === 1;
            textureCache.isExternalTexture = ExternalTexture.IsExternalTexture(texture);
            if (textureCache.isFloatTexture) {
                this._numFloatTextures++;
            }
            if (textureCache.isExternalTexture) {
                this._numExternalTextures++;
            }
        }
        else {
            textureCache.isFloatTexture = false;
            textureCache.isExternalTexture = false;
        }
        textureCache.texture = texture;
        var isDirty = currentTextureId !== ((_c = texture === null || texture === void 0 ? void 0 : texture.uniqueId) !== null && _c !== void 0 ? _c : -1);
        if (isDirty) {
            this.updateId++;
        }
        this.isDirty || (this.isDirty = isDirty);
    };
    WebGPUMaterialContext._Counter = 0;
    return WebGPUMaterialContext;
}());
export { WebGPUMaterialContext };
//# sourceMappingURL=webgpuMaterialContext.js.map