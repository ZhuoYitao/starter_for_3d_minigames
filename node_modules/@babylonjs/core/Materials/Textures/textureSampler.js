
/**
 * Class used to store a texture sampler data
 */
var TextureSampler = /** @class */ (function () {
    /**
     * Creates a Sampler instance
     */
    function TextureSampler() {
        /**
         * Gets the sampling mode of the texture
         */
        this.samplingMode = -1;
        this._useMipMaps = true;
        /** @hidden */
        this._cachedWrapU = null;
        /** @hidden */
        this._cachedWrapV = null;
        /** @hidden */
        this._cachedWrapR = null;
        /** @hidden */
        this._cachedAnisotropicFilteringLevel = null;
        /** @hidden */
        this._comparisonFunction = 0;
    }
    Object.defineProperty(TextureSampler.prototype, "wrapU", {
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        get: function () {
            return this._cachedWrapU;
        },
        set: function (value) {
            this._cachedWrapU = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureSampler.prototype, "wrapV", {
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        get: function () {
            return this._cachedWrapV;
        },
        set: function (value) {
            this._cachedWrapV = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureSampler.prototype, "wrapR", {
        /**
         * | Value | Type               | Description |
         * | ----- | ------------------ | ----------- |
         * | 0     | CLAMP_ADDRESSMODE  |             |
         * | 1     | WRAP_ADDRESSMODE   |             |
         * | 2     | MIRROR_ADDRESSMODE |             |
         */
        get: function () {
            return this._cachedWrapR;
        },
        set: function (value) {
            this._cachedWrapR = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureSampler.prototype, "anisotropicFilteringLevel", {
        /**
         * With compliant hardware and browser (supporting anisotropic filtering)
         * this defines the level of anisotropic filtering in the texture.
         * The higher the better but the slower.
         */
        get: function () {
            return this._cachedAnisotropicFilteringLevel;
        },
        set: function (value) {
            this._cachedAnisotropicFilteringLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureSampler.prototype, "comparisonFunction", {
        /**
         * Gets or sets the comparison function (513, 514, etc). Set 0 to not use a comparison function
         */
        get: function () {
            return this._comparisonFunction;
        },
        set: function (value) {
            this._comparisonFunction = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureSampler.prototype, "useMipMaps", {
        /**
         * Indicates to use the mip maps (if available on the texture).
         * Thanks to this flag, you can instruct the sampler to not sample the mipmaps even if they exist (and if the sampling mode is set to a value that normally samples the mipmaps!)
         */
        get: function () {
            return this._useMipMaps;
        },
        set: function (value) {
            this._useMipMaps = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets all the parameters of the sampler
     * @param wrapU u address mode (default: TEXTURE_WRAP_ADDRESSMODE)
     * @param wrapV v address mode (default: TEXTURE_WRAP_ADDRESSMODE)
     * @param wrapR r address mode (default: TEXTURE_WRAP_ADDRESSMODE)
     * @param anisotropicFilteringLevel anisotropic level (default: 1)
     * @param samplingMode sampling mode (default: 2)
     * @param comparisonFunction comparison function (default: 0 - no comparison function)
     * @returns the current sampler instance
     */
    TextureSampler.prototype.setParameters = function (wrapU, wrapV, wrapR, anisotropicFilteringLevel, samplingMode, comparisonFunction) {
        if (wrapU === void 0) { wrapU = 1; }
        if (wrapV === void 0) { wrapV = 1; }
        if (wrapR === void 0) { wrapR = 1; }
        if (anisotropicFilteringLevel === void 0) { anisotropicFilteringLevel = 1; }
        if (samplingMode === void 0) { samplingMode = 2; }
        if (comparisonFunction === void 0) { comparisonFunction = 0; }
        this._cachedWrapU = wrapU;
        this._cachedWrapV = wrapV;
        this._cachedWrapR = wrapR;
        this._cachedAnisotropicFilteringLevel = anisotropicFilteringLevel;
        this.samplingMode = samplingMode;
        this._comparisonFunction = comparisonFunction;
        return this;
    };
    /**
     * Compares this sampler with another one
     * @param other sampler to compare with
     * @returns true if the samplers have the same parametres, else false
     */
    TextureSampler.prototype.compareSampler = function (other) {
        return (this._cachedWrapU === other._cachedWrapU &&
            this._cachedWrapV === other._cachedWrapV &&
            this._cachedWrapR === other._cachedWrapR &&
            this._cachedAnisotropicFilteringLevel === other._cachedAnisotropicFilteringLevel &&
            this.samplingMode === other.samplingMode &&
            this._comparisonFunction === other._comparisonFunction &&
            this._useMipMaps === other._useMipMaps);
    };
    return TextureSampler;
}());
export { TextureSampler };
//# sourceMappingURL=textureSampler.js.map