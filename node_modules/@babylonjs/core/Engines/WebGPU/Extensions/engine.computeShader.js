import { ComputeEffect } from "../../../Compute/computeEffect.js";
import { WebGPUEngine } from "../../webgpuEngine.js";
import { WebGPUComputeContext } from "../webgpuComputeContext.js";
import { WebGPUComputePipelineContext } from "../webgpuComputePipelineContext.js";
WebGPUEngine.prototype.createComputeContext = function () {
    return new WebGPUComputeContext(this._device, this._cacheSampler);
};
WebGPUEngine.prototype.createComputeEffect = function (baseName, options) {
    var compute = baseName.computeElement || baseName.compute || baseName.computeToken || baseName.computeSource || baseName;
    var name = compute + "@" + options.defines;
    if (this._compiledComputeEffects[name]) {
        var compiledEffect = this._compiledComputeEffects[name];
        if (options.onCompiled && compiledEffect.isReady()) {
            options.onCompiled(compiledEffect);
        }
        return compiledEffect;
    }
    var effect = new ComputeEffect(baseName, options, this, name);
    this._compiledComputeEffects[name] = effect;
    return effect;
};
WebGPUEngine.prototype.createComputePipelineContext = function () {
    return new WebGPUComputePipelineContext(this);
};
WebGPUEngine.prototype.areAllComputeEffectsReady = function () {
    for (var key in this._compiledComputeEffects) {
        var effect = this._compiledComputeEffects[key];
        if (!effect.isReady()) {
            return false;
        }
    }
    return true;
};
WebGPUEngine.prototype.computeDispatch = function (effect, context, bindings, x, y, z, bindingsMapping) {
    var _this = this;
    if (this._currentRenderTarget) {
        // A render target pass is currently in effect (meaning beingRenderPass has been called on the command encoder this._renderTargetEncoder): we are not allowed to open
        // another pass on this command encoder (even if it's a compute pass) until endPass has been called, so we need to defer the compute pass for after the current render target pass is closed
        this._onAfterUnbindFrameBufferObservable.addOnce(function () {
            _this.computeDispatch(effect, context, bindings, x, y, z, bindingsMapping);
        });
        return;
    }
    var contextPipeline = effect._pipelineContext;
    var computeContext = context;
    if (!contextPipeline.computePipeline) {
        contextPipeline.computePipeline = this._device.createComputePipeline({
            compute: contextPipeline.stage,
        });
    }
    var commandEncoder = this._renderTargetEncoder;
    var computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(contextPipeline.computePipeline);
    var bindGroups = computeContext.getBindGroups(bindings, contextPipeline.computePipeline, bindingsMapping);
    for (var i = 0; i < bindGroups.length; ++i) {
        var bindGroup = bindGroups[i];
        if (!bindGroup) {
            continue;
        }
        computePass.setBindGroup(i, bindGroup);
    }
    computePass.dispatch(x, y, z);
    computePass.end();
};
WebGPUEngine.prototype.releaseComputeEffects = function () {
    for (var name_1 in this._compiledComputeEffects) {
        var webGPUPipelineContextCompute = this._compiledComputeEffects[name_1].getPipelineContext();
        this._deleteComputePipelineContext(webGPUPipelineContextCompute);
    }
    this._compiledComputeEffects = {};
};
WebGPUEngine.prototype._prepareComputePipelineContext = function (pipelineContext, computeSourceCode, rawComputeSourceCode, defines, entryPoint) {
    var webGpuContext = pipelineContext;
    if (this.dbgShowShaderCode) {
        console.log(defines);
        console.log(computeSourceCode);
    }
    webGpuContext.sources = {
        compute: computeSourceCode,
        rawCompute: rawComputeSourceCode,
    };
    webGpuContext.stage = this._createComputePipelineStageDescriptor(computeSourceCode, defines, entryPoint);
};
WebGPUEngine.prototype._releaseComputeEffect = function (effect) {
    if (this._compiledComputeEffects[effect._key]) {
        delete this._compiledComputeEffects[effect._key];
        this._deleteComputePipelineContext(effect.getPipelineContext());
    }
};
WebGPUEngine.prototype._rebuildComputeEffects = function () {
    for (var key in this._compiledComputeEffects) {
        var effect = this._compiledComputeEffects[key];
        effect._pipelineContext = null;
        effect._wasPreviouslyReady = false;
        effect._prepareEffect();
    }
};
WebGPUEngine.prototype._deleteComputePipelineContext = function (pipelineContext) {
    var webgpuPipelineContext = pipelineContext;
    if (webgpuPipelineContext) {
        pipelineContext.dispose();
    }
};
WebGPUEngine.prototype._createComputePipelineStageDescriptor = function (computeShader, defines, entryPoint) {
    if (defines) {
        defines = "//" + defines.split("\n").join("\n//") + "\n";
    }
    else {
        defines = "";
    }
    return {
        module: this._device.createShaderModule({
            code: defines + computeShader,
        }),
        entryPoint: entryPoint,
    };
};
//# sourceMappingURL=engine.computeShader.js.map