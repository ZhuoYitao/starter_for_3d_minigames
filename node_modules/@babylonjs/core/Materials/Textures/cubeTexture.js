import { __decorate, __extends } from "tslib";
import { serialize, serializeAsMatrix, SerializationHelper } from "../../Misc/decorators.js";
import { Tools } from "../../Misc/tools.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { BaseTexture } from "../../Materials/Textures/baseTexture.js";
import { Texture } from "../../Materials/Textures/texture.js";

import { GetClass, RegisterClass } from "../../Misc/typeStore.js";
import "../../Engines/Extensions/engine.cubeTexture.js";
import { StartsWith } from "../../Misc/stringTools.js";
import { Observable } from "../../Misc/observable.js";
/**
 * Class for creating a cube texture
 */
var CubeTexture = /** @class */ (function (_super) {
    __extends(CubeTexture, _super);
    /**
     * Creates a cube texture to use with reflection for instance. It can be based upon dds or six images as well
     * as prefiltered data.
     * @param rootUrl defines the url of the texture or the root name of the six images
     * @param sceneOrEngine defines the scene or engine the texture is attached to
     * @param extensions defines the suffixes add to the picture name in case six images are in use like _px.jpg...
     * @param noMipmap defines if mipmaps should be created or not
     * @param files defines the six files to load for the different faces in that order: px, py, pz, nx, ny, nz
     * @param onLoad defines a callback triggered at the end of the file load if no errors occurred
     * @param onError defines a callback triggered in case of error during load
     * @param format defines the internal format to use for the texture once loaded
     * @param prefiltered defines whether or not the texture is created from prefiltered data
     * @param forcedExtension defines the extensions to use (force a special type of file to load) in case it is different from the file name
     * @param createPolynomials defines whether or not to create polynomial harmonics from the texture data if necessary
     * @param lodScale defines the scale applied to environment texture. This manages the range of LOD level used for IBL according to the roughness
     * @param lodOffset defines the offset applied to environment texture. This manages first LOD level used for IBL according to the roughness
     * @param loaderOptions options to be passed to the loader
     * @param useSRGBBuffer Defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU) (default: false)
     * @return the cube texture
     */
    function CubeTexture(rootUrl, sceneOrEngine, extensions, noMipmap, files, onLoad, onError, format, prefiltered, forcedExtension, createPolynomials, lodScale, lodOffset, loaderOptions, useSRGBBuffer) {
        if (extensions === void 0) { extensions = null; }
        if (noMipmap === void 0) { noMipmap = false; }
        if (files === void 0) { files = null; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (format === void 0) { format = 5; }
        if (prefiltered === void 0) { prefiltered = false; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (createPolynomials === void 0) { createPolynomials = false; }
        if (lodScale === void 0) { lodScale = 0.8; }
        if (lodOffset === void 0) { lodOffset = 0; }
        var _this = this;
        var _a;
        _this = _super.call(this, sceneOrEngine) || this;
        _this._lodScale = 0.8;
        _this._lodOffset = 0;
        /**
         * Observable triggered once the texture has been loaded.
         */
        _this.onLoadObservable = new Observable();
        /**
         * Gets or sets the center of the bounding box associated with the cube texture.
         * It must define where the camera used to render the texture was set
         * @see https://doc.babylonjs.com/how_to/reflect#using-local-cubemap-mode
         */
        _this.boundingBoxPosition = Vector3.Zero();
        _this._rotationY = 0;
        _this._files = null;
        _this._forcedExtension = null;
        _this._extensions = null;
        _this.name = rootUrl;
        _this.url = rootUrl;
        _this._noMipmap = noMipmap;
        _this.hasAlpha = false;
        _this._format = format;
        _this.isCube = true;
        _this._textureMatrix = Matrix.Identity();
        _this._createPolynomials = createPolynomials;
        _this.coordinatesMode = Texture.CUBIC_MODE;
        _this._extensions = extensions;
        _this._files = files;
        _this._forcedExtension = forcedExtension;
        _this._loaderOptions = loaderOptions;
        _this._useSRGBBuffer = useSRGBBuffer;
        _this._lodScale = lodScale;
        _this._lodOffset = lodOffset;
        if (!rootUrl && !files) {
            return _this;
        }
        _this.updateURL(rootUrl, forcedExtension, onLoad, prefiltered, onError, extensions, (_a = _this.getScene()) === null || _a === void 0 ? void 0 : _a.useDelayedTextureLoading, files);
        return _this;
    }
    Object.defineProperty(CubeTexture.prototype, "boundingBoxSize", {
        /**
         * Returns the bounding box size
         * @see https://doc.babylonjs.com/how_to/reflect#using-local-cubemap-mode
         */
        get: function () {
            return this._boundingBoxSize;
        },
        /**
         * Gets or sets the size of the bounding box associated with the cube texture
         * When defined, the cubemap will switch to local mode
         * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
         * @example https://www.babylonjs-playground.com/#RNASML
         */
        set: function (value) {
            if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
                return;
            }
            this._boundingBoxSize = value;
            var scene = this.getScene();
            if (scene) {
                scene.markAllMaterialsAsDirty(1);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeTexture.prototype, "rotationY", {
        /**
         * Gets texture matrix rotation angle around Y axis radians.
         */
        get: function () {
            return this._rotationY;
        },
        /**
         * Sets texture matrix rotation angle around Y axis in radians.
         */
        set: function (value) {
            this._rotationY = value;
            this.setReflectionTextureMatrix(Matrix.RotationY(this._rotationY));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeTexture.prototype, "noMipmap", {
        /**
         * Are mip maps generated for this texture or not.
         */
        get: function () {
            return this._noMipmap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeTexture.prototype, "forcedExtension", {
        /**
         * Gets the forced extension (if any)
         */
        get: function () {
            return this._forcedExtension;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a cube texture from an array of image urls
     * @param files defines an array of image urls
     * @param scene defines the hosting scene
     * @param noMipmap specifies if mip maps are not used
     * @returns a cube texture
     */
    CubeTexture.CreateFromImages = function (files, scene, noMipmap) {
        var rootUrlKey = "";
        files.forEach(function (url) { return (rootUrlKey += url); });
        return new CubeTexture(rootUrlKey, scene, null, noMipmap, files);
    };
    /**
     * Creates and return a texture created from prefilterd data by tools like IBL Baker or Lys.
     * @param url defines the url of the prefiltered texture
     * @param scene defines the scene the texture is attached to
     * @param forcedExtension defines the extension of the file if different from the url
     * @param createPolynomials defines whether or not to create polynomial harmonics from the texture data if necessary
     * @return the prefiltered texture
     */
    CubeTexture.CreateFromPrefilteredData = function (url, scene, forcedExtension, createPolynomials) {
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (createPolynomials === void 0) { createPolynomials = true; }
        var oldValue = scene.useDelayedTextureLoading;
        scene.useDelayedTextureLoading = false;
        var result = new CubeTexture(url, scene, null, false, null, null, null, undefined, true, forcedExtension, createPolynomials);
        scene.useDelayedTextureLoading = oldValue;
        return result;
    };
    /**
     * Get the current class name of the texture useful for serialization or dynamic coding.
     * @returns "CubeTexture"
     */
    CubeTexture.prototype.getClassName = function () {
        return "CubeTexture";
    };
    /**
     * Update the url (and optional buffer) of this texture if url was null during construction.
     * @param url the url of the texture
     * @param forcedExtension defines the extension to use
     * @param onLoad callback called when the texture is loaded  (defaults to null)
     * @param prefiltered Defines whether the updated texture is prefiltered or not
     * @param onError callback called if there was an error during the loading process (defaults to null)
     * @param extensions defines the suffixes add to the picture name in case six images are in use like _px.jpg...
     * @param delayLoad defines if the texture should be loaded now (false by default)
     * @param files defines the six files to load for the different faces in that order: px, py, pz, nx, ny, nz
     */
    CubeTexture.prototype.updateURL = function (url, forcedExtension, onLoad, prefiltered, onError, extensions, delayLoad, files) {
        if (onLoad === void 0) { onLoad = null; }
        if (prefiltered === void 0) { prefiltered = false; }
        if (onError === void 0) { onError = null; }
        if (extensions === void 0) { extensions = null; }
        if (delayLoad === void 0) { delayLoad = false; }
        if (files === void 0) { files = null; }
        if (!this.name || StartsWith(this.name, "data:")) {
            this.name = url;
        }
        this.url = url;
        if (forcedExtension) {
            this._forcedExtension = forcedExtension;
        }
        var lastDot = url.lastIndexOf(".");
        var extension = forcedExtension ? forcedExtension : lastDot > -1 ? url.substring(lastDot).toLowerCase() : "";
        var isDDS = extension.indexOf(".dds") === 0;
        var isEnv = extension.indexOf(".env") === 0;
        if (isEnv) {
            this.gammaSpace = false;
            this._prefiltered = false;
            this.anisotropicFilteringLevel = 1;
        }
        else {
            this._prefiltered = prefiltered;
            if (prefiltered) {
                this.gammaSpace = false;
                this.anisotropicFilteringLevel = 1;
            }
        }
        if (files) {
            this._files = files;
        }
        else {
            if (!isEnv && !isDDS && !extensions) {
                extensions = ["_px.jpg", "_py.jpg", "_pz.jpg", "_nx.jpg", "_ny.jpg", "_nz.jpg"];
            }
            this._files = this._files || [];
            this._files.length = 0;
            if (extensions) {
                for (var index = 0; index < extensions.length; index++) {
                    this._files.push(url + extensions[index]);
                }
                this._extensions = extensions;
            }
        }
        if (delayLoad) {
            this.delayLoadState = 4;
            this._delayedOnLoad = onLoad;
            this._delayedOnError = onError;
        }
        else {
            this._loadTexture(onLoad, onError);
        }
    };
    /**
     * Delays loading of the cube texture
     * @param forcedExtension defines the extension to use
     */
    CubeTexture.prototype.delayLoad = function (forcedExtension) {
        if (this.delayLoadState !== 4) {
            return;
        }
        if (forcedExtension) {
            this._forcedExtension = forcedExtension;
        }
        this.delayLoadState = 1;
        this._loadTexture(this._delayedOnLoad, this._delayedOnError);
    };
    /**
     * Returns the reflection texture matrix
     * @returns the reflection texture matrix
     */
    CubeTexture.prototype.getReflectionTextureMatrix = function () {
        return this._textureMatrix;
    };
    /**
     * Sets the reflection texture matrix
     * @param value Reflection texture matrix
     */
    CubeTexture.prototype.setReflectionTextureMatrix = function (value) {
        var _this = this;
        var _a;
        if (value.updateFlag === this._textureMatrix.updateFlag) {
            return;
        }
        if (value.isIdentity() !== this._textureMatrix.isIdentity()) {
            (_a = this.getScene()) === null || _a === void 0 ? void 0 : _a.markAllMaterialsAsDirty(1, function (mat) { return mat.getActiveTextures().indexOf(_this) !== -1; });
        }
        this._textureMatrix = value;
    };
    CubeTexture.prototype._loadTexture = function (onLoad, onError) {
        var _this = this;
        var _a;
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        var scene = this.getScene();
        var oldTexture = this._texture;
        this._texture = this._getFromCache(this.url, this._noMipmap, undefined, undefined, this._useSRGBBuffer);
        var onLoadProcessing = function () {
            var _a;
            _this.onLoadObservable.notifyObservers(_this);
            if (oldTexture) {
                oldTexture.dispose();
                (_a = _this.getScene()) === null || _a === void 0 ? void 0 : _a.markAllMaterialsAsDirty(1);
            }
            if (onLoad) {
                onLoad();
            }
        };
        var errorHandler = function (message, exception) {
            _this._loadingError = true;
            _this._errorObject = { message: message, exception: exception };
            if (onError) {
                onError(message, exception);
            }
            Texture.OnTextureLoadErrorObservable.notifyObservers(_this);
        };
        if (!this._texture) {
            if (this._prefiltered) {
                this._texture = this._getEngine().createPrefilteredCubeTexture(this.url, scene, this._lodScale, this._lodOffset, onLoad, errorHandler, this._format, this._forcedExtension, this._createPolynomials);
            }
            else {
                this._texture = this._getEngine().createCubeTexture(this.url, scene, this._files, this._noMipmap, onLoad, errorHandler, this._format, this._forcedExtension, false, this._lodScale, this._lodOffset, null, this._loaderOptions, !!this._useSRGBBuffer);
            }
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.onLoadedObservable.add(function () { return _this.onLoadObservable.notifyObservers(_this); });
        }
        else {
            if (this._texture.isReady) {
                Tools.SetImmediate(function () { return onLoadProcessing(); });
            }
            else {
                this._texture.onLoadedObservable.add(function () { return onLoadProcessing(); });
            }
        }
    };
    /**
     * Parses text to create a cube texture
     * @param parsedTexture define the serialized text to read from
     * @param scene defines the hosting scene
     * @param rootUrl defines the root url of the cube texture
     * @returns a cube texture
     */
    CubeTexture.Parse = function (parsedTexture, scene, rootUrl) {
        var texture = SerializationHelper.Parse(function () {
            var prefiltered = false;
            if (parsedTexture.prefiltered) {
                prefiltered = parsedTexture.prefiltered;
            }
            return new CubeTexture(rootUrl + parsedTexture.name, scene, parsedTexture.extensions, false, parsedTexture.files || null, null, null, undefined, prefiltered, parsedTexture.forcedExtension);
        }, parsedTexture, scene);
        // Local Cubemaps
        if (parsedTexture.boundingBoxPosition) {
            texture.boundingBoxPosition = Vector3.FromArray(parsedTexture.boundingBoxPosition);
        }
        if (parsedTexture.boundingBoxSize) {
            texture.boundingBoxSize = Vector3.FromArray(parsedTexture.boundingBoxSize);
        }
        // Animations
        if (parsedTexture.animations) {
            for (var animationIndex = 0; animationIndex < parsedTexture.animations.length; animationIndex++) {
                var parsedAnimation = parsedTexture.animations[animationIndex];
                var internalClass = GetClass("BABYLON.Animation");
                if (internalClass) {
                    texture.animations.push(internalClass.Parse(parsedAnimation));
                }
            }
        }
        return texture;
    };
    /**
     * Makes a clone, or deep copy, of the cube texture
     * @returns a new cube texture
     */
    CubeTexture.prototype.clone = function () {
        var _this = this;
        var uniqueId = 0;
        var newCubeTexture = SerializationHelper.Clone(function () {
            var cubeTexture = new CubeTexture(_this.url, _this.getScene() || _this._getEngine(), _this._extensions, _this._noMipmap, _this._files);
            uniqueId = cubeTexture.uniqueId;
            return cubeTexture;
        }, this);
        newCubeTexture.uniqueId = uniqueId;
        return newCubeTexture;
    };
    __decorate([
        serialize()
    ], CubeTexture.prototype, "url", void 0);
    __decorate([
        serialize("rotationY")
    ], CubeTexture.prototype, "rotationY", null);
    __decorate([
        serialize("files")
    ], CubeTexture.prototype, "_files", void 0);
    __decorate([
        serialize("forcedExtension")
    ], CubeTexture.prototype, "_forcedExtension", void 0);
    __decorate([
        serialize("extensions")
    ], CubeTexture.prototype, "_extensions", void 0);
    __decorate([
        serializeAsMatrix("textureMatrix")
    ], CubeTexture.prototype, "_textureMatrix", void 0);
    return CubeTexture;
}(BaseTexture));
export { CubeTexture };
Texture._CubeTextureParser = CubeTexture.Parse;
// Some exporters relies on Tools.Instantiate
RegisterClass("BABYLON.CubeTexture", CubeTexture);
//# sourceMappingURL=cubeTexture.js.map