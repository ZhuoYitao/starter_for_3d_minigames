import type { WebGPUBufferManager } from "./webgpuBufferManager";
import type { QueryType } from "./webgpuConstants";
/** @hidden */
export declare class WebGPUQuerySet {
    private _device;
    private _bufferManager;
    private _count;
    private _canUseMultipleBuffers;
    private _querySet;
    private _queryBuffer;
    private _dstBuffers;
    get querySet(): GPUQuerySet;
    constructor(count: number, type: QueryType, device: GPUDevice, bufferManager: WebGPUBufferManager, canUseMultipleBuffers?: boolean);
    private _getBuffer;
    readValues(firstQuery?: number, queryCount?: number): Promise<BigUint64Array | null>;
    readValue(firstQuery?: number): Promise<number | null>;
    readTwoValuesAndSubtract(firstQuery?: number): Promise<number | null>;
    dispose(): void;
}
