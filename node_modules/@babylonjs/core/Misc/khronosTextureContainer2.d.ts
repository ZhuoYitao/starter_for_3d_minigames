import type { InternalTexture } from "../Materials/Textures/internalTexture";
import type { ThinEngine } from "../Engines/thinEngine";
import type { Nullable } from "../types";
/**
 * Class for loading KTX2 files
 */
export declare class KhronosTextureContainer2 {
    private static _WorkerPoolPromise?;
    private static _DecoderModulePromise?;
    /**
     * URLs to use when loading the KTX2 decoder module as well as its dependencies
     * If a url is null, the default url is used (pointing to https://preview.babylonjs.com)
     * Note that jsDecoderModule can't be null and that the other dependencies will only be loaded if necessary
     * Urls you can change:
     *     URLConfig.jsDecoderModule
     *     URLConfig.wasmUASTCToASTC
     *     URLConfig.wasmUASTCToBC7
     *     URLConfig.wasmUASTCToRGBA_UNORM
     *     URLConfig.wasmUASTCToRGBA_SRGB
     *     URLConfig.jsMSCTranscoder
     *     URLConfig.wasmMSCTranscoder
     *     URLConfig.wasmZSTDDecoder
     * You can see their default values in this PG: https://playground.babylonjs.com/#EIJH8L#29
     */
    static URLConfig: {
        jsDecoderModule: string;
        wasmUASTCToASTC: Nullable<string>;
        wasmUASTCToBC7: Nullable<string>;
        wasmUASTCToRGBA_UNORM: Nullable<string>;
        wasmUASTCToRGBA_SRGB: Nullable<string>;
        jsMSCTranscoder: Nullable<string>;
        wasmMSCTranscoder: Nullable<string>;
        wasmZSTDDecoder: Nullable<string>;
    };
    /**
     * Default number of workers used to handle data decoding
     */
    static DefaultNumWorkers: number;
    private static GetDefaultNumWorkers;
    private _engine;
    private static _Initialize;
    /**
     * Constructor
     * @param engine The engine to use
     * @param numWorkers The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
     */
    constructor(engine: ThinEngine, numWorkers?: number);
    /**
     * @param data
     * @param internalTexture
     * @param options
     * @hidden
     */
    uploadAsync(data: ArrayBufferView, internalTexture: InternalTexture, options?: any): Promise<void>;
    protected _createTexture(data: any, internalTexture: InternalTexture, options?: any): void;
    /**
     * Checks if the given data starts with a KTX2 file identifier.
     * @param data the data to check
     * @returns true if the data is a KTX2 file or false otherwise
     */
    static IsValid(data: ArrayBufferView): boolean;
}
