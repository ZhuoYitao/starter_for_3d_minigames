import { __extends } from "tslib";
import { Texture } from "../Materials/Textures/texture.js";
import { TextureDome } from "./textureDome.js";
/**
 * Display a 360 degree photo on an approximately spherical surface, useful for VR applications or skyboxes.
 * As a subclass of TransformNode, this allow parenting to the camera with different locations in the scene.
 * This class achieves its effect with a Texture and a correctly configured BackgroundMaterial on an inverted sphere.
 * Potential additions to this helper include zoom and and non-infinite distance rendering effects.
 */
var PhotoDome = /** @class */ (function (_super) {
    __extends(PhotoDome, _super);
    function PhotoDome() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(PhotoDome.prototype, "photoTexture", {
        /**
         * Gets or sets the texture being displayed on the sphere
         */
        get: function () {
            return this.texture;
        },
        /**
         * sets the texture being displayed on the sphere
         */
        set: function (value) {
            this.texture = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoDome.prototype, "imageMode", {
        /**
         * Gets the current video mode for the video. It can be:
         * * TextureDome.MODE_MONOSCOPIC : Define the texture source as a Monoscopic panoramic 360.
         * * TextureDome.MODE_TOPBOTTOM  : Define the texture source as a Stereoscopic TopBottom/OverUnder panoramic 360.
         * * TextureDome.MODE_SIDEBYSIDE : Define the texture source as a Stereoscopic Side by Side panoramic 360.
         */
        get: function () {
            return this.textureMode;
        },
        /**
         * Sets the current video mode for the video. It can be:
         * * TextureDome.MODE_MONOSCOPIC : Define the texture source as a Monoscopic panoramic 360.
         * * TextureDome.MODE_TOPBOTTOM  : Define the texture source as a Stereoscopic TopBottom/OverUnder panoramic 360.
         * * TextureDome.MODE_SIDEBYSIDE : Define the texture source as a Stereoscopic Side by Side panoramic 360.
         */
        set: function (value) {
            this.textureMode = value;
        },
        enumerable: false,
        configurable: true
    });
    PhotoDome.prototype._initTexture = function (urlsOrElement, scene, options) {
        var _this = this;
        return new Texture(urlsOrElement, scene, !options.generateMipMaps, !this._useDirectMapping, undefined, function () {
            _this.onLoadObservable.notifyObservers();
        }, function (message, exception) {
            _this.onLoadErrorObservable.notifyObservers(message || "Unknown error occured");
            if (_this.onError) {
                _this.onError(message, exception);
            }
        });
    };
    /**
     * Define the image as a Monoscopic panoramic 360 image.
     */
    PhotoDome.MODE_MONOSCOPIC = TextureDome.MODE_MONOSCOPIC;
    /**
     * Define the image as a Stereoscopic TopBottom/OverUnder panoramic 360 image.
     */
    PhotoDome.MODE_TOPBOTTOM = TextureDome.MODE_TOPBOTTOM;
    /**
     * Define the image as a Stereoscopic Side by Side panoramic 360 image.
     */
    PhotoDome.MODE_SIDEBYSIDE = TextureDome.MODE_SIDEBYSIDE;
    return PhotoDome;
}(TextureDome));
export { PhotoDome };
//# sourceMappingURL=photoDome.js.map