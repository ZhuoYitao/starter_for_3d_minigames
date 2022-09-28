/**
 * Class used to provide helpers for slicing
 */
var SliceTools = /** @class */ (function () {
    function SliceTools() {
    }
    /**
     * Provides a slice function that will work even on IE
     * @param data defines the array to slice
     * @param start defines the start of the data (optional)
     * @param end defines the end of the data (optional)
     * @returns the new sliced array
     */
    SliceTools.Slice = function (data, start, end) {
        if (data.slice) {
            return data.slice(start, end);
        }
        return Array.prototype.slice.call(data, start, end);
    };
    /**
     * Provides a slice function that will work even on IE
     * The difference between this and Slice is that this will force-convert to array
     * @param data defines the array to slice
     * @param start defines the start of the data (optional)
     * @param end defines the end of the data (optional)
     * @returns the new sliced array
     */
    SliceTools.SliceToArray = function (data, start, end) {
        if (Array.isArray(data)) {
            return data.slice(start, end);
        }
        return Array.prototype.slice.call(data, start, end);
    };
    return SliceTools;
}());
export { SliceTools };
//# sourceMappingURL=sliceTools.js.map