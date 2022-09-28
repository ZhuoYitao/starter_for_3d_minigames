import { InternalTexture, InternalTextureSource } from "../../../Materials/Textures/internalTexture.js";

import { WebGPUEngine } from "../../webgpuEngine.js";
import { Logger } from "../../../Misc/logger.js";
WebGPUEngine.prototype.createRawTexture = function (data, width, height, format, generateMipMaps, invertY, samplingMode, compression, type, creationFlags) {
    if (compression === void 0) { compression = null; }
    if (type === void 0) { type = 0; }
    if (creationFlags === void 0) { creationFlags = 0; }
    var texture = new InternalTexture(this, InternalTextureSource.Raw);
    texture.baseWidth = width;
    texture.baseHeight = height;
    texture.width = width;
    texture.height = height;
    texture.format = format;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    texture.invertY = invertY;
    texture._compression = compression;
    texture.type = type;
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
    }
    this._textureHelper.createGPUTextureForInternalTexture(texture, width, height, undefined, creationFlags);
    this.updateRawTexture(texture, data, format, invertY, compression, type);
    this._internalTexturesCache.push(texture);
    return texture;
};
WebGPUEngine.prototype.updateRawTexture = function (texture, bufferView, format, invertY, compression, type) {
    if (compression === void 0) { compression = null; }
    if (type === void 0) { type = 0; }
    if (!texture) {
        return;
    }
    if (!this._doNotHandleContextLost) {
        texture._bufferView = bufferView;
        texture.invertY = invertY;
        texture._compression = compression;
    }
    if (bufferView) {
        var gpuTextureWrapper = texture._hardwareTexture;
        var needConversion = format === 4;
        if (needConversion) {
            bufferView = _convertRGBtoRGBATextureData(bufferView, texture.width, texture.height, type);
        }
        var data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
        this._textureHelper.updateTexture(data, texture, texture.width, texture.height, texture.depth, gpuTextureWrapper.format, 0, 0, invertY, false, 0, 0);
        if (texture.generateMipMaps) {
            this._generateMipmaps(texture, this._uploadEncoder);
        }
    }
    texture.isReady = true;
};
WebGPUEngine.prototype.createRawCubeTexture = function (data, size, format, type, generateMipMaps, invertY, samplingMode, compression) {
    if (compression === void 0) { compression = null; }
    var texture = new InternalTexture(this, InternalTextureSource.CubeRaw);
    if (type === 1 && !this._caps.textureFloatLinearFiltering) {
        generateMipMaps = false;
        samplingMode = 1;
        Logger.Warn("Float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.");
    }
    else if (type === 2 && !this._caps.textureHalfFloatLinearFiltering) {
        generateMipMaps = false;
        samplingMode = 1;
        Logger.Warn("Half float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.");
    }
    else if (type === 1 && !this._caps.textureFloatRender) {
        generateMipMaps = false;
        Logger.Warn("Render to float textures is not supported. Mipmap generation forced to false.");
    }
    else if (type === 2 && !this._caps.colorBufferFloat) {
        generateMipMaps = false;
        Logger.Warn("Render to half float textures is not supported. Mipmap generation forced to false.");
    }
    texture.isCube = true;
    texture.format = format === 4 ? 5 : format;
    texture.type = type;
    texture.generateMipMaps = generateMipMaps;
    texture.width = size;
    texture.height = size;
    texture.samplingMode = samplingMode;
    if (!this._doNotHandleContextLost) {
        texture._bufferViewArray = data;
    }
    texture._cachedWrapU = 0;
    texture._cachedWrapV = 0;
    this._textureHelper.createGPUTextureForInternalTexture(texture);
    if (data) {
        this.updateRawCubeTexture(texture, data, format, type, invertY, compression);
    }
    return texture;
};
WebGPUEngine.prototype.updateRawCubeTexture = function (texture, bufferView, format, type, invertY, compression) {
    if (compression === void 0) { compression = null; }
    texture._bufferViewArray = bufferView;
    texture.invertY = invertY;
    texture._compression = compression;
    var gpuTextureWrapper = texture._hardwareTexture;
    var needConversion = format === 4;
    var data = [];
    for (var i = 0; i < bufferView.length; ++i) {
        var faceData = bufferView[i];
        if (needConversion) {
            faceData = _convertRGBtoRGBATextureData(bufferView[i], texture.width, texture.height, type);
        }
        data.push(new Uint8Array(faceData.buffer, faceData.byteOffset, faceData.byteLength));
    }
    this._textureHelper.updateCubeTextures(data, gpuTextureWrapper.underlyingResource, texture.width, texture.height, gpuTextureWrapper.format, invertY, false, 0, 0);
    if (texture.generateMipMaps) {
        this._generateMipmaps(texture, this._uploadEncoder);
    }
    texture.isReady = true;
};
WebGPUEngine.prototype.createRawCubeTextureFromUrl = function (url, scene, size, format, type, noMipmap, callback, mipmapGenerator, onLoad, onError, samplingMode, invertY) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (samplingMode === void 0) { samplingMode = 3; }
    if (invertY === void 0) { invertY = false; }
    var texture = this.createRawCubeTexture(null, size, format, type, !noMipmap, invertY, samplingMode, null);
    scene === null || scene === void 0 ? void 0 : scene._addPendingData(texture);
    texture.url = url;
    this._internalTexturesCache.push(texture);
    var onerror = function (request, exception) {
        scene === null || scene === void 0 ? void 0 : scene._removePendingData(texture);
        if (onError && request) {
            onError(request.status + " " + request.statusText, exception);
        }
    };
    var internalCallback = function (data) {
        var width = texture.width;
        var faceDataArrays = callback(data);
        if (!faceDataArrays) {
            return;
        }
        var faces = [0, 2, 4, 1, 3, 5];
        if (mipmapGenerator) {
            var needConversion = format === 4;
            var mipData = mipmapGenerator(faceDataArrays);
            var gpuTextureWrapper = texture._hardwareTexture;
            var faces_1 = [0, 1, 2, 3, 4, 5];
            for (var level = 0; level < mipData.length; level++) {
                var mipSize = width >> level;
                var allFaces = [];
                for (var faceIndex = 0; faceIndex < 6; faceIndex++) {
                    var mipFaceData = mipData[level][faces_1[faceIndex]];
                    if (needConversion) {
                        mipFaceData = _convertRGBtoRGBATextureData(mipFaceData, mipSize, mipSize, type);
                    }
                    allFaces.push(new Uint8Array(mipFaceData.buffer, mipFaceData.byteOffset, mipFaceData.byteLength));
                }
                _this._textureHelper.updateCubeTextures(allFaces, gpuTextureWrapper.underlyingResource, mipSize, mipSize, gpuTextureWrapper.format, invertY, false, 0, 0);
            }
        }
        else {
            var allFaces = [];
            for (var faceIndex = 0; faceIndex < 6; faceIndex++) {
                allFaces.push(faceDataArrays[faces[faceIndex]]);
            }
            _this.updateRawCubeTexture(texture, allFaces, format, type, invertY);
        }
        texture.isReady = true;
        scene === null || scene === void 0 ? void 0 : scene._removePendingData(texture);
        if (onLoad) {
            onLoad();
        }
    };
    this._loadFile(url, function (data) {
        internalCallback(data);
    }, undefined, scene === null || scene === void 0 ? void 0 : scene.offlineProvider, true, onerror);
    return texture;
};
WebGPUEngine.prototype.createRawTexture3D = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType, creationFlags) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = 0; }
    if (creationFlags === void 0) { creationFlags = 0; }
    var source = InternalTextureSource.Raw3D;
    var texture = new InternalTexture(this, source);
    texture.baseWidth = width;
    texture.baseHeight = height;
    texture.baseDepth = depth;
    texture.width = width;
    texture.height = height;
    texture.depth = depth;
    texture.format = format;
    texture.type = textureType;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    texture.is3D = true;
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
    }
    this._textureHelper.createGPUTextureForInternalTexture(texture, width, height, undefined, creationFlags);
    this.updateRawTexture3D(texture, data, format, invertY, compression, textureType);
    this._internalTexturesCache.push(texture);
    return texture;
};
WebGPUEngine.prototype.updateRawTexture3D = function (texture, bufferView, format, invertY, compression, textureType) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = 0; }
    if (!this._doNotHandleContextLost) {
        texture._bufferView = bufferView;
        texture.format = format;
        texture.invertY = invertY;
        texture._compression = compression;
    }
    if (bufferView) {
        var gpuTextureWrapper = texture._hardwareTexture;
        var needConversion = format === 4;
        if (needConversion) {
            bufferView = _convertRGBtoRGBATextureData(bufferView, texture.width, texture.height, textureType);
        }
        var data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
        this._textureHelper.updateTexture(data, texture, texture.width, texture.height, texture.depth, gpuTextureWrapper.format, 0, 0, invertY, false, 0, 0);
        if (texture.generateMipMaps) {
            this._generateMipmaps(texture, this._uploadEncoder);
        }
    }
    texture.isReady = true;
};
WebGPUEngine.prototype.createRawTexture2DArray = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType, creationFlags) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = 0; }
    if (creationFlags === void 0) { creationFlags = 0; }
    var source = InternalTextureSource.Raw2DArray;
    var texture = new InternalTexture(this, source);
    texture.baseWidth = width;
    texture.baseHeight = height;
    texture.baseDepth = depth;
    texture.width = width;
    texture.height = height;
    texture.depth = depth;
    texture.format = format;
    texture.type = textureType;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    texture.is2DArray = true;
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
    }
    this._textureHelper.createGPUTextureForInternalTexture(texture, width, height, depth, creationFlags);
    this.updateRawTexture2DArray(texture, data, format, invertY, compression, textureType);
    this._internalTexturesCache.push(texture);
    return texture;
};
WebGPUEngine.prototype.updateRawTexture2DArray = function (texture, bufferView, format, invertY, compression, textureType) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = 0; }
    if (!this._doNotHandleContextLost) {
        texture._bufferView = bufferView;
        texture.format = format;
        texture.invertY = invertY;
        texture._compression = compression;
    }
    if (bufferView) {
        var gpuTextureWrapper = texture._hardwareTexture;
        var needConversion = format === 4;
        if (needConversion) {
            bufferView = _convertRGBtoRGBATextureData(bufferView, texture.width, texture.height, textureType);
        }
        var data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
        this._textureHelper.updateTexture(data, texture, texture.width, texture.height, texture.depth, gpuTextureWrapper.format, 0, 0, invertY, false, 0, 0);
        if (texture.generateMipMaps) {
            this._generateMipmaps(texture, this._uploadEncoder);
        }
    }
    texture.isReady = true;
};
/**
 * @param rgbData
 * @param width
 * @param height
 * @param textureType
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function _convertRGBtoRGBATextureData(rgbData, width, height, textureType) {
    // Create new RGBA data container.
    var rgbaData;
    var val1 = 1;
    if (textureType === 1) {
        rgbaData = new Float32Array(width * height * 4);
    }
    else if (textureType === 2) {
        rgbaData = new Uint16Array(width * height * 4);
        val1 = 15360; // 15360 is the encoding of 1 in half float
    }
    else if (textureType === 7) {
        rgbaData = new Uint32Array(width * height * 4);
    }
    else {
        rgbaData = new Uint8Array(width * height * 4);
    }
    // Convert each pixel.
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var index = (y * width + x) * 3;
            var newIndex = (y * width + x) * 4;
            // Map Old Value to new value.
            rgbaData[newIndex + 0] = rgbData[index + 0];
            rgbaData[newIndex + 1] = rgbData[index + 1];
            rgbaData[newIndex + 2] = rgbData[index + 2];
            // Add fully opaque alpha channel.
            rgbaData[newIndex + 3] = val1;
        }
    }
    return rgbaData;
}
//# sourceMappingURL=engine.rawTexture.js.map