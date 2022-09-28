import { DataBuffer } from "../../Buffers/dataBuffer";
/** @hidden */
export declare class WebGPUDataBuffer extends DataBuffer {
    private _buffer;
    constructor(resource: GPUBuffer);
    get underlyingResource(): any;
}
