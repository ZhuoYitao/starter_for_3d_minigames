
import { InternalTexture } from "./internalTexture.js";
/**
 * Class used to store an external texture (like GPUExternalTexture in WebGPU)
 */
var ExternalTexture = /** @class */ (function () {
    /**
     * Constructs the texture
     * @param video The video the texture should be wrapped around
     */
    function ExternalTexture(video) {
        /**
         * Gets a boolean indicating if the texture uses mipmaps
         */
        this.useMipMaps = false;
        /**
         * The type of the underlying texture is implementation dependent, so return "UNDEFINED" for the type
         */
        this.type = 16;
        this._video = video;
        this.uniqueId = InternalTexture._Counter++;
    }
    /**
     * Checks if a texture is an external or internal texture
     * @param texture the external or internal texture
     * @returns true if the texture is an external texture, else false
     */
    ExternalTexture.IsExternalTexture = function (texture) {
        return texture.underlyingResource !== undefined;
    };
    /**
     * Get the class name of the texture.
     * @returns "ExternalTexture"
     */
    ExternalTexture.prototype.getClassName = function () {
        return "ExternalTexture";
    };
    Object.defineProperty(ExternalTexture.prototype, "underlyingResource", {
        /**
         * Gets the underlying texture object
         */
        get: function () {
            return this._video;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get if the texture is ready to be used (downloaded, converted, mip mapped...).
     * @returns true if fully ready
     */
    ExternalTexture.prototype.isReady = function () {
        return this._video.readyState >= this._video.HAVE_CURRENT_DATA;
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    ExternalTexture.prototype.dispose = function () { };
    return ExternalTexture;
}());
export { ExternalTexture };
//# sourceMappingURL=externalTexture.js.map