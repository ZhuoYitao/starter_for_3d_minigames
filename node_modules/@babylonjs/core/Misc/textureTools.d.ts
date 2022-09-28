import type { InternalTexture } from "../Materials/Textures/internalTexture";
import { Texture } from "../Materials/Textures/texture";
import type { Scene } from "../scene";
/**
 * Uses the GPU to create a copy texture rescaled at a given size
 * @param texture Texture to copy from
 * @param width defines the desired width
 * @param height defines the desired height
 * @param useBilinearMode defines if bilinear mode has to be used
 * @return the generated texture
 */
export declare function CreateResizedCopy(texture: Texture, width: number, height: number, useBilinearMode?: boolean): Texture;
/**
 * Apply a post process to a texture
 * @param postProcessName name of the fragment post process
 * @param internalTexture the texture to encode
 * @param scene the scene hosting the texture
 * @param type type of the output texture. If not provided, use the one from internalTexture
 * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
 * @param format format of the output texture. If not provided, use the one from internalTexture
 * @return a promise with the internalTexture having its texture replaced by the result of the processing
 */
export declare function ApplyPostProcess(postProcessName: string, internalTexture: InternalTexture, scene: Scene, type?: number, samplingMode?: number, format?: number): Promise<InternalTexture>;
/**
 * Converts a number to half float
 * @param value number to convert
 * @returns converted number
 */
export declare function ToHalfFloat(value: number): number;
/**
 * Converts a half float to a number
 * @param value half float to convert
 * @returns converted half float
 */
export declare function FromHalfFloat(value: number): number;
/**
 * Class used to host texture specific utilities
 */
export declare const TextureTools: {
    /**
     * Uses the GPU to create a copy texture rescaled at a given size
     * @param texture Texture to copy from
     * @param width defines the desired width
     * @param height defines the desired height
     * @param useBilinearMode defines if bilinear mode has to be used
     * @return the generated texture
     */
    CreateResizedCopy: typeof CreateResizedCopy;
    /**
     * Apply a post process to a texture
     * @param postProcessName name of the fragment post process
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param type type of the output texture. If not provided, use the one from internalTexture
     * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
     * @param format format of the output texture. If not provided, use the one from internalTexture
     * @return a promise with the internalTexture having its texture replaced by the result of the processing
     */
    ApplyPostProcess: typeof ApplyPostProcess;
    /**
     * Converts a number to half float
     * @param value number to convert
     * @returns converted number
     */
    ToHalfFloat: typeof ToHalfFloat;
    /**
     * Converts a half float to a number
     * @param value half float to convert
     * @returns converted half float
     */
    FromHalfFloat: typeof FromHalfFloat;
};
