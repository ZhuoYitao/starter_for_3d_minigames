/** @hidden */
var NativeDataStream = /** @class */ (function () {
    function NativeDataStream() {
        var _this = this;
        var buffer = new ArrayBuffer(NativeDataStream.DEFAULT_BUFFER_SIZE);
        this._uint32s = new Uint32Array(buffer);
        this._int32s = new Int32Array(buffer);
        this._float32s = new Float32Array(buffer);
        this._length = NativeDataStream.DEFAULT_BUFFER_SIZE / 4;
        this._position = 0;
        this._nativeDataStream = new _native.NativeDataStream(function () {
            _this._flush();
        });
    }
    NativeDataStream.prototype.writeUint32 = function (value) {
        this._flushIfNecessary(1);
        this._uint32s[this._position++] = value;
    };
    NativeDataStream.prototype.writeInt32 = function (value) {
        this._flushIfNecessary(1);
        this._int32s[this._position++] = value;
    };
    NativeDataStream.prototype.writeFloat32 = function (value) {
        this._flushIfNecessary(1);
        this._float32s[this._position++] = value;
    };
    NativeDataStream.prototype.writeUint32Array = function (values) {
        this._flushIfNecessary(1 + values.length);
        this._uint32s[this._position++] = values.length;
        this._uint32s.set(values, this._position);
        this._position += values.length;
    };
    NativeDataStream.prototype.writeInt32Array = function (values) {
        this._flushIfNecessary(1 + values.length);
        this._uint32s[this._position++] = values.length;
        this._int32s.set(values, this._position);
        this._position += values.length;
    };
    NativeDataStream.prototype.writeFloat32Array = function (values) {
        this._flushIfNecessary(1 + values.length);
        this._uint32s[this._position++] = values.length;
        this._float32s.set(values, this._position);
        this._position += values.length;
    };
    NativeDataStream.prototype.writeNativeData = function (handle) {
        this._flushIfNecessary(handle.length);
        this._uint32s.set(handle, this._position);
        this._position += handle.length;
    };
    NativeDataStream.prototype.writeBoolean = function (value) {
        this.writeUint32(value ? 1 : 0);
    };
    NativeDataStream.prototype._flushIfNecessary = function (required) {
        if (this._position + required > this._length) {
            this._flush();
        }
    };
    NativeDataStream.prototype._flush = function () {
        this._nativeDataStream.writeBuffer(this._uint32s.buffer, this._position);
        this._position = 0;
    };
    // Must be multiple of 4!
    // eslint-disable-next-line @typescript-eslint/naming-convention
    NativeDataStream.DEFAULT_BUFFER_SIZE = 65536;
    return NativeDataStream;
}());
export { NativeDataStream };
//# sourceMappingURL=nativeDataStream.js.map