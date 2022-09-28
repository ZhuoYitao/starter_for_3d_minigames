import type { Nullable } from "../../../types";
declare module "../../webgpuEngine" {
    interface WebGPUEngine {
        /** @hidden */
        _createComputePipelineStageDescriptor(computeShader: string, defines: Nullable<string>, entryPoint: string): GPUProgrammableStage;
    }
}
