import { KhronosTextureContainer } from "../../../Misc/khronosTextureContainer.js";
import { KhronosTextureContainer2 } from "../../../Misc/khronosTextureContainer2.js";
import { Engine } from "../../../Engines/engine.js";
import { EndsWith } from "../../../Misc/stringTools.js";
import { Logger } from "../../../Misc/logger.js";

function mapSRGBToLinear(format) {
    switch (format) {
        case 35916:
            return 33776;
        case 35918:
            return 33778;
        case 35919:
            return 33779;
        case 37493:
            return 37492;
        case 37497:
            return 37496;
        case 37495:
            return 37494;
        case 37840:
            return 37808;
        case 36493:
            return 36492;
    }
    return null;
}
/**
 * Implementation of the KTX Texture Loader.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _KTXTextureLoader = /** @class */ (function () {
    function _KTXTextureLoader() {
        /**
         * Defines whether the loader supports cascade loading the different faces.
         */
        this.supportCascades = false;
    }
    /**
     * This returns if the loader support the current file information.
     * @param extension defines the file extension of the file being loaded
     * @param mimeType defines the optional mime type of the file being loaded
     * @returns true if the loader can load the specified file
     */
    _KTXTextureLoader.prototype.canLoad = function (extension, mimeType) {
        // The ".ktx2" file extension is still up for debate: https://github.com/KhronosGroup/KTX-Specification/issues/18
        return EndsWith(extension, ".ktx") || EndsWith(extension, ".ktx2") || mimeType === "image/ktx" || mimeType === "image/ktx2";
    };
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param createPolynomials will be true if polynomials have been requested
     * @param onLoad defines the callback to trigger once the texture is ready
     */
    _KTXTextureLoader.prototype.loadCubeData = function (data, texture, createPolynomials, onLoad) {
        if (Array.isArray(data)) {
            return;
        }
        // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
        texture._invertVScale = !texture.invertY;
        var engine = texture.getEngine();
        var ktx = new KhronosTextureContainer(data, 6);
        var loadMipmap = ktx.numberOfMipmapLevels > 1 && texture.generateMipMaps;
        engine._unpackFlipY(true);
        ktx.uploadLevels(texture, texture.generateMipMaps);
        texture.width = ktx.pixelWidth;
        texture.height = ktx.pixelHeight;
        engine._setCubeMapTextureParams(texture, loadMipmap, ktx.numberOfMipmapLevels - 1);
        texture.isReady = true;
        texture.onLoadedObservable.notifyObservers(texture);
        texture.onLoadedObservable.clear();
        if (onLoad) {
            onLoad();
        }
    };
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     * @param options
     */
    _KTXTextureLoader.prototype.loadData = function (data, texture, callback, options) {
        if (KhronosTextureContainer.IsValid(data)) {
            // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
            texture._invertVScale = !texture.invertY;
            var ktx_1 = new KhronosTextureContainer(data, 1);
            var mappedFormat = mapSRGBToLinear(ktx_1.glInternalFormat);
            if (mappedFormat) {
                texture.format = mappedFormat;
                texture._useSRGBBuffer = texture.getEngine()._getUseSRGBBuffer(true, texture.generateMipMaps);
                texture._gammaSpace = true;
            }
            else {
                texture.format = ktx_1.glInternalFormat;
            }
            callback(ktx_1.pixelWidth, ktx_1.pixelHeight, texture.generateMipMaps, true, function () {
                ktx_1.uploadLevels(texture, texture.generateMipMaps);
            }, ktx_1.isInvalid);
        }
        else if (KhronosTextureContainer2.IsValid(data)) {
            var ktx2 = new KhronosTextureContainer2(texture.getEngine());
            ktx2.uploadAsync(data, texture, options).then(function () {
                callback(texture.width, texture.height, texture.generateMipMaps, true, function () { }, false);
            }, function (error) {
                Logger.Warn("Failed to load KTX2 texture data: ".concat(error.message));
                callback(0, 0, false, false, function () { }, true);
            });
        }
        else {
            Logger.Error("texture missing KTX identifier");
            callback(0, 0, false, false, function () { }, true);
        }
    };
    return _KTXTextureLoader;
}());
export { _KTXTextureLoader };
// Register the loader.
Engine._TextureLoaders.unshift(new _KTXTextureLoader());
//# sourceMappingURL=ktxTextureLoader.js.map