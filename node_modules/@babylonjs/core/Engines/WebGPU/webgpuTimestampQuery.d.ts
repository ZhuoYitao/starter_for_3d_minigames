import type { WebGPUBufferManager } from "./webgpuBufferManager";
import { PerfCounter } from "../../Misc/perfCounter";
/** @hidden */
export declare class WebGPUTimestampQuery {
    private _device;
    private _bufferManager;
    private _enabled;
    private _gpuFrameTimeCounter;
    private _measureDuration;
    private _measureDurationState;
    get gpuFrameTimeCounter(): PerfCounter;
    constructor(device: GPUDevice, bufferManager: WebGPUBufferManager);
    get enable(): boolean;
    set enable(value: boolean);
    startFrame(commandEncoder: GPUCommandEncoder): void;
    endFrame(commandEncoder: GPUCommandEncoder): void;
}
/** @hidden */
export declare class WebGPUDurationMeasure {
    private _querySet;
    constructor(device: GPUDevice, bufferManager: WebGPUBufferManager);
    start(encoder: GPUCommandEncoder): void;
    stop(encoder: GPUCommandEncoder): Promise<number | null>;
    dispose(): void;
}
