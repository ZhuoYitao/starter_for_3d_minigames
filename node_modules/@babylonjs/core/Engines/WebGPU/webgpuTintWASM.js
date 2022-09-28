import { __assign, __awaiter, __generator } from "tslib";
import { IsWindowObjectExist } from "../../Misc/domManagement.js";
import { Tools } from "../../Misc/tools.js";
/** @hidden */
var WebGPUTintWASM = /** @class */ (function () {
    function WebGPUTintWASM() {
        this._twgsl = null;
    }
    WebGPUTintWASM.prototype.initTwgsl = function (twgslOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        twgslOptions = twgslOptions || {};
                        twgslOptions = __assign(__assign({}, WebGPUTintWASM._TWgslDefaultOptions), twgslOptions);
                        if (twgslOptions.twgsl) {
                            this._twgsl = twgslOptions.twgsl;
                            return [2 /*return*/, Promise.resolve()];
                        }
                        if (!(twgslOptions.jsPath && twgslOptions.wasmPath)) return [3 /*break*/, 3];
                        if (!IsWindowObjectExist()) return [3 /*break*/, 2];
                        return [4 /*yield*/, Tools.LoadScriptAsync(twgslOptions.jsPath)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        importScripts(twgslOptions.jsPath);
                        _b.label = 3;
                    case 3:
                        if (!self.twgsl) return [3 /*break*/, 5];
                        _a = this;
                        return [4 /*yield*/, self.twgsl(twgslOptions.wasmPath)];
                    case 4:
                        _a._twgsl = _b.sent();
                        return [2 /*return*/, Promise.resolve()];
                    case 5: return [2 /*return*/, Promise.reject("twgsl is not available.")];
                }
            });
        });
    };
    WebGPUTintWASM.prototype.convertSpirV2WGSL = function (code) {
        return this._twgsl.convertSpirV2WGSL(code);
    };
    // Default twgsl options.
    WebGPUTintWASM._TWgslDefaultOptions = {
        jsPath: "https://preview.babylonjs.com/twgsl/twgsl.js",
        wasmPath: "https://preview.babylonjs.com/twgsl/twgsl.wasm",
    };
    return WebGPUTintWASM;
}());
export { WebGPUTintWASM };
//# sourceMappingURL=webgpuTintWASM.js.map