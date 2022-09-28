import { Tools } from "../../Misc/tools.js";
/**
 * Meshopt compression (https://github.com/zeux/meshoptimizer)
 *
 * This class wraps the meshopt library from https://github.com/zeux/meshoptimizer/tree/master/js.
 *
 * **Encoder**
 *
 * The encoder is not currently implemented.
 *
 * **Decoder**
 *
 * By default, the configuration points to a copy of the meshopt files on the Babylon.js preview CDN (e.g. https://preview.babylonjs.com/meshopt_decoder.js).
 *
 * To update the configuration, use the following code:
 * ```javascript
 *     MeshoptCompression.Configuration = {
 *         decoder: {
 *             url: "<url to the meshopt decoder library>"
 *         }
 *     };
 * ```
 */
var MeshoptCompression = /** @class */ (function () {
    /**
     * Constructor
     */
    function MeshoptCompression() {
        var decoder = MeshoptCompression.Configuration.decoder;
        this._decoderModulePromise = Tools.LoadScriptAsync(Tools.GetAbsoluteUrl(decoder.url)).then(function () {
            // Wait for WebAssembly compilation before resolving promise
            return MeshoptDecoder.ready;
        });
    }
    Object.defineProperty(MeshoptCompression, "Default", {
        /**
         * Default instance for the meshoptimizer object.
         */
        get: function () {
            if (!MeshoptCompression._Default) {
                MeshoptCompression._Default = new MeshoptCompression();
            }
            return MeshoptCompression._Default;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stop all async operations and release resources.
     */
    MeshoptCompression.prototype.dispose = function () {
        delete this._decoderModulePromise;
    };
    /**
     * Decode meshopt data.
     * @see https://github.com/zeux/meshoptimizer/tree/master/js#decoder
     * @param source The input data.
     * @param count The number of elements.
     * @param stride The stride in bytes.
     * @param mode The compression mode.
     * @param filter The compression filter.
     * @returns a Promise<Uint8Array> that resolves to the decoded data
     */
    MeshoptCompression.prototype.decodeGltfBufferAsync = function (source, count, stride, mode, filter) {
        return this._decoderModulePromise.then(function () {
            var result = new Uint8Array(count * stride);
            MeshoptDecoder.decodeGltfBuffer(result, count, stride, source, mode, filter);
            return result;
        });
    };
    /**
     * The configuration. Defaults to the following:
     * ```javascript
     * decoder: {
     *   url: "https://preview.babylonjs.com/meshopt_decoder.js"
     * }
     * ```
     */
    MeshoptCompression.Configuration = {
        decoder: {
            url: "https://preview.babylonjs.com/meshopt_decoder.js",
        },
    };
    MeshoptCompression._Default = null;
    return MeshoptCompression;
}());
export { MeshoptCompression };
//# sourceMappingURL=meshoptCompression.js.map