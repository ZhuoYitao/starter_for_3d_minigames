import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { Scene } from "../scene.js";
import { Engine } from "../Engines/engine.js";
import { EngineStore } from "../Engines/engineStore.js";
import { Logger } from "../Misc/logger.js";

import { SceneLoaderFlags } from "./sceneLoaderFlags.js";
import { IsBase64DataUrl } from "../Misc/fileTools.js";
import { StartsWith } from "../Misc/stringTools.js";
import { RuntimeError, ErrorCodes } from "../Misc/error.js";
/**
 * Mode that determines how to handle old animation groups before loading new ones.
 */
export var SceneLoaderAnimationGroupLoadingMode;
(function (SceneLoaderAnimationGroupLoadingMode) {
    /**
     * Reset all old animations to initial state then dispose them.
     */
    SceneLoaderAnimationGroupLoadingMode[SceneLoaderAnimationGroupLoadingMode["Clean"] = 0] = "Clean";
    /**
     * Stop all old animations.
     */
    SceneLoaderAnimationGroupLoadingMode[SceneLoaderAnimationGroupLoadingMode["Stop"] = 1] = "Stop";
    /**
     * Restart old animations from first frame.
     */
    SceneLoaderAnimationGroupLoadingMode[SceneLoaderAnimationGroupLoadingMode["Sync"] = 2] = "Sync";
    /**
     * Old animations remains untouched.
     */
    SceneLoaderAnimationGroupLoadingMode[SceneLoaderAnimationGroupLoadingMode["NoSync"] = 3] = "NoSync";
})(SceneLoaderAnimationGroupLoadingMode || (SceneLoaderAnimationGroupLoadingMode = {}));
/**
 * Class used to load scene from various file formats using registered plugins
 * @see https://doc.babylonjs.com/how_to/load_from_any_file_type
 */
var SceneLoader = /** @class */ (function () {
    function SceneLoader() {
    }
    Object.defineProperty(SceneLoader, "ForceFullSceneLoadingForIncremental", {
        /**
         * Gets or sets a boolean indicating if entire scene must be loaded even if scene contains incremental data
         */
        get: function () {
            return SceneLoaderFlags.ForceFullSceneLoadingForIncremental;
        },
        set: function (value) {
            SceneLoaderFlags.ForceFullSceneLoadingForIncremental = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "ShowLoadingScreen", {
        /**
         * Gets or sets a boolean indicating if loading screen must be displayed while loading a scene
         */
        get: function () {
            return SceneLoaderFlags.ShowLoadingScreen;
        },
        set: function (value) {
            SceneLoaderFlags.ShowLoadingScreen = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "loggingLevel", {
        /**
         * Defines the current logging level (while loading the scene)
         * @ignorenaming
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return SceneLoaderFlags.loggingLevel;
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        set: function (value) {
            SceneLoaderFlags.loggingLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "CleanBoneMatrixWeights", {
        /**
         * Gets or set a boolean indicating if matrix weights must be cleaned upon loading
         */
        get: function () {
            return SceneLoaderFlags.CleanBoneMatrixWeights;
        },
        set: function (value) {
            SceneLoaderFlags.CleanBoneMatrixWeights = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the default plugin (used to load Babylon files)
     * @returns the .babylon plugin
     */
    SceneLoader.GetDefaultPlugin = function () {
        return SceneLoader._RegisteredPlugins[".babylon"];
    };
    SceneLoader._GetPluginForExtension = function (extension) {
        var registeredPlugin = SceneLoader._RegisteredPlugins[extension];
        if (registeredPlugin) {
            return registeredPlugin;
        }
        Logger.Warn("Unable to find a plugin to load " +
            extension +
            " files. Trying to use .babylon default plugin. To load from a specific filetype (eg. gltf) see: https://doc.babylonjs.com/how_to/load_from_any_file_type");
        return SceneLoader.GetDefaultPlugin();
    };
    SceneLoader._GetPluginForDirectLoad = function (data) {
        for (var extension in SceneLoader._RegisteredPlugins) {
            var plugin = SceneLoader._RegisteredPlugins[extension].plugin;
            if (plugin.canDirectLoad && plugin.canDirectLoad(data)) {
                return SceneLoader._RegisteredPlugins[extension];
            }
        }
        return SceneLoader.GetDefaultPlugin();
    };
    SceneLoader._GetPluginForFilename = function (sceneFilename) {
        var queryStringPosition = sceneFilename.indexOf("?");
        if (queryStringPosition !== -1) {
            sceneFilename = sceneFilename.substring(0, queryStringPosition);
        }
        var dotPosition = sceneFilename.lastIndexOf(".");
        var extension = sceneFilename.substring(dotPosition, sceneFilename.length).toLowerCase();
        return SceneLoader._GetPluginForExtension(extension);
    };
    SceneLoader._GetDirectLoad = function (sceneFilename) {
        if (sceneFilename.substr(0, 5) === "data:") {
            return sceneFilename.substr(5);
        }
        return null;
    };
    SceneLoader._FormatErrorMessage = function (fileInfo, message, exception) {
        var errorMessage = "Unable to load from " + fileInfo.url;
        if (message) {
            errorMessage += ": ".concat(message);
        }
        else if (exception) {
            errorMessage += ": ".concat(exception);
        }
        return errorMessage;
    };
    SceneLoader._LoadData = function (fileInfo, scene, onSuccess, onProgress, onError, onDispose, pluginExtension) {
        var directLoad = SceneLoader._GetDirectLoad(fileInfo.url);
        var registeredPlugin = pluginExtension
            ? SceneLoader._GetPluginForExtension(pluginExtension)
            : directLoad
                ? SceneLoader._GetPluginForDirectLoad(fileInfo.url)
                : SceneLoader._GetPluginForFilename(fileInfo.url);
        var plugin;
        if (registeredPlugin.plugin.createPlugin !== undefined) {
            plugin = registeredPlugin.plugin.createPlugin();
        }
        else {
            plugin = registeredPlugin.plugin;
        }
        if (!plugin) {
            throw "The loader plugin corresponding to the file type you are trying to load has not been found. If using es6, please import the plugin you wish to use before.";
        }
        SceneLoader.OnPluginActivatedObservable.notifyObservers(plugin);
        // Check if we have a direct load url. If the plugin is registered to handle
        // it or it's not a base64 data url, then pass it through the direct load path.
        if (directLoad && ((plugin.canDirectLoad && plugin.canDirectLoad(fileInfo.url)) || !IsBase64DataUrl(fileInfo.url))) {
            if (plugin.directLoad) {
                var result = plugin.directLoad(scene, directLoad);
                if (result.then) {
                    result
                        .then(function (data) {
                        onSuccess(plugin, data);
                    })
                        .catch(function (error) {
                        onError("Error in directLoad of _loadData: " + error, error);
                    });
                }
                else {
                    onSuccess(plugin, result);
                }
            }
            else {
                onSuccess(plugin, directLoad);
            }
            return plugin;
        }
        var useArrayBuffer = registeredPlugin.isBinary;
        var dataCallback = function (data, responseURL) {
            if (scene.isDisposed) {
                onError("Scene has been disposed");
                return;
            }
            onSuccess(plugin, data, responseURL);
        };
        var request = null;
        var pluginDisposed = false;
        var onDisposeObservable = plugin.onDisposeObservable;
        if (onDisposeObservable) {
            onDisposeObservable.add(function () {
                pluginDisposed = true;
                if (request) {
                    request.abort();
                    request = null;
                }
                onDispose();
            });
        }
        var manifestChecked = function () {
            if (pluginDisposed) {
                return;
            }
            var errorCallback = function (request, exception) {
                onError(request === null || request === void 0 ? void 0 : request.statusText, exception);
            };
            var fileOrUrl = fileInfo.file || fileInfo.url;
            request = plugin.loadFile
                ? plugin.loadFile(scene, fileOrUrl, dataCallback, onProgress, useArrayBuffer, errorCallback)
                : scene._loadFile(fileOrUrl, dataCallback, onProgress, true, useArrayBuffer, errorCallback);
        };
        var engine = scene.getEngine();
        var canUseOfflineSupport = engine.enableOfflineSupport;
        if (canUseOfflineSupport) {
            // Also check for exceptions
            var exceptionFound = false;
            for (var _i = 0, _a = scene.disableOfflineSupportExceptionRules; _i < _a.length; _i++) {
                var regex = _a[_i];
                if (regex.test(fileInfo.url)) {
                    exceptionFound = true;
                    break;
                }
            }
            canUseOfflineSupport = !exceptionFound;
        }
        if (canUseOfflineSupport && Engine.OfflineProviderFactory) {
            // Checking if a manifest file has been set for this scene and if offline mode has been requested
            scene.offlineProvider = Engine.OfflineProviderFactory(fileInfo.url, manifestChecked, engine.disableManifestCheck);
        }
        else {
            manifestChecked();
        }
        return plugin;
    };
    SceneLoader._GetFileInfo = function (rootUrl, sceneFilename) {
        var url;
        var name;
        var file = null;
        if (!sceneFilename) {
            url = rootUrl;
            name = Tools.GetFilename(rootUrl);
            rootUrl = Tools.GetFolderPath(rootUrl);
        }
        else if (sceneFilename.name) {
            var sceneFile = sceneFilename;
            url = "file:".concat(sceneFile.name);
            name = sceneFile.name;
            file = sceneFile;
        }
        else if (typeof sceneFilename === "string" && StartsWith(sceneFilename, "data:")) {
            url = sceneFilename;
            name = "";
        }
        else {
            var filename = sceneFilename;
            if (filename.substr(0, 1) === "/") {
                Tools.Error("Wrong sceneFilename parameter");
                return null;
            }
            url = rootUrl + filename;
            name = filename;
        }
        return {
            url: url,
            rootUrl: rootUrl,
            name: name,
            file: file,
        };
    };
    // Public functions
    /**
     * Gets a plugin that can load the given extension
     * @param extension defines the extension to load
     * @returns a plugin or null if none works
     */
    SceneLoader.GetPluginForExtension = function (extension) {
        return SceneLoader._GetPluginForExtension(extension).plugin;
    };
    /**
     * Gets a boolean indicating that the given extension can be loaded
     * @param extension defines the extension to load
     * @returns true if the extension is supported
     */
    SceneLoader.IsPluginForExtensionAvailable = function (extension) {
        return !!SceneLoader._RegisteredPlugins[extension];
    };
    /**
     * Adds a new plugin to the list of registered plugins
     * @param plugin defines the plugin to add
     */
    SceneLoader.RegisterPlugin = function (plugin) {
        if (typeof plugin.extensions === "string") {
            var extension = plugin.extensions;
            SceneLoader._RegisteredPlugins[extension.toLowerCase()] = {
                plugin: plugin,
                isBinary: false,
            };
        }
        else {
            var extensions_1 = plugin.extensions;
            Object.keys(extensions_1).forEach(function (extension) {
                SceneLoader._RegisteredPlugins[extension.toLowerCase()] = {
                    plugin: plugin,
                    isBinary: extensions_1[extension].isBinary,
                };
            });
        }
    };
    /**
     * Import meshes into a scene
     * @param meshNames an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene the instance of BABYLON.Scene to append to
     * @param onSuccess a callback with a list of imported meshes, particleSystems, skeletons, and animationGroups when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.ImportMesh = function (meshNames, rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to import mesh to");
            return null;
        }
        var fileInfo = SceneLoader._GetFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
        };
        var errorHandler = function (message, exception) {
            var errorMessage = SceneLoader._FormatErrorMessage(fileInfo, message, exception);
            if (onError) {
                onError(scene, errorMessage, new RuntimeError(errorMessage, ErrorCodes.SceneLoaderError, exception));
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress
            ? function (event) {
                try {
                    onProgress(event);
                }
                catch (e) {
                    errorHandler("Error in onProgress callback: " + e, e);
                }
            }
            : undefined;
        var successHandler = function (meshes, particleSystems, skeletons, animationGroups, transformNodes, geometries, lights) {
            scene.importedMeshesFiles.push(fileInfo.url);
            if (onSuccess) {
                try {
                    onSuccess(meshes, particleSystems, skeletons, animationGroups, transformNodes, geometries, lights);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback: " + e, e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._LoadData(fileInfo, scene, function (plugin, data, responseURL) {
            if (plugin.rewriteRootURL) {
                fileInfo.rootUrl = plugin.rewriteRootURL(fileInfo.rootUrl, responseURL);
            }
            if (plugin.importMesh) {
                var syncedPlugin = plugin;
                var meshes = new Array();
                var particleSystems = new Array();
                var skeletons = new Array();
                if (!syncedPlugin.importMesh(meshNames, scene, data, fileInfo.rootUrl, meshes, particleSystems, skeletons, errorHandler)) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler(meshes, particleSystems, skeletons, [], [], [], []);
            }
            else {
                var asyncedPlugin = plugin;
                asyncedPlugin
                    .importMeshAsync(meshNames, scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name)
                    .then(function (result) {
                    scene.loadingPluginName = plugin.name;
                    successHandler(result.meshes, result.particleSystems, result.skeletons, result.animationGroups, result.transformNodes, result.geometries, result.lights);
                })
                    .catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Import meshes into a scene
     * @param meshNames an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene the instance of BABYLON.Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded list of imported meshes, particle systems, skeletons, and animation groups
     */
    SceneLoader.ImportMeshAsync = function (meshNames, rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.ImportMesh(meshNames, rootUrl, sceneFilename, scene, function (meshes, particleSystems, skeletons, animationGroups, transformNodes, geometries, lights) {
                resolve({
                    meshes: meshes,
                    particleSystems: particleSystems,
                    skeletons: skeletons,
                    animationGroups: animationGroups,
                    transformNodes: transformNodes,
                    geometries: geometries,
                    lights: lights,
                });
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Load a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param engine is the instance of BABYLON.Engine to use to create the scene
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.Load = function (rootUrl, sceneFilename, engine, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (engine === void 0) { engine = EngineStore.LastCreatedEngine; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!engine) {
            Tools.Error("No engine available");
            return null;
        }
        return SceneLoader.Append(rootUrl, sceneFilename, new Scene(engine), onSuccess, onProgress, onError, pluginExtension);
    };
    /**
     * Load a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param engine is the instance of BABYLON.Engine to use to create the scene
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded scene
     */
    SceneLoader.LoadAsync = function (rootUrl, sceneFilename, engine, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (engine === void 0) { engine = EngineStore.LastCreatedEngine; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.Load(rootUrl, sceneFilename, engine, function (scene) {
                resolve(scene);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Append a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.Append = function (rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        var _this = this;
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to append to");
            return null;
        }
        var fileInfo = SceneLoader._GetFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        if (SceneLoader.ShowLoadingScreen && !this._ShowingLoadingScreen) {
            this._ShowingLoadingScreen = true;
            scene.getEngine().displayLoadingUI();
            scene.executeWhenReady(function () {
                scene.getEngine().hideLoadingUI();
                _this._ShowingLoadingScreen = false;
            });
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
        };
        var errorHandler = function (message, exception) {
            var errorMessage = SceneLoader._FormatErrorMessage(fileInfo, message, exception);
            if (onError) {
                onError(scene, errorMessage, new RuntimeError(errorMessage, ErrorCodes.SceneLoaderError, exception));
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress
            ? function (event) {
                try {
                    onProgress(event);
                }
                catch (e) {
                    errorHandler("Error in onProgress callback", e);
                }
            }
            : undefined;
        var successHandler = function () {
            if (onSuccess) {
                try {
                    onSuccess(scene);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback", e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._LoadData(fileInfo, scene, function (plugin, data) {
            if (plugin.load) {
                var syncedPlugin = plugin;
                if (!syncedPlugin.load(scene, data, fileInfo.rootUrl, errorHandler)) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler();
            }
            else {
                var asyncedPlugin = plugin;
                asyncedPlugin
                    .loadAsync(scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name)
                    .then(function () {
                    scene.loadingPluginName = plugin.name;
                    successHandler();
                })
                    .catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Append a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The given scene
     */
    SceneLoader.AppendAsync = function (rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.Append(rootUrl, sceneFilename, scene, function (scene) {
                resolve(scene);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Load a scene into an asset container
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to (default: last created scene)
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.LoadAssetContainer = function (rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to load asset container to");
            return null;
        }
        var fileInfo = SceneLoader._GetFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
        };
        var errorHandler = function (message, exception) {
            var errorMessage = SceneLoader._FormatErrorMessage(fileInfo, message, exception);
            if (onError) {
                onError(scene, errorMessage, new RuntimeError(errorMessage, ErrorCodes.SceneLoaderError, exception));
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress
            ? function (event) {
                try {
                    onProgress(event);
                }
                catch (e) {
                    errorHandler("Error in onProgress callback", e);
                }
            }
            : undefined;
        var successHandler = function (assets) {
            if (onSuccess) {
                try {
                    onSuccess(assets);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback", e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._LoadData(fileInfo, scene, function (plugin, data) {
            if (plugin.loadAssetContainer) {
                var syncedPlugin = plugin;
                var assetContainer = syncedPlugin.loadAssetContainer(scene, data, fileInfo.rootUrl, errorHandler);
                if (!assetContainer) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler(assetContainer);
            }
            else if (plugin.loadAssetContainerAsync) {
                var asyncedPlugin = plugin;
                asyncedPlugin
                    .loadAssetContainerAsync(scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name)
                    .then(function (assetContainer) {
                    scene.loadingPluginName = plugin.name;
                    successHandler(assetContainer);
                })
                    .catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
            else {
                errorHandler("LoadAssetContainer is not supported by this plugin. Plugin did not provide a loadAssetContainer or loadAssetContainerAsync method.");
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Load a scene into an asset container
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene (default: empty string)
     * @param scene is the instance of Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded asset container
     */
    SceneLoader.LoadAssetContainerAsync = function (rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.LoadAssetContainer(rootUrl, sceneFilename, scene, function (assetContainer) {
                resolve(assetContainer);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Import animations from a file into a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to (default: last created scene)
     * @param overwriteAnimations when true, animations are cleaned before importing new ones. Animations are appended otherwise
     * @param animationGroupLoadingMode defines how to handle old animations groups before importing new ones
     * @param targetConverter defines a function used to convert animation targets from loaded scene to current scene (default: search node by name)
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     */
    SceneLoader.ImportAnimations = function (rootUrl, sceneFilename, scene, overwriteAnimations, animationGroupLoadingMode, targetConverter, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (overwriteAnimations === void 0) { overwriteAnimations = true; }
        if (animationGroupLoadingMode === void 0) { animationGroupLoadingMode = SceneLoaderAnimationGroupLoadingMode.Clean; }
        if (targetConverter === void 0) { targetConverter = null; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to load animations to");
            return;
        }
        if (overwriteAnimations) {
            // Reset, stop and dispose all animations before loading new ones
            for (var _i = 0, _a = scene.animatables; _i < _a.length; _i++) {
                var animatable = _a[_i];
                animatable.reset();
            }
            scene.stopAllAnimations();
            scene.animationGroups.slice().forEach(function (animationGroup) {
                animationGroup.dispose();
            });
            var nodes = scene.getNodes();
            nodes.forEach(function (node) {
                if (node.animations) {
                    node.animations = [];
                }
            });
        }
        else {
            switch (animationGroupLoadingMode) {
                case SceneLoaderAnimationGroupLoadingMode.Clean:
                    scene.animationGroups.slice().forEach(function (animationGroup) {
                        animationGroup.dispose();
                    });
                    break;
                case SceneLoaderAnimationGroupLoadingMode.Stop:
                    scene.animationGroups.forEach(function (animationGroup) {
                        animationGroup.stop();
                    });
                    break;
                case SceneLoaderAnimationGroupLoadingMode.Sync:
                    scene.animationGroups.forEach(function (animationGroup) {
                        animationGroup.reset();
                        animationGroup.restart();
                    });
                    break;
                case SceneLoaderAnimationGroupLoadingMode.NoSync:
                    // nothing to do
                    break;
                default:
                    Logger.Error("Unknown animation group loading mode value '" + animationGroupLoadingMode + "'");
                    return;
            }
        }
        var startingIndexForNewAnimatables = scene.animatables.length;
        var onAssetContainerLoaded = function (container) {
            container.mergeAnimationsTo(scene, scene.animatables.slice(startingIndexForNewAnimatables), targetConverter);
            container.dispose();
            scene.onAnimationFileImportedObservable.notifyObservers(scene);
            if (onSuccess) {
                onSuccess(scene);
            }
        };
        this.LoadAssetContainer(rootUrl, sceneFilename, scene, onAssetContainerLoaded, onProgress, onError, pluginExtension);
    };
    /**
     * Import animations from a file into a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to (default: last created scene)
     * @param overwriteAnimations when true, animations are cleaned before importing new ones. Animations are appended otherwise
     * @param animationGroupLoadingMode defines how to handle old animations groups before importing new ones
     * @param targetConverter defines a function used to convert animation targets from loaded scene to current scene (default: search node by name)
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns the updated scene with imported animations
     */
    SceneLoader.ImportAnimationsAsync = function (rootUrl, sceneFilename, scene, overwriteAnimations, animationGroupLoadingMode, targetConverter, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess, onProgress, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (overwriteAnimations === void 0) { overwriteAnimations = true; }
        if (animationGroupLoadingMode === void 0) { animationGroupLoadingMode = SceneLoaderAnimationGroupLoadingMode.Clean; }
        if (targetConverter === void 0) { targetConverter = null; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.ImportAnimations(rootUrl, sceneFilename, scene, overwriteAnimations, animationGroupLoadingMode, targetConverter, function (_scene) {
                resolve(_scene);
            }, onProgress, function (_scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * No logging while loading
     */
    SceneLoader.NO_LOGGING = 0;
    /**
     * Minimal logging while loading
     */
    SceneLoader.MINIMAL_LOGGING = 1;
    /**
     * Summary logging while loading
     */
    SceneLoader.SUMMARY_LOGGING = 2;
    /**
     * Detailed logging while loading
     */
    SceneLoader.DETAILED_LOGGING = 3;
    // Members
    /**
     * Event raised when a plugin is used to load a scene
     */
    SceneLoader.OnPluginActivatedObservable = new Observable();
    SceneLoader._RegisteredPlugins = {};
    SceneLoader._ShowingLoadingScreen = false;
    return SceneLoader;
}());
export { SceneLoader };
//# sourceMappingURL=sceneLoader.js.map