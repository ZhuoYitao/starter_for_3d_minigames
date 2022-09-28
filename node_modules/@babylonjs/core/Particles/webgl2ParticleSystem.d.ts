import type { VertexBuffer, Buffer } from "../Buffers/buffer";
import type { ThinEngine } from "../Engines/thinEngine";
import type { IGPUParticleSystemPlatform } from "./IGPUParticleSystemPlatform";
import type { GPUParticleSystem } from "./gpuParticleSystem";
import type { DataArray } from "../types";
import type { DataBuffer } from "../Buffers/dataBuffer";
import { UniformBufferEffectCommonAccessor } from "../Materials/uniformBufferEffectCommonAccessor";
import "../Shaders/gpuUpdateParticles.fragment";
import "../Shaders/gpuUpdateParticles.vertex";
/** @hidden */
export declare class WebGL2ParticleSystem implements IGPUParticleSystemPlatform {
    private _parent;
    private _engine;
    private _updateEffect;
    private _updateEffectOptions;
    private _renderVAO;
    private _updateVAO;
    readonly alignDataInBuffer = false;
    constructor(parent: GPUParticleSystem, engine: ThinEngine);
    isUpdateBufferCreated(): boolean;
    isUpdateBufferReady(): boolean;
    createUpdateBuffer(defines: string): UniformBufferEffectCommonAccessor;
    createVertexBuffers(updateBuffer: Buffer, renderVertexBuffers: {
        [key: string]: VertexBuffer;
    }): void;
    createParticleBuffer(data: number[]): DataArray | DataBuffer;
    bindDrawBuffers(index: number): void;
    preUpdateParticleBuffer(): void;
    updateParticleBuffer(index: number, targetBuffer: Buffer, currentActiveCount: number): void;
    releaseBuffers(): void;
    releaseVertexBuffers(): void;
    private _createUpdateVAO;
}
