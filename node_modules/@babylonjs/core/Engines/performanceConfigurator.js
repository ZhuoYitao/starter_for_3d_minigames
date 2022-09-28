/** @hidden */
var PerformanceConfigurator = /** @class */ (function () {
    function PerformanceConfigurator() {
    }
    /**
     * @param use64bits
     * @hidden
     */
    PerformanceConfigurator.SetMatrixPrecision = function (use64bits) {
        PerformanceConfigurator.MatrixTrackPrecisionChange = false;
        if (use64bits && !PerformanceConfigurator.MatrixUse64Bits) {
            if (PerformanceConfigurator.MatrixTrackedMatrices) {
                for (var m = 0; m < PerformanceConfigurator.MatrixTrackedMatrices.length; ++m) {
                    var matrix = PerformanceConfigurator.MatrixTrackedMatrices[m];
                    var values = matrix._m;
                    matrix._m = new Array(16);
                    for (var i = 0; i < 16; ++i) {
                        matrix._m[i] = values[i];
                    }
                }
            }
        }
        PerformanceConfigurator.MatrixUse64Bits = use64bits;
        PerformanceConfigurator.MatrixCurrentType = PerformanceConfigurator.MatrixUse64Bits ? Array : Float32Array;
        PerformanceConfigurator.MatrixTrackedMatrices = null; // reclaim some memory, as we don't need _TrackedMatrices anymore
    };
    /** @hidden */
    PerformanceConfigurator.MatrixUse64Bits = false;
    /** @hidden */
    PerformanceConfigurator.MatrixTrackPrecisionChange = true;
    /** @hidden */
    PerformanceConfigurator.MatrixCurrentType = Float32Array;
    /** @hidden */
    PerformanceConfigurator.MatrixTrackedMatrices = [];
    return PerformanceConfigurator;
}());
export { PerformanceConfigurator };
//# sourceMappingURL=performanceConfigurator.js.map