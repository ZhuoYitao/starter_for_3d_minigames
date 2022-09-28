import { __decorate } from "tslib";

import { SerializationHelper, serialize } from "../Misc/decorators.js";
/**
 * Class that holds the different stencil states of a material
 * Usage example: https://playground.babylonjs.com/#CW5PRI#10
 */
var MaterialStencilState = /** @class */ (function () {
    /**
     * Creates a material stencil state instance
     */
    function MaterialStencilState() {
        this.reset();
    }
    /**
     * Resets all the stencil states to default values
     */
    MaterialStencilState.prototype.reset = function () {
        this.enabled = false;
        this.mask = 0xff;
        this.func = 519;
        this.funcRef = 1;
        this.funcMask = 0xff;
        this.opStencilFail = 7680;
        this.opDepthFail = 7680;
        this.opStencilDepthPass = 7681;
    };
    Object.defineProperty(MaterialStencilState.prototype, "func", {
        /**
         * Gets or sets the stencil function
         */
        get: function () {
            return this._func;
        },
        set: function (value) {
            this._func = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "funcRef", {
        /**
         * Gets or sets the stencil function reference
         */
        get: function () {
            return this._funcRef;
        },
        set: function (value) {
            this._funcRef = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "funcMask", {
        /**
         * Gets or sets the stencil function mask
         */
        get: function () {
            return this._funcMask;
        },
        set: function (value) {
            this._funcMask = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "opStencilFail", {
        /**
         * Gets or sets the operation when the stencil test fails
         */
        get: function () {
            return this._opStencilFail;
        },
        set: function (value) {
            this._opStencilFail = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "opDepthFail", {
        /**
         * Gets or sets the operation when the depth test fails
         */
        get: function () {
            return this._opDepthFail;
        },
        set: function (value) {
            this._opDepthFail = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "opStencilDepthPass", {
        /**
         * Gets or sets the operation when the stencil+depth test succeeds
         */
        get: function () {
            return this._opStencilDepthPass;
        },
        set: function (value) {
            this._opStencilDepthPass = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "mask", {
        /**
         * Gets or sets the stencil mask
         */
        get: function () {
            return this._mask;
        },
        set: function (value) {
            this._mask = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MaterialStencilState.prototype, "enabled", {
        /**
         * Enables or disables the stencil test
         */
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the current class name, useful for serialization or dynamic coding.
     * @returns "MaterialStencilState"
     */
    MaterialStencilState.prototype.getClassName = function () {
        return "MaterialStencilState";
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param stencilState defines stencil state where to copy the info
     */
    MaterialStencilState.prototype.copyTo = function (stencilState) {
        SerializationHelper.Clone(function () { return stencilState; }, this);
    };
    /**
     * Serializes this stencil configuration.
     * @returns - An object with the serialized config.
     */
    MaterialStencilState.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a stencil state configuration from a serialized object.
     * @param source - Serialized object.
     * @param scene Defines the scene we are parsing for
     * @param rootUrl Defines the rootUrl to load from
     */
    MaterialStencilState.prototype.parse = function (source, scene, rootUrl) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "func", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "funcRef", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "funcMask", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "opStencilFail", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "opDepthFail", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "opStencilDepthPass", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "mask", null);
    __decorate([
        serialize()
    ], MaterialStencilState.prototype, "enabled", null);
    return MaterialStencilState;
}());
export { MaterialStencilState };
//# sourceMappingURL=materialStencilState.js.map