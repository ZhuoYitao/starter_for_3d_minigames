import { __assign, __extends } from "tslib";
import { BaseTexture } from "../../Materials/Textures/baseTexture.js";

import { Matrix } from "../../Maths/math.vector.js";
import { Observable } from "../../Misc/observable.js";
import "../../Engines/Extensions/engine.dynamicTexture.js";
import "../../Engines/Extensions/engine.videoTexture.js";
/**
 * This represents the smallest workload to use an already existing element (Canvas or Video) as a texture.
 * To be as efficient as possible depending on your constraints nothing aside the first upload
 * is automatically managed.
 * It is a cheap VideoTexture or DynamicTexture if you prefer to keep full control of the elements
 * in your application.
 *
 * As the update is not automatic, you need to call them manually.
 */
var HtmlElementTexture = /** @class */ (function (_super) {
    __extends(HtmlElementTexture, _super);
    /**
     * Instantiates a HtmlElementTexture from the following parameters.
     *
     * @param name Defines the name of the texture
     * @param element Defines the video or canvas the texture is filled with
     * @param options Defines the other none mandatory texture creation options
     */
    function HtmlElementTexture(name, element, options) {
        var _this = _super.call(this, options.scene || options.engine) || this;
        /**
         * Observable triggered once the texture has been loaded.
         */
        _this.onLoadObservable = new Observable();
        if (!element || (!options.engine && !options.scene)) {
            return _this;
        }
        options = __assign(__assign({}, HtmlElementTexture._DefaultOptions), options);
        _this._generateMipMaps = options.generateMipMaps;
        _this._samplingMode = options.samplingMode;
        _this._textureMatrix = Matrix.Identity();
        _this.name = name;
        _this.element = element;
        _this._isVideo = element instanceof HTMLVideoElement;
        _this.anisotropicFilteringLevel = 1;
        _this._createInternalTexture();
        return _this;
    }
    HtmlElementTexture.prototype._createInternalTexture = function () {
        var width = 0;
        var height = 0;
        if (this._isVideo) {
            width = this.element.videoWidth;
            height = this.element.videoHeight;
        }
        else {
            width = this.element.width;
            height = this.element.height;
        }
        var engine = this._getEngine();
        if (engine) {
            this._texture = engine.createDynamicTexture(width, height, this._generateMipMaps, this._samplingMode);
        }
        this.update();
    };
    /**
     * Returns the texture matrix used in most of the material.
     */
    HtmlElementTexture.prototype.getTextureMatrix = function () {
        return this._textureMatrix;
    };
    /**
     * Updates the content of the texture.
     * @param invertY Defines whether the texture should be inverted on Y (false by default on video and true on canvas)
     */
    HtmlElementTexture.prototype.update = function (invertY) {
        if (invertY === void 0) { invertY = null; }
        var engine = this._getEngine();
        if (this._texture == null || engine == null) {
            return;
        }
        var wasReady = this.isReady();
        if (this._isVideo) {
            var videoElement = this.element;
            if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
                return;
            }
            engine.updateVideoTexture(this._texture, videoElement, invertY === null ? true : invertY);
        }
        else {
            var canvasElement = this.element;
            engine.updateDynamicTexture(this._texture, canvasElement, invertY === null ? true : invertY, false);
        }
        if (!wasReady && this.isReady()) {
            this.onLoadObservable.notifyObservers(this);
        }
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    HtmlElementTexture.prototype.dispose = function () {
        this.onLoadObservable.clear();
        _super.prototype.dispose.call(this);
    };
    HtmlElementTexture._DefaultOptions = {
        generateMipMaps: false,
        samplingMode: 2,
        engine: null,
        scene: null,
    };
    return HtmlElementTexture;
}(BaseTexture));
export { HtmlElementTexture };
//# sourceMappingURL=htmlElementTexture.js.map