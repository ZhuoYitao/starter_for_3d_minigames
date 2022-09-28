import type { HardwareTextureWrapper } from "../../Materials/Textures/hardwareTextureWrapper";
import type { Nullable } from "../../types";
/** @hidden */
export declare class WebGLHardwareTexture implements HardwareTextureWrapper {
    private _webGLTexture;
    private _context;
    _MSAARenderBuffer: Nullable<WebGLRenderbuffer>;
    get underlyingResource(): Nullable<WebGLTexture>;
    constructor(existingTexture: Nullable<WebGLTexture> | undefined, context: WebGLRenderingContext);
    setUsage(): void;
    set(hardwareTexture: WebGLTexture): void;
    reset(): void;
    release(): void;
}
