import { Logger } from "../../Misc/logger.js";
import { ComputeBindingType } from "../Extensions/engine.computeShader.js";
import * as WebGPUConstants from "./webgpuConstants.js";
/** @hidden */
var WebGPUComputeContext = /** @class */ (function () {
    function WebGPUComputeContext(device, cacheSampler) {
        this._device = device;
        this._cacheSampler = cacheSampler;
        this.uniqueId = WebGPUComputeContext._Counter++;
        this._bindGroupEntries = [];
        this.clear();
    }
    WebGPUComputeContext.prototype.getBindGroups = function (bindings, computePipeline, bindingsMapping) {
        if (!bindingsMapping) {
            throw new Error("WebGPUComputeContext.getBindGroups: bindingsMapping is required until browsers support reflection for wgsl shaders!");
        }
        if (this._bindGroups.length === 0) {
            var bindGroupEntriesExist = this._bindGroupEntries.length > 0;
            for (var key in bindings) {
                var binding = bindings[key], location_1 = bindingsMapping[key], group = location_1.group, index = location_1.binding, type = binding.type, object = binding.object;
                var indexInGroupEntries = binding.indexInGroupEntries;
                var entries = this._bindGroupEntries[group];
                if (!entries) {
                    entries = this._bindGroupEntries[group] = [];
                }
                switch (type) {
                    case ComputeBindingType.Sampler: {
                        var sampler = object;
                        if (indexInGroupEntries !== undefined && bindGroupEntriesExist) {
                            entries[indexInGroupEntries].resource = this._cacheSampler.getSampler(sampler);
                        }
                        else {
                            binding.indexInGroupEntries = entries.length;
                            entries.push({
                                binding: index,
                                resource: this._cacheSampler.getSampler(sampler),
                            });
                        }
                        break;
                    }
                    case ComputeBindingType.Texture:
                    case ComputeBindingType.TextureWithoutSampler: {
                        var texture = object;
                        var hardwareTexture = texture._texture._hardwareTexture;
                        if (indexInGroupEntries !== undefined && bindGroupEntriesExist) {
                            if (type === ComputeBindingType.Texture) {
                                entries[indexInGroupEntries++].resource = this._cacheSampler.getSampler(texture._texture);
                            }
                            entries[indexInGroupEntries].resource = hardwareTexture.view;
                        }
                        else {
                            binding.indexInGroupEntries = entries.length;
                            if (type === ComputeBindingType.Texture) {
                                entries.push({
                                    binding: index - 1,
                                    resource: this._cacheSampler.getSampler(texture._texture),
                                });
                            }
                            entries.push({
                                binding: index,
                                resource: hardwareTexture.view,
                            });
                        }
                        break;
                    }
                    case ComputeBindingType.StorageTexture: {
                        var texture = object;
                        var hardwareTexture = texture._texture._hardwareTexture;
                        if ((hardwareTexture.textureAdditionalUsages & WebGPUConstants.TextureUsage.StorageBinding) === 0) {
                            Logger.Error("computeDispatch: The texture (name=".concat(texture.name, ", uniqueId=").concat(texture.uniqueId, ") is not a storage texture!"), 50);
                        }
                        if (indexInGroupEntries !== undefined && bindGroupEntriesExist) {
                            entries[indexInGroupEntries].resource = hardwareTexture.viewForWriting;
                        }
                        else {
                            binding.indexInGroupEntries = entries.length;
                            entries.push({
                                binding: index,
                                resource: hardwareTexture.viewForWriting,
                            });
                        }
                        break;
                    }
                    case ComputeBindingType.UniformBuffer:
                    case ComputeBindingType.StorageBuffer: {
                        var buffer = type === ComputeBindingType.UniformBuffer ? object : object;
                        var dataBuffer = buffer.getBuffer();
                        var webgpuBuffer = dataBuffer.underlyingResource;
                        if (indexInGroupEntries !== undefined && bindGroupEntriesExist) {
                            entries[indexInGroupEntries].resource.buffer = webgpuBuffer;
                            entries[indexInGroupEntries].resource.size = dataBuffer.capacity;
                        }
                        else {
                            binding.indexInGroupEntries = entries.length;
                            entries.push({
                                binding: index,
                                resource: {
                                    buffer: webgpuBuffer,
                                    offset: 0,
                                    size: dataBuffer.capacity,
                                },
                            });
                        }
                        break;
                    }
                }
            }
            for (var i = 0; i < this._bindGroupEntries.length; ++i) {
                var entries = this._bindGroupEntries[i];
                if (!entries) {
                    this._bindGroups[i] = undefined;
                    continue;
                }
                this._bindGroups[i] = this._device.createBindGroup({
                    layout: computePipeline.getBindGroupLayout(i),
                    entries: entries,
                });
            }
            this._bindGroups.length = this._bindGroupEntries.length;
        }
        return this._bindGroups;
    };
    WebGPUComputeContext.prototype.clear = function () {
        this._bindGroups = [];
        // Don't reset _bindGroupEntries if they have already been created, they are still ok even if we have to clear _bindGroups (the layout of the compute shader can't change once created)
    };
    WebGPUComputeContext._Counter = 0;
    return WebGPUComputeContext;
}());
export { WebGPUComputeContext };
//# sourceMappingURL=webgpuComputeContext.js.map