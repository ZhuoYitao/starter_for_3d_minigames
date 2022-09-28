var growthFactor = 1.5;
/**
 * A class acting as a dynamic float32array used in the performance viewer
 */
var DynamicFloat32Array = /** @class */ (function () {
    /**
     * Creates a new DynamicFloat32Array with the desired item capacity.
     * @param itemCapacity The initial item capacity you would like to set for the array.
     */
    function DynamicFloat32Array(itemCapacity) {
        this._view = new Float32Array(itemCapacity);
        this._itemLength = 0;
    }
    Object.defineProperty(DynamicFloat32Array.prototype, "itemLength", {
        /**
         * The number of items currently in the array.
         */
        get: function () {
            return this._itemLength;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets value at index, NaN if no such index exists.
     * @param index the index to get the value at.
     * @returns the value at the index provided.
     */
    DynamicFloat32Array.prototype.at = function (index) {
        if (index < 0 || index >= this._itemLength) {
            return NaN;
        }
        return this._view[index];
    };
    /**
     * Gets a view of the original array from start to end (exclusive of end).
     * @param start starting index.
     * @param end ending index.
     * @returns a subarray of the original array.
     */
    DynamicFloat32Array.prototype.subarray = function (start, end) {
        if (start >= end || start < 0) {
            return new Float32Array(0);
        }
        if (end > this._itemLength) {
            end = this._itemLength;
        }
        return this._view.subarray(start, end);
    };
    /**
     * Pushes items to the end of the array.
     * @param item The item to push into the array.
     */
    DynamicFloat32Array.prototype.push = function (item) {
        this._view[this._itemLength] = item;
        this._itemLength++;
        if (this._itemLength >= this._view.length) {
            this._growArray();
        }
    };
    /**
     * Grows the array by the growth factor when necessary.
     */
    DynamicFloat32Array.prototype._growArray = function () {
        var newCapacity = Math.floor(this._view.length * growthFactor);
        var view = new Float32Array(newCapacity);
        view.set(this._view);
        this._view = view;
    };
    return DynamicFloat32Array;
}());
export { DynamicFloat32Array };
//# sourceMappingURL=dynamicFloat32Array.js.map