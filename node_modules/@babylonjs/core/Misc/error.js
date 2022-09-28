import { __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Base error. Due to limitations of typedoc-check and missing documentation
 * in lib.es5.d.ts, cannot extend Error directly for RuntimeError.
 * @ignore
 */
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // See https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
    // and https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // Polyfill for Object.setPrototypeOf if necessary.
    BaseError._setPrototypeOf = Object.setPrototypeOf ||
        (function (o, proto) {
            o.__proto__ = proto;
            return o;
        });
    return BaseError;
}(Error));
export { BaseError };
/* IMP! DO NOT CHANGE THE NUMBERING OF EXISTING ERROR CODES */
/**
 * Error codes for BaseError
 */
export var ErrorCodes = {
    // Mesh errors 0-999
    /** Invalid or empty mesh vertex positions. */
    MeshInvalidPositionsError: 0,
    // Texture errors 1000-1999
    /** Unsupported texture found. */
    UnsupportedTextureError: 1000,
    // GLTFLoader errors 2000-2999
    /** Unexpected magic number found in GLTF file header. */
    GLTFLoaderUnexpectedMagicError: 2000,
    // SceneLoader errors 3000-3999
    /** SceneLoader generic error code. Ideally wraps the inner exception. */
    SceneLoaderError: 3000,
    // File related errors 4000-4999
    /** Load file error */
    LoadFileError: 4000,
    /** Request file error */
    RequestFileError: 4001,
    /** Read file error */
    ReadFileError: 4002,
};
/**
 * Application runtime error
 */
var RuntimeError = /** @class */ (function (_super) {
    __extends(RuntimeError, _super);
    /**
     * Creates a new RuntimeError
     * @param message defines the message of the error
     * @param errorCode the error code
     * @param innerError the error that caused the outer error
     */
    function RuntimeError(message, errorCode, innerError) {
        var _this = _super.call(this, message) || this;
        _this.errorCode = errorCode;
        _this.innerError = innerError;
        _this.name = "RuntimeError";
        BaseError._setPrototypeOf(_this, RuntimeError.prototype);
        return _this;
    }
    return RuntimeError;
}(BaseError));
export { RuntimeError };
//# sourceMappingURL=error.js.map