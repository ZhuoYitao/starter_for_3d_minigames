import type { InternalTexture } from "../../Materials/Textures/internalTexture";
import type { TextureSize } from "../../Materials/Textures/textureCreationOptions";
import type { Nullable } from "../../types";
import { RenderTargetWrapper } from "../renderTargetWrapper";
import type { ThinEngine } from "../thinEngine";
/** @hidden */
export declare class WebGLRenderTargetWrapper extends RenderTargetWrapper {
    private _context;
    _framebuffer: Nullable<WebGLFramebuffer>;
    _depthStencilBuffer: Nullable<WebGLRenderbuffer>;
    _MSAAFramebuffer: Nullable<WebGLFramebuffer>;
    _colorTextureArray: Nullable<WebGLTexture>;
    _depthStencilTextureArray: Nullable<WebGLTexture>;
    constructor(isMulti: boolean, isCube: boolean, size: TextureSize, engine: ThinEngine, context: WebGLRenderingContext);
    protected _cloneRenderTargetWrapper(): Nullable<RenderTargetWrapper>;
    protected _swapRenderTargetWrapper(target: WebGLRenderTargetWrapper): void;
    /**
     * Shares the depth buffer of this render target with another render target.
     * @hidden
     * @param renderTarget Destination renderTarget
     */
    _shareDepth(renderTarget: WebGLRenderTargetWrapper): void;
    /**
     * Binds a texture to this render target on a specific attachment
     * @param texture The texture to bind to the framebuffer
     * @param attachmentIndex Index of the attachment
     * @param faceIndex The face of the texture to render to in case of cube texture
     * @param lodLevel defines the lod level to bind to the frame buffer
     */
    private _bindTextureRenderTarget;
    /**
     * Set a texture in the textures array
     * @param texture the texture to set
     * @param index the index in the textures array to set
     * @param disposePrevious If this function should dispose the previous texture
     */
    setTexture(texture: InternalTexture, index?: number, disposePrevious?: boolean): void;
    dispose(disposeOnlyFramebuffers?: boolean): void;
}
