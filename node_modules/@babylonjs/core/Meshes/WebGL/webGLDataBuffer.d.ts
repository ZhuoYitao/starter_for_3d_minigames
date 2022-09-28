import { DataBuffer } from "../../Buffers/dataBuffer";
/** @hidden */
export declare class WebGLDataBuffer extends DataBuffer {
    private _buffer;
    constructor(resource: WebGLBuffer);
    get underlyingResource(): any;
}
