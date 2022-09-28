import { HDRTools } from "../../../Misc/HighDynamicRange/hdr.js";
import { Engine } from "../../../Engines/engine.js";
import { EndsWith } from "../../../Misc/stringTools.js";

/**
 * Implementation of the HDR Texture Loader.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _HDRTextureLoader = /** @class */ (function () {
    function _HDRTextureLoader() {
        /**
         * Defines whether the loader supports cascade loading the different faces.
         */
        this.supportCascades = false;
    }
    /**
     * This returns if the loader support the current file information.
     * @param extension defines the file extension of the file being loaded
     * @returns true if the loader can load the specified file
     */
    _HDRTextureLoader.prototype.canLoad = function (extension) {
        return EndsWith(extension, ".hdr");
    };
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     */
    _HDRTextureLoader.prototype.loadCubeData = function () {
        throw ".env not supported in Cube.";
    };
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     */
    _HDRTextureLoader.prototype.loadData = function (data, texture, callback) {
        var uint8array = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        var hdrInfo = HDRTools.RGBE_ReadHeader(uint8array);
        var pixelsDataRGB32 = HDRTools.RGBE_ReadPixels(uint8array, hdrInfo);
        var pixels = hdrInfo.width * hdrInfo.height;
        var pixelsDataRGBA32 = new Float32Array(pixels * 4);
        for (var i = 0; i < pixels; i += 1) {
            pixelsDataRGBA32[i * 4] = pixelsDataRGB32[i * 3];
            pixelsDataRGBA32[i * 4 + 1] = pixelsDataRGB32[i * 3 + 1];
            pixelsDataRGBA32[i * 4 + 2] = pixelsDataRGB32[i * 3 + 2];
            pixelsDataRGBA32[i * 4 + 3] = 1;
        }
        callback(hdrInfo.width, hdrInfo.height, texture.generateMipMaps, false, function () {
            var engine = texture.getEngine();
            texture.type = 1;
            texture.format = 5;
            texture._gammaSpace = false;
            engine._uploadDataToTextureDirectly(texture, pixelsDataRGBA32);
        });
    };
    return _HDRTextureLoader;
}());
export { _HDRTextureLoader };
// Register the loader.
Engine._TextureLoaders.push(new _HDRTextureLoader());
//# sourceMappingURL=hdrTextureLoader.js.map