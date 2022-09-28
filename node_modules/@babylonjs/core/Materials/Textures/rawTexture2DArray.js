import { __extends } from "tslib";
import { Texture } from "./texture.js";

import "../../Engines/Extensions/engine.rawTexture.js";
/**
 * Class used to store 2D array textures containing user data
 */
var RawTexture2DArray = /** @class */ (function (_super) {
    __extends(RawTexture2DArray, _super);
    /**
     * Create a new RawTexture2DArray
     * @param data defines the data of the texture
     * @param width defines the width of the texture
     * @param height defines the height of the texture
     * @param depth defines the number of layers of the texture
     * @param format defines the texture format to use
     * @param scene defines the hosting scene
     * @param generateMipMaps defines a boolean indicating if mip levels should be generated (true by default)
     * @param invertY defines if texture must be stored with Y axis inverted
     * @param samplingMode defines the sampling mode to use (Texture.TRILINEAR_SAMPLINGMODE by default)
     * @param textureType defines the texture Type (Engine.TEXTURETYPE_UNSIGNED_INT, Engine.TEXTURETYPE_FLOAT...)
     */
    function RawTexture2DArray(data, width, height, depth, 
    /** Gets or sets the texture format to use */
    format, scene, generateMipMaps, invertY, samplingMode, textureType) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (textureType === void 0) { textureType = 0; }
        var _this = _super.call(this, null, scene, !generateMipMaps, invertY) || this;
        _this.format = format;
        _this._texture = scene.getEngine().createRawTexture2DArray(data, width, height, depth, format, generateMipMaps, invertY, samplingMode, null, textureType);
        _this._depth = depth;
        _this.is2DArray = true;
        return _this;
    }
    Object.defineProperty(RawTexture2DArray.prototype, "depth", {
        /**
         * Gets the number of layers of the texture
         */
        get: function () {
            return this._depth;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update the texture with new data
     * @param data defines the data to store in the texture
     */
    RawTexture2DArray.prototype.update = function (data) {
        if (!this._texture) {
            return;
        }
        this._getEngine().updateRawTexture2DArray(this._texture, data, this._texture.format, this._texture.invertY, null, this._texture.type);
    };
    /**
     * Creates a RGBA texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param depth defines the number of layers of the texture
     * @param scene defines the scene the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    RawTexture2DArray.CreateRGBATexture = function (data, width, height, depth, scene, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = 3; }
        if (type === void 0) { type = 0; }
        return new RawTexture2DArray(data, width, height, depth, 5, scene, generateMipMaps, invertY, samplingMode, type);
    };
    return RawTexture2DArray;
}(Texture));
export { RawTexture2DArray };
//# sourceMappingURL=rawTexture2DArray.js.map