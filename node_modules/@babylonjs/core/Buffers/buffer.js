import { DataBuffer } from "./dataBuffer.js";
import { SliceTools } from "../Misc/sliceTools.js";
/**
 * Class used to store data that will be store in GPU memory
 */
var Buffer = /** @class */ (function () {
    /**
     * Constructor
     * @param engine the engine
     * @param data the data to use for this buffer
     * @param updatable whether the data is updatable
     * @param stride the stride (optional)
     * @param postponeInternalCreation whether to postpone creating the internal WebGL buffer (optional)
     * @param instanced whether the buffer is instanced (optional)
     * @param useBytes set to true if the stride in in bytes (optional)
     * @param divisor sets an optional divisor for instances (1 by default)
     */
    function Buffer(engine, data, updatable, stride, postponeInternalCreation, instanced, useBytes, divisor) {
        if (stride === void 0) { stride = 0; }
        if (postponeInternalCreation === void 0) { postponeInternalCreation = false; }
        if (instanced === void 0) { instanced = false; }
        if (useBytes === void 0) { useBytes = false; }
        this._isAlreadyOwned = false;
        if (engine.getScene) {
            // old versions of VertexBuffer accepted 'mesh' instead of 'engine'
            this._engine = engine.getScene().getEngine();
        }
        else {
            this._engine = engine;
        }
        this._updatable = updatable;
        this._instanced = instanced;
        this._divisor = divisor || 1;
        if (data instanceof DataBuffer) {
            this._data = null;
            this._buffer = data;
        }
        else {
            this._data = data;
            this._buffer = null;
        }
        this.byteStride = useBytes ? stride : stride * Float32Array.BYTES_PER_ELEMENT;
        if (!postponeInternalCreation) {
            // by default
            this.create();
        }
    }
    /**
     * Create a new VertexBuffer based on the current buffer
     * @param kind defines the vertex buffer kind (position, normal, etc.)
     * @param offset defines offset in the buffer (0 by default)
     * @param size defines the size in floats of attributes (position is 3 for instance)
     * @param stride defines the stride size in floats in the buffer (the offset to apply to reach next value when data is interleaved)
     * @param instanced defines if the vertex buffer contains indexed data
     * @param useBytes defines if the offset and stride are in bytes     *
     * @param divisor sets an optional divisor for instances (1 by default)
     * @returns the new vertex buffer
     */
    Buffer.prototype.createVertexBuffer = function (kind, offset, size, stride, instanced, useBytes, divisor) {
        if (useBytes === void 0) { useBytes = false; }
        var byteOffset = useBytes ? offset : offset * Float32Array.BYTES_PER_ELEMENT;
        var byteStride = stride ? (useBytes ? stride : stride * Float32Array.BYTES_PER_ELEMENT) : this.byteStride;
        // a lot of these parameters are ignored as they are overridden by the buffer
        return new VertexBuffer(this._engine, this, kind, this._updatable, true, byteStride, instanced === undefined ? this._instanced : instanced, byteOffset, size, undefined, undefined, true, this._divisor || divisor);
    };
    // Properties
    /**
     * Gets a boolean indicating if the Buffer is updatable?
     * @returns true if the buffer is updatable
     */
    Buffer.prototype.isUpdatable = function () {
        return this._updatable;
    };
    /**
     * Gets current buffer's data
     * @returns a DataArray or null
     */
    Buffer.prototype.getData = function () {
        return this._data;
    };
    /**
     * Gets underlying native buffer
     * @returns underlying native buffer
     */
    Buffer.prototype.getBuffer = function () {
        return this._buffer;
    };
    /**
     * Gets the stride in float32 units (i.e. byte stride / 4).
     * May not be an integer if the byte stride is not divisible by 4.
     * @returns the stride in float32 units
     * @deprecated Please use byteStride instead.
     */
    Buffer.prototype.getStrideSize = function () {
        return this.byteStride / Float32Array.BYTES_PER_ELEMENT;
    };
    // Methods
    /**
     * Store data into the buffer. Creates the buffer if not used already.
     * If the buffer was already used, it will be updated only if it is updatable, otherwise it will do nothing.
     * @param data defines the data to store
     */
    Buffer.prototype.create = function (data) {
        if (data === void 0) { data = null; }
        if (!data && this._buffer) {
            return; // nothing to do
        }
        data = data || this._data;
        if (!data) {
            return;
        }
        if (!this._buffer) {
            // create buffer
            if (this._updatable) {
                this._buffer = this._engine.createDynamicVertexBuffer(data);
                this._data = data;
            }
            else {
                this._buffer = this._engine.createVertexBuffer(data);
            }
        }
        else if (this._updatable) {
            // update buffer
            this._engine.updateDynamicVertexBuffer(this._buffer, data);
            this._data = data;
        }
    };
    /** @hidden */
    Buffer.prototype._rebuild = function () {
        this._buffer = null;
        this.create(this._data);
    };
    /**
     * Update current buffer data
     * @param data defines the data to store
     */
    Buffer.prototype.update = function (data) {
        this.create(data);
    };
    /**
     * Updates the data directly.
     * @param data the new data
     * @param offset the new offset
     * @param vertexCount the vertex count (optional)
     * @param useBytes set to true if the offset is in bytes
     */
    Buffer.prototype.updateDirectly = function (data, offset, vertexCount, useBytes) {
        if (useBytes === void 0) { useBytes = false; }
        if (!this._buffer) {
            return;
        }
        if (this._updatable) {
            // update buffer
            this._engine.updateDynamicVertexBuffer(this._buffer, data, useBytes ? offset : offset * Float32Array.BYTES_PER_ELEMENT, vertexCount ? vertexCount * this.byteStride : undefined);
            if (offset === 0 && vertexCount === undefined) {
                // Keep the data if we easily can
                this._data = data;
            }
            else {
                this._data = null;
            }
        }
    };
    /** @hidden */
    Buffer.prototype._increaseReferences = function () {
        if (!this._buffer) {
            return;
        }
        if (!this._isAlreadyOwned) {
            this._isAlreadyOwned = true;
            return;
        }
        this._buffer.references++;
    };
    /**
     * Release all resources
     */
    Buffer.prototype.dispose = function () {
        if (!this._buffer) {
            return;
        }
        if (this._engine._releaseBuffer(this._buffer)) {
            this._buffer = null;
            this._data = null;
        }
    };
    return Buffer;
}());
export { Buffer };
/**
 * Specialized buffer used to store vertex data
 */
var VertexBuffer = /** @class */ (function () {
    /**
     * Constructor
     * @param engine the engine
     * @param data the data to use for this vertex buffer
     * @param kind the vertex buffer kind
     * @param updatable whether the data is updatable
     * @param postponeInternalCreation whether to postpone creating the internal WebGL buffer (optional)
     * @param stride the stride (optional)
     * @param instanced whether the buffer is instanced (optional)
     * @param offset the offset of the data (optional)
     * @param size the number of components (optional)
     * @param type the type of the component (optional)
     * @param normalized whether the data contains normalized data (optional)
     * @param useBytes set to true if stride and offset are in bytes (optional)
     * @param divisor defines the instance divisor to use (1 by default)
     * @param takeBufferOwnership defines if the buffer should be released when the vertex buffer is disposed
     */
    function VertexBuffer(engine, data, kind, updatable, postponeInternalCreation, stride, instanced, offset, size, type, normalized, useBytes, divisor, takeBufferOwnership) {
        if (normalized === void 0) { normalized = false; }
        if (useBytes === void 0) { useBytes = false; }
        if (divisor === void 0) { divisor = 1; }
        if (takeBufferOwnership === void 0) { takeBufferOwnership = false; }
        if (data instanceof Buffer) {
            this._buffer = data;
            this._ownsBuffer = takeBufferOwnership;
        }
        else {
            this._buffer = new Buffer(engine, data, updatable, stride, postponeInternalCreation, instanced, useBytes);
            this._ownsBuffer = true;
        }
        this.uniqueId = VertexBuffer._Counter++;
        this._kind = kind;
        if (type == undefined) {
            var data_1 = this.getData();
            this.type = VertexBuffer.FLOAT;
            if (data_1 instanceof Int8Array) {
                this.type = VertexBuffer.BYTE;
            }
            else if (data_1 instanceof Uint8Array) {
                this.type = VertexBuffer.UNSIGNED_BYTE;
            }
            else if (data_1 instanceof Int16Array) {
                this.type = VertexBuffer.SHORT;
            }
            else if (data_1 instanceof Uint16Array) {
                this.type = VertexBuffer.UNSIGNED_SHORT;
            }
            else if (data_1 instanceof Int32Array) {
                this.type = VertexBuffer.INT;
            }
            else if (data_1 instanceof Uint32Array) {
                this.type = VertexBuffer.UNSIGNED_INT;
            }
        }
        else {
            this.type = type;
        }
        var typeByteLength = VertexBuffer.GetTypeByteLength(this.type);
        if (useBytes) {
            this._size = size || (stride ? stride / typeByteLength : VertexBuffer.DeduceStride(kind));
            this.byteStride = stride || this._buffer.byteStride || this._size * typeByteLength;
            this.byteOffset = offset || 0;
        }
        else {
            this._size = size || stride || VertexBuffer.DeduceStride(kind);
            this.byteStride = stride ? stride * typeByteLength : this._buffer.byteStride || this._size * typeByteLength;
            this.byteOffset = (offset || 0) * typeByteLength;
        }
        this.normalized = normalized;
        this._instanced = instanced !== undefined ? instanced : false;
        this._instanceDivisor = instanced ? divisor : 0;
        this._computeHashCode();
    }
    Object.defineProperty(VertexBuffer.prototype, "instanceDivisor", {
        /**
         * Gets or sets the instance divisor when in instanced mode
         */
        get: function () {
            return this._instanceDivisor;
        },
        set: function (value) {
            this._instanceDivisor = value;
            if (value == 0) {
                this._instanced = false;
            }
            else {
                this._instanced = true;
            }
            this._computeHashCode();
        },
        enumerable: false,
        configurable: true
    });
    VertexBuffer.prototype._computeHashCode = function () {
        // note: cast to any because the property is declared readonly
        this.hashCode =
            ((this.type - 5120) << 0) +
                ((this.normalized ? 1 : 0) << 3) +
                (this._size << 4) +
                ((this._instanced ? 1 : 0) << 6) +
                /* keep 5 bits free */
                (this.byteStride << 12);
    };
    /** @hidden */
    VertexBuffer.prototype._rebuild = function () {
        if (!this._buffer) {
            return;
        }
        this._buffer._rebuild();
    };
    /**
     * Returns the kind of the VertexBuffer (string)
     * @returns a string
     */
    VertexBuffer.prototype.getKind = function () {
        return this._kind;
    };
    // Properties
    /**
     * Gets a boolean indicating if the VertexBuffer is updatable?
     * @returns true if the buffer is updatable
     */
    VertexBuffer.prototype.isUpdatable = function () {
        return this._buffer.isUpdatable();
    };
    /**
     * Gets current buffer's data
     * @returns a DataArray or null
     */
    VertexBuffer.prototype.getData = function () {
        return this._buffer.getData();
    };
    /**
     * Gets current buffer's data as a float array. Float data is constructed if the vertex buffer data cannot be returned directly.
     * @param totalVertices number of vertices in the buffer to take into account
     * @param forceCopy defines a boolean indicating that the returned array must be cloned upon returning it
     * @returns a float array containing vertex data
     */
    VertexBuffer.prototype.getFloatData = function (totalVertices, forceCopy) {
        var data = this.getData();
        if (!data) {
            return null;
        }
        var tightlyPackedByteStride = this.getSize() * VertexBuffer.GetTypeByteLength(this.type);
        var count = totalVertices * this.getSize();
        if (this.type !== VertexBuffer.FLOAT || this.byteStride !== tightlyPackedByteStride) {
            var copy_1 = new Float32Array(count);
            this.forEach(count, function (value, index) { return (copy_1[index] = value); });
            return copy_1;
        }
        if (!(data instanceof Array || data instanceof Float32Array) || this.byteOffset !== 0 || data.length !== count) {
            if (data instanceof Array) {
                var offset = this.byteOffset / 4;
                return SliceTools.Slice(data, offset, offset + count);
            }
            else if (data instanceof ArrayBuffer) {
                return new Float32Array(data, this.byteOffset, count);
            }
            else {
                var offset = data.byteOffset + this.byteOffset;
                if (forceCopy) {
                    var result = new Float32Array(count);
                    var source = new Float32Array(data.buffer, offset, count);
                    result.set(source);
                    return result;
                }
                // Protect against bad data
                var remainder = offset % 4;
                if (remainder) {
                    offset = Math.max(0, offset - remainder);
                }
                return new Float32Array(data.buffer, offset, count);
            }
        }
        if (forceCopy) {
            return SliceTools.Slice(data);
        }
        return data;
    };
    /**
     * Gets underlying native buffer
     * @returns underlying native buffer
     */
    VertexBuffer.prototype.getBuffer = function () {
        return this._buffer.getBuffer();
    };
    /**
     * Gets the stride in float32 units (i.e. byte stride / 4).
     * May not be an integer if the byte stride is not divisible by 4.
     * @returns the stride in float32 units
     * @deprecated Please use byteStride instead.
     */
    VertexBuffer.prototype.getStrideSize = function () {
        return this.byteStride / VertexBuffer.GetTypeByteLength(this.type);
    };
    /**
     * Returns the offset as a multiple of the type byte length.
     * @returns the offset in bytes
     * @deprecated Please use byteOffset instead.
     */
    VertexBuffer.prototype.getOffset = function () {
        return this.byteOffset / VertexBuffer.GetTypeByteLength(this.type);
    };
    /**
     * Returns the number of components or the byte size per vertex attribute
     * @param sizeInBytes If true, returns the size in bytes or else the size in number of components of the vertex attribute (default: false)
     * @returns the number of components
     */
    VertexBuffer.prototype.getSize = function (sizeInBytes) {
        if (sizeInBytes === void 0) { sizeInBytes = false; }
        return sizeInBytes ? this._size * VertexBuffer.GetTypeByteLength(this.type) : this._size;
    };
    /**
     * Gets a boolean indicating is the internal buffer of the VertexBuffer is instanced
     * @returns true if this buffer is instanced
     */
    VertexBuffer.prototype.getIsInstanced = function () {
        return this._instanced;
    };
    /**
     * Returns the instancing divisor, zero for non-instanced (integer).
     * @returns a number
     */
    VertexBuffer.prototype.getInstanceDivisor = function () {
        return this._instanceDivisor;
    };
    // Methods
    /**
     * Store data into the buffer. If the buffer was already used it will be either recreated or updated depending on isUpdatable property
     * @param data defines the data to store
     */
    VertexBuffer.prototype.create = function (data) {
        this._buffer.create(data);
    };
    /**
     * Updates the underlying buffer according to the passed numeric array or Float32Array.
     * This function will create a new buffer if the current one is not updatable
     * @param data defines the data to store
     */
    VertexBuffer.prototype.update = function (data) {
        this._buffer.update(data);
    };
    /**
     * Updates directly the underlying WebGLBuffer according to the passed numeric array or Float32Array.
     * Returns the directly updated WebGLBuffer.
     * @param data the new data
     * @param offset the new offset
     * @param useBytes set to true if the offset is in bytes
     */
    VertexBuffer.prototype.updateDirectly = function (data, offset, useBytes) {
        if (useBytes === void 0) { useBytes = false; }
        this._buffer.updateDirectly(data, offset, undefined, useBytes);
    };
    /**
     * Disposes the VertexBuffer and the underlying WebGLBuffer.
     */
    VertexBuffer.prototype.dispose = function () {
        if (this._ownsBuffer) {
            this._buffer.dispose();
        }
    };
    /**
     * Enumerates each value of this vertex buffer as numbers.
     * @param count the number of values to enumerate
     * @param callback the callback function called for each value
     */
    VertexBuffer.prototype.forEach = function (count, callback) {
        VertexBuffer.ForEach(this._buffer.getData(), this.byteOffset, this.byteStride, this._size, this.type, count, this.normalized, callback);
    };
    /**
     * Deduces the stride given a kind.
     * @param kind The kind string to deduce
     * @returns The deduced stride
     */
    VertexBuffer.DeduceStride = function (kind) {
        switch (kind) {
            case VertexBuffer.UVKind:
            case VertexBuffer.UV2Kind:
            case VertexBuffer.UV3Kind:
            case VertexBuffer.UV4Kind:
            case VertexBuffer.UV5Kind:
            case VertexBuffer.UV6Kind:
                return 2;
            case VertexBuffer.NormalKind:
            case VertexBuffer.PositionKind:
                return 3;
            case VertexBuffer.ColorKind:
            case VertexBuffer.MatricesIndicesKind:
            case VertexBuffer.MatricesIndicesExtraKind:
            case VertexBuffer.MatricesWeightsKind:
            case VertexBuffer.MatricesWeightsExtraKind:
            case VertexBuffer.TangentKind:
                return 4;
            default:
                throw new Error("Invalid kind '" + kind + "'");
        }
    };
    /**
     * Gets the byte length of the given type.
     * @param type the type
     * @returns the number of bytes
     */
    VertexBuffer.GetTypeByteLength = function (type) {
        switch (type) {
            case VertexBuffer.BYTE:
            case VertexBuffer.UNSIGNED_BYTE:
                return 1;
            case VertexBuffer.SHORT:
            case VertexBuffer.UNSIGNED_SHORT:
                return 2;
            case VertexBuffer.INT:
            case VertexBuffer.UNSIGNED_INT:
            case VertexBuffer.FLOAT:
                return 4;
            default:
                throw new Error("Invalid type '".concat(type, "'"));
        }
    };
    /**
     * Enumerates each value of the given parameters as numbers.
     * @param data the data to enumerate
     * @param byteOffset the byte offset of the data
     * @param byteStride the byte stride of the data
     * @param componentCount the number of components per element
     * @param componentType the type of the component
     * @param count the number of values to enumerate
     * @param normalized whether the data is normalized
     * @param callback the callback function called for each value
     */
    VertexBuffer.ForEach = function (data, byteOffset, byteStride, componentCount, componentType, count, normalized, callback) {
        if (data instanceof Array) {
            var offset = byteOffset / 4;
            var stride = byteStride / 4;
            for (var index = 0; index < count; index += componentCount) {
                for (var componentIndex = 0; componentIndex < componentCount; componentIndex++) {
                    callback(data[offset + componentIndex], index + componentIndex);
                }
                offset += stride;
            }
        }
        else {
            var dataView = data instanceof ArrayBuffer ? new DataView(data) : new DataView(data.buffer, data.byteOffset, data.byteLength);
            var componentByteLength = VertexBuffer.GetTypeByteLength(componentType);
            for (var index = 0; index < count; index += componentCount) {
                var componentByteOffset = byteOffset;
                for (var componentIndex = 0; componentIndex < componentCount; componentIndex++) {
                    var value = VertexBuffer._GetFloatValue(dataView, componentType, componentByteOffset, normalized);
                    callback(value, index + componentIndex);
                    componentByteOffset += componentByteLength;
                }
                byteOffset += byteStride;
            }
        }
    };
    VertexBuffer._GetFloatValue = function (dataView, type, byteOffset, normalized) {
        switch (type) {
            case VertexBuffer.BYTE: {
                var value = dataView.getInt8(byteOffset);
                if (normalized) {
                    value = Math.max(value / 127, -1);
                }
                return value;
            }
            case VertexBuffer.UNSIGNED_BYTE: {
                var value = dataView.getUint8(byteOffset);
                if (normalized) {
                    value = value / 255;
                }
                return value;
            }
            case VertexBuffer.SHORT: {
                var value = dataView.getInt16(byteOffset, true);
                if (normalized) {
                    value = Math.max(value / 32767, -1);
                }
                return value;
            }
            case VertexBuffer.UNSIGNED_SHORT: {
                var value = dataView.getUint16(byteOffset, true);
                if (normalized) {
                    value = value / 65535;
                }
                return value;
            }
            case VertexBuffer.INT: {
                return dataView.getInt32(byteOffset, true);
            }
            case VertexBuffer.UNSIGNED_INT: {
                return dataView.getUint32(byteOffset, true);
            }
            case VertexBuffer.FLOAT: {
                return dataView.getFloat32(byteOffset, true);
            }
            default: {
                throw new Error("Invalid component type ".concat(type));
            }
        }
    };
    VertexBuffer._Counter = 0;
    /**
     * The byte type.
     */
    VertexBuffer.BYTE = 5120;
    /**
     * The unsigned byte type.
     */
    VertexBuffer.UNSIGNED_BYTE = 5121;
    /**
     * The short type.
     */
    VertexBuffer.SHORT = 5122;
    /**
     * The unsigned short type.
     */
    VertexBuffer.UNSIGNED_SHORT = 5123;
    /**
     * The integer type.
     */
    VertexBuffer.INT = 5124;
    /**
     * The unsigned integer type.
     */
    VertexBuffer.UNSIGNED_INT = 5125;
    /**
     * The float type.
     */
    VertexBuffer.FLOAT = 5126;
    // Enums
    /**
     * Positions
     */
    VertexBuffer.PositionKind = "position";
    /**
     * Normals
     */
    VertexBuffer.NormalKind = "normal";
    /**
     * Tangents
     */
    VertexBuffer.TangentKind = "tangent";
    /**
     * Texture coordinates
     */
    VertexBuffer.UVKind = "uv";
    /**
     * Texture coordinates 2
     */
    VertexBuffer.UV2Kind = "uv2";
    /**
     * Texture coordinates 3
     */
    VertexBuffer.UV3Kind = "uv3";
    /**
     * Texture coordinates 4
     */
    VertexBuffer.UV4Kind = "uv4";
    /**
     * Texture coordinates 5
     */
    VertexBuffer.UV5Kind = "uv5";
    /**
     * Texture coordinates 6
     */
    VertexBuffer.UV6Kind = "uv6";
    /**
     * Colors
     */
    VertexBuffer.ColorKind = "color";
    /**
     * Instance Colors
     */
    VertexBuffer.ColorInstanceKind = "instanceColor";
    /**
     * Matrix indices (for bones)
     */
    VertexBuffer.MatricesIndicesKind = "matricesIndices";
    /**
     * Matrix weights (for bones)
     */
    VertexBuffer.MatricesWeightsKind = "matricesWeights";
    /**
     * Additional matrix indices (for bones)
     */
    VertexBuffer.MatricesIndicesExtraKind = "matricesIndicesExtra";
    /**
     * Additional matrix weights (for bones)
     */
    VertexBuffer.MatricesWeightsExtraKind = "matricesWeightsExtra";
    return VertexBuffer;
}());
export { VertexBuffer };
//# sourceMappingURL=buffer.js.map