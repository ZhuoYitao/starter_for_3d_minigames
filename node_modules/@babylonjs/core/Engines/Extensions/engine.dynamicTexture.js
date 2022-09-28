import { ThinEngine } from "../../Engines/thinEngine.js";
import { InternalTexture, InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
ThinEngine.prototype.createDynamicTexture = function (width, height, generateMipMaps, samplingMode) {
    var texture = new InternalTexture(this, InternalTextureSource.Dynamic);
    texture.baseWidth = width;
    texture.baseHeight = height;
    if (generateMipMaps) {
        width = this.needPOTTextures ? ThinEngine.GetExponentOfTwo(width, this._caps.maxTextureSize) : width;
        height = this.needPOTTextures ? ThinEngine.GetExponentOfTwo(height, this._caps.maxTextureSize) : height;
    }
    //  this.resetTextureCache();
    texture.width = width;
    texture.height = height;
    texture.isReady = false;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    this.updateTextureSamplingMode(samplingMode, texture);
    this._internalTexturesCache.push(texture);
    return texture;
};
ThinEngine.prototype.updateDynamicTexture = function (texture, source, invertY, premulAlpha, format, forceBindTexture, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
allowGPUOptimization) {
    if (premulAlpha === void 0) { premulAlpha = false; }
    if (forceBindTexture === void 0) { forceBindTexture = false; }
    if (allowGPUOptimization === void 0) { allowGPUOptimization = false; }
    if (!texture) {
        return;
    }
    var gl = this._gl;
    var target = gl.TEXTURE_2D;
    var wasPreviouslyBound = this._bindTextureDirectly(target, texture, true, forceBindTexture);
    this._unpackFlipY(invertY === undefined ? texture.invertY : invertY);
    if (premulAlpha) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    }
    var textureType = this._getWebGLTextureType(texture.type);
    var glformat = this._getInternalFormat(format ? format : texture.format);
    var internalFormat = this._getRGBABufferInternalSizedFormat(texture.type, glformat);
    gl.texImage2D(target, 0, internalFormat, glformat, textureType, source);
    if (texture.generateMipMaps) {
        gl.generateMipmap(target);
    }
    if (!wasPreviouslyBound) {
        this._bindTextureDirectly(target, null);
    }
    if (premulAlpha) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    }
    texture.isReady = true;
};
//# sourceMappingURL=engine.dynamicTexture.js.map