import { __extends } from "tslib";
import { Texture } from "./texture.js";

import "../../Engines/Extensions/engine.rawTexture.js";
/**
 * Raw texture can help creating a texture directly from an array of data.
 * This can be super useful if you either get the data from an uncompressed source or
 * if you wish to create your texture pixel by pixel.
 */
var RawTexture = /** @class */ (function (_super) {
    __extends(RawTexture, _super);
    /**
     * Instantiates a new RawTexture.
     * Raw texture can help creating a texture directly from an array of data.
     * This can be super useful if you either get the data from an uncompressed source or
     * if you wish to create your texture pixel by pixel.
     * @param data define the array of data to use to create the texture (null to create an empty texture)
     * @param width define the width of the texture
     * @param height define the height of the texture
     * @param format define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps define whether mip maps should be generated or not
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     */
    function RawTexture(data, width, height, 
    /**
     * Define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     */
    format, sceneOrEngine, generateMipMaps, invertY, samplingMode, type, creationFlags) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        if (type === void 0) { type = 0; }
        var _this = _super.call(this, null, sceneOrEngine, !generateMipMaps, invertY, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, creationFlags) || this;
        _this.format = format;
        if (!_this._engine) {
            return _this;
        }
        if (!_this._engine._caps.textureFloatLinearFiltering && type === 1) {
            samplingMode = 1;
        }
        if (!_this._engine._caps.textureHalfFloatLinearFiltering && type === 2) {
            samplingMode = 1;
        }
        _this._texture = _this._engine.createRawTexture(data, width, height, format, generateMipMaps, invertY, samplingMode, null, type, creationFlags !== null && creationFlags !== void 0 ? creationFlags : 0);
        _this.wrapU = Texture.CLAMP_ADDRESSMODE;
        _this.wrapV = Texture.CLAMP_ADDRESSMODE;
        return _this;
    }
    /**
     * Updates the texture underlying data.
     * @param data Define the new data of the texture
     */
    RawTexture.prototype.update = function (data) {
        this._getEngine().updateRawTexture(this._texture, data, this._texture.format, this._texture.invertY, null, this._texture.type);
    };
    /**
     * Creates a luminance texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance texture
     */
    RawTexture.CreateLuminanceTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        return new RawTexture(data, width, height, 1, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates a luminance alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance alpha texture
     */
    RawTexture.CreateLuminanceAlphaTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        return new RawTexture(data, width, height, 2, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates an alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the alpha texture
     */
    RawTexture.CreateAlphaTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        return new RawTexture(data, width, height, 0, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates a RGB texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGB alpha texture
     */
    RawTexture.CreateRGBTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        if (type === void 0) { type = 0; }
        return new RawTexture(data, width, height, 4, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    };
    /**
     * Creates a RGBA texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    RawTexture.CreateRGBATexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        if (type === void 0) { type = 0; }
        return new RawTexture(data, width, height, 5, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    };
    /**
     * Creates a RGBA storage texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    RawTexture.CreateRGBAStorageTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        if (type === void 0) { type = 0; }
        return new RawTexture(data, width, height, 5, sceneOrEngine, generateMipMaps, invertY, samplingMode, type, 1);
    };
    /**
     * Creates a R texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the R texture
     */
    RawTexture.CreateRTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = 1; }
        return new RawTexture(data, width, height, 6, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    };
    /**
     * Creates a R storage texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the R texture
     */
    RawTexture.CreateRStorageTexture = function (data, width, height, sceneOrEngine, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = 1; }
        return new RawTexture(data, width, height, 6, sceneOrEngine, generateMipMaps, invertY, samplingMode, type, 1);
    };
    return RawTexture;
}(Texture));
export { RawTexture };
//# sourceMappingURL=rawTexture.js.map