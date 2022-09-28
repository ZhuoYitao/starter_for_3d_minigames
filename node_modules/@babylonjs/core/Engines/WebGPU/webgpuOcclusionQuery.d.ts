import type { WebGPUEngine } from "../webgpuEngine";
import type { WebGPUBufferManager } from "./webgpuBufferManager";
/** @hidden */
export declare class WebGPUOcclusionQuery {
    private _engine;
    private _device;
    private _bufferManager;
    private _currentTotalIndices;
    private _countIncrement;
    private _querySet;
    private _availableIndices;
    private _lastBuffer;
    private _frameLastBuffer;
    get querySet(): GPUQuerySet;
    get hasQueries(): boolean;
    get canBeginQuery(): boolean;
    constructor(engine: WebGPUEngine, device: GPUDevice, bufferManager: WebGPUBufferManager, startCount?: number, incrementCount?: number);
    createQuery(): number;
    deleteQuery(index: number): void;
    isQueryResultAvailable(index: number): boolean;
    getQueryResult(index: number): number;
    private _retrieveQueryBuffer;
    private _allocateNewIndices;
    private _delayQuerySetDispose;
    dispose(): void;
}
