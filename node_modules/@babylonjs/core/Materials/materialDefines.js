/**
 * Manages the defines for the Material
 */
var MaterialDefines = /** @class */ (function () {
    /**
     * Creates a new instance
     * @param externalProperties list of external properties to inject into the object
     */
    function MaterialDefines(externalProperties) {
        this._isDirty = true;
        /** @hidden */
        this._areLightsDirty = true;
        /** @hidden */
        this._areLightsDisposed = false;
        /** @hidden */
        this._areAttributesDirty = true;
        /** @hidden */
        this._areTexturesDirty = true;
        /** @hidden */
        this._areFresnelDirty = true;
        /** @hidden */
        this._areMiscDirty = true;
        /** @hidden */
        this._arePrePassDirty = true;
        /** @hidden */
        this._areImageProcessingDirty = true;
        /** @hidden */
        this._normals = false;
        /** @hidden */
        this._uvs = false;
        /** @hidden */
        this._needNormals = false;
        /** @hidden */
        this._needUVs = false;
        this._externalProperties = externalProperties;
        // Initialize External Properties
        if (externalProperties) {
            for (var prop in externalProperties) {
                if (Object.prototype.hasOwnProperty.call(externalProperties, prop)) {
                    this._setDefaultValue(prop);
                }
            }
        }
    }
    Object.defineProperty(MaterialDefines.prototype, "isDirty", {
        /**
         * Specifies if the material needs to be re-calculated
         */
        get: function () {
            return this._isDirty;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Marks the material to indicate that it has been re-calculated
     */
    MaterialDefines.prototype.markAsProcessed = function () {
        this._isDirty = false;
        this._areAttributesDirty = false;
        this._areTexturesDirty = false;
        this._areFresnelDirty = false;
        this._areLightsDirty = false;
        this._areLightsDisposed = false;
        this._areMiscDirty = false;
        this._arePrePassDirty = false;
        this._areImageProcessingDirty = false;
    };
    /**
     * Marks the material to indicate that it needs to be re-calculated
     */
    MaterialDefines.prototype.markAsUnprocessed = function () {
        this._isDirty = true;
    };
    /**
     * Marks the material to indicate all of its defines need to be re-calculated
     */
    MaterialDefines.prototype.markAllAsDirty = function () {
        this._areTexturesDirty = true;
        this._areAttributesDirty = true;
        this._areLightsDirty = true;
        this._areFresnelDirty = true;
        this._areMiscDirty = true;
        this._areImageProcessingDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the material to indicate that image processing needs to be re-calculated
     */
    MaterialDefines.prototype.markAsImageProcessingDirty = function () {
        this._areImageProcessingDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the material to indicate the lights need to be re-calculated
     * @param disposed Defines whether the light is dirty due to dispose or not
     */
    MaterialDefines.prototype.markAsLightDirty = function (disposed) {
        if (disposed === void 0) { disposed = false; }
        this._areLightsDirty = true;
        this._areLightsDisposed = this._areLightsDisposed || disposed;
        this._isDirty = true;
    };
    /**
     * Marks the attribute state as changed
     */
    MaterialDefines.prototype.markAsAttributesDirty = function () {
        this._areAttributesDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the texture state as changed
     */
    MaterialDefines.prototype.markAsTexturesDirty = function () {
        this._areTexturesDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the fresnel state as changed
     */
    MaterialDefines.prototype.markAsFresnelDirty = function () {
        this._areFresnelDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the misc state as changed
     */
    MaterialDefines.prototype.markAsMiscDirty = function () {
        this._areMiscDirty = true;
        this._isDirty = true;
    };
    /**
     * Marks the prepass state as changed
     */
    MaterialDefines.prototype.markAsPrePassDirty = function () {
        this._arePrePassDirty = true;
        this._isDirty = true;
    };
    /**
     * Rebuilds the material defines
     */
    MaterialDefines.prototype.rebuild = function () {
        this._keys = [];
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key[0] === "_") {
                continue;
            }
            this._keys.push(key);
        }
        if (this._externalProperties) {
            for (var name_1 in this._externalProperties) {
                if (this._keys.indexOf(name_1) === -1) {
                    this._keys.push(name_1);
                }
            }
        }
    };
    /**
     * Specifies if two material defines are equal
     * @param other - A material define instance to compare to
     * @returns - Boolean indicating if the material defines are equal (true) or not (false)
     */
    MaterialDefines.prototype.isEqual = function (other) {
        if (this._keys.length !== other._keys.length) {
            return false;
        }
        for (var index = 0; index < this._keys.length; index++) {
            var prop = this._keys[index];
            if (this[prop] !== other[prop]) {
                return false;
            }
        }
        return true;
    };
    /**
     * Clones this instance's defines to another instance
     * @param other - material defines to clone values to
     */
    MaterialDefines.prototype.cloneTo = function (other) {
        if (this._keys.length !== other._keys.length) {
            other._keys = this._keys.slice(0);
        }
        for (var index = 0; index < this._keys.length; index++) {
            var prop = this._keys[index];
            other[prop] = this[prop];
        }
    };
    /**
     * Resets the material define values
     */
    MaterialDefines.prototype.reset = function () {
        var _this = this;
        this._keys.forEach(function (prop) { return _this._setDefaultValue(prop); });
    };
    MaterialDefines.prototype._setDefaultValue = function (prop) {
        var _a, _b, _c, _d, _e;
        var type = (_c = (_b = (_a = this._externalProperties) === null || _a === void 0 ? void 0 : _a[prop]) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : typeof this[prop];
        var defValue = (_e = (_d = this._externalProperties) === null || _d === void 0 ? void 0 : _d[prop]) === null || _e === void 0 ? void 0 : _e.default;
        switch (type) {
            case "number":
                this[prop] = defValue !== null && defValue !== void 0 ? defValue : 0;
                break;
            case "string":
                this[prop] = defValue !== null && defValue !== void 0 ? defValue : "";
                break;
            default:
                this[prop] = defValue !== null && defValue !== void 0 ? defValue : false;
                break;
        }
    };
    /**
     * Converts the material define values to a string
     * @returns - String of material define information
     */
    MaterialDefines.prototype.toString = function () {
        var result = "";
        for (var index = 0; index < this._keys.length; index++) {
            var prop = this._keys[index];
            var value = this[prop];
            var type = typeof value;
            switch (type) {
                case "number":
                case "string":
                    result += "#define " + prop + " " + value + "\n";
                    break;
                default:
                    if (value) {
                        result += "#define " + prop + "\n";
                    }
                    break;
            }
        }
        return result;
    };
    return MaterialDefines;
}());
export { MaterialDefines };
//# sourceMappingURL=materialDefines.js.map