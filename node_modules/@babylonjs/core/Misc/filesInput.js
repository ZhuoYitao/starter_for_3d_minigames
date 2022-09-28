import { SceneLoader } from "../Loading/sceneLoader.js";
import { Logger } from "../Misc/logger.js";
import { FilesInputStore } from "./filesInputStore.js";
/**
 * Class used to help managing file picking and drag-n-drop
 */
var FilesInput = /** @class */ (function () {
    /**
     * Creates a new FilesInput
     * @param engine defines the rendering engine
     * @param scene defines the hosting scene
     * @param sceneLoadedCallback callback called when scene is loaded
     * @param progressCallback callback called to track progress
     * @param additionalRenderLoopLogicCallback callback called to add user logic to the rendering loop
     * @param textureLoadingCallback callback called when a texture is loading
     * @param startingProcessingFilesCallback callback called when the system is about to process all files
     * @param onReloadCallback callback called when a reload is requested
     * @param errorCallback callback call if an error occurs
     */
    function FilesInput(engine, scene, sceneLoadedCallback, progressCallback, additionalRenderLoopLogicCallback, textureLoadingCallback, startingProcessingFilesCallback, onReloadCallback, errorCallback) {
        var _this = this;
        /**
         * Callback called when a file is processed
         */
        this.onProcessFileCallback = function () {
            return true;
        };
        /**
         * Function used when loading the scene file
         * @param sceneFile
         * @param onProgress
         */
        this.loadAsync = function (sceneFile, onProgress) {
            return SceneLoader.LoadAsync("file:", sceneFile, _this._engine, onProgress);
        };
        this._engine = engine;
        this._currentScene = scene;
        this._sceneLoadedCallback = sceneLoadedCallback;
        this._progressCallback = progressCallback;
        this._additionalRenderLoopLogicCallback = additionalRenderLoopLogicCallback;
        this._textureLoadingCallback = textureLoadingCallback;
        this._startingProcessingFilesCallback = startingProcessingFilesCallback;
        this._onReloadCallback = onReloadCallback;
        this._errorCallback = errorCallback;
    }
    Object.defineProperty(FilesInput, "FilesToLoad", {
        /**
         * List of files ready to be loaded
         */
        get: function () {
            return FilesInputStore.FilesToLoad;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Calls this function to listen to drag'n'drop events on a specific DOM element
     * @param elementToMonitor defines the DOM element to track
     */
    FilesInput.prototype.monitorElementForDragNDrop = function (elementToMonitor) {
        var _this = this;
        if (elementToMonitor) {
            this._elementToMonitor = elementToMonitor;
            this._dragEnterHandler = function (e) {
                _this._drag(e);
            };
            this._dragOverHandler = function (e) {
                _this._drag(e);
            };
            this._dropHandler = function (e) {
                _this._drop(e);
            };
            this._elementToMonitor.addEventListener("dragenter", this._dragEnterHandler, false);
            this._elementToMonitor.addEventListener("dragover", this._dragOverHandler, false);
            this._elementToMonitor.addEventListener("drop", this._dropHandler, false);
        }
    };
    Object.defineProperty(FilesInput.prototype, "filesToLoad", {
        /** Gets the current list of files to load */
        get: function () {
            return this._filesToLoad;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Release all associated resources
     */
    FilesInput.prototype.dispose = function () {
        if (!this._elementToMonitor) {
            return;
        }
        this._elementToMonitor.removeEventListener("dragenter", this._dragEnterHandler);
        this._elementToMonitor.removeEventListener("dragover", this._dragOverHandler);
        this._elementToMonitor.removeEventListener("drop", this._dropHandler);
    };
    FilesInput.prototype._renderFunction = function () {
        if (this._additionalRenderLoopLogicCallback) {
            this._additionalRenderLoopLogicCallback();
        }
        if (this._currentScene) {
            if (this._textureLoadingCallback) {
                var remaining = this._currentScene.getWaitingItemsCount();
                if (remaining > 0) {
                    this._textureLoadingCallback(remaining);
                }
            }
            this._currentScene.render();
        }
    };
    FilesInput.prototype._drag = function (e) {
        e.stopPropagation();
        e.preventDefault();
    };
    FilesInput.prototype._drop = function (eventDrop) {
        eventDrop.stopPropagation();
        eventDrop.preventDefault();
        this.loadFiles(eventDrop);
    };
    FilesInput.prototype._traverseFolder = function (folder, files, remaining, callback) {
        var _this = this;
        var reader = folder.createReader();
        var relativePath = folder.fullPath.replace(/^\//, "").replace(/(.+?)\/?$/, "$1/");
        reader.readEntries(function (entries) {
            remaining.count += entries.length;
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                if (entry.isFile) {
                    entry.file(function (file) {
                        file.correctName = relativePath + file.name;
                        files.push(file);
                        if (--remaining.count === 0) {
                            callback();
                        }
                    });
                }
                else if (entry.isDirectory) {
                    _this._traverseFolder(entry, files, remaining, callback);
                }
            }
            if (--remaining.count === 0) {
                callback();
            }
        });
    };
    FilesInput.prototype._processFiles = function (files) {
        var _this = this;
        for (var i = 0; i < files.length; i++) {
            var name_1 = files[i].correctName.toLowerCase();
            var extension = name_1.split(".").pop();
            if (!this.onProcessFileCallback(files[i], name_1, extension, function (sceneFile) { return (_this._sceneFileToLoad = sceneFile); })) {
                continue;
            }
            if (SceneLoader.IsPluginForExtensionAvailable("." + extension)) {
                this._sceneFileToLoad = files[i];
            }
            FilesInput.FilesToLoad[name_1] = files[i];
        }
    };
    /**
     * Load files from a drop event
     * @param event defines the drop event to use as source
     */
    FilesInput.prototype.loadFiles = function (event) {
        var _this = this;
        // Handling data transfer via drag'n'drop
        if (event && event.dataTransfer && event.dataTransfer.files) {
            this._filesToLoad = event.dataTransfer.files;
        }
        // Handling files from input files
        if (event && event.target && event.target.files) {
            this._filesToLoad = event.target.files;
        }
        if (!this._filesToLoad || this._filesToLoad.length === 0) {
            return;
        }
        if (this._startingProcessingFilesCallback) {
            this._startingProcessingFilesCallback(this._filesToLoad);
        }
        if (this._filesToLoad && this._filesToLoad.length > 0) {
            var files_1 = new Array();
            var folders = [];
            var items = event.dataTransfer ? event.dataTransfer.items : null;
            for (var i = 0; i < this._filesToLoad.length; i++) {
                var fileToLoad = this._filesToLoad[i];
                var name_2 = fileToLoad.name.toLowerCase();
                var entry = void 0;
                fileToLoad.correctName = name_2;
                if (items) {
                    var item = items[i];
                    if (item.getAsEntry) {
                        entry = item.getAsEntry();
                    }
                    else if (item.webkitGetAsEntry) {
                        entry = item.webkitGetAsEntry();
                    }
                }
                if (!entry) {
                    files_1.push(fileToLoad);
                }
                else {
                    if (entry.isDirectory) {
                        folders.push(entry);
                    }
                    else {
                        files_1.push(fileToLoad);
                    }
                }
            }
            if (folders.length === 0) {
                this._processFiles(files_1);
                this._processReload();
            }
            else {
                var remaining_1 = { count: folders.length };
                for (var _i = 0, folders_1 = folders; _i < folders_1.length; _i++) {
                    var folder = folders_1[_i];
                    this._traverseFolder(folder, files_1, remaining_1, function () {
                        _this._processFiles(files_1);
                        if (remaining_1.count === 0) {
                            _this._processReload();
                        }
                    });
                }
            }
        }
    };
    FilesInput.prototype._processReload = function () {
        if (this._onReloadCallback) {
            this._onReloadCallback(this._sceneFileToLoad);
        }
        else {
            this.reload();
        }
    };
    /**
     * Reload the current scene from the loaded files
     */
    FilesInput.prototype.reload = function () {
        var _this = this;
        // If a scene file has been provided
        if (this._sceneFileToLoad) {
            if (this._currentScene) {
                if (Logger.errorsCount > 0) {
                    Logger.ClearLogCache();
                }
                this._engine.stopRenderLoop();
            }
            SceneLoader.ShowLoadingScreen = false;
            this._engine.displayLoadingUI();
            this.loadAsync(this._sceneFileToLoad, this._progressCallback)
                .then(function (scene) {
                if (_this._currentScene) {
                    _this._currentScene.dispose();
                }
                _this._currentScene = scene;
                if (_this._sceneLoadedCallback) {
                    _this._sceneLoadedCallback(_this._sceneFileToLoad, _this._currentScene);
                }
                // Wait for textures and shaders to be ready
                _this._currentScene.executeWhenReady(function () {
                    _this._engine.hideLoadingUI();
                    _this._engine.runRenderLoop(function () {
                        _this._renderFunction();
                    });
                });
            })
                .catch(function (error) {
                _this._engine.hideLoadingUI();
                if (_this._errorCallback) {
                    _this._errorCallback(_this._sceneFileToLoad, _this._currentScene, error.message);
                }
            });
        }
        else {
            Logger.Error("Please provide a valid .babylon file.");
        }
    };
    return FilesInput;
}());
export { FilesInput };
//# sourceMappingURL=filesInput.js.map