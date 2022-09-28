
import { AutoReleaseWorkerPool } from "./workerPool.js";
import { Tools } from "./tools.js";
/**
 * Class for loading KTX2 files
 */
var KhronosTextureContainer2 = /** @class */ (function () {
    /**
     * Constructor
     * @param engine The engine to use
     * @param numWorkers The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
     */
    function KhronosTextureContainer2(engine, numWorkers) {
        if (numWorkers === void 0) { numWorkers = KhronosTextureContainer2.DefaultNumWorkers; }
        this._engine = engine;
        KhronosTextureContainer2._Initialize(numWorkers);
    }
    KhronosTextureContainer2.GetDefaultNumWorkers = function () {
        if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
            return 1;
        }
        // Use 50% of the available logical processors but capped at 4.
        return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
    };
    KhronosTextureContainer2._Initialize = function (numWorkers) {
        if (KhronosTextureContainer2._WorkerPoolPromise || KhronosTextureContainer2._DecoderModulePromise) {
            return;
        }
        if (numWorkers && typeof Worker === "function") {
            KhronosTextureContainer2._WorkerPoolPromise = new Promise(function (resolve) {
                var workerContent = "(".concat(workerFunc, ")()");
                var workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
                resolve(new AutoReleaseWorkerPool(numWorkers, function () {
                    return new Promise(function (resolve, reject) {
                        var worker = new Worker(workerBlobUrl);
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                        };
                        var onMessage = function (message) {
                            if (message.data.action === "init") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                resolve(worker);
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        worker.postMessage({
                            action: "init",
                            urls: KhronosTextureContainer2.URLConfig,
                        });
                    });
                }));
            });
        }
        else if (typeof KTX2DECODER === "undefined") {
            KhronosTextureContainer2._DecoderModulePromise = Tools.LoadScriptAsync(KhronosTextureContainer2.URLConfig.jsDecoderModule).then(function () {
                KTX2DECODER.MSCTranscoder.UseFromWorkerThread = false;
                KTX2DECODER.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
                var urls = KhronosTextureContainer2.URLConfig;
                if (urls.wasmUASTCToASTC !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_ASTC.WasmModuleURL = urls.wasmUASTCToASTC;
                }
                if (urls.wasmUASTCToBC7 !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_BC7.WasmModuleURL = urls.wasmUASTCToBC7;
                }
                if (urls.wasmUASTCToRGBA_UNORM !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL = urls.wasmUASTCToRGBA_UNORM;
                }
                if (urls.wasmUASTCToRGBA_SRGB !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL = urls.wasmUASTCToRGBA_SRGB;
                }
                if (urls.jsMSCTranscoder !== null) {
                    KTX2DECODER.MSCTranscoder.JSModuleURL = urls.jsMSCTranscoder;
                }
                if (urls.wasmMSCTranscoder !== null) {
                    KTX2DECODER.MSCTranscoder.WasmModuleURL = urls.wasmMSCTranscoder;
                }
                if (urls.wasmZSTDDecoder !== null) {
                    KTX2DECODER.ZSTDDecoder.WasmModuleURL = urls.wasmZSTDDecoder;
                }
                return new KTX2DECODER.KTX2Decoder();
            });
        }
        else {
            KTX2DECODER.MSCTranscoder.UseFromWorkerThread = false;
            KTX2DECODER.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
            KhronosTextureContainer2._DecoderModulePromise = Promise.resolve(new KTX2DECODER.KTX2Decoder());
        }
    };
    /**
     * @param data
     * @param internalTexture
     * @param options
     * @hidden
     */
    KhronosTextureContainer2.prototype.uploadAsync = function (data, internalTexture, options) {
        var _this = this;
        var caps = this._engine.getCaps();
        var compressedTexturesCaps = {
            astc: !!caps.astc,
            bptc: !!caps.bptc,
            s3tc: !!caps.s3tc,
            pvrtc: !!caps.pvrtc,
            etc2: !!caps.etc2,
            etc1: !!caps.etc1,
        };
        if (KhronosTextureContainer2._WorkerPoolPromise) {
            return KhronosTextureContainer2._WorkerPoolPromise.then(function (workerPool) {
                return new Promise(function (resolve, reject) {
                    workerPool.push(function (worker, onComplete) {
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                            onComplete();
                        };
                        var onMessage = function (message) {
                            if (message.data.action === "decoded") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                if (!message.data.success) {
                                    reject({ message: message.data.msg });
                                }
                                else {
                                    try {
                                        _this._createTexture(message.data.decodedData, internalTexture, options);
                                        resolve();
                                    }
                                    catch (err) {
                                        reject({ message: err });
                                    }
                                }
                                onComplete();
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        var dataCopy = new Uint8Array(data.byteLength);
                        dataCopy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
                        worker.postMessage({ action: "decode", data: dataCopy, caps: compressedTexturesCaps, options: options }, [dataCopy.buffer]);
                    });
                });
            });
        }
        else if (KhronosTextureContainer2._DecoderModulePromise) {
            return KhronosTextureContainer2._DecoderModulePromise.then(function (decoder) {
                return new Promise(function (resolve, reject) {
                    decoder
                        .decode(data, caps)
                        .then(function (data) {
                        _this._createTexture(data, internalTexture);
                        resolve();
                    })
                        .catch(function (reason) {
                        reject({ message: reason });
                    });
                });
            });
        }
        throw new Error("KTX2 decoder module is not available");
    };
    KhronosTextureContainer2.prototype._createTexture = function (data /* IEncodedData */, internalTexture, options) {
        var oglTexture2D = 3553; // gl.TEXTURE_2D
        this._engine._bindTextureDirectly(oglTexture2D, internalTexture);
        if (options) {
            // return back some information about the decoded data
            options.transcodedFormat = data.transcodedFormat;
            options.isInGammaSpace = data.isInGammaSpace;
            options.hasAlpha = data.hasAlpha;
            options.transcoderName = data.transcoderName;
        }
        if (data.transcodedFormat === 0x8058 /* RGBA8 */) {
            internalTexture.type = 0;
            internalTexture.format = 5;
        }
        else {
            internalTexture.format = data.transcodedFormat;
        }
        internalTexture._gammaSpace = data.isInGammaSpace;
        internalTexture.generateMipMaps = data.mipmaps.length > 1;
        if (data.errors) {
            throw new Error("KTX2 container - could not transcode the data. " + data.errors);
        }
        for (var t = 0; t < data.mipmaps.length; ++t) {
            var mipmap = data.mipmaps[t];
            if (!mipmap || !mipmap.data) {
                throw new Error("KTX2 container - could not transcode one of the image");
            }
            if (data.transcodedFormat === 0x8058 /* RGBA8 */) {
                // uncompressed RGBA
                internalTexture.width = mipmap.width; // need to set width/height so that the call to _uploadDataToTextureDirectly uses the right dimensions
                internalTexture.height = mipmap.height;
                this._engine._uploadDataToTextureDirectly(internalTexture, mipmap.data, 0, t, undefined, true);
            }
            else {
                this._engine._uploadCompressedDataToTextureDirectly(internalTexture, data.transcodedFormat, mipmap.width, mipmap.height, mipmap.data, 0, t);
            }
        }
        internalTexture._extension = ".ktx2";
        internalTexture.width = data.mipmaps[0].width;
        internalTexture.height = data.mipmaps[0].height;
        internalTexture.isReady = true;
        this._engine._bindTextureDirectly(oglTexture2D, null);
    };
    /**
     * Checks if the given data starts with a KTX2 file identifier.
     * @param data the data to check
     * @returns true if the data is a KTX2 file or false otherwise
     */
    KhronosTextureContainer2.IsValid = function (data) {
        if (data.byteLength >= 12) {
            // '«', 'K', 'T', 'X', ' ', '2', '0', '»', '\r', '\n', '\x1A', '\n'
            var identifier = new Uint8Array(data.buffer, data.byteOffset, 12);
            if (identifier[0] === 0xab &&
                identifier[1] === 0x4b &&
                identifier[2] === 0x54 &&
                identifier[3] === 0x58 &&
                identifier[4] === 0x20 &&
                identifier[5] === 0x32 &&
                identifier[6] === 0x30 &&
                identifier[7] === 0xbb &&
                identifier[8] === 0x0d &&
                identifier[9] === 0x0a &&
                identifier[10] === 0x1a &&
                identifier[11] === 0x0a) {
                return true;
            }
        }
        return false;
    };
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
    KhronosTextureContainer2.URLConfig = {
        jsDecoderModule: "https://preview.babylonjs.com/babylon.ktx2Decoder.js",
        wasmUASTCToASTC: null,
        wasmUASTCToBC7: null,
        wasmUASTCToRGBA_UNORM: null,
        wasmUASTCToRGBA_SRGB: null,
        jsMSCTranscoder: null,
        wasmMSCTranscoder: null,
        wasmZSTDDecoder: null,
    };
    /**
     * Default number of workers used to handle data decoding
     */
    KhronosTextureContainer2.DefaultNumWorkers = KhronosTextureContainer2.GetDefaultNumWorkers();
    return KhronosTextureContainer2;
}());
export { KhronosTextureContainer2 };
function workerFunc() {
    var ktx2Decoder;
    onmessage = function (event) {
        if (!event.data) {
            return;
        }
        switch (event.data.action) {
            case "init": {
                var urls = event.data.urls;
                importScripts(urls.jsDecoderModule);
                if (urls.wasmUASTCToASTC !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_ASTC.WasmModuleURL = urls.wasmUASTCToASTC;
                }
                if (urls.wasmUASTCToBC7 !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_BC7.WasmModuleURL = urls.wasmUASTCToBC7;
                }
                if (urls.wasmUASTCToRGBA_UNORM !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL = urls.wasmUASTCToRGBA_UNORM;
                }
                if (urls.wasmUASTCToRGBA_SRGB !== null) {
                    KTX2DECODER.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL = urls.wasmUASTCToRGBA_SRGB;
                }
                if (urls.jsMSCTranscoder !== null) {
                    KTX2DECODER.MSCTranscoder.JSModuleURL = urls.jsMSCTranscoder;
                }
                if (urls.wasmMSCTranscoder !== null) {
                    KTX2DECODER.MSCTranscoder.WasmModuleURL = urls.wasmMSCTranscoder;
                }
                if (urls.wasmZSTDDecoder !== null) {
                    KTX2DECODER.ZSTDDecoder.WasmModuleURL = urls.wasmZSTDDecoder;
                }
                ktx2Decoder = new KTX2DECODER.KTX2Decoder();
                postMessage({ action: "init" });
                break;
            }
            case "decode":
                ktx2Decoder
                    .decode(event.data.data, event.data.caps, event.data.options)
                    .then(function (data) {
                    var buffers = [];
                    for (var mip = 0; mip < data.mipmaps.length; ++mip) {
                        var mipmap = data.mipmaps[mip];
                        if (mipmap && mipmap.data) {
                            buffers.push(mipmap.data.buffer);
                        }
                    }
                    postMessage({ action: "decoded", success: true, decodedData: data }, buffers);
                })
                    .catch(function (reason) {
                    postMessage({ action: "decoded", success: false, msg: reason });
                });
                break;
        }
    };
}
//# sourceMappingURL=khronosTextureContainer2.js.map