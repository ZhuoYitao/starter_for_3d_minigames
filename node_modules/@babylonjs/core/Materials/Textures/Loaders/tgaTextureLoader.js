import { GetTGAHeader, UploadContent } from "../../../Misc/tga.js";
import { Engine } from "../../../Engines/engine.js";
import { EndsWith } from "../../../Misc/stringTools.js";
/**
 * Implementation of the TGA Texture Loader.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _TGATextureLoader = /** @class */ (function () {
    function _TGATextureLoader() {
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
    _TGATextureLoader.prototype.canLoad = function (extension) {
        return EndsWith(extension, ".tga");
    };
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     */
    _TGATextureLoader.prototype.loadCubeData = function () {
        throw ".env not supported in Cube.";
    };
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     */
    _TGATextureLoader.prototype.loadData = function (data, texture, callback) {
        var bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        var header = GetTGAHeader(bytes);
        callback(header.width, header.height, texture.generateMipMaps, false, function () {
            UploadContent(texture, bytes);
        });
    };
    return _TGATextureLoader;
}());
export { _TGATextureLoader };
// Register the loader.
Engine._TextureLoaders.push(new _TGATextureLoader());
//# sourceMappingURL=tgaTextureLoader.js.map