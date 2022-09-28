/** @hidden */
var WebGPUComputePipelineContext = /** @class */ (function () {
    function WebGPUComputePipelineContext(engine) {
        this._name = "unnamed";
        this.engine = engine;
    }
    Object.defineProperty(WebGPUComputePipelineContext.prototype, "isAsync", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUComputePipelineContext.prototype, "isReady", {
        get: function () {
            if (this.stage) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUComputePipelineContext.prototype._getComputeShaderCode = function () {
        var _a;
        return (_a = this.sources) === null || _a === void 0 ? void 0 : _a.compute;
    };
    WebGPUComputePipelineContext.prototype.dispose = function () { };
    return WebGPUComputePipelineContext;
}());
export { WebGPUComputePipelineContext };
//# sourceMappingURL=webgpuComputePipelineContext.js.map