import { __extends } from "tslib";
import { Texture } from "../Materials/Textures/texture.js";
import { VideoTexture } from "../Materials/Textures/videoTexture.js";
import { TextureDome } from "./textureDome.js";
import { PointerEventTypes } from "../Events/pointerEvents.js";
/**
 * Display a 360/180 degree video on an approximately spherical surface, useful for VR applications or skyboxes.
 * As a subclass of TransformNode, this allow parenting to the camera or multiple videos with different locations in the scene.
 * This class achieves its effect with a VideoTexture and a correctly configured BackgroundMaterial on an inverted sphere.
 * Potential additions to this helper include zoom and and non-infinite distance rendering effects.
 */
var VideoDome = /** @class */ (function (_super) {
    __extends(VideoDome, _super);
    function VideoDome() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(VideoDome.prototype, "videoTexture", {
        /**
         * Get the video texture associated with this video dome
         */
        get: function () {
            return this._texture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VideoDome.prototype, "videoMode", {
        /**
         * Get the video mode of this dome
         */
        get: function () {
            return this.textureMode;
        },
        /**
         * Set the video mode of this dome.
         * @see textureMode
         */
        set: function (value) {
            this.textureMode = value;
        },
        enumerable: false,
        configurable: true
    });
    VideoDome.prototype._initTexture = function (urlsOrElement, scene, options) {
        var _this = this;
        var tempOptions = { loop: options.loop, autoPlay: options.autoPlay, autoUpdateTexture: true, poster: options.poster };
        var texture = new VideoTexture((this.name || "videoDome") + "_texture", urlsOrElement, scene, options.generateMipMaps, this._useDirectMapping, Texture.TRILINEAR_SAMPLINGMODE, tempOptions);
        // optional configuration
        if (options.clickToPlay) {
            this._pointerObserver = scene.onPointerObservable.add(function (pointerInfo) {
                if (pointerInfo.type !== PointerEventTypes.POINTERUP) {
                    _this._texture.video.play();
                }
            });
        }
        this._textureObserver = texture.onLoadObservable.add(function () {
            _this.onLoadObservable.notifyObservers();
        });
        return texture;
    };
    /**
     * Releases resources associated with this node.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    VideoDome.prototype.dispose = function (doNotRecurse, disposeMaterialAndTextures) {
        if (disposeMaterialAndTextures === void 0) { disposeMaterialAndTextures = false; }
        this._texture.onLoadObservable.remove(this._textureObserver);
        this._scene.onPointerObservable.remove(this._pointerObserver);
        _super.prototype.dispose.call(this, doNotRecurse, disposeMaterialAndTextures);
    };
    /**
     * Define the video source as a Monoscopic panoramic 360 video.
     */
    VideoDome.MODE_MONOSCOPIC = TextureDome.MODE_MONOSCOPIC;
    /**
     * Define the video source as a Stereoscopic TopBottom/OverUnder panoramic 360 video.
     */
    VideoDome.MODE_TOPBOTTOM = TextureDome.MODE_TOPBOTTOM;
    /**
     * Define the video source as a Stereoscopic Side by Side panoramic 360 video.
     */
    VideoDome.MODE_SIDEBYSIDE = TextureDome.MODE_SIDEBYSIDE;
    return VideoDome;
}(TextureDome));
export { VideoDome };
//# sourceMappingURL=videoDome.js.map