import { __extends } from "tslib";
import { NativeEngine } from "../nativeEngine.js";
import { NativeDataStream } from "./nativeDataStream.js";
NativeEngine._createNativeDataStream = function () {
    if (_native.NativeDataStream.VALIDATION_ENABLED) {
        return new ValidatedNativeDataStream();
    }
    else {
        return new NativeDataStream();
    }
};
var ValidatedNativeDataStream = /** @class */ (function (_super) {
    __extends(ValidatedNativeDataStream, _super);
    function ValidatedNativeDataStream() {
        return _super.call(this) || this;
    }
    ValidatedNativeDataStream.prototype.writeUint32 = function (value) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_UINT_32);
        _super.prototype.writeUint32.call(this, value);
    };
    ValidatedNativeDataStream.prototype.writeInt32 = function (value) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_INT_32);
        _super.prototype.writeInt32.call(this, value);
    };
    ValidatedNativeDataStream.prototype.writeFloat32 = function (value) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_FLOAT_32);
        _super.prototype.writeFloat32.call(this, value);
    };
    ValidatedNativeDataStream.prototype.writeUint32Array = function (values) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_UINT_32_ARRAY);
        _super.prototype.writeUint32Array.call(this, values);
    };
    ValidatedNativeDataStream.prototype.writeInt32Array = function (values) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_INT_32_ARRAY);
        _super.prototype.writeInt32Array.call(this, values);
    };
    ValidatedNativeDataStream.prototype.writeFloat32Array = function (values) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_FLOAT_32_ARRAY);
        _super.prototype.writeFloat32Array.call(this, values);
    };
    ValidatedNativeDataStream.prototype.writeNativeData = function (handle) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_NATIVE_DATA);
        _super.prototype.writeNativeData.call(this, handle);
    };
    ValidatedNativeDataStream.prototype.writeBoolean = function (value) {
        _super.prototype.writeUint32.call(this, _native.NativeDataStream.VALIDATION_BOOLEAN);
        _super.prototype.writeBoolean.call(this, value);
    };
    return ValidatedNativeDataStream;
}(NativeDataStream));
export { ValidatedNativeDataStream };
//# sourceMappingURL=validatedNativeDataStream.js.map