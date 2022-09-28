
import { Size } from "../../Maths/math.size.js";
/**
 * Base class of all the textures in babylon.
 * It groups all the common properties required to work with Thin Engine.
 */
var ThinTexture = /** @class */ (function () {
    /**
     * Instantiates a new ThinTexture.
     * Base class of all the textures in babylon.
     * This can be used as an internal texture wrapper in ThinEngine to benefit from the cache
     * @param internalTexture Define the internalTexture to wrap
     */
    function ThinTexture(internalTexture) {
        this._wrapU = 1;
        this._wrapV = 1;
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        this.wrapR = 1;
        /**
         * With compliant hardware and browser (supporting anisotropic filtering)
         * this defines the level of anisotropic filtering in the texture.
         * The higher the better but the slower. This defaults to 4 as it seems to be the best tradeoff.
         */
        this.anisotropicFilteringLevel = 4;
        /**
         * Define the current state of the loading sequence when in delayed load mode.
         */
        this.delayLoadState = 0;
        /** @hidden */
        this._texture = null;
        this._engine = null;
        this._cachedSize = Size.Zero();
        this._cachedBaseSize = Size.Zero();
        /** @hidden */
        this._initialSamplingMode = 2;
        this._texture = internalTexture;
        if (this._texture) {
            this._engine = this._texture.getEngine();
        }
    }
    Object.defineProperty(ThinTexture.prototype, "wrapU", {
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
    Object.defineProperty(ThinTexture.prototype, "wrapV", {
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
    Object.defineProperty(ThinTexture.prototype, "coordinatesMode", {
        /**
         * How a texture is mapped.
         * Unused in thin texture mode.
         */
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinTexture.prototype, "isCube", {
        /**
         * Define if the texture is a cube texture or if false a 2d texture.
         */
        get: function () {
            if (!this._texture) {
                return false;
            }
            return this._texture.isCube;
        },
        set: function (value) {
            if (!this._texture) {
                return;
            }
            this._texture.isCube = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinTexture.prototype, "is3D", {
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
    Object.defineProperty(ThinTexture.prototype, "is2DArray", {
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
    /**
     * Get the class name of the texture.
     * @returns "ThinTexture"
     */
    ThinTexture.prototype.getClassName = function () {
        return "ThinTexture";
    };
    /**
     * Get if the texture is ready to be used (downloaded, converted, mip mapped...).
     * @returns true if fully ready
     */
    ThinTexture.prototype.isReady = function () {
        if (this.delayLoadState === 4) {
            this.delayLoad();
            return false;
        }
        if (this._texture) {
            return this._texture.isReady;
        }
        return false;
    };
    /**
     * Triggers the load sequence in delayed load mode.
     */
    ThinTexture.prototype.delayLoad = function () { };
    /**
     * Get the underlying lower level texture from Babylon.
     * @returns the internal texture
     */
    ThinTexture.prototype.getInternalTexture = function () {
        return this._texture;
    };
    /**
     * Get the size of the texture.
     * @returns the texture size.
     */
    ThinTexture.prototype.getSize = function () {
        if (this._texture) {
            if (this._texture.width) {
                this._cachedSize.width = this._texture.width;
                this._cachedSize.height = this._texture.height;
                return this._cachedSize;
            }
            if (this._texture._size) {
                this._cachedSize.width = this._texture._size;
                this._cachedSize.height = this._texture._size;
                return this._cachedSize;
            }
        }
        return this._cachedSize;
    };
    /**
     * Get the base size of the texture.
     * It can be different from the size if the texture has been resized for POT for instance
     * @returns the base size
     */
    ThinTexture.prototype.getBaseSize = function () {
        if (!this.isReady() || !this._texture) {
            this._cachedBaseSize.width = 0;
            this._cachedBaseSize.height = 0;
            return this._cachedBaseSize;
        }
        if (this._texture._size) {
            this._cachedBaseSize.width = this._texture._size;
            this._cachedBaseSize.height = this._texture._size;
            return this._cachedBaseSize;
        }
        this._cachedBaseSize.width = this._texture.baseWidth;
        this._cachedBaseSize.height = this._texture.baseHeight;
        return this._cachedBaseSize;
    };
    Object.defineProperty(ThinTexture.prototype, "samplingMode", {
        /**
         * Get the current sampling mode associated with the texture.
         */
        get: function () {
            if (!this._texture) {
                return this._initialSamplingMode;
            }
            return this._texture.samplingMode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update the sampling mode of the texture.
     * Default is Trilinear mode.
     *
     * | Value | Type               | Description |
     * | ----- | ------------------ | ----------- |
     * | 1     | NEAREST_SAMPLINGMODE or NEAREST_NEAREST_MIPLINEAR  | Nearest is: mag = nearest, min = nearest, mip = linear |
     * | 2     | BILINEAR_SAMPLINGMODE or LINEAR_LINEAR_MIPNEAREST | Bilinear is: mag = linear, min = linear, mip = nearest |
     * | 3     | TRILINEAR_SAMPLINGMODE or LINEAR_LINEAR_MIPLINEAR | Trilinear is: mag = linear, min = linear, mip = linear |
     * | 4     | NEAREST_NEAREST_MIPNEAREST |             |
     * | 5    | NEAREST_LINEAR_MIPNEAREST |             |
     * | 6    | NEAREST_LINEAR_MIPLINEAR |             |
     * | 7    | NEAREST_LINEAR |             |
     * | 8    | NEAREST_NEAREST |             |
     * | 9   | LINEAR_NEAREST_MIPNEAREST |             |
     * | 10   | LINEAR_NEAREST_MIPLINEAR |             |
     * | 11   | LINEAR_LINEAR |             |
     * | 12   | LINEAR_NEAREST |             |
     *
     *    > _mag_: magnification filter (close to the viewer)
     *    > _min_: minification filter (far from the viewer)
     *    > _mip_: filter used between mip map levels
     *@param samplingMode Define the new sampling mode of the texture
     */
    ThinTexture.prototype.updateSamplingMode = function (samplingMode) {
        if (this._texture && this._engine) {
            this._engine.updateTextureSamplingMode(samplingMode, this._texture);
        }
    };
    /**
     * Release and destroy the underlying lower level texture aka internalTexture.
     */
    ThinTexture.prototype.releaseInternalTexture = function () {
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    ThinTexture.prototype.dispose = function () {
        if (this._texture) {
            this.releaseInternalTexture();
            this._engine = null;
        }
    };
    return ThinTexture;
}());
export { ThinTexture };
//# sourceMappingURL=thinTexture.js.map