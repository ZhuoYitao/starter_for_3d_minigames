import { Engine } from "../../../Engines/engine.js";
import { LoadTextureFromTranscodeResult, TranscodeAsync } from "../../../Misc/basis.js";
import { Tools } from "../../../Misc/tools.js";
import { EndsWith } from "../../../Misc/stringTools.js";
/**
 * Loader for .basis file format
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _BasisTextureLoader = /** @class */ (function () {
    function _BasisTextureLoader() {
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
    _BasisTextureLoader.prototype.canLoad = function (extension) {
        return EndsWith(extension, ".basis");
    };
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param createPolynomials will be true if polynomials have been requested
     * @param onLoad defines the callback to trigger once the texture is ready
     * @param onError defines the callback to trigger in case of error
     */
    _BasisTextureLoader.prototype.loadCubeData = function (data, texture, createPolynomials, onLoad, onError) {
        if (Array.isArray(data)) {
            return;
        }
        var caps = texture.getEngine().getCaps();
        var transcodeConfig = {
            supportedCompressionFormats: {
                etc1: caps.etc1 ? true : false,
                s3tc: caps.s3tc ? true : false,
                pvrtc: caps.pvrtc ? true : false,
                etc2: caps.etc2 ? true : false,
            },
        };
        TranscodeAsync(data, transcodeConfig)
            .then(function (result) {
            var hasMipmap = result.fileInfo.images[0].levels.length > 1 && texture.generateMipMaps;
            LoadTextureFromTranscodeResult(texture, result);
            texture.getEngine()._setCubeMapTextureParams(texture, hasMipmap);
            texture.isReady = true;
            texture.onLoadedObservable.notifyObservers(texture);
            texture.onLoadedObservable.clear();
            if (onLoad) {
                onLoad();
            }
        })
            .catch(function (err) {
            var errorMessage = "Failed to transcode Basis file, transcoding may not be supported on this device";
            Tools.Warn(errorMessage);
            texture.isReady = true;
            if (onError) {
                onError(err);
            }
        });
    };
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     */
    _BasisTextureLoader.prototype.loadData = function (data, texture, callback) {
        var caps = texture.getEngine().getCaps();
        var transcodeConfig = {
            supportedCompressionFormats: {
                etc1: caps.etc1 ? true : false,
                s3tc: caps.s3tc ? true : false,
                pvrtc: caps.pvrtc ? true : false,
                etc2: caps.etc2 ? true : false,
            },
        };
        TranscodeAsync(data, transcodeConfig)
            .then(function (result) {
            var rootImage = result.fileInfo.images[0].levels[0];
            var hasMipmap = result.fileInfo.images[0].levels.length > 1 && texture.generateMipMaps;
            callback(rootImage.width, rootImage.height, hasMipmap, result.format !== -1, function () {
                LoadTextureFromTranscodeResult(texture, result);
            });
        })
            .catch(function () {
            Tools.Warn("Failed to transcode Basis file, transcoding may not be supported on this device");
            callback(0, 0, false, false, function () { }, true);
        });
    };
    return _BasisTextureLoader;
}());
export { _BasisTextureLoader };
// Register the loader.
Engine._TextureLoaders.push(new _BasisTextureLoader());
//# sourceMappingURL=basisTextureLoader.js.map