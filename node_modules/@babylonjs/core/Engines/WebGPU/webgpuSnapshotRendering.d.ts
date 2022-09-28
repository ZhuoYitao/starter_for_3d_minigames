import type { Nullable } from "../../types";
import type { WebGPUEngine } from "../webgpuEngine";
import type { WebGPUBundleList } from "./webgpuBundleList";
import type { WebGPUHardwareTexture } from "./webgpuHardwareTexture";
/** @hidden */
export declare class WebGPUSnapshotRendering {
    private _engine;
    private _record;
    private _play;
    private _mainPassBundleList;
    private _modeSaved;
    private _bundleList;
    private _bundleListRenderTarget;
    private _enabled;
    private _mode;
    constructor(engine: WebGPUEngine, renderingMode: number, bundleList: WebGPUBundleList, bundleListRenderTarget: WebGPUBundleList);
    get enabled(): boolean;
    get play(): boolean;
    get record(): boolean;
    set enabled(activate: boolean);
    get mode(): number;
    set mode(mode: number);
    endMainRenderPass(): void;
    endRenderTargetPass(currentRenderPass: GPURenderPassEncoder, gpuWrapper: WebGPUHardwareTexture): boolean;
    endFrame(mainRenderPass: Nullable<GPURenderPassEncoder>): void;
    reset(): void;
}
