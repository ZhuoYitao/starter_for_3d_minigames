import { __decorate, __extends } from "tslib";
import { serialize, SerializationHelper, serializeAsTexture } from "../../Misc/decorators.js";
import { Observable } from "../../Misc/observable.js";
import { Matrix } from "../../Maths/math.vector.js";
import { EngineStore } from "../../Engines/engineStore.js";

import { RandomGUID } from "../../Misc/guid.js";
import "../../Misc/fileTools.js";
import { ThinTexture } from "./thinTexture.js";
/**
 * Base class of all the textures in babylon.
 * It groups all the common properties the materials, post process, lights... might need
 * in order to make a correct use of the texture.
 */
var BaseTexture = /** @class */ (function (_super) {
    __extends(BaseTexture, _super);
    /**
     * Instantiates a new BaseTexture.
     * Base class of all the textures in babylon.
     * It groups all the common properties the materials, post process, lights... might need
     * in order to make a correct use of the texture.
     * @param sceneOrEngine Define the scene or engine the texture belongs to
     */
    function BaseTexture(sceneOrEngine) {
        var _this = _super.call(this, null) || this;
        /**
         * Gets or sets an object used to store user defined information.
         */
        _this.metadata = null;
        /**
         * For internal use only. Please do not use.
         */
        _this.reservedDataStore = null;
        _this._hasAlpha = false;
        _this._getAlphaFromRGB = false;
        /**
         * Intensity or strength of the texture.
         * It is commonly used by materials to fine tune the intensity of the texture
         */
        _this.level = 1;
        _this._coordinatesIndex = 0;
        _this._coordinatesMode = 0;
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        _this.wrapR = 1;
        /**
         * With compliant hardware and browser (supporting anisotropic filtering)
         * this defines the level of anisotropic filtering in the texture.
         * The higher the better but the slower. This defaults to 4 as it seems to be the best tradeoff.
         */
        _this.anisotropicFilteringLevel = BaseTexture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL;
        _this._isCube = false;
        _this._gammaSpace = true;
        /**
         * Is Z inverted in the texture (useful in a cube texture).
         */
        _this.invertZ = false;
        /**
         * @hidden
         */
        _this.lodLevelInAlpha = false;
        /**
         * Define if the texture is a render target.
         */
        _this.isRenderTarget = false;
        /** @hidden */
        _this._prefiltered = false;
        /** @hidden */
        _this._forceSerialize = false;
        /**
         * Define the list of animation attached to the texture.
         */
        _this.animations = new Array();
        /**
         * An event triggered when the texture is disposed.
         */
        _this.onDisposeObservable = new Observable();
        _this._onDisposeObserver = null;
        _this._scene = null;
        /** @hidden */
        _this._uid = null;
        /** @hidden */
        _this._parentContainer = null;
        _this._loadingError = false;
        if (sceneOrEngine) {
            if (BaseTexture._IsScene(sceneOrEngine)) {
                _this._scene = sceneOrEngine;
            }
            else {
                _this._engine = sceneOrEngine;
            }
        }
        else {
            _this._scene = EngineStore.LastCreatedScene;
        }
        if (_this._scene) {
            _this.uniqueId = _this._scene.getUniqueId();
            _this._scene.addTexture(_this);
            _this._engine = _this._scene.getEngine();
        }
        _this._uid = null;
        return _this;
    }
    Object.defineProperty(BaseTexture.prototype, "hasAlpha", {
        get: function () {
            return this._hasAlpha;
        },
        /**
         * Define if the texture is having a usable alpha value (can be use for transparency or glossiness for instance).
         */
        set: function (value) {
            var _this = this;
            if (this._hasAlpha === value) {
                return;
            }
            this._hasAlpha = value;
            if (this._scene) {
                this._scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "getAlphaFromRGB", {
        get: function () {
            return this._getAlphaFromRGB;
        },
        /**
         * Defines if the alpha value should be determined via the rgb values.
         * If true the luminance of the pixel might be used to find the corresponding alpha value.
         */
        set: function (value) {
            var _this = this;
            if (this._getAlphaFromRGB === value) {
                return;
            }
            this._getAlphaFromRGB = value;
            if (this._scene) {
                this._scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "coordinatesIndex", {
        get: function () {
            return this._coordinatesIndex;
        },
        /**
         * Define the UV channel to use starting from 0 and defaulting to 0.
         * This is part of the texture as textures usually maps to one uv set.
         */
        set: function (value) {
            var _this = this;
            if (this._coordinatesIndex === value) {
                return;
            }
            this._coordinatesIndex = value;
            if (this._scene) {
                this._scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "coordinatesMode", {
        get: function () {
            return this._coordinatesMode;
        },
        /**
         * How a texture is mapped.
         *
         * | Value | Type                                | Description |
         * | ----- | ----------------------------------- | ----------- |
         * | 0     | EXPLICIT_MODE                       |             |
         * | 1     | SPHERICAL_MODE                      |             |
         * | 2     | PLANAR_MODE                         |             |
         * | 3     | CUBIC_MODE                          |             |
         * | 4     | PROJECTION_MODE                     |             |
         * | 5     | SKYBOX_MODE                         |             |
         * | 6     | INVCUBIC_MODE                       |             |
         * | 7     | EQUIRECTANGULAR_MODE                |             |
         * | 8     | FIXED_EQUIRECTANGULAR_MODE          |             |
         * | 9     | FIXED_EQUIRECTANGULAR_MIRRORED_MODE |             |
         */
        set: function (value) {
            var _this = this;
            if (this._coordinatesMode === value) {
                return;
            }
            this._coordinatesMode = value;
            if (this._scene) {
                this._scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "wrapU", {
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        get: function () {
            return this._wrapU;
        },
        set: function (value) {
            this._wrapU = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "wrapV", {
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        get: function () {
            return this._wrapV;
        },
        set: function (value) {
            this._wrapV = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "isCube", {
        /**
         * Define if the texture is a cube texture or if false a 2d texture.
         */
        get: function () {
            if (!this._texture) {
                return this._isCube;
            }
            return this._texture.isCube;
        },
        set: function (value) {
            if (!this._texture) {
                this._isCube = value;
            }
            else {
                this._texture.isCube = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "is3D", {
        /**
         * Define if the texture is a 3d texture (webgl 2) or if false a 2d texture.
         */
        get: function () {
            if (!this._texture) {
                return false;
            }
            return this._texture.is3D;
        },
        set: function (value) {
            if (!this._texture) {
                return;
            }
            this._texture.is3D = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "is2DArray", {
        /**
         * Define if the texture is a 2d array texture (webgl 2) or if false a 2d texture.
         */
        get: function () {
            if (!this._texture) {
                return false;
            }
            return this._texture.is2DArray;
        },
        set: function (value) {
            if (!this._texture) {
                return;
            }
            this._texture.is2DArray = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "gammaSpace", {
        /**
         * Define if the texture contains data in gamma space (most of the png/jpg aside bump).
         * HDR texture are usually stored in linear space.
         * This only impacts the PBR and Background materials
         */
        get: function () {
            if (!this._texture) {
                return this._gammaSpace;
            }
            else {
                if (this._texture._gammaSpace === null) {
                    this._texture._gammaSpace = this._gammaSpace;
                }
            }
            return this._texture._gammaSpace && !this._texture._useSRGBBuffer;
        },
        set: function (gamma) {
            if (!this._texture) {
                if (this._gammaSpace === gamma) {
                    return;
                }
                this._gammaSpace = gamma;
            }
            else {
                if (this._texture._gammaSpace === gamma) {
                    return;
                }
                this._texture._gammaSpace = gamma;
            }
            this._markAllSubMeshesAsTexturesDirty();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "isRGBD", {
        /**
         * Gets or sets whether or not the texture contains RGBD data.
         */
        get: function () {
            return this._texture != null && this._texture._isRGBD;
        },
        set: function (value) {
            if (this._texture) {
                this._texture._isRGBD = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "noMipmap", {
        /**
         * Are mip maps generated for this texture or not.
         */
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "lodGenerationOffset", {
        /**
         * With prefiltered texture, defined the offset used during the prefiltering steps.
         */
        get: function () {
            if (this._texture) {
                return this._texture._lodGenerationOffset;
            }
            return 0.0;
        },
        set: function (value) {
            if (this._texture) {
                this._texture._lodGenerationOffset = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "lodGenerationScale", {
        /**
         * With prefiltered texture, defined the scale used during the prefiltering steps.
         */
        get: function () {
            if (this._texture) {
                return this._texture._lodGenerationScale;
            }
            return 0.0;
        },
        set: function (value) {
            if (this._texture) {
                this._texture._lodGenerationScale = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "linearSpecularLOD", {
        /**
         * With prefiltered texture, defined if the specular generation is based on a linear ramp.
         * By default we are using a log2 of the linear roughness helping to keep a better resolution for
         * average roughness values.
         */
        get: function () {
            if (this._texture) {
                return this._texture._linearSpecularLOD;
            }
            return false;
        },
        set: function (value) {
            if (this._texture) {
                this._texture._linearSpecularLOD = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "irradianceTexture", {
        /**
         * In case a better definition than spherical harmonics is required for the diffuse part of the environment.
         * You can set the irradiance texture to rely on a texture instead of the spherical approach.
         * This texture need to have the same characteristics than its parent (Cube vs 2d, coordinates mode, Gamma/Linear, RGBD).
         */
        get: function () {
            if (this._texture) {
                return this._texture._irradianceTexture;
            }
            return null;
        },
        set: function (value) {
            if (this._texture) {
                this._texture._irradianceTexture = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "uid", {
        /**
         * Define the unique id of the texture in the scene.
         */
        get: function () {
            if (!this._uid) {
                this._uid = RandomGUID();
            }
            return this._uid;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Return a string representation of the texture.
     * @returns the texture as a string
     */
    BaseTexture.prototype.toString = function () {
        return this.name;
    };
    /**
     * Get the class name of the texture.
     * @returns "BaseTexture"
     */
    BaseTexture.prototype.getClassName = function () {
        return "BaseTexture";
    };
    Object.defineProperty(BaseTexture.prototype, "onDispose", {
        /**
         * Callback triggered when the texture has been disposed.
         * Kept for back compatibility, you can use the onDisposeObservable instead.
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "isBlocking", {
        /**
         * Define if the texture is preventing a material to render or not.
         * If not and the texture is not ready, the engine will use a default black texture instead.
         */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "loadingError", {
        /**
         * Was there any loading error?
         */
        get: function () {
            return this._loadingError;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "errorObject", {
        /**
         * If a loading error occurred this object will be populated with information about the error.
         */
        get: function () {
            return this._errorObject;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the scene the texture belongs to.
     * @returns the scene or null if undefined
     */
    BaseTexture.prototype.getScene = function () {
        return this._scene;
    };
    /** @hidden */
    BaseTexture.prototype._getEngine = function () {
        return this._engine;
    };
    /**
     * Checks if the texture has the same transform matrix than another texture
     * @param texture texture to check against
     * @returns true if the transforms are the same, else false
     */
    BaseTexture.prototype.checkTransformsAreIdentical = function (texture) {
        return texture !== null;
    };
    /**
     * Get the texture transform matrix used to offset tile the texture for instance.
     * @returns the transformation matrix
     */
    BaseTexture.prototype.getTextureMatrix = function () {
        return Matrix.IdentityReadOnly;
    };
    /**
     * Get the texture reflection matrix used to rotate/transform the reflection.
     * @returns the reflection matrix
     */
    BaseTexture.prototype.getReflectionTextureMatrix = function () {
        return Matrix.IdentityReadOnly;
    };
    /**
     * Get if the texture is ready to be consumed (either it is ready or it is not blocking)
     * @returns true if ready, not blocking or if there was an error loading the texture
     */
    BaseTexture.prototype.isReadyOrNotBlocking = function () {
        return !this.isBlocking || this.isReady() || this.loadingError;
    };
    /**
     * Scales the texture if is `canRescale()`
     * @param ratio the resize factor we want to use to rescale
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseTexture.prototype.scale = function (ratio) { };
    Object.defineProperty(BaseTexture.prototype, "canRescale", {
        /**
         * Get if the texture can rescale.
         */
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param url
     * @param noMipmap
     * @param sampling
     * @param invertY
     * @param useSRGBBuffer
     * @hidden
     */
    BaseTexture.prototype._getFromCache = function (url, noMipmap, sampling, invertY, useSRGBBuffer) {
        var engine = this._getEngine();
        if (!engine) {
            return null;
        }
        var correctedUseSRGBBuffer = engine._getUseSRGBBuffer(!!useSRGBBuffer, noMipmap);
        var texturesCache = engine.getLoadedTexturesCache();
        for (var index = 0; index < texturesCache.length; index++) {
            var texturesCacheEntry = texturesCache[index];
            if (useSRGBBuffer === undefined || correctedUseSRGBBuffer === texturesCacheEntry._useSRGBBuffer) {
                if (invertY === undefined || invertY === texturesCacheEntry.invertY) {
                    if (texturesCacheEntry.url === url && texturesCacheEntry.generateMipMaps === !noMipmap) {
                        if (!sampling || sampling === texturesCacheEntry.samplingMode) {
                            texturesCacheEntry.incrementReferences();
                            return texturesCacheEntry;
                        }
                    }
                }
            }
        }
        return null;
    };
    /** @hidden */
    BaseTexture.prototype._rebuild = function () { };
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    BaseTexture.prototype.clone = function () {
        return null;
    };
    Object.defineProperty(BaseTexture.prototype, "textureType", {
        /**
         * Get the texture underlying type (INT, FLOAT...)
         */
        get: function () {
            if (!this._texture) {
                return 0;
            }
            return this._texture.type !== undefined ? this._texture.type : 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "textureFormat", {
        /**
         * Get the texture underlying format (RGB, RGBA...)
         */
        get: function () {
            if (!this._texture) {
                return 5;
            }
            return this._texture.format !== undefined ? this._texture.format : 5;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Indicates that textures need to be re-calculated for all materials
     */
    BaseTexture.prototype._markAllSubMeshesAsTexturesDirty = function () {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        scene.markAllMaterialsAsDirty(1);
    };
    /**
     * Reads the pixels stored in the webgl texture and returns them as an ArrayBuffer.
     * This will returns an RGBA array buffer containing either in values (0-255) or
     * float values (0-1) depending of the underlying buffer type.
     * @param faceIndex defines the face of the texture to read (in case of cube texture)
     * @param level defines the LOD level of the texture to read (in case of Mip Maps)
     * @param buffer defines a user defined buffer to fill with data (can be null)
     * @param flushRenderer true to flush the renderer from the pending commands before reading the pixels
     * @param noDataConversion false to convert the data to Uint8Array (if texture type is UNSIGNED_BYTE) or to Float32Array (if texture type is anything but UNSIGNED_BYTE). If true, the type of the generated buffer (if buffer==null) will depend on the type of the texture
     * @param x defines the region x coordinates to start reading from (default to 0)
     * @param y defines the region y coordinates to start reading from (default to 0)pe is UNSIGNED_BYTE) or to Float32Array (if texture type is anything but UNSIGNED_BYTE). If true, the type of the generated buffer (if buffer==null) will depend on the type of the texture
     * @param width defines the region width to read from (default to the texture size at level)
     * @param height defines the region width to read from (default to the texture size at level)
     * @returns The Array buffer promise containing the pixels data.
     */
    BaseTexture.prototype.readPixels = function (faceIndex, level, buffer, flushRenderer, noDataConversion, x, y, width, height) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (level === void 0) { level = 0; }
        if (buffer === void 0) { buffer = null; }
        if (flushRenderer === void 0) { flushRenderer = true; }
        if (noDataConversion === void 0) { noDataConversion = false; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = Number.MAX_VALUE; }
        if (height === void 0) { height = Number.MAX_VALUE; }
        if (!this._texture) {
            return null;
        }
        var engine = this._getEngine();
        if (!engine) {
            return null;
        }
        var size = this.getSize();
        var maxWidth = size.width;
        var maxHeight = size.height;
        if (level !== 0) {
            maxWidth = maxWidth / Math.pow(2, level);
            maxHeight = maxHeight / Math.pow(2, level);
            maxWidth = Math.round(maxWidth);
            maxHeight = Math.round(maxHeight);
        }
        width = Math.min(maxWidth, width);
        height = Math.min(maxHeight, height);
        try {
            if (this._texture.isCube) {
                return engine._readTexturePixels(this._texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion, x, y);
            }
            return engine._readTexturePixels(this._texture, width, height, -1, level, buffer, flushRenderer, noDataConversion, x, y);
        }
        catch (e) {
            return null;
        }
    };
    /**
     * @param faceIndex
     * @param level
     * @param buffer
     * @param flushRenderer
     * @param noDataConversion
     * @hidden
     */
    BaseTexture.prototype._readPixelsSync = function (faceIndex, level, buffer, flushRenderer, noDataConversion) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (level === void 0) { level = 0; }
        if (buffer === void 0) { buffer = null; }
        if (flushRenderer === void 0) { flushRenderer = true; }
        if (noDataConversion === void 0) { noDataConversion = false; }
        if (!this._texture) {
            return null;
        }
        var size = this.getSize();
        var width = size.width;
        var height = size.height;
        var engine = this._getEngine();
        if (!engine) {
            return null;
        }
        if (level != 0) {
            width = width / Math.pow(2, level);
            height = height / Math.pow(2, level);
            width = Math.round(width);
            height = Math.round(height);
        }
        try {
            if (this._texture.isCube) {
                return engine._readTexturePixelsSync(this._texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion);
            }
            return engine._readTexturePixelsSync(this._texture, width, height, -1, level, buffer, flushRenderer, noDataConversion);
        }
        catch (e) {
            return null;
        }
    };
    Object.defineProperty(BaseTexture.prototype, "_lodTextureHigh", {
        /** @hidden */
        get: function () {
            if (this._texture) {
                return this._texture._lodTextureHigh;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "_lodTextureMid", {
        /** @hidden */
        get: function () {
            if (this._texture) {
                return this._texture._lodTextureMid;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTexture.prototype, "_lodTextureLow", {
        /** @hidden */
        get: function () {
            if (this._texture) {
                return this._texture._lodTextureLow;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Dispose the texture and release its associated resources.
     */
    BaseTexture.prototype.dispose = function () {
        if (this._scene) {
            // Animations
            if (this._scene.stopAnimation) {
                this._scene.stopAnimation(this);
            }
            // Remove from scene
            this._scene._removePendingData(this);
            var index = this._scene.textures.indexOf(this);
            if (index >= 0) {
                this._scene.textures.splice(index, 1);
            }
            this._scene.onTextureRemovedObservable.notifyObservers(this);
            this._scene = null;
            if (this._parentContainer) {
                var index_1 = this._parentContainer.textures.indexOf(this);
                if (index_1 > -1) {
                    this._parentContainer.textures.splice(index_1, 1);
                }
                this._parentContainer = null;
            }
        }
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.metadata = null;
        _super.prototype.dispose.call(this);
    };
    /**
     * Serialize the texture into a JSON representation that can be parsed later on.
     * @returns the JSON representation of the texture
     */
    BaseTexture.prototype.serialize = function () {
        if (!this.name) {
            return null;
        }
        var serializationObject = SerializationHelper.Serialize(this);
        // Animations
        SerializationHelper.AppendSerializedAnimations(this, serializationObject);
        return serializationObject;
    };
    /**
     * Helper function to be called back once a list of texture contains only ready textures.
     * @param textures Define the list of textures to wait for
     * @param callback Define the callback triggered once the entire list will be ready
     */
    BaseTexture.WhenAllReady = function (textures, callback) {
        var numRemaining = textures.length;
        if (numRemaining === 0) {
            callback();
            return;
        }
        for (var i = 0; i < textures.length; i++) {
            var texture = textures[i];
            if (texture.isReady()) {
                if (--numRemaining === 0) {
                    callback();
                }
            }
            else {
                var onLoadObservable = texture.onLoadObservable;
                if (onLoadObservable) {
                    onLoadObservable.addOnce(function () {
                        if (--numRemaining === 0) {
                            callback();
                        }
                    });
                }
                else {
                    if (--numRemaining === 0) {
                        callback();
                    }
                }
            }
        }
    };
    BaseTexture._IsScene = function (sceneOrEngine) {
        return sceneOrEngine.getClassName() === "Scene";
    };
    /**
     * Default anisotropic filtering level for the application.
     * It is set to 4 as a good tradeoff between perf and quality.
     */
    BaseTexture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = 4;
    __decorate([
        serialize()
    ], BaseTexture.prototype, "uniqueId", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "name", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "metadata", void 0);
    __decorate([
        serialize("hasAlpha")
    ], BaseTexture.prototype, "_hasAlpha", void 0);
    __decorate([
        serialize("getAlphaFromRGB")
    ], BaseTexture.prototype, "_getAlphaFromRGB", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "level", void 0);
    __decorate([
        serialize("coordinatesIndex")
    ], BaseTexture.prototype, "_coordinatesIndex", void 0);
    __decorate([
        serialize("coordinatesMode")
    ], BaseTexture.prototype, "_coordinatesMode", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "wrapU", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "wrapV", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "wrapR", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "anisotropicFilteringLevel", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "isCube", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "is3D", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "is2DArray", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "gammaSpace", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "invertZ", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "lodLevelInAlpha", void 0);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "lodGenerationOffset", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "lodGenerationScale", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "linearSpecularLOD", null);
    __decorate([
        serializeAsTexture()
    ], BaseTexture.prototype, "irradianceTexture", null);
    __decorate([
        serialize()
    ], BaseTexture.prototype, "isRenderTarget", void 0);
    return BaseTexture;
}(ThinTexture));
export { BaseTexture };
//# sourceMappingURL=baseTexture.js.map