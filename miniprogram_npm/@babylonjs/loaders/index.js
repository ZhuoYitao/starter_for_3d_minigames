module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1661401224741, function(require, module, exports) {
/* eslint-disable import/no-internal-modules */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTF/index.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./OBJ/index.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./STL/index.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./glTF/index.js":1661401224742,"./OBJ/index.js":1661401224783,"./STL/index.js":1661401224788}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224742, function(require, module, exports) {
/* eslint-disable import/no-internal-modules */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFFileLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFValidation.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
var __TEMP__ = require('./1.0/index.js');var GLTF1 = __REQUIRE_WILDCARD__(__TEMP__);
var __TEMP__ = require('./2.0/index.js');var GLTF2 = __REQUIRE_WILDCARD__(__TEMP__);
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTF1', { enumerable: true, configurable: true, get: function() { return GLTF1; } });Object.defineProperty(exports, 'GLTF2', { enumerable: true, configurable: true, get: function() { return GLTF2; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./glTFFileLoader.js":1661401224743,"./glTFValidation.js":1661401224744,"./1.0/index.js":1661401224745,"./2.0/index.js":1661401224751}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224743, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Misc/observable.js');var Observable = __TEMP__['Observable'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Loading/sceneLoader.js');var SceneLoader = __TEMP__['SceneLoader'];
var __TEMP__ = require('@babylonjs/core/assetContainer.js');var AssetContainer = __TEMP__['AssetContainer'];
var __TEMP__ = require('@babylonjs/core/Misc/logger.js');var Logger = __TEMP__['Logger'];
var __TEMP__ = require('@babylonjs/core/Misc/dataReader.js');var DataReader = __TEMP__['DataReader'];
var __TEMP__ = require('./glTFValidation.js');var GLTFValidation = __TEMP__['GLTFValidation'];
var __TEMP__ = require('@babylonjs/core/Misc/fileTools.js');var DecodeBase64UrlToBinary = __TEMP__['DecodeBase64UrlToBinary'];
var __TEMP__ = require('@babylonjs/core/Misc/stringTools.js');var StringTools = __TEMP__['StringTools'];
var __TEMP__ = require('@babylonjs/core/Misc/error.js');var RuntimeError = __TEMP__['RuntimeError'];var ErrorCodes = __TEMP__['ErrorCodes'];
function readAsync(arrayBuffer, byteOffset, byteLength) {
    try {
        return Promise.resolve(new Uint8Array(arrayBuffer, byteOffset, byteLength));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
/**
 * Mode that determines the coordinate system to use.
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var GLTFLoaderCoordinateSystemMode = exports.GLTFLoaderCoordinateSystemMode = undefined;
(function (GLTFLoaderCoordinateSystemMode) {
    /**
     * Automatically convert the glTF right-handed data to the appropriate system based on the current coordinate system mode of the scene.
     */
    GLTFLoaderCoordinateSystemMode[GLTFLoaderCoordinateSystemMode["AUTO"] = 0] = "AUTO";
    /**
     * Sets the useRightHandedSystem flag on the scene.
     */
    GLTFLoaderCoordinateSystemMode[GLTFLoaderCoordinateSystemMode["FORCE_RIGHT_HANDED"] = 1] = "FORCE_RIGHT_HANDED";
})(GLTFLoaderCoordinateSystemMode || (GLTFLoaderCoordinateSystemMode = {}));
/**
 * Mode that determines what animations will start.
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var GLTFLoaderAnimationStartMode = exports.GLTFLoaderAnimationStartMode = undefined;
(function (GLTFLoaderAnimationStartMode) {
    /**
     * No animation will start.
     */
    GLTFLoaderAnimationStartMode[GLTFLoaderAnimationStartMode["NONE"] = 0] = "NONE";
    /**
     * The first animation will start.
     */
    GLTFLoaderAnimationStartMode[GLTFLoaderAnimationStartMode["FIRST"] = 1] = "FIRST";
    /**
     * All animations will start.
     */
    GLTFLoaderAnimationStartMode[GLTFLoaderAnimationStartMode["ALL"] = 2] = "ALL";
})(GLTFLoaderAnimationStartMode || (GLTFLoaderAnimationStartMode = {}));
/**
 * Loader state.
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var GLTFLoaderState = exports.GLTFLoaderState = undefined;
(function (GLTFLoaderState) {
    /**
     * The asset is loading.
     */
    GLTFLoaderState[GLTFLoaderState["LOADING"] = 0] = "LOADING";
    /**
     * The asset is ready for rendering.
     */
    GLTFLoaderState[GLTFLoaderState["READY"] = 1] = "READY";
    /**
     * The asset is completely loaded.
     */
    GLTFLoaderState[GLTFLoaderState["COMPLETE"] = 2] = "COMPLETE";
})(GLTFLoaderState || (GLTFLoaderState = {}));
/**
 * File loader for loading glTF files into a scene.
 */
var GLTFFileLoader = /** @class */ (function () {
    function GLTFFileLoader() {
        // --------------
        // Common options
        // --------------
        /**
         * Raised when the asset has been parsed
         */
        this.onParsedObservable = new Observable();
        // ----------
        // V2 options
        // ----------
        /**
         * The coordinate system mode. Defaults to AUTO.
         */
        this.coordinateSystemMode = GLTFLoaderCoordinateSystemMode.AUTO;
        /**
         * The animation start mode. Defaults to FIRST.
         */
        this.animationStartMode = GLTFLoaderAnimationStartMode.FIRST;
        /**
         * Defines if the loader should compile materials before raising the success callback. Defaults to false.
         */
        this.compileMaterials = false;
        /**
         * Defines if the loader should also compile materials with clip planes. Defaults to false.
         */
        this.useClipPlane = false;
        /**
         * Defines if the loader should compile shadow generators before raising the success callback. Defaults to false.
         */
        this.compileShadowGenerators = false;
        /**
         * Defines if the Alpha blended materials are only applied as coverage.
         * If false, (default) The luminance of each pixel will reduce its opacity to simulate the behaviour of most physical materials.
         * If true, no extra effects are applied to transparent pixels.
         */
        this.transparencyAsCoverage = false;
        /**
         * Defines if the loader should use range requests when load binary glTF files from HTTP.
         * Enabling will disable offline support and glTF validator.
         * Defaults to false.
         */
        this.useRangeRequests = false;
        /**
         * Defines if the loader should create instances when multiple glTF nodes point to the same glTF mesh. Defaults to true.
         */
        this.createInstances = true;
        /**
         * Defines if the loader should always compute the bounding boxes of meshes and not use the min/max values from the position accessor. Defaults to false.
         */
        this.alwaysComputeBoundingBox = false;
        /**
         * If true, load all materials defined in the file, even if not used by any mesh. Defaults to false.
         */
        this.loadAllMaterials = false;
        /**
         * If true, load only the materials defined in the file. Defaults to false.
         */
        this.loadOnlyMaterials = false;
        /**
         * If true, do not load any materials defined in the file. Defaults to false.
         */
        this.skipMaterials = false;
        /**
         * If true, load the color (gamma encoded) textures into sRGB buffers (if supported by the GPU), which will yield more accurate results when sampling the texture. Defaults to true.
         */
        this.useSRGBBuffers = true;
        /**
         * When loading glTF animations, which are defined in seconds, target them to this FPS. Defaults to 60.
         */
        this.targetFps = 60;
        /**
         * Defines if the loader should always compute the nearest common ancestor of the skeleton joints instead of using `skin.skeleton`. Defaults to false.
         * Set this to true if loading assets with invalid `skin.skeleton` values.
         */
        this.alwaysComputeSkeletonRootNode = false;
        /**
         * Function called before loading a url referenced by the asset.
         * @param url
         */
        this.preprocessUrlAsync = function (url) { return Promise.resolve(url); };
        /**
         * Observable raised when the loader creates a mesh after parsing the glTF properties of the mesh.
         * Note that the observable is raised as soon as the mesh object is created, meaning some data may not have been setup yet for this mesh (vertex data, morph targets, material, ...)
         */
        this.onMeshLoadedObservable = new Observable();
        /**
         * Observable raised when the loader creates a texture after parsing the glTF properties of the texture.
         */
        this.onTextureLoadedObservable = new Observable();
        /**
         * Observable raised when the loader creates a material after parsing the glTF properties of the material.
         */
        this.onMaterialLoadedObservable = new Observable();
        /**
         * Observable raised when the loader creates a camera after parsing the glTF properties of the camera.
         */
        this.onCameraLoadedObservable = new Observable();
        /**
         * Observable raised when the asset is completely loaded, immediately before the loader is disposed.
         * For assets with LODs, raised when all of the LODs are complete.
         * For assets without LODs, raised when the model is complete, immediately after the loader resolves the returned promise.
         */
        this.onCompleteObservable = new Observable();
        /**
         * Observable raised when an error occurs.
         */
        this.onErrorObservable = new Observable();
        /**
         * Observable raised after the loader is disposed.
         */
        this.onDisposeObservable = new Observable();
        /**
         * Observable raised after a loader extension is created.
         * Set additional options for a loader extension in this event.
         */
        this.onExtensionLoadedObservable = new Observable();
        /**
         * Defines if the loader should validate the asset.
         */
        this.validate = false;
        /**
         * Observable raised after validation when validate is set to true. The event data is the result of the validation.
         */
        this.onValidatedObservable = new Observable();
        this._loader = null;
        this._state = null;
        this._requests = new Array();
        /**
         * Name of the loader ("gltf")
         */
        this.name = "gltf";
        /** @hidden */
        this.extensions = {
            ".gltf": { isBinary: false },
            ".glb": { isBinary: true },
        };
        /**
         * Observable raised when the loader state changes.
         */
        this.onLoaderStateChangedObservable = new Observable();
        this._logIndentLevel = 0;
        this._loggingEnabled = false;
        /** @hidden */
        this._log = this._logDisabled;
        this._capturePerformanceCounters = false;
        /** @hidden */
        this._startPerformanceCounter = this._startPerformanceCounterDisabled;
        /** @hidden */
        this._endPerformanceCounter = this._endPerformanceCounterDisabled;
    }
    Object.defineProperty(GLTFFileLoader.prototype, "onParsed", {
        /**
         * Raised when the asset has been parsed
         */
        set: function (callback) {
            if (this._onParsedObserver) {
                this.onParsedObservable.remove(this._onParsedObserver);
            }
            this._onParsedObserver = this.onParsedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onMeshLoaded", {
        /**
         * Callback raised when the loader creates a mesh after parsing the glTF properties of the mesh.
         * Note that the callback is called as soon as the mesh object is created, meaning some data may not have been setup yet for this mesh (vertex data, morph targets, material, ...)
         */
        set: function (callback) {
            if (this._onMeshLoadedObserver) {
                this.onMeshLoadedObservable.remove(this._onMeshLoadedObserver);
            }
            this._onMeshLoadedObserver = this.onMeshLoadedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onTextureLoaded", {
        /**
         * Callback raised when the loader creates a texture after parsing the glTF properties of the texture.
         */
        set: function (callback) {
            if (this._onTextureLoadedObserver) {
                this.onTextureLoadedObservable.remove(this._onTextureLoadedObserver);
            }
            this._onTextureLoadedObserver = this.onTextureLoadedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onMaterialLoaded", {
        /**
         * Callback raised when the loader creates a material after parsing the glTF properties of the material.
         */
        set: function (callback) {
            if (this._onMaterialLoadedObserver) {
                this.onMaterialLoadedObservable.remove(this._onMaterialLoadedObserver);
            }
            this._onMaterialLoadedObserver = this.onMaterialLoadedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onCameraLoaded", {
        /**
         * Callback raised when the loader creates a camera after parsing the glTF properties of the camera.
         */
        set: function (callback) {
            if (this._onCameraLoadedObserver) {
                this.onCameraLoadedObservable.remove(this._onCameraLoadedObserver);
            }
            this._onCameraLoadedObserver = this.onCameraLoadedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onComplete", {
        /**
         * Callback raised when the asset is completely loaded, immediately before the loader is disposed.
         * For assets with LODs, raised when all of the LODs are complete.
         * For assets without LODs, raised when the model is complete, immediately after the loader resolves the returned promise.
         */
        set: function (callback) {
            if (this._onCompleteObserver) {
                this.onCompleteObservable.remove(this._onCompleteObserver);
            }
            this._onCompleteObserver = this.onCompleteObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onError", {
        /**
         * Callback raised when an error occurs.
         */
        set: function (callback) {
            if (this._onErrorObserver) {
                this.onErrorObservable.remove(this._onErrorObserver);
            }
            this._onErrorObserver = this.onErrorObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onDispose", {
        /**
         * Callback raised after the loader is disposed.
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onExtensionLoaded", {
        /**
         * Callback raised after a loader extension is created.
         */
        set: function (callback) {
            if (this._onExtensionLoadedObserver) {
                this.onExtensionLoadedObservable.remove(this._onExtensionLoadedObserver);
            }
            this._onExtensionLoadedObserver = this.onExtensionLoadedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "loggingEnabled", {
        /**
         * Defines if the loader logging is enabled.
         */
        get: function () {
            return this._loggingEnabled;
        },
        set: function (value) {
            if (this._loggingEnabled === value) {
                return;
            }
            this._loggingEnabled = value;
            if (this._loggingEnabled) {
                this._log = this._logEnabled;
            }
            else {
                this._log = this._logDisabled;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "capturePerformanceCounters", {
        /**
         * Defines if the loader should capture performance counters.
         */
        get: function () {
            return this._capturePerformanceCounters;
        },
        set: function (value) {
            if (this._capturePerformanceCounters === value) {
                return;
            }
            this._capturePerformanceCounters = value;
            if (this._capturePerformanceCounters) {
                this._startPerformanceCounter = this._startPerformanceCounterEnabled;
                this._endPerformanceCounter = this._endPerformanceCounterEnabled;
            }
            else {
                this._startPerformanceCounter = this._startPerformanceCounterDisabled;
                this._endPerformanceCounter = this._endPerformanceCounterDisabled;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFFileLoader.prototype, "onValidated", {
        /**
         * Callback raised after a loader extension is created.
         */
        set: function (callback) {
            if (this._onValidatedObserver) {
                this.onValidatedObservable.remove(this._onValidatedObserver);
            }
            this._onValidatedObserver = this.onValidatedObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes the loader, releases resources during load, and cancels any outstanding requests.
     */
    GLTFFileLoader.prototype.dispose = function () {
        if (this._loader) {
            this._loader.dispose();
            this._loader = null;
        }
        for (var _i = 0, _a = this._requests; _i < _a.length; _i++) {
            var request = _a[_i];
            request.abort();
        }
        this._requests.length = 0;
        delete this._progressCallback;
        this.preprocessUrlAsync = function (url) { return Promise.resolve(url); };
        this.onMeshLoadedObservable.clear();
        this.onTextureLoadedObservable.clear();
        this.onMaterialLoadedObservable.clear();
        this.onCameraLoadedObservable.clear();
        this.onCompleteObservable.clear();
        this.onExtensionLoadedObservable.clear();
        this.onDisposeObservable.notifyObservers(undefined);
        this.onDisposeObservable.clear();
    };
    /**
     * @param scene
     * @param fileOrUrl
     * @param onSuccess
     * @param onProgress
     * @param useArrayBuffer
     * @param onError
     * @hidden
     */
    GLTFFileLoader.prototype.loadFile = function (scene, fileOrUrl, onSuccess, onProgress, useArrayBuffer, onError) {
        var _this = this;
        this._progressCallback = onProgress;
        var rootUrl = fileOrUrl.name ? "file:" : Tools.GetFolderPath(fileOrUrl);
        var fileName = fileOrUrl.name || Tools.GetFilename(fileOrUrl);
        if (useArrayBuffer) {
            if (this.useRangeRequests) {
                if (this.validate) {
                    Logger.Warn("glTF validation is not supported when range requests are enabled");
                }
                var fileRequest_1 = {
                    abort: function () { },
                    onCompleteObservable: new Observable(),
                };
                var dataBuffer = {
                    readAsync: function (byteOffset, byteLength) {
                        return new Promise(function (resolve, reject) {
                            _this._loadFile(scene, fileOrUrl, function (data) {
                                resolve(new Uint8Array(data));
                            }, true, function (error) {
                                reject(error);
                            }, function (webRequest) {
                                webRequest.setRequestHeader("Range", "bytes=".concat(byteOffset, "-").concat(byteOffset + byteLength - 1));
                            });
                        });
                    },
                    byteLength: 0,
                };
                this._unpackBinaryAsync(new DataReader(dataBuffer)).then(function (loaderData) {
                    fileRequest_1.onCompleteObservable.notifyObservers(fileRequest_1);
                    onSuccess(loaderData);
                }, onError ? function (error) { return onError(undefined, error); } : undefined);
                return fileRequest_1;
            }
            return this._loadFile(scene, fileOrUrl, function (data) {
                _this._validate(scene, data, rootUrl, fileName);
                _this._unpackBinaryAsync(new DataReader({
                    readAsync: function (byteOffset, byteLength) { return readAsync(data, byteOffset, byteLength); },
                    byteLength: data.byteLength,
                })).then(function (loaderData) {
                    onSuccess(loaderData);
                }, onError ? function (error) { return onError(undefined, error); } : undefined);
            }, true, onError);
        }
        return this._loadFile(scene, fileOrUrl, function (data) {
            _this._validate(scene, data, rootUrl, fileName);
            onSuccess({ json: _this._parseJson(data) });
        }, useArrayBuffer, onError);
    };
    /**
     * @param meshesNames
     * @param scene
     * @param data
     * @param rootUrl
     * @param onProgress
     * @param fileName
     * @hidden
     */
    GLTFFileLoader.prototype.importMeshAsync = function (meshesNames, scene, data, rootUrl, onProgress, fileName) {
        var _this = this;
        return Promise.resolve().then(function () {
            _this.onParsedObservable.notifyObservers(data);
            _this.onParsedObservable.clear();
            _this._log("Loading ".concat(fileName || ""));
            _this._loader = _this._getLoader(data);
            return _this._loader.importMeshAsync(meshesNames, scene, null, data, rootUrl, onProgress, fileName);
        });
    };
    /**
     * @param scene
     * @param data
     * @param rootUrl
     * @param onProgress
     * @param fileName
     * @hidden
     */
    GLTFFileLoader.prototype.loadAsync = function (scene, data, rootUrl, onProgress, fileName) {
        var _this = this;
        return Promise.resolve().then(function () {
            _this.onParsedObservable.notifyObservers(data);
            _this.onParsedObservable.clear();
            _this._log("Loading ".concat(fileName || ""));
            _this._loader = _this._getLoader(data);
            return _this._loader.loadAsync(scene, data, rootUrl, onProgress, fileName);
        });
    };
    /**
     * @param scene
     * @param data
     * @param rootUrl
     * @param onProgress
     * @param fileName
     * @hidden
     */
    GLTFFileLoader.prototype.loadAssetContainerAsync = function (scene, data, rootUrl, onProgress, fileName) {
        var _this = this;
        return Promise.resolve().then(function () {
            _this.onParsedObservable.notifyObservers(data);
            _this.onParsedObservable.clear();
            _this._log("Loading ".concat(fileName || ""));
            _this._loader = _this._getLoader(data);
            // Prepare the asset container.
            var container = new AssetContainer(scene);
            // Get materials/textures when loading to add to container
            var materials = [];
            _this.onMaterialLoadedObservable.add(function (material) {
                materials.push(material);
            });
            var textures = [];
            _this.onTextureLoadedObservable.add(function (texture) {
                textures.push(texture);
            });
            var cameras = [];
            _this.onCameraLoadedObservable.add(function (camera) {
                cameras.push(camera);
            });
            return _this._loader.importMeshAsync(null, scene, container, data, rootUrl, onProgress, fileName).then(function (result) {
                Array.prototype.push.apply(container.geometries, result.geometries);
                Array.prototype.push.apply(container.meshes, result.meshes);
                Array.prototype.push.apply(container.particleSystems, result.particleSystems);
                Array.prototype.push.apply(container.skeletons, result.skeletons);
                Array.prototype.push.apply(container.animationGroups, result.animationGroups);
                Array.prototype.push.apply(container.materials, materials);
                Array.prototype.push.apply(container.textures, textures);
                Array.prototype.push.apply(container.lights, result.lights);
                Array.prototype.push.apply(container.transformNodes, result.transformNodes);
                Array.prototype.push.apply(container.cameras, cameras);
                return container;
            });
        });
    };
    /**
     * @param data
     * @hidden
     */
    GLTFFileLoader.prototype.canDirectLoad = function (data) {
        return ((data.indexOf("asset") !== -1 && data.indexOf("version") !== -1) ||
            StringTools.StartsWith(data, "data:base64," + GLTFFileLoader._MagicBase64Encoded) || // this is technically incorrect, but will continue to support for backcompat.
            StringTools.StartsWith(data, "data:;base64," + GLTFFileLoader._MagicBase64Encoded) ||
            StringTools.StartsWith(data, "data:application/octet-stream;base64," + GLTFFileLoader._MagicBase64Encoded) ||
            StringTools.StartsWith(data, "data:model/gltf-binary;base64," + GLTFFileLoader._MagicBase64Encoded));
    };
    /**
     * @param scene
     * @param data
     * @hidden
     */
    GLTFFileLoader.prototype.directLoad = function (scene, data) {
        if (StringTools.StartsWith(data, "base64," + GLTFFileLoader._MagicBase64Encoded) || // this is technically incorrect, but will continue to support for backcompat.
            StringTools.StartsWith(data, ";base64," + GLTFFileLoader._MagicBase64Encoded) ||
            StringTools.StartsWith(data, "application/octet-stream;base64," + GLTFFileLoader._MagicBase64Encoded) ||
            StringTools.StartsWith(data, "model/gltf-binary;base64," + GLTFFileLoader._MagicBase64Encoded)) {
            var arrayBuffer_1 = DecodeBase64UrlToBinary(data);
            this._validate(scene, arrayBuffer_1);
            return this._unpackBinaryAsync(new DataReader({
                readAsync: function (byteOffset, byteLength) { return readAsync(arrayBuffer_1, byteOffset, byteLength); },
                byteLength: arrayBuffer_1.byteLength,
            }));
        }
        this._validate(scene, data);
        return Promise.resolve({ json: this._parseJson(data) });
    };
    /** @hidden */
    GLTFFileLoader.prototype.createPlugin = function () {
        return new GLTFFileLoader();
    };
    Object.defineProperty(GLTFFileLoader.prototype, "loaderState", {
        /**
         * The loader state or null if the loader is not active.
         */
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a promise that resolves when the asset is completely loaded.
     * @returns a promise that resolves when the asset is completely loaded.
     */
    GLTFFileLoader.prototype.whenCompleteAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.onCompleteObservable.addOnce(function () {
                resolve();
            });
            _this.onErrorObservable.addOnce(function (reason) {
                reject(reason);
            });
        });
    };
    /**
     * @param state
     * @hidden
     */
    GLTFFileLoader.prototype._setState = function (state) {
        if (this._state === state) {
            return;
        }
        this._state = state;
        this.onLoaderStateChangedObservable.notifyObservers(this._state);
        this._log(GLTFLoaderState[this._state]);
    };
    /**
     * @param scene
     * @param fileOrUrl
     * @param onSuccess
     * @param useArrayBuffer
     * @param onError
     * @param onOpened
     * @hidden
     */
    GLTFFileLoader.prototype._loadFile = function (scene, fileOrUrl, onSuccess, useArrayBuffer, onError, onOpened) {
        var _this = this;
        var request = scene._loadFile(fileOrUrl, onSuccess, function (event) {
            _this._onProgress(event, request);
        }, true, useArrayBuffer, onError, onOpened);
        request.onCompleteObservable.add(function (request) {
            _this._requests.splice(_this._requests.indexOf(request), 1);
        });
        this._requests.push(request);
        return request;
    };
    GLTFFileLoader.prototype._onProgress = function (event, request) {
        if (!this._progressCallback) {
            return;
        }
        request._lengthComputable = event.lengthComputable;
        request._loaded = event.loaded;
        request._total = event.total;
        var lengthComputable = true;
        var loaded = 0;
        var total = 0;
        for (var _i = 0, _a = this._requests; _i < _a.length; _i++) {
            var request_1 = _a[_i];
            if (request_1._lengthComputable === undefined || request_1._loaded === undefined || request_1._total === undefined) {
                return;
            }
            lengthComputable = lengthComputable && request_1._lengthComputable;
            loaded += request_1._loaded;
            total += request_1._total;
        }
        this._progressCallback({
            lengthComputable: lengthComputable,
            loaded: loaded,
            total: lengthComputable ? total : 0,
        });
    };
    GLTFFileLoader.prototype._validate = function (scene, data, rootUrl, fileName) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        if (fileName === void 0) { fileName = ""; }
        if (!this.validate) {
            return;
        }
        this._startPerformanceCounter("Validate JSON");
        GLTFValidation.ValidateAsync(data, rootUrl, fileName, function (uri) {
            return _this.preprocessUrlAsync(rootUrl + uri).then(function (url) { return scene._loadFileAsync(url, undefined, true, true); });
        }).then(function (result) {
            _this._endPerformanceCounter("Validate JSON");
            _this.onValidatedObservable.notifyObservers(result);
            _this.onValidatedObservable.clear();
        }, function (reason) {
            _this._endPerformanceCounter("Validate JSON");
            Tools.Warn("Failed to validate: ".concat(reason.message));
            _this.onValidatedObservable.clear();
        });
    };
    GLTFFileLoader.prototype._getLoader = function (loaderData) {
        var asset = loaderData.json.asset || {};
        this._log("Asset version: ".concat(asset.version));
        asset.minVersion && this._log("Asset minimum version: ".concat(asset.minVersion));
        asset.generator && this._log("Asset generator: ".concat(asset.generator));
        var version = GLTFFileLoader._parseVersion(asset.version);
        if (!version) {
            throw new Error("Invalid version: " + asset.version);
        }
        if (asset.minVersion !== undefined) {
            var minVersion = GLTFFileLoader._parseVersion(asset.minVersion);
            if (!minVersion) {
                throw new Error("Invalid minimum version: " + asset.minVersion);
            }
            if (GLTFFileLoader._compareVersion(minVersion, { major: 2, minor: 0 }) > 0) {
                throw new Error("Incompatible minimum version: " + asset.minVersion);
            }
        }
        var createLoaders = {
            1: GLTFFileLoader._CreateGLTF1Loader,
            2: GLTFFileLoader._CreateGLTF2Loader,
        };
        var createLoader = createLoaders[version.major];
        if (!createLoader) {
            throw new Error("Unsupported version: " + asset.version);
        }
        return createLoader(this);
    };
    GLTFFileLoader.prototype._parseJson = function (json) {
        this._startPerformanceCounter("Parse JSON");
        this._log("JSON length: ".concat(json.length));
        var parsed = JSON.parse(json);
        this._endPerformanceCounter("Parse JSON");
        return parsed;
    };
    GLTFFileLoader.prototype._unpackBinaryAsync = function (dataReader) {
        var _this = this;
        this._startPerformanceCounter("Unpack Binary");
        // Read magic + version + length + json length + json format
        return dataReader.loadAsync(20).then(function () {
            var Binary = {
                Magic: 0x46546c67,
            };
            var magic = dataReader.readUint32();
            if (magic !== Binary.Magic) {
                throw new RuntimeError("Unexpected magic: " + magic, ErrorCodes.GLTFLoaderUnexpectedMagicError);
            }
            var version = dataReader.readUint32();
            if (_this.loggingEnabled) {
                _this._log("Binary version: ".concat(version));
            }
            var length = dataReader.readUint32();
            if (dataReader.buffer.byteLength !== 0 && length !== dataReader.buffer.byteLength) {
                throw new Error("Length in header does not match actual data length: ".concat(length, " != ").concat(dataReader.buffer.byteLength));
            }
            var unpacked;
            switch (version) {
                case 1: {
                    unpacked = _this._unpackBinaryV1Async(dataReader, length);
                    break;
                }
                case 2: {
                    unpacked = _this._unpackBinaryV2Async(dataReader, length);
                    break;
                }
                default: {
                    throw new Error("Unsupported version: " + version);
                }
            }
            _this._endPerformanceCounter("Unpack Binary");
            return unpacked;
        });
    };
    GLTFFileLoader.prototype._unpackBinaryV1Async = function (dataReader, length) {
        var ContentFormat = {
            JSON: 0,
        };
        var contentLength = dataReader.readUint32();
        var contentFormat = dataReader.readUint32();
        if (contentFormat !== ContentFormat.JSON) {
            throw new Error("Unexpected content format: ".concat(contentFormat));
        }
        var bodyLength = length - dataReader.byteOffset;
        var data = { json: this._parseJson(dataReader.readString(contentLength)), bin: null };
        if (bodyLength !== 0) {
            var startByteOffset_1 = dataReader.byteOffset;
            data.bin = {
                readAsync: function (byteOffset, byteLength) { return dataReader.buffer.readAsync(startByteOffset_1 + byteOffset, byteLength); },
                byteLength: bodyLength,
            };
        }
        return Promise.resolve(data);
    };
    GLTFFileLoader.prototype._unpackBinaryV2Async = function (dataReader, length) {
        var _this = this;
        var ChunkFormat = {
            JSON: 0x4e4f534a,
            BIN: 0x004e4942,
        };
        // Read the JSON chunk header.
        var chunkLength = dataReader.readUint32();
        var chunkFormat = dataReader.readUint32();
        if (chunkFormat !== ChunkFormat.JSON) {
            throw new Error("First chunk format is not JSON");
        }
        // Bail if there are no other chunks.
        if (dataReader.byteOffset + chunkLength === length) {
            return dataReader.loadAsync(chunkLength).then(function () {
                return { json: _this._parseJson(dataReader.readString(chunkLength)), bin: null };
            });
        }
        // Read the JSON chunk and the length and type of the next chunk.
        return dataReader.loadAsync(chunkLength + 8).then(function () {
            var data = { json: _this._parseJson(dataReader.readString(chunkLength)), bin: null };
            var readAsync = function () {
                var chunkLength = dataReader.readUint32();
                var chunkFormat = dataReader.readUint32();
                switch (chunkFormat) {
                    case ChunkFormat.JSON: {
                        throw new Error("Unexpected JSON chunk");
                    }
                    case ChunkFormat.BIN: {
                        var startByteOffset_2 = dataReader.byteOffset;
                        data.bin = {
                            readAsync: function (byteOffset, byteLength) { return dataReader.buffer.readAsync(startByteOffset_2 + byteOffset, byteLength); },
                            byteLength: chunkLength,
                        };
                        dataReader.skipBytes(chunkLength);
                        break;
                    }
                    default: {
                        // ignore unrecognized chunkFormat
                        dataReader.skipBytes(chunkLength);
                        break;
                    }
                }
                if (dataReader.byteOffset !== length) {
                    return dataReader.loadAsync(8).then(readAsync);
                }
                return Promise.resolve(data);
            };
            return readAsync();
        });
    };
    GLTFFileLoader._parseVersion = function (version) {
        if (version === "1.0" || version === "1.0.1") {
            return {
                major: 1,
                minor: 0,
            };
        }
        var match = (version + "").match(/^(\d+)\.(\d+)/);
        if (!match) {
            return null;
        }
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
        };
    };
    GLTFFileLoader._compareVersion = function (a, b) {
        if (a.major > b.major) {
            return 1;
        }
        if (a.major < b.major) {
            return -1;
        }
        if (a.minor > b.minor) {
            return 1;
        }
        if (a.minor < b.minor) {
            return -1;
        }
        return 0;
    };
    /**
     * @param message
     * @hidden
     */
    GLTFFileLoader.prototype._logOpen = function (message) {
        this._log(message);
        this._logIndentLevel++;
    };
    /** @hidden */
    GLTFFileLoader.prototype._logClose = function () {
        --this._logIndentLevel;
    };
    GLTFFileLoader.prototype._logEnabled = function (message) {
        var spaces = GLTFFileLoader._logSpaces.substr(0, this._logIndentLevel * 2);
        Logger.Log("".concat(spaces).concat(message));
    };
    GLTFFileLoader.prototype._logDisabled = function (message) { };
    GLTFFileLoader.prototype._startPerformanceCounterEnabled = function (counterName) {
        Tools.StartPerformanceCounter(counterName);
    };
    GLTFFileLoader.prototype._startPerformanceCounterDisabled = function (counterName) { };
    GLTFFileLoader.prototype._endPerformanceCounterEnabled = function (counterName) {
        Tools.EndPerformanceCounter(counterName);
    };
    GLTFFileLoader.prototype._endPerformanceCounterDisabled = function (counterName) { };
    // ----------
    // V1 options
    // ----------
    /**
     * Set this property to false to disable incremental loading which delays the loader from calling the success callback until after loading the meshes and shaders.
     * Textures always loads asynchronously. For example, the success callback can compute the bounding information of the loaded meshes when incremental loading is disabled.
     * Defaults to true.
     * @hidden
     */
    GLTFFileLoader.IncrementalLoading = true;
    /**
     * Set this property to true in order to work with homogeneous coordinates, available with some converters and exporters.
     * Defaults to false. See https://en.wikipedia.org/wiki/Homogeneous_coordinates.
     * @hidden
     */
    GLTFFileLoader.HomogeneousCoordinates = false;
    GLTFFileLoader._MagicBase64Encoded = "Z2xURg"; // "glTF" base64 encoded (without the quotes!)
    GLTFFileLoader._logSpaces = "                                ";
    return GLTFFileLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFFileLoader', { enumerable: true, configurable: true, get: function() { return GLTFFileLoader; } });
if (SceneLoader) {
    SceneLoader.RegisterPlugin(new GLTFFileLoader());
}
//# sourceMappingURL=glTFFileLoader.js.map
}, function(modId) { var map = {"./glTFValidation.js":1661401224744}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224744, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
function validateAsync(data, rootUrl, fileName, getExternalResource) {
    var options = {
        externalResourceFunction: function (uri) { return getExternalResource(uri).then(function (value) { return new Uint8Array(value); }); },
    };
    if (fileName) {
        options.uri = rootUrl === "file:" ? fileName : rootUrl + fileName;
    }
    return data instanceof ArrayBuffer ? GLTFValidator.validateBytes(new Uint8Array(data), options) : GLTFValidator.validateString(data, options);
}
/**
 * The worker function that gets converted to a blob url to pass into a worker.
 */
function workerFunc() {
    var pendingExternalResources = [];
    onmessage = function (message) {
        var data = message.data;
        switch (data.id) {
            case "init": {
                importScripts(data.url);
                break;
            }
            case "validate": {
                validateAsync(data.data, data.rootUrl, data.fileName, function (uri) {
                    return new Promise(function (resolve, reject) {
                        var index = pendingExternalResources.length;
                        pendingExternalResources.push({ resolve: resolve, reject: reject });
                        postMessage({ id: "getExternalResource", index: index, uri: uri });
                    });
                }).then(function (value) {
                    postMessage({ id: "validate.resolve", value: value });
                }, function (reason) {
                    postMessage({ id: "validate.reject", reason: reason });
                });
                break;
            }
            case "getExternalResource.resolve": {
                pendingExternalResources[data.index].resolve(data.value);
                break;
            }
            case "getExternalResource.reject": {
                pendingExternalResources[data.index].reject(data.reason);
                break;
            }
        }
    };
}
/**
 * glTF validation
 */
var GLTFValidation = /** @class */ (function () {
    function GLTFValidation() {
    }
    /**
     * Validate a glTF asset using the glTF-Validator.
     * @param data The JSON of a glTF or the array buffer of a binary glTF
     * @param rootUrl The root url for the glTF
     * @param fileName The file name for the glTF
     * @param getExternalResource The callback to get external resources for the glTF validator
     * @returns A promise that resolves with the glTF validation results once complete
     */
    GLTFValidation.ValidateAsync = function (data, rootUrl, fileName, getExternalResource) {
        var _this = this;
        if (typeof Worker === "function") {
            return new Promise(function (resolve, reject) {
                var workerContent = "".concat(validateAsync, "(").concat(workerFunc, ")()");
                var workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
                var worker = new Worker(workerBlobUrl);
                var onError = function (error) {
                    worker.removeEventListener("error", onError);
                    worker.removeEventListener("message", onMessage);
                    reject(error);
                };
                var onMessage = function (message) {
                    var data = message.data;
                    switch (data.id) {
                        case "getExternalResource": {
                            getExternalResource(data.uri).then(function (value) {
                                worker.postMessage({ id: "getExternalResource.resolve", index: data.index, value: value }, [value]);
                            }, function (reason) {
                                worker.postMessage({ id: "getExternalResource.reject", index: data.index, reason: reason });
                            });
                            break;
                        }
                        case "validate.resolve": {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            resolve(data.value);
                            worker.terminate();
                            break;
                        }
                        case "validate.reject": {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(data.reason);
                            worker.terminate();
                        }
                    }
                };
                worker.addEventListener("error", onError);
                worker.addEventListener("message", onMessage);
                worker.postMessage({ id: "init", url: _this.Configuration.url });
                worker.postMessage({ id: "validate", data: data, rootUrl: rootUrl, fileName: fileName });
            });
        }
        else {
            if (!this._LoadScriptPromise) {
                this._LoadScriptPromise = Tools.LoadScriptAsync(this.Configuration.url);
            }
            return this._LoadScriptPromise.then(function () {
                return validateAsync(data, rootUrl, fileName, getExternalResource);
            });
        }
    };
    /**
     * The configuration. Defaults to `{ url: "https://preview.babylonjs.com/gltf_validator.js" }`.
     */
    GLTFValidation.Configuration = {
        url: "https://preview.babylonjs.com/gltf_validator.js",
    };
    return GLTFValidation;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFValidation', { enumerable: true, configurable: true, get: function() { return GLTFValidation; } });
//# sourceMappingURL=glTFValidation.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224745, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFBinaryExtension.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoaderInterfaces.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoaderUtils.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFMaterialsCommonExtension.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./glTFBinaryExtension.js":1661401224746,"./glTFLoader.js":1661401224747,"./glTFLoaderInterfaces.js":1661401224748,"./glTFLoaderUtils.js":1661401224749,"./glTFMaterialsCommonExtension.js":1661401224750}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224746, function(require, module, exports) {
var __TEMP__ = require('tslib');var __extends = __TEMP__['__extends'];
var __TEMP__ = require('./glTFLoader.js');var GLTFLoaderExtension = __TEMP__['GLTFLoaderExtension'];var GLTFLoader = __TEMP__['GLTFLoader'];var GLTFLoaderBase = __TEMP__['GLTFLoaderBase'];
var __TEMP__ = require('./glTFLoaderUtils.js');var GLTFUtils = __TEMP__['GLTFUtils'];
var __TEMP__ = require('./glTFLoaderInterfaces.js');var EComponentType = __TEMP__['EComponentType'];
var BinaryExtensionBufferName = "binary_glTF";
/** @hidden */
var GLTFBinaryExtension = /** @class */ (function (_super) {
    __extends(GLTFBinaryExtension, _super);
    function GLTFBinaryExtension() {
        return _super.call(this, "KHR_binary_glTF") || this;
    }
    GLTFBinaryExtension.prototype.loadRuntimeAsync = function (scene, data, rootUrl, onSuccess) {
        var extensionsUsed = data.json.extensionsUsed;
        if (!extensionsUsed || extensionsUsed.indexOf(this.name) === -1 || !data.bin) {
            return false;
        }
        this._bin = data.bin;
        onSuccess(GLTFLoaderBase.CreateRuntime(data.json, scene, rootUrl));
        return true;
    };
    GLTFBinaryExtension.prototype.loadBufferAsync = function (gltfRuntime, id, onSuccess, onError) {
        if (gltfRuntime.extensionsUsed.indexOf(this.name) === -1) {
            return false;
        }
        if (id !== BinaryExtensionBufferName) {
            return false;
        }
        this._bin.readAsync(0, this._bin.byteLength).then(onSuccess, function (error) { return onError(error.message); });
        return true;
    };
    GLTFBinaryExtension.prototype.loadTextureBufferAsync = function (gltfRuntime, id, onSuccess) {
        var texture = gltfRuntime.textures[id];
        var source = gltfRuntime.images[texture.source];
        if (!source.extensions || !(this.name in source.extensions)) {
            return false;
        }
        var sourceExt = source.extensions[this.name];
        var bufferView = gltfRuntime.bufferViews[sourceExt.bufferView];
        var buffer = GLTFUtils.GetBufferFromBufferView(gltfRuntime, bufferView, 0, bufferView.byteLength, EComponentType.UNSIGNED_BYTE);
        onSuccess(buffer);
        return true;
    };
    GLTFBinaryExtension.prototype.loadShaderStringAsync = function (gltfRuntime, id, onSuccess) {
        var shader = gltfRuntime.shaders[id];
        if (!shader.extensions || !(this.name in shader.extensions)) {
            return false;
        }
        var binaryExtensionShader = shader.extensions[this.name];
        var bufferView = gltfRuntime.bufferViews[binaryExtensionShader.bufferView];
        var shaderBytes = GLTFUtils.GetBufferFromBufferView(gltfRuntime, bufferView, 0, bufferView.byteLength, EComponentType.UNSIGNED_BYTE);
        setTimeout(function () {
            var shaderString = GLTFUtils.DecodeBufferToText(shaderBytes);
            onSuccess(shaderString);
        });
        return true;
    };
    return GLTFBinaryExtension;
}(GLTFLoaderExtension));
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFBinaryExtension', { enumerable: true, configurable: true, get: function() { return GLTFBinaryExtension; } });
GLTFLoader.RegisterExtension(new GLTFBinaryExtension());
//# sourceMappingURL=glTFBinaryExtension.js.map
}, function(modId) { var map = {"./glTFLoader.js":1661401224747,"./glTFLoaderUtils.js":1661401224749,"./glTFLoaderInterfaces.js":1661401224748}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224747, function(require, module, exports) {
var __TEMP__ = require('./glTFLoaderInterfaces.js');var EParameterType = __TEMP__['EParameterType'];var ETextureFilterType = __TEMP__['ETextureFilterType'];var ECullingType = __TEMP__['ECullingType'];var EBlendingFunction = __TEMP__['EBlendingFunction'];var EShaderType = __TEMP__['EShaderType'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Quaternion = __TEMP__['Quaternion'];var Vector3 = __TEMP__['Vector3'];var Matrix = __TEMP__['Matrix'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Cameras/camera.js');var Camera = __TEMP__['Camera'];
var __TEMP__ = require('@babylonjs/core/Cameras/freeCamera.js');var FreeCamera = __TEMP__['FreeCamera'];
var __TEMP__ = require('@babylonjs/core/Animations/animation.js');var Animation = __TEMP__['Animation'];
var __TEMP__ = require('@babylonjs/core/Bones/bone.js');var Bone = __TEMP__['Bone'];
var __TEMP__ = require('@babylonjs/core/Bones/skeleton.js');var Skeleton = __TEMP__['Skeleton'];
var __TEMP__ = require('@babylonjs/core/Materials/effect.js');var Effect = __TEMP__['Effect'];
var __TEMP__ = require('@babylonjs/core/Materials/material.js');var Material = __TEMP__['Material'];
var __TEMP__ = require('@babylonjs/core/Materials/multiMaterial.js');var MultiMaterial = __TEMP__['MultiMaterial'];
var __TEMP__ = require('@babylonjs/core/Materials/standardMaterial.js');var StandardMaterial = __TEMP__['StandardMaterial'];
var __TEMP__ = require('@babylonjs/core/Materials/shaderMaterial.js');var ShaderMaterial = __TEMP__['ShaderMaterial'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/texture.js');var Texture = __TEMP__['Texture'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.vertexData.js');var VertexData = __TEMP__['VertexData'];
var __TEMP__ = require('@babylonjs/core/Buffers/buffer.js');var VertexBuffer = __TEMP__['VertexBuffer'];
var __TEMP__ = require('@babylonjs/core/Meshes/geometry.js');var Geometry = __TEMP__['Geometry'];
var __TEMP__ = require('@babylonjs/core/Meshes/subMesh.js');var SubMesh = __TEMP__['SubMesh'];
var __TEMP__ = require('@babylonjs/core/Meshes/abstractMesh.js');var AbstractMesh = __TEMP__['AbstractMesh'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.js');var Mesh = __TEMP__['Mesh'];
var __TEMP__ = require('@babylonjs/core/Lights/hemisphericLight.js');var HemisphericLight = __TEMP__['HemisphericLight'];
var __TEMP__ = require('@babylonjs/core/Lights/directionalLight.js');var DirectionalLight = __TEMP__['DirectionalLight'];
var __TEMP__ = require('@babylonjs/core/Lights/pointLight.js');var PointLight = __TEMP__['PointLight'];
var __TEMP__ = require('@babylonjs/core/Lights/spotLight.js');var SpotLight = __TEMP__['SpotLight'];
var __TEMP__ = require('./glTFLoaderUtils.js');var GLTFUtils = __TEMP__['GLTFUtils'];
var __TEMP__ = require('../glTFFileLoader.js');var GLTFFileLoader = __TEMP__['GLTFFileLoader'];
var __TEMP__ = require('@babylonjs/core/Engines/constants.js');var Constants = __TEMP__['Constants'];
/**
 * Tokenizer. Used for shaders compatibility
 * Automatically map world, view, projection, worldViewProjection, attributes and so on
 */
var ETokenType;
(function (ETokenType) {
    ETokenType[ETokenType["IDENTIFIER"] = 1] = "IDENTIFIER";
    ETokenType[ETokenType["UNKNOWN"] = 2] = "UNKNOWN";
    ETokenType[ETokenType["END_OF_INPUT"] = 3] = "END_OF_INPUT";
})(ETokenType || (ETokenType = {}));
var Tokenizer = /** @class */ (function () {
    function Tokenizer(toParse) {
        this._pos = 0;
        this.currentToken = ETokenType.UNKNOWN;
        this.currentIdentifier = "";
        this.currentString = "";
        this.isLetterOrDigitPattern = /^[a-zA-Z0-9]+$/;
        this._toParse = toParse;
        this._maxPos = toParse.length;
    }
    Tokenizer.prototype.getNextToken = function () {
        if (this.isEnd()) {
            return ETokenType.END_OF_INPUT;
        }
        this.currentString = this.read();
        this.currentToken = ETokenType.UNKNOWN;
        if (this.currentString === "_" || this.isLetterOrDigitPattern.test(this.currentString)) {
            this.currentToken = ETokenType.IDENTIFIER;
            this.currentIdentifier = this.currentString;
            while (!this.isEnd() && (this.isLetterOrDigitPattern.test((this.currentString = this.peek())) || this.currentString === "_")) {
                this.currentIdentifier += this.currentString;
                this.forward();
            }
        }
        return this.currentToken;
    };
    Tokenizer.prototype.peek = function () {
        return this._toParse[this._pos];
    };
    Tokenizer.prototype.read = function () {
        return this._toParse[this._pos++];
    };
    Tokenizer.prototype.forward = function () {
        this._pos++;
    };
    Tokenizer.prototype.isEnd = function () {
        return this._pos >= this._maxPos;
    };
    return Tokenizer;
}());
/**
 * Values
 */
var glTFTransforms = ["MODEL", "VIEW", "PROJECTION", "MODELVIEW", "MODELVIEWPROJECTION", "JOINTMATRIX"];
var babylonTransforms = ["world", "view", "projection", "worldView", "worldViewProjection", "mBones"];
var glTFAnimationPaths = ["translation", "rotation", "scale"];
var babylonAnimationPaths = ["position", "rotationQuaternion", "scaling"];
/**
 * Parse
 * @param parsedBuffers
 * @param gltfRuntime
 */
var parseBuffers = function (parsedBuffers, gltfRuntime) {
    for (var buf in parsedBuffers) {
        var parsedBuffer = parsedBuffers[buf];
        gltfRuntime.buffers[buf] = parsedBuffer;
        gltfRuntime.buffersCount++;
    }
};
var parseShaders = function (parsedShaders, gltfRuntime) {
    for (var sha in parsedShaders) {
        var parsedShader = parsedShaders[sha];
        gltfRuntime.shaders[sha] = parsedShader;
        gltfRuntime.shaderscount++;
    }
};
var parseObject = function (parsedObjects, runtimeProperty, gltfRuntime) {
    for (var object in parsedObjects) {
        var parsedObject = parsedObjects[object];
        gltfRuntime[runtimeProperty][object] = parsedObject;
    }
};
/**
 * Utils
 * @param buffer
 */
var normalizeUVs = function (buffer) {
    if (!buffer) {
        return;
    }
    for (var i = 0; i < buffer.length / 2; i++) {
        buffer[i * 2 + 1] = 1.0 - buffer[i * 2 + 1];
    }
};
var getAttribute = function (attributeParameter) {
    if (attributeParameter.semantic === "NORMAL") {
        return "normal";
    }
    else if (attributeParameter.semantic === "POSITION") {
        return "position";
    }
    else if (attributeParameter.semantic === "JOINT") {
        return "matricesIndices";
    }
    else if (attributeParameter.semantic === "WEIGHT") {
        return "matricesWeights";
    }
    else if (attributeParameter.semantic === "COLOR") {
        return "color";
    }
    else if (attributeParameter.semantic && attributeParameter.semantic.indexOf("TEXCOORD_") !== -1) {
        var channel = Number(attributeParameter.semantic.split("_")[1]);
        return "uv" + (channel === 0 ? "" : channel + 1);
    }
    return null;
};
/**
 * Loads and creates animations
 * @param gltfRuntime
 */
var loadAnimations = function (gltfRuntime) {
    for (var anim in gltfRuntime.animations) {
        var animation = gltfRuntime.animations[anim];
        if (!animation.channels || !animation.samplers) {
            continue;
        }
        var lastAnimation = null;
        for (var i = 0; i < animation.channels.length; i++) {
            // Get parameters and load buffers
            var channel = animation.channels[i];
            var sampler = animation.samplers[channel.sampler];
            if (!sampler) {
                continue;
            }
            var inputData = null;
            var outputData = null;
            if (animation.parameters) {
                inputData = animation.parameters[sampler.input];
                outputData = animation.parameters[sampler.output];
            }
            else {
                inputData = sampler.input;
                outputData = sampler.output;
            }
            var bufferInput = GLTFUtils.GetBufferFromAccessor(gltfRuntime, gltfRuntime.accessors[inputData]);
            var bufferOutput = GLTFUtils.GetBufferFromAccessor(gltfRuntime, gltfRuntime.accessors[outputData]);
            var targetId = channel.target.id;
            var targetNode = gltfRuntime.scene.getNodeById(targetId);
            if (targetNode === null) {
                targetNode = gltfRuntime.scene.getNodeByName(targetId);
            }
            if (targetNode === null) {
                Tools.Warn("Creating animation named " + anim + ". But cannot find node named " + targetId + " to attach to");
                continue;
            }
            var isBone = targetNode instanceof Bone;
            // Get target path (position, rotation or scaling)
            var targetPath = channel.target.path;
            var targetPathIndex = glTFAnimationPaths.indexOf(targetPath);
            if (targetPathIndex !== -1) {
                targetPath = babylonAnimationPaths[targetPathIndex];
            }
            // Determine animation type
            var animationType = Animation.ANIMATIONTYPE_MATRIX;
            if (!isBone) {
                if (targetPath === "rotationQuaternion") {
                    animationType = Animation.ANIMATIONTYPE_QUATERNION;
                    targetNode.rotationQuaternion = new Quaternion();
                }
                else {
                    animationType = Animation.ANIMATIONTYPE_VECTOR3;
                }
            }
            // Create animation and key frames
            var babylonAnimation = null;
            var keys = [];
            var arrayOffset = 0;
            var modifyKey = false;
            if (isBone && lastAnimation && lastAnimation.getKeys().length === bufferInput.length) {
                babylonAnimation = lastAnimation;
                modifyKey = true;
            }
            if (!modifyKey) {
                gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
                babylonAnimation = new Animation(anim, isBone ? "_matrix" : targetPath, 1, animationType, Animation.ANIMATIONLOOPMODE_CYCLE);
                gltfRuntime.scene._blockEntityCollection = false;
            }
            // For each frame
            for (var j = 0; j < bufferInput.length; j++) {
                var value = null;
                if (targetPath === "rotationQuaternion") {
                    // VEC4
                    value = Quaternion.FromArray([bufferOutput[arrayOffset], bufferOutput[arrayOffset + 1], bufferOutput[arrayOffset + 2], bufferOutput[arrayOffset + 3]]);
                    arrayOffset += 4;
                }
                else {
                    // Position and scaling are VEC3
                    value = Vector3.FromArray([bufferOutput[arrayOffset], bufferOutput[arrayOffset + 1], bufferOutput[arrayOffset + 2]]);
                    arrayOffset += 3;
                }
                if (isBone) {
                    var bone = targetNode;
                    var translation = Vector3.Zero();
                    var rotationQuaternion = new Quaternion();
                    var scaling = Vector3.Zero();
                    // Warning on decompose
                    var mat = bone.getBaseMatrix();
                    if (modifyKey && lastAnimation) {
                        mat = lastAnimation.getKeys()[j].value;
                    }
                    mat.decompose(scaling, rotationQuaternion, translation);
                    if (targetPath === "position") {
                        translation = value;
                    }
                    else if (targetPath === "rotationQuaternion") {
                        rotationQuaternion = value;
                    }
                    else {
                        scaling = value;
                    }
                    value = Matrix.Compose(scaling, rotationQuaternion, translation);
                }
                if (!modifyKey) {
                    keys.push({
                        frame: bufferInput[j],
                        value: value,
                    });
                }
                else if (lastAnimation) {
                    lastAnimation.getKeys()[j].value = value;
                }
            }
            // Finish
            if (!modifyKey && babylonAnimation) {
                babylonAnimation.setKeys(keys);
                targetNode.animations.push(babylonAnimation);
            }
            lastAnimation = babylonAnimation;
            gltfRuntime.scene.stopAnimation(targetNode);
            gltfRuntime.scene.beginAnimation(targetNode, 0, bufferInput[bufferInput.length - 1], true, 1.0);
        }
    }
};
/**
 * Returns the bones transformation matrix
 * @param node
 */
var configureBoneTransformation = function (node) {
    var mat = null;
    if (node.translation || node.rotation || node.scale) {
        var scale = Vector3.FromArray(node.scale || [1, 1, 1]);
        var rotation = Quaternion.FromArray(node.rotation || [0, 0, 0, 1]);
        var position = Vector3.FromArray(node.translation || [0, 0, 0]);
        mat = Matrix.Compose(scale, rotation, position);
    }
    else {
        mat = Matrix.FromArray(node.matrix);
    }
    return mat;
};
/**
 * Returns the parent bone
 * @param gltfRuntime
 * @param skins
 * @param jointName
 * @param newSkeleton
 */
var getParentBone = function (gltfRuntime, skins, jointName, newSkeleton) {
    // Try to find
    for (var i = 0; i < newSkeleton.bones.length; i++) {
        if (newSkeleton.bones[i].name === jointName) {
            return newSkeleton.bones[i];
        }
    }
    // Not found, search in gltf nodes
    var nodes = gltfRuntime.nodes;
    for (var nde in nodes) {
        var node = nodes[nde];
        if (!node.jointName) {
            continue;
        }
        var children = node.children;
        for (var i = 0; i < children.length; i++) {
            var child = gltfRuntime.nodes[children[i]];
            if (!child.jointName) {
                continue;
            }
            if (child.jointName === jointName) {
                var mat = configureBoneTransformation(node);
                var bone = new Bone(node.name || "", newSkeleton, getParentBone(gltfRuntime, skins, node.jointName, newSkeleton), mat);
                bone.id = nde;
                return bone;
            }
        }
    }
    return null;
};
/**
 * Returns the appropriate root node
 * @param nodesToRoot
 * @param id
 */
var getNodeToRoot = function (nodesToRoot, id) {
    for (var i = 0; i < nodesToRoot.length; i++) {
        var nodeToRoot = nodesToRoot[i];
        for (var j = 0; j < nodeToRoot.node.children.length; j++) {
            var child = nodeToRoot.node.children[j];
            if (child === id) {
                return nodeToRoot.bone;
            }
        }
    }
    return null;
};
/**
 * Returns the node with the joint name
 * @param gltfRuntime
 * @param jointName
 */
var getJointNode = function (gltfRuntime, jointName) {
    var nodes = gltfRuntime.nodes;
    var node = nodes[jointName];
    if (node) {
        return {
            node: node,
            id: jointName,
        };
    }
    for (var nde in nodes) {
        node = nodes[nde];
        if (node.jointName === jointName) {
            return {
                node: node,
                id: nde,
            };
        }
    }
    return null;
};
/**
 * Checks if a nodes is in joints
 * @param skins
 * @param id
 */
var nodeIsInJoints = function (skins, id) {
    for (var i = 0; i < skins.jointNames.length; i++) {
        if (skins.jointNames[i] === id) {
            return true;
        }
    }
    return false;
};
/**
 * Fills the nodes to root for bones and builds hierarchy
 * @param gltfRuntime
 * @param newSkeleton
 * @param skins
 * @param nodesToRoot
 */
var getNodesToRoot = function (gltfRuntime, newSkeleton, skins, nodesToRoot) {
    // Creates nodes for root
    for (var nde in gltfRuntime.nodes) {
        var node = gltfRuntime.nodes[nde];
        var id = nde;
        if (!node.jointName || nodeIsInJoints(skins, node.jointName)) {
            continue;
        }
        // Create node to root bone
        var mat = configureBoneTransformation(node);
        var bone = new Bone(node.name || "", newSkeleton, null, mat);
        bone.id = id;
        nodesToRoot.push({ bone: bone, node: node, id: id });
    }
    // Parenting
    for (var i = 0; i < nodesToRoot.length; i++) {
        var nodeToRoot = nodesToRoot[i];
        var children = nodeToRoot.node.children;
        for (var j = 0; j < children.length; j++) {
            var child = null;
            for (var k = 0; k < nodesToRoot.length; k++) {
                if (nodesToRoot[k].id === children[j]) {
                    child = nodesToRoot[k];
                    break;
                }
            }
            if (child) {
                child.bone._parent = nodeToRoot.bone;
                nodeToRoot.bone.children.push(child.bone);
            }
        }
    }
};
/**
 * Imports a skeleton
 * @param gltfRuntime
 * @param skins
 * @param mesh
 * @param newSkeleton
 */
var importSkeleton = function (gltfRuntime, skins, mesh, newSkeleton) {
    if (!newSkeleton) {
        newSkeleton = new Skeleton(skins.name || "", "", gltfRuntime.scene);
    }
    if (!skins.babylonSkeleton) {
        return newSkeleton;
    }
    // Find the root bones
    var nodesToRoot = [];
    var nodesToRootToAdd = [];
    getNodesToRoot(gltfRuntime, newSkeleton, skins, nodesToRoot);
    newSkeleton.bones = [];
    // Joints
    for (var i = 0; i < skins.jointNames.length; i++) {
        var jointNode = getJointNode(gltfRuntime, skins.jointNames[i]);
        if (!jointNode) {
            continue;
        }
        var node = jointNode.node;
        if (!node) {
            Tools.Warn("Joint named " + skins.jointNames[i] + " does not exist");
            continue;
        }
        var id = jointNode.id;
        // Optimize, if the bone already exists...
        var existingBone = gltfRuntime.scene.getBoneById(id);
        if (existingBone) {
            newSkeleton.bones.push(existingBone);
            continue;
        }
        // Search for parent bone
        var foundBone = false;
        var parentBone = null;
        for (var j = 0; j < i; j++) {
            var jointNode_1 = getJointNode(gltfRuntime, skins.jointNames[j]);
            if (!jointNode_1) {
                continue;
            }
            var joint = jointNode_1.node;
            if (!joint) {
                Tools.Warn("Joint named " + skins.jointNames[j] + " does not exist when looking for parent");
                continue;
            }
            var children = joint.children;
            if (!children) {
                continue;
            }
            foundBone = false;
            for (var k = 0; k < children.length; k++) {
                if (children[k] === id) {
                    parentBone = getParentBone(gltfRuntime, skins, skins.jointNames[j], newSkeleton);
                    foundBone = true;
                    break;
                }
            }
            if (foundBone) {
                break;
            }
        }
        // Create bone
        var mat = configureBoneTransformation(node);
        if (!parentBone && nodesToRoot.length > 0) {
            parentBone = getNodeToRoot(nodesToRoot, id);
            if (parentBone) {
                if (nodesToRootToAdd.indexOf(parentBone) === -1) {
                    nodesToRootToAdd.push(parentBone);
                }
            }
        }
        var bone = new Bone(node.jointName || "", newSkeleton, parentBone, mat);
        bone.id = id;
    }
    // Polish
    var bones = newSkeleton.bones;
    newSkeleton.bones = [];
    for (var i = 0; i < skins.jointNames.length; i++) {
        var jointNode = getJointNode(gltfRuntime, skins.jointNames[i]);
        if (!jointNode) {
            continue;
        }
        for (var j = 0; j < bones.length; j++) {
            if (bones[j].id === jointNode.id) {
                newSkeleton.bones.push(bones[j]);
                break;
            }
        }
    }
    newSkeleton.prepare();
    // Finish
    for (var i = 0; i < nodesToRootToAdd.length; i++) {
        newSkeleton.bones.push(nodesToRootToAdd[i]);
    }
    return newSkeleton;
};
/**
 * Imports a mesh and its geometries
 * @param gltfRuntime
 * @param node
 * @param meshes
 * @param id
 * @param newMesh
 */
var importMesh = function (gltfRuntime, node, meshes, id, newMesh) {
    if (!newMesh) {
        gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
        newMesh = new Mesh(node.name || "", gltfRuntime.scene);
        newMesh._parentContainer = gltfRuntime.assetContainer;
        gltfRuntime.scene._blockEntityCollection = false;
        newMesh.id = id;
    }
    if (!node.babylonNode) {
        return newMesh;
    }
    var subMaterials = [];
    var vertexData = null;
    var verticesStarts = new Array();
    var verticesCounts = new Array();
    var indexStarts = new Array();
    var indexCounts = new Array();
    for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
        var meshId = meshes[meshIndex];
        var mesh = gltfRuntime.meshes[meshId];
        if (!mesh) {
            continue;
        }
        // Positions, normals and UVs
        for (var i = 0; i < mesh.primitives.length; i++) {
            // Temporary vertex data
            var tempVertexData = new VertexData();
            var primitive = mesh.primitives[i];
            if (primitive.mode !== 4) {
                // continue;
            }
            var attributes = primitive.attributes;
            var accessor = null;
            var buffer = null;
            // Set positions, normal and uvs
            for (var semantic in attributes) {
                // Link accessor and buffer view
                accessor = gltfRuntime.accessors[attributes[semantic]];
                buffer = GLTFUtils.GetBufferFromAccessor(gltfRuntime, accessor);
                if (semantic === "NORMAL") {
                    tempVertexData.normals = new Float32Array(buffer.length);
                    tempVertexData.normals.set(buffer);
                }
                else if (semantic === "POSITION") {
                    if (GLTFFileLoader.HomogeneousCoordinates) {
                        tempVertexData.positions = new Float32Array(buffer.length - buffer.length / 4);
                        for (var j = 0; j < buffer.length; j += 4) {
                            tempVertexData.positions[j] = buffer[j];
                            tempVertexData.positions[j + 1] = buffer[j + 1];
                            tempVertexData.positions[j + 2] = buffer[j + 2];
                        }
                    }
                    else {
                        tempVertexData.positions = new Float32Array(buffer.length);
                        tempVertexData.positions.set(buffer);
                    }
                    verticesCounts.push(tempVertexData.positions.length);
                }
                else if (semantic.indexOf("TEXCOORD_") !== -1) {
                    var channel = Number(semantic.split("_")[1]);
                    var uvKind = VertexBuffer.UVKind + (channel === 0 ? "" : channel + 1);
                    var uvs = new Float32Array(buffer.length);
                    uvs.set(buffer);
                    normalizeUVs(uvs);
                    tempVertexData.set(uvs, uvKind);
                }
                else if (semantic === "JOINT") {
                    tempVertexData.matricesIndices = new Float32Array(buffer.length);
                    tempVertexData.matricesIndices.set(buffer);
                }
                else if (semantic === "WEIGHT") {
                    tempVertexData.matricesWeights = new Float32Array(buffer.length);
                    tempVertexData.matricesWeights.set(buffer);
                }
                else if (semantic === "COLOR") {
                    tempVertexData.colors = new Float32Array(buffer.length);
                    tempVertexData.colors.set(buffer);
                }
            }
            // Indices
            accessor = gltfRuntime.accessors[primitive.indices];
            if (accessor) {
                buffer = GLTFUtils.GetBufferFromAccessor(gltfRuntime, accessor);
                tempVertexData.indices = new Int32Array(buffer.length);
                tempVertexData.indices.set(buffer);
                indexCounts.push(tempVertexData.indices.length);
            }
            else {
                // Set indices on the fly
                var indices = [];
                for (var j = 0; j < tempVertexData.positions.length / 3; j++) {
                    indices.push(j);
                }
                tempVertexData.indices = new Int32Array(indices);
                indexCounts.push(tempVertexData.indices.length);
            }
            if (!vertexData) {
                vertexData = tempVertexData;
            }
            else {
                vertexData.merge(tempVertexData);
            }
            // Sub material
            var material_1 = gltfRuntime.scene.getMaterialById(primitive.material);
            subMaterials.push(material_1 === null ? GLTFUtils.GetDefaultMaterial(gltfRuntime.scene) : material_1);
            // Update vertices start and index start
            verticesStarts.push(verticesStarts.length === 0 ? 0 : verticesStarts[verticesStarts.length - 1] + verticesCounts[verticesCounts.length - 2]);
            indexStarts.push(indexStarts.length === 0 ? 0 : indexStarts[indexStarts.length - 1] + indexCounts[indexCounts.length - 2]);
        }
    }
    var material;
    gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
    if (subMaterials.length > 1) {
        material = new MultiMaterial("multimat" + id, gltfRuntime.scene);
        material.subMaterials = subMaterials;
    }
    else {
        material = new StandardMaterial("multimat" + id, gltfRuntime.scene);
    }
    if (subMaterials.length === 1) {
        material = subMaterials[0];
    }
    material._parentContainer = gltfRuntime.assetContainer;
    if (!newMesh.material) {
        newMesh.material = material;
    }
    // Apply geometry
    new Geometry(id, gltfRuntime.scene, vertexData, false, newMesh);
    newMesh.computeWorldMatrix(true);
    gltfRuntime.scene._blockEntityCollection = false;
    // Apply submeshes
    newMesh.subMeshes = [];
    var index = 0;
    for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
        var meshId = meshes[meshIndex];
        var mesh = gltfRuntime.meshes[meshId];
        if (!mesh) {
            continue;
        }
        for (var i = 0; i < mesh.primitives.length; i++) {
            if (mesh.primitives[i].mode !== 4) {
                //continue;
            }
            SubMesh.AddToMesh(index, verticesStarts[index], verticesCounts[index], indexStarts[index], indexCounts[index], newMesh, newMesh, true);
            index++;
        }
    }
    // Finish
    return newMesh;
};
/**
 * Configure node transformation from position, rotation and scaling
 * @param newNode
 * @param position
 * @param rotation
 * @param scaling
 */
var configureNode = function (newNode, position, rotation, scaling) {
    if (newNode.position) {
        newNode.position = position;
    }
    if (newNode.rotationQuaternion || newNode.rotation) {
        newNode.rotationQuaternion = rotation;
    }
    if (newNode.scaling) {
        newNode.scaling = scaling;
    }
};
/**
 * Configures node from transformation matrix
 * @param newNode
 * @param node
 */
var configureNodeFromMatrix = function (newNode, node) {
    if (node.matrix) {
        var position = new Vector3(0, 0, 0);
        var rotation = new Quaternion();
        var scaling = new Vector3(0, 0, 0);
        var mat = Matrix.FromArray(node.matrix);
        mat.decompose(scaling, rotation, position);
        configureNode(newNode, position, rotation, scaling);
    }
    else if (node.translation && node.rotation && node.scale) {
        configureNode(newNode, Vector3.FromArray(node.translation), Quaternion.FromArray(node.rotation), Vector3.FromArray(node.scale));
    }
    newNode.computeWorldMatrix(true);
};
/**
 * Imports a node
 * @param gltfRuntime
 * @param node
 * @param id
 */
var importNode = function (gltfRuntime, node, id) {
    var lastNode = null;
    if (gltfRuntime.importOnlyMeshes && (node.skin || node.meshes)) {
        if (gltfRuntime.importMeshesNames && gltfRuntime.importMeshesNames.length > 0 && gltfRuntime.importMeshesNames.indexOf(node.name || "") === -1) {
            return null;
        }
    }
    // Meshes
    if (node.skin) {
        if (node.meshes) {
            var skin = gltfRuntime.skins[node.skin];
            var newMesh = importMesh(gltfRuntime, node, node.meshes, id, node.babylonNode);
            newMesh.skeleton = gltfRuntime.scene.getLastSkeletonById(node.skin);
            if (newMesh.skeleton === null) {
                newMesh.skeleton = importSkeleton(gltfRuntime, skin, newMesh, skin.babylonSkeleton);
                if (!skin.babylonSkeleton) {
                    skin.babylonSkeleton = newMesh.skeleton;
                }
            }
            lastNode = newMesh;
        }
    }
    else if (node.meshes) {
        /**
         * Improve meshes property
         */
        var newMesh = importMesh(gltfRuntime, node, node.mesh ? [node.mesh] : node.meshes, id, node.babylonNode);
        lastNode = newMesh;
    }
    // Lights
    else if (node.light && !node.babylonNode && !gltfRuntime.importOnlyMeshes) {
        var light = gltfRuntime.lights[node.light];
        if (light) {
            if (light.type === "ambient") {
                var ambienLight = light[light.type];
                var hemiLight = new HemisphericLight(node.light, Vector3.Zero(), gltfRuntime.scene);
                hemiLight.name = node.name || "";
                if (ambienLight.color) {
                    hemiLight.diffuse = Color3.FromArray(ambienLight.color);
                }
                lastNode = hemiLight;
            }
            else if (light.type === "directional") {
                var directionalLight = light[light.type];
                var dirLight = new DirectionalLight(node.light, Vector3.Zero(), gltfRuntime.scene);
                dirLight.name = node.name || "";
                if (directionalLight.color) {
                    dirLight.diffuse = Color3.FromArray(directionalLight.color);
                }
                lastNode = dirLight;
            }
            else if (light.type === "point") {
                var pointLight = light[light.type];
                var ptLight = new PointLight(node.light, Vector3.Zero(), gltfRuntime.scene);
                ptLight.name = node.name || "";
                if (pointLight.color) {
                    ptLight.diffuse = Color3.FromArray(pointLight.color);
                }
                lastNode = ptLight;
            }
            else if (light.type === "spot") {
                var spotLight = light[light.type];
                var spLight = new SpotLight(node.light, Vector3.Zero(), Vector3.Zero(), 0, 0, gltfRuntime.scene);
                spLight.name = node.name || "";
                if (spotLight.color) {
                    spLight.diffuse = Color3.FromArray(spotLight.color);
                }
                if (spotLight.fallOfAngle) {
                    spLight.angle = spotLight.fallOfAngle;
                }
                if (spotLight.fallOffExponent) {
                    spLight.exponent = spotLight.fallOffExponent;
                }
                lastNode = spLight;
            }
        }
    }
    // Cameras
    else if (node.camera && !node.babylonNode && !gltfRuntime.importOnlyMeshes) {
        var camera = gltfRuntime.cameras[node.camera];
        if (camera) {
            gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
            if (camera.type === "orthographic") {
                var orthoCamera = new FreeCamera(node.camera, Vector3.Zero(), gltfRuntime.scene, false);
                orthoCamera.name = node.name || "";
                orthoCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
                orthoCamera.attachControl();
                lastNode = orthoCamera;
                orthoCamera._parentContainer = gltfRuntime.assetContainer;
            }
            else if (camera.type === "perspective") {
                var perspectiveCamera = camera[camera.type];
                var persCamera = new FreeCamera(node.camera, Vector3.Zero(), gltfRuntime.scene, false);
                persCamera.name = node.name || "";
                persCamera.attachControl();
                if (!perspectiveCamera.aspectRatio) {
                    perspectiveCamera.aspectRatio = gltfRuntime.scene.getEngine().getRenderWidth() / gltfRuntime.scene.getEngine().getRenderHeight();
                }
                if (perspectiveCamera.znear && perspectiveCamera.zfar) {
                    persCamera.maxZ = perspectiveCamera.zfar;
                    persCamera.minZ = perspectiveCamera.znear;
                }
                lastNode = persCamera;
                persCamera._parentContainer = gltfRuntime.assetContainer;
            }
            gltfRuntime.scene._blockEntityCollection = false;
        }
    }
    // Empty node
    if (!node.jointName) {
        if (node.babylonNode) {
            return node.babylonNode;
        }
        else if (lastNode === null) {
            gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
            var dummy = new Mesh(node.name || "", gltfRuntime.scene);
            dummy._parentContainer = gltfRuntime.assetContainer;
            gltfRuntime.scene._blockEntityCollection = false;
            node.babylonNode = dummy;
            lastNode = dummy;
        }
    }
    if (lastNode !== null) {
        if (node.matrix && lastNode instanceof Mesh) {
            configureNodeFromMatrix(lastNode, node);
        }
        else {
            var translation = node.translation || [0, 0, 0];
            var rotation = node.rotation || [0, 0, 0, 1];
            var scale = node.scale || [1, 1, 1];
            configureNode(lastNode, Vector3.FromArray(translation), Quaternion.FromArray(rotation), Vector3.FromArray(scale));
        }
        lastNode.updateCache(true);
        node.babylonNode = lastNode;
    }
    return lastNode;
};
/**
 * Traverses nodes and creates them
 * @param gltfRuntime
 * @param id
 * @param parent
 * @param meshIncluded
 */
var traverseNodes = function (gltfRuntime, id, parent, meshIncluded) {
    if (meshIncluded === void 0) { meshIncluded = false; }
    var node = gltfRuntime.nodes[id];
    var newNode = null;
    if (gltfRuntime.importOnlyMeshes && !meshIncluded && gltfRuntime.importMeshesNames) {
        if (gltfRuntime.importMeshesNames.indexOf(node.name || "") !== -1 || gltfRuntime.importMeshesNames.length === 0) {
            meshIncluded = true;
        }
        else {
            meshIncluded = false;
        }
    }
    else {
        meshIncluded = true;
    }
    if (!node.jointName && meshIncluded) {
        newNode = importNode(gltfRuntime, node, id);
        if (newNode !== null) {
            newNode.id = id;
            newNode.parent = parent;
        }
    }
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            traverseNodes(gltfRuntime, node.children[i], newNode, meshIncluded);
        }
    }
};
/**
 * do stuff after buffers, shaders are loaded (e.g. hook up materials, load animations, etc.)
 * @param gltfRuntime
 */
var postLoad = function (gltfRuntime) {
    // Nodes
    var currentScene = gltfRuntime.currentScene;
    if (currentScene) {
        for (var i = 0; i < currentScene.nodes.length; i++) {
            traverseNodes(gltfRuntime, currentScene.nodes[i], null);
        }
    }
    else {
        for (var thing in gltfRuntime.scenes) {
            currentScene = gltfRuntime.scenes[thing];
            for (var i = 0; i < currentScene.nodes.length; i++) {
                traverseNodes(gltfRuntime, currentScene.nodes[i], null);
            }
        }
    }
    // Set animations
    loadAnimations(gltfRuntime);
    for (var i = 0; i < gltfRuntime.scene.skeletons.length; i++) {
        var skeleton = gltfRuntime.scene.skeletons[i];
        gltfRuntime.scene.beginAnimation(skeleton, 0, Number.MAX_VALUE, true, 1.0);
    }
};
/**
 * onBind shaderrs callback to set uniforms and matrices
 * @param mesh
 * @param gltfRuntime
 * @param unTreatedUniforms
 * @param shaderMaterial
 * @param technique
 * @param material
 * @param onSuccess
 */
var onBindShaderMaterial = function (mesh, gltfRuntime, unTreatedUniforms, shaderMaterial, technique, material, onSuccess) {
    var materialValues = material.values || technique.parameters;
    for (var unif in unTreatedUniforms) {
        var uniform = unTreatedUniforms[unif];
        var type = uniform.type;
        if (type === EParameterType.FLOAT_MAT2 || type === EParameterType.FLOAT_MAT3 || type === EParameterType.FLOAT_MAT4) {
            if (uniform.semantic && !uniform.source && !uniform.node) {
                GLTFUtils.SetMatrix(gltfRuntime.scene, mesh, uniform, unif, shaderMaterial.getEffect());
            }
            else if (uniform.semantic && (uniform.source || uniform.node)) {
                var source = gltfRuntime.scene.getNodeByName(uniform.source || uniform.node || "");
                if (source === null) {
                    source = gltfRuntime.scene.getNodeById(uniform.source || uniform.node || "");
                }
                if (source === null) {
                    continue;
                }
                GLTFUtils.SetMatrix(gltfRuntime.scene, source, uniform, unif, shaderMaterial.getEffect());
            }
        }
        else {
            var value = materialValues[technique.uniforms[unif]];
            if (!value) {
                continue;
            }
            if (type === EParameterType.SAMPLER_2D) {
                var texture = gltfRuntime.textures[material.values ? value : uniform.value].babylonTexture;
                if (texture === null || texture === undefined) {
                    continue;
                }
                shaderMaterial.getEffect().setTexture(unif, texture);
            }
            else {
                GLTFUtils.SetUniform(shaderMaterial.getEffect(), unif, value, type);
            }
        }
    }
    onSuccess(shaderMaterial);
};
/**
 * Prepare uniforms to send the only one time
 * Loads the appropriate textures
 * @param gltfRuntime
 * @param shaderMaterial
 * @param technique
 * @param material
 */
var prepareShaderMaterialUniforms = function (gltfRuntime, shaderMaterial, technique, material, unTreatedUniforms) {
    var materialValues = material.values || technique.parameters;
    var techniqueUniforms = technique.uniforms;
    var _loop_1 = function (unif) {
        var uniform = unTreatedUniforms[unif];
        var type = uniform.type;
        var value = materialValues[techniqueUniforms[unif]];
        if (value === undefined) {
            // In case the value is the same for all materials
            value = uniform.value;
        }
        if (!value) {
            return "continue";
        }
        var onLoadTexture = function (uniformName) {
            return function (texture) {
                if (uniform.value && uniformName) {
                    // Static uniform
                    shaderMaterial.setTexture(uniformName, texture);
                    delete unTreatedUniforms[uniformName];
                }
            };
        };
        // Texture (sampler2D)
        if (type === EParameterType.SAMPLER_2D) {
            GLTFLoaderExtension.LoadTextureAsync(gltfRuntime, material.values ? value : uniform.value, onLoadTexture(unif), function () { return onLoadTexture(null); });
        }
        // Others
        else {
            if (uniform.value && GLTFUtils.SetUniform(shaderMaterial, unif, material.values ? value : uniform.value, type)) {
                // Static uniform
                delete unTreatedUniforms[unif];
            }
        }
    };
    /**
     * Prepare values here (not matrices)
     */
    for (var unif in unTreatedUniforms) {
        _loop_1(unif);
    }
};
/**
 * Shader compilation failed
 * @param program
 * @param shaderMaterial
 * @param onError
 */
var onShaderCompileError = function (program, shaderMaterial, onError) {
    return function (effect, error) {
        shaderMaterial.dispose(true);
        onError("Cannot compile program named " + program.name + ". Error: " + error + ". Default material will be applied");
    };
};
/**
 * Shader compilation success
 * @param gltfRuntime
 * @param shaderMaterial
 * @param technique
 * @param material
 * @param unTreatedUniforms
 * @param onSuccess
 */
var onShaderCompileSuccess = function (gltfRuntime, shaderMaterial, technique, material, unTreatedUniforms, onSuccess) {
    return function (_) {
        prepareShaderMaterialUniforms(gltfRuntime, shaderMaterial, technique, material, unTreatedUniforms);
        shaderMaterial.onBind = function (mesh) {
            onBindShaderMaterial(mesh, gltfRuntime, unTreatedUniforms, shaderMaterial, technique, material, onSuccess);
        };
    };
};
/**
 * Returns the appropriate uniform if already handled by babylon
 * @param tokenizer
 * @param technique
 */
var parseShaderUniforms = function (tokenizer, technique, unTreatedUniforms) {
    for (var unif in technique.uniforms) {
        var uniform = technique.uniforms[unif];
        var uniformParameter = technique.parameters[uniform];
        if (tokenizer.currentIdentifier === unif) {
            if (uniformParameter.semantic && !uniformParameter.source && !uniformParameter.node) {
                var transformIndex = glTFTransforms.indexOf(uniformParameter.semantic);
                if (transformIndex !== -1) {
                    delete unTreatedUniforms[unif];
                    return babylonTransforms[transformIndex];
                }
            }
        }
    }
    return tokenizer.currentIdentifier;
};
/**
 * All shaders loaded. Create materials one by one
 * @param gltfRuntime
 */
var importMaterials = function (gltfRuntime) {
    // Create materials
    for (var mat in gltfRuntime.materials) {
        GLTFLoaderExtension.LoadMaterialAsync(gltfRuntime, mat, function () { }, function () { });
    }
};
/**
 * Implementation of the base glTF spec
 * @hidden
 */
var GLTFLoaderBase = /** @class */ (function () {
    function GLTFLoaderBase() {
    }
    GLTFLoaderBase.CreateRuntime = function (parsedData, scene, rootUrl) {
        var gltfRuntime = {
            extensions: {},
            accessors: {},
            buffers: {},
            bufferViews: {},
            meshes: {},
            lights: {},
            cameras: {},
            nodes: {},
            images: {},
            textures: {},
            shaders: {},
            programs: {},
            samplers: {},
            techniques: {},
            materials: {},
            animations: {},
            skins: {},
            extensionsUsed: [],
            scenes: {},
            buffersCount: 0,
            shaderscount: 0,
            scene: scene,
            rootUrl: rootUrl,
            loadedBufferCount: 0,
            loadedBufferViews: {},
            loadedShaderCount: 0,
            importOnlyMeshes: false,
            dummyNodes: [],
            assetContainer: null,
        };
        // Parse
        if (parsedData.extensions) {
            parseObject(parsedData.extensions, "extensions", gltfRuntime);
        }
        if (parsedData.extensionsUsed) {
            parseObject(parsedData.extensionsUsed, "extensionsUsed", gltfRuntime);
        }
        if (parsedData.buffers) {
            parseBuffers(parsedData.buffers, gltfRuntime);
        }
        if (parsedData.bufferViews) {
            parseObject(parsedData.bufferViews, "bufferViews", gltfRuntime);
        }
        if (parsedData.accessors) {
            parseObject(parsedData.accessors, "accessors", gltfRuntime);
        }
        if (parsedData.meshes) {
            parseObject(parsedData.meshes, "meshes", gltfRuntime);
        }
        if (parsedData.lights) {
            parseObject(parsedData.lights, "lights", gltfRuntime);
        }
        if (parsedData.cameras) {
            parseObject(parsedData.cameras, "cameras", gltfRuntime);
        }
        if (parsedData.nodes) {
            parseObject(parsedData.nodes, "nodes", gltfRuntime);
        }
        if (parsedData.images) {
            parseObject(parsedData.images, "images", gltfRuntime);
        }
        if (parsedData.textures) {
            parseObject(parsedData.textures, "textures", gltfRuntime);
        }
        if (parsedData.shaders) {
            parseShaders(parsedData.shaders, gltfRuntime);
        }
        if (parsedData.programs) {
            parseObject(parsedData.programs, "programs", gltfRuntime);
        }
        if (parsedData.samplers) {
            parseObject(parsedData.samplers, "samplers", gltfRuntime);
        }
        if (parsedData.techniques) {
            parseObject(parsedData.techniques, "techniques", gltfRuntime);
        }
        if (parsedData.materials) {
            parseObject(parsedData.materials, "materials", gltfRuntime);
        }
        if (parsedData.animations) {
            parseObject(parsedData.animations, "animations", gltfRuntime);
        }
        if (parsedData.skins) {
            parseObject(parsedData.skins, "skins", gltfRuntime);
        }
        if (parsedData.scenes) {
            gltfRuntime.scenes = parsedData.scenes;
        }
        if (parsedData.scene && parsedData.scenes) {
            gltfRuntime.currentScene = parsedData.scenes[parsedData.scene];
        }
        return gltfRuntime;
    };
    GLTFLoaderBase.LoadBufferAsync = function (gltfRuntime, id, onSuccess, onError, onProgress) {
        var buffer = gltfRuntime.buffers[id];
        if (Tools.IsBase64(buffer.uri)) {
            setTimeout(function () { return onSuccess(new Uint8Array(Tools.DecodeBase64(buffer.uri))); });
        }
        else {
            Tools.LoadFile(gltfRuntime.rootUrl + buffer.uri, function (data) { return onSuccess(new Uint8Array(data)); }, onProgress, undefined, true, function (request) {
                if (request) {
                    onError(request.status + " " + request.statusText);
                }
            });
        }
    };
    GLTFLoaderBase.LoadTextureBufferAsync = function (gltfRuntime, id, onSuccess, onError) {
        var texture = gltfRuntime.textures[id];
        if (!texture || !texture.source) {
            onError("");
            return;
        }
        if (texture.babylonTexture) {
            onSuccess(null);
            return;
        }
        var source = gltfRuntime.images[texture.source];
        if (Tools.IsBase64(source.uri)) {
            setTimeout(function () { return onSuccess(new Uint8Array(Tools.DecodeBase64(source.uri))); });
        }
        else {
            Tools.LoadFile(gltfRuntime.rootUrl + source.uri, function (data) { return onSuccess(new Uint8Array(data)); }, undefined, undefined, true, function (request) {
                if (request) {
                    onError(request.status + " " + request.statusText);
                }
            });
        }
    };
    GLTFLoaderBase.CreateTextureAsync = function (gltfRuntime, id, buffer, onSuccess) {
        var texture = gltfRuntime.textures[id];
        if (texture.babylonTexture) {
            onSuccess(texture.babylonTexture);
            return;
        }
        var sampler = gltfRuntime.samplers[texture.sampler];
        var createMipMaps = sampler.minFilter === ETextureFilterType.NEAREST_MIPMAP_NEAREST ||
            sampler.minFilter === ETextureFilterType.NEAREST_MIPMAP_LINEAR ||
            sampler.minFilter === ETextureFilterType.LINEAR_MIPMAP_NEAREST ||
            sampler.minFilter === ETextureFilterType.LINEAR_MIPMAP_LINEAR;
        var samplingMode = Texture.BILINEAR_SAMPLINGMODE;
        var blob = buffer == null ? new Blob() : new Blob([buffer]);
        var blobURL = URL.createObjectURL(blob);
        var revokeBlobURL = function () { return URL.revokeObjectURL(blobURL); };
        var newTexture = new Texture(blobURL, gltfRuntime.scene, !createMipMaps, true, samplingMode, revokeBlobURL, revokeBlobURL);
        if (sampler.wrapS !== undefined) {
            newTexture.wrapU = GLTFUtils.GetWrapMode(sampler.wrapS);
        }
        if (sampler.wrapT !== undefined) {
            newTexture.wrapV = GLTFUtils.GetWrapMode(sampler.wrapT);
        }
        newTexture.name = id;
        texture.babylonTexture = newTexture;
        onSuccess(newTexture);
    };
    GLTFLoaderBase.LoadShaderStringAsync = function (gltfRuntime, id, onSuccess, onError) {
        var shader = gltfRuntime.shaders[id];
        if (Tools.IsBase64(shader.uri)) {
            var shaderString = atob(shader.uri.split(",")[1]);
            if (onSuccess) {
                onSuccess(shaderString);
            }
        }
        else {
            Tools.LoadFile(gltfRuntime.rootUrl + shader.uri, onSuccess, undefined, undefined, false, function (request) {
                if (request && onError) {
                    onError(request.status + " " + request.statusText);
                }
            });
        }
    };
    GLTFLoaderBase.LoadMaterialAsync = function (gltfRuntime, id, onSuccess, onError) {
        var material = gltfRuntime.materials[id];
        if (!material.technique) {
            if (onError) {
                onError("No technique found.");
            }
            return;
        }
        var technique = gltfRuntime.techniques[material.technique];
        if (!technique) {
            gltfRuntime.scene._blockEntityCollection = !!gltfRuntime.assetContainer;
            var defaultMaterial = new StandardMaterial(id, gltfRuntime.scene);
            defaultMaterial._parentContainer = gltfRuntime.assetContainer;
            gltfRuntime.scene._blockEntityCollection = false;
            defaultMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
            defaultMaterial.sideOrientation = Material.CounterClockWiseSideOrientation;
            onSuccess(defaultMaterial);
            return;
        }
        var program = gltfRuntime.programs[technique.program];
        var states = technique.states;
        var vertexShader = Effect.ShadersStore[program.vertexShader + "VertexShader"];
        var pixelShader = Effect.ShadersStore[program.fragmentShader + "PixelShader"];
        var newVertexShader = "";
        var newPixelShader = "";
        var vertexTokenizer = new Tokenizer(vertexShader);
        var pixelTokenizer = new Tokenizer(pixelShader);
        var unTreatedUniforms = {};
        var uniforms = [];
        var attributes = [];
        var samplers = [];
        // Fill uniform, sampler2D and attributes
        for (var unif in technique.uniforms) {
            var uniform = technique.uniforms[unif];
            var uniformParameter = technique.parameters[uniform];
            unTreatedUniforms[unif] = uniformParameter;
            if (uniformParameter.semantic && !uniformParameter.node && !uniformParameter.source) {
                var transformIndex = glTFTransforms.indexOf(uniformParameter.semantic);
                if (transformIndex !== -1) {
                    uniforms.push(babylonTransforms[transformIndex]);
                    delete unTreatedUniforms[unif];
                }
                else {
                    uniforms.push(unif);
                }
            }
            else if (uniformParameter.type === EParameterType.SAMPLER_2D) {
                samplers.push(unif);
            }
            else {
                uniforms.push(unif);
            }
        }
        for (var attr in technique.attributes) {
            var attribute = technique.attributes[attr];
            var attributeParameter = technique.parameters[attribute];
            if (attributeParameter.semantic) {
                var name_1 = getAttribute(attributeParameter);
                if (name_1) {
                    attributes.push(name_1);
                }
            }
        }
        // Configure vertex shader
        while (!vertexTokenizer.isEnd() && vertexTokenizer.getNextToken()) {
            var tokenType = vertexTokenizer.currentToken;
            if (tokenType !== ETokenType.IDENTIFIER) {
                newVertexShader += vertexTokenizer.currentString;
                continue;
            }
            var foundAttribute = false;
            for (var attr in technique.attributes) {
                var attribute = technique.attributes[attr];
                var attributeParameter = technique.parameters[attribute];
                if (vertexTokenizer.currentIdentifier === attr && attributeParameter.semantic) {
                    newVertexShader += getAttribute(attributeParameter);
                    foundAttribute = true;
                    break;
                }
            }
            if (foundAttribute) {
                continue;
            }
            newVertexShader += parseShaderUniforms(vertexTokenizer, technique, unTreatedUniforms);
        }
        // Configure pixel shader
        while (!pixelTokenizer.isEnd() && pixelTokenizer.getNextToken()) {
            var tokenType = pixelTokenizer.currentToken;
            if (tokenType !== ETokenType.IDENTIFIER) {
                newPixelShader += pixelTokenizer.currentString;
                continue;
            }
            newPixelShader += parseShaderUniforms(pixelTokenizer, technique, unTreatedUniforms);
        }
        // Create shader material
        var shaderPath = {
            vertex: program.vertexShader + id,
            fragment: program.fragmentShader + id,
        };
        var options = {
            attributes: attributes,
            uniforms: uniforms,
            samplers: samplers,
            needAlphaBlending: states && states.enable && states.enable.indexOf(3042) !== -1,
        };
        Effect.ShadersStore[program.vertexShader + id + "VertexShader"] = newVertexShader;
        Effect.ShadersStore[program.fragmentShader + id + "PixelShader"] = newPixelShader;
        var shaderMaterial = new ShaderMaterial(id, gltfRuntime.scene, shaderPath, options);
        shaderMaterial.onError = onShaderCompileError(program, shaderMaterial, onError);
        shaderMaterial.onCompiled = onShaderCompileSuccess(gltfRuntime, shaderMaterial, technique, material, unTreatedUniforms, onSuccess);
        shaderMaterial.sideOrientation = Material.CounterClockWiseSideOrientation;
        if (states && states.functions) {
            var functions = states.functions;
            if (functions.cullFace && functions.cullFace[0] !== ECullingType.BACK) {
                shaderMaterial.backFaceCulling = false;
            }
            var blendFunc = functions.blendFuncSeparate;
            if (blendFunc) {
                if (blendFunc[0] === EBlendingFunction.SRC_ALPHA &&
                    blendFunc[1] === EBlendingFunction.ONE_MINUS_SRC_ALPHA &&
                    blendFunc[2] === EBlendingFunction.ONE &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_COMBINE;
                }
                else if (blendFunc[0] === EBlendingFunction.ONE &&
                    blendFunc[1] === EBlendingFunction.ONE &&
                    blendFunc[2] === EBlendingFunction.ZERO &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_ONEONE;
                }
                else if (blendFunc[0] === EBlendingFunction.SRC_ALPHA &&
                    blendFunc[1] === EBlendingFunction.ONE &&
                    blendFunc[2] === EBlendingFunction.ZERO &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_ADD;
                }
                else if (blendFunc[0] === EBlendingFunction.ZERO &&
                    blendFunc[1] === EBlendingFunction.ONE_MINUS_SRC_COLOR &&
                    blendFunc[2] === EBlendingFunction.ONE &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_SUBTRACT;
                }
                else if (blendFunc[0] === EBlendingFunction.DST_COLOR &&
                    blendFunc[1] === EBlendingFunction.ZERO &&
                    blendFunc[2] === EBlendingFunction.ONE &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_MULTIPLY;
                }
                else if (blendFunc[0] === EBlendingFunction.SRC_ALPHA &&
                    blendFunc[1] === EBlendingFunction.ONE_MINUS_SRC_COLOR &&
                    blendFunc[2] === EBlendingFunction.ONE &&
                    blendFunc[3] === EBlendingFunction.ONE) {
                    shaderMaterial.alphaMode = Constants.ALPHA_MAXIMIZED;
                }
            }
        }
    };
    return GLTFLoaderBase;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFLoaderBase', { enumerable: true, configurable: true, get: function() { return GLTFLoaderBase; } });
/**
 * glTF V1 Loader
 * @hidden
 */
var GLTFLoader = /** @class */ (function () {
    function GLTFLoader() {
    }
    GLTFLoader.RegisterExtension = function (extension) {
        if (GLTFLoader.Extensions[extension.name]) {
            Tools.Error('Tool with the same name "' + extension.name + '" already exists');
            return;
        }
        GLTFLoader.Extensions[extension.name] = extension;
    };
    GLTFLoader.prototype.dispose = function () {
        // do nothing
    };
    GLTFLoader.prototype._importMeshAsync = function (meshesNames, scene, data, rootUrl, assetContainer, onSuccess, onProgress, onError) {
        var _this = this;
        scene.useRightHandedSystem = true;
        GLTFLoaderExtension.LoadRuntimeAsync(scene, data, rootUrl, function (gltfRuntime) {
            gltfRuntime.assetContainer = assetContainer;
            gltfRuntime.importOnlyMeshes = true;
            if (meshesNames === "") {
                gltfRuntime.importMeshesNames = [];
            }
            else if (typeof meshesNames === "string") {
                gltfRuntime.importMeshesNames = [meshesNames];
            }
            else if (meshesNames && !(meshesNames instanceof Array)) {
                gltfRuntime.importMeshesNames = [meshesNames];
            }
            else {
                gltfRuntime.importMeshesNames = [];
                Tools.Warn("Argument meshesNames must be of type string or string[]");
            }
            // Create nodes
            _this._createNodes(gltfRuntime);
            var meshes = new Array();
            var skeletons = new Array();
            // Fill arrays of meshes and skeletons
            for (var nde in gltfRuntime.nodes) {
                var node = gltfRuntime.nodes[nde];
                if (node.babylonNode instanceof AbstractMesh) {
                    meshes.push(node.babylonNode);
                }
            }
            for (var skl in gltfRuntime.skins) {
                var skin = gltfRuntime.skins[skl];
                if (skin.babylonSkeleton instanceof Skeleton) {
                    skeletons.push(skin.babylonSkeleton);
                }
            }
            // Load buffers, shaders, materials, etc.
            _this._loadBuffersAsync(gltfRuntime, function () {
                _this._loadShadersAsync(gltfRuntime, function () {
                    importMaterials(gltfRuntime);
                    postLoad(gltfRuntime);
                    if (!GLTFFileLoader.IncrementalLoading && onSuccess) {
                        onSuccess(meshes, skeletons);
                    }
                });
            });
            if (GLTFFileLoader.IncrementalLoading && onSuccess) {
                onSuccess(meshes, skeletons);
            }
        }, onError);
        return true;
    };
    /**
     * Imports one or more meshes from a loaded gltf file and adds them to the scene
     * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
     * @param scene the scene the meshes should be added to
     * @param assetContainer defines the asset container to use (can be null)
     * @param data gltf data containing information of the meshes in a loaded file
     * @param rootUrl root url to load from
     * @param onProgress event that fires when loading progress has occured
     * @returns a promise containg the loaded meshes, particles, skeletons and animations
     */
    GLTFLoader.prototype.importMeshAsync = function (meshesNames, scene, assetContainer, data, rootUrl, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._importMeshAsync(meshesNames, scene, data, rootUrl, assetContainer, function (meshes, skeletons) {
                resolve({
                    meshes: meshes,
                    particleSystems: [],
                    skeletons: skeletons,
                    animationGroups: [],
                    lights: [],
                    transformNodes: [],
                    geometries: [],
                });
            }, onProgress, function (message) {
                reject(new Error(message));
            });
        });
    };
    GLTFLoader.prototype._loadAsync = function (scene, data, rootUrl, onSuccess, onProgress, onError) {
        var _this = this;
        scene.useRightHandedSystem = true;
        GLTFLoaderExtension.LoadRuntimeAsync(scene, data, rootUrl, function (gltfRuntime) {
            // Load runtime extensios
            GLTFLoaderExtension.LoadRuntimeExtensionsAsync(gltfRuntime, function () {
                // Create nodes
                _this._createNodes(gltfRuntime);
                // Load buffers, shaders, materials, etc.
                _this._loadBuffersAsync(gltfRuntime, function () {
                    _this._loadShadersAsync(gltfRuntime, function () {
                        importMaterials(gltfRuntime);
                        postLoad(gltfRuntime);
                        if (!GLTFFileLoader.IncrementalLoading) {
                            onSuccess();
                        }
                    });
                });
                if (GLTFFileLoader.IncrementalLoading) {
                    onSuccess();
                }
            }, onError);
        }, onError);
    };
    /**
     * Imports all objects from a loaded gltf file and adds them to the scene
     * @param scene the scene the objects should be added to
     * @param data gltf data containing information of the meshes in a loaded file
     * @param rootUrl root url to load from
     * @param onProgress event that fires when loading progress has occured
     * @returns a promise which completes when objects have been loaded to the scene
     */
    GLTFLoader.prototype.loadAsync = function (scene, data, rootUrl, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._loadAsync(scene, data, rootUrl, function () {
                resolve();
            }, onProgress, function (message) {
                reject(new Error(message));
            });
        });
    };
    GLTFLoader.prototype._loadShadersAsync = function (gltfRuntime, onload) {
        var hasShaders = false;
        var processShader = function (sha, shader) {
            GLTFLoaderExtension.LoadShaderStringAsync(gltfRuntime, sha, function (shaderString) {
                if (shaderString instanceof ArrayBuffer) {
                    return;
                }
                gltfRuntime.loadedShaderCount++;
                if (shaderString) {
                    Effect.ShadersStore[sha + (shader.type === EShaderType.VERTEX ? "VertexShader" : "PixelShader")] = shaderString;
                }
                if (gltfRuntime.loadedShaderCount === gltfRuntime.shaderscount) {
                    onload();
                }
            }, function () {
                Tools.Error("Error when loading shader program named " + sha + " located at " + shader.uri);
            });
        };
        for (var sha in gltfRuntime.shaders) {
            hasShaders = true;
            var shader = gltfRuntime.shaders[sha];
            if (shader) {
                processShader.bind(this, sha, shader)();
            }
            else {
                Tools.Error("No shader named: " + sha);
            }
        }
        if (!hasShaders) {
            onload();
        }
    };
    GLTFLoader.prototype._loadBuffersAsync = function (gltfRuntime, onLoad) {
        var hasBuffers = false;
        var processBuffer = function (buf, buffer) {
            GLTFLoaderExtension.LoadBufferAsync(gltfRuntime, buf, function (bufferView) {
                gltfRuntime.loadedBufferCount++;
                if (bufferView) {
                    if (bufferView.byteLength != gltfRuntime.buffers[buf].byteLength) {
                        Tools.Error("Buffer named " + buf + " is length " + bufferView.byteLength + ". Expected: " + buffer.byteLength); // Improve error message
                    }
                    gltfRuntime.loadedBufferViews[buf] = bufferView;
                }
                if (gltfRuntime.loadedBufferCount === gltfRuntime.buffersCount) {
                    onLoad();
                }
            }, function () {
                Tools.Error("Error when loading buffer named " + buf + " located at " + buffer.uri);
            });
        };
        for (var buf in gltfRuntime.buffers) {
            hasBuffers = true;
            var buffer = gltfRuntime.buffers[buf];
            if (buffer) {
                processBuffer.bind(this, buf, buffer)();
            }
            else {
                Tools.Error("No buffer named: " + buf);
            }
        }
        if (!hasBuffers) {
            onLoad();
        }
    };
    GLTFLoader.prototype._createNodes = function (gltfRuntime) {
        var currentScene = gltfRuntime.currentScene;
        if (currentScene) {
            // Only one scene even if multiple scenes are defined
            for (var i = 0; i < currentScene.nodes.length; i++) {
                traverseNodes(gltfRuntime, currentScene.nodes[i], null);
            }
        }
        else {
            // Load all scenes
            for (var thing in gltfRuntime.scenes) {
                currentScene = gltfRuntime.scenes[thing];
                for (var i = 0; i < currentScene.nodes.length; i++) {
                    traverseNodes(gltfRuntime, currentScene.nodes[i], null);
                }
            }
        }
    };
    GLTFLoader.Extensions = {};
    return GLTFLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFLoader', { enumerable: true, configurable: true, get: function() { return GLTFLoader; } });
/** @hidden */
var GLTFLoaderExtension = /** @class */ (function () {
    function GLTFLoaderExtension(name) {
        this._name = name;
    }
    Object.defineProperty(GLTFLoaderExtension.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Defines an override for loading the runtime
     * Return true to stop further extensions from loading the runtime
     * @param scene
     * @param data
     * @param rootUrl
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.loadRuntimeAsync = function (scene, data, rootUrl, onSuccess, onError) {
        return false;
    };
    /**
     * Defines an onverride for creating gltf runtime
     * Return true to stop further extensions from creating the runtime
     * @param gltfRuntime
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.loadRuntimeExtensionsAsync = function (gltfRuntime, onSuccess, onError) {
        return false;
    };
    /**
     * Defines an override for loading buffers
     * Return true to stop further extensions from loading this buffer
     * @param gltfRuntime
     * @param id
     * @param onSuccess
     * @param onError
     * @param onProgress
     */
    GLTFLoaderExtension.prototype.loadBufferAsync = function (gltfRuntime, id, onSuccess, onError, onProgress) {
        return false;
    };
    /**
     * Defines an override for loading texture buffers
     * Return true to stop further extensions from loading this texture data
     * @param gltfRuntime
     * @param id
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.loadTextureBufferAsync = function (gltfRuntime, id, onSuccess, onError) {
        return false;
    };
    /**
     * Defines an override for creating textures
     * Return true to stop further extensions from loading this texture
     * @param gltfRuntime
     * @param id
     * @param buffer
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.createTextureAsync = function (gltfRuntime, id, buffer, onSuccess, onError) {
        return false;
    };
    /**
     * Defines an override for loading shader strings
     * Return true to stop further extensions from loading this shader data
     * @param gltfRuntime
     * @param id
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.loadShaderStringAsync = function (gltfRuntime, id, onSuccess, onError) {
        return false;
    };
    /**
     * Defines an override for loading materials
     * Return true to stop further extensions from loading this material
     * @param gltfRuntime
     * @param id
     * @param onSuccess
     * @param onError
     */
    GLTFLoaderExtension.prototype.loadMaterialAsync = function (gltfRuntime, id, onSuccess, onError) {
        return false;
    };
    // ---------
    // Utilities
    // ---------
    GLTFLoaderExtension.LoadRuntimeAsync = function (scene, data, rootUrl, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadRuntimeAsync(scene, data, rootUrl, onSuccess, onError);
        }, function () {
            setTimeout(function () {
                if (!onSuccess) {
                    return;
                }
                onSuccess(GLTFLoaderBase.CreateRuntime(data.json, scene, rootUrl));
            });
        });
    };
    GLTFLoaderExtension.LoadRuntimeExtensionsAsync = function (gltfRuntime, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadRuntimeExtensionsAsync(gltfRuntime, onSuccess, onError);
        }, function () {
            setTimeout(function () {
                onSuccess();
            });
        });
    };
    GLTFLoaderExtension.LoadBufferAsync = function (gltfRuntime, id, onSuccess, onError, onProgress) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadBufferAsync(gltfRuntime, id, onSuccess, onError, onProgress);
        }, function () {
            GLTFLoaderBase.LoadBufferAsync(gltfRuntime, id, onSuccess, onError, onProgress);
        });
    };
    GLTFLoaderExtension.LoadTextureAsync = function (gltfRuntime, id, onSuccess, onError) {
        GLTFLoaderExtension._LoadTextureBufferAsync(gltfRuntime, id, function (buffer) {
            if (buffer) {
                GLTFLoaderExtension._CreateTextureAsync(gltfRuntime, id, buffer, onSuccess, onError);
            }
        }, onError);
    };
    GLTFLoaderExtension.LoadShaderStringAsync = function (gltfRuntime, id, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadShaderStringAsync(gltfRuntime, id, onSuccess, onError);
        }, function () {
            GLTFLoaderBase.LoadShaderStringAsync(gltfRuntime, id, onSuccess, onError);
        });
    };
    GLTFLoaderExtension.LoadMaterialAsync = function (gltfRuntime, id, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadMaterialAsync(gltfRuntime, id, onSuccess, onError);
        }, function () {
            GLTFLoaderBase.LoadMaterialAsync(gltfRuntime, id, onSuccess, onError);
        });
    };
    GLTFLoaderExtension._LoadTextureBufferAsync = function (gltfRuntime, id, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.loadTextureBufferAsync(gltfRuntime, id, onSuccess, onError);
        }, function () {
            GLTFLoaderBase.LoadTextureBufferAsync(gltfRuntime, id, onSuccess, onError);
        });
    };
    GLTFLoaderExtension._CreateTextureAsync = function (gltfRuntime, id, buffer, onSuccess, onError) {
        GLTFLoaderExtension._ApplyExtensions(function (loaderExtension) {
            return loaderExtension.createTextureAsync(gltfRuntime, id, buffer, onSuccess, onError);
        }, function () {
            GLTFLoaderBase.CreateTextureAsync(gltfRuntime, id, buffer, onSuccess);
        });
    };
    GLTFLoaderExtension._ApplyExtensions = function (func, defaultFunc) {
        for (var extensionName in GLTFLoader.Extensions) {
            var loaderExtension = GLTFLoader.Extensions[extensionName];
            if (func(loaderExtension)) {
                return;
            }
        }
        defaultFunc();
    };
    return GLTFLoaderExtension;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFLoaderExtension', { enumerable: true, configurable: true, get: function() { return GLTFLoaderExtension; } });
GLTFFileLoader._CreateGLTF1Loader = function () { return new GLTFLoader(); };
//# sourceMappingURL=glTFLoader.js.map
}, function(modId) { var map = {"./glTFLoaderInterfaces.js":1661401224748,"./glTFLoaderUtils.js":1661401224749,"../glTFFileLoader.js":1661401224743}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224748, function(require, module, exports) {
/**
 * Enums
 * @hidden
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var EComponentType = exports.EComponentType = undefined;
(function (EComponentType) {
    EComponentType[EComponentType["BYTE"] = 5120] = "BYTE";
    EComponentType[EComponentType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    EComponentType[EComponentType["SHORT"] = 5122] = "SHORT";
    EComponentType[EComponentType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    EComponentType[EComponentType["FLOAT"] = 5126] = "FLOAT";
})(EComponentType || (EComponentType = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var EShaderType = exports.EShaderType = undefined;
(function (EShaderType) {
    EShaderType[EShaderType["FRAGMENT"] = 35632] = "FRAGMENT";
    EShaderType[EShaderType["VERTEX"] = 35633] = "VERTEX";
})(EShaderType || (EShaderType = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var EParameterType = exports.EParameterType = undefined;
(function (EParameterType) {
    EParameterType[EParameterType["BYTE"] = 5120] = "BYTE";
    EParameterType[EParameterType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    EParameterType[EParameterType["SHORT"] = 5122] = "SHORT";
    EParameterType[EParameterType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    EParameterType[EParameterType["INT"] = 5124] = "INT";
    EParameterType[EParameterType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    EParameterType[EParameterType["FLOAT"] = 5126] = "FLOAT";
    EParameterType[EParameterType["FLOAT_VEC2"] = 35664] = "FLOAT_VEC2";
    EParameterType[EParameterType["FLOAT_VEC3"] = 35665] = "FLOAT_VEC3";
    EParameterType[EParameterType["FLOAT_VEC4"] = 35666] = "FLOAT_VEC4";
    EParameterType[EParameterType["INT_VEC2"] = 35667] = "INT_VEC2";
    EParameterType[EParameterType["INT_VEC3"] = 35668] = "INT_VEC3";
    EParameterType[EParameterType["INT_VEC4"] = 35669] = "INT_VEC4";
    EParameterType[EParameterType["BOOL"] = 35670] = "BOOL";
    EParameterType[EParameterType["BOOL_VEC2"] = 35671] = "BOOL_VEC2";
    EParameterType[EParameterType["BOOL_VEC3"] = 35672] = "BOOL_VEC3";
    EParameterType[EParameterType["BOOL_VEC4"] = 35673] = "BOOL_VEC4";
    EParameterType[EParameterType["FLOAT_MAT2"] = 35674] = "FLOAT_MAT2";
    EParameterType[EParameterType["FLOAT_MAT3"] = 35675] = "FLOAT_MAT3";
    EParameterType[EParameterType["FLOAT_MAT4"] = 35676] = "FLOAT_MAT4";
    EParameterType[EParameterType["SAMPLER_2D"] = 35678] = "SAMPLER_2D";
})(EParameterType || (EParameterType = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ETextureWrapMode = exports.ETextureWrapMode = undefined;
(function (ETextureWrapMode) {
    ETextureWrapMode[ETextureWrapMode["CLAMP_TO_EDGE"] = 33071] = "CLAMP_TO_EDGE";
    ETextureWrapMode[ETextureWrapMode["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
    ETextureWrapMode[ETextureWrapMode["REPEAT"] = 10497] = "REPEAT";
})(ETextureWrapMode || (ETextureWrapMode = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ETextureFilterType = exports.ETextureFilterType = undefined;
(function (ETextureFilterType) {
    ETextureFilterType[ETextureFilterType["NEAREST"] = 9728] = "NEAREST";
    ETextureFilterType[ETextureFilterType["LINEAR"] = 9728] = "LINEAR";
    ETextureFilterType[ETextureFilterType["NEAREST_MIPMAP_NEAREST"] = 9984] = "NEAREST_MIPMAP_NEAREST";
    ETextureFilterType[ETextureFilterType["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
    ETextureFilterType[ETextureFilterType["NEAREST_MIPMAP_LINEAR"] = 9986] = "NEAREST_MIPMAP_LINEAR";
    ETextureFilterType[ETextureFilterType["LINEAR_MIPMAP_LINEAR"] = 9987] = "LINEAR_MIPMAP_LINEAR";
})(ETextureFilterType || (ETextureFilterType = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ETextureFormat = exports.ETextureFormat = undefined;
(function (ETextureFormat) {
    ETextureFormat[ETextureFormat["ALPHA"] = 6406] = "ALPHA";
    ETextureFormat[ETextureFormat["RGB"] = 6407] = "RGB";
    ETextureFormat[ETextureFormat["RGBA"] = 6408] = "RGBA";
    ETextureFormat[ETextureFormat["LUMINANCE"] = 6409] = "LUMINANCE";
    ETextureFormat[ETextureFormat["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
})(ETextureFormat || (ETextureFormat = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ECullingType = exports.ECullingType = undefined;
(function (ECullingType) {
    ECullingType[ECullingType["FRONT"] = 1028] = "FRONT";
    ECullingType[ECullingType["BACK"] = 1029] = "BACK";
    ECullingType[ECullingType["FRONT_AND_BACK"] = 1032] = "FRONT_AND_BACK";
})(ECullingType || (ECullingType = {}));
/** @hidden */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var EBlendingFunction = exports.EBlendingFunction = undefined;
(function (EBlendingFunction) {
    EBlendingFunction[EBlendingFunction["ZERO"] = 0] = "ZERO";
    EBlendingFunction[EBlendingFunction["ONE"] = 1] = "ONE";
    EBlendingFunction[EBlendingFunction["SRC_COLOR"] = 768] = "SRC_COLOR";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_SRC_COLOR"] = 769] = "ONE_MINUS_SRC_COLOR";
    EBlendingFunction[EBlendingFunction["DST_COLOR"] = 774] = "DST_COLOR";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_DST_COLOR"] = 775] = "ONE_MINUS_DST_COLOR";
    EBlendingFunction[EBlendingFunction["SRC_ALPHA"] = 770] = "SRC_ALPHA";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
    EBlendingFunction[EBlendingFunction["DST_ALPHA"] = 772] = "DST_ALPHA";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
    EBlendingFunction[EBlendingFunction["CONSTANT_COLOR"] = 32769] = "CONSTANT_COLOR";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_CONSTANT_COLOR"] = 32770] = "ONE_MINUS_CONSTANT_COLOR";
    EBlendingFunction[EBlendingFunction["CONSTANT_ALPHA"] = 32771] = "CONSTANT_ALPHA";
    EBlendingFunction[EBlendingFunction["ONE_MINUS_CONSTANT_ALPHA"] = 32772] = "ONE_MINUS_CONSTANT_ALPHA";
    EBlendingFunction[EBlendingFunction["SRC_ALPHA_SATURATE"] = 776] = "SRC_ALPHA_SATURATE";
})(EBlendingFunction || (EBlendingFunction = {}));
//# sourceMappingURL=glTFLoaderInterfaces.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224749, function(require, module, exports) {
var __TEMP__ = require('./glTFLoaderInterfaces.js');var EParameterType = __TEMP__['EParameterType'];var ETextureWrapMode = __TEMP__['ETextureWrapMode'];var ETextureFilterType = __TEMP__['ETextureFilterType'];var EComponentType = __TEMP__['EComponentType'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector2 = __TEMP__['Vector2'];var Vector3 = __TEMP__['Vector3'];var Vector4 = __TEMP__['Vector4'];var Matrix = __TEMP__['Matrix'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color4 = __TEMP__['Color4'];
var __TEMP__ = require('@babylonjs/core/Materials/effect.js');var Effect = __TEMP__['Effect'];
var __TEMP__ = require('@babylonjs/core/Materials/shaderMaterial.js');var ShaderMaterial = __TEMP__['ShaderMaterial'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/texture.js');var Texture = __TEMP__['Texture'];
/**
 * Utils functions for GLTF
 * @hidden
 */
var GLTFUtils = /** @class */ (function () {
    function GLTFUtils() {
    }
    /**
     * Sets the given "parameter" matrix
     * @param scene the Scene object
     * @param source the source node where to pick the matrix
     * @param parameter the GLTF technique parameter
     * @param uniformName the name of the shader's uniform
     * @param shaderMaterial the shader material
     */
    GLTFUtils.SetMatrix = function (scene, source, parameter, uniformName, shaderMaterial) {
        var mat = null;
        if (parameter.semantic === "MODEL") {
            mat = source.getWorldMatrix();
        }
        else if (parameter.semantic === "PROJECTION") {
            mat = scene.getProjectionMatrix();
        }
        else if (parameter.semantic === "VIEW") {
            mat = scene.getViewMatrix();
        }
        else if (parameter.semantic === "MODELVIEWINVERSETRANSPOSE") {
            mat = Matrix.Transpose(source.getWorldMatrix().multiply(scene.getViewMatrix()).invert());
        }
        else if (parameter.semantic === "MODELVIEW") {
            mat = source.getWorldMatrix().multiply(scene.getViewMatrix());
        }
        else if (parameter.semantic === "MODELVIEWPROJECTION") {
            mat = source.getWorldMatrix().multiply(scene.getTransformMatrix());
        }
        else if (parameter.semantic === "MODELINVERSE") {
            mat = source.getWorldMatrix().invert();
        }
        else if (parameter.semantic === "VIEWINVERSE") {
            mat = scene.getViewMatrix().invert();
        }
        else if (parameter.semantic === "PROJECTIONINVERSE") {
            mat = scene.getProjectionMatrix().invert();
        }
        else if (parameter.semantic === "MODELVIEWINVERSE") {
            mat = source.getWorldMatrix().multiply(scene.getViewMatrix()).invert();
        }
        else if (parameter.semantic === "MODELVIEWPROJECTIONINVERSE") {
            mat = source.getWorldMatrix().multiply(scene.getTransformMatrix()).invert();
        }
        else if (parameter.semantic === "MODELINVERSETRANSPOSE") {
            mat = Matrix.Transpose(source.getWorldMatrix().invert());
        }
        if (mat) {
            switch (parameter.type) {
                case EParameterType.FLOAT_MAT2:
                    shaderMaterial.setMatrix2x2(uniformName, Matrix.GetAsMatrix2x2(mat));
                    break;
                case EParameterType.FLOAT_MAT3:
                    shaderMaterial.setMatrix3x3(uniformName, Matrix.GetAsMatrix3x3(mat));
                    break;
                case EParameterType.FLOAT_MAT4:
                    shaderMaterial.setMatrix(uniformName, mat);
                    break;
                default:
                    break;
            }
        }
    };
    /**
     * Sets the given "parameter" matrix
     * @param shaderMaterial the shader material
     * @param uniform the name of the shader's uniform
     * @param value the value of the uniform
     * @param type the uniform's type (EParameterType FLOAT, VEC2, VEC3 or VEC4)
     */
    GLTFUtils.SetUniform = function (shaderMaterial, uniform, value, type) {
        switch (type) {
            case EParameterType.FLOAT:
                shaderMaterial.setFloat(uniform, value);
                return true;
            case EParameterType.FLOAT_VEC2:
                shaderMaterial.setVector2(uniform, Vector2.FromArray(value));
                return true;
            case EParameterType.FLOAT_VEC3:
                shaderMaterial.setVector3(uniform, Vector3.FromArray(value));
                return true;
            case EParameterType.FLOAT_VEC4:
                shaderMaterial.setVector4(uniform, Vector4.FromArray(value));
                return true;
            default:
                return false;
        }
    };
    /**
     * Returns the wrap mode of the texture
     * @param mode the mode value
     */
    GLTFUtils.GetWrapMode = function (mode) {
        switch (mode) {
            case ETextureWrapMode.CLAMP_TO_EDGE:
                return Texture.CLAMP_ADDRESSMODE;
            case ETextureWrapMode.MIRRORED_REPEAT:
                return Texture.MIRROR_ADDRESSMODE;
            case ETextureWrapMode.REPEAT:
                return Texture.WRAP_ADDRESSMODE;
            default:
                return Texture.WRAP_ADDRESSMODE;
        }
    };
    /**
     * Returns the byte stride giving an accessor
     * @param accessor the GLTF accessor objet
     */
    GLTFUtils.GetByteStrideFromType = function (accessor) {
        // Needs this function since "byteStride" isn't requiered in glTF format
        var type = accessor.type;
        switch (type) {
            case "VEC2":
                return 2;
            case "VEC3":
                return 3;
            case "VEC4":
                return 4;
            case "MAT2":
                return 4;
            case "MAT3":
                return 9;
            case "MAT4":
                return 16;
            default:
                return 1;
        }
    };
    /**
     * Returns the texture filter mode giving a mode value
     * @param mode the filter mode value
     */
    GLTFUtils.GetTextureFilterMode = function (mode) {
        switch (mode) {
            case ETextureFilterType.LINEAR:
            case ETextureFilterType.LINEAR_MIPMAP_NEAREST:
            case ETextureFilterType.LINEAR_MIPMAP_LINEAR:
                return Texture.TRILINEAR_SAMPLINGMODE;
            case ETextureFilterType.NEAREST:
            case ETextureFilterType.NEAREST_MIPMAP_NEAREST:
                return Texture.NEAREST_SAMPLINGMODE;
            default:
                return Texture.BILINEAR_SAMPLINGMODE;
        }
    };
    GLTFUtils.GetBufferFromBufferView = function (gltfRuntime, bufferView, byteOffset, byteLength, componentType) {
        byteOffset = bufferView.byteOffset + byteOffset;
        var loadedBufferView = gltfRuntime.loadedBufferViews[bufferView.buffer];
        if (byteOffset + byteLength > loadedBufferView.byteLength) {
            throw new Error("Buffer access is out of range");
        }
        var buffer = loadedBufferView.buffer;
        byteOffset += loadedBufferView.byteOffset;
        switch (componentType) {
            case EComponentType.BYTE:
                return new Int8Array(buffer, byteOffset, byteLength);
            case EComponentType.UNSIGNED_BYTE:
                return new Uint8Array(buffer, byteOffset, byteLength);
            case EComponentType.SHORT:
                return new Int16Array(buffer, byteOffset, byteLength);
            case EComponentType.UNSIGNED_SHORT:
                return new Uint16Array(buffer, byteOffset, byteLength);
            default:
                return new Float32Array(buffer, byteOffset, byteLength);
        }
    };
    /**
     * Returns a buffer from its accessor
     * @param gltfRuntime the GLTF runtime
     * @param accessor the GLTF accessor
     */
    GLTFUtils.GetBufferFromAccessor = function (gltfRuntime, accessor) {
        var bufferView = gltfRuntime.bufferViews[accessor.bufferView];
        var byteLength = accessor.count * GLTFUtils.GetByteStrideFromType(accessor);
        return GLTFUtils.GetBufferFromBufferView(gltfRuntime, bufferView, accessor.byteOffset, byteLength, accessor.componentType);
    };
    /**
     * Decodes a buffer view into a string
     * @param view the buffer view
     */
    GLTFUtils.DecodeBufferToText = function (view) {
        var result = "";
        var length = view.byteLength;
        for (var i = 0; i < length; ++i) {
            result += String.fromCharCode(view[i]);
        }
        return result;
    };
    /**
     * Returns the default material of gltf. Related to
     * https://github.com/KhronosGroup/glTF/tree/master/specification/1.0#appendix-a-default-material
     * @param scene the Babylon.js scene
     */
    GLTFUtils.GetDefaultMaterial = function (scene) {
        if (!GLTFUtils._DefaultMaterial) {
            Effect.ShadersStore["GLTFDefaultMaterialVertexShader"] = [
                "precision highp float;",
                "",
                "uniform mat4 worldView;",
                "uniform mat4 projection;",
                "",
                "attribute vec3 position;",
                "",
                "void main(void)",
                "{",
                "    gl_Position = projection * worldView * vec4(position, 1.0);",
                "}",
            ].join("\n");
            Effect.ShadersStore["GLTFDefaultMaterialPixelShader"] = [
                "precision highp float;",
                "",
                "uniform vec4 u_emission;",
                "",
                "void main(void)",
                "{",
                "    gl_FragColor = u_emission;",
                "}",
            ].join("\n");
            var shaderPath = {
                vertex: "GLTFDefaultMaterial",
                fragment: "GLTFDefaultMaterial",
            };
            var options = {
                attributes: ["position"],
                uniforms: ["worldView", "projection", "u_emission"],
                samplers: new Array(),
                needAlphaBlending: false,
            };
            GLTFUtils._DefaultMaterial = new ShaderMaterial("GLTFDefaultMaterial", scene, shaderPath, options);
            GLTFUtils._DefaultMaterial.setColor4("u_emission", new Color4(0.5, 0.5, 0.5, 1.0));
        }
        return GLTFUtils._DefaultMaterial;
    };
    // The GLTF default material
    GLTFUtils._DefaultMaterial = null;
    return GLTFUtils;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFUtils', { enumerable: true, configurable: true, get: function() { return GLTFUtils; } });
//# sourceMappingURL=glTFLoaderUtils.js.map
}, function(modId) { var map = {"./glTFLoaderInterfaces.js":1661401224748}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224750, function(require, module, exports) {
var __TEMP__ = require('tslib');var __extends = __TEMP__['__extends'];
var __TEMP__ = require('./glTFLoader.js');var GLTFLoaderExtension = __TEMP__['GLTFLoaderExtension'];var GLTFLoaderBase = __TEMP__['GLTFLoaderBase'];var GLTFLoader = __TEMP__['GLTFLoader'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector3 = __TEMP__['Vector3'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Materials/material.js');var Material = __TEMP__['Material'];
var __TEMP__ = require('@babylonjs/core/Materials/standardMaterial.js');var StandardMaterial = __TEMP__['StandardMaterial'];
var __TEMP__ = require('@babylonjs/core/Lights/hemisphericLight.js');var HemisphericLight = __TEMP__['HemisphericLight'];
var __TEMP__ = require('@babylonjs/core/Lights/directionalLight.js');var DirectionalLight = __TEMP__['DirectionalLight'];
var __TEMP__ = require('@babylonjs/core/Lights/pointLight.js');var PointLight = __TEMP__['PointLight'];
var __TEMP__ = require('@babylonjs/core/Lights/spotLight.js');var SpotLight = __TEMP__['SpotLight'];
/** @hidden */
var GLTFMaterialsCommonExtension = /** @class */ (function (_super) {
    __extends(GLTFMaterialsCommonExtension, _super);
    function GLTFMaterialsCommonExtension() {
        return _super.call(this, "KHR_materials_common") || this;
    }
    GLTFMaterialsCommonExtension.prototype.loadRuntimeExtensionsAsync = function (gltfRuntime) {
        if (!gltfRuntime.extensions) {
            return false;
        }
        var extension = gltfRuntime.extensions[this.name];
        if (!extension) {
            return false;
        }
        // Create lights
        var lights = extension.lights;
        if (lights) {
            for (var thing in lights) {
                var light = lights[thing];
                switch (light.type) {
                    case "ambient": {
                        var ambientLight = new HemisphericLight(light.name, new Vector3(0, 1, 0), gltfRuntime.scene);
                        var ambient = light.ambient;
                        if (ambient) {
                            ambientLight.diffuse = Color3.FromArray(ambient.color || [1, 1, 1]);
                        }
                        break;
                    }
                    case "point": {
                        var pointLight = new PointLight(light.name, new Vector3(10, 10, 10), gltfRuntime.scene);
                        var point = light.point;
                        if (point) {
                            pointLight.diffuse = Color3.FromArray(point.color || [1, 1, 1]);
                        }
                        break;
                    }
                    case "directional": {
                        var dirLight = new DirectionalLight(light.name, new Vector3(0, -1, 0), gltfRuntime.scene);
                        var directional = light.directional;
                        if (directional) {
                            dirLight.diffuse = Color3.FromArray(directional.color || [1, 1, 1]);
                        }
                        break;
                    }
                    case "spot": {
                        var spot = light.spot;
                        if (spot) {
                            var spotLight = new SpotLight(light.name, new Vector3(0, 10, 0), new Vector3(0, -1, 0), spot.fallOffAngle || Math.PI, spot.fallOffExponent || 0.0, gltfRuntime.scene);
                            spotLight.diffuse = Color3.FromArray(spot.color || [1, 1, 1]);
                        }
                        break;
                    }
                    default:
                        Tools.Warn('GLTF Material Common extension: light type "' + light.type + "” not supported");
                        break;
                }
            }
        }
        return false;
    };
    GLTFMaterialsCommonExtension.prototype.loadMaterialAsync = function (gltfRuntime, id, onSuccess, onError) {
        var material = gltfRuntime.materials[id];
        if (!material || !material.extensions) {
            return false;
        }
        var extension = material.extensions[this.name];
        if (!extension) {
            return false;
        }
        var standardMaterial = new StandardMaterial(id, gltfRuntime.scene);
        standardMaterial.sideOrientation = Material.CounterClockWiseSideOrientation;
        if (extension.technique === "CONSTANT") {
            standardMaterial.disableLighting = true;
        }
        standardMaterial.backFaceCulling = extension.doubleSided === undefined ? false : !extension.doubleSided;
        standardMaterial.alpha = extension.values.transparency === undefined ? 1.0 : extension.values.transparency;
        standardMaterial.specularPower = extension.values.shininess === undefined ? 0.0 : extension.values.shininess;
        // Ambient
        if (typeof extension.values.ambient === "string") {
            this._loadTexture(gltfRuntime, extension.values.ambient, standardMaterial, "ambientTexture", onError);
        }
        else {
            standardMaterial.ambientColor = Color3.FromArray(extension.values.ambient || [0, 0, 0]);
        }
        // Diffuse
        if (typeof extension.values.diffuse === "string") {
            this._loadTexture(gltfRuntime, extension.values.diffuse, standardMaterial, "diffuseTexture", onError);
        }
        else {
            standardMaterial.diffuseColor = Color3.FromArray(extension.values.diffuse || [0, 0, 0]);
        }
        // Emission
        if (typeof extension.values.emission === "string") {
            this._loadTexture(gltfRuntime, extension.values.emission, standardMaterial, "emissiveTexture", onError);
        }
        else {
            standardMaterial.emissiveColor = Color3.FromArray(extension.values.emission || [0, 0, 0]);
        }
        // Specular
        if (typeof extension.values.specular === "string") {
            this._loadTexture(gltfRuntime, extension.values.specular, standardMaterial, "specularTexture", onError);
        }
        else {
            standardMaterial.specularColor = Color3.FromArray(extension.values.specular || [0, 0, 0]);
        }
        return true;
    };
    GLTFMaterialsCommonExtension.prototype._loadTexture = function (gltfRuntime, id, material, propertyPath, onError) {
        // Create buffer from texture url
        GLTFLoaderBase.LoadTextureBufferAsync(gltfRuntime, id, function (buffer) {
            // Create texture from buffer
            GLTFLoaderBase.CreateTextureAsync(gltfRuntime, id, buffer, function (texture) { return (material[propertyPath] = texture); });
        }, onError);
    };
    return GLTFMaterialsCommonExtension;
}(GLTFLoaderExtension));
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFMaterialsCommonExtension', { enumerable: true, configurable: true, get: function() { return GLTFMaterialsCommonExtension; } });
GLTFLoader.RegisterExtension(new GLTFMaterialsCommonExtension());
//# sourceMappingURL=glTFMaterialsCommonExtension.js.map
}, function(modId) { var map = {"./glTFLoader.js":1661401224747}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224751, function(require, module, exports) {
/* eslint-disable import/no-internal-modules */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoaderExtension.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./glTFLoaderInterfaces.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./Extensions/index.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./glTFLoader.js":1661401224752,"./glTFLoaderExtension.js":1661401224753,"./glTFLoaderInterfaces.js":1661401224754,"./Extensions/index.js":1661401224755}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224752, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Misc/deferred.js');var Deferred = __TEMP__['Deferred'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Quaternion = __TEMP__['Quaternion'];var Vector3 = __TEMP__['Vector3'];var Matrix = __TEMP__['Matrix'];var TmpVectors = __TEMP__['TmpVectors'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Cameras/camera.js');var Camera = __TEMP__['Camera'];
var __TEMP__ = require('@babylonjs/core/Cameras/freeCamera.js');var FreeCamera = __TEMP__['FreeCamera'];
var __TEMP__ = require('@babylonjs/core/Animations/animationGroup.js');var AnimationGroup = __TEMP__['AnimationGroup'];
var __TEMP__ = require('@babylonjs/core/Animations/animation.js');var Animation = __TEMP__['Animation'];
var __TEMP__ = require('@babylonjs/core/Bones/bone.js');var Bone = __TEMP__['Bone'];
var __TEMP__ = require('@babylonjs/core/Bones/skeleton.js');var Skeleton = __TEMP__['Skeleton'];
var __TEMP__ = require('@babylonjs/core/Materials/material.js');var Material = __TEMP__['Material'];
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/texture.js');var Texture = __TEMP__['Texture'];
var __TEMP__ = require('@babylonjs/core/Meshes/transformNode.js');var TransformNode = __TEMP__['TransformNode'];
var __TEMP__ = require('@babylonjs/core/Buffers/buffer.js');var Buffer = __TEMP__['Buffer'];var VertexBuffer = __TEMP__['VertexBuffer'];
var __TEMP__ = require('@babylonjs/core/Meshes/geometry.js');var Geometry = __TEMP__['Geometry'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.js');var Mesh = __TEMP__['Mesh'];
var __TEMP__ = require('@babylonjs/core/Morph/morphTarget.js');var MorphTarget = __TEMP__['MorphTarget'];
var __TEMP__ = require('@babylonjs/core/Morph/morphTargetManager.js');var MorphTargetManager = __TEMP__['MorphTargetManager'];
var __TEMP__ = require('../glTFFileLoader.js');var GLTFFileLoader = __TEMP__['GLTFFileLoader'];var GLTFLoaderState = __TEMP__['GLTFLoaderState'];var GLTFLoaderCoordinateSystemMode = __TEMP__['GLTFLoaderCoordinateSystemMode'];var GLTFLoaderAnimationStartMode = __TEMP__['GLTFLoaderAnimationStartMode'];
var __TEMP__ = require('@babylonjs/core/Animations/animationKey.js');var AnimationKeyInterpolation = __TEMP__['AnimationKeyInterpolation'];
var __TEMP__ = require('@babylonjs/core/Misc/fileTools.js');var DecodeBase64UrlToBinary = __TEMP__['DecodeBase64UrlToBinary'];var IsBase64DataUrl = __TEMP__['IsBase64DataUrl'];var LoadFileError = __TEMP__['LoadFileError'];
var __TEMP__ = require('@babylonjs/core/Misc/logger.js');var Logger = __TEMP__['Logger'];
var __TEMP__ = require('@babylonjs/core/Culling/boundingInfo.js');var BoundingInfo = __TEMP__['BoundingInfo'];
var __TEMP__ = require('@babylonjs/core/Misc/stringTools.js');var StringTools = __TEMP__['StringTools'];
/**
 * Helper class for working with arrays when loading the glTF asset
 */
var ArrayItem = /** @class */ (function () {
    function ArrayItem() {
    }
    /**
     * Gets an item from the given array.
     * @param context The context when loading the asset
     * @param array The array to get the item from
     * @param index The index to the array
     * @returns The array item
     */
    ArrayItem.Get = function (context, array, index) {
        if (!array || index == undefined || !array[index]) {
            throw new Error("".concat(context, ": Failed to find index (").concat(index, ")"));
        }
        return array[index];
    };
    /**
     * Assign an `index` field to each item of the given array.
     * @param array The array of items
     */
    ArrayItem.Assign = function (array) {
        if (array) {
            for (var index = 0; index < array.length; index++) {
                array[index].index = index;
            }
        }
    };
    return ArrayItem;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'ArrayItem', { enumerable: true, configurable: true, get: function() { return ArrayItem; } });
/**
 * The glTF 2.0 loader
 */
var GLTFLoader = /** @class */ (function () {
    /**
     * @param parent
     * @hidden
     */
    function GLTFLoader(parent) {
        /** @hidden */
        this._completePromises = new Array();
        /** @hidden */
        this._assetContainer = null;
        /** Storage */
        this._babylonLights = [];
        /** @hidden */
        this._disableInstancedMesh = 0;
        this._extensions = new Array();
        this._disposed = false;
        this._rootUrl = null;
        this._fileName = null;
        this._uniqueRootUrl = null;
        this._bin = null;
        this._rootBabylonMesh = null;
        this._defaultBabylonMaterialData = {};
        this._postSceneLoadActions = new Array();
        this._parent = parent;
    }
    /**
     * Registers a loader extension.
     * @param name The name of the loader extension.
     * @param factory The factory function that creates the loader extension.
     */
    GLTFLoader.RegisterExtension = function (name, factory) {
        if (GLTFLoader.UnregisterExtension(name)) {
            Logger.Warn("Extension with the name '".concat(name, "' already exists"));
        }
        GLTFLoader._RegisteredExtensions[name] = {
            factory: factory,
        };
    };
    /**
     * Unregisters a loader extension.
     * @param name The name of the loader extension.
     * @returns A boolean indicating whether the extension has been unregistered
     */
    GLTFLoader.UnregisterExtension = function (name) {
        if (!GLTFLoader._RegisteredExtensions[name]) {
            return false;
        }
        delete GLTFLoader._RegisteredExtensions[name];
        return true;
    };
    Object.defineProperty(GLTFLoader.prototype, "gltf", {
        /**
         * The object that represents the glTF JSON.
         */
        get: function () {
            if (!this._gltf) {
                throw new Error("glTF JSON is not available");
            }
            return this._gltf;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFLoader.prototype, "bin", {
        /**
         * The BIN chunk of a binary glTF.
         */
        get: function () {
            return this._bin;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFLoader.prototype, "parent", {
        /**
         * The parent file loader.
         */
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFLoader.prototype, "babylonScene", {
        /**
         * The Babylon scene when loading the asset.
         */
        get: function () {
            if (!this._babylonScene) {
                throw new Error("Scene is not available");
            }
            return this._babylonScene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GLTFLoader.prototype, "rootBabylonMesh", {
        /**
         * The root Babylon mesh when loading the asset.
         */
        get: function () {
            return this._rootBabylonMesh;
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    GLTFLoader.prototype.dispose = function () {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        this._completePromises.length = 0;
        this._extensions.forEach(function (extension) { return extension.dispose && extension.dispose(); });
        this._extensions.length = 0;
        this._gltf = null; // TODO
        this._bin = null;
        this._babylonScene = null; // TODO
        this._rootBabylonMesh = null;
        this._defaultBabylonMaterialData = {};
        this._postSceneLoadActions.length = 0;
        this._parent.dispose();
    };
    /**
     * @param meshesNames
     * @param scene
     * @param container
     * @param data
     * @param rootUrl
     * @param onProgress
     * @param fileName
     * @hidden
     */
    GLTFLoader.prototype.importMeshAsync = function (meshesNames, scene, container, data, rootUrl, onProgress, fileName) {
        var _this = this;
        if (fileName === void 0) { fileName = ""; }
        return Promise.resolve().then(function () {
            _this._babylonScene = scene;
            _this._assetContainer = container;
            _this._loadData(data);
            var nodes = null;
            if (meshesNames) {
                var nodeMap_1 = {};
                if (_this._gltf.nodes) {
                    for (var _i = 0, _a = _this._gltf.nodes; _i < _a.length; _i++) {
                        var node = _a[_i];
                        if (node.name) {
                            nodeMap_1[node.name] = node.index;
                        }
                    }
                }
                var names = meshesNames instanceof Array ? meshesNames : [meshesNames];
                nodes = names.map(function (name) {
                    var node = nodeMap_1[name];
                    if (node === undefined) {
                        throw new Error("Failed to find node '".concat(name, "'"));
                    }
                    return node;
                });
            }
            return _this._loadAsync(rootUrl, fileName, nodes, function () {
                return {
                    meshes: _this._getMeshes(),
                    particleSystems: [],
                    skeletons: _this._getSkeletons(),
                    animationGroups: _this._getAnimationGroups(),
                    lights: _this._babylonLights,
                    transformNodes: _this._getTransformNodes(),
                    geometries: _this._getGeometries(),
                };
            });
        });
    };
    /**
     * @param scene
     * @param data
     * @param rootUrl
     * @param onProgress
     * @param fileName
     * @hidden
     */
    GLTFLoader.prototype.loadAsync = function (scene, data, rootUrl, onProgress, fileName) {
        var _this = this;
        if (fileName === void 0) { fileName = ""; }
        return Promise.resolve().then(function () {
            _this._babylonScene = scene;
            _this._loadData(data);
            return _this._loadAsync(rootUrl, fileName, null, function () { return undefined; });
        });
    };
    GLTFLoader.prototype._loadAsync = function (rootUrl, fileName, nodes, resultFunc) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this._rootUrl = rootUrl;
            _this._uniqueRootUrl = !StringTools.StartsWith(rootUrl, "file:") && fileName ? rootUrl : "".concat(rootUrl).concat(Date.now(), "/");
            _this._fileName = fileName;
            _this._loadExtensions();
            _this._checkExtensions();
            var loadingToReadyCounterName = "".concat(GLTFLoaderState[GLTFLoaderState.LOADING], " => ").concat(GLTFLoaderState[GLTFLoaderState.READY]);
            var loadingToCompleteCounterName = "".concat(GLTFLoaderState[GLTFLoaderState.LOADING], " => ").concat(GLTFLoaderState[GLTFLoaderState.COMPLETE]);
            _this._parent._startPerformanceCounter(loadingToReadyCounterName);
            _this._parent._startPerformanceCounter(loadingToCompleteCounterName);
            _this._parent._setState(GLTFLoaderState.LOADING);
            _this._extensionsOnLoading();
            var promises = new Array();
            // Block the marking of materials dirty until the scene is loaded.
            var oldBlockMaterialDirtyMechanism = _this._babylonScene.blockMaterialDirtyMechanism;
            _this._babylonScene.blockMaterialDirtyMechanism = true;
            if (!_this.parent.loadOnlyMaterials) {
                if (nodes) {
                    promises.push(_this.loadSceneAsync("/nodes", { nodes: nodes, index: -1 }));
                }
                else if (_this._gltf.scene != undefined || (_this._gltf.scenes && _this._gltf.scenes[0])) {
                    var scene = ArrayItem.Get("/scene", _this._gltf.scenes, _this._gltf.scene || 0);
                    promises.push(_this.loadSceneAsync("/scenes/".concat(scene.index), scene));
                }
            }
            if (!_this.parent.skipMaterials && _this.parent.loadAllMaterials && _this._gltf.materials) {
                for (var m = 0; m < _this._gltf.materials.length; ++m) {
                    var material = _this._gltf.materials[m];
                    var context_1 = "/materials/" + m;
                    var babylonDrawMode = Material.TriangleFillMode;
                    promises.push(_this._loadMaterialAsync(context_1, material, null, babylonDrawMode, function () { }));
                }
            }
            // Restore the blocking of material dirty.
            _this._babylonScene.blockMaterialDirtyMechanism = oldBlockMaterialDirtyMechanism;
            if (_this._parent.compileMaterials) {
                promises.push(_this._compileMaterialsAsync());
            }
            if (_this._parent.compileShadowGenerators) {
                promises.push(_this._compileShadowGeneratorsAsync());
            }
            var resultPromise = Promise.all(promises).then(function () {
                if (_this._rootBabylonMesh) {
                    _this._rootBabylonMesh.setEnabled(true);
                }
                _this._extensionsOnReady();
                _this._parent._setState(GLTFLoaderState.READY);
                _this._startAnimations();
                return resultFunc();
            });
            return resultPromise.then(function (result) {
                _this._parent._endPerformanceCounter(loadingToReadyCounterName);
                Tools.SetImmediate(function () {
                    if (!_this._disposed) {
                        Promise.all(_this._completePromises).then(function () {
                            _this._parent._endPerformanceCounter(loadingToCompleteCounterName);
                            _this._parent._setState(GLTFLoaderState.COMPLETE);
                            _this._parent.onCompleteObservable.notifyObservers(undefined);
                            _this._parent.onCompleteObservable.clear();
                            _this.dispose();
                        }, function (error) {
                            _this._parent.onErrorObservable.notifyObservers(error);
                            _this._parent.onErrorObservable.clear();
                            _this.dispose();
                        });
                    }
                });
                return result;
            });
        })
            .catch(function (error) {
            if (!_this._disposed) {
                _this._parent.onErrorObservable.notifyObservers(error);
                _this._parent.onErrorObservable.clear();
                _this.dispose();
            }
            throw error;
        });
    };
    GLTFLoader.prototype._loadData = function (data) {
        this._gltf = data.json;
        this._setupData();
        if (data.bin) {
            var buffers = this._gltf.buffers;
            if (buffers && buffers[0] && !buffers[0].uri) {
                var binaryBuffer = buffers[0];
                if (binaryBuffer.byteLength < data.bin.byteLength - 3 || binaryBuffer.byteLength > data.bin.byteLength) {
                    Logger.Warn("Binary buffer length (".concat(binaryBuffer.byteLength, ") from JSON does not match chunk length (").concat(data.bin.byteLength, ")"));
                }
                this._bin = data.bin;
            }
            else {
                Logger.Warn("Unexpected BIN chunk");
            }
        }
    };
    GLTFLoader.prototype._setupData = function () {
        ArrayItem.Assign(this._gltf.accessors);
        ArrayItem.Assign(this._gltf.animations);
        ArrayItem.Assign(this._gltf.buffers);
        ArrayItem.Assign(this._gltf.bufferViews);
        ArrayItem.Assign(this._gltf.cameras);
        ArrayItem.Assign(this._gltf.images);
        ArrayItem.Assign(this._gltf.materials);
        ArrayItem.Assign(this._gltf.meshes);
        ArrayItem.Assign(this._gltf.nodes);
        ArrayItem.Assign(this._gltf.samplers);
        ArrayItem.Assign(this._gltf.scenes);
        ArrayItem.Assign(this._gltf.skins);
        ArrayItem.Assign(this._gltf.textures);
        if (this._gltf.nodes) {
            var nodeParents = {};
            for (var _i = 0, _a = this._gltf.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node.children) {
                    for (var _b = 0, _c = node.children; _b < _c.length; _b++) {
                        var index = _c[_b];
                        nodeParents[index] = node.index;
                    }
                }
            }
            var rootNode = this._createRootNode();
            for (var _d = 0, _e = this._gltf.nodes; _d < _e.length; _d++) {
                var node = _e[_d];
                var parentIndex = nodeParents[node.index];
                node.parent = parentIndex === undefined ? rootNode : this._gltf.nodes[parentIndex];
            }
        }
    };
    GLTFLoader.prototype._loadExtensions = function () {
        for (var name_1 in GLTFLoader._RegisteredExtensions) {
            var extension = GLTFLoader._RegisteredExtensions[name_1].factory(this);
            if (extension.name !== name_1) {
                Logger.Warn("The name of the glTF loader extension instance does not match the registered name: ".concat(extension.name, " !== ").concat(name_1));
            }
            this._extensions.push(extension);
            this._parent.onExtensionLoadedObservable.notifyObservers(extension);
        }
        this._extensions.sort(function (a, b) { return (a.order || Number.MAX_VALUE) - (b.order || Number.MAX_VALUE); });
        this._parent.onExtensionLoadedObservable.clear();
    };
    GLTFLoader.prototype._checkExtensions = function () {
        if (this._gltf.extensionsRequired) {
            var _loop_1 = function (name_2) {
                var available = this_1._extensions.some(function (extension) { return extension.name === name_2 && extension.enabled; });
                if (!available) {
                    throw new Error("Require extension ".concat(name_2, " is not available"));
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this._gltf.extensionsRequired; _i < _a.length; _i++) {
                var name_2 = _a[_i];
                _loop_1(name_2);
            }
        }
    };
    GLTFLoader.prototype._createRootNode = function () {
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        this._rootBabylonMesh = new Mesh("__root__", this._babylonScene);
        this._rootBabylonMesh._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        this._rootBabylonMesh.setEnabled(false);
        var rootNode = {
            _babylonTransformNode: this._rootBabylonMesh,
            index: -1,
        };
        switch (this._parent.coordinateSystemMode) {
            case GLTFLoaderCoordinateSystemMode.AUTO: {
                if (!this._babylonScene.useRightHandedSystem) {
                    rootNode.rotation = [0, 1, 0, 0];
                    rootNode.scale = [1, 1, -1];
                    GLTFLoader._LoadTransform(rootNode, this._rootBabylonMesh);
                }
                break;
            }
            case GLTFLoaderCoordinateSystemMode.FORCE_RIGHT_HANDED: {
                this._babylonScene.useRightHandedSystem = true;
                break;
            }
            default: {
                throw new Error("Invalid coordinate system mode (".concat(this._parent.coordinateSystemMode, ")"));
            }
        }
        this._parent.onMeshLoadedObservable.notifyObservers(this._rootBabylonMesh);
        return rootNode;
    };
    /**
     * Loads a glTF scene.
     * @param context The context when loading the asset
     * @param scene The glTF scene property
     * @returns A promise that resolves when the load is complete
     */
    GLTFLoader.prototype.loadSceneAsync = function (context, scene) {
        var _this = this;
        var extensionPromise = this._extensionsLoadSceneAsync(context, scene);
        if (extensionPromise) {
            return extensionPromise;
        }
        var promises = new Array();
        this.logOpen("".concat(context, " ").concat(scene.name || ""));
        if (scene.nodes) {
            for (var _i = 0, _a = scene.nodes; _i < _a.length; _i++) {
                var index = _a[_i];
                var node = ArrayItem.Get("".concat(context, "/nodes/").concat(index), this._gltf.nodes, index);
                promises.push(this.loadNodeAsync("/nodes/".concat(node.index), node, function (babylonMesh) {
                    babylonMesh.parent = _this._rootBabylonMesh;
                }));
            }
        }
        for (var _b = 0, _c = this._postSceneLoadActions; _b < _c.length; _b++) {
            var action = _c[_b];
            action();
        }
        promises.push(this._loadAnimationsAsync());
        this.logClose();
        return Promise.all(promises).then(function () { });
    };
    GLTFLoader.prototype._forEachPrimitive = function (node, callback) {
        if (node._primitiveBabylonMeshes) {
            for (var _i = 0, _a = node._primitiveBabylonMeshes; _i < _a.length; _i++) {
                var babylonMesh = _a[_i];
                callback(babylonMesh);
            }
        }
    };
    GLTFLoader.prototype._getGeometries = function () {
        var geometries = new Array();
        var nodes = this._gltf.nodes;
        if (nodes) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                this._forEachPrimitive(node, function (babylonMesh) {
                    var geometry = babylonMesh.geometry;
                    if (geometry && geometries.indexOf(geometry) === -1) {
                        geometries.push(geometry);
                    }
                });
            }
        }
        return geometries;
    };
    GLTFLoader.prototype._getMeshes = function () {
        var meshes = new Array();
        // Root mesh is always first, if available.
        if (this._rootBabylonMesh) {
            meshes.push(this._rootBabylonMesh);
        }
        var nodes = this._gltf.nodes;
        if (nodes) {
            for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
                var node = nodes_2[_i];
                this._forEachPrimitive(node, function (babylonMesh) {
                    meshes.push(babylonMesh);
                });
            }
        }
        return meshes;
    };
    GLTFLoader.prototype._getTransformNodes = function () {
        var transformNodes = new Array();
        var nodes = this._gltf.nodes;
        if (nodes) {
            for (var _i = 0, nodes_3 = nodes; _i < nodes_3.length; _i++) {
                var node = nodes_3[_i];
                if (node._babylonTransformNode && node._babylonTransformNode.getClassName() === "TransformNode") {
                    transformNodes.push(node._babylonTransformNode);
                }
                if (node._babylonTransformNodeForSkin) {
                    transformNodes.push(node._babylonTransformNodeForSkin);
                }
            }
        }
        return transformNodes;
    };
    GLTFLoader.prototype._getSkeletons = function () {
        var skeletons = new Array();
        var skins = this._gltf.skins;
        if (skins) {
            for (var _i = 0, skins_1 = skins; _i < skins_1.length; _i++) {
                var skin = skins_1[_i];
                if (skin._data) {
                    skeletons.push(skin._data.babylonSkeleton);
                }
            }
        }
        return skeletons;
    };
    GLTFLoader.prototype._getAnimationGroups = function () {
        var animationGroups = new Array();
        var animations = this._gltf.animations;
        if (animations) {
            for (var _i = 0, animations_1 = animations; _i < animations_1.length; _i++) {
                var animation = animations_1[_i];
                if (animation._babylonAnimationGroup) {
                    animationGroups.push(animation._babylonAnimationGroup);
                }
            }
        }
        return animationGroups;
    };
    GLTFLoader.prototype._startAnimations = function () {
        switch (this._parent.animationStartMode) {
            case GLTFLoaderAnimationStartMode.NONE: {
                // do nothing
                break;
            }
            case GLTFLoaderAnimationStartMode.FIRST: {
                var babylonAnimationGroups = this._getAnimationGroups();
                if (babylonAnimationGroups.length !== 0) {
                    babylonAnimationGroups[0].start(true);
                }
                break;
            }
            case GLTFLoaderAnimationStartMode.ALL: {
                var babylonAnimationGroups = this._getAnimationGroups();
                for (var _i = 0, babylonAnimationGroups_1 = babylonAnimationGroups; _i < babylonAnimationGroups_1.length; _i++) {
                    var babylonAnimationGroup = babylonAnimationGroups_1[_i];
                    babylonAnimationGroup.start(true);
                }
                break;
            }
            default: {
                Logger.Error("Invalid animation start mode (".concat(this._parent.animationStartMode, ")"));
                return;
            }
        }
    };
    /**
     * Loads a glTF node.
     * @param context The context when loading the asset
     * @param node The glTF node property
     * @param assign A function called synchronously after parsing the glTF properties
     * @returns A promise that resolves with the loaded Babylon mesh when the load is complete
     */
    GLTFLoader.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        if (assign === void 0) { assign = function () { }; }
        var extensionPromise = this._extensionsLoadNodeAsync(context, node, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        if (node._babylonTransformNode) {
            throw new Error("".concat(context, ": Invalid recursive node hierarchy"));
        }
        var promises = new Array();
        this.logOpen("".concat(context, " ").concat(node.name || ""));
        var loadNode = function (babylonTransformNode) {
            GLTFLoader.AddPointerMetadata(babylonTransformNode, context);
            GLTFLoader._LoadTransform(node, babylonTransformNode);
            if (node.camera != undefined) {
                var camera = ArrayItem.Get("".concat(context, "/camera"), _this._gltf.cameras, node.camera);
                promises.push(_this.loadCameraAsync("/cameras/".concat(camera.index), camera, function (babylonCamera) {
                    babylonCamera.parent = babylonTransformNode;
                }));
            }
            if (node.children) {
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var index = _a[_i];
                    var childNode = ArrayItem.Get("".concat(context, "/children/").concat(index), _this._gltf.nodes, index);
                    promises.push(_this.loadNodeAsync("/nodes/".concat(childNode.index), childNode, function (childBabylonMesh) {
                        childBabylonMesh.parent = babylonTransformNode;
                    }));
                }
            }
            assign(babylonTransformNode);
        };
        if (node.mesh == undefined || node.skin != undefined) {
            var nodeName = node.name || "node".concat(node.index);
            this._babylonScene._blockEntityCollection = !!this._assetContainer;
            var transformNode = new TransformNode(nodeName, this._babylonScene);
            transformNode._parentContainer = this._assetContainer;
            this._babylonScene._blockEntityCollection = false;
            if (node.mesh == undefined) {
                node._babylonTransformNode = transformNode;
            }
            else {
                node._babylonTransformNodeForSkin = transformNode;
            }
            loadNode(transformNode);
        }
        if (node.mesh != undefined) {
            if (node.skin == undefined) {
                var mesh = ArrayItem.Get("".concat(context, "/mesh"), this._gltf.meshes, node.mesh);
                promises.push(this._loadMeshAsync("/meshes/".concat(mesh.index), node, mesh, loadNode));
            }
            else {
                // See https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins (second implementation note)
                // This code path will place the skinned mesh as a sibling of the skeleton root node without loading the
                // transform, which effectively ignores the transform of the skinned mesh, as per spec.
                var mesh = ArrayItem.Get("".concat(context, "/mesh"), this._gltf.meshes, node.mesh);
                promises.push(this._loadMeshAsync("/meshes/".concat(mesh.index), node, mesh, function (babylonTransformNode) {
                    // Duplicate the metadata from the skin node to the skinned mesh in case any loader extension added metadata.
                    babylonTransformNode.metadata = node._babylonTransformNodeForSkin.metadata;
                    var skin = ArrayItem.Get("".concat(context, "/skin"), _this._gltf.skins, node.skin);
                    promises.push(_this._loadSkinAsync("/skins/".concat(skin.index), node, skin, function (babylonSkeleton) {
                        _this._forEachPrimitive(node, function (babylonMesh) {
                            babylonMesh.skeleton = babylonSkeleton;
                        });
                        // Wait until all the nodes are parented before parenting the skinned mesh.
                        _this._postSceneLoadActions.push(function () {
                            if (skin.skeleton != undefined) {
                                // Place the skinned mesh node as a sibling of the skeleton root node.
                                // Handle special case when the parent of the skeleton root is the skinned mesh.
                                var parentNode = ArrayItem.Get("/skins/".concat(skin.index, "/skeleton"), _this._gltf.nodes, skin.skeleton).parent;
                                if (node.index === parentNode.index) {
                                    babylonTransformNode.parent = node._babylonTransformNodeForSkin.parent;
                                }
                                else {
                                    babylonTransformNode.parent = parentNode._babylonTransformNode;
                                }
                            }
                            else {
                                babylonTransformNode.parent = _this._rootBabylonMesh;
                            }
                        });
                    }));
                }));
            }
        }
        this.logClose();
        return Promise.all(promises).then(function () {
            _this._forEachPrimitive(node, function (babylonMesh) {
                if (babylonMesh.geometry && babylonMesh.geometry.useBoundingInfoFromGeometry) {
                    // simply apply the world matrices to the bounding info - the extends are already ok
                    babylonMesh._updateBoundingInfo();
                }
                else {
                    babylonMesh.refreshBoundingInfo(true);
                }
            });
            return node._babylonTransformNode;
        });
    };
    GLTFLoader.prototype._loadMeshAsync = function (context, node, mesh, assign) {
        var primitives = mesh.primitives;
        if (!primitives || !primitives.length) {
            throw new Error("".concat(context, ": Primitives are missing"));
        }
        if (primitives[0].index == undefined) {
            ArrayItem.Assign(primitives);
        }
        var promises = new Array();
        this.logOpen("".concat(context, " ").concat(mesh.name || ""));
        var name = node.name || "node".concat(node.index);
        if (primitives.length === 1) {
            var primitive = mesh.primitives[0];
            promises.push(this._loadMeshPrimitiveAsync("".concat(context, "/primitives/").concat(primitive.index), name, node, mesh, primitive, function (babylonMesh) {
                node._babylonTransformNode = babylonMesh;
                node._primitiveBabylonMeshes = [babylonMesh];
            }));
        }
        else {
            this._babylonScene._blockEntityCollection = !!this._assetContainer;
            node._babylonTransformNode = new TransformNode(name, this._babylonScene);
            node._babylonTransformNode._parentContainer = this._assetContainer;
            this._babylonScene._blockEntityCollection = false;
            node._primitiveBabylonMeshes = [];
            for (var _i = 0, primitives_1 = primitives; _i < primitives_1.length; _i++) {
                var primitive = primitives_1[_i];
                promises.push(this._loadMeshPrimitiveAsync("".concat(context, "/primitives/").concat(primitive.index), "".concat(name, "_primitive").concat(primitive.index), node, mesh, primitive, function (babylonMesh) {
                    babylonMesh.parent = node._babylonTransformNode;
                    node._primitiveBabylonMeshes.push(babylonMesh);
                }));
            }
        }
        assign(node._babylonTransformNode);
        this.logClose();
        return Promise.all(promises).then(function () {
            return node._babylonTransformNode;
        });
    };
    /**
     * @hidden Define this method to modify the default behavior when loading data for mesh primitives.
     * @param context The context when loading the asset
     * @param name The mesh name when loading the asset
     * @param node The glTF node when loading the asset
     * @param mesh The glTF mesh when loading the asset
     * @param primitive The glTF mesh primitive property
     * @param assign A function called synchronously after parsing the glTF properties
     * @returns A promise that resolves with the loaded mesh when the load is complete or null if not handled
     */
    GLTFLoader.prototype._loadMeshPrimitiveAsync = function (context, name, node, mesh, primitive, assign) {
        var _this = this;
        var extensionPromise = this._extensionsLoadMeshPrimitiveAsync(context, name, node, mesh, primitive, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        this.logOpen("".concat(context));
        var shouldInstance = this._disableInstancedMesh === 0 && this._parent.createInstances && node.skin == undefined && !mesh.primitives[0].targets;
        var babylonAbstractMesh;
        var promise;
        if (shouldInstance && primitive._instanceData) {
            this._babylonScene._blockEntityCollection = !!this._assetContainer;
            babylonAbstractMesh = primitive._instanceData.babylonSourceMesh.createInstance(name);
            babylonAbstractMesh._parentContainer = this._assetContainer;
            this._babylonScene._blockEntityCollection = false;
            promise = primitive._instanceData.promise;
        }
        else {
            var promises = new Array();
            this._babylonScene._blockEntityCollection = !!this._assetContainer;
            var babylonMesh_1 = new Mesh(name, this._babylonScene);
            babylonMesh_1._parentContainer = this._assetContainer;
            this._babylonScene._blockEntityCollection = false;
            babylonMesh_1.overrideMaterialSideOrientation = this._babylonScene.useRightHandedSystem ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
            this._createMorphTargets(context, node, mesh, primitive, babylonMesh_1);
            promises.push(this._loadVertexDataAsync(context, primitive, babylonMesh_1).then(function (babylonGeometry) {
                return _this._loadMorphTargetsAsync(context, primitive, babylonMesh_1, babylonGeometry).then(function () {
                    if (_this._disposed) {
                        return;
                    }
                    _this._babylonScene._blockEntityCollection = !!_this._assetContainer;
                    babylonGeometry.applyToMesh(babylonMesh_1);
                    babylonGeometry._parentContainer = _this._assetContainer;
                    _this._babylonScene._blockEntityCollection = false;
                });
            }));
            var babylonDrawMode = GLTFLoader._GetDrawMode(context, primitive.mode);
            if (primitive.material == undefined) {
                var babylonMaterial = this._defaultBabylonMaterialData[babylonDrawMode];
                if (!babylonMaterial) {
                    babylonMaterial = this._createDefaultMaterial("__GLTFLoader._default", babylonDrawMode);
                    this._parent.onMaterialLoadedObservable.notifyObservers(babylonMaterial);
                    this._defaultBabylonMaterialData[babylonDrawMode] = babylonMaterial;
                }
                babylonMesh_1.material = babylonMaterial;
            }
            else if (!this.parent.skipMaterials) {
                var material = ArrayItem.Get("".concat(context, "/material"), this._gltf.materials, primitive.material);
                promises.push(this._loadMaterialAsync("/materials/".concat(material.index), material, babylonMesh_1, babylonDrawMode, function (babylonMaterial) {
                    babylonMesh_1.material = babylonMaterial;
                }));
            }
            promise = Promise.all(promises);
            if (shouldInstance) {
                primitive._instanceData = {
                    babylonSourceMesh: babylonMesh_1,
                    promise: promise,
                };
            }
            babylonAbstractMesh = babylonMesh_1;
        }
        GLTFLoader.AddPointerMetadata(babylonAbstractMesh, context);
        this._parent.onMeshLoadedObservable.notifyObservers(babylonAbstractMesh);
        assign(babylonAbstractMesh);
        this.logClose();
        return promise.then(function () {
            return babylonAbstractMesh;
        });
    };
    GLTFLoader.prototype._loadVertexDataAsync = function (context, primitive, babylonMesh) {
        var _this = this;
        var extensionPromise = this._extensionsLoadVertexDataAsync(context, primitive, babylonMesh);
        if (extensionPromise) {
            return extensionPromise;
        }
        var attributes = primitive.attributes;
        if (!attributes) {
            throw new Error("".concat(context, ": Attributes are missing"));
        }
        var promises = new Array();
        var babylonGeometry = new Geometry(babylonMesh.name, this._babylonScene);
        if (primitive.indices == undefined) {
            babylonMesh.isUnIndexed = true;
        }
        else {
            var accessor = ArrayItem.Get("".concat(context, "/indices"), this._gltf.accessors, primitive.indices);
            promises.push(this._loadIndicesAccessorAsync("/accessors/".concat(accessor.index), accessor).then(function (data) {
                babylonGeometry.setIndices(data);
            }));
        }
        var loadAttribute = function (attribute, kind, callback) {
            if (attributes[attribute] == undefined) {
                return;
            }
            babylonMesh._delayInfo = babylonMesh._delayInfo || [];
            if (babylonMesh._delayInfo.indexOf(kind) === -1) {
                babylonMesh._delayInfo.push(kind);
            }
            var accessor = ArrayItem.Get("".concat(context, "/attributes/").concat(attribute), _this._gltf.accessors, attributes[attribute]);
            promises.push(_this._loadVertexAccessorAsync("/accessors/".concat(accessor.index), accessor, kind).then(function (babylonVertexBuffer) {
                if (babylonVertexBuffer.getKind() === VertexBuffer.PositionKind && !_this.parent.alwaysComputeBoundingBox && !babylonMesh.skeleton) {
                    var mmin = accessor.min, mmax = accessor.max;
                    if (mmin !== undefined && mmax !== undefined) {
                        if (accessor.normalized && accessor.componentType !== 5126 /* FLOAT */) {
                            var divider = 1;
                            switch (accessor.componentType) {
                                case 5120 /* BYTE */:
                                    divider = 127.0;
                                    break;
                                case 5121 /* UNSIGNED_BYTE */:
                                    divider = 255.0;
                                    break;
                                case 5122 /* SHORT */:
                                    divider = 32767.0;
                                    break;
                                case 5123 /* UNSIGNED_SHORT */:
                                    divider = 65535.0;
                                    break;
                            }
                            for (var i = 0; i < 3; ++i) {
                                mmin[i] = Math.max(mmin[i] / divider, -1.0);
                                mmax[i] = Math.max(mmax[i] / divider, -1.0);
                            }
                        }
                        var min = TmpVectors.Vector3[0], max = TmpVectors.Vector3[1];
                        min.copyFromFloats.apply(min, mmin);
                        max.copyFromFloats.apply(max, mmax);
                        babylonGeometry._boundingInfo = new BoundingInfo(min, max);
                        babylonGeometry.useBoundingInfoFromGeometry = true;
                    }
                }
                babylonGeometry.setVerticesBuffer(babylonVertexBuffer, accessor.count);
            }));
            if (kind == VertexBuffer.MatricesIndicesExtraKind) {
                babylonMesh.numBoneInfluencers = 8;
            }
            if (callback) {
                callback(accessor);
            }
        };
        loadAttribute("POSITION", VertexBuffer.PositionKind);
        loadAttribute("NORMAL", VertexBuffer.NormalKind);
        loadAttribute("TANGENT", VertexBuffer.TangentKind);
        loadAttribute("TEXCOORD_0", VertexBuffer.UVKind);
        loadAttribute("TEXCOORD_1", VertexBuffer.UV2Kind);
        loadAttribute("TEXCOORD_2", VertexBuffer.UV3Kind);
        loadAttribute("TEXCOORD_3", VertexBuffer.UV4Kind);
        loadAttribute("TEXCOORD_4", VertexBuffer.UV5Kind);
        loadAttribute("TEXCOORD_5", VertexBuffer.UV6Kind);
        loadAttribute("JOINTS_0", VertexBuffer.MatricesIndicesKind);
        loadAttribute("WEIGHTS_0", VertexBuffer.MatricesWeightsKind);
        loadAttribute("JOINTS_1", VertexBuffer.MatricesIndicesExtraKind);
        loadAttribute("WEIGHTS_1", VertexBuffer.MatricesWeightsExtraKind);
        loadAttribute("COLOR_0", VertexBuffer.ColorKind, function (accessor) {
            if (accessor.type === "VEC4" /* VEC4 */) {
                babylonMesh.hasVertexAlpha = true;
            }
        });
        return Promise.all(promises).then(function () {
            return babylonGeometry;
        });
    };
    GLTFLoader.prototype._createMorphTargets = function (context, node, mesh, primitive, babylonMesh) {
        if (!primitive.targets) {
            return;
        }
        if (node._numMorphTargets == undefined) {
            node._numMorphTargets = primitive.targets.length;
        }
        else if (primitive.targets.length !== node._numMorphTargets) {
            throw new Error("".concat(context, ": Primitives do not have the same number of targets"));
        }
        var targetNames = mesh.extras ? mesh.extras.targetNames : null;
        babylonMesh.morphTargetManager = new MorphTargetManager(babylonMesh.getScene());
        babylonMesh.morphTargetManager.areUpdatesFrozen = true;
        for (var index = 0; index < primitive.targets.length; index++) {
            var weight = node.weights ? node.weights[index] : mesh.weights ? mesh.weights[index] : 0;
            var name_3 = targetNames ? targetNames[index] : "morphTarget".concat(index);
            babylonMesh.morphTargetManager.addTarget(new MorphTarget(name_3, weight, babylonMesh.getScene()));
            // TODO: tell the target whether it has positions, normals, tangents
        }
    };
    GLTFLoader.prototype._loadMorphTargetsAsync = function (context, primitive, babylonMesh, babylonGeometry) {
        if (!primitive.targets) {
            return Promise.resolve();
        }
        var promises = new Array();
        var morphTargetManager = babylonMesh.morphTargetManager;
        for (var index = 0; index < morphTargetManager.numTargets; index++) {
            var babylonMorphTarget = morphTargetManager.getTarget(index);
            promises.push(this._loadMorphTargetVertexDataAsync("".concat(context, "/targets/").concat(index), babylonGeometry, primitive.targets[index], babylonMorphTarget));
        }
        return Promise.all(promises).then(function () {
            morphTargetManager.areUpdatesFrozen = false;
        });
    };
    GLTFLoader.prototype._loadMorphTargetVertexDataAsync = function (context, babylonGeometry, attributes, babylonMorphTarget) {
        var _this = this;
        var promises = new Array();
        var loadAttribute = function (attribute, kind, setData) {
            if (attributes[attribute] == undefined) {
                return;
            }
            var babylonVertexBuffer = babylonGeometry.getVertexBuffer(kind);
            if (!babylonVertexBuffer) {
                return;
            }
            var accessor = ArrayItem.Get("".concat(context, "/").concat(attribute), _this._gltf.accessors, attributes[attribute]);
            promises.push(_this._loadFloatAccessorAsync("/accessors/".concat(accessor.index), accessor).then(function (data) {
                setData(babylonVertexBuffer, data);
            }));
        };
        loadAttribute("POSITION", VertexBuffer.PositionKind, function (babylonVertexBuffer, data) {
            var positions = new Float32Array(data.length);
            babylonVertexBuffer.forEach(data.length, function (value, index) {
                positions[index] = data[index] + value;
            });
            babylonMorphTarget.setPositions(positions);
        });
        loadAttribute("NORMAL", VertexBuffer.NormalKind, function (babylonVertexBuffer, data) {
            var normals = new Float32Array(data.length);
            babylonVertexBuffer.forEach(normals.length, function (value, index) {
                normals[index] = data[index] + value;
            });
            babylonMorphTarget.setNormals(normals);
        });
        loadAttribute("TANGENT", VertexBuffer.TangentKind, function (babylonVertexBuffer, data) {
            var tangents = new Float32Array((data.length / 3) * 4);
            var dataIndex = 0;
            babylonVertexBuffer.forEach((data.length / 3) * 4, function (value, index) {
                // Tangent data for morph targets is stored as xyz delta.
                // The vertexData.tangent is stored as xyzw.
                // So we need to skip every fourth vertexData.tangent.
                if ((index + 1) % 4 !== 0) {
                    tangents[dataIndex] = data[dataIndex] + value;
                    dataIndex++;
                }
            });
            babylonMorphTarget.setTangents(tangents);
        });
        return Promise.all(promises).then(function () { });
    };
    GLTFLoader._LoadTransform = function (node, babylonNode) {
        // Ignore the TRS of skinned nodes.
        // See https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins (second implementation note)
        if (node.skin != undefined) {
            return;
        }
        var position = Vector3.Zero();
        var rotation = Quaternion.Identity();
        var scaling = Vector3.One();
        if (node.matrix) {
            var matrix = Matrix.FromArray(node.matrix);
            matrix.decompose(scaling, rotation, position);
        }
        else {
            if (node.translation) {
                position = Vector3.FromArray(node.translation);
            }
            if (node.rotation) {
                rotation = Quaternion.FromArray(node.rotation);
            }
            if (node.scale) {
                scaling = Vector3.FromArray(node.scale);
            }
        }
        babylonNode.position = position;
        babylonNode.rotationQuaternion = rotation;
        babylonNode.scaling = scaling;
    };
    GLTFLoader.prototype._loadSkinAsync = function (context, node, skin, assign) {
        var _this = this;
        var extensionPromise = this._extensionsLoadSkinAsync(context, node, skin);
        if (extensionPromise) {
            return extensionPromise;
        }
        if (skin._data) {
            assign(skin._data.babylonSkeleton);
            return skin._data.promise;
        }
        var skeletonId = "skeleton".concat(skin.index);
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        var babylonSkeleton = new Skeleton(skin.name || skeletonId, skeletonId, this._babylonScene);
        babylonSkeleton._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        this._loadBones(context, skin, babylonSkeleton);
        var promise = this._loadSkinInverseBindMatricesDataAsync(context, skin).then(function (inverseBindMatricesData) {
            _this._updateBoneMatrices(babylonSkeleton, inverseBindMatricesData);
        });
        skin._data = {
            babylonSkeleton: babylonSkeleton,
            promise: promise,
        };
        assign(babylonSkeleton);
        return promise;
    };
    GLTFLoader.prototype._loadBones = function (context, skin, babylonSkeleton) {
        if (skin.skeleton == undefined || this._parent.alwaysComputeSkeletonRootNode) {
            var rootNode = this._findSkeletonRootNode("".concat(context, "/joints"), skin.joints);
            if (rootNode) {
                if (skin.skeleton === undefined) {
                    skin.skeleton = rootNode.index;
                }
                else {
                    var isParent = function (a, b) {
                        for (; b.parent; b = b.parent) {
                            if (b.parent === a) {
                                return true;
                            }
                        }
                        return false;
                    };
                    var skeletonNode = ArrayItem.Get("".concat(context, "/skeleton"), this._gltf.nodes, skin.skeleton);
                    if (skeletonNode !== rootNode && !isParent(skeletonNode, rootNode)) {
                        Logger.Warn("".concat(context, "/skeleton: Overriding with nearest common ancestor as skeleton node is not a common root"));
                        skin.skeleton = rootNode.index;
                    }
                }
            }
            else {
                Logger.Warn("".concat(context, ": Failed to find common root"));
            }
        }
        var babylonBones = {};
        for (var _i = 0, _a = skin.joints; _i < _a.length; _i++) {
            var index = _a[_i];
            var node = ArrayItem.Get("".concat(context, "/joints/").concat(index), this._gltf.nodes, index);
            this._loadBone(node, skin, babylonSkeleton, babylonBones);
        }
    };
    GLTFLoader.prototype._findSkeletonRootNode = function (context, joints) {
        if (joints.length === 0) {
            return null;
        }
        var paths = {};
        for (var _i = 0, joints_1 = joints; _i < joints_1.length; _i++) {
            var index = joints_1[_i];
            var path = new Array();
            var node = ArrayItem.Get("".concat(context, "/").concat(index), this._gltf.nodes, index);
            while (node.index !== -1) {
                path.unshift(node);
                node = node.parent;
            }
            paths[index] = path;
        }
        var rootNode = null;
        for (var i = 0;; ++i) {
            var path = paths[joints[0]];
            if (i >= path.length) {
                return rootNode;
            }
            var node = path[i];
            for (var j = 1; j < joints.length; ++j) {
                path = paths[joints[j]];
                if (i >= path.length || node !== path[i]) {
                    return rootNode;
                }
            }
            rootNode = node;
        }
    };
    GLTFLoader.prototype._loadBone = function (node, skin, babylonSkeleton, babylonBones) {
        var babylonBone = babylonBones[node.index];
        if (babylonBone) {
            return babylonBone;
        }
        var parentBabylonBone = null;
        if (node.index !== skin.skeleton) {
            if (node.parent && node.parent.index !== -1) {
                parentBabylonBone = this._loadBone(node.parent, skin, babylonSkeleton, babylonBones);
            }
            else if (skin.skeleton !== undefined) {
                Logger.Warn("/skins/".concat(skin.index, "/skeleton: Skeleton node is not a common root"));
            }
        }
        var boneIndex = skin.joints.indexOf(node.index);
        babylonBone = new Bone(node.name || "joint".concat(node.index), babylonSkeleton, parentBabylonBone, this._getNodeMatrix(node), null, null, boneIndex);
        babylonBones[node.index] = babylonBone;
        // Wait until the scene is loaded to ensure the transform nodes are loaded.
        this._postSceneLoadActions.push(function () {
            // Link the Babylon bone with the corresponding Babylon transform node.
            // A glTF joint is a pointer to a glTF node in the glTF node hierarchy similar to Unity3D.
            babylonBone.linkTransformNode(node._babylonTransformNode);
        });
        return babylonBone;
    };
    GLTFLoader.prototype._loadSkinInverseBindMatricesDataAsync = function (context, skin) {
        if (skin.inverseBindMatrices == undefined) {
            return Promise.resolve(null);
        }
        var accessor = ArrayItem.Get("".concat(context, "/inverseBindMatrices"), this._gltf.accessors, skin.inverseBindMatrices);
        return this._loadFloatAccessorAsync("/accessors/".concat(accessor.index), accessor);
    };
    GLTFLoader.prototype._updateBoneMatrices = function (babylonSkeleton, inverseBindMatricesData) {
        for (var _i = 0, _a = babylonSkeleton.bones; _i < _a.length; _i++) {
            var babylonBone = _a[_i];
            var baseMatrix = Matrix.Identity();
            var boneIndex = babylonBone._index;
            if (inverseBindMatricesData && boneIndex !== -1) {
                Matrix.FromArrayToRef(inverseBindMatricesData, boneIndex * 16, baseMatrix);
                baseMatrix.invertToRef(baseMatrix);
            }
            var babylonParentBone = babylonBone.getParent();
            if (babylonParentBone) {
                baseMatrix.multiplyToRef(babylonParentBone.getInvertedAbsoluteTransform(), baseMatrix);
            }
            babylonBone.updateMatrix(baseMatrix, false, false);
            babylonBone._updateDifferenceMatrix(undefined, false);
        }
    };
    GLTFLoader.prototype._getNodeMatrix = function (node) {
        return node.matrix
            ? Matrix.FromArray(node.matrix)
            : Matrix.Compose(node.scale ? Vector3.FromArray(node.scale) : Vector3.One(), node.rotation ? Quaternion.FromArray(node.rotation) : Quaternion.Identity(), node.translation ? Vector3.FromArray(node.translation) : Vector3.Zero());
    };
    /**
     * Loads a glTF camera.
     * @param context The context when loading the asset
     * @param camera The glTF camera property
     * @param assign A function called synchronously after parsing the glTF properties
     * @returns A promise that resolves with the loaded Babylon camera when the load is complete
     */
    GLTFLoader.prototype.loadCameraAsync = function (context, camera, assign) {
        if (assign === void 0) { assign = function () { }; }
        var extensionPromise = this._extensionsLoadCameraAsync(context, camera, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        var promises = new Array();
        this.logOpen("".concat(context, " ").concat(camera.name || ""));
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        var babylonCamera = new FreeCamera(camera.name || "camera".concat(camera.index), Vector3.Zero(), this._babylonScene, false);
        babylonCamera._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        babylonCamera.ignoreParentScaling = true;
        babylonCamera.rotation = new Vector3(0, Math.PI, 0);
        switch (camera.type) {
            case "perspective" /* PERSPECTIVE */: {
                var perspective = camera.perspective;
                if (!perspective) {
                    throw new Error("".concat(context, ": Camera perspective properties are missing"));
                }
                babylonCamera.fov = perspective.yfov;
                babylonCamera.minZ = perspective.znear;
                babylonCamera.maxZ = perspective.zfar || 0;
                break;
            }
            case "orthographic" /* ORTHOGRAPHIC */: {
                if (!camera.orthographic) {
                    throw new Error("".concat(context, ": Camera orthographic properties are missing"));
                }
                babylonCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
                babylonCamera.orthoLeft = -camera.orthographic.xmag;
                babylonCamera.orthoRight = camera.orthographic.xmag;
                babylonCamera.orthoBottom = -camera.orthographic.ymag;
                babylonCamera.orthoTop = camera.orthographic.ymag;
                babylonCamera.minZ = camera.orthographic.znear;
                babylonCamera.maxZ = camera.orthographic.zfar;
                break;
            }
            default: {
                throw new Error("".concat(context, ": Invalid camera type (").concat(camera.type, ")"));
            }
        }
        GLTFLoader.AddPointerMetadata(babylonCamera, context);
        this._parent.onCameraLoadedObservable.notifyObservers(babylonCamera);
        assign(babylonCamera);
        this.logClose();
        return Promise.all(promises).then(function () {
            return babylonCamera;
        });
    };
    GLTFLoader.prototype._loadAnimationsAsync = function () {
        var animations = this._gltf.animations;
        if (!animations) {
            return Promise.resolve();
        }
        var promises = new Array();
        for (var index = 0; index < animations.length; index++) {
            var animation = animations[index];
            promises.push(this.loadAnimationAsync("/animations/".concat(animation.index), animation).then(function (animationGroup) {
                // Delete the animation group if it ended up not having any animations in it.
                if (animationGroup.targetedAnimations.length === 0) {
                    animationGroup.dispose();
                }
            }));
        }
        return Promise.all(promises).then(function () { });
    };
    /**
     * Loads a glTF animation.
     * @param context The context when loading the asset
     * @param animation The glTF animation property
     * @returns A promise that resolves with the loaded Babylon animation group when the load is complete
     */
    GLTFLoader.prototype.loadAnimationAsync = function (context, animation) {
        var promise = this._extensionsLoadAnimationAsync(context, animation);
        if (promise) {
            return promise;
        }
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        var babylonAnimationGroup = new AnimationGroup(animation.name || "animation".concat(animation.index), this._babylonScene);
        babylonAnimationGroup._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        animation._babylonAnimationGroup = babylonAnimationGroup;
        var promises = new Array();
        ArrayItem.Assign(animation.channels);
        ArrayItem.Assign(animation.samplers);
        for (var _i = 0, _a = animation.channels; _i < _a.length; _i++) {
            var channel = _a[_i];
            promises.push(this._loadAnimationChannelAsync("".concat(context, "/channels/").concat(channel.index), context, animation, channel, babylonAnimationGroup));
        }
        return Promise.all(promises).then(function () {
            babylonAnimationGroup.normalize(0);
            return babylonAnimationGroup;
        });
    };
    /**
     * @hidden Loads a glTF animation channel.
     * @param context The context when loading the asset
     * @param animationContext The context of the animation when loading the asset
     * @param animation The glTF animation property
     * @param channel The glTF animation channel property
     * @param babylonAnimationGroup The babylon animation group property
     * @param animationTargetOverride The babylon animation channel target override property. My be null.
     * @returns A void promise when the channel load is complete
     */
    GLTFLoader.prototype._loadAnimationChannelAsync = function (context, animationContext, animation, channel, babylonAnimationGroup, animationTargetOverride) {
        var _this = this;
        if (animationTargetOverride === void 0) { animationTargetOverride = null; }
        if (channel.target.node == undefined) {
            return Promise.resolve();
        }
        var targetNode = ArrayItem.Get("".concat(context, "/target/node"), this._gltf.nodes, channel.target.node);
        // Ignore animations that have no animation targets.
        if ((channel.target.path === "weights" /* WEIGHTS */ && !targetNode._numMorphTargets) ||
            (channel.target.path !== "weights" /* WEIGHTS */ && !targetNode._babylonTransformNode)) {
            return Promise.resolve();
        }
        var sampler = ArrayItem.Get("".concat(context, "/sampler"), animation.samplers, channel.sampler);
        return this._loadAnimationSamplerAsync("".concat(animationContext, "/samplers/").concat(channel.sampler), sampler).then(function (data) {
            var targetPath;
            var animationType;
            switch (channel.target.path) {
                case "translation" /* TRANSLATION */: {
                    targetPath = "position";
                    animationType = Animation.ANIMATIONTYPE_VECTOR3;
                    break;
                }
                case "rotation" /* ROTATION */: {
                    targetPath = "rotationQuaternion";
                    animationType = Animation.ANIMATIONTYPE_QUATERNION;
                    break;
                }
                case "scale" /* SCALE */: {
                    targetPath = "scaling";
                    animationType = Animation.ANIMATIONTYPE_VECTOR3;
                    break;
                }
                case "weights" /* WEIGHTS */: {
                    targetPath = "influence";
                    animationType = Animation.ANIMATIONTYPE_FLOAT;
                    break;
                }
                default: {
                    throw new Error("".concat(context, "/target/path: Invalid value (").concat(channel.target.path, ")"));
                }
            }
            var outputBufferOffset = 0;
            var getNextOutputValue;
            switch (targetPath) {
                case "position": {
                    getNextOutputValue = function (scale) {
                        var value = Vector3.FromArray(data.output, outputBufferOffset).scaleInPlace(scale);
                        outputBufferOffset += 3;
                        return value;
                    };
                    break;
                }
                case "rotationQuaternion": {
                    getNextOutputValue = function (scale) {
                        var value = Quaternion.FromArray(data.output, outputBufferOffset).scaleInPlace(scale);
                        outputBufferOffset += 4;
                        return value;
                    };
                    break;
                }
                case "scaling": {
                    getNextOutputValue = function (scale) {
                        var value = Vector3.FromArray(data.output, outputBufferOffset).scaleInPlace(scale);
                        outputBufferOffset += 3;
                        return value;
                    };
                    break;
                }
                case "influence": {
                    getNextOutputValue = function (scale) {
                        var value = new Array(targetNode._numMorphTargets);
                        for (var i = 0; i < targetNode._numMorphTargets; i++) {
                            value[i] = data.output[outputBufferOffset++] * scale;
                        }
                        return value;
                    };
                    break;
                }
            }
            var getNextKey;
            switch (data.interpolation) {
                case "STEP" /* STEP */: {
                    getNextKey = function (frameIndex) { return ({
                        frame: data.input[frameIndex] * _this.parent.targetFps,
                        value: getNextOutputValue(1),
                        interpolation: AnimationKeyInterpolation.STEP,
                    }); };
                    break;
                }
                case "LINEAR" /* LINEAR */: {
                    getNextKey = function (frameIndex) { return ({
                        frame: data.input[frameIndex] * _this.parent.targetFps,
                        value: getNextOutputValue(1),
                    }); };
                    break;
                }
                case "CUBICSPLINE" /* CUBICSPLINE */: {
                    var invTargetFps_1 = 1 / _this.parent.targetFps;
                    getNextKey = function (frameIndex) { return ({
                        frame: data.input[frameIndex] * _this.parent.targetFps,
                        inTangent: getNextOutputValue(invTargetFps_1),
                        value: getNextOutputValue(1),
                        outTangent: getNextOutputValue(invTargetFps_1),
                    }); };
                    break;
                }
            }
            var keys = new Array(data.input.length);
            for (var frameIndex = 0; frameIndex < data.input.length; frameIndex++) {
                keys[frameIndex] = getNextKey(frameIndex);
            }
            if (targetPath === "influence") {
                var _loop_2 = function (targetIndex) {
                    var animationName = "".concat(babylonAnimationGroup.name, "_channel").concat(babylonAnimationGroup.targetedAnimations.length);
                    var babylonAnimation = new Animation(animationName, targetPath, _this.parent.targetFps, animationType);
                    babylonAnimation.setKeys(keys.map(function (key) { return ({
                        frame: key.frame,
                        inTangent: key.inTangent ? key.inTangent[targetIndex] : undefined,
                        value: key.value[targetIndex],
                        outTangent: key.outTangent ? key.outTangent[targetIndex] : undefined,
                    }); }));
                    _this._forEachPrimitive(targetNode, function (babylonAbstractMesh) {
                        var babylonMesh = babylonAbstractMesh;
                        if (babylonMesh.morphTargetManager) {
                            var morphTarget = babylonMesh.morphTargetManager.getTarget(targetIndex);
                            var babylonAnimationClone = babylonAnimation.clone();
                            morphTarget.animations.push(babylonAnimationClone);
                            babylonAnimationGroup.addTargetedAnimation(babylonAnimationClone, morphTarget);
                        }
                    });
                };
                for (var targetIndex = 0; targetIndex < targetNode._numMorphTargets; targetIndex++) {
                    _loop_2(targetIndex);
                }
            }
            else {
                var animationName = "".concat(babylonAnimationGroup.name, "_channel").concat(babylonAnimationGroup.targetedAnimations.length);
                var babylonAnimation = new Animation(animationName, targetPath, _this.parent.targetFps, animationType);
                babylonAnimation.setKeys(keys);
                if (animationTargetOverride != null && animationTargetOverride.animations != null) {
                    animationTargetOverride.animations.push(babylonAnimation);
                    babylonAnimationGroup.addTargetedAnimation(babylonAnimation, animationTargetOverride);
                }
                else {
                    targetNode._babylonTransformNode.animations.push(babylonAnimation);
                    babylonAnimationGroup.addTargetedAnimation(babylonAnimation, targetNode._babylonTransformNode);
                }
            }
        });
    };
    GLTFLoader.prototype._loadAnimationSamplerAsync = function (context, sampler) {
        if (sampler._data) {
            return sampler._data;
        }
        var interpolation = sampler.interpolation || "LINEAR" /* LINEAR */;
        switch (interpolation) {
            case "STEP" /* STEP */:
            case "LINEAR" /* LINEAR */:
            case "CUBICSPLINE" /* CUBICSPLINE */: {
                break;
            }
            default: {
                throw new Error("".concat(context, "/interpolation: Invalid value (").concat(sampler.interpolation, ")"));
            }
        }
        var inputAccessor = ArrayItem.Get("".concat(context, "/input"), this._gltf.accessors, sampler.input);
        var outputAccessor = ArrayItem.Get("".concat(context, "/output"), this._gltf.accessors, sampler.output);
        sampler._data = Promise.all([
            this._loadFloatAccessorAsync("/accessors/".concat(inputAccessor.index), inputAccessor),
            this._loadFloatAccessorAsync("/accessors/".concat(outputAccessor.index), outputAccessor),
        ]).then(function (_a) {
            var inputData = _a[0], outputData = _a[1];
            return {
                input: inputData,
                interpolation: interpolation,
                output: outputData,
            };
        });
        return sampler._data;
    };
    /**
     * Loads a glTF buffer.
     * @param context The context when loading the asset
     * @param buffer The glTF buffer property
     * @param byteOffset The byte offset to use
     * @param byteLength The byte length to use
     * @returns A promise that resolves with the loaded data when the load is complete
     */
    GLTFLoader.prototype.loadBufferAsync = function (context, buffer, byteOffset, byteLength) {
        var extensionPromise = this._extensionsLoadBufferAsync(context, buffer, byteOffset, byteLength);
        if (extensionPromise) {
            return extensionPromise;
        }
        if (!buffer._data) {
            if (buffer.uri) {
                buffer._data = this.loadUriAsync("".concat(context, "/uri"), buffer, buffer.uri);
            }
            else {
                if (!this._bin) {
                    throw new Error("".concat(context, ": Uri is missing or the binary glTF is missing its binary chunk"));
                }
                buffer._data = this._bin.readAsync(0, buffer.byteLength);
            }
        }
        return buffer._data.then(function (data) {
            try {
                return new Uint8Array(data.buffer, data.byteOffset + byteOffset, byteLength);
            }
            catch (e) {
                throw new Error("".concat(context, ": ").concat(e.message));
            }
        });
    };
    /**
     * Loads a glTF buffer view.
     * @param context The context when loading the asset
     * @param bufferView The glTF buffer view property
     * @returns A promise that resolves with the loaded data when the load is complete
     */
    GLTFLoader.prototype.loadBufferViewAsync = function (context, bufferView) {
        var extensionPromise = this._extensionsLoadBufferViewAsync(context, bufferView);
        if (extensionPromise) {
            return extensionPromise;
        }
        if (bufferView._data) {
            return bufferView._data;
        }
        var buffer = ArrayItem.Get("".concat(context, "/buffer"), this._gltf.buffers, bufferView.buffer);
        bufferView._data = this.loadBufferAsync("/buffers/".concat(buffer.index), buffer, bufferView.byteOffset || 0, bufferView.byteLength);
        return bufferView._data;
    };
    GLTFLoader.prototype._loadAccessorAsync = function (context, accessor, constructor) {
        var _this = this;
        if (accessor._data) {
            return accessor._data;
        }
        var numComponents = GLTFLoader._GetNumComponents(context, accessor.type);
        var byteStride = numComponents * VertexBuffer.GetTypeByteLength(accessor.componentType);
        var length = numComponents * accessor.count;
        if (accessor.bufferView == undefined) {
            accessor._data = Promise.resolve(new constructor(length));
        }
        else {
            var bufferView_1 = ArrayItem.Get("".concat(context, "/bufferView"), this._gltf.bufferViews, accessor.bufferView);
            accessor._data = this.loadBufferViewAsync("/bufferViews/".concat(bufferView_1.index), bufferView_1).then(function (data) {
                if (accessor.componentType === 5126 /* FLOAT */ && !accessor.normalized && (!bufferView_1.byteStride || bufferView_1.byteStride === byteStride)) {
                    return GLTFLoader._GetTypedArray(context, accessor.componentType, data, accessor.byteOffset, length);
                }
                else {
                    var typedArray_1 = new constructor(length);
                    VertexBuffer.ForEach(data, accessor.byteOffset || 0, bufferView_1.byteStride || byteStride, numComponents, accessor.componentType, typedArray_1.length, accessor.normalized || false, function (value, index) {
                        typedArray_1[index] = value;
                    });
                    return typedArray_1;
                }
            });
        }
        if (accessor.sparse) {
            var sparse_1 = accessor.sparse;
            accessor._data = accessor._data.then(function (data) {
                var typedArray = data;
                var indicesBufferView = ArrayItem.Get("".concat(context, "/sparse/indices/bufferView"), _this._gltf.bufferViews, sparse_1.indices.bufferView);
                var valuesBufferView = ArrayItem.Get("".concat(context, "/sparse/values/bufferView"), _this._gltf.bufferViews, sparse_1.values.bufferView);
                return Promise.all([
                    _this.loadBufferViewAsync("/bufferViews/".concat(indicesBufferView.index), indicesBufferView),
                    _this.loadBufferViewAsync("/bufferViews/".concat(valuesBufferView.index), valuesBufferView),
                ]).then(function (_a) {
                    var indicesData = _a[0], valuesData = _a[1];
                    var indices = GLTFLoader._GetTypedArray("".concat(context, "/sparse/indices"), sparse_1.indices.componentType, indicesData, sparse_1.indices.byteOffset, sparse_1.count);
                    var sparseLength = numComponents * sparse_1.count;
                    var values;
                    if (accessor.componentType === 5126 /* FLOAT */ && !accessor.normalized) {
                        values = GLTFLoader._GetTypedArray("".concat(context, "/sparse/values"), accessor.componentType, valuesData, sparse_1.values.byteOffset, sparseLength);
                    }
                    else {
                        var sparseData = GLTFLoader._GetTypedArray("".concat(context, "/sparse/values"), accessor.componentType, valuesData, sparse_1.values.byteOffset, sparseLength);
                        values = new constructor(sparseLength);
                        VertexBuffer.ForEach(sparseData, 0, byteStride, numComponents, accessor.componentType, values.length, accessor.normalized || false, function (value, index) {
                            values[index] = value;
                        });
                    }
                    var valuesIndex = 0;
                    for (var indicesIndex = 0; indicesIndex < indices.length; indicesIndex++) {
                        var dataIndex = indices[indicesIndex] * numComponents;
                        for (var componentIndex = 0; componentIndex < numComponents; componentIndex++) {
                            typedArray[dataIndex++] = values[valuesIndex++];
                        }
                    }
                    return typedArray;
                });
            });
        }
        return accessor._data;
    };
    /**
     * @param context
     * @param accessor
     * @hidden
     */
    GLTFLoader.prototype._loadFloatAccessorAsync = function (context, accessor) {
        return this._loadAccessorAsync(context, accessor, Float32Array);
    };
    GLTFLoader.prototype._loadIndicesAccessorAsync = function (context, accessor) {
        if (accessor.type !== "SCALAR" /* SCALAR */) {
            throw new Error("".concat(context, "/type: Invalid value ").concat(accessor.type));
        }
        if (accessor.componentType !== 5121 /* UNSIGNED_BYTE */ &&
            accessor.componentType !== 5123 /* UNSIGNED_SHORT */ &&
            accessor.componentType !== 5125 /* UNSIGNED_INT */) {
            throw new Error("".concat(context, "/componentType: Invalid value ").concat(accessor.componentType));
        }
        if (accessor._data) {
            return accessor._data;
        }
        if (accessor.sparse) {
            var constructor = GLTFLoader._GetTypedArrayConstructor("".concat(context, "/componentType"), accessor.componentType);
            accessor._data = this._loadAccessorAsync(context, accessor, constructor);
        }
        else {
            var bufferView = ArrayItem.Get("".concat(context, "/bufferView"), this._gltf.bufferViews, accessor.bufferView);
            accessor._data = this.loadBufferViewAsync("/bufferViews/".concat(bufferView.index), bufferView).then(function (data) {
                return GLTFLoader._GetTypedArray(context, accessor.componentType, data, accessor.byteOffset, accessor.count);
            });
        }
        return accessor._data;
    };
    GLTFLoader.prototype._loadVertexBufferViewAsync = function (bufferView) {
        if (bufferView._babylonBuffer) {
            return bufferView._babylonBuffer;
        }
        var engine = this._babylonScene.getEngine();
        bufferView._babylonBuffer = this.loadBufferViewAsync("/bufferViews/".concat(bufferView.index), bufferView).then(function (data) {
            return new Buffer(engine, data, false);
        });
        return bufferView._babylonBuffer;
    };
    GLTFLoader.prototype._loadVertexAccessorAsync = function (context, accessor, kind) {
        var _a;
        if ((_a = accessor._babylonVertexBuffer) === null || _a === void 0 ? void 0 : _a[kind]) {
            return accessor._babylonVertexBuffer[kind];
        }
        if (!accessor._babylonVertexBuffer) {
            accessor._babylonVertexBuffer = {};
        }
        var engine = this._babylonScene.getEngine();
        if (accessor.sparse) {
            accessor._babylonVertexBuffer[kind] = this._loadFloatAccessorAsync(context, accessor).then(function (data) {
                return new VertexBuffer(engine, data, kind, false);
            });
        }
        // Load joint indices as a float array since the shaders expect float data but glTF uses unsigned byte/short.
        // This prevents certain platforms (e.g. D3D) from having to convert the data to float on the fly.
        else if (kind === VertexBuffer.MatricesIndicesKind || kind === VertexBuffer.MatricesIndicesExtraKind) {
            accessor._babylonVertexBuffer[kind] = this._loadFloatAccessorAsync(context, accessor).then(function (data) {
                return new VertexBuffer(engine, data, kind, false);
            });
        }
        else {
            var bufferView_2 = ArrayItem.Get("".concat(context, "/bufferView"), this._gltf.bufferViews, accessor.bufferView);
            accessor._babylonVertexBuffer[kind] = this._loadVertexBufferViewAsync(bufferView_2).then(function (babylonBuffer) {
                var size = GLTFLoader._GetNumComponents(context, accessor.type);
                return new VertexBuffer(engine, babylonBuffer, kind, false, false, bufferView_2.byteStride, false, accessor.byteOffset, size, accessor.componentType, accessor.normalized, true, 1, true);
            });
        }
        return accessor._babylonVertexBuffer[kind];
    };
    GLTFLoader.prototype._loadMaterialMetallicRoughnessPropertiesAsync = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        if (properties) {
            if (properties.baseColorFactor) {
                babylonMaterial.albedoColor = Color3.FromArray(properties.baseColorFactor);
                babylonMaterial.alpha = properties.baseColorFactor[3];
            }
            else {
                babylonMaterial.albedoColor = Color3.White();
            }
            babylonMaterial.metallic = properties.metallicFactor == undefined ? 1 : properties.metallicFactor;
            babylonMaterial.roughness = properties.roughnessFactor == undefined ? 1 : properties.roughnessFactor;
            if (properties.baseColorTexture) {
                promises.push(this.loadTextureInfoAsync("".concat(context, "/baseColorTexture"), properties.baseColorTexture, function (texture) {
                    texture.name = "".concat(babylonMaterial.name, " (Base Color)");
                    babylonMaterial.albedoTexture = texture;
                }));
            }
            if (properties.metallicRoughnessTexture) {
                properties.metallicRoughnessTexture.nonColorData = true;
                promises.push(this.loadTextureInfoAsync("".concat(context, "/metallicRoughnessTexture"), properties.metallicRoughnessTexture, function (texture) {
                    texture.name = "".concat(babylonMaterial.name, " (Metallic Roughness)");
                    babylonMaterial.metallicTexture = texture;
                }));
                babylonMaterial.useMetallnessFromMetallicTextureBlue = true;
                babylonMaterial.useRoughnessFromMetallicTextureGreen = true;
                babylonMaterial.useRoughnessFromMetallicTextureAlpha = false;
            }
        }
        return Promise.all(promises).then(function () { });
    };
    /**
     * @param context
     * @param material
     * @param babylonMesh
     * @param babylonDrawMode
     * @param assign
     * @hidden
     */
    GLTFLoader.prototype._loadMaterialAsync = function (context, material, babylonMesh, babylonDrawMode, assign) {
        if (assign === void 0) { assign = function () { }; }
        var extensionPromise = this._extensionsLoadMaterialAsync(context, material, babylonMesh, babylonDrawMode, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        material._data = material._data || {};
        var babylonData = material._data[babylonDrawMode];
        if (!babylonData) {
            this.logOpen("".concat(context, " ").concat(material.name || ""));
            var babylonMaterial = this.createMaterial(context, material, babylonDrawMode);
            babylonData = {
                babylonMaterial: babylonMaterial,
                babylonMeshes: [],
                promise: this.loadMaterialPropertiesAsync(context, material, babylonMaterial),
            };
            material._data[babylonDrawMode] = babylonData;
            GLTFLoader.AddPointerMetadata(babylonMaterial, context);
            this._parent.onMaterialLoadedObservable.notifyObservers(babylonMaterial);
            this.logClose();
        }
        if (babylonMesh) {
            babylonData.babylonMeshes.push(babylonMesh);
            babylonMesh.onDisposeObservable.addOnce(function () {
                var index = babylonData.babylonMeshes.indexOf(babylonMesh);
                if (index !== -1) {
                    babylonData.babylonMeshes.splice(index, 1);
                }
            });
        }
        assign(babylonData.babylonMaterial);
        return babylonData.promise.then(function () {
            return babylonData.babylonMaterial;
        });
    };
    GLTFLoader.prototype._createDefaultMaterial = function (name, babylonDrawMode) {
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        var babylonMaterial = new PBRMaterial(name, this._babylonScene);
        babylonMaterial._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        // Moved to mesh so user can change materials on gltf meshes: babylonMaterial.sideOrientation = this._babylonScene.useRightHandedSystem ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
        babylonMaterial.fillMode = babylonDrawMode;
        babylonMaterial.enableSpecularAntiAliasing = true;
        babylonMaterial.useRadianceOverAlpha = !this._parent.transparencyAsCoverage;
        babylonMaterial.useSpecularOverAlpha = !this._parent.transparencyAsCoverage;
        babylonMaterial.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
        babylonMaterial.metallic = 1;
        babylonMaterial.roughness = 1;
        return babylonMaterial;
    };
    /**
     * Creates a Babylon material from a glTF material.
     * @param context The context when loading the asset
     * @param material The glTF material property
     * @param babylonDrawMode The draw mode for the Babylon material
     * @returns The Babylon material
     */
    GLTFLoader.prototype.createMaterial = function (context, material, babylonDrawMode) {
        var extensionPromise = this._extensionsCreateMaterial(context, material, babylonDrawMode);
        if (extensionPromise) {
            return extensionPromise;
        }
        var name = material.name || "material".concat(material.index);
        var babylonMaterial = this._createDefaultMaterial(name, babylonDrawMode);
        return babylonMaterial;
    };
    /**
     * Loads properties from a glTF material into a Babylon material.
     * @param context The context when loading the asset
     * @param material The glTF material property
     * @param babylonMaterial The Babylon material
     * @returns A promise that resolves when the load is complete
     */
    GLTFLoader.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var extensionPromise = this._extensionsLoadMaterialPropertiesAsync(context, material, babylonMaterial);
        if (extensionPromise) {
            return extensionPromise;
        }
        var promises = new Array();
        promises.push(this.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
        if (material.pbrMetallicRoughness) {
            promises.push(this._loadMaterialMetallicRoughnessPropertiesAsync("".concat(context, "/pbrMetallicRoughness"), material.pbrMetallicRoughness, babylonMaterial));
        }
        this.loadMaterialAlphaProperties(context, material, babylonMaterial);
        return Promise.all(promises).then(function () { });
    };
    /**
     * Loads the normal, occlusion, and emissive properties from a glTF material into a Babylon material.
     * @param context The context when loading the asset
     * @param material The glTF material property
     * @param babylonMaterial The Babylon material
     * @returns A promise that resolves when the load is complete
     */
    GLTFLoader.prototype.loadMaterialBasePropertiesAsync = function (context, material, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.emissiveColor = material.emissiveFactor ? Color3.FromArray(material.emissiveFactor) : new Color3(0, 0, 0);
        if (material.doubleSided) {
            babylonMaterial.backFaceCulling = false;
            babylonMaterial.twoSidedLighting = true;
        }
        if (material.normalTexture) {
            material.normalTexture.nonColorData = true;
            promises.push(this.loadTextureInfoAsync("".concat(context, "/normalTexture"), material.normalTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Normal)");
                babylonMaterial.bumpTexture = texture;
            }));
            babylonMaterial.invertNormalMapX = !this._babylonScene.useRightHandedSystem;
            babylonMaterial.invertNormalMapY = this._babylonScene.useRightHandedSystem;
            if (material.normalTexture.scale != undefined && babylonMaterial.bumpTexture) {
                babylonMaterial.bumpTexture.level = material.normalTexture.scale;
            }
            babylonMaterial.forceIrradianceInFragment = true;
        }
        if (material.occlusionTexture) {
            material.occlusionTexture.nonColorData = true;
            promises.push(this.loadTextureInfoAsync("".concat(context, "/occlusionTexture"), material.occlusionTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Occlusion)");
                babylonMaterial.ambientTexture = texture;
            }));
            babylonMaterial.useAmbientInGrayScale = true;
            if (material.occlusionTexture.strength != undefined) {
                babylonMaterial.ambientTextureStrength = material.occlusionTexture.strength;
            }
        }
        if (material.emissiveTexture) {
            promises.push(this.loadTextureInfoAsync("".concat(context, "/emissiveTexture"), material.emissiveTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Emissive)");
                babylonMaterial.emissiveTexture = texture;
            }));
        }
        return Promise.all(promises).then(function () { });
    };
    /**
     * Loads the alpha properties from a glTF material into a Babylon material.
     * Must be called after the setting the albedo texture of the Babylon material when the material has an albedo texture.
     * @param context The context when loading the asset
     * @param material The glTF material property
     * @param babylonMaterial The Babylon material
     */
    GLTFLoader.prototype.loadMaterialAlphaProperties = function (context, material, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var alphaMode = material.alphaMode || "OPAQUE" /* OPAQUE */;
        switch (alphaMode) {
            case "OPAQUE" /* OPAQUE */: {
                babylonMaterial.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
                break;
            }
            case "MASK" /* MASK */: {
                babylonMaterial.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHATEST;
                babylonMaterial.alphaCutOff = material.alphaCutoff == undefined ? 0.5 : material.alphaCutoff;
                if (babylonMaterial.albedoTexture) {
                    babylonMaterial.albedoTexture.hasAlpha = true;
                }
                break;
            }
            case "BLEND" /* BLEND */: {
                babylonMaterial.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
                if (babylonMaterial.albedoTexture) {
                    babylonMaterial.albedoTexture.hasAlpha = true;
                    babylonMaterial.useAlphaFromAlbedoTexture = true;
                }
                break;
            }
            default: {
                throw new Error("".concat(context, "/alphaMode: Invalid value (").concat(material.alphaMode, ")"));
            }
        }
    };
    /**
     * Loads a glTF texture info.
     * @param context The context when loading the asset
     * @param textureInfo The glTF texture info property
     * @param assign A function called synchronously after parsing the glTF properties
     * @returns A promise that resolves with the loaded Babylon texture when the load is complete
     */
    GLTFLoader.prototype.loadTextureInfoAsync = function (context, textureInfo, assign) {
        var _this = this;
        if (assign === void 0) { assign = function () { }; }
        var extensionPromise = this._extensionsLoadTextureInfoAsync(context, textureInfo, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        this.logOpen("".concat(context));
        if (textureInfo.texCoord >= 6) {
            throw new Error("".concat(context, "/texCoord: Invalid value (").concat(textureInfo.texCoord, ")"));
        }
        var texture = ArrayItem.Get("".concat(context, "/index"), this._gltf.textures, textureInfo.index);
        texture._textureInfo = textureInfo;
        var promise = this._loadTextureAsync("/textures/".concat(textureInfo.index), texture, function (babylonTexture) {
            babylonTexture.coordinatesIndex = textureInfo.texCoord || 0;
            GLTFLoader.AddPointerMetadata(babylonTexture, context);
            _this._parent.onTextureLoadedObservable.notifyObservers(babylonTexture);
            assign(babylonTexture);
        });
        this.logClose();
        return promise;
    };
    /**
     * @param context
     * @param texture
     * @param assign
     * @hidden
     */
    GLTFLoader.prototype._loadTextureAsync = function (context, texture, assign) {
        if (assign === void 0) { assign = function () { }; }
        var extensionPromise = this._extensionsLoadTextureAsync(context, texture, assign);
        if (extensionPromise) {
            return extensionPromise;
        }
        this.logOpen("".concat(context, " ").concat(texture.name || ""));
        var sampler = texture.sampler == undefined ? GLTFLoader.DefaultSampler : ArrayItem.Get("".concat(context, "/sampler"), this._gltf.samplers, texture.sampler);
        var image = ArrayItem.Get("".concat(context, "/source"), this._gltf.images, texture.source);
        var promise = this._createTextureAsync(context, sampler, image, assign, undefined, !texture._textureInfo.nonColorData);
        this.logClose();
        return promise;
    };
    /**
     * @param context
     * @param sampler
     * @param image
     * @param assign
     * @param textureLoaderOptions
     * @param useSRGBBuffer
     * @hidden
     */
    GLTFLoader.prototype._createTextureAsync = function (context, sampler, image, assign, textureLoaderOptions, useSRGBBuffer) {
        var _this = this;
        if (assign === void 0) { assign = function () { }; }
        var samplerData = this._loadSampler("/samplers/".concat(sampler.index), sampler);
        var promises = new Array();
        var deferred = new Deferred();
        this._babylonScene._blockEntityCollection = !!this._assetContainer;
        var textureCreationOptions = {
            noMipmap: samplerData.noMipMaps,
            invertY: false,
            samplingMode: samplerData.samplingMode,
            onLoad: function () {
                if (!_this._disposed) {
                    deferred.resolve();
                }
            },
            onError: function (message, exception) {
                if (!_this._disposed) {
                    deferred.reject(new Error("".concat(context, ": ").concat(exception && exception.message ? exception.message : message || "Failed to load texture")));
                }
            },
            mimeType: image.mimeType,
            loaderOptions: textureLoaderOptions,
            useSRGBBuffer: !!useSRGBBuffer && this._parent.useSRGBBuffers,
        };
        var babylonTexture = new Texture(null, this._babylonScene, textureCreationOptions);
        babylonTexture._parentContainer = this._assetContainer;
        this._babylonScene._blockEntityCollection = false;
        promises.push(deferred.promise);
        promises.push(this.loadImageAsync("/images/".concat(image.index), image).then(function (data) {
            var name = image.uri || "".concat(_this._fileName, "#image").concat(image.index);
            var dataUrl = "data:".concat(_this._uniqueRootUrl).concat(name);
            babylonTexture.updateURL(dataUrl, data);
        }));
        babylonTexture.wrapU = samplerData.wrapU;
        babylonTexture.wrapV = samplerData.wrapV;
        assign(babylonTexture);
        return Promise.all(promises).then(function () {
            return babylonTexture;
        });
    };
    GLTFLoader.prototype._loadSampler = function (context, sampler) {
        if (!sampler._data) {
            sampler._data = {
                noMipMaps: sampler.minFilter === 9728 /* NEAREST */ || sampler.minFilter === 9729 /* LINEAR */,
                samplingMode: GLTFLoader._GetTextureSamplingMode(context, sampler),
                wrapU: GLTFLoader._GetTextureWrapMode("".concat(context, "/wrapS"), sampler.wrapS),
                wrapV: GLTFLoader._GetTextureWrapMode("".concat(context, "/wrapT"), sampler.wrapT),
            };
        }
        return sampler._data;
    };
    /**
     * Loads a glTF image.
     * @param context The context when loading the asset
     * @param image The glTF image property
     * @returns A promise that resolves with the loaded data when the load is complete
     */
    GLTFLoader.prototype.loadImageAsync = function (context, image) {
        if (!image._data) {
            this.logOpen("".concat(context, " ").concat(image.name || ""));
            if (image.uri) {
                image._data = this.loadUriAsync("".concat(context, "/uri"), image, image.uri);
            }
            else {
                var bufferView = ArrayItem.Get("".concat(context, "/bufferView"), this._gltf.bufferViews, image.bufferView);
                image._data = this.loadBufferViewAsync("/bufferViews/".concat(bufferView.index), bufferView);
            }
            this.logClose();
        }
        return image._data;
    };
    /**
     * Loads a glTF uri.
     * @param context The context when loading the asset
     * @param property The glTF property associated with the uri
     * @param uri The base64 or relative uri
     * @returns A promise that resolves with the loaded data when the load is complete
     */
    GLTFLoader.prototype.loadUriAsync = function (context, property, uri) {
        var _this = this;
        var extensionPromise = this._extensionsLoadUriAsync(context, property, uri);
        if (extensionPromise) {
            return extensionPromise;
        }
        if (!GLTFLoader._ValidateUri(uri)) {
            throw new Error("".concat(context, ": '").concat(uri, "' is invalid"));
        }
        if (IsBase64DataUrl(uri)) {
            var data = new Uint8Array(DecodeBase64UrlToBinary(uri));
            this.log("".concat(context, ": Decoded ").concat(uri.substr(0, 64), "... (").concat(data.length, " bytes)"));
            return Promise.resolve(data);
        }
        this.log("".concat(context, ": Loading ").concat(uri));
        return this._parent.preprocessUrlAsync(this._rootUrl + uri).then(function (url) {
            return new Promise(function (resolve, reject) {
                _this._parent._loadFile(_this._babylonScene, url, function (data) {
                    if (!_this._disposed) {
                        _this.log("".concat(context, ": Loaded ").concat(uri, " (").concat(data.byteLength, " bytes)"));
                        resolve(new Uint8Array(data));
                    }
                }, true, function (request) {
                    reject(new LoadFileError("".concat(context, ": Failed to load '").concat(uri, "'").concat(request ? ": " + request.status + " " + request.statusText : ""), request));
                });
            });
        });
    };
    /**
     * Adds a JSON pointer to the metadata of the Babylon object at `<object>.metadata.gltf.pointers`.
     * @param babylonObject the Babylon object with metadata
     * @param babylonObject.metadata
     * @param pointer the JSON pointer
     */
    GLTFLoader.AddPointerMetadata = function (babylonObject, pointer) {
        var metadata = (babylonObject.metadata = babylonObject.metadata || {});
        var gltf = (metadata.gltf = metadata.gltf || {});
        var pointers = (gltf.pointers = gltf.pointers || []);
        pointers.push(pointer);
    };
    GLTFLoader._GetTextureWrapMode = function (context, mode) {
        // Set defaults if undefined
        mode = mode == undefined ? 10497 /* REPEAT */ : mode;
        switch (mode) {
            case 33071 /* CLAMP_TO_EDGE */:
                return Texture.CLAMP_ADDRESSMODE;
            case 33648 /* MIRRORED_REPEAT */:
                return Texture.MIRROR_ADDRESSMODE;
            case 10497 /* REPEAT */:
                return Texture.WRAP_ADDRESSMODE;
            default:
                Logger.Warn("".concat(context, ": Invalid value (").concat(mode, ")"));
                return Texture.WRAP_ADDRESSMODE;
        }
    };
    GLTFLoader._GetTextureSamplingMode = function (context, sampler) {
        // Set defaults if undefined
        var magFilter = sampler.magFilter == undefined ? 9729 /* LINEAR */ : sampler.magFilter;
        var minFilter = sampler.minFilter == undefined ? 9987 /* LINEAR_MIPMAP_LINEAR */ : sampler.minFilter;
        if (magFilter === 9729 /* LINEAR */) {
            switch (minFilter) {
                case 9728 /* NEAREST */:
                    return Texture.LINEAR_NEAREST;
                case 9729 /* LINEAR */:
                    return Texture.LINEAR_LINEAR;
                case 9984 /* NEAREST_MIPMAP_NEAREST */:
                    return Texture.LINEAR_NEAREST_MIPNEAREST;
                case 9985 /* LINEAR_MIPMAP_NEAREST */:
                    return Texture.LINEAR_LINEAR_MIPNEAREST;
                case 9986 /* NEAREST_MIPMAP_LINEAR */:
                    return Texture.LINEAR_NEAREST_MIPLINEAR;
                case 9987 /* LINEAR_MIPMAP_LINEAR */:
                    return Texture.LINEAR_LINEAR_MIPLINEAR;
                default:
                    Logger.Warn("".concat(context, "/minFilter: Invalid value (").concat(minFilter, ")"));
                    return Texture.LINEAR_LINEAR_MIPLINEAR;
            }
        }
        else {
            if (magFilter !== 9728 /* NEAREST */) {
                Logger.Warn("".concat(context, "/magFilter: Invalid value (").concat(magFilter, ")"));
            }
            switch (minFilter) {
                case 9728 /* NEAREST */:
                    return Texture.NEAREST_NEAREST;
                case 9729 /* LINEAR */:
                    return Texture.NEAREST_LINEAR;
                case 9984 /* NEAREST_MIPMAP_NEAREST */:
                    return Texture.NEAREST_NEAREST_MIPNEAREST;
                case 9985 /* LINEAR_MIPMAP_NEAREST */:
                    return Texture.NEAREST_LINEAR_MIPNEAREST;
                case 9986 /* NEAREST_MIPMAP_LINEAR */:
                    return Texture.NEAREST_NEAREST_MIPLINEAR;
                case 9987 /* LINEAR_MIPMAP_LINEAR */:
                    return Texture.NEAREST_LINEAR_MIPLINEAR;
                default:
                    Logger.Warn("".concat(context, "/minFilter: Invalid value (").concat(minFilter, ")"));
                    return Texture.NEAREST_NEAREST_MIPNEAREST;
            }
        }
    };
    GLTFLoader._GetTypedArrayConstructor = function (context, componentType) {
        switch (componentType) {
            case 5120 /* BYTE */:
                return Int8Array;
            case 5121 /* UNSIGNED_BYTE */:
                return Uint8Array;
            case 5122 /* SHORT */:
                return Int16Array;
            case 5123 /* UNSIGNED_SHORT */:
                return Uint16Array;
            case 5125 /* UNSIGNED_INT */:
                return Uint32Array;
            case 5126 /* FLOAT */:
                return Float32Array;
            default:
                throw new Error("".concat(context, ": Invalid component type ").concat(componentType));
        }
    };
    GLTFLoader._GetTypedArray = function (context, componentType, bufferView, byteOffset, length) {
        var buffer = bufferView.buffer;
        byteOffset = bufferView.byteOffset + (byteOffset || 0);
        var constructor = GLTFLoader._GetTypedArrayConstructor("".concat(context, "/componentType"), componentType);
        var componentTypeLength = VertexBuffer.GetTypeByteLength(componentType);
        if (byteOffset % componentTypeLength !== 0) {
            // HACK: Copy the buffer if byte offset is not a multiple of component type byte length.
            Logger.Warn("".concat(context, ": Copying buffer as byte offset (").concat(byteOffset, ") is not a multiple of component type byte length (").concat(componentTypeLength, ")"));
            return new constructor(buffer.slice(byteOffset, byteOffset + length * componentTypeLength), 0);
        }
        return new constructor(buffer, byteOffset, length);
    };
    GLTFLoader._GetNumComponents = function (context, type) {
        switch (type) {
            case "SCALAR":
                return 1;
            case "VEC2":
                return 2;
            case "VEC3":
                return 3;
            case "VEC4":
                return 4;
            case "MAT2":
                return 4;
            case "MAT3":
                return 9;
            case "MAT4":
                return 16;
        }
        throw new Error("".concat(context, ": Invalid type (").concat(type, ")"));
    };
    GLTFLoader._ValidateUri = function (uri) {
        return Tools.IsBase64(uri) || uri.indexOf("..") === -1;
    };
    /**
     * @param context
     * @param mode
     * @hidden
     */
    GLTFLoader._GetDrawMode = function (context, mode) {
        if (mode == undefined) {
            mode = 4 /* TRIANGLES */;
        }
        switch (mode) {
            case 0 /* POINTS */:
                return Material.PointListDrawMode;
            case 1 /* LINES */:
                return Material.LineListDrawMode;
            case 2 /* LINE_LOOP */:
                return Material.LineLoopDrawMode;
            case 3 /* LINE_STRIP */:
                return Material.LineStripDrawMode;
            case 4 /* TRIANGLES */:
                return Material.TriangleFillMode;
            case 5 /* TRIANGLE_STRIP */:
                return Material.TriangleStripDrawMode;
            case 6 /* TRIANGLE_FAN */:
                return Material.TriangleFanDrawMode;
        }
        throw new Error("".concat(context, ": Invalid mesh primitive mode (").concat(mode, ")"));
    };
    GLTFLoader.prototype._compileMaterialsAsync = function () {
        var _this = this;
        this._parent._startPerformanceCounter("Compile materials");
        var promises = new Array();
        if (this._gltf.materials) {
            for (var _i = 0, _a = this._gltf.materials; _i < _a.length; _i++) {
                var material = _a[_i];
                if (material._data) {
                    for (var babylonDrawMode in material._data) {
                        var babylonData = material._data[babylonDrawMode];
                        for (var _b = 0, _c = babylonData.babylonMeshes; _b < _c.length; _b++) {
                            var babylonMesh = _c[_b];
                            // Ensure nonUniformScaling is set if necessary.
                            babylonMesh.computeWorldMatrix(true);
                            var babylonMaterial = babylonData.babylonMaterial;
                            promises.push(babylonMaterial.forceCompilationAsync(babylonMesh));
                            promises.push(babylonMaterial.forceCompilationAsync(babylonMesh, { useInstances: true }));
                            if (this._parent.useClipPlane) {
                                promises.push(babylonMaterial.forceCompilationAsync(babylonMesh, { clipPlane: true }));
                                promises.push(babylonMaterial.forceCompilationAsync(babylonMesh, { clipPlane: true, useInstances: true }));
                            }
                        }
                    }
                }
            }
        }
        return Promise.all(promises).then(function () {
            _this._parent._endPerformanceCounter("Compile materials");
        });
    };
    GLTFLoader.prototype._compileShadowGeneratorsAsync = function () {
        var _this = this;
        this._parent._startPerformanceCounter("Compile shadow generators");
        var promises = new Array();
        var lights = this._babylonScene.lights;
        for (var _i = 0, lights_1 = lights; _i < lights_1.length; _i++) {
            var light = lights_1[_i];
            var generator = light.getShadowGenerator();
            if (generator) {
                promises.push(generator.forceCompilationAsync());
            }
        }
        return Promise.all(promises).then(function () {
            _this._parent._endPerformanceCounter("Compile shadow generators");
        });
    };
    GLTFLoader.prototype._forEachExtensions = function (action) {
        for (var _i = 0, _a = this._extensions; _i < _a.length; _i++) {
            var extension = _a[_i];
            if (extension.enabled) {
                action(extension);
            }
        }
    };
    GLTFLoader.prototype._applyExtensions = function (property, functionName, actionAsync) {
        for (var _i = 0, _a = this._extensions; _i < _a.length; _i++) {
            var extension = _a[_i];
            if (extension.enabled) {
                var id = "".concat(extension.name, ".").concat(functionName);
                var loaderProperty = property;
                loaderProperty._activeLoaderExtensionFunctions = loaderProperty._activeLoaderExtensionFunctions || {};
                var activeLoaderExtensionFunctions = loaderProperty._activeLoaderExtensionFunctions;
                if (!activeLoaderExtensionFunctions[id]) {
                    activeLoaderExtensionFunctions[id] = true;
                    try {
                        var result = actionAsync(extension);
                        if (result) {
                            return result;
                        }
                    }
                    finally {
                        delete activeLoaderExtensionFunctions[id];
                    }
                }
            }
        }
        return null;
    };
    GLTFLoader.prototype._extensionsOnLoading = function () {
        this._forEachExtensions(function (extension) { return extension.onLoading && extension.onLoading(); });
    };
    GLTFLoader.prototype._extensionsOnReady = function () {
        this._forEachExtensions(function (extension) { return extension.onReady && extension.onReady(); });
    };
    GLTFLoader.prototype._extensionsLoadSceneAsync = function (context, scene) {
        return this._applyExtensions(scene, "loadScene", function (extension) { return extension.loadSceneAsync && extension.loadSceneAsync(context, scene); });
    };
    GLTFLoader.prototype._extensionsLoadNodeAsync = function (context, node, assign) {
        return this._applyExtensions(node, "loadNode", function (extension) { return extension.loadNodeAsync && extension.loadNodeAsync(context, node, assign); });
    };
    GLTFLoader.prototype._extensionsLoadCameraAsync = function (context, camera, assign) {
        return this._applyExtensions(camera, "loadCamera", function (extension) { return extension.loadCameraAsync && extension.loadCameraAsync(context, camera, assign); });
    };
    GLTFLoader.prototype._extensionsLoadVertexDataAsync = function (context, primitive, babylonMesh) {
        return this._applyExtensions(primitive, "loadVertexData", function (extension) { return extension._loadVertexDataAsync && extension._loadVertexDataAsync(context, primitive, babylonMesh); });
    };
    GLTFLoader.prototype._extensionsLoadMeshPrimitiveAsync = function (context, name, node, mesh, primitive, assign) {
        return this._applyExtensions(primitive, "loadMeshPrimitive", function (extension) { return extension._loadMeshPrimitiveAsync && extension._loadMeshPrimitiveAsync(context, name, node, mesh, primitive, assign); });
    };
    GLTFLoader.prototype._extensionsLoadMaterialAsync = function (context, material, babylonMesh, babylonDrawMode, assign) {
        return this._applyExtensions(material, "loadMaterial", function (extension) { return extension._loadMaterialAsync && extension._loadMaterialAsync(context, material, babylonMesh, babylonDrawMode, assign); });
    };
    GLTFLoader.prototype._extensionsCreateMaterial = function (context, material, babylonDrawMode) {
        return this._applyExtensions(material, "createMaterial", function (extension) { return extension.createMaterial && extension.createMaterial(context, material, babylonDrawMode); });
    };
    GLTFLoader.prototype._extensionsLoadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        return this._applyExtensions(material, "loadMaterialProperties", function (extension) { return extension.loadMaterialPropertiesAsync && extension.loadMaterialPropertiesAsync(context, material, babylonMaterial); });
    };
    GLTFLoader.prototype._extensionsLoadTextureInfoAsync = function (context, textureInfo, assign) {
        return this._applyExtensions(textureInfo, "loadTextureInfo", function (extension) { return extension.loadTextureInfoAsync && extension.loadTextureInfoAsync(context, textureInfo, assign); });
    };
    GLTFLoader.prototype._extensionsLoadTextureAsync = function (context, texture, assign) {
        return this._applyExtensions(texture, "loadTexture", function (extension) { return extension._loadTextureAsync && extension._loadTextureAsync(context, texture, assign); });
    };
    GLTFLoader.prototype._extensionsLoadAnimationAsync = function (context, animation) {
        return this._applyExtensions(animation, "loadAnimation", function (extension) { return extension.loadAnimationAsync && extension.loadAnimationAsync(context, animation); });
    };
    GLTFLoader.prototype._extensionsLoadSkinAsync = function (context, node, skin) {
        return this._applyExtensions(skin, "loadSkin", function (extension) { return extension._loadSkinAsync && extension._loadSkinAsync(context, node, skin); });
    };
    GLTFLoader.prototype._extensionsLoadUriAsync = function (context, property, uri) {
        return this._applyExtensions(property, "loadUri", function (extension) { return extension._loadUriAsync && extension._loadUriAsync(context, property, uri); });
    };
    GLTFLoader.prototype._extensionsLoadBufferViewAsync = function (context, bufferView) {
        return this._applyExtensions(bufferView, "loadBufferView", function (extension) { return extension.loadBufferViewAsync && extension.loadBufferViewAsync(context, bufferView); });
    };
    GLTFLoader.prototype._extensionsLoadBufferAsync = function (context, buffer, byteOffset, byteLength) {
        return this._applyExtensions(buffer, "loadBuffer", function (extension) { return extension.loadBufferAsync && extension.loadBufferAsync(context, buffer, byteOffset, byteLength); });
    };
    /**
     * Helper method called by a loader extension to load an glTF extension.
     * @param context The context when loading the asset
     * @param property The glTF property to load the extension from
     * @param extensionName The name of the extension to load
     * @param actionAsync The action to run
     * @returns The promise returned by actionAsync or null if the extension does not exist
     */
    GLTFLoader.LoadExtensionAsync = function (context, property, extensionName, actionAsync) {
        if (!property.extensions) {
            return null;
        }
        var extensions = property.extensions;
        var extension = extensions[extensionName];
        if (!extension) {
            return null;
        }
        return actionAsync("".concat(context, "/extensions/").concat(extensionName), extension);
    };
    /**
     * Helper method called by a loader extension to load a glTF extra.
     * @param context The context when loading the asset
     * @param property The glTF property to load the extra from
     * @param extensionName The name of the extension to load
     * @param actionAsync The action to run
     * @returns The promise returned by actionAsync or null if the extra does not exist
     */
    GLTFLoader.LoadExtraAsync = function (context, property, extensionName, actionAsync) {
        if (!property.extras) {
            return null;
        }
        var extras = property.extras;
        var extra = extras[extensionName];
        if (!extra) {
            return null;
        }
        return actionAsync("".concat(context, "/extras/").concat(extensionName), extra);
    };
    /**
     * Checks for presence of an extension.
     * @param name The name of the extension to check
     * @returns A boolean indicating the presence of the given extension name in `extensionsUsed`
     */
    GLTFLoader.prototype.isExtensionUsed = function (name) {
        return !!this._gltf.extensionsUsed && this._gltf.extensionsUsed.indexOf(name) !== -1;
    };
    /**
     * Increments the indentation level and logs a message.
     * @param message The message to log
     */
    GLTFLoader.prototype.logOpen = function (message) {
        this._parent._logOpen(message);
    };
    /**
     * Decrements the indentation level.
     */
    GLTFLoader.prototype.logClose = function () {
        this._parent._logClose();
    };
    /**
     * Logs a message
     * @param message The message to log
     */
    GLTFLoader.prototype.log = function (message) {
        this._parent._log(message);
    };
    /**
     * Starts a performance counter.
     * @param counterName The name of the performance counter
     */
    GLTFLoader.prototype.startPerformanceCounter = function (counterName) {
        this._parent._startPerformanceCounter(counterName);
    };
    /**
     * Ends a performance counter.
     * @param counterName The name of the performance counter
     */
    GLTFLoader.prototype.endPerformanceCounter = function (counterName) {
        this._parent._endPerformanceCounter(counterName);
    };
    GLTFLoader._RegisteredExtensions = {};
    /**
     * The default glTF sampler.
     */
    GLTFLoader.DefaultSampler = { index: -1 };
    return GLTFLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GLTFLoader', { enumerable: true, configurable: true, get: function() { return GLTFLoader; } });
GLTFFileLoader._CreateGLTF2Loader = function (parent) { return new GLTFLoader(parent); };
//# sourceMappingURL=glTFLoader.js.map
}, function(modId) { var map = {"../glTFFileLoader.js":1661401224743}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224753, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=glTFLoaderExtension.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224754, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=glTFLoaderInterfaces.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224755, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./EXT_lights_image_based.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./EXT_mesh_gpu_instancing.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./EXT_meshopt_compression.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./EXT_texture_webp.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_draco_mesh_compression.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_lights_punctual.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_pbrSpecularGlossiness.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_unlit.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_clearcoat.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_iridescence.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_emissive_strength.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_sheen.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_specular.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_ior.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_variants.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_transmission.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_translucency.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_materials_volume.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_mesh_quantization.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_texture_basisu.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_texture_transform.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./KHR_xmp_json_ld.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./MSFT_audio_emitter.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./MSFT_lod.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./MSFT_minecraftMesh.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./MSFT_sRGBFactors.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./ExtrasAsMetadata.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./EXT_lights_image_based.js":1661401224756,"./EXT_mesh_gpu_instancing.js":1661401224757,"./EXT_meshopt_compression.js":1661401224758,"./EXT_texture_webp.js":1661401224759,"./KHR_draco_mesh_compression.js":1661401224760,"./KHR_lights_punctual.js":1661401224761,"./KHR_materials_pbrSpecularGlossiness.js":1661401224762,"./KHR_materials_unlit.js":1661401224763,"./KHR_materials_clearcoat.js":1661401224764,"./KHR_materials_iridescence.js":1661401224765,"./KHR_materials_emissive_strength.js":1661401224766,"./KHR_materials_sheen.js":1661401224767,"./KHR_materials_specular.js":1661401224768,"./KHR_materials_ior.js":1661401224769,"./KHR_materials_variants.js":1661401224770,"./KHR_materials_transmission.js":1661401224771,"./KHR_materials_translucency.js":1661401224772,"./KHR_materials_volume.js":1661401224773,"./KHR_mesh_quantization.js":1661401224774,"./KHR_texture_basisu.js":1661401224775,"./KHR_texture_transform.js":1661401224776,"./KHR_xmp_json_ld.js":1661401224777,"./MSFT_audio_emitter.js":1661401224778,"./MSFT_lod.js":1661401224779,"./MSFT_minecraftMesh.js":1661401224780,"./MSFT_sRGBFactors.js":1661401224781,"./ExtrasAsMetadata.js":1661401224782}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224756, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.scalar.js');var Scalar = __TEMP__['Scalar'];
var __TEMP__ = require('@babylonjs/core/Maths/sphericalPolynomial.js');var SphericalHarmonics = __TEMP__['SphericalHarmonics'];var SphericalPolynomial = __TEMP__['SphericalPolynomial'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Quaternion = __TEMP__['Quaternion'];var Matrix = __TEMP__['Matrix'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/rawCubeTexture.js');var RawCubeTexture = __TEMP__['RawCubeTexture'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "EXT_lights_image_based";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Vendor/EXT_lights_image_based/README.md)
 */
var EXT_lights_image_based = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function EXT_lights_image_based(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    EXT_lights_image_based.prototype.dispose = function () {
        this._loader = null;
        delete this._lights;
    };
    /** @hidden */
    EXT_lights_image_based.prototype.onLoading = function () {
        var extensions = this._loader.gltf.extensions;
        if (extensions && extensions[this.name]) {
            var extension = extensions[this.name];
            this._lights = extension.lights;
        }
    };
    /**
     * @param context
     * @param scene
     * @hidden
     */
    EXT_lights_image_based.prototype.loadSceneAsync = function (context, scene) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, scene, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadSceneAsync(context, scene));
            _this._loader.logOpen("".concat(extensionContext));
            var light = ArrayItem.Get("".concat(extensionContext, "/light"), _this._lights, extension.light);
            promises.push(_this._loadLightAsync("/extensions/".concat(_this.name, "/lights/").concat(extension.light), light).then(function (texture) {
                _this._loader.babylonScene.environmentTexture = texture;
            }));
            _this._loader.logClose();
            return Promise.all(promises).then(function () { });
        });
    };
    EXT_lights_image_based.prototype._loadLightAsync = function (context, light) {
        var _this = this;
        if (!light._loaded) {
            var promises = new Array();
            this._loader.logOpen("".concat(context));
            var imageData_1 = new Array(light.specularImages.length);
            var _loop_1 = function (mipmap) {
                var faces = light.specularImages[mipmap];
                imageData_1[mipmap] = new Array(faces.length);
                var _loop_2 = function (face) {
                    var specularImageContext = "".concat(context, "/specularImages/").concat(mipmap, "/").concat(face);
                    this_1._loader.logOpen("".concat(specularImageContext));
                    var index = faces[face];
                    var image = ArrayItem.Get(specularImageContext, this_1._loader.gltf.images, index);
                    promises.push(this_1._loader.loadImageAsync("/images/".concat(index), image).then(function (data) {
                        imageData_1[mipmap][face] = data;
                    }));
                    this_1._loader.logClose();
                };
                for (var face = 0; face < faces.length; face++) {
                    _loop_2(face);
                }
            };
            var this_1 = this;
            for (var mipmap = 0; mipmap < light.specularImages.length; mipmap++) {
                _loop_1(mipmap);
            }
            this._loader.logClose();
            light._loaded = Promise.all(promises).then(function () {
                var babylonTexture = new RawCubeTexture(_this._loader.babylonScene, null, light.specularImageSize);
                babylonTexture.name = light.name || "environment";
                light._babylonTexture = babylonTexture;
                if (light.intensity != undefined) {
                    babylonTexture.level = light.intensity;
                }
                if (light.rotation) {
                    var rotation = Quaternion.FromArray(light.rotation);
                    // Invert the rotation so that positive rotation is counter-clockwise.
                    if (!_this._loader.babylonScene.useRightHandedSystem) {
                        rotation = Quaternion.Inverse(rotation);
                    }
                    Matrix.FromQuaternionToRef(rotation, babylonTexture.getReflectionTextureMatrix());
                }
                if (!light.irradianceCoefficients) {
                    throw new Error("".concat(context, ": Irradiance coefficients are missing"));
                }
                var sphericalHarmonics = SphericalHarmonics.FromArray(light.irradianceCoefficients);
                sphericalHarmonics.scaleInPlace(light.intensity);
                sphericalHarmonics.convertIrradianceToLambertianRadiance();
                var sphericalPolynomial = SphericalPolynomial.FromHarmonics(sphericalHarmonics);
                // Compute the lod generation scale to fit exactly to the number of levels available.
                var lodGenerationScale = (imageData_1.length - 1) / Scalar.Log2(light.specularImageSize);
                return babylonTexture.updateRGBDAsync(imageData_1, sphericalPolynomial, lodGenerationScale);
            });
        }
        return light._loaded.then(function () {
            return light._babylonTexture;
        });
    };
    return EXT_lights_image_based;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'EXT_lights_image_based', { enumerable: true, configurable: true, get: function() { return EXT_lights_image_based; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new EXT_lights_image_based(loader); });
//# sourceMappingURL=EXT_lights_image_based.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224757, function(require, module, exports) {
/* eslint-disable @typescript-eslint/naming-convention */
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector3 = __TEMP__['Vector3'];var Quaternion = __TEMP__['Quaternion'];var Matrix = __TEMP__['Matrix'];var TmpVectors = __TEMP__['TmpVectors'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var __TEMP__ = require('@babylonjs/core/Meshes/thinInstanceMesh.js');
var NAME = "EXT_mesh_gpu_instancing";
/**
 * [Proposed Specification](https://github.com/KhronosGroup/glTF/pull/1691)
 * [Playground Sample](https://playground.babylonjs.com/#QFIGLW#9)
 * !!! Experimental Extension Subject to Changes !!!
 */
var EXT_mesh_gpu_instancing = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function EXT_mesh_gpu_instancing(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    EXT_mesh_gpu_instancing.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param node
     * @param assign
     * @hidden
     */
    EXT_mesh_gpu_instancing.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, node, this.name, function (extensionContext, extension) {
            _this._loader._disableInstancedMesh++;
            var promise = _this._loader.loadNodeAsync("/nodes/".concat(node.index), node, assign);
            _this._loader._disableInstancedMesh--;
            if (!node._primitiveBabylonMeshes) {
                return promise;
            }
            var promises = new Array();
            var instanceCount = 0;
            var loadAttribute = function (attribute) {
                if (extension.attributes[attribute] == undefined) {
                    promises.push(Promise.resolve(null));
                    return;
                }
                var accessor = ArrayItem.Get("".concat(extensionContext, "/attributes/").concat(attribute), _this._loader.gltf.accessors, extension.attributes[attribute]);
                promises.push(_this._loader._loadFloatAccessorAsync("/accessors/".concat(accessor.bufferView), accessor));
                if (instanceCount === 0) {
                    instanceCount = accessor.count;
                }
                else if (instanceCount !== accessor.count) {
                    throw new Error("".concat(extensionContext, "/attributes: Instance buffer accessors do not have the same count."));
                }
            };
            loadAttribute("TRANSLATION");
            loadAttribute("ROTATION");
            loadAttribute("SCALE");
            return promise.then(function (babylonTransformNode) {
                return Promise.all(promises).then(function (_a) {
                    var translationBuffer = _a[0], rotationBuffer = _a[1], scaleBuffer = _a[2];
                    var matrices = new Float32Array(instanceCount * 16);
                    TmpVectors.Vector3[0].copyFromFloats(0, 0, 0); // translation
                    TmpVectors.Quaternion[0].copyFromFloats(0, 0, 0, 1); // rotation
                    TmpVectors.Vector3[1].copyFromFloats(1, 1, 1); // scale
                    for (var i = 0; i < instanceCount; ++i) {
                        translationBuffer && Vector3.FromArrayToRef(translationBuffer, i * 3, TmpVectors.Vector3[0]);
                        rotationBuffer && Quaternion.FromArrayToRef(rotationBuffer, i * 4, TmpVectors.Quaternion[0]);
                        scaleBuffer && Vector3.FromArrayToRef(scaleBuffer, i * 3, TmpVectors.Vector3[1]);
                        Matrix.ComposeToRef(TmpVectors.Vector3[1], TmpVectors.Quaternion[0], TmpVectors.Vector3[0], TmpVectors.Matrix[0]);
                        TmpVectors.Matrix[0].copyToArray(matrices, i * 16);
                    }
                    for (var _i = 0, _b = node._primitiveBabylonMeshes; _i < _b.length; _i++) {
                        var babylonMesh = _b[_i];
                        babylonMesh.thinInstanceSetBuffer("matrix", matrices, 16, true);
                    }
                    return babylonTransformNode;
                });
            });
        });
    };
    return EXT_mesh_gpu_instancing;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'EXT_mesh_gpu_instancing', { enumerable: true, configurable: true, get: function() { return EXT_mesh_gpu_instancing; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new EXT_mesh_gpu_instancing(loader); });
//# sourceMappingURL=EXT_mesh_gpu_instancing.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224758, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var ArrayItem = __TEMP__['ArrayItem'];var GLTFLoader = __TEMP__['GLTFLoader'];
var __TEMP__ = require('@babylonjs/core/Meshes/Compression/meshoptCompression.js');var MeshoptCompression = __TEMP__['MeshoptCompression'];
var NAME = "EXT_meshopt_compression";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression)
 *
 * This extension uses a WebAssembly decoder module from https://github.com/zeux/meshoptimizer/tree/master/js
 * @since 5.0.0
 */
var EXT_meshopt_compression = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function EXT_meshopt_compression(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this.enabled = loader.isExtensionUsed(NAME);
        this._loader = loader;
    }
    /** @hidden */
    EXT_meshopt_compression.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param bufferView
     * @hidden
     */
    EXT_meshopt_compression.prototype.loadBufferViewAsync = function (context, bufferView) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, bufferView, this.name, function (extensionContext, extension) {
            var bufferViewMeshopt = bufferView;
            if (bufferViewMeshopt._meshOptData) {
                return bufferViewMeshopt._meshOptData;
            }
            var buffer = ArrayItem.Get("".concat(context, "/buffer"), _this._loader.gltf.buffers, extension.buffer);
            bufferViewMeshopt._meshOptData = _this._loader.loadBufferAsync("/buffers/".concat(buffer.index), buffer, extension.byteOffset || 0, extension.byteLength).then(function (buffer) {
                return MeshoptCompression.Default.decodeGltfBufferAsync(buffer, extension.count, extension.byteStride, extension.mode, extension.filter);
            });
            return bufferViewMeshopt._meshOptData;
        });
    };
    return EXT_meshopt_compression;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'EXT_meshopt_compression', { enumerable: true, configurable: true, get: function() { return EXT_meshopt_compression; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new EXT_meshopt_compression(loader); });
//# sourceMappingURL=EXT_meshopt_compression.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224759, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "EXT_texture_webp";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Vendor/EXT_texture_webp/)
 */
var EXT_texture_webp = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function EXT_texture_webp(loader) {
        /** The name of this extension. */
        this.name = NAME;
        this._loader = loader;
        this.enabled = loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    EXT_texture_webp.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param texture
     * @param assign
     * @hidden
     */
    EXT_texture_webp.prototype._loadTextureAsync = function (context, texture, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, texture, this.name, function (extensionContext, extension) {
            var sampler = texture.sampler == undefined ? GLTFLoader.DefaultSampler : ArrayItem.Get("".concat(context, "/sampler"), _this._loader.gltf.samplers, texture.sampler);
            var image = ArrayItem.Get("".concat(extensionContext, "/source"), _this._loader.gltf.images, extension.source);
            return _this._loader._createTextureAsync(context, sampler, image, function (babylonTexture) {
                assign(babylonTexture);
            }, undefined, !texture._textureInfo.nonColorData);
        });
    };
    return EXT_texture_webp;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'EXT_texture_webp', { enumerable: true, configurable: true, get: function() { return EXT_texture_webp; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new EXT_texture_webp(loader); });
//# sourceMappingURL=EXT_texture_webp.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224760, function(require, module, exports) {
/* eslint-disable @typescript-eslint/naming-convention */
var __TEMP__ = require('@babylonjs/core/Meshes/Compression/dracoCompression.js');var DracoCompression = __TEMP__['DracoCompression'];
var __TEMP__ = require('@babylonjs/core/Buffers/buffer.js');var VertexBuffer = __TEMP__['VertexBuffer'];
var __TEMP__ = require('@babylonjs/core/Meshes/geometry.js');var Geometry = __TEMP__['Geometry'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "KHR_draco_mesh_compression";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression)
 */
var KHR_draco_mesh_compression = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_draco_mesh_compression(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = DracoCompression.DecoderAvailable && this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_draco_mesh_compression.prototype.dispose = function () {
        delete this.dracoCompression;
        this._loader = null;
    };
    /**
     * @param context
     * @param primitive
     * @param babylonMesh
     * @hidden
     */
    KHR_draco_mesh_compression.prototype._loadVertexDataAsync = function (context, primitive, babylonMesh) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, primitive, this.name, function (extensionContext, extension) {
            if (primitive.mode != undefined) {
                if (primitive.mode !== 5 /* TRIANGLE_STRIP */ && primitive.mode !== 4 /* TRIANGLES */) {
                    throw new Error("".concat(context, ": Unsupported mode ").concat(primitive.mode));
                }
                // TODO: handle triangle strips
                if (primitive.mode === 5 /* TRIANGLE_STRIP */) {
                    throw new Error("".concat(context, ": Mode ").concat(primitive.mode, " is not currently supported"));
                }
            }
            var attributes = {};
            var dividers = {};
            var loadAttribute = function (name, kind) {
                var uniqueId = extension.attributes[name];
                if (uniqueId === undefined || primitive.attributes[name] === undefined) {
                    return;
                }
                attributes[kind] = uniqueId;
                var accessor = ArrayItem.Get("".concat(context, "/attributes/").concat(name), _this._loader.gltf.accessors, primitive.attributes[name]);
                if (accessor.normalized && accessor.componentType !== 5126 /* FLOAT */) {
                    var divider = 1;
                    switch (accessor.componentType) {
                        case 5120 /* BYTE */:
                            divider = 127.0;
                            break;
                        case 5121 /* UNSIGNED_BYTE */:
                            divider = 255.0;
                            break;
                        case 5122 /* SHORT */:
                            divider = 32767.0;
                            break;
                        case 5123 /* UNSIGNED_SHORT */:
                            divider = 65535.0;
                            break;
                    }
                    dividers[kind] = divider;
                }
                babylonMesh._delayInfo = babylonMesh._delayInfo || [];
                if (babylonMesh._delayInfo.indexOf(kind) === -1) {
                    babylonMesh._delayInfo.push(kind);
                }
            };
            loadAttribute("POSITION", VertexBuffer.PositionKind);
            loadAttribute("NORMAL", VertexBuffer.NormalKind);
            loadAttribute("TANGENT", VertexBuffer.TangentKind);
            loadAttribute("TEXCOORD_0", VertexBuffer.UVKind);
            loadAttribute("TEXCOORD_1", VertexBuffer.UV2Kind);
            loadAttribute("TEXCOORD_2", VertexBuffer.UV3Kind);
            loadAttribute("TEXCOORD_3", VertexBuffer.UV4Kind);
            loadAttribute("TEXCOORD_4", VertexBuffer.UV5Kind);
            loadAttribute("TEXCOORD_5", VertexBuffer.UV6Kind);
            loadAttribute("JOINTS_0", VertexBuffer.MatricesIndicesKind);
            loadAttribute("WEIGHTS_0", VertexBuffer.MatricesWeightsKind);
            loadAttribute("COLOR_0", VertexBuffer.ColorKind);
            var bufferView = ArrayItem.Get(extensionContext, _this._loader.gltf.bufferViews, extension.bufferView);
            if (!bufferView._dracoBabylonGeometry) {
                bufferView._dracoBabylonGeometry = _this._loader.loadBufferViewAsync("/bufferViews/".concat(bufferView.index), bufferView).then(function (data) {
                    var dracoCompression = _this.dracoCompression || DracoCompression.Default;
                    return dracoCompression
                        .decodeMeshAsync(data, attributes, dividers)
                        .then(function (babylonVertexData) {
                        var babylonGeometry = new Geometry(babylonMesh.name, _this._loader.babylonScene);
                        babylonVertexData.applyToGeometry(babylonGeometry);
                        return babylonGeometry;
                    })
                        .catch(function (error) {
                        throw new Error("".concat(context, ": ").concat(error.message));
                    });
                });
            }
            return bufferView._dracoBabylonGeometry;
        });
    };
    return KHR_draco_mesh_compression;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_draco_mesh_compression', { enumerable: true, configurable: true, get: function() { return KHR_draco_mesh_compression; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_draco_mesh_compression(loader); });
//# sourceMappingURL=KHR_draco_mesh_compression.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224761, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector3 = __TEMP__['Vector3'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Lights/directionalLight.js');var DirectionalLight = __TEMP__['DirectionalLight'];
var __TEMP__ = require('@babylonjs/core/Lights/pointLight.js');var PointLight = __TEMP__['PointLight'];
var __TEMP__ = require('@babylonjs/core/Lights/spotLight.js');var SpotLight = __TEMP__['SpotLight'];
var __TEMP__ = require('@babylonjs/core/Lights/light.js');var Light = __TEMP__['Light'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "KHR_lights_punctual";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual)
 */
var KHR_lights = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_lights(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_lights.prototype.dispose = function () {
        this._loader = null;
        delete this._lights;
    };
    /** @hidden */
    KHR_lights.prototype.onLoading = function () {
        var extensions = this._loader.gltf.extensions;
        if (extensions && extensions[this.name]) {
            var extension = extensions[this.name];
            this._lights = extension.lights;
        }
    };
    /**
     * @param context
     * @param node
     * @param assign
     * @hidden
     */
    KHR_lights.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, node, this.name, function (extensionContext, extension) {
            return _this._loader.loadNodeAsync(context, node, function (babylonMesh) {
                var babylonLight;
                var light = ArrayItem.Get(extensionContext, _this._lights, extension.light);
                var name = light.name || babylonMesh.name;
                _this._loader.babylonScene._blockEntityCollection = !!_this._loader._assetContainer;
                switch (light.type) {
                    case "directional" /* DIRECTIONAL */: {
                        babylonLight = new DirectionalLight(name, Vector3.Backward(), _this._loader.babylonScene);
                        break;
                    }
                    case "point" /* POINT */: {
                        babylonLight = new PointLight(name, Vector3.Zero(), _this._loader.babylonScene);
                        break;
                    }
                    case "spot" /* SPOT */: {
                        var babylonSpotLight = new SpotLight(name, Vector3.Zero(), Vector3.Backward(), 0, 1, _this._loader.babylonScene);
                        babylonSpotLight.angle = ((light.spot && light.spot.outerConeAngle) || Math.PI / 4) * 2;
                        babylonSpotLight.innerAngle = ((light.spot && light.spot.innerConeAngle) || 0) * 2;
                        babylonLight = babylonSpotLight;
                        break;
                    }
                    default: {
                        _this._loader.babylonScene._blockEntityCollection = false;
                        throw new Error("".concat(extensionContext, ": Invalid light type (").concat(light.type, ")"));
                    }
                }
                babylonLight._parentContainer = _this._loader._assetContainer;
                _this._loader.babylonScene._blockEntityCollection = false;
                babylonLight.falloffType = Light.FALLOFF_GLTF;
                babylonLight.diffuse = light.color ? Color3.FromArray(light.color) : Color3.White();
                babylonLight.intensity = light.intensity == undefined ? 1 : light.intensity;
                babylonLight.range = light.range == undefined ? Number.MAX_VALUE : light.range;
                babylonLight.parent = babylonMesh;
                _this._loader._babylonLights.push(babylonLight);
                GLTFLoader.AddPointerMetadata(babylonLight, extensionContext);
                assign(babylonMesh);
            });
        });
    };
    return KHR_lights;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_lights', { enumerable: true, configurable: true, get: function() { return KHR_lights; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_lights(loader); });
//# sourceMappingURL=KHR_lights_punctual.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224762, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_pbrSpecularGlossiness";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness)
 */
var KHR_materials_pbrSpecularGlossiness = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_pbrSpecularGlossiness(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 200;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_pbrSpecularGlossiness.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_pbrSpecularGlossiness.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadSpecularGlossinessPropertiesAsync(extensionContext, material, extension, babylonMaterial));
            _this._loader.loadMaterialAlphaProperties(context, material, babylonMaterial);
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_pbrSpecularGlossiness.prototype._loadSpecularGlossinessPropertiesAsync = function (context, material, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.metallic = null;
        babylonMaterial.roughness = null;
        if (properties.diffuseFactor) {
            babylonMaterial.albedoColor = Color3.FromArray(properties.diffuseFactor);
            babylonMaterial.alpha = properties.diffuseFactor[3];
        }
        else {
            babylonMaterial.albedoColor = Color3.White();
        }
        babylonMaterial.reflectivityColor = properties.specularFactor ? Color3.FromArray(properties.specularFactor) : Color3.White();
        babylonMaterial.microSurface = properties.glossinessFactor == undefined ? 1 : properties.glossinessFactor;
        if (properties.diffuseTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/diffuseTexture"), properties.diffuseTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Diffuse)");
                babylonMaterial.albedoTexture = texture;
            }));
        }
        if (properties.specularGlossinessTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/specularGlossinessTexture"), properties.specularGlossinessTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Specular Glossiness)");
                babylonMaterial.reflectivityTexture = texture;
                babylonMaterial.reflectivityTexture.hasAlpha = true;
            }));
            babylonMaterial.useMicroSurfaceFromReflectivityMapAlpha = true;
        }
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_pbrSpecularGlossiness;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_pbrSpecularGlossiness', { enumerable: true, configurable: true, get: function() { return KHR_materials_pbrSpecularGlossiness; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_pbrSpecularGlossiness(loader); });
//# sourceMappingURL=KHR_materials_pbrSpecularGlossiness.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224763, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_unlit";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit)
 */
var KHR_materials_unlit = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_unlit(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 210;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_unlit.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_unlit.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function () {
            return _this._loadUnlitPropertiesAsync(context, material, babylonMaterial);
        });
    };
    KHR_materials_unlit.prototype._loadUnlitPropertiesAsync = function (context, material, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.unlit = true;
        var properties = material.pbrMetallicRoughness;
        if (properties) {
            if (properties.baseColorFactor) {
                babylonMaterial.albedoColor = Color3.FromArray(properties.baseColorFactor);
                babylonMaterial.alpha = properties.baseColorFactor[3];
            }
            else {
                babylonMaterial.albedoColor = Color3.White();
            }
            if (properties.baseColorTexture) {
                promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/baseColorTexture"), properties.baseColorTexture, function (texture) {
                    texture.name = "".concat(babylonMaterial.name, " (Base Color)");
                    babylonMaterial.albedoTexture = texture;
                }));
            }
        }
        if (material.doubleSided) {
            babylonMaterial.backFaceCulling = false;
            babylonMaterial.twoSidedLighting = true;
        }
        this._loader.loadMaterialAlphaProperties(context, material, babylonMaterial);
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_unlit;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_unlit', { enumerable: true, configurable: true, get: function() { return KHR_materials_unlit; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_unlit(loader); });
//# sourceMappingURL=KHR_materials_unlit.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224764, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_clearcoat";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)
 * [Playground Sample](https://www.babylonjs-playground.com/frame.html#7F7PN6#8)
 */
var KHR_materials_clearcoat = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_clearcoat(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 190;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_clearcoat.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_clearcoat.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadClearCoatPropertiesAsync(extensionContext, extension, babylonMaterial));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_clearcoat.prototype._loadClearCoatPropertiesAsync = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.clearCoat.isEnabled = true;
        babylonMaterial.clearCoat.useRoughnessFromMainTexture = false;
        babylonMaterial.clearCoat.remapF0OnInterfaceChange = false;
        if (properties.clearcoatFactor != undefined) {
            babylonMaterial.clearCoat.intensity = properties.clearcoatFactor;
        }
        else {
            babylonMaterial.clearCoat.intensity = 0;
        }
        if (properties.clearcoatTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/clearcoatTexture"), properties.clearcoatTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (ClearCoat Intensity)");
                babylonMaterial.clearCoat.texture = texture;
            }));
        }
        if (properties.clearcoatRoughnessFactor != undefined) {
            babylonMaterial.clearCoat.roughness = properties.clearcoatRoughnessFactor;
        }
        else {
            babylonMaterial.clearCoat.roughness = 0;
        }
        if (properties.clearcoatRoughnessTexture) {
            properties.clearcoatRoughnessTexture.nonColorData = true;
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/clearcoatRoughnessTexture"), properties.clearcoatRoughnessTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (ClearCoat Roughness)");
                babylonMaterial.clearCoat.textureRoughness = texture;
            }));
        }
        if (properties.clearcoatNormalTexture) {
            properties.clearcoatNormalTexture.nonColorData = true;
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/clearcoatNormalTexture"), properties.clearcoatNormalTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (ClearCoat Normal)");
                babylonMaterial.clearCoat.bumpTexture = texture;
            }));
            babylonMaterial.invertNormalMapX = !babylonMaterial.getScene().useRightHandedSystem;
            babylonMaterial.invertNormalMapY = babylonMaterial.getScene().useRightHandedSystem;
            if (properties.clearcoatNormalTexture.scale != undefined) {
                babylonMaterial.clearCoat.bumpTexture.level = properties.clearcoatNormalTexture.scale;
            }
        }
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_clearcoat;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_clearcoat', { enumerable: true, configurable: true, get: function() { return KHR_materials_clearcoat; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_clearcoat(loader); });
//# sourceMappingURL=KHR_materials_clearcoat.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224765, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_iridescence";
/**
 * [Experimental Spec](https://github.com/KhronosGroup/glTF/pull/2027)
 */
var KHR_materials_iridescence = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_iridescence(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 195;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_iridescence.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_iridescence.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadIridescencePropertiesAsync(extensionContext, extension, babylonMaterial));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_iridescence.prototype._loadIridescencePropertiesAsync = function (context, properties, babylonMaterial) {
        var _a, _b, _c, _d, _e;
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.iridescence.isEnabled = true;
        babylonMaterial.iridescence.intensity = (_a = properties.iridescenceFactor) !== null && _a !== void 0 ? _a : 0;
        babylonMaterial.iridescence.indexOfRefraction = (_c = (_b = properties.iridescenceIor) !== null && _b !== void 0 ? _b : properties.iridescenceIOR) !== null && _c !== void 0 ? _c : 1.3;
        babylonMaterial.iridescence.minimumThickness = (_d = properties.iridescenceThicknessMinimum) !== null && _d !== void 0 ? _d : 100;
        babylonMaterial.iridescence.maximumThickness = (_e = properties.iridescenceThicknessMaximum) !== null && _e !== void 0 ? _e : 400;
        if (properties.iridescenceTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/iridescenceTexture"), properties.iridescenceTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Iridescence Intensity)");
                babylonMaterial.iridescence.texture = texture;
            }));
        }
        if (properties.iridescenceThicknessTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/iridescenceThicknessTexture"), properties.iridescenceThicknessTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Iridescence Thickness)");
                babylonMaterial.iridescence.thicknessTexture = texture;
            }));
        }
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_iridescence;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_iridescence', { enumerable: true, configurable: true, get: function() { return KHR_materials_iridescence; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_iridescence(loader); });
//# sourceMappingURL=KHR_materials_iridescence.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224766, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_emissive_strength";
/**
 * [Experimental Spec](https://github.com/KhronosGroup/glTF/pull/1994)
 */
var KHR_materials_emissive_strength = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_emissive_strength(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 170;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_emissive_strength.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_emissive_strength.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            return _this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial).then(function () {
                _this._loadEmissiveProperties(extensionContext, extension, babylonMaterial);
            });
        });
    };
    KHR_materials_emissive_strength.prototype._loadEmissiveProperties = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        if (properties.emissiveStrength !== undefined) {
            babylonMaterial.emissiveColor.scaleToRef(properties.emissiveStrength, babylonMaterial.emissiveColor);
        }
    };
    return KHR_materials_emissive_strength;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_emissive_strength', { enumerable: true, configurable: true, get: function() { return KHR_materials_emissive_strength; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_emissive_strength(loader); });
//# sourceMappingURL=KHR_materials_emissive_strength.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224767, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var NAME = "KHR_materials_sheen";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_sheen/README.md)
 * [Playground Sample](https://www.babylonjs-playground.com/frame.html#BNIZX6#4)
 */
var KHR_materials_sheen = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_sheen(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 190;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_sheen.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_sheen.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadSheenPropertiesAsync(extensionContext, extension, babylonMaterial));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_sheen.prototype._loadSheenPropertiesAsync = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        babylonMaterial.sheen.isEnabled = true;
        babylonMaterial.sheen.intensity = 1;
        if (properties.sheenColorFactor != undefined) {
            babylonMaterial.sheen.color = Color3.FromArray(properties.sheenColorFactor);
        }
        else {
            babylonMaterial.sheen.color = Color3.Black();
        }
        if (properties.sheenColorTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/sheenColorTexture"), properties.sheenColorTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Sheen Color)");
                babylonMaterial.sheen.texture = texture;
            }));
        }
        if (properties.sheenRoughnessFactor !== undefined) {
            babylonMaterial.sheen.roughness = properties.sheenRoughnessFactor;
        }
        else {
            babylonMaterial.sheen.roughness = 0;
        }
        if (properties.sheenRoughnessTexture) {
            properties.sheenRoughnessTexture.nonColorData = true;
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/sheenRoughnessTexture"), properties.sheenRoughnessTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Sheen Roughness)");
                babylonMaterial.sheen.textureRoughness = texture;
            }));
        }
        babylonMaterial.sheen.albedoScaling = true;
        babylonMaterial.sheen.useRoughnessFromMainTexture = false;
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_sheen;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_sheen', { enumerable: true, configurable: true, get: function() { return KHR_materials_sheen; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_sheen(loader); });
//# sourceMappingURL=KHR_materials_sheen.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224768, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var NAME = "KHR_materials_specular";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular)
 */
var KHR_materials_specular = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_specular(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 190;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_specular.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_specular.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadSpecularPropertiesAsync(extensionContext, extension, babylonMaterial));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_specular.prototype._loadSpecularPropertiesAsync = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var promises = new Array();
        if (properties.specularFactor !== undefined) {
            babylonMaterial.metallicF0Factor = properties.specularFactor;
        }
        if (properties.specularColorFactor !== undefined) {
            babylonMaterial.metallicReflectanceColor = Color3.FromArray(properties.specularColorFactor);
        }
        if (properties.specularTexture) {
            properties.specularTexture.nonColorData = true;
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/specularTexture"), properties.specularTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Specular F0 Strength)");
                babylonMaterial.metallicReflectanceTexture = texture;
                babylonMaterial.useOnlyMetallicFromMetallicReflectanceTexture = true;
            }));
        }
        if (properties.specularColorTexture) {
            promises.push(this._loader.loadTextureInfoAsync("".concat(context, "/specularColorTexture"), properties.specularColorTexture, function (texture) {
                texture.name = "".concat(babylonMaterial.name, " (Specular F0 Color)");
                babylonMaterial.reflectanceTexture = texture;
            }));
        }
        return Promise.all(promises).then(function () { });
    };
    return KHR_materials_specular;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_specular', { enumerable: true, configurable: true, get: function() { return KHR_materials_specular; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_specular(loader); });
//# sourceMappingURL=KHR_materials_specular.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224769, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_ior";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior)
 */
var KHR_materials_ior = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_ior(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 180;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_ior.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_ior.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadIorPropertiesAsync(extensionContext, extension, babylonMaterial));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_ior.prototype._loadIorPropertiesAsync = function (context, properties, babylonMaterial) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        if (properties.ior !== undefined) {
            babylonMaterial.indexOfRefraction = properties.ior;
        }
        else {
            babylonMaterial.indexOfRefraction = KHR_materials_ior._DEFAULT_IOR;
        }
        return Promise.resolve();
    };
    /**
     * Default ior Value from the spec.
     */
    KHR_materials_ior._DEFAULT_IOR = 1.5;
    return KHR_materials_ior;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_ior', { enumerable: true, configurable: true, get: function() { return KHR_materials_ior; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_ior(loader); });
//# sourceMappingURL=KHR_materials_ior.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224770, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.js');var Mesh = __TEMP__['Mesh'];
var NAME = "KHR_materials_variants";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_variants/README.md)
 */
var KHR_materials_variants = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_variants(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_materials_variants.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * Gets the list of available variant names for this asset.
     * @param rootMesh The glTF root mesh
     * @returns the list of all the variant names for this model
     */
    KHR_materials_variants.GetAvailableVariants = function (rootMesh) {
        var extensionMetadata = this._GetExtensionMetadata(rootMesh);
        if (!extensionMetadata) {
            return [];
        }
        return Object.keys(extensionMetadata.variants);
    };
    /**
     * Gets the list of available variant names for this asset.
     * @param rootMesh The glTF root mesh
     * @returns the list of all the variant names for this model
     */
    KHR_materials_variants.prototype.getAvailableVariants = function (rootMesh) {
        return KHR_materials_variants.GetAvailableVariants(rootMesh);
    };
    /**
     * Select a variant given a variant name or a list of variant names.
     * @param rootMesh The glTF root mesh
     * @param variantName The variant name(s) to select.
     */
    KHR_materials_variants.SelectVariant = function (rootMesh, variantName) {
        var extensionMetadata = this._GetExtensionMetadata(rootMesh);
        if (!extensionMetadata) {
            throw new Error("Cannot select variant on a glTF mesh that does not have the ".concat(NAME, " extension"));
        }
        var select = function (variantName) {
            var entries = extensionMetadata.variants[variantName];
            if (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    entry.mesh.material = entry.material;
                }
            }
        };
        if (variantName instanceof Array) {
            for (var _i = 0, variantName_1 = variantName; _i < variantName_1.length; _i++) {
                var name_1 = variantName_1[_i];
                select(name_1);
            }
        }
        else {
            select(variantName);
        }
        extensionMetadata.lastSelected = variantName;
    };
    /**
     * Select a variant given a variant name or a list of variant names.
     * @param rootMesh The glTF root mesh
     * @param variantName The variant name(s) to select.
     */
    KHR_materials_variants.prototype.selectVariant = function (rootMesh, variantName) {
        return KHR_materials_variants.SelectVariant(rootMesh, variantName);
    };
    /**
     * Reset back to the original before selecting a variant.
     * @param rootMesh The glTF root mesh
     */
    KHR_materials_variants.Reset = function (rootMesh) {
        var extensionMetadata = this._GetExtensionMetadata(rootMesh);
        if (!extensionMetadata) {
            throw new Error("Cannot reset on a glTF mesh that does not have the ".concat(NAME, " extension"));
        }
        for (var _i = 0, _a = extensionMetadata.original; _i < _a.length; _i++) {
            var entry = _a[_i];
            entry.mesh.material = entry.material;
        }
        extensionMetadata.lastSelected = null;
    };
    /**
     * Reset back to the original before selecting a variant.
     * @param rootMesh The glTF root mesh
     */
    KHR_materials_variants.prototype.reset = function (rootMesh) {
        return KHR_materials_variants.Reset(rootMesh);
    };
    /**
     * Gets the last selected variant name(s) or null if original.
     * @param rootMesh The glTF root mesh
     * @returns The selected variant name(s).
     */
    KHR_materials_variants.GetLastSelectedVariant = function (rootMesh) {
        var extensionMetadata = this._GetExtensionMetadata(rootMesh);
        if (!extensionMetadata) {
            throw new Error("Cannot get the last selected variant on a glTF mesh that does not have the ".concat(NAME, " extension"));
        }
        return extensionMetadata.lastSelected;
    };
    /**
     * Gets the last selected variant name(s) or null if original.
     * @param rootMesh The glTF root mesh
     * @returns The selected variant name(s).
     */
    KHR_materials_variants.prototype.getLastSelectedVariant = function (rootMesh) {
        return KHR_materials_variants.GetLastSelectedVariant(rootMesh);
    };
    KHR_materials_variants._GetExtensionMetadata = function (rootMesh) {
        var _a, _b;
        return ((_b = (_a = rootMesh === null || rootMesh === void 0 ? void 0 : rootMesh.metadata) === null || _a === void 0 ? void 0 : _a.gltf) === null || _b === void 0 ? void 0 : _b[NAME]) || null;
    };
    /** @hidden */
    KHR_materials_variants.prototype.onLoading = function () {
        var extensions = this._loader.gltf.extensions;
        if (extensions && extensions[this.name]) {
            var extension = extensions[this.name];
            this._variants = extension.variants;
        }
    };
    /**
     * @param context
     * @param name
     * @param node
     * @param mesh
     * @param primitive
     * @param assign
     * @hidden
     */
    KHR_materials_variants.prototype._loadMeshPrimitiveAsync = function (context, name, node, mesh, primitive, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, primitive, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader._loadMeshPrimitiveAsync(context, name, node, mesh, primitive, function (babylonMesh) {
                assign(babylonMesh);
                if (babylonMesh instanceof Mesh) {
                    var babylonDrawMode = GLTFLoader._GetDrawMode(context, primitive.mode);
                    var root_1 = _this._loader.rootBabylonMesh;
                    var metadata = root_1 ? (root_1.metadata = root_1.metadata || {}) : {};
                    var gltf = (metadata.gltf = metadata.gltf || {});
                    var extensionMetadata_1 = (gltf[NAME] = gltf[NAME] || { lastSelected: null, original: [], variants: {} });
                    // Store the original material.
                    extensionMetadata_1.original.push({ mesh: babylonMesh, material: babylonMesh.material });
                    var _loop_1 = function (mappingIndex) {
                        var mapping = extension.mappings[mappingIndex];
                        var material = ArrayItem.Get("".concat(extensionContext, "/mappings/").concat(mappingIndex, "/material"), _this._loader.gltf.materials, mapping.material);
                        promises.push(_this._loader._loadMaterialAsync("#/materials/".concat(mapping.material), material, babylonMesh, babylonDrawMode, function (babylonMaterial) {
                            var _loop_2 = function (mappingVariantIndex) {
                                var variantIndex = mapping.variants[mappingVariantIndex];
                                var variant = ArrayItem.Get("/extensions/".concat(NAME, "/variants/").concat(variantIndex), _this._variants, variantIndex);
                                extensionMetadata_1.variants[variant.name] = extensionMetadata_1.variants[variant.name] || [];
                                extensionMetadata_1.variants[variant.name].push({
                                    mesh: babylonMesh,
                                    material: babylonMaterial,
                                });
                                // Replace the target when original mesh is cloned
                                babylonMesh.onClonedObservable.add(function (newOne) {
                                    var newMesh = newOne;
                                    var metadata = null;
                                    var newRoot = newMesh;
                                    // Find root to get medata
                                    do {
                                        newRoot = newRoot.parent;
                                        if (!newRoot) {
                                            return;
                                        }
                                        metadata = KHR_materials_variants._GetExtensionMetadata(newRoot);
                                    } while (metadata === null);
                                    // Need to clone the metadata on the root (first time only)
                                    if (root_1 && metadata === KHR_materials_variants._GetExtensionMetadata(root_1)) {
                                        // Copy main metadata
                                        newRoot.metadata = {};
                                        for (var key in root_1.metadata) {
                                            newRoot.metadata[key] = root_1.metadata[key];
                                        }
                                        // Copy the gltf metadata
                                        newRoot.metadata.gltf = [];
                                        for (var key in root_1.metadata.gltf) {
                                            newRoot.metadata.gltf[key] = root_1.metadata.gltf[key];
                                        }
                                        // Duplicate the extension specific metadata
                                        newRoot.metadata.gltf[NAME] = { lastSelected: null, original: [], variants: {} };
                                        for (var _i = 0, _a = metadata.original; _i < _a.length; _i++) {
                                            var original = _a[_i];
                                            newRoot.metadata.gltf[NAME].original.push({
                                                mesh: original.mesh,
                                                material: original.material,
                                            });
                                        }
                                        for (var key in metadata.variants) {
                                            if (Object.prototype.hasOwnProperty.call(metadata.variants, key)) {
                                                newRoot.metadata.gltf[NAME].variants[key] = [];
                                                for (var _b = 0, _c = metadata.variants[key]; _b < _c.length; _b++) {
                                                    var variantEntry = _c[_b];
                                                    newRoot.metadata.gltf[NAME].variants[key].push({
                                                        mesh: variantEntry.mesh,
                                                        material: variantEntry.material,
                                                    });
                                                }
                                            }
                                        }
                                        metadata = newRoot.metadata.gltf[NAME];
                                    }
                                    // Relocate
                                    for (var _d = 0, _e = metadata.original; _d < _e.length; _d++) {
                                        var target = _e[_d];
                                        if (target.mesh === babylonMesh) {
                                            target.mesh = newMesh;
                                        }
                                    }
                                    for (var _f = 0, _g = metadata.variants[variant.name]; _f < _g.length; _f++) {
                                        var target = _g[_f];
                                        if (target.mesh === babylonMesh) {
                                            target.mesh = newMesh;
                                        }
                                    }
                                });
                            };
                            for (var mappingVariantIndex = 0; mappingVariantIndex < mapping.variants.length; ++mappingVariantIndex) {
                                _loop_2(mappingVariantIndex);
                            }
                        }));
                    };
                    // For each mapping, look at the variants and make a new entry for them.
                    for (var mappingIndex = 0; mappingIndex < extension.mappings.length; ++mappingIndex) {
                        _loop_1(mappingIndex);
                    }
                }
            }));
            return Promise.all(promises).then(function (_a) {
                var babylonMesh = _a[0];
                return babylonMesh;
            });
        });
    };
    return KHR_materials_variants;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_variants', { enumerable: true, configurable: true, get: function() { return KHR_materials_variants; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_variants(loader); });
//# sourceMappingURL=KHR_materials_variants.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224771, function(require, module, exports) {
var __TEMP__ = require('tslib');var __assign = __TEMP__['__assign'];
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/renderTargetTexture.js');var RenderTargetTexture = __TEMP__['RenderTargetTexture'];
var __TEMP__ = require('@babylonjs/core/Misc/observable.js');var Observable = __TEMP__['Observable'];
var __TEMP__ = require('@babylonjs/core/Engines/constants.js');var Constants = __TEMP__['Constants'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
/**
 * A class to handle setting up the rendering of opaque objects to be shown through transmissive objects.
 */
var TransmissionHelper = /** @class */ (function () {
    /**
     * constructor
     * @param options Defines the options we want to customize the helper
     * @param scene The scene to add the material to
     */
    function TransmissionHelper(options, scene) {
        var _this = this;
        this._opaqueRenderTarget = null;
        this._opaqueMeshesCache = [];
        this._transparentMeshesCache = [];
        this._materialObservers = {};
        this._options = __assign(__assign({}, TransmissionHelper._GetDefaultOptions()), options);
        this._scene = scene;
        this._scene._transmissionHelper = this;
        this.onErrorObservable = new Observable();
        this._scene.onDisposeObservable.addOnce(function () {
            _this.dispose();
        });
        this._parseScene();
        this._setupRenderTargets();
    }
    /**
     * Creates the default options for the helper.
     */
    TransmissionHelper._GetDefaultOptions = function () {
        return {
            renderSize: 1024,
            samples: 4,
            lodGenerationScale: 1,
            lodGenerationOffset: -4,
            renderTargetTextureType: Constants.TEXTURETYPE_HALF_FLOAT,
            generateMipmaps: true,
        };
    };
    /**
     * Updates the background according to the new options
     * @param options
     */
    TransmissionHelper.prototype.updateOptions = function (options) {
        var _this = this;
        // First check if any options are actually being changed. If not, exit.
        var newValues = Object.keys(options).filter(function (key) { return _this._options[key] !== options[key]; });
        if (!newValues.length) {
            return;
        }
        var newOptions = __assign(__assign({}, this._options), options);
        var oldOptions = this._options;
        this._options = newOptions;
        // If size changes, recreate everything
        if (newOptions.renderSize !== oldOptions.renderSize ||
            newOptions.renderTargetTextureType !== oldOptions.renderTargetTextureType ||
            newOptions.generateMipmaps !== oldOptions.generateMipmaps ||
            !this._opaqueRenderTarget) {
            this._setupRenderTargets();
        }
        else {
            this._opaqueRenderTarget.samples = newOptions.samples;
            this._opaqueRenderTarget.lodGenerationScale = newOptions.lodGenerationScale;
            this._opaqueRenderTarget.lodGenerationOffset = newOptions.lodGenerationOffset;
        }
    };
    TransmissionHelper.prototype.getOpaqueTarget = function () {
        return this._opaqueRenderTarget;
    };
    TransmissionHelper.prototype._shouldRenderAsTransmission = function (material) {
        if (!material) {
            return false;
        }
        if (material instanceof PBRMaterial && material.subSurface.isRefractionEnabled) {
            return true;
        }
        return false;
    };
    TransmissionHelper.prototype._addMesh = function (mesh) {
        var _this = this;
        this._materialObservers[mesh.uniqueId] = mesh.onMaterialChangedObservable.add(this._onMeshMaterialChanged.bind(this));
        // we need to defer the processing because _addMesh may be called as part as an instance mesh creation, in which case some
        // internal properties are not setup yet, like _sourceMesh (needed when doing mesh.material below)
        Tools.SetImmediate(function () {
            if (_this._shouldRenderAsTransmission(mesh.material)) {
                mesh.material.refractionTexture = _this._opaqueRenderTarget;
                _this._transparentMeshesCache.push(mesh);
            }
            else {
                _this._opaqueMeshesCache.push(mesh);
            }
        });
    };
    TransmissionHelper.prototype._removeMesh = function (mesh) {
        mesh.onMaterialChangedObservable.remove(this._materialObservers[mesh.uniqueId]);
        delete this._materialObservers[mesh.uniqueId];
        var idx = this._transparentMeshesCache.indexOf(mesh);
        if (idx !== -1) {
            this._transparentMeshesCache.splice(idx, 1);
        }
        idx = this._opaqueMeshesCache.indexOf(mesh);
        if (idx !== -1) {
            this._opaqueMeshesCache.splice(idx, 1);
        }
    };
    TransmissionHelper.prototype._parseScene = function () {
        this._scene.meshes.forEach(this._addMesh.bind(this));
        // Listen for when a mesh is added to the scene and add it to our cache lists.
        this._scene.onNewMeshAddedObservable.add(this._addMesh.bind(this));
        // Listen for when a mesh is removed from to the scene and remove it from our cache lists.
        this._scene.onMeshRemovedObservable.add(this._removeMesh.bind(this));
    };
    // When one of the meshes in the scene has its material changed, make sure that it's in the correct cache list.
    TransmissionHelper.prototype._onMeshMaterialChanged = function (mesh) {
        var transparentIdx = this._transparentMeshesCache.indexOf(mesh);
        var opaqueIdx = this._opaqueMeshesCache.indexOf(mesh);
        // If the material is transparent, make sure that it's added to the transparent list and removed from the opaque list
        var useTransmission = this._shouldRenderAsTransmission(mesh.material);
        if (useTransmission) {
            if (mesh.material instanceof PBRMaterial) {
                mesh.material.subSurface.refractionTexture = this._opaqueRenderTarget;
            }
            if (opaqueIdx !== -1) {
                this._opaqueMeshesCache.splice(opaqueIdx, 1);
                this._transparentMeshesCache.push(mesh);
            }
            else if (transparentIdx === -1) {
                this._transparentMeshesCache.push(mesh);
            }
            // If the material is opaque, make sure that it's added to the opaque list and removed from the transparent list
        }
        else {
            if (transparentIdx !== -1) {
                this._transparentMeshesCache.splice(transparentIdx, 1);
                this._opaqueMeshesCache.push(mesh);
            }
            else if (opaqueIdx === -1) {
                this._opaqueMeshesCache.push(mesh);
            }
        }
    };
    /**
     * Setup the render targets according to the specified options.
     */
    TransmissionHelper.prototype._setupRenderTargets = function () {
        var _this = this;
        var _a, _b;
        if (this._opaqueRenderTarget) {
            this._opaqueRenderTarget.dispose();
        }
        this._opaqueRenderTarget = new RenderTargetTexture("opaqueSceneTexture", this._options.renderSize, this._scene, this._options.generateMipmaps, undefined, this._options.renderTargetTextureType);
        this._opaqueRenderTarget.ignoreCameraViewport = true;
        this._opaqueRenderTarget.renderList = this._opaqueMeshesCache;
        this._opaqueRenderTarget.clearColor = (_b = (_a = this._options.clearColor) === null || _a === void 0 ? void 0 : _a.clone()) !== null && _b !== void 0 ? _b : this._scene.clearColor.clone();
        this._opaqueRenderTarget.gammaSpace = false;
        this._opaqueRenderTarget.lodGenerationScale = this._options.lodGenerationScale;
        this._opaqueRenderTarget.lodGenerationOffset = this._options.lodGenerationOffset;
        this._opaqueRenderTarget.samples = this._options.samples;
        var sceneImageProcessingapplyByPostProcess;
        var saveSceneEnvIntensity;
        this._opaqueRenderTarget.onBeforeBindObservable.add(function (opaqueRenderTarget) {
            saveSceneEnvIntensity = _this._scene.environmentIntensity;
            _this._scene.environmentIntensity = 1.0;
            sceneImageProcessingapplyByPostProcess = _this._scene.imageProcessingConfiguration.applyByPostProcess;
            if (!_this._options.clearColor) {
                _this._scene.clearColor.toLinearSpaceToRef(opaqueRenderTarget.clearColor);
            }
            else {
                opaqueRenderTarget.clearColor.copyFrom(_this._options.clearColor);
            }
            // we do not use the applyByPostProcess setter to avoid flagging all the materials as "image processing dirty"!
            _this._scene.imageProcessingConfiguration._applyByPostProcess = true;
        });
        this._opaqueRenderTarget.onAfterUnbindObservable.add(function () {
            _this._scene.environmentIntensity = saveSceneEnvIntensity;
            _this._scene.imageProcessingConfiguration._applyByPostProcess = sceneImageProcessingapplyByPostProcess;
        });
        this._transparentMeshesCache.forEach(function (mesh) {
            if (_this._shouldRenderAsTransmission(mesh.material)) {
                mesh.material.refractionTexture = _this._opaqueRenderTarget;
            }
        });
    };
    /**
     * Dispose all the elements created by the Helper.
     */
    TransmissionHelper.prototype.dispose = function () {
        this._scene._transmissionHelper = undefined;
        if (this._opaqueRenderTarget) {
            this._opaqueRenderTarget.dispose();
            this._opaqueRenderTarget = null;
        }
        this._transparentMeshesCache = [];
        this._opaqueMeshesCache = [];
    };
    return TransmissionHelper;
}());
var NAME = "KHR_materials_transmission";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var KHR_materials_transmission = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_transmission(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 175;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
        if (this.enabled) {
            loader.parent.transparencyAsCoverage = true;
        }
    }
    /** @hidden */
    KHR_materials_transmission.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_transmission.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadTransparentPropertiesAsync(extensionContext, material, babylonMaterial, extension));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_transmission.prototype._loadTransparentPropertiesAsync = function (context, material, babylonMaterial, extension) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var pbrMaterial = babylonMaterial;
        // Enables "refraction" texture which represents transmitted light.
        pbrMaterial.subSurface.isRefractionEnabled = true;
        // Since this extension models thin-surface transmission only, we must make IOR = 1.0
        pbrMaterial.subSurface.volumeIndexOfRefraction = 1.0;
        // Albedo colour will tint transmission.
        pbrMaterial.subSurface.useAlbedoToTintRefraction = true;
        if (extension.transmissionFactor !== undefined) {
            pbrMaterial.subSurface.refractionIntensity = extension.transmissionFactor;
            var scene = pbrMaterial.getScene();
            if (pbrMaterial.subSurface.refractionIntensity && !scene._transmissionHelper) {
                new TransmissionHelper({}, pbrMaterial.getScene());
            }
        }
        else {
            pbrMaterial.subSurface.refractionIntensity = 0.0;
            pbrMaterial.subSurface.isRefractionEnabled = false;
            return Promise.resolve();
        }
        pbrMaterial.subSurface.minimumThickness = 0.0;
        pbrMaterial.subSurface.maximumThickness = 0.0;
        if (extension.transmissionTexture) {
            extension.transmissionTexture.nonColorData = true;
            return this._loader.loadTextureInfoAsync("".concat(context, "/transmissionTexture"), extension.transmissionTexture, undefined).then(function (texture) {
                pbrMaterial.subSurface.refractionIntensityTexture = texture;
                pbrMaterial.subSurface.useGltfStyleTextures = true;
            });
        }
        else {
            return Promise.resolve();
        }
    };
    return KHR_materials_transmission;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_transmission', { enumerable: true, configurable: true, get: function() { return KHR_materials_transmission; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_transmission(loader); });
//# sourceMappingURL=KHR_materials_transmission.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224772, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_translucency";
/**
 * [Proposed Specification](https://github.com/KhronosGroup/glTF/pull/1825)
 * !!! Experimental Extension Subject to Changes !!!
 */
var KHR_materials_translucency = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_translucency(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 174;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
        if (this.enabled) {
            loader.parent.transparencyAsCoverage = true;
        }
    }
    /** @hidden */
    KHR_materials_translucency.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_translucency.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadTranslucentPropertiesAsync(extensionContext, material, babylonMaterial, extension));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_translucency.prototype._loadTranslucentPropertiesAsync = function (context, material, babylonMaterial, extension) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        var pbrMaterial = babylonMaterial;
        // Enables "translucency" texture which represents diffusely-transmitted light.
        pbrMaterial.subSurface.isTranslucencyEnabled = true;
        // Since this extension models thin-surface transmission only, we must make the
        // internal IOR == 1.0 and set the thickness to 0.
        pbrMaterial.subSurface.volumeIndexOfRefraction = 1.0;
        pbrMaterial.subSurface.minimumThickness = 0.0;
        pbrMaterial.subSurface.maximumThickness = 0.0;
        // Albedo colour will tint transmission.
        pbrMaterial.subSurface.useAlbedoToTintTranslucency = true;
        if (extension.translucencyFactor !== undefined) {
            pbrMaterial.subSurface.translucencyIntensity = extension.translucencyFactor;
        }
        else {
            pbrMaterial.subSurface.translucencyIntensity = 0.0;
            pbrMaterial.subSurface.isTranslucencyEnabled = false;
            return Promise.resolve();
        }
        if (extension.translucencyTexture) {
            extension.translucencyTexture.nonColorData = true;
            return this._loader.loadTextureInfoAsync("".concat(context, "/translucencyTexture"), extension.translucencyTexture).then(function (texture) {
                pbrMaterial.subSurface.translucencyIntensityTexture = texture;
            });
        }
        else {
            return Promise.resolve();
        }
    };
    return KHR_materials_translucency;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_translucency', { enumerable: true, configurable: true, get: function() { return KHR_materials_translucency; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_translucency(loader); });
//# sourceMappingURL=KHR_materials_translucency.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224773, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_materials_volume";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume)
 * @since 5.0.0
 */
var KHR_materials_volume = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_materials_volume(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 173;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
        if (this.enabled) {
            // We need to disable instance usage because the attenuation factor depends on the node scale of each individual mesh
            this._loader._disableInstancedMesh++;
        }
    }
    /** @hidden */
    KHR_materials_volume.prototype.dispose = function () {
        if (this.enabled) {
            this._loader._disableInstancedMesh--;
        }
        this._loader = null;
    };
    /**
     * @param context
     * @param material
     * @param babylonMaterial
     * @hidden
     */
    KHR_materials_volume.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
            promises.push(_this._loadVolumePropertiesAsync(extensionContext, material, babylonMaterial, extension));
            return Promise.all(promises).then(function () { });
        });
    };
    KHR_materials_volume.prototype._loadVolumePropertiesAsync = function (context, material, babylonMaterial, extension) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
            throw new Error("".concat(context, ": Material type not supported"));
        }
        // If transparency isn't enabled already, this extension shouldn't do anything.
        // i.e. it requires either the KHR_materials_transmission or KHR_materials_translucency extensions.
        if ((!babylonMaterial.subSurface.isRefractionEnabled && !babylonMaterial.subSurface.isTranslucencyEnabled) || !extension.thicknessFactor) {
            return Promise.resolve();
        }
        // IOR in this extension only affects interior.
        babylonMaterial.subSurface.volumeIndexOfRefraction = babylonMaterial.indexOfRefraction;
        var attenuationDistance = extension.attenuationDistance !== undefined ? extension.attenuationDistance : Number.MAX_VALUE;
        babylonMaterial.subSurface.tintColorAtDistance = attenuationDistance;
        if (extension.attenuationColor !== undefined && extension.attenuationColor.length == 3) {
            babylonMaterial.subSurface.tintColor.copyFromFloats(extension.attenuationColor[0], extension.attenuationColor[1], extension.attenuationColor[2]);
        }
        babylonMaterial.subSurface.minimumThickness = 0.0;
        babylonMaterial.subSurface.maximumThickness = extension.thicknessFactor;
        babylonMaterial.subSurface.useThicknessAsDepth = true;
        if (extension.thicknessTexture) {
            extension.thicknessTexture.nonColorData = true;
            return this._loader.loadTextureInfoAsync("".concat(context, "/thicknessTexture"), extension.thicknessTexture).then(function (texture) {
                babylonMaterial.subSurface.thicknessTexture = texture;
                babylonMaterial.subSurface.useGltfStyleTextures = true;
            });
        }
        else {
            return Promise.resolve();
        }
    };
    return KHR_materials_volume;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_materials_volume', { enumerable: true, configurable: true, get: function() { return KHR_materials_volume; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_materials_volume(loader); });
//# sourceMappingURL=KHR_materials_volume.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224774, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_mesh_quantization";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization)
 */
var KHR_mesh_quantization = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_mesh_quantization(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this.enabled = loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_mesh_quantization.prototype.dispose = function () { };
    return KHR_mesh_quantization;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_mesh_quantization', { enumerable: true, configurable: true, get: function() { return KHR_mesh_quantization; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_mesh_quantization(loader); });
//# sourceMappingURL=KHR_mesh_quantization.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224775, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "KHR_texture_basisu";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu)
 */
var KHR_texture_basisu = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_texture_basisu(loader) {
        /** The name of this extension. */
        this.name = NAME;
        this._loader = loader;
        this.enabled = loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_texture_basisu.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param texture
     * @param assign
     * @hidden
     */
    KHR_texture_basisu.prototype._loadTextureAsync = function (context, texture, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, texture, this.name, function (extensionContext, extension) {
            var sampler = texture.sampler == undefined ? GLTFLoader.DefaultSampler : ArrayItem.Get("".concat(context, "/sampler"), _this._loader.gltf.samplers, texture.sampler);
            var image = ArrayItem.Get("".concat(extensionContext, "/source"), _this._loader.gltf.images, extension.source);
            return _this._loader._createTextureAsync(context, sampler, image, function (babylonTexture) {
                assign(babylonTexture);
            }, texture._textureInfo.nonColorData ? { useRGBAIfASTCBC7NotAvailableWhenUASTC: true } : undefined, !texture._textureInfo.nonColorData);
        });
    };
    return KHR_texture_basisu;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_texture_basisu', { enumerable: true, configurable: true, get: function() { return KHR_texture_basisu; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_texture_basisu(loader); });
//# sourceMappingURL=KHR_texture_basisu.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224776, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/Textures/texture.js');var Texture = __TEMP__['Texture'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_texture_transform";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_texture_transform)
 */
var KHR_texture_transform = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_texture_transform(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_texture_transform.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param textureInfo
     * @param assign
     * @hidden
     */
    KHR_texture_transform.prototype.loadTextureInfoAsync = function (context, textureInfo, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, textureInfo, this.name, function (extensionContext, extension) {
            return _this._loader.loadTextureInfoAsync(context, textureInfo, function (babylonTexture) {
                if (!(babylonTexture instanceof Texture)) {
                    throw new Error("".concat(extensionContext, ": Texture type not supported"));
                }
                if (extension.offset) {
                    babylonTexture.uOffset = extension.offset[0];
                    babylonTexture.vOffset = extension.offset[1];
                }
                // Always rotate around the origin.
                babylonTexture.uRotationCenter = 0;
                babylonTexture.vRotationCenter = 0;
                if (extension.rotation) {
                    babylonTexture.wAng = -extension.rotation;
                }
                if (extension.scale) {
                    babylonTexture.uScale = extension.scale[0];
                    babylonTexture.vScale = extension.scale[1];
                }
                if (extension.texCoord != undefined) {
                    babylonTexture.coordinatesIndex = extension.texCoord;
                }
                assign(babylonTexture);
            });
        });
    };
    return KHR_texture_transform;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_texture_transform', { enumerable: true, configurable: true, get: function() { return KHR_texture_transform; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_texture_transform(loader); });
//# sourceMappingURL=KHR_texture_transform.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224777, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "KHR_xmp_json_ld";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_xmp_json_ld)
 * @since 5.0.0
 */
var KHR_xmp_json_ld = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function KHR_xmp_json_ld(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 100;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    KHR_xmp_json_ld.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * Called after the loader state changes to LOADING.
     */
    KHR_xmp_json_ld.prototype.onLoading = function () {
        var _a, _b, _c;
        if (this._loader.rootBabylonMesh === null) {
            return;
        }
        var xmp_gltf = (_a = this._loader.gltf.extensions) === null || _a === void 0 ? void 0 : _a.KHR_xmp_json_ld;
        var xmp_node = (_c = (_b = this._loader.gltf.asset) === null || _b === void 0 ? void 0 : _b.extensions) === null || _c === void 0 ? void 0 : _c.KHR_xmp_json_ld;
        if (xmp_gltf && xmp_node) {
            var packet = +xmp_node.packet;
            if (xmp_gltf.packets && packet < xmp_gltf.packets.length) {
                this._loader.rootBabylonMesh.metadata = this._loader.rootBabylonMesh.metadata || {};
                this._loader.rootBabylonMesh.metadata.xmp = xmp_gltf.packets[packet];
            }
        }
    };
    return KHR_xmp_json_ld;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'KHR_xmp_json_ld', { enumerable: true, configurable: true, get: function() { return KHR_xmp_json_ld; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new KHR_xmp_json_ld(loader); });
//# sourceMappingURL=KHR_xmp_json_ld.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224778, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector3 = __TEMP__['Vector3'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Animations/animationEvent.js');var AnimationEvent = __TEMP__['AnimationEvent'];
var __TEMP__ = require('@babylonjs/core/Audio/sound.js');var Sound = __TEMP__['Sound'];
var __TEMP__ = require('@babylonjs/core/Audio/weightedsound.js');var WeightedSound = __TEMP__['WeightedSound'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "MSFT_audio_emitter";
/**
 * [Specification](https://github.com/najadojo/glTF/tree/MSFT_audio_emitter/extensions/2.0/Vendor/MSFT_audio_emitter)
 */
var MSFT_audio_emitter = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function MSFT_audio_emitter(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    MSFT_audio_emitter.prototype.dispose = function () {
        this._loader = null;
        this._clips = null;
        this._emitters = null;
    };
    /** @hidden */
    MSFT_audio_emitter.prototype.onLoading = function () {
        var extensions = this._loader.gltf.extensions;
        if (extensions && extensions[this.name]) {
            var extension = extensions[this.name];
            this._clips = extension.clips;
            this._emitters = extension.emitters;
            ArrayItem.Assign(this._clips);
            ArrayItem.Assign(this._emitters);
        }
    };
    /**
     * @param context
     * @param scene
     * @hidden
     */
    MSFT_audio_emitter.prototype.loadSceneAsync = function (context, scene) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, scene, this.name, function (extensionContext, extension) {
            var promises = new Array();
            promises.push(_this._loader.loadSceneAsync(context, scene));
            for (var _i = 0, _a = extension.emitters; _i < _a.length; _i++) {
                var emitterIndex = _a[_i];
                var emitter = ArrayItem.Get("".concat(extensionContext, "/emitters"), _this._emitters, emitterIndex);
                if (emitter.refDistance != undefined ||
                    emitter.maxDistance != undefined ||
                    emitter.rolloffFactor != undefined ||
                    emitter.distanceModel != undefined ||
                    emitter.innerAngle != undefined ||
                    emitter.outerAngle != undefined) {
                    throw new Error("".concat(extensionContext, ": Direction or Distance properties are not allowed on emitters attached to a scene"));
                }
                promises.push(_this._loadEmitterAsync("".concat(extensionContext, "/emitters/").concat(emitter.index), emitter));
            }
            return Promise.all(promises).then(function () { });
        });
    };
    /**
     * @param context
     * @param node
     * @param assign
     * @hidden
     */
    MSFT_audio_emitter.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, node, this.name, function (extensionContext, extension) {
            var promises = new Array();
            return _this._loader
                .loadNodeAsync(extensionContext, node, function (babylonMesh) {
                var _loop_1 = function (emitterIndex) {
                    var emitter = ArrayItem.Get("".concat(extensionContext, "/emitters"), _this._emitters, emitterIndex);
                    promises.push(_this._loadEmitterAsync("".concat(extensionContext, "/emitters/").concat(emitter.index), emitter).then(function () {
                        for (var _i = 0, _a = emitter._babylonSounds; _i < _a.length; _i++) {
                            var sound = _a[_i];
                            sound.attachToMesh(babylonMesh);
                            if (emitter.innerAngle != undefined || emitter.outerAngle != undefined) {
                                sound.setLocalDirectionToMesh(Vector3.Forward());
                                sound.setDirectionalCone(2 * Tools.ToDegrees(emitter.innerAngle == undefined ? Math.PI : emitter.innerAngle), 2 * Tools.ToDegrees(emitter.outerAngle == undefined ? Math.PI : emitter.outerAngle), 0);
                            }
                        }
                    }));
                };
                for (var _i = 0, _a = extension.emitters; _i < _a.length; _i++) {
                    var emitterIndex = _a[_i];
                    _loop_1(emitterIndex);
                }
                assign(babylonMesh);
            })
                .then(function (babylonMesh) {
                return Promise.all(promises).then(function () {
                    return babylonMesh;
                });
            });
        });
    };
    /**
     * @param context
     * @param animation
     * @hidden
     */
    MSFT_audio_emitter.prototype.loadAnimationAsync = function (context, animation) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, animation, this.name, function (extensionContext, extension) {
            return _this._loader.loadAnimationAsync(context, animation).then(function (babylonAnimationGroup) {
                var promises = new Array();
                ArrayItem.Assign(extension.events);
                for (var _i = 0, _a = extension.events; _i < _a.length; _i++) {
                    var event_1 = _a[_i];
                    promises.push(_this._loadAnimationEventAsync("".concat(extensionContext, "/events/").concat(event_1.index), context, animation, event_1, babylonAnimationGroup));
                }
                return Promise.all(promises).then(function () {
                    return babylonAnimationGroup;
                });
            });
        });
    };
    MSFT_audio_emitter.prototype._loadClipAsync = function (context, clip) {
        if (clip._objectURL) {
            return clip._objectURL;
        }
        var promise;
        if (clip.uri) {
            promise = this._loader.loadUriAsync(context, clip, clip.uri);
        }
        else {
            var bufferView = ArrayItem.Get("".concat(context, "/bufferView"), this._loader.gltf.bufferViews, clip.bufferView);
            promise = this._loader.loadBufferViewAsync("/bufferViews/".concat(bufferView.index), bufferView);
        }
        clip._objectURL = promise.then(function (data) {
            return URL.createObjectURL(new Blob([data], { type: clip.mimeType }));
        });
        return clip._objectURL;
    };
    MSFT_audio_emitter.prototype._loadEmitterAsync = function (context, emitter) {
        var _this = this;
        emitter._babylonSounds = emitter._babylonSounds || [];
        if (!emitter._babylonData) {
            var clipPromises = new Array();
            var name_1 = emitter.name || "emitter".concat(emitter.index);
            var options_1 = {
                loop: false,
                autoplay: false,
                volume: emitter.volume == undefined ? 1 : emitter.volume,
            };
            var _loop_2 = function (i) {
                var clipContext = "/extensions/".concat(this_1.name, "/clips");
                var clip = ArrayItem.Get(clipContext, this_1._clips, emitter.clips[i].clip);
                clipPromises.push(this_1._loadClipAsync("".concat(clipContext, "/").concat(emitter.clips[i].clip), clip).then(function (objectURL) {
                    var sound = (emitter._babylonSounds[i] = new Sound(name_1, objectURL, _this._loader.babylonScene, null, options_1));
                    sound.refDistance = emitter.refDistance || 1;
                    sound.maxDistance = emitter.maxDistance || 256;
                    sound.rolloffFactor = emitter.rolloffFactor || 1;
                    sound.distanceModel = emitter.distanceModel || "exponential";
                }));
            };
            var this_1 = this;
            for (var i = 0; i < emitter.clips.length; i++) {
                _loop_2(i);
            }
            var promise = Promise.all(clipPromises).then(function () {
                var weights = emitter.clips.map(function (clip) {
                    return clip.weight || 1;
                });
                var weightedSound = new WeightedSound(emitter.loop || false, emitter._babylonSounds, weights);
                if (emitter.innerAngle) {
                    weightedSound.directionalConeInnerAngle = 2 * Tools.ToDegrees(emitter.innerAngle);
                }
                if (emitter.outerAngle) {
                    weightedSound.directionalConeOuterAngle = 2 * Tools.ToDegrees(emitter.outerAngle);
                }
                if (emitter.volume) {
                    weightedSound.volume = emitter.volume;
                }
                emitter._babylonData.sound = weightedSound;
            });
            emitter._babylonData = {
                loaded: promise,
            };
        }
        return emitter._babylonData.loaded;
    };
    MSFT_audio_emitter.prototype._getEventAction = function (context, sound, action, time, startOffset) {
        switch (action) {
            case "play" /* play */: {
                return function (currentFrame) {
                    var frameOffset = (startOffset || 0) + (currentFrame - time);
                    sound.play(frameOffset);
                };
            }
            case "stop" /* stop */: {
                return function () {
                    sound.stop();
                };
            }
            case "pause" /* pause */: {
                return function () {
                    sound.pause();
                };
            }
            default: {
                throw new Error("".concat(context, ": Unsupported action ").concat(action));
            }
        }
    };
    MSFT_audio_emitter.prototype._loadAnimationEventAsync = function (context, animationContext, animation, event, babylonAnimationGroup) {
        var _this = this;
        if (babylonAnimationGroup.targetedAnimations.length == 0) {
            return Promise.resolve();
        }
        var babylonAnimation = babylonAnimationGroup.targetedAnimations[0];
        var emitterIndex = event.emitter;
        var emitter = ArrayItem.Get("/extensions/".concat(this.name, "/emitters"), this._emitters, emitterIndex);
        return this._loadEmitterAsync(context, emitter).then(function () {
            var sound = emitter._babylonData.sound;
            if (sound) {
                var babylonAnimationEvent = new AnimationEvent(event.time, _this._getEventAction(context, sound, event.action, event.time, event.startOffset));
                babylonAnimation.animation.addEvent(babylonAnimationEvent);
                // Make sure all started audio stops when this animation is terminated.
                babylonAnimationGroup.onAnimationGroupEndObservable.add(function () {
                    sound.stop();
                });
                babylonAnimationGroup.onAnimationGroupPauseObservable.add(function () {
                    sound.pause();
                });
            }
        });
    };
    return MSFT_audio_emitter;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'MSFT_audio_emitter', { enumerable: true, configurable: true, get: function() { return MSFT_audio_emitter; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new MSFT_audio_emitter(loader); });
//# sourceMappingURL=MSFT_audio_emitter.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224779, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Misc/observable.js');var Observable = __TEMP__['Observable'];
var __TEMP__ = require('@babylonjs/core/Misc/deferred.js');var Deferred = __TEMP__['Deferred'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];var ArrayItem = __TEMP__['ArrayItem'];
var NAME = "MSFT_lod";
/**
 * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_lod)
 */
var MSFT_lod = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function MSFT_lod(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines a number that determines the order the extensions are applied.
         */
        this.order = 100;
        /**
         * Maximum number of LODs to load, starting from the lowest LOD.
         */
        this.maxLODsToLoad = 10;
        /**
         * Observable raised when all node LODs of one level are loaded.
         * The event data is the index of the loaded LOD starting from zero.
         * Dispose the loader to cancel the loading of the next level of LODs.
         */
        this.onNodeLODsLoadedObservable = new Observable();
        /**
         * Observable raised when all material LODs of one level are loaded.
         * The event data is the index of the loaded LOD starting from zero.
         * Dispose the loader to cancel the loading of the next level of LODs.
         */
        this.onMaterialLODsLoadedObservable = new Observable();
        this._bufferLODs = new Array();
        this._nodeIndexLOD = null;
        this._nodeSignalLODs = new Array();
        this._nodePromiseLODs = new Array();
        this._nodeBufferLODs = new Array();
        this._materialIndexLOD = null;
        this._materialSignalLODs = new Array();
        this._materialPromiseLODs = new Array();
        this._materialBufferLODs = new Array();
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    /** @hidden */
    MSFT_lod.prototype.dispose = function () {
        this._loader = null;
        this._nodeIndexLOD = null;
        this._nodeSignalLODs.length = 0;
        this._nodePromiseLODs.length = 0;
        this._nodeBufferLODs.length = 0;
        this._materialIndexLOD = null;
        this._materialSignalLODs.length = 0;
        this._materialPromiseLODs.length = 0;
        this._materialBufferLODs.length = 0;
        this.onMaterialLODsLoadedObservable.clear();
        this.onNodeLODsLoadedObservable.clear();
    };
    /** @hidden */
    MSFT_lod.prototype.onReady = function () {
        var _this = this;
        var _loop_1 = function (indexLOD) {
            var promise = Promise.all(this_1._nodePromiseLODs[indexLOD]).then(function () {
                if (indexLOD !== 0) {
                    _this._loader.endPerformanceCounter("Node LOD ".concat(indexLOD));
                    _this._loader.log("Loaded node LOD ".concat(indexLOD));
                }
                _this.onNodeLODsLoadedObservable.notifyObservers(indexLOD);
                if (indexLOD !== _this._nodePromiseLODs.length - 1) {
                    _this._loader.startPerformanceCounter("Node LOD ".concat(indexLOD + 1));
                    _this._loadBufferLOD(_this._nodeBufferLODs, indexLOD + 1);
                    if (_this._nodeSignalLODs[indexLOD]) {
                        _this._nodeSignalLODs[indexLOD].resolve();
                    }
                }
            });
            this_1._loader._completePromises.push(promise);
        };
        var this_1 = this;
        for (var indexLOD = 0; indexLOD < this._nodePromiseLODs.length; indexLOD++) {
            _loop_1(indexLOD);
        }
        var _loop_2 = function (indexLOD) {
            var promise = Promise.all(this_2._materialPromiseLODs[indexLOD]).then(function () {
                if (indexLOD !== 0) {
                    _this._loader.endPerformanceCounter("Material LOD ".concat(indexLOD));
                    _this._loader.log("Loaded material LOD ".concat(indexLOD));
                }
                _this.onMaterialLODsLoadedObservable.notifyObservers(indexLOD);
                if (indexLOD !== _this._materialPromiseLODs.length - 1) {
                    _this._loader.startPerformanceCounter("Material LOD ".concat(indexLOD + 1));
                    _this._loadBufferLOD(_this._materialBufferLODs, indexLOD + 1);
                    if (_this._materialSignalLODs[indexLOD]) {
                        _this._materialSignalLODs[indexLOD].resolve();
                    }
                }
            });
            this_2._loader._completePromises.push(promise);
        };
        var this_2 = this;
        for (var indexLOD = 0; indexLOD < this._materialPromiseLODs.length; indexLOD++) {
            _loop_2(indexLOD);
        }
    };
    /**
     * @param context
     * @param scene
     * @hidden
     */
    MSFT_lod.prototype.loadSceneAsync = function (context, scene) {
        var promise = this._loader.loadSceneAsync(context, scene);
        this._loadBufferLOD(this._bufferLODs, 0);
        return promise;
    };
    /**
     * @param context
     * @param node
     * @param assign
     * @hidden
     */
    MSFT_lod.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        return GLTFLoader.LoadExtensionAsync(context, node, this.name, function (extensionContext, extension) {
            var firstPromise;
            var nodeLODs = _this._getLODs(extensionContext, node, _this._loader.gltf.nodes, extension.ids);
            _this._loader.logOpen("".concat(extensionContext));
            var _loop_3 = function (indexLOD) {
                var nodeLOD = nodeLODs[indexLOD];
                if (indexLOD !== 0) {
                    _this._nodeIndexLOD = indexLOD;
                    _this._nodeSignalLODs[indexLOD] = _this._nodeSignalLODs[indexLOD] || new Deferred();
                }
                var assignWrap = function (babylonTransformNode) {
                    assign(babylonTransformNode);
                    babylonTransformNode.setEnabled(false);
                };
                var promise = _this._loader.loadNodeAsync("/nodes/".concat(nodeLOD.index), nodeLOD, assignWrap).then(function (babylonMesh) {
                    if (indexLOD !== 0) {
                        // TODO: should not rely on _babylonTransformNode
                        var previousNodeLOD = nodeLODs[indexLOD - 1];
                        if (previousNodeLOD._babylonTransformNode) {
                            _this._disposeTransformNode(previousNodeLOD._babylonTransformNode);
                            delete previousNodeLOD._babylonTransformNode;
                        }
                    }
                    babylonMesh.setEnabled(true);
                    return babylonMesh;
                });
                _this._nodePromiseLODs[indexLOD] = _this._nodePromiseLODs[indexLOD] || [];
                if (indexLOD === 0) {
                    firstPromise = promise;
                }
                else {
                    _this._nodeIndexLOD = null;
                    _this._nodePromiseLODs[indexLOD].push(promise);
                }
            };
            for (var indexLOD = 0; indexLOD < nodeLODs.length; indexLOD++) {
                _loop_3(indexLOD);
            }
            _this._loader.logClose();
            return firstPromise;
        });
    };
    /**
     * @param context
     * @param material
     * @param babylonMesh
     * @param babylonDrawMode
     * @param assign
     * @hidden
     */
    MSFT_lod.prototype._loadMaterialAsync = function (context, material, babylonMesh, babylonDrawMode, assign) {
        var _this = this;
        // Don't load material LODs if already loading a node LOD.
        if (this._nodeIndexLOD) {
            return null;
        }
        return GLTFLoader.LoadExtensionAsync(context, material, this.name, function (extensionContext, extension) {
            var firstPromise;
            var materialLODs = _this._getLODs(extensionContext, material, _this._loader.gltf.materials, extension.ids);
            _this._loader.logOpen("".concat(extensionContext));
            var _loop_4 = function (indexLOD) {
                var materialLOD = materialLODs[indexLOD];
                if (indexLOD !== 0) {
                    _this._materialIndexLOD = indexLOD;
                }
                var promise = _this._loader
                    ._loadMaterialAsync("/materials/".concat(materialLOD.index), materialLOD, babylonMesh, babylonDrawMode, function (babylonMaterial) {
                    if (indexLOD === 0) {
                        assign(babylonMaterial);
                    }
                })
                    .then(function (babylonMaterial) {
                    if (indexLOD !== 0) {
                        assign(babylonMaterial);
                        // TODO: should not rely on _data
                        var previousDataLOD = materialLODs[indexLOD - 1]._data;
                        if (previousDataLOD[babylonDrawMode]) {
                            _this._disposeMaterials([previousDataLOD[babylonDrawMode].babylonMaterial]);
                            delete previousDataLOD[babylonDrawMode];
                        }
                    }
                    return babylonMaterial;
                });
                _this._materialPromiseLODs[indexLOD] = _this._materialPromiseLODs[indexLOD] || [];
                if (indexLOD === 0) {
                    firstPromise = promise;
                }
                else {
                    _this._materialIndexLOD = null;
                    _this._materialPromiseLODs[indexLOD].push(promise);
                }
            };
            for (var indexLOD = 0; indexLOD < materialLODs.length; indexLOD++) {
                _loop_4(indexLOD);
            }
            _this._loader.logClose();
            return firstPromise;
        });
    };
    /**
     * @param context
     * @param property
     * @param uri
     * @hidden
     */
    MSFT_lod.prototype._loadUriAsync = function (context, property, uri) {
        var _this = this;
        // Defer the loading of uris if loading a node or material LOD.
        if (this._nodeIndexLOD !== null) {
            this._loader.log("deferred");
            var previousIndexLOD = this._nodeIndexLOD - 1;
            this._nodeSignalLODs[previousIndexLOD] = this._nodeSignalLODs[previousIndexLOD] || new Deferred();
            return this._nodeSignalLODs[this._nodeIndexLOD - 1].promise.then(function () {
                return _this._loader.loadUriAsync(context, property, uri);
            });
        }
        else if (this._materialIndexLOD !== null) {
            this._loader.log("deferred");
            var previousIndexLOD = this._materialIndexLOD - 1;
            this._materialSignalLODs[previousIndexLOD] = this._materialSignalLODs[previousIndexLOD] || new Deferred();
            return this._materialSignalLODs[previousIndexLOD].promise.then(function () {
                return _this._loader.loadUriAsync(context, property, uri);
            });
        }
        return null;
    };
    /**
     * @param context
     * @param buffer
     * @param byteOffset
     * @param byteLength
     * @hidden
     */
    MSFT_lod.prototype.loadBufferAsync = function (context, buffer, byteOffset, byteLength) {
        if (this._loader.parent.useRangeRequests && !buffer.uri) {
            if (!this._loader.bin) {
                throw new Error("".concat(context, ": Uri is missing or the binary glTF is missing its binary chunk"));
            }
            var loadAsync = function (bufferLODs, indexLOD) {
                var start = byteOffset;
                var end = start + byteLength - 1;
                var bufferLOD = bufferLODs[indexLOD];
                if (bufferLOD) {
                    bufferLOD.start = Math.min(bufferLOD.start, start);
                    bufferLOD.end = Math.max(bufferLOD.end, end);
                }
                else {
                    bufferLOD = { start: start, end: end, loaded: new Deferred() };
                    bufferLODs[indexLOD] = bufferLOD;
                }
                return bufferLOD.loaded.promise.then(function (data) {
                    return new Uint8Array(data.buffer, data.byteOffset + byteOffset - bufferLOD.start, byteLength);
                });
            };
            this._loader.log("deferred");
            if (this._nodeIndexLOD !== null) {
                return loadAsync(this._nodeBufferLODs, this._nodeIndexLOD);
            }
            else if (this._materialIndexLOD !== null) {
                return loadAsync(this._materialBufferLODs, this._materialIndexLOD);
            }
            else {
                return loadAsync(this._bufferLODs, 0);
            }
        }
        return null;
    };
    MSFT_lod.prototype._loadBufferLOD = function (bufferLODs, indexLOD) {
        var bufferLOD = bufferLODs[indexLOD];
        if (bufferLOD) {
            this._loader.log("Loading buffer range [".concat(bufferLOD.start, "-").concat(bufferLOD.end, "]"));
            this._loader.bin.readAsync(bufferLOD.start, bufferLOD.end - bufferLOD.start + 1).then(function (data) {
                bufferLOD.loaded.resolve(data);
            }, function (error) {
                bufferLOD.loaded.reject(error);
            });
        }
    };
    /**
     * Gets an array of LOD properties from lowest to highest.
     * @param context
     * @param property
     * @param array
     * @param ids
     */
    MSFT_lod.prototype._getLODs = function (context, property, array, ids) {
        if (this.maxLODsToLoad <= 0) {
            throw new Error("maxLODsToLoad must be greater than zero");
        }
        var properties = new Array();
        for (var i = ids.length - 1; i >= 0; i--) {
            properties.push(ArrayItem.Get("".concat(context, "/ids/").concat(ids[i]), array, ids[i]));
            if (properties.length === this.maxLODsToLoad) {
                return properties;
            }
        }
        properties.push(property);
        return properties;
    };
    MSFT_lod.prototype._disposeTransformNode = function (babylonTransformNode) {
        var _this = this;
        var babylonMaterials = new Array();
        var babylonMaterial = babylonTransformNode.material;
        if (babylonMaterial) {
            babylonMaterials.push(babylonMaterial);
        }
        for (var _i = 0, _a = babylonTransformNode.getChildMeshes(); _i < _a.length; _i++) {
            var babylonMesh = _a[_i];
            if (babylonMesh.material) {
                babylonMaterials.push(babylonMesh.material);
            }
        }
        babylonTransformNode.dispose();
        var babylonMaterialsToDispose = babylonMaterials.filter(function (babylonMaterial) { return _this._loader.babylonScene.meshes.every(function (mesh) { return mesh.material != babylonMaterial; }); });
        this._disposeMaterials(babylonMaterialsToDispose);
    };
    MSFT_lod.prototype._disposeMaterials = function (babylonMaterials) {
        var babylonTextures = {};
        for (var _i = 0, babylonMaterials_1 = babylonMaterials; _i < babylonMaterials_1.length; _i++) {
            var babylonMaterial = babylonMaterials_1[_i];
            for (var _a = 0, _b = babylonMaterial.getActiveTextures(); _a < _b.length; _a++) {
                var babylonTexture = _b[_a];
                babylonTextures[babylonTexture.uniqueId] = babylonTexture;
            }
            babylonMaterial.dispose();
        }
        for (var uniqueId in babylonTextures) {
            for (var _c = 0, _d = this._loader.babylonScene.materials; _c < _d.length; _c++) {
                var babylonMaterial = _d[_c];
                if (babylonMaterial.hasTexture(babylonTextures[uniqueId])) {
                    delete babylonTextures[uniqueId];
                }
            }
        }
        for (var uniqueId in babylonTextures) {
            babylonTextures[uniqueId].dispose();
        }
    };
    return MSFT_lod;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'MSFT_lod', { enumerable: true, configurable: true, get: function() { return MSFT_lod; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new MSFT_lod(loader); });
//# sourceMappingURL=MSFT_lod.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224780, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "MSFT_minecraftMesh";
/** @hidden */
var MSFT_minecraftMesh = /** @class */ (function () {
    function MSFT_minecraftMesh(loader) {
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    MSFT_minecraftMesh.prototype.dispose = function () {
        this._loader = null;
    };
    MSFT_minecraftMesh.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtraAsync(context, material, this.name, function (extraContext, extra) {
            if (extra) {
                if (!(babylonMaterial instanceof PBRMaterial)) {
                    throw new Error("".concat(extraContext, ": Material type not supported"));
                }
                var promise = _this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial);
                if (babylonMaterial.needAlphaBlending()) {
                    babylonMaterial.forceDepthWrite = true;
                    babylonMaterial.separateCullingPass = true;
                }
                babylonMaterial.backFaceCulling = babylonMaterial.forceDepthWrite;
                babylonMaterial.twoSidedLighting = true;
                return promise;
            }
            return null;
        });
    };
    return MSFT_minecraftMesh;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'MSFT_minecraftMesh', { enumerable: true, configurable: true, get: function() { return MSFT_minecraftMesh; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new MSFT_minecraftMesh(loader); });
//# sourceMappingURL=MSFT_minecraftMesh.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224781, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Materials/PBR/pbrMaterial.js');var PBRMaterial = __TEMP__['PBRMaterial'];
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "MSFT_sRGBFactors";
/** @hidden */
var MSFT_sRGBFactors = /** @class */ (function () {
    function MSFT_sRGBFactors(loader) {
        this.name = NAME;
        this._loader = loader;
        this.enabled = this._loader.isExtensionUsed(NAME);
    }
    MSFT_sRGBFactors.prototype.dispose = function () {
        this._loader = null;
    };
    MSFT_sRGBFactors.prototype.loadMaterialPropertiesAsync = function (context, material, babylonMaterial) {
        var _this = this;
        return GLTFLoader.LoadExtraAsync(context, material, this.name, function (extraContext, extra) {
            if (extra) {
                if (!(babylonMaterial instanceof PBRMaterial)) {
                    throw new Error("".concat(extraContext, ": Material type not supported"));
                }
                var promise = _this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial);
                if (!babylonMaterial.albedoTexture) {
                    babylonMaterial.albedoColor.toLinearSpaceToRef(babylonMaterial.albedoColor);
                }
                if (!babylonMaterial.reflectivityTexture) {
                    babylonMaterial.reflectivityColor.toLinearSpaceToRef(babylonMaterial.reflectivityColor);
                }
                return promise;
            }
            return null;
        });
    };
    return MSFT_sRGBFactors;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'MSFT_sRGBFactors', { enumerable: true, configurable: true, get: function() { return MSFT_sRGBFactors; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new MSFT_sRGBFactors(loader); });
//# sourceMappingURL=MSFT_sRGBFactors.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224782, function(require, module, exports) {
var __TEMP__ = require('../glTFLoader.js');var GLTFLoader = __TEMP__['GLTFLoader'];
var NAME = "ExtrasAsMetadata";
/**
 * Store glTF extras (if present) in BJS objects' metadata
 */
var ExtrasAsMetadata = /** @class */ (function () {
    /**
     * @param loader
     * @hidden
     */
    function ExtrasAsMetadata(loader) {
        /**
         * The name of this extension.
         */
        this.name = NAME;
        /**
         * Defines whether this extension is enabled.
         */
        this.enabled = true;
        this._loader = loader;
    }
    ExtrasAsMetadata.prototype._assignExtras = function (babylonObject, gltfProp) {
        if (gltfProp.extras && Object.keys(gltfProp.extras).length > 0) {
            var metadata = (babylonObject.metadata = babylonObject.metadata || {});
            var gltf = (metadata.gltf = metadata.gltf || {});
            gltf.extras = gltfProp.extras;
        }
    };
    /** @hidden */
    ExtrasAsMetadata.prototype.dispose = function () {
        this._loader = null;
    };
    /**
     * @param context
     * @param node
     * @param assign
     * @hidden
     */
    ExtrasAsMetadata.prototype.loadNodeAsync = function (context, node, assign) {
        var _this = this;
        return this._loader.loadNodeAsync(context, node, function (babylonTransformNode) {
            _this._assignExtras(babylonTransformNode, node);
            assign(babylonTransformNode);
        });
    };
    /**
     * @param context
     * @param camera
     * @param assign
     * @hidden
     */
    ExtrasAsMetadata.prototype.loadCameraAsync = function (context, camera, assign) {
        var _this = this;
        return this._loader.loadCameraAsync(context, camera, function (babylonCamera) {
            _this._assignExtras(babylonCamera, camera);
            assign(babylonCamera);
        });
    };
    /**
     * @param context
     * @param material
     * @param babylonDrawMode
     * @hidden
     */
    ExtrasAsMetadata.prototype.createMaterial = function (context, material, babylonDrawMode) {
        var babylonMaterial = this._loader.createMaterial(context, material, babylonDrawMode);
        this._assignExtras(babylonMaterial, material);
        return babylonMaterial;
    };
    return ExtrasAsMetadata;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'ExtrasAsMetadata', { enumerable: true, configurable: true, get: function() { return ExtrasAsMetadata; } });
GLTFLoader.RegisterExtension(NAME, function (loader) { return new ExtrasAsMetadata(loader); });
//# sourceMappingURL=ExtrasAsMetadata.js.map
}, function(modId) { var map = {"../glTFLoader.js":1661401224752}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224783, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./mtlFileLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./objLoadingOptions.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./solidParser.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./objFileLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./mtlFileLoader.js":1661401224784,"./objLoadingOptions.js":1661401224785,"./solidParser.js":1661401224786,"./objFileLoader.js":1661401224787}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224784, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];
var __TEMP__ = require('@babylonjs/core/Materials/Textures/texture.js');var Texture = __TEMP__['Texture'];
var __TEMP__ = require('@babylonjs/core/Materials/standardMaterial.js');var StandardMaterial = __TEMP__['StandardMaterial'];
/**
 * Class reading and parsing the MTL file bundled with the obj file.
 */
var MTLFileLoader = /** @class */ (function () {
    function MTLFileLoader() {
        /**
         * All material loaded from the mtl will be set here
         */
        this.materials = [];
    }
    /**
     * This function will read the mtl file and create each material described inside
     * This function could be improve by adding :
     * -some component missing (Ni, Tf...)
     * -including the specific options available
     *
     * @param scene defines the scene the material will be created in
     * @param data defines the mtl data to parse
     * @param rootUrl defines the rooturl to use in order to load relative dependencies
     * @param assetContainer defines the asset container to store the material in (can be null)
     */
    MTLFileLoader.prototype.parseMTL = function (scene, data, rootUrl, assetContainer) {
        if (data instanceof ArrayBuffer) {
            return;
        }
        //Split the lines from the file
        var lines = data.split("\n");
        // whitespace char ie: [ \t\r\n\f]
        var delimiter_pattern = /\s+/;
        //Array with RGB colors
        var color;
        //New material
        var material = null;
        //Look at each line
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Blank line or comment
            if (line.length === 0 || line.charAt(0) === "#") {
                continue;
            }
            //Get the first parameter (keyword)
            var pos = line.indexOf(" ");
            var key = pos >= 0 ? line.substring(0, pos) : line;
            key = key.toLowerCase();
            //Get the data following the key
            var value = pos >= 0 ? line.substring(pos + 1).trim() : "";
            //This mtl keyword will create the new material
            if (key === "newmtl") {
                //Check if it is the first material.
                // Materials specifications are described after this keyword.
                if (material) {
                    //Add the previous material in the material array.
                    this.materials.push(material);
                }
                //Create a new material.
                // value is the name of the material read in the mtl file
                scene._blockEntityCollection = !!assetContainer;
                material = new StandardMaterial(value, scene);
                material._parentContainer = assetContainer;
                scene._blockEntityCollection = false;
            }
            else if (key === "kd" && material) {
                // Diffuse color (color under white light) using RGB values
                //value  = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set tghe color into the material
                material.diffuseColor = Color3.FromArray(color);
            }
            else if (key === "ka" && material) {
                // Ambient color (color under shadow) using RGB values
                //value = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set tghe color into the material
                material.ambientColor = Color3.FromArray(color);
            }
            else if (key === "ks" && material) {
                // Specular color (color when light is reflected from shiny surface) using RGB values
                //value = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set the color into the material
                material.specularColor = Color3.FromArray(color);
            }
            else if (key === "ke" && material) {
                // Emissive color using RGB values
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                material.emissiveColor = Color3.FromArray(color);
            }
            else if (key === "ns" && material) {
                //value = "Integer"
                material.specularPower = parseFloat(value);
            }
            else if (key === "d" && material) {
                //d is dissolve for current material. It mean alpha for BABYLON
                material.alpha = parseFloat(value);
                //Texture
                //This part can be improved by adding the possible options of texture
            }
            else if (key === "map_ka" && material) {
                // ambient texture map with a loaded image
                //We must first get the folder of the image
                material.ambientTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_kd" && material) {
                // Diffuse texture map with a loaded image
                material.diffuseTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_ks" && material) {
                // Specular texture map with a loaded image
                //We must first get the folder of the image
                material.specularTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_ns") {
                //Specular
                //Specular highlight component
                //We must first get the folder of the image
                //
                //Not supported by BABYLON
                //
                //    continue;
            }
            else if (key === "map_bump" && material) {
                //The bump texture
                var values = value.split(delimiter_pattern);
                var bumpMultiplierIndex = values.indexOf("-bm");
                var bumpMultiplier = null;
                if (bumpMultiplierIndex >= 0) {
                    bumpMultiplier = values[bumpMultiplierIndex + 1];
                    values.splice(bumpMultiplierIndex, 2); // remove
                }
                material.bumpTexture = MTLFileLoader._GetTexture(rootUrl, values.join(" "), scene);
                if (material.bumpTexture && bumpMultiplier !== null) {
                    material.bumpTexture.level = parseFloat(bumpMultiplier);
                }
            }
            else if (key === "map_d" && material) {
                // The dissolve of the material
                material.opacityTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
                //Options for illumination
            }
            else if (key === "illum") {
                //Illumination
                if (value === "0") {
                    //That mean Kd == Kd
                }
                else if (value === "1") {
                    //Color on and Ambient on
                }
                else if (value === "2") {
                    //Highlight on
                }
                else if (value === "3") {
                    //Reflection on and Ray trace on
                }
                else if (value === "4") {
                    //Transparency: Glass on, Reflection: Ray trace on
                }
                else if (value === "5") {
                    //Reflection: Fresnel on and Ray trace on
                }
                else if (value === "6") {
                    //Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
                }
                else if (value === "7") {
                    //Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
                }
                else if (value === "8") {
                    //Reflection on and Ray trace off
                }
                else if (value === "9") {
                    //Transparency: Glass on, Reflection: Ray trace off
                }
                else if (value === "10") {
                    //Casts shadows onto invisible surfaces
                }
            }
            else {
                // console.log("Unhandled expression at line : " + i +'\n' + "with value : " + line);
            }
        }
        //At the end of the file, add the last material
        if (material) {
            this.materials.push(material);
        }
    };
    /**
     * Gets the texture for the material.
     *
     * If the material is imported from input file,
     * We sanitize the url to ensure it takes the texture from aside the material.
     *
     * @param rootUrl The root url to load from
     * @param value The value stored in the mtl
     * @param scene
     * @return The Texture
     */
    MTLFileLoader._GetTexture = function (rootUrl, value, scene) {
        if (!value) {
            return null;
        }
        var url = rootUrl;
        // Load from input file.
        if (rootUrl === "file:") {
            var lastDelimiter = value.lastIndexOf("\\");
            if (lastDelimiter === -1) {
                lastDelimiter = value.lastIndexOf("/");
            }
            if (lastDelimiter > -1) {
                url += value.substr(lastDelimiter + 1);
            }
            else {
                url += value;
            }
        }
        // Not from input file.
        else {
            url += value;
        }
        return new Texture(url, scene, false, MTLFileLoader.INVERT_TEXTURE_Y);
    };
    /**
     * Invert Y-Axis of referenced textures on load
     */
    MTLFileLoader.INVERT_TEXTURE_Y = true;
    return MTLFileLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'MTLFileLoader', { enumerable: true, configurable: true, get: function() { return MTLFileLoader; } });
//# sourceMappingURL=mtlFileLoader.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224785, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=objLoadingOptions.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224786, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Buffers/buffer.js');var VertexBuffer = __TEMP__['VertexBuffer'];
var __TEMP__ = require('@babylonjs/core/Materials/standardMaterial.js');var StandardMaterial = __TEMP__['StandardMaterial'];
var __TEMP__ = require('@babylonjs/core/Maths/math.color.js');var Color3 = __TEMP__['Color3'];var Color4 = __TEMP__['Color4'];
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector2 = __TEMP__['Vector2'];var Vector3 = __TEMP__['Vector3'];
var __TEMP__ = require('@babylonjs/core/Meshes/geometry.js');var Geometry = __TEMP__['Geometry'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.js');var Mesh = __TEMP__['Mesh'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.vertexData.js');var VertexData = __TEMP__['VertexData'];
/**
 * Class used to load mesh data from OBJ content
 */
var SolidParser = /** @class */ (function () {
    /**
     * Creates a new SolidParser
     * @param materialToUse defines the array to fill with the list of materials to use (it will be filled by the parse function)
     * @param babylonMeshesArray defines the array to fill with the list of loaded meshes (it will be filled by the parse function)
     * @param loadingOptions defines the loading options to use
     */
    function SolidParser(materialToUse, babylonMeshesArray, loadingOptions) {
        this._positions = []; //values for the positions of vertices
        this._normals = []; //Values for the normals
        this._uvs = []; //Values for the textures
        this._colors = [];
        this._meshesFromObj = []; //[mesh] Contains all the obj meshes
        this._indicesForBabylon = []; //The list of indices for VertexData
        this._wrappedPositionForBabylon = []; //The list of position in vectors
        this._wrappedUvsForBabylon = []; //Array with all value of uvs to match with the indices
        this._wrappedColorsForBabylon = []; // Array with all color values to match with the indices
        this._wrappedNormalsForBabylon = []; //Array with all value of normals to match with the indices
        this._tuplePosNorm = []; //Create a tuple with indice of Position, Normal, UV  [pos, norm, uvs]
        this._curPositionInIndices = 0;
        this._hasMeshes = false; //Meshes are defined in the file
        this._unwrappedPositionsForBabylon = []; //Value of positionForBabylon w/o Vector3() [x,y,z]
        this._unwrappedColorsForBabylon = []; // Value of colorForBabylon w/o Color4() [r,g,b,a]
        this._unwrappedNormalsForBabylon = []; //Value of normalsForBabylon w/o Vector3()  [x,y,z]
        this._unwrappedUVForBabylon = []; //Value of uvsForBabylon w/o Vector3()      [x,y,z]
        this._triangles = []; //Indices from new triangles coming from polygons
        this._materialNameFromObj = ""; //The name of the current material
        this._objMeshName = ""; //The name of the current obj mesh
        this._increment = 1; //Id for meshes created by the multimaterial
        this._isFirstMaterial = true;
        this._grayColor = new Color4(0.5, 0.5, 0.5, 1);
        this._materialToUse = materialToUse;
        this._babylonMeshesArray = babylonMeshesArray;
        this._loadingOptions = loadingOptions;
    }
    /**
     * Search for obj in the given array.
     * This function is called to check if a couple of data already exists in an array.
     *
     * If found, returns the index of the founded tuple index. Returns -1 if not found
     * @param arr Array<{ normals: Array<number>, idx: Array<number> }>
     * @param obj Array<number>
     * @returns {boolean}
     */
    SolidParser.prototype._isInArray = function (arr, obj) {
        if (!arr[obj[0]]) {
            arr[obj[0]] = { normals: [], idx: [] };
        }
        var idx = arr[obj[0]].normals.indexOf(obj[1]);
        return idx === -1 ? -1 : arr[obj[0]].idx[idx];
    };
    SolidParser.prototype._isInArrayUV = function (arr, obj) {
        if (!arr[obj[0]]) {
            arr[obj[0]] = { normals: [], idx: [], uv: [] };
        }
        var idx = arr[obj[0]].normals.indexOf(obj[1]);
        if (idx != 1 && obj[2] === arr[obj[0]].uv[idx]) {
            return arr[obj[0]].idx[idx];
        }
        return -1;
    };
    /**
     * This function set the data for each triangle.
     * Data are position, normals and uvs
     * If a tuple of (position, normal) is not set, add the data into the corresponding array
     * If the tuple already exist, add only their indice
     *
     * @param indicePositionFromObj Integer The index in positions array
     * @param indiceUvsFromObj Integer The index in uvs array
     * @param indiceNormalFromObj Integer The index in normals array
     * @param positionVectorFromOBJ Vector3 The value of position at index objIndice
     * @param textureVectorFromOBJ Vector3 The value of uvs
     * @param normalsVectorFromOBJ Vector3 The value of normals at index objNormale
     * @param positionColorsFromOBJ
     */
    SolidParser.prototype._setData = function (indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ, positionColorsFromOBJ) {
        //Check if this tuple already exists in the list of tuples
        var _index;
        if (this._loadingOptions.optimizeWithUV) {
            _index = this._isInArrayUV(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj, indiceUvsFromObj]);
        }
        else {
            _index = this._isInArray(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj]);
        }
        //If it not exists
        if (_index === -1) {
            //Add an new indice.
            //The array of indices is only an array with his length equal to the number of triangles - 1.
            //We add vertices data in this order
            this._indicesForBabylon.push(this._wrappedPositionForBabylon.length);
            //Push the position of vertice for Babylon
            //Each element is a Vector3(x,y,z)
            this._wrappedPositionForBabylon.push(positionVectorFromOBJ);
            //Push the uvs for Babylon
            //Each element is a Vector3(u,v)
            this._wrappedUvsForBabylon.push(textureVectorFromOBJ);
            //Push the normals for Babylon
            //Each element is a Vector3(x,y,z)
            this._wrappedNormalsForBabylon.push(normalsVectorFromOBJ);
            if (positionColorsFromOBJ !== undefined) {
                //Push the colors for Babylon
                //Each element is a BABYLON.Color4(r,g,b,a)
                this._wrappedColorsForBabylon.push(positionColorsFromOBJ);
            }
            //Add the tuple in the comparison list
            this._tuplePosNorm[indicePositionFromObj].normals.push(indiceNormalFromObj);
            this._tuplePosNorm[indicePositionFromObj].idx.push(this._curPositionInIndices++);
            if (this._loadingOptions.optimizeWithUV) {
                this._tuplePosNorm[indicePositionFromObj].uv.push(indiceUvsFromObj);
            }
        }
        else {
            //The tuple already exists
            //Add the index of the already existing tuple
            //At this index we can get the value of position, normal, color and uvs of vertex
            this._indicesForBabylon.push(_index);
        }
    };
    /**
     * Transform Vector() and BABYLON.Color() objects into numbers in an array
     */
    SolidParser.prototype._unwrapData = function () {
        //Every array has the same length
        for (var l = 0; l < this._wrappedPositionForBabylon.length; l++) {
            //Push the x, y, z values of each element in the unwrapped array
            this._unwrappedPositionsForBabylon.push(this._wrappedPositionForBabylon[l].x, this._wrappedPositionForBabylon[l].y, this._wrappedPositionForBabylon[l].z);
            this._unwrappedNormalsForBabylon.push(this._wrappedNormalsForBabylon[l].x, this._wrappedNormalsForBabylon[l].y, this._wrappedNormalsForBabylon[l].z);
            this._unwrappedUVForBabylon.push(this._wrappedUvsForBabylon[l].x, this._wrappedUvsForBabylon[l].y); //z is an optional value not supported by BABYLON
            if (this._loadingOptions.importVertexColors) {
                //Push the r, g, b, a values of each element in the unwrapped array
                this._unwrappedColorsForBabylon.push(this._wrappedColorsForBabylon[l].r, this._wrappedColorsForBabylon[l].g, this._wrappedColorsForBabylon[l].b, this._wrappedColorsForBabylon[l].a);
            }
        }
        // Reset arrays for the next new meshes
        this._wrappedPositionForBabylon = [];
        this._wrappedNormalsForBabylon = [];
        this._wrappedUvsForBabylon = [];
        this._wrappedColorsForBabylon = [];
        this._tuplePosNorm = [];
        this._curPositionInIndices = 0;
    };
    /**
     * Create triangles from polygons
     * It is important to notice that a triangle is a polygon
     * We get 5 patterns of face defined in OBJ File :
     * facePattern1 = ["1","2","3","4","5","6"]
     * facePattern2 = ["1/1","2/2","3/3","4/4","5/5","6/6"]
     * facePattern3 = ["1/1/1","2/2/2","3/3/3","4/4/4","5/5/5","6/6/6"]
     * facePattern4 = ["1//1","2//2","3//3","4//4","5//5","6//6"]
     * facePattern5 = ["-1/-1/-1","-2/-2/-2","-3/-3/-3","-4/-4/-4","-5/-5/-5","-6/-6/-6"]
     * Each pattern is divided by the same method
     * @param faces Array[String] The indices of elements
     * @param v Integer The variable to increment
     */
    SolidParser.prototype._getTriangles = function (faces, v) {
        //Work for each element of the array
        for (var faceIndex = v; faceIndex < faces.length - 1; faceIndex++) {
            //Add on the triangle variable the indexes to obtain triangles
            this._triangles.push(faces[0], faces[faceIndex], faces[faceIndex + 1]);
        }
        //Result obtained after 2 iterations:
        //Pattern1 => triangle = ["1","2","3","1","3","4"];
        //Pattern2 => triangle = ["1/1","2/2","3/3","1/1","3/3","4/4"];
        //Pattern3 => triangle = ["1/1/1","2/2/2","3/3/3","1/1/1","3/3/3","4/4/4"];
        //Pattern4 => triangle = ["1//1","2//2","3//3","1//1","3//3","4//4"];
        //Pattern5 => triangle = ["-1/-1/-1","-2/-2/-2","-3/-3/-3","-1/-1/-1","-3/-3/-3","-4/-4/-4"];
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 1
     * In this pattern we get vertice positions
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern1 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        //For each element in the triangles array.
        //This var could contains 1 to an infinity of triangles
        for (var k = 0; k < this._triangles.length; k++) {
            // Set position indice
            var indicePositionFromObj = parseInt(this._triangles[k]) - 1;
            this._setData(indicePositionFromObj, 0, 0, // In the pattern 1, normals and uvs are not defined
            this._positions[indicePositionFromObj], // Get the vectors data
            Vector2.Zero(), Vector3.Up(), // Create default vectors
            this._loadingOptions.importVertexColors ? this._colors[indicePositionFromObj] : undefined);
        }
        //Reset variable for the next line
        this._triangles = [];
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 2
     * In this pattern we get vertice positions and uvsu
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern2 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1/1"
            //Split the data for getting position and uv
            var point = this._triangles[k].split("/"); // ["1", "1"]
            //Set position indice
            var indicePositionFromObj = parseInt(point[0]) - 1;
            //Set uv indice
            var indiceUvsFromObj = parseInt(point[1]) - 1;
            this._setData(indicePositionFromObj, indiceUvsFromObj, 0, //Default value for normals
            this._positions[indicePositionFromObj], //Get the values for each element
            this._uvs[indiceUvsFromObj], Vector3.Up(), //Default value for normals
            this._loadingOptions.importVertexColors ? this._colors[indicePositionFromObj] : undefined);
        }
        //Reset variable for the next line
        this._triangles = [];
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 3
     * In this pattern we get vertice positions, uvs and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern3 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1/1/1"
            //Split the data for getting position, uv, and normals
            var point = this._triangles[k].split("/"); // ["1", "1", "1"]
            // Set position indice
            var indicePositionFromObj = parseInt(point[0]) - 1;
            // Set uv indice
            var indiceUvsFromObj = parseInt(point[1]) - 1;
            // Set normal indice
            var indiceNormalFromObj = parseInt(point[2]) - 1;
            this._setData(indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, this._positions[indicePositionFromObj], this._uvs[indiceUvsFromObj], this._normals[indiceNormalFromObj] //Set the vector for each component
            );
        }
        //Reset variable for the next line
        this._triangles = [];
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 4
     * In this pattern we get vertice positions and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern4 = function (face, v) {
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1//1"
            //Split the data for getting position and normals
            var point = this._triangles[k].split("//"); // ["1", "1"]
            // We check indices, and normals
            var indicePositionFromObj = parseInt(point[0]) - 1;
            var indiceNormalFromObj = parseInt(point[1]) - 1;
            this._setData(indicePositionFromObj, 1, //Default value for uv
            indiceNormalFromObj, this._positions[indicePositionFromObj], //Get each vector of data
            Vector2.Zero(), this._normals[indiceNormalFromObj], this._loadingOptions.importVertexColors ? this._colors[indicePositionFromObj] : undefined);
        }
        //Reset variable for the next line
        this._triangles = [];
    };
    /*
     * Create triangles and push the data for each polygon for the pattern 3
     * In this pattern we get vertice positions, uvs and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern5 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "-1/-1/-1"
            //Split the data for getting position, uv, and normals
            var point = this._triangles[k].split("/"); // ["-1", "-1", "-1"]
            // Set position indice
            var indicePositionFromObj = this._positions.length + parseInt(point[0]);
            // Set uv indice
            var indiceUvsFromObj = this._uvs.length + parseInt(point[1]);
            // Set normal indice
            var indiceNormalFromObj = this._normals.length + parseInt(point[2]);
            this._setData(indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, this._positions[indicePositionFromObj], this._uvs[indiceUvsFromObj], this._normals[indiceNormalFromObj], //Set the vector for each component
            this._loadingOptions.importVertexColors ? this._colors[indicePositionFromObj] : undefined);
        }
        //Reset variable for the next line
        this._triangles = [];
    };
    SolidParser.prototype._addPreviousObjMesh = function () {
        //Check if it is not the first mesh. Otherwise we don't have data.
        if (this._meshesFromObj.length > 0) {
            //Get the previous mesh for applying the data about the faces
            //=> in obj file, faces definition append after the name of the mesh
            this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
            //Set the data into Array for the mesh
            this._unwrapData();
            // Reverse tab. Otherwise face are displayed in the wrong sens
            this._indicesForBabylon.reverse();
            //Set the information for the mesh
            //Slice the array to avoid rewriting because of the fact this is the same var which be rewrited
            this._handledMesh.indices = this._indicesForBabylon.slice();
            this._handledMesh.positions = this._unwrappedPositionsForBabylon.slice();
            this._handledMesh.normals = this._unwrappedNormalsForBabylon.slice();
            this._handledMesh.uvs = this._unwrappedUVForBabylon.slice();
            if (this._loadingOptions.importVertexColors) {
                this._handledMesh.colors = this._unwrappedColorsForBabylon.slice();
            }
            //Reset the array for the next mesh
            this._indicesForBabylon = [];
            this._unwrappedPositionsForBabylon = [];
            this._unwrappedColorsForBabylon = [];
            this._unwrappedNormalsForBabylon = [];
            this._unwrappedUVForBabylon = [];
        }
    };
    SolidParser.prototype._optimizeNormals = function (mesh) {
        var positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        var normals = mesh.getVerticesData(VertexBuffer.NormalKind);
        var mapVertices = {};
        if (!positions || !normals) {
            return;
        }
        for (var i = 0; i < positions.length / 3; i++) {
            var x = positions[i * 3 + 0];
            var y = positions[i * 3 + 1];
            var z = positions[i * 3 + 2];
            var key = x + "_" + y + "_" + z;
            var lst = mapVertices[key];
            if (!lst) {
                lst = [];
                mapVertices[key] = lst;
            }
            lst.push(i);
        }
        var normal = new Vector3();
        for (var key in mapVertices) {
            var lst = mapVertices[key];
            if (lst.length < 2) {
                continue;
            }
            var v0Idx = lst[0];
            for (var i = 1; i < lst.length; ++i) {
                var vIdx = lst[i];
                normals[v0Idx * 3 + 0] += normals[vIdx * 3 + 0];
                normals[v0Idx * 3 + 1] += normals[vIdx * 3 + 1];
                normals[v0Idx * 3 + 2] += normals[vIdx * 3 + 2];
            }
            normal.copyFromFloats(normals[v0Idx * 3 + 0], normals[v0Idx * 3 + 1], normals[v0Idx * 3 + 2]);
            normal.normalize();
            for (var i = 0; i < lst.length; ++i) {
                var vIdx = lst[i];
                normals[vIdx * 3 + 0] = normal.x;
                normals[vIdx * 3 + 1] = normal.y;
                normals[vIdx * 3 + 2] = normal.z;
            }
        }
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
    };
    /**
     * Function used to parse an OBJ string
     * @param meshesNames defines the list of meshes to load (all if not defined)
     * @param data defines the OBJ string
     * @param scene defines the hosting scene
     * @param assetContainer defines the asset container to load data in
     * @param onFileToLoadFound defines a callback that will be called if a MTL file is found
     */
    SolidParser.prototype.parse = function (meshesNames, data, scene, assetContainer, onFileToLoadFound) {
        var _a;
        // Split the file into lines
        var lines = data.split("\n");
        // Look at each line
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim().replace(/\s\s/g, " ");
            var result = void 0;
            // Comment or newLine
            if (line.length === 0 || line.charAt(0) === "#") {
                continue;
                //Get information about one position possible for the vertices
            }
            else if (SolidParser.VertexPattern.test(line)) {
                result = line.match(/[^ ]+/g); // match will return non-null due to passing regex pattern
                // Value of result with line: "v 1.0 2.0 3.0"
                // ["v", "1.0", "2.0", "3.0"]
                // Create a Vector3 with the position x, y, z
                this._positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
                if (this._loadingOptions.importVertexColors) {
                    if (result.length >= 7) {
                        var r = parseFloat(result[4]);
                        var g = parseFloat(result[5]);
                        var b = parseFloat(result[6]);
                        this._colors.push(new Color4(r > 1 ? r / 255 : r, g > 1 ? g / 255 : g, b > 1 ? b / 255 : b, result.length === 7 || result[7] === undefined ? 1 : parseFloat(result[7])));
                    }
                    else {
                        // TODO: maybe push NULL and if all are NULL to skip (and remove grayColor var).
                        this._colors.push(this._grayColor);
                    }
                }
            }
            else if ((result = SolidParser.NormalPattern.exec(line)) !== null) {
                //Create a Vector3 with the normals x, y, z
                //Value of result
                // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
                //Add the Vector in the list of normals
                this._normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
            }
            else if ((result = SolidParser.UVPattern.exec(line)) !== null) {
                //Create a Vector2 with the normals u, v
                //Value of result
                // ["vt 0.1 0.2 0.3", "0.1", "0.2"]
                //Add the Vector in the list of uvs
                this._uvs.push(new Vector2(parseFloat(result[1]) * this._loadingOptions.UVScaling.x, parseFloat(result[2]) * this._loadingOptions.UVScaling.y));
                //Identify patterns of faces
                //Face could be defined in different type of pattern
            }
            else if ((result = SolidParser.FacePattern3.exec(line)) !== null) {
                //Value of result:
                //["f 1/1/1 2/2/2 3/3/3", "1/1/1 2/2/2 3/3/3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern3(result[1].trim().split(" "), // ["1/1/1", "2/2/2", "3/3/3"]
                1);
            }
            else if ((result = SolidParser.FacePattern4.exec(line)) !== null) {
                //Value of result:
                //["f 1//1 2//2 3//3", "1//1 2//2 3//3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern4(result[1].trim().split(" "), // ["1//1", "2//2", "3//3"]
                1);
            }
            else if ((result = SolidParser.FacePattern5.exec(line)) !== null) {
                //Value of result:
                //["f -1/-1/-1 -2/-2/-2 -3/-3/-3", "-1/-1/-1 -2/-2/-2 -3/-3/-3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern5(result[1].trim().split(" "), // ["-1/-1/-1", "-2/-2/-2", "-3/-3/-3"]
                1);
            }
            else if ((result = SolidParser.FacePattern2.exec(line)) !== null) {
                //Value of result:
                //["f 1/1 2/2 3/3", "1/1 2/2 3/3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern2(result[1].trim().split(" "), // ["1/1", "2/2", "3/3"]
                1);
            }
            else if ((result = SolidParser.FacePattern1.exec(line)) !== null) {
                //Value of result
                //["f 1 2 3", "1 2 3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern1(result[1].trim().split(" "), // ["1", "2", "3"]
                1);
                // Define a mesh or an object
                // Each time this keyword is analysed, create a new Object with all data for creating a babylonMesh
            }
            else if (SolidParser.GroupDescriptor.test(line) || SolidParser.ObjectDescriptor.test(line)) {
                // Create a new mesh corresponding to the name of the group.
                // Definition of the mesh
                var objMesh = {
                    name: line.substring(2).trim(),
                    indices: undefined,
                    positions: undefined,
                    normals: undefined,
                    uvs: undefined,
                    colors: undefined,
                    materialName: "",
                };
                this._addPreviousObjMesh();
                //Push the last mesh created with only the name
                this._meshesFromObj.push(objMesh);
                //Set this variable to indicate that now meshesFromObj has objects defined inside
                this._hasMeshes = true;
                this._isFirstMaterial = true;
                this._increment = 1;
                //Keyword for applying a material
            }
            else if (SolidParser.UseMtlDescriptor.test(line)) {
                //Get the name of the material
                this._materialNameFromObj = line.substring(7).trim();
                //If this new material is in the same mesh
                if (!this._isFirstMaterial || !this._hasMeshes) {
                    //Set the data for the previous mesh
                    this._addPreviousObjMesh();
                    //Create a new mesh
                    var objMesh = 
                    //Set the name of the current obj mesh
                    {
                        name: (this._objMeshName || "mesh") + "_mm" + this._increment.toString(),
                        indices: undefined,
                        positions: undefined,
                        normals: undefined,
                        uvs: undefined,
                        colors: undefined,
                        materialName: this._materialNameFromObj,
                    };
                    this._increment++;
                    //If meshes are already defined
                    this._meshesFromObj.push(objMesh);
                    this._hasMeshes = true;
                }
                //Set the material name if the previous line define a mesh
                if (this._hasMeshes && this._isFirstMaterial) {
                    //Set the material name to the previous mesh (1 material per mesh)
                    this._meshesFromObj[this._meshesFromObj.length - 1].materialName = this._materialNameFromObj;
                    this._isFirstMaterial = false;
                }
                // Keyword for loading the mtl file
            }
            else if (SolidParser.MtlLibGroupDescriptor.test(line)) {
                // Get the name of mtl file
                onFileToLoadFound(line.substring(7).trim());
                // Apply smoothing
            }
            else if (SolidParser.SmoothDescriptor.test(line)) {
                // smooth shading => apply smoothing
                // Today I don't know it work with babylon and with obj.
                // With the obj file  an integer is set
            }
            else {
                //If there is another possibility
                console.log("Unhandled expression at line : " + line);
            }
        }
        // At the end of the file, add the last mesh into the meshesFromObj array
        if (this._hasMeshes) {
            // Set the data for the last mesh
            this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
            //Reverse indices for displaying faces in the good sense
            this._indicesForBabylon.reverse();
            //Get the good array
            this._unwrapData();
            //Set array
            this._handledMesh.indices = this._indicesForBabylon;
            this._handledMesh.positions = this._unwrappedPositionsForBabylon;
            this._handledMesh.normals = this._unwrappedNormalsForBabylon;
            this._handledMesh.uvs = this._unwrappedUVForBabylon;
            if (this._loadingOptions.importVertexColors) {
                this._handledMesh.colors = this._unwrappedColorsForBabylon;
            }
        }
        // If any o or g keyword not found, create a mesh with a random id
        if (!this._hasMeshes) {
            var newMaterial = null;
            if (this._indicesForBabylon.length) {
                // reverse tab of indices
                this._indicesForBabylon.reverse();
                //Get positions normals uvs
                this._unwrapData();
            }
            else {
                // There is no indices in the file. We will have to switch to point cloud rendering
                for (var _i = 0, _b = this._positions; _i < _b.length; _i++) {
                    var pos = _b[_i];
                    this._unwrappedPositionsForBabylon.push(pos.x, pos.y, pos.z);
                }
                if (this._normals.length) {
                    for (var _c = 0, _d = this._normals; _c < _d.length; _c++) {
                        var normal = _d[_c];
                        this._unwrappedNormalsForBabylon.push(normal.x, normal.y, normal.z);
                    }
                }
                if (this._uvs.length) {
                    for (var _e = 0, _f = this._uvs; _e < _f.length; _e++) {
                        var uv = _f[_e];
                        this._unwrappedUVForBabylon.push(uv.x, uv.y);
                    }
                }
                if (this._colors.length) {
                    for (var _g = 0, _h = this._colors; _g < _h.length; _g++) {
                        var color = _h[_g];
                        this._unwrappedColorsForBabylon.push(color.r, color.g, color.b, color.a);
                    }
                }
                if (!this._materialNameFromObj) {
                    // Create a material with point cloud on
                    newMaterial = new StandardMaterial(Geometry.RandomId(), scene);
                    newMaterial.pointsCloud = true;
                    this._materialNameFromObj = newMaterial.name;
                    if (!this._normals.length) {
                        newMaterial.disableLighting = true;
                        newMaterial.emissiveColor = Color3.White();
                    }
                }
            }
            //Set data for one mesh
            this._meshesFromObj.push({
                name: Geometry.RandomId(),
                indices: this._indicesForBabylon,
                positions: this._unwrappedPositionsForBabylon,
                colors: this._unwrappedColorsForBabylon,
                normals: this._unwrappedNormalsForBabylon,
                uvs: this._unwrappedUVForBabylon,
                materialName: this._materialNameFromObj,
                directMaterial: newMaterial,
            });
        }
        //Set data for each mesh
        for (var j = 0; j < this._meshesFromObj.length; j++) {
            //check meshesNames (stlFileLoader)
            if (meshesNames && this._meshesFromObj[j].name) {
                if (meshesNames instanceof Array) {
                    if (meshesNames.indexOf(this._meshesFromObj[j].name) === -1) {
                        continue;
                    }
                }
                else {
                    if (this._meshesFromObj[j].name !== meshesNames) {
                        continue;
                    }
                }
            }
            //Get the current mesh
            //Set the data with VertexBuffer for each mesh
            this._handledMesh = this._meshesFromObj[j];
            //Create a Mesh with the name of the obj mesh
            scene._blockEntityCollection = !!assetContainer;
            var babylonMesh = new Mesh(this._meshesFromObj[j].name, scene);
            babylonMesh._parentContainer = assetContainer;
            scene._blockEntityCollection = false;
            //Push the name of the material to an array
            //This is indispensable for the importMesh function
            this._materialToUse.push(this._meshesFromObj[j].materialName);
            if (((_a = this._handledMesh.positions) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                //Push the mesh into an array
                this._babylonMeshesArray.push(babylonMesh);
                continue;
            }
            var vertexData = new VertexData(); //The container for the values
            //Set the data for the babylonMesh
            vertexData.uvs = this._handledMesh.uvs;
            vertexData.indices = this._handledMesh.indices;
            vertexData.positions = this._handledMesh.positions;
            if (this._loadingOptions.computeNormals) {
                var normals = new Array();
                VertexData.ComputeNormals(this._handledMesh.positions, this._handledMesh.indices, normals);
                vertexData.normals = normals;
            }
            else {
                vertexData.normals = this._handledMesh.normals;
            }
            if (this._loadingOptions.importVertexColors) {
                vertexData.colors = this._handledMesh.colors;
            }
            //Set the data from the VertexBuffer to the current Mesh
            vertexData.applyToMesh(babylonMesh);
            if (this._loadingOptions.invertY) {
                babylonMesh.scaling.y *= -1;
            }
            if (this._loadingOptions.optimizeNormals) {
                this._optimizeNormals(babylonMesh);
            }
            //Push the mesh into an array
            this._babylonMeshesArray.push(babylonMesh);
            if (this._handledMesh.directMaterial) {
                babylonMesh.material = this._handledMesh.directMaterial;
            }
        }
    };
    // Descriptor
    /** Object descriptor */
    SolidParser.ObjectDescriptor = /^o/;
    /** Group descriptor */
    SolidParser.GroupDescriptor = /^g/;
    /** Material lib descriptor */
    SolidParser.MtlLibGroupDescriptor = /^mtllib /;
    /** Use a material descriptor */
    SolidParser.UseMtlDescriptor = /^usemtl /;
    /** Smooth descriptor */
    SolidParser.SmoothDescriptor = /^s /;
    // Patterns
    /** Pattern used to detect a vertex */
    SolidParser.VertexPattern = /v(\s+[\d|.|+|\-|e|E]+){3,7}/;
    /** Pattern used to detect a normal */
    SolidParser.NormalPattern = /vn(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
    /** Pattern used to detect a UV set */
    SolidParser.UVPattern = /vt(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
    /** Pattern used to detect a first kind of face (f vertex vertex vertex) */
    SolidParser.FacePattern1 = /f\s+(([\d]{1,}[\s]?){3,})+/;
    /** Pattern used to detect a second kind of face (f vertex/uvs vertex/uvs vertex/uvs) */
    SolidParser.FacePattern2 = /f\s+((([\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a third kind of face (f vertex/uvs/normal vertex/uvs/normal vertex/uvs/normal) */
    SolidParser.FacePattern3 = /f\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a fourth kind of face (f vertex//normal vertex//normal vertex//normal)*/
    SolidParser.FacePattern4 = /f\s+((([\d]{1,}\/\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a fifth kind of face (f -vertex/-uvs/-normal -vertex/-uvs/-normal -vertex/-uvs/-normal) */
    SolidParser.FacePattern5 = /f\s+(((-[\d]{1,}\/-[\d]{1,}\/-[\d]{1,}[\s]?){3,})+)/;
    return SolidParser;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'SolidParser', { enumerable: true, configurable: true, get: function() { return SolidParser; } });
//# sourceMappingURL=solidParser.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224787, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Maths/math.vector.js');var Vector2 = __TEMP__['Vector2'];
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Loading/sceneLoader.js');var SceneLoader = __TEMP__['SceneLoader'];
var __TEMP__ = require('@babylonjs/core/assetContainer.js');var AssetContainer = __TEMP__['AssetContainer'];
var __TEMP__ = require('./mtlFileLoader.js');var MTLFileLoader = __TEMP__['MTLFileLoader'];
var __TEMP__ = require('./solidParser.js');var SolidParser = __TEMP__['SolidParser'];
/**
 * OBJ file type loader.
 * This is a babylon scene loader plugin.
 */
var OBJFileLoader = /** @class */ (function () {
    /**
     * Creates loader for .OBJ files
     *
     * @param loadingOptions options for loading and parsing OBJ/MTL files.
     */
    function OBJFileLoader(loadingOptions) {
        /**
         * Defines the name of the plugin.
         */
        this.name = "obj";
        /**
         * Defines the extension the plugin is able to load.
         */
        this.extensions = ".obj";
        this._assetContainer = null;
        this._loadingOptions = loadingOptions || OBJFileLoader._DefaultLoadingOptions;
    }
    Object.defineProperty(OBJFileLoader, "INVERT_TEXTURE_Y", {
        /**
         * Invert Y-Axis of referenced textures on load
         */
        get: function () {
            return MTLFileLoader.INVERT_TEXTURE_Y;
        },
        set: function (value) {
            MTLFileLoader.INVERT_TEXTURE_Y = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OBJFileLoader, "_DefaultLoadingOptions", {
        get: function () {
            return {
                computeNormals: OBJFileLoader.COMPUTE_NORMALS,
                optimizeNormals: OBJFileLoader.OPTIMIZE_NORMALS,
                importVertexColors: OBJFileLoader.IMPORT_VERTEX_COLORS,
                invertY: OBJFileLoader.INVERT_Y,
                invertTextureY: OBJFileLoader.INVERT_TEXTURE_Y,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                UVScaling: OBJFileLoader.UV_SCALING,
                materialLoadingFailsSilently: OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY,
                optimizeWithUV: OBJFileLoader.OPTIMIZE_WITH_UV,
                skipMaterials: OBJFileLoader.SKIP_MATERIALS,
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Calls synchronously the MTL file attached to this obj.
     * Load function or importMesh function don't enable to load 2 files in the same time asynchronously.
     * Without this function materials are not displayed in the first frame (but displayed after).
     * In consequence it is impossible to get material information in your HTML file
     *
     * @param url The URL of the MTL file
     * @param rootUrl defines where to load data from
     * @param onSuccess Callback function to be called when the MTL file is loaded
     * @param onFailure
     */
    OBJFileLoader.prototype._loadMTL = function (url, rootUrl, onSuccess, onFailure) {
        //The complete path to the mtl file
        var pathOfFile = rootUrl + url;
        // Loads through the babylon tools to allow fileInput search.
        Tools.LoadFile(pathOfFile, onSuccess, undefined, undefined, false, function (request, exception) {
            onFailure(pathOfFile, exception);
        });
    };
    /**
     * Instantiates a OBJ file loader plugin.
     * @returns the created plugin
     */
    OBJFileLoader.prototype.createPlugin = function () {
        return new OBJFileLoader(OBJFileLoader._DefaultLoadingOptions);
    };
    /**
     * If the data string can be loaded directly.
     * @returns if the data can be loaded directly
     */
    OBJFileLoader.prototype.canDirectLoad = function () {
        return false;
    };
    /**
     * Imports one or more meshes from the loaded OBJ data and adds them to the scene
     * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
     * @param scene the scene the meshes should be added to
     * @param data the OBJ data to load
     * @param rootUrl root url to load from
     * @returns a promise containing the loaded meshes, particles, skeletons and animations
     */
    OBJFileLoader.prototype.importMeshAsync = function (meshesNames, scene, data, rootUrl) {
        //get the meshes from OBJ file
        return this._parseSolid(meshesNames, scene, data, rootUrl).then(function (meshes) {
            return {
                meshes: meshes,
                particleSystems: [],
                skeletons: [],
                animationGroups: [],
                transformNodes: [],
                geometries: [],
                lights: [],
            };
        });
    };
    /**
     * Imports all objects from the loaded OBJ data and adds them to the scene
     * @param scene the scene the objects should be added to
     * @param data the OBJ data to load
     * @param rootUrl root url to load from
     * @returns a promise which completes when objects have been loaded to the scene
     */
    OBJFileLoader.prototype.loadAsync = function (scene, data, rootUrl) {
        //Get the 3D model
        return this.importMeshAsync(null, scene, data, rootUrl).then(function () {
            // return void
        });
    };
    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @returns The loaded asset container
     */
    OBJFileLoader.prototype.loadAssetContainerAsync = function (scene, data, rootUrl) {
        var _this = this;
        var container = new AssetContainer(scene);
        this._assetContainer = container;
        return this.importMeshAsync(null, scene, data, rootUrl)
            .then(function (result) {
            result.meshes.forEach(function (mesh) { return container.meshes.push(mesh); });
            result.meshes.forEach(function (mesh) {
                var material = mesh.material;
                if (material) {
                    // Materials
                    if (container.materials.indexOf(material) == -1) {
                        container.materials.push(material);
                        // Textures
                        var textures = material.getActiveTextures();
                        textures.forEach(function (t) {
                            if (container.textures.indexOf(t) == -1) {
                                container.textures.push(t);
                            }
                        });
                    }
                }
            });
            _this._assetContainer = null;
            return container;
        })
            .catch(function (ex) {
            _this._assetContainer = null;
            throw ex;
        });
    };
    /**
     * Read the OBJ file and create an Array of meshes.
     * Each mesh contains all information given by the OBJ and the MTL file.
     * i.e. vertices positions and indices, optional normals values, optional UV values, optional material
     * @param meshesNames defines a string or array of strings of the mesh names that should be loaded from the file
     * @param scene defines the scene where are displayed the data
     * @param data defines the content of the obj file
     * @param rootUrl defines the path to the folder
     * @returns the list of loaded meshes
     */
    OBJFileLoader.prototype._parseSolid = function (meshesNames, scene, data, rootUrl) {
        var _this = this;
        var fileToLoad = ""; //The name of the mtlFile to load
        var materialsFromMTLFile = new MTLFileLoader();
        var materialToUse = new Array();
        var babylonMeshesArray = []; //The mesh for babylon
        // Main function
        var solidParser = new SolidParser(materialToUse, babylonMeshesArray, this._loadingOptions);
        solidParser.parse(meshesNames, data, scene, this._assetContainer, function (fileName) {
            fileToLoad = fileName;
        });
        // load the materials
        var mtlPromises = [];
        // Check if we have a file to load
        if (fileToLoad !== "" && !this._loadingOptions.skipMaterials) {
            //Load the file synchronously
            mtlPromises.push(new Promise(function (resolve, reject) {
                _this._loadMTL(fileToLoad, rootUrl, function (dataLoaded) {
                    try {
                        //Create materials thanks MTLLoader function
                        materialsFromMTLFile.parseMTL(scene, dataLoaded, rootUrl, _this._assetContainer);
                        //Look at each material loaded in the mtl file
                        for (var n = 0; n < materialsFromMTLFile.materials.length; n++) {
                            //Three variables to get all meshes with the same material
                            var startIndex = 0;
                            var _indices = [];
                            var _index = void 0;
                            //The material from MTL file is used in the meshes loaded
                            //Push the indice in an array
                            //Check if the material is not used for another mesh
                            while ((_index = materialToUse.indexOf(materialsFromMTLFile.materials[n].name, startIndex)) > -1) {
                                _indices.push(_index);
                                startIndex = _index + 1;
                            }
                            //If the material is not used dispose it
                            if (_index === -1 && _indices.length === 0) {
                                //If the material is not needed, remove it
                                materialsFromMTLFile.materials[n].dispose();
                            }
                            else {
                                for (var o = 0; o < _indices.length; o++) {
                                    //Apply the material to the Mesh for each mesh with the material
                                    var mesh = babylonMeshesArray[_indices[o]];
                                    var material = materialsFromMTLFile.materials[n];
                                    mesh.material = material;
                                    if (!mesh.getTotalIndices()) {
                                        // No indices, we need to turn on point cloud
                                        material.pointsCloud = true;
                                    }
                                }
                            }
                        }
                        resolve();
                    }
                    catch (e) {
                        Tools.Warn("Error processing MTL file: '".concat(fileToLoad, "'"));
                        if (_this._loadingOptions.materialLoadingFailsSilently) {
                            resolve();
                        }
                        else {
                            reject(e);
                        }
                    }
                }, function (pathOfFile, exception) {
                    Tools.Warn("Error downloading MTL file: '".concat(fileToLoad, "'"));
                    if (_this._loadingOptions.materialLoadingFailsSilently) {
                        resolve();
                    }
                    else {
                        reject(exception);
                    }
                });
            }));
        }
        //Return an array with all Mesh
        return Promise.all(mtlPromises).then(function () {
            return babylonMeshesArray;
        });
    };
    /**
     * Defines if UVs are optimized by default during load.
     */
    OBJFileLoader.OPTIMIZE_WITH_UV = true;
    /**
     * Invert model on y-axis (does a model scaling inversion)
     */
    OBJFileLoader.INVERT_Y = false;
    /**
     * Include in meshes the vertex colors available in some OBJ files.  This is not part of OBJ standard.
     */
    OBJFileLoader.IMPORT_VERTEX_COLORS = false;
    /**
     * Compute the normals for the model, even if normals are present in the file.
     */
    OBJFileLoader.COMPUTE_NORMALS = false;
    /**
     * Optimize the normals for the model. Lighting can be uneven if you use OptimizeWithUV = true because new vertices can be created for the same location if they pertain to different faces.
     * Using OptimizehNormals = true will help smoothing the lighting by averaging the normals of those vertices.
     */
    OBJFileLoader.OPTIMIZE_NORMALS = false;
    /**
     * Defines custom scaling of UV coordinates of loaded meshes.
     */
    OBJFileLoader.UV_SCALING = new Vector2(1, 1);
    /**
     * Skip loading the materials even if defined in the OBJ file (materials are ignored).
     */
    OBJFileLoader.SKIP_MATERIALS = false;
    /**
     * When a material fails to load OBJ loader will silently fail and onSuccess() callback will be triggered.
     *
     * Defaults to true for backwards compatibility.
     */
    OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = true;
    return OBJFileLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'OBJFileLoader', { enumerable: true, configurable: true, get: function() { return OBJFileLoader; } });
if (SceneLoader) {
    //Add this loader into the register plugin
    SceneLoader.RegisterPlugin(new OBJFileLoader());
}
//# sourceMappingURL=objFileLoader.js.map
}, function(modId) { var map = {"./mtlFileLoader.js":1661401224784,"./solidParser.js":1661401224786}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224788, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./stlFileLoader.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./stlFileLoader.js":1661401224789}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1661401224789, function(require, module, exports) {
var __TEMP__ = require('@babylonjs/core/Misc/tools.js');var Tools = __TEMP__['Tools'];
var __TEMP__ = require('@babylonjs/core/Buffers/buffer.js');var VertexBuffer = __TEMP__['VertexBuffer'];
var __TEMP__ = require('@babylonjs/core/Meshes/mesh.js');var Mesh = __TEMP__['Mesh'];
var __TEMP__ = require('@babylonjs/core/Loading/sceneLoader.js');var SceneLoader = __TEMP__['SceneLoader'];
var __TEMP__ = require('@babylonjs/core/assetContainer.js');var AssetContainer = __TEMP__['AssetContainer'];
/**
 * STL file type loader.
 * This is a babylon scene loader plugin.
 */
var STLFileLoader = /** @class */ (function () {
    function STLFileLoader() {
        /** @hidden */
        this.solidPattern = /solid (\S*)([\S\s]*?)endsolid[ ]*(\S*)/g;
        /** @hidden */
        this.facetsPattern = /facet([\s\S]*?)endfacet/g;
        /** @hidden */
        this.normalPattern = /normal[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
        /** @hidden */
        this.vertexPattern = /vertex[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
        /**
         * Defines the name of the plugin.
         */
        this.name = "stl";
        /**
         * Defines the extensions the stl loader is able to load.
         * force data to come in as an ArrayBuffer
         * we'll convert to string if it looks like it's an ASCII .stl
         */
        this.extensions = {
            ".stl": { isBinary: true },
        };
    }
    /**
     * Import meshes into a scene.
     * @param meshesNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param scene The scene to import into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param meshes The meshes array to import into
     * @returns True if successful or false otherwise
     */
    STLFileLoader.prototype.importMesh = function (meshesNames, scene, data, rootUrl, meshes) {
        var matches;
        if (typeof data !== "string") {
            if (this._isBinary(data)) {
                // binary .stl
                var babylonMesh = new Mesh("stlmesh", scene);
                this._parseBinary(babylonMesh, data);
                if (meshes) {
                    meshes.push(babylonMesh);
                }
                return true;
            }
            // ASCII .stl
            // convert to string
            var array_buffer = new Uint8Array(data);
            var str = "";
            for (var i = 0; i < data.byteLength; i++) {
                str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
            }
            data = str;
        }
        //if arrived here, data is a string, containing the STLA data.
        while ((matches = this.solidPattern.exec(data))) {
            var meshName = matches[1];
            var meshNameFromEnd = matches[3];
            if (meshName != meshNameFromEnd) {
                Tools.Error("Error in STL, solid name != endsolid name");
                return false;
            }
            // check meshesNames
            if (meshesNames && meshName) {
                if (meshesNames instanceof Array) {
                    if (!meshesNames.indexOf(meshName)) {
                        continue;
                    }
                }
                else {
                    if (meshName !== meshesNames) {
                        continue;
                    }
                }
            }
            // stl mesh name can be empty as well
            meshName = meshName || "stlmesh";
            var babylonMesh = new Mesh(meshName, scene);
            this._parseASCII(babylonMesh, matches[2]);
            if (meshes) {
                meshes.push(babylonMesh);
            }
        }
        return true;
    };
    /**
     * Load into a scene.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @returns true if successful or false otherwise
     */
    STLFileLoader.prototype.load = function (scene, data, rootUrl) {
        var result = this.importMesh(null, scene, data, rootUrl, null);
        return result;
    };
    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @returns The loaded asset container
     */
    STLFileLoader.prototype.loadAssetContainer = function (scene, data, rootUrl) {
        var container = new AssetContainer(scene);
        scene._blockEntityCollection = true;
        this.importMesh(null, scene, data, rootUrl, container.meshes);
        scene._blockEntityCollection = false;
        return container;
    };
    STLFileLoader.prototype._isBinary = function (data) {
        // check if file size is correct for binary stl
        var reader = new DataView(data);
        // A Binary STL header is 80 bytes, if the data size is not great than
        // that then it's not a binary STL.
        if (reader.byteLength <= 80) {
            return false;
        }
        var faceSize = (32 / 8) * 3 + (32 / 8) * 3 * 3 + 16 / 8;
        var nFaces = reader.getUint32(80, true);
        if (80 + 32 / 8 + nFaces * faceSize === reader.byteLength) {
            return true;
        }
        // check characters higher than ASCII to confirm binary
        var fileLength = reader.byteLength;
        for (var index = 0; index < fileLength; index++) {
            if (reader.getUint8(index) > 127) {
                return true;
            }
        }
        return false;
    };
    STLFileLoader.prototype._parseBinary = function (mesh, data) {
        var reader = new DataView(data);
        var faces = reader.getUint32(80, true);
        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var offset = 0;
        var positions = new Float32Array(faces * 3 * 3);
        var normals = new Float32Array(faces * 3 * 3);
        var indices = new Uint32Array(faces * 3);
        var indicesCount = 0;
        for (var face = 0; face < faces; face++) {
            var start = dataOffset + face * faceLength;
            var normalX = reader.getFloat32(start, true);
            var normalY = reader.getFloat32(start + 4, true);
            var normalZ = reader.getFloat32(start + 8, true);
            for (var i = 1; i <= 3; i++) {
                var vertexstart = start + i * 12;
                // ordering is intentional to match ascii import
                positions[offset] = reader.getFloat32(vertexstart, true);
                normals[offset] = normalX;
                if (!STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
                    positions[offset + 2] = reader.getFloat32(vertexstart + 4, true);
                    positions[offset + 1] = reader.getFloat32(vertexstart + 8, true);
                    normals[offset + 2] = normalY;
                    normals[offset + 1] = normalZ;
                }
                else {
                    positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);
                    positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);
                    normals[offset + 1] = normalY;
                    normals[offset + 2] = normalZ;
                }
                offset += 3;
            }
            indices[indicesCount] = indicesCount++;
            indices[indicesCount] = indicesCount++;
            indices[indicesCount] = indicesCount++;
        }
        mesh.setVerticesData(VertexBuffer.PositionKind, positions);
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
        mesh.setIndices(indices);
        mesh.computeWorldMatrix(true);
    };
    STLFileLoader.prototype._parseASCII = function (mesh, solidData) {
        var positions = [];
        var normals = [];
        var indices = [];
        var indicesCount = 0;
        //load facets, ignoring loop as the standard doesn't define it can contain more than vertices
        var matches;
        while ((matches = this.facetsPattern.exec(solidData))) {
            var facet = matches[1];
            //one normal per face
            var normalMatches = this.normalPattern.exec(facet);
            this.normalPattern.lastIndex = 0;
            if (!normalMatches) {
                continue;
            }
            var normal = [Number(normalMatches[1]), Number(normalMatches[5]), Number(normalMatches[3])];
            var vertexMatch = void 0;
            while ((vertexMatch = this.vertexPattern.exec(facet))) {
                if (!STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
                    positions.push(Number(vertexMatch[1]), Number(vertexMatch[5]), Number(vertexMatch[3]));
                    normals.push(normal[0], normal[1], normal[2]);
                }
                else {
                    positions.push(Number(vertexMatch[1]), Number(vertexMatch[3]), Number(vertexMatch[5]));
                    // Flipping the second and third component because inverted
                    // when normal was declared.
                    normals.push(normal[0], normal[2], normal[1]);
                }
            }
            indices.push(indicesCount++, indicesCount++, indicesCount++);
            this.vertexPattern.lastIndex = 0;
        }
        this.facetsPattern.lastIndex = 0;
        mesh.setVerticesData(VertexBuffer.PositionKind, positions);
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
        mesh.setIndices(indices);
        mesh.computeWorldMatrix(true);
    };
    /**
     * Defines if Y and Z axes are swapped or not when loading an STL file.
     * The default is false to maintain backward compatibility. When set to
     * true, coordinates from the STL file are used without change.
     */
    STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = false;
    return STLFileLoader;
}());
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'STLFileLoader', { enumerable: true, configurable: true, get: function() { return STLFileLoader; } });
if (SceneLoader) {
    SceneLoader.RegisterPlugin(new STLFileLoader());
}
//# sourceMappingURL=stlFileLoader.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1661401224741);
})()
//miniprogram-npm-outsideDeps=["@babylonjs/core/Misc/observable.js","@babylonjs/core/Misc/tools.js","@babylonjs/core/Loading/sceneLoader.js","@babylonjs/core/assetContainer.js","@babylonjs/core/Misc/logger.js","@babylonjs/core/Misc/dataReader.js","@babylonjs/core/Misc/fileTools.js","@babylonjs/core/Misc/stringTools.js","@babylonjs/core/Misc/error.js","tslib","@babylonjs/core/Maths/math.vector.js","@babylonjs/core/Maths/math.color.js","@babylonjs/core/Cameras/camera.js","@babylonjs/core/Cameras/freeCamera.js","@babylonjs/core/Animations/animation.js","@babylonjs/core/Bones/bone.js","@babylonjs/core/Bones/skeleton.js","@babylonjs/core/Materials/effect.js","@babylonjs/core/Materials/material.js","@babylonjs/core/Materials/multiMaterial.js","@babylonjs/core/Materials/standardMaterial.js","@babylonjs/core/Materials/shaderMaterial.js","@babylonjs/core/Materials/Textures/texture.js","@babylonjs/core/Meshes/mesh.vertexData.js","@babylonjs/core/Buffers/buffer.js","@babylonjs/core/Meshes/geometry.js","@babylonjs/core/Meshes/subMesh.js","@babylonjs/core/Meshes/abstractMesh.js","@babylonjs/core/Meshes/mesh.js","@babylonjs/core/Lights/hemisphericLight.js","@babylonjs/core/Lights/directionalLight.js","@babylonjs/core/Lights/pointLight.js","@babylonjs/core/Lights/spotLight.js","@babylonjs/core/Engines/constants.js","@babylonjs/core/Misc/deferred.js","@babylonjs/core/Animations/animationGroup.js","@babylonjs/core/Materials/PBR/pbrMaterial.js","@babylonjs/core/Meshes/transformNode.js","@babylonjs/core/Morph/morphTarget.js","@babylonjs/core/Morph/morphTargetManager.js","@babylonjs/core/Animations/animationKey.js","@babylonjs/core/Culling/boundingInfo.js","@babylonjs/core/Maths/math.scalar.js","@babylonjs/core/Maths/sphericalPolynomial.js","@babylonjs/core/Materials/Textures/rawCubeTexture.js","@babylonjs/core/Meshes/thinInstanceMesh.js","@babylonjs/core/Meshes/Compression/meshoptCompression.js","@babylonjs/core/Meshes/Compression/dracoCompression.js","@babylonjs/core/Lights/light.js","@babylonjs/core/Materials/Textures/renderTargetTexture.js","@babylonjs/core/Animations/animationEvent.js","@babylonjs/core/Audio/sound.js","@babylonjs/core/Audio/weightedsound.js"]
//# sourceMappingURL=index.js.map