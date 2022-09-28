import "../Shaders/rgbdDecode.fragment";
import "../Engines/Extensions/engine.renderTarget";
declare type Texture = import("../Materials/Textures/texture").Texture;
declare type InternalTexture = import("../Materials/Textures/internalTexture").InternalTexture;
declare type Scene = import("../scene").Scene;
/**
 * Class used to host RGBD texture specific utilities
 */
export declare class RGBDTextureTools {
    /**
     * Expand the RGBD Texture from RGBD to Half Float if possible.
     * @param texture the texture to expand.
     */
    static ExpandRGBDTexture(texture: Texture): void;
    /**
     * Encode the texture to RGBD if possible.
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param outputTextureType type of the texture in which the encoding is performed
     * @return a promise with the internalTexture having its texture replaced by the result of the processing
     */
    static EncodeTextureToRGBD(internalTexture: InternalTexture, scene: Scene, outputTextureType?: number): Promise<InternalTexture>;
}
export {};
