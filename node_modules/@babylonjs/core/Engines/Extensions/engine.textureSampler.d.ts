import type { Nullable } from "../../types";
declare type TextureSampler = import("../../Materials/Textures/textureSampler").TextureSampler;
declare module "../../Engines/thinEngine" {
    interface ThinEngine {
        /**
         * Sets a texture sampler to the according uniform.
         * @param name The name of the uniform in the effect
         * @param sampler The sampler to apply
         */
        setTextureSampler(name: string, sampler: Nullable<TextureSampler>): void;
    }
}
export {};
