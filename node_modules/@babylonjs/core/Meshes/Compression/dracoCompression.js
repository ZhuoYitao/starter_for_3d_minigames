/* eslint-disable @typescript-eslint/naming-convention */
import { Tools } from "../../Misc/tools.js";
import { AutoReleaseWorkerPool } from "../../Misc/workerPool.js";
import { VertexData } from "../../Meshes/mesh.vertexData.js";
function createDecoderAsync(wasmBinary) {
    return new Promise(function (resolve) {
        DracoDecoderModule({ wasmBinary: wasmBinary }).then(function (module) {
            resolve({ module: module });
        });
    });
}
function decodeMesh(decoderModule, dataView, attributes, onIndicesData, onAttributeData, dividers) {
    var buffer = new decoderModule.DecoderBuffer();
    buffer.Init(dataView, dataView.byteLength);
    var decoder = new decoderModule.Decoder();
    var geometry;
    var status;
    try {
        var type = decoder.GetEncodedGeometryType(buffer);
        switch (type) {
            case decoderModule.TRIANGULAR_MESH:
                geometry = new decoderModule.Mesh();
                status = decoder.DecodeBufferToMesh(buffer, geometry);
                break;
            case decoderModule.POINT_CLOUD:
                geometry = new decoderModule.PointCloud();
                status = decoder.DecodeBufferToPointCloud(buffer, geometry);
                break;
            default:
                throw new Error("Invalid geometry type ".concat(type));
        }
        if (!status.ok() || !geometry.ptr) {
            throw new Error(status.error_msg());
        }
        if (type === decoderModule.TRIANGULAR_MESH) {
            var numFaces = geometry.num_faces();
            var numIndices = numFaces * 3;
            var byteLength = numIndices * 4;
            var ptr = decoderModule._malloc(byteLength);
            try {
                decoder.GetTrianglesUInt32Array(geometry, byteLength, ptr);
                var indices = new Uint32Array(numIndices);
                indices.set(new Uint32Array(decoderModule.HEAPF32.buffer, ptr, numIndices));
                onIndicesData(indices);
            }
            finally {
                decoderModule._free(ptr);
            }
        }
        var processAttribute = function (kind, attribute, divider) {
            if (divider === void 0) { divider = 1; }
            var numComponents = attribute.num_components();
            var numPoints = geometry.num_points();
            var numValues = numPoints * numComponents;
            var byteLength = numValues * Float32Array.BYTES_PER_ELEMENT;
            var ptr = decoderModule._malloc(byteLength);
            try {
                decoder.GetAttributeDataArrayForAllPoints(geometry, attribute, decoderModule.DT_FLOAT32, byteLength, ptr);
                var values = new Float32Array(decoderModule.HEAPF32.buffer, ptr, numValues);
                if (kind === "color" && numComponents === 3) {
                    var babylonData = new Float32Array(numPoints * 4);
                    for (var i = 0, j = 0; i < babylonData.length; i += 4, j += numComponents) {
                        babylonData[i + 0] = values[j + 0];
                        babylonData[i + 1] = values[j + 1];
                        babylonData[i + 2] = values[j + 2];
                        babylonData[i + 3] = 1;
                    }
                    onAttributeData(kind, babylonData);
                }
                else {
                    var babylonData = new Float32Array(numValues);
                    babylonData.set(new Float32Array(decoderModule.HEAPF32.buffer, ptr, numValues));
                    if (divider !== 1) {
                        for (var i = 0; i < babylonData.length; i++) {
                            babylonData[i] = babylonData[i] / divider;
                        }
                    }
                    onAttributeData(kind, babylonData);
                }
            }
            finally {
                decoderModule._free(ptr);
            }
        };
        if (attributes) {
            for (var kind in attributes) {
                var id = attributes[kind];
                var attribute = decoder.GetAttributeByUniqueId(geometry, id);
                var divider = (dividers && dividers[kind]) || 1;
                processAttribute(kind, attribute, divider);
            }
        }
        else {
            var nativeAttributeTypes = {
                position: "POSITION",
                normal: "NORMAL",
                color: "COLOR",
                uv: "TEX_COORD",
            };
            for (var kind in nativeAttributeTypes) {
                var id = decoder.GetAttributeId(geometry, decoderModule[nativeAttributeTypes[kind]]);
                if (id !== -1) {
                    var attribute = decoder.GetAttribute(geometry, id);
                    processAttribute(kind, attribute);
                }
            }
        }
    }
    finally {
        if (geometry) {
            decoderModule.destroy(geometry);
        }
        decoderModule.destroy(decoder);
        decoderModule.destroy(buffer);
    }
}
/**
 * The worker function that gets converted to a blob url to pass into a worker.
 */
function worker() {
    var decoderPromise;
    onmessage = function (event) {
        var data = event.data;
        switch (data.id) {
            case "init": {
                var decoder = data.decoder;
                if (decoder.url) {
                    importScripts(decoder.url);
                    decoderPromise = DracoDecoderModule({ wasmBinary: decoder.wasmBinary });
                }
                postMessage("done");
                break;
            }
            case "decodeMesh": {
                if (!decoderPromise) {
                    throw new Error("Draco decoder module is not available");
                }
                decoderPromise.then(function (decoder) {
                    decodeMesh(decoder, data.dataView, data.attributes, function (indices) {
                        postMessage({ id: "indices", value: indices }, [indices.buffer]);
                    }, function (kind, data) {
                        postMessage({ id: kind, value: data }, [data.buffer]);
                    });
                    postMessage("done");
                });
                break;
            }
        }
    };
}
/**
 * Draco compression (https://google.github.io/draco/)
 *
 * This class wraps the Draco module.
 *
 * **Encoder**
 *
 * The encoder is not currently implemented.
 *
 * **Decoder**
 *
 * By default, the configuration points to a copy of the Draco decoder files for glTF from the babylon.js preview cdn https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js.
 *
 * To update the configuration, use the following code:
 * ```javascript
 *     DracoCompression.Configuration = {
 *         decoder: {
 *             wasmUrl: "<url to the WebAssembly library>",
 *             wasmBinaryUrl: "<url to the WebAssembly binary>",
 *             fallbackUrl: "<url to the fallback JavaScript library>",
 *         }
 *     };
 * ```
 *
 * Draco has two versions, one for WebAssembly and one for JavaScript. The decoder configuration can be set to only support WebAssembly or only support the JavaScript version.
 * Decoding will automatically fallback to the JavaScript version if WebAssembly version is not configured or if WebAssembly is not supported by the browser.
 * Use `DracoCompression.DecoderAvailable` to determine if the decoder configuration is available for the current context.
 *
 * To decode Draco compressed data, get the default DracoCompression object and call decodeMeshAsync:
 * ```javascript
 *     var vertexData = await DracoCompression.Default.decodeMeshAsync(data);
 * ```
 *
 * @see https://playground.babylonjs.com/#DMZIBD#0
 */
var DracoCompression = /** @class */ (function () {
    /**
     * Constructor
     * @param numWorkers The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
     */
    function DracoCompression(numWorkers) {
        if (numWorkers === void 0) { numWorkers = DracoCompression.DefaultNumWorkers; }
        var decoder = DracoCompression.Configuration.decoder;
        var decoderInfo = decoder.wasmUrl && decoder.wasmBinaryUrl && typeof WebAssembly === "object"
            ? {
                url: Tools.GetAbsoluteUrl(decoder.wasmUrl),
                wasmBinaryPromise: Tools.LoadFileAsync(Tools.GetAbsoluteUrl(decoder.wasmBinaryUrl)),
            }
            : {
                url: Tools.GetAbsoluteUrl(decoder.fallbackUrl),
                wasmBinaryPromise: Promise.resolve(undefined),
            };
        if (numWorkers && typeof Worker === "function") {
            this._workerPoolPromise = decoderInfo.wasmBinaryPromise.then(function (decoderWasmBinary) {
                var workerContent = "".concat(decodeMesh, "(").concat(worker, ")()");
                var workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
                return new AutoReleaseWorkerPool(numWorkers, function () {
                    return new Promise(function (resolve, reject) {
                        var worker = new Worker(workerBlobUrl);
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                        };
                        var onMessage = function (message) {
                            if (message.data === "done") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                resolve(worker);
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        worker.postMessage({
                            id: "init",
                            decoder: {
                                url: decoderInfo.url,
                                wasmBinary: decoderWasmBinary,
                            },
                        });
                    });
                });
            });
        }
        else {
            this._decoderModulePromise = decoderInfo.wasmBinaryPromise.then(function (decoderWasmBinary) {
                if (!decoderInfo.url) {
                    throw new Error("Draco decoder module is not available");
                }
                return Tools.LoadScriptAsync(decoderInfo.url).then(function () {
                    return createDecoderAsync(decoderWasmBinary);
                });
            });
        }
    }
    Object.defineProperty(DracoCompression, "DecoderAvailable", {
        /**
         * Returns true if the decoder configuration is available.
         */
        get: function () {
            var decoder = DracoCompression.Configuration.decoder;
            return !!((decoder.wasmUrl && decoder.wasmBinaryUrl && typeof WebAssembly === "object") || decoder.fallbackUrl);
        },
        enumerable: false,
        configurable: true
    });
    DracoCompression.GetDefaultNumWorkers = function () {
        if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
            return 1;
        }
        // Use 50% of the available logical processors but capped at 4.
        return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
    };
    Object.defineProperty(DracoCompression, "Default", {
        /**
         * Default instance for the draco compression object.
         */
        get: function () {
            if (!DracoCompression._Default) {
                DracoCompression._Default = new DracoCompression();
            }
            return DracoCompression._Default;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stop all async operations and release resources.
     */
    DracoCompression.prototype.dispose = function () {
        if (this._workerPoolPromise) {
            this._workerPoolPromise.then(function (workerPool) {
                workerPool.dispose();
            });
        }
        delete this._workerPoolPromise;
        delete this._decoderModulePromise;
    };
    /**
     * Returns a promise that resolves when ready. Call this manually to ensure draco compression is ready before use.
     * @returns a promise that resolves when ready
     */
    DracoCompression.prototype.whenReadyAsync = function () {
        if (this._workerPoolPromise) {
            return this._workerPoolPromise.then(function () { });
        }
        if (this._decoderModulePromise) {
            return this._decoderModulePromise.then(function () { });
        }
        return Promise.resolve();
    };
    /**
     * Decode Draco compressed mesh data to vertex data.
     * @param data The ArrayBuffer or ArrayBufferView for the Draco compression data
     * @param attributes A map of attributes from vertex buffer kinds to Draco unique ids
     * @param dividers a list of optional dividers for normalization
     * @returns A promise that resolves with the decoded vertex data
     */
    DracoCompression.prototype.decodeMeshAsync = function (data, attributes, dividers) {
        var dataView = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        if (this._workerPoolPromise) {
            return this._workerPoolPromise.then(function (workerPool) {
                return new Promise(function (resolve, reject) {
                    workerPool.push(function (worker, onComplete) {
                        var vertexData = new VertexData();
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                            onComplete();
                        };
                        var onMessage = function (message) {
                            if (message.data === "done") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                resolve(vertexData);
                                onComplete();
                            }
                            else if (message.data.id === "indices") {
                                vertexData.indices = message.data.value;
                            }
                            else {
                                // check normalization
                                var divider = dividers && dividers[message.data.id] ? dividers[message.data.id] : 1;
                                if (divider !== 1) {
                                    // normalize
                                    for (var i = 0; i < message.data.value.length; i++) {
                                        message.data.value[i] = message.data.value[i] / divider;
                                    }
                                }
                                vertexData.set(message.data.value, message.data.id);
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        var dataViewCopy = new Uint8Array(dataView.byteLength);
                        dataViewCopy.set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength));
                        worker.postMessage({ id: "decodeMesh", dataView: dataViewCopy, attributes: attributes }, [dataViewCopy.buffer]);
                    });
                });
            });
        }
        if (this._decoderModulePromise) {
            return this._decoderModulePromise.then(function (decoder) {
                var vertexData = new VertexData();
                decodeMesh(decoder.module, dataView, attributes, function (indices) {
                    vertexData.indices = indices;
                }, function (kind, data) {
                    vertexData.set(data, kind);
                }, dividers);
                return vertexData;
            });
        }
        throw new Error("Draco decoder module is not available");
    };
    /**
     * The configuration. Defaults to the following urls:
     * - wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js"
     * - wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
     * - fallbackUrl: "https://preview.babylonjs.com/draco_decoder_gltf.js"
     */
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm",
            fallbackUrl: "https://preview.babylonjs.com/draco_decoder_gltf.js",
        },
    };
    /**
     * Default number of workers to create when creating the draco compression object.
     */
    DracoCompression.DefaultNumWorkers = DracoCompression.GetDefaultNumWorkers();
    DracoCompression._Default = null;
    return DracoCompression;
}());
export { DracoCompression };
//# sourceMappingURL=dracoCompression.js.map