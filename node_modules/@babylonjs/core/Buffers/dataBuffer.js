/**
 * Class used to store gfx data (like WebGLBuffer)
 */
var DataBuffer = /** @class */ (function () {
    /**
     * Constructs the buffer
     */
    function DataBuffer() {
        /**
         * Gets or sets the number of objects referencing this buffer
         */
        this.references = 0;
        /** Gets or sets the size of the underlying buffer */
        this.capacity = 0;
        /**
         * Gets or sets a boolean indicating if the buffer contains 32bits indices
         */
        this.is32Bits = false;
        this.uniqueId = DataBuffer._Counter++;
    }
    Object.defineProperty(DataBuffer.prototype, "underlyingResource", {
        /**
         * Gets the underlying buffer
         */
        get: function () {
            return null;
        },
        enumerable: false,
        configurable: true
    });
    DataBuffer._Counter = 0;
    return DataBuffer;
}());
export { DataBuffer };
//# sourceMappingURL=dataBuffer.js.map