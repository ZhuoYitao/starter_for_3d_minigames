import { __assign } from "tslib";
import * as WebGPUConstants from "./webgpuConstants.js";

var filterToBits = [
    0 | (0 << 1) | (0 << 2),
    0 | (0 << 1) | (0 << 2),
    1 | (1 << 1) | (0 << 2),
    1 | (1 << 1) | (1 << 2),
    0 | (0 << 1) | (0 << 2),
    0 | (1 << 1) | (0 << 2),
    0 | (1 << 1) | (1 << 2),
    0 | (1 << 1) | (0 << 2),
    0 | (0 << 1) | (1 << 2),
    1 | (0 << 1) | (0 << 2),
    1 | (0 << 1) | (1 << 2),
    1 | (1 << 1) | (0 << 2),
    1 | (0 << 1) | (0 << 2), // TEXTURE_LINEAR_NEAREST
];
// subtract 0x01FF from the comparison function value before indexing this array!
var comparisonFunctionToBits = [
    (0 << 3) | (0 << 4) | (0 << 5) | (0 << 6),
    (0 << 3) | (0 << 4) | (0 << 5) | (1 << 6),
    (0 << 3) | (0 << 4) | (1 << 5) | (0 << 6),
    (0 << 3) | (0 << 4) | (1 << 5) | (1 << 6),
    (0 << 3) | (1 << 4) | (0 << 5) | (0 << 6),
    (0 << 3) | (1 << 4) | (0 << 5) | (1 << 6),
    (0 << 3) | (1 << 4) | (1 << 5) | (0 << 6),
    (0 << 3) | (1 << 4) | (1 << 5) | (1 << 6),
    (1 << 3) | (0 << 4) | (0 << 5) | (0 << 6), // ALWAYS
];
var filterNoMipToBits = [
    0 << 7,
    1 << 7,
    1 << 7,
    0 << 7,
    0 << 7,
    0 << 7,
    0 << 7,
    1 << 7,
    0 << 7,
    0 << 7,
    0 << 7,
    0 << 7,
    1 << 7, // TEXTURE_LINEAR_NEAREST
];
/** @hidden */
var WebGPUCacheSampler = /** @class */ (function () {
    function WebGPUCacheSampler(device) {
        this._samplers = {};
        this._device = device;
        this.disabled = false;
    }
    WebGPUCacheSampler.GetSamplerHashCode = function (sampler) {
        var _a, _b, _c;
        // The WebGPU spec currently only allows values 1 and 4 for anisotropy
        var anisotropy = sampler._cachedAnisotropicFilteringLevel && sampler._cachedAnisotropicFilteringLevel > 1 ? 4 : 1;
        var code = filterToBits[sampler.samplingMode] +
            comparisonFunctionToBits[(sampler._comparisonFunction || 0x0202) - 0x0200 + 1] +
            filterNoMipToBits[sampler.samplingMode] + // handle the lodMinClamp = lodMaxClamp = 0 case when no filter used for mip mapping
            (((_a = sampler._cachedWrapU) !== null && _a !== void 0 ? _a : 1) << 8) +
            (((_b = sampler._cachedWrapV) !== null && _b !== void 0 ? _b : 1) << 10) +
            (((_c = sampler._cachedWrapR) !== null && _c !== void 0 ? _c : 1) << 12) +
            ((sampler.useMipMaps ? 1 : 0) << 14) + // need to factor this in because _getSamplerFilterDescriptor depends on samplingMode AND useMipMaps!
            (anisotropy << 15);
        return code;
    };
    WebGPUCacheSampler._GetSamplerFilterDescriptor = function (sampler, anisotropy) {
        var magFilter, minFilter, mipmapFilter, lodMinClamp, lodMaxClamp;
        var useMipMaps = sampler.useMipMaps;
        switch (sampler.samplingMode) {
            case 11:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Linear;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    lodMinClamp = lodMaxClamp = 0;
                }
                break;
            case 3:
            case 3:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Linear;
                if (!useMipMaps) {
                    mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                    lodMinClamp = lodMaxClamp = 0;
                }
                else {
                    mipmapFilter = WebGPUConstants.FilterMode.Linear;
                }
                break;
            case 8:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                    lodMinClamp = lodMaxClamp = 0;
                }
                else {
                    mipmapFilter = WebGPUConstants.FilterMode.Linear;
                }
                break;
            case 4:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    lodMinClamp = lodMaxClamp = 0;
                }
                break;
            case 5:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Linear;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    lodMinClamp = lodMaxClamp = 0;
                }
                break;
            case 6:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Linear;
                if (!useMipMaps) {
                    mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                    lodMinClamp = lodMaxClamp = 0;
                }
                else {
                    mipmapFilter = WebGPUConstants.FilterMode.Linear;
                }
                break;
            case 7:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Linear;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                lodMinClamp = lodMaxClamp = 0;
                break;
            case 1:
            case 1:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                lodMinClamp = lodMaxClamp = 0;
                break;
            case 9:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    lodMinClamp = lodMaxClamp = 0;
                }
                break;
            case 10:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                if (!useMipMaps) {
                    mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                    lodMinClamp = lodMaxClamp = 0;
                }
                else {
                    mipmapFilter = WebGPUConstants.FilterMode.Linear;
                }
                break;
            case 2:
            case 2:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Linear;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                lodMinClamp = lodMaxClamp = 0;
                break;
            case 12:
                magFilter = WebGPUConstants.FilterMode.Linear;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                lodMinClamp = lodMaxClamp = 0;
                break;
            default:
                magFilter = WebGPUConstants.FilterMode.Nearest;
                minFilter = WebGPUConstants.FilterMode.Nearest;
                mipmapFilter = WebGPUConstants.FilterMode.Nearest;
                lodMinClamp = lodMaxClamp = 0;
                break;
        }
        if (anisotropy > 1 && (lodMinClamp !== 0 || lodMaxClamp !== 0)) {
            return {
                magFilter: WebGPUConstants.FilterMode.Linear,
                minFilter: WebGPUConstants.FilterMode.Linear,
                mipmapFilter: WebGPUConstants.FilterMode.Linear,
                anisotropyEnabled: true,
            };
        }
        return {
            magFilter: magFilter,
            minFilter: minFilter,
            mipmapFilter: mipmapFilter,
            lodMinClamp: lodMinClamp,
            lodMaxClamp: lodMaxClamp,
        };
    };
    WebGPUCacheSampler._GetWrappingMode = function (mode) {
        switch (mode) {
            case 1:
                return WebGPUConstants.AddressMode.Repeat;
            case 0:
                return WebGPUConstants.AddressMode.ClampToEdge;
            case 2:
                return WebGPUConstants.AddressMode.MirrorRepeat;
        }
        return WebGPUConstants.AddressMode.Repeat;
    };
    WebGPUCacheSampler._GetSamplerWrappingDescriptor = function (sampler) {
        return {
            addressModeU: this._GetWrappingMode(sampler._cachedWrapU),
            addressModeV: this._GetWrappingMode(sampler._cachedWrapV),
            addressModeW: this._GetWrappingMode(sampler._cachedWrapR),
        };
    };
    WebGPUCacheSampler._GetSamplerDescriptor = function (sampler) {
        // The WebGPU spec currently only allows values 1 and 4 for anisotropy
        var anisotropy = sampler.useMipMaps && sampler._cachedAnisotropicFilteringLevel && sampler._cachedAnisotropicFilteringLevel > 1 ? 4 : 1;
        var filterDescriptor = this._GetSamplerFilterDescriptor(sampler, anisotropy);
        return __assign(__assign(__assign({}, filterDescriptor), this._GetSamplerWrappingDescriptor(sampler)), { compare: sampler._comparisonFunction ? WebGPUCacheSampler.GetCompareFunction(sampler._comparisonFunction) : undefined, maxAnisotropy: filterDescriptor.anisotropyEnabled ? anisotropy : 1 });
    };
    WebGPUCacheSampler.GetCompareFunction = function (compareFunction) {
        switch (compareFunction) {
            case 519:
                return WebGPUConstants.CompareFunction.Always;
            case 514:
                return WebGPUConstants.CompareFunction.Equal;
            case 516:
                return WebGPUConstants.CompareFunction.Greater;
            case 518:
                return WebGPUConstants.CompareFunction.GreaterEqual;
            case 513:
                return WebGPUConstants.CompareFunction.Less;
            case 515:
                return WebGPUConstants.CompareFunction.LessEqual;
            case 512:
                return WebGPUConstants.CompareFunction.Never;
            case 517:
                return WebGPUConstants.CompareFunction.NotEqual;
            default:
                return WebGPUConstants.CompareFunction.Less;
        }
    };
    WebGPUCacheSampler.prototype.getSampler = function (sampler, bypassCache, hash) {
        if (bypassCache === void 0) { bypassCache = false; }
        if (hash === void 0) { hash = 0; }
        if (this.disabled) {
            return this._device.createSampler(WebGPUCacheSampler._GetSamplerDescriptor(sampler));
        }
        if (bypassCache) {
            hash = 0;
        }
        else if (hash === 0) {
            hash = WebGPUCacheSampler.GetSamplerHashCode(sampler);
        }
        var gpuSampler = bypassCache ? undefined : this._samplers[hash];
        if (!gpuSampler) {
            gpuSampler = this._device.createSampler(WebGPUCacheSampler._GetSamplerDescriptor(sampler));
            if (!bypassCache) {
                this._samplers[hash] = gpuSampler;
            }
        }
        return gpuSampler;
    };
    return WebGPUCacheSampler;
}());
export { WebGPUCacheSampler };
//# sourceMappingURL=webgpuCacheSampler.js.map