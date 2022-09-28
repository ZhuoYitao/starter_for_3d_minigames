/** @hidden */
var WebGPURenderPassWrapper = /** @class */ (function () {
    function WebGPURenderPassWrapper() {
        this.colorAttachmentGPUTextures = [];
        this.reset();
    }
    WebGPURenderPassWrapper.prototype.reset = function (fullReset) {
        if (fullReset === void 0) { fullReset = false; }
        this.renderPass = null;
        if (fullReset) {
            this.renderPassDescriptor = null;
            this.colorAttachmentViewDescriptor = null;
            this.depthAttachmentViewDescriptor = null;
            this.colorAttachmentGPUTextures = [];
            this.depthTextureFormat = undefined;
        }
    };
    return WebGPURenderPassWrapper;
}());
export { WebGPURenderPassWrapper };
//# sourceMappingURL=webgpuRenderPassWrapper.js.map