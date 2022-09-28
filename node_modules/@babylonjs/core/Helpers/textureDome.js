import { __extends } from "tslib";
import { TransformNode } from "../Meshes/transformNode.js";
import { Mesh } from "../Meshes/mesh.js";
import { Texture } from "../Materials/Textures/texture.js";
import { BackgroundMaterial } from "../Materials/Background/backgroundMaterial.js";
import { CreateSphere } from "../Meshes/Builders/sphereBuilder.js";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Axis } from "../Maths/math.js";
/**
 * Display a 360/180 degree texture on an approximately spherical surface, useful for VR applications or skyboxes.
 * As a subclass of TransformNode, this allow parenting to the camera or multiple textures with different locations in the scene.
 * This class achieves its effect with a Texture and a correctly configured BackgroundMaterial on an inverted sphere.
 * Potential additions to this helper include zoom and and non-infinite distance rendering effects.
 */
var TextureDome = /** @class */ (function (_super) {
    __extends(TextureDome, _super);
    /**
     * Create an instance of this class and pass through the parameters to the relevant classes- Texture, StandardMaterial, and Mesh.
     * @param name Element's name, child elements will append suffixes for their own names.
     * @param textureUrlOrElement defines the url(s) or the (video) HTML element to use
     * @param options An object containing optional or exposed sub element properties
     * @param options.resolution
     * @param options.clickToPlay
     * @param options.autoPlay
     * @param options.loop
     * @param options.size
     * @param options.poster
     * @param options.faceForward
     * @param options.useDirectMapping
     * @param options.halfDomeMode
     * @param options.crossEyeMode
     * @param options.generateMipMaps
     * @param options.mesh
     * @param scene
     * @param onError
     */
    function TextureDome(name, textureUrlOrElement, options, scene, 
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onError) {
        if (onError === void 0) { onError = null; }
        var _this = _super.call(this, name, scene) || this;
        _this.onError = onError;
        _this._halfDome = false;
        _this._crossEye = false;
        _this._useDirectMapping = false;
        _this._textureMode = TextureDome.MODE_MONOSCOPIC;
        /**
         * Oberserver used in Stereoscopic VR Mode.
         */
        _this._onBeforeCameraRenderObserver = null;
        /**
         * Observable raised when an error occurred while loading the texture
         */
        _this.onLoadErrorObservable = new Observable();
        /**
         * Observable raised when the texture finished loading
         */
        _this.onLoadObservable = new Observable();
        scene = _this.getScene();
        // set defaults and manage values
        name = name || "textureDome";
        options.resolution = Math.abs(options.resolution) | 0 || 32;
        options.clickToPlay = Boolean(options.clickToPlay);
        options.autoPlay = options.autoPlay === undefined ? true : Boolean(options.autoPlay);
        options.loop = options.loop === undefined ? true : Boolean(options.loop);
        options.size = Math.abs(options.size) || (scene.activeCamera ? scene.activeCamera.maxZ * 0.48 : 1000);
        if (options.useDirectMapping === undefined) {
            _this._useDirectMapping = true;
        }
        else {
            _this._useDirectMapping = options.useDirectMapping;
        }
        if (options.faceForward === undefined) {
            options.faceForward = true;
        }
        _this._setReady(false);
        if (!options.mesh) {
            _this._mesh = CreateSphere(name + "_mesh", { segments: options.resolution, diameter: options.size, updatable: false, sideOrientation: Mesh.BACKSIDE }, scene);
        }
        else {
            _this._mesh = options.mesh;
        }
        // configure material
        var material = (_this._material = new BackgroundMaterial(name + "_material", scene));
        material.useEquirectangularFOV = true;
        material.fovMultiplier = 1.0;
        material.opacityFresnel = false;
        var texture = _this._initTexture(textureUrlOrElement, scene, options);
        _this.texture = texture;
        // configure mesh
        _this._mesh.material = material;
        _this._mesh.parent = _this;
        // create a (disabled until needed) mask to cover unneeded segments of 180 texture.
        _this._halfDomeMask = CreateSphere("", { slice: 0.5, diameter: options.size * 0.98, segments: options.resolution * 2, sideOrientation: Mesh.BACKSIDE }, scene);
        _this._halfDomeMask.rotate(Axis.X, -Math.PI / 2);
        // set the parent, so it will always be positioned correctly AND will be disposed when the main sphere is disposed
        _this._halfDomeMask.parent = _this._mesh;
        _this._halfDome = !!options.halfDomeMode;
        // enable or disable according to the settings
        _this._halfDomeMask.setEnabled(_this._halfDome);
        _this._crossEye = !!options.crossEyeMode;
        // create
        _this._texture.anisotropicFilteringLevel = 1;
        _this._texture.onLoadObservable.addOnce(function () {
            _this._setReady(true);
        });
        // Initial rotation
        if (options.faceForward && scene.activeCamera) {
            var camera = scene.activeCamera;
            var forward = Vector3.Forward();
            var direction = Vector3.TransformNormal(forward, camera.getViewMatrix());
            direction.normalize();
            _this.rotation.y = Math.acos(Vector3.Dot(forward, direction));
        }
        _this._changeTextureMode(_this._textureMode);
        return _this;
    }
    Object.defineProperty(TextureDome.prototype, "texture", {
        /**
         * Gets the texture being displayed on the sphere
         */
        get: function () {
            return this._texture;
        },
        /**
         * Sets the texture being displayed on the sphere
         */
        set: function (newTexture) {
            if (this._texture === newTexture) {
                return;
            }
            this._texture = newTexture;
            if (this._useDirectMapping) {
                this._texture.wrapU = Texture.CLAMP_ADDRESSMODE;
                this._texture.wrapV = Texture.CLAMP_ADDRESSMODE;
                this._material.diffuseTexture = this._texture;
            }
            else {
                this._texture.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE; // matches orientation
                this._texture.wrapV = Texture.CLAMP_ADDRESSMODE;
                this._material.reflectionTexture = this._texture;
            }
            this._changeTextureMode(this._textureMode);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "mesh", {
        /**
         * Gets the mesh used for the dome.
         */
        get: function () {
            return this._mesh;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "fovMultiplier", {
        /**
         * The current fov(field of view) multiplier, 0.0 - 2.0. Defaults to 1.0. Lower values "zoom in" and higher values "zoom out".
         * Also see the options.resolution property.
         */
        get: function () {
            return this._material.fovMultiplier;
        },
        set: function (value) {
            this._material.fovMultiplier = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "textureMode", {
        /**
         * Gets or set the current texture mode for the texture. It can be:
         * * TextureDome.MODE_MONOSCOPIC : Define the texture source as a Monoscopic panoramic 360.
         * * TextureDome.MODE_TOPBOTTOM  : Define the texture source as a Stereoscopic TopBottom/OverUnder panoramic 360.
         * * TextureDome.MODE_SIDEBYSIDE : Define the texture source as a Stereoscopic Side by Side panoramic 360.
         */
        get: function () {
            return this._textureMode;
        },
        /**
         * Sets the current texture mode for the texture. It can be:
         * * TextureDome.MODE_MONOSCOPIC : Define the texture source as a Monoscopic panoramic 360.
         * * TextureDome.MODE_TOPBOTTOM  : Define the texture source as a Stereoscopic TopBottom/OverUnder panoramic 360.
         * * TextureDome.MODE_SIDEBYSIDE : Define the texture source as a Stereoscopic Side by Side panoramic 360.
         */
        set: function (value) {
            if (this._textureMode === value) {
                return;
            }
            this._changeTextureMode(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "halfDome", {
        /**
         * Is it a 180 degrees dome (half dome) or 360 texture (full dome)
         */
        get: function () {
            return this._halfDome;
        },
        /**
         * Set the halfDome mode. If set, only the front (180 degrees) will be displayed and the back will be blacked out.
         */
        set: function (enabled) {
            this._halfDome = enabled;
            this._halfDomeMask.setEnabled(enabled);
            this._changeTextureMode(this._textureMode);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "crossEye", {
        /**
         * Is it a cross-eye texture?
         */
        get: function () {
            return this._crossEye;
        },
        /**
         * Set the cross-eye mode. If set, images that can be seen when crossing eyes will render correctly
         */
        set: function (enabled) {
            this._crossEye = enabled;
            this._changeTextureMode(this._textureMode);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureDome.prototype, "material", {
        /**
         * The background material of this dome.
         */
        get: function () {
            return this._material;
        },
        enumerable: false,
        configurable: true
    });
    TextureDome.prototype._changeTextureMode = function (value) {
        var _this = this;
        this._scene.onBeforeCameraRenderObservable.remove(this._onBeforeCameraRenderObserver);
        this._textureMode = value;
        // Default Setup and Reset.
        this._texture.uScale = 1;
        this._texture.vScale = 1;
        this._texture.uOffset = 0;
        this._texture.vOffset = 0;
        this._texture.vAng = 0;
        switch (value) {
            case TextureDome.MODE_MONOSCOPIC:
                if (this._halfDome) {
                    this._texture.uScale = 2;
                    this._texture.uOffset = -1;
                }
                break;
            case TextureDome.MODE_SIDEBYSIDE: {
                // in half-dome mode the uScale should be double of 360 texture
                // Use 0.99999 to boost perf by not switching program
                this._texture.uScale = this._halfDome ? 0.99999 : 0.5;
                var rightOffset_1 = this._halfDome ? 0.0 : 0.5;
                var leftOffset_1 = this._halfDome ? -0.5 : 0.0;
                this._onBeforeCameraRenderObserver = this._scene.onBeforeCameraRenderObservable.add(function (camera) {
                    var isRightCamera = camera.isRightCamera;
                    if (_this._crossEye) {
                        isRightCamera = !isRightCamera;
                    }
                    if (isRightCamera) {
                        _this._texture.uOffset = rightOffset_1;
                    }
                    else {
                        _this._texture.uOffset = leftOffset_1;
                    }
                });
                break;
            }
            case TextureDome.MODE_TOPBOTTOM:
                // in half-dome mode the vScale should be double of 360 texture
                // Use 0.99999 to boost perf by not switching program
                this._texture.vScale = this._halfDome ? 0.99999 : 0.5;
                this._onBeforeCameraRenderObserver = this._scene.onBeforeCameraRenderObservable.add(function (camera) {
                    var isRightCamera = camera.isRightCamera;
                    // allow "cross-eye" if left and right were switched in this mode
                    if (_this._crossEye) {
                        isRightCamera = !isRightCamera;
                    }
                    _this._texture.vOffset = isRightCamera ? 0.5 : 0.0;
                });
                break;
        }
    };
    /**
     * Releases resources associated with this node.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    TextureDome.prototype.dispose = function (doNotRecurse, disposeMaterialAndTextures) {
        if (disposeMaterialAndTextures === void 0) { disposeMaterialAndTextures = false; }
        this._texture.dispose();
        this._mesh.dispose();
        this._material.dispose();
        this._scene.onBeforeCameraRenderObservable.remove(this._onBeforeCameraRenderObserver);
        this.onLoadErrorObservable.clear();
        this.onLoadObservable.clear();
        _super.prototype.dispose.call(this, doNotRecurse, disposeMaterialAndTextures);
    };
    /**
     * Define the source as a Monoscopic panoramic 360/180.
     */
    TextureDome.MODE_MONOSCOPIC = 0;
    /**
     * Define the source as a Stereoscopic TopBottom/OverUnder panoramic 360/180.
     */
    TextureDome.MODE_TOPBOTTOM = 1;
    /**
     * Define the source as a Stereoscopic Side by Side panoramic 360/180.
     */
    TextureDome.MODE_SIDEBYSIDE = 2;
    return TextureDome;
}(TransformNode));
export { TextureDome };
//# sourceMappingURL=textureDome.js.map