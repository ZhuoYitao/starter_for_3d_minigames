import { Observable } from "../Misc/observable.js";

import { GetDOMTextContent, IsWindowObjectExist } from "../Misc/domManagement.js";
import { Logger } from "../Misc/logger.js";
import { ShaderProcessor } from "../Engines/Processors/shaderProcessor.js";
import { ShaderStore as EngineShaderStore } from "../Engines/shaderStore.js";
import { ShaderLanguage } from "./shaderLanguage.js";
/**
 * Effect containing vertex and fragment shader that can be executed on an object.
 */
var Effect = /** @class */ (function () {
    /**
     * Instantiates an effect.
     * An effect can be used to create/manage/execute vertex and fragment shaders.
     * @param baseName Name of the effect.
     * @param attributesNamesOrOptions List of attribute names that will be passed to the shader or set of all options to create the effect.
     * @param uniformsNamesOrEngine List of uniform variable names that will be passed to the shader or the engine that will be used to render effect.
     * @param samplers List of sampler variables that will be passed to the shader.
     * @param engine Engine to be used to render the effect
     * @param defines Define statements to be added to the shader.
     * @param fallbacks Possible fallbacks for this effect to improve performance when needed.
     * @param onCompiled Callback that will be called when the shader is compiled.
     * @param onError Callback that will be called if an error occurs during shader compilation.
     * @param indexParameters Parameters to be used with Babylons include syntax to iterate over an array (eg. {lights: 10})
     * @param key Effect Key identifying uniquely compiled shader variants
     * @param shaderLanguage the language the shader is written in (default: GLSL)
     */
    function Effect(baseName, attributesNamesOrOptions, uniformsNamesOrEngine, samplers, engine, defines, fallbacks, onCompiled, onError, indexParameters, key, shaderLanguage) {
        if (samplers === void 0) { samplers = null; }
        if (defines === void 0) { defines = null; }
        if (fallbacks === void 0) { fallbacks = null; }
        if (onCompiled === void 0) { onCompiled = null; }
        if (onError === void 0) { onError = null; }
        if (key === void 0) { key = ""; }
        if (shaderLanguage === void 0) { shaderLanguage = ShaderLanguage.GLSL; }
        var _this = this;
        var _a, _b, _c;
        /**
         * Name of the effect.
         */
        this.name = null;
        /**
         * String container all the define statements that should be set on the shader.
         */
        this.defines = "";
        /**
         * Callback that will be called when the shader is compiled.
         */
        this.onCompiled = null;
        /**
         * Callback that will be called if an error occurs during shader compilation.
         */
        this.onError = null;
        /**
         * Callback that will be called when effect is bound.
         */
        this.onBind = null;
        /**
         * Unique ID of the effect.
         */
        this.uniqueId = 0;
        /**
         * Observable that will be called when the shader is compiled.
         * It is recommended to use executeWhenCompile() or to make sure that scene.isReady() is called to get this observable raised.
         */
        this.onCompileObservable = new Observable();
        /**
         * Observable that will be called if an error occurs during shader compilation.
         */
        this.onErrorObservable = new Observable();
        /** @hidden */
        this._onBindObservable = null;
        /**
         * @hidden
         * Specifies if the effect was previously ready
         */
        this._wasPreviouslyReady = false;
        /** @hidden */
        this._bonesComputationForcedToCPU = false;
        /** @hidden */
        this._uniformBuffersNames = {};
        /** @hidden */
        this._multiTarget = false;
        this._samplers = {};
        this._isReady = false;
        this._compilationError = "";
        this._allFallbacksProcessed = false;
        this._uniforms = {};
        /**
         * Key for the effect.
         * @hidden
         */
        this._key = "";
        this._fallbacks = null;
        this._vertexSourceCodeOverride = "";
        this._fragmentSourceCodeOverride = "";
        this._transformFeedbackVaryings = null;
        /**
         * Compiled shader to webGL program.
         * @hidden
         */
        this._pipelineContext = null;
        /** @hidden */
        this._vertexSourceCode = "";
        /** @hidden */
        this._fragmentSourceCode = "";
        /** @hidden */
        this._rawVertexSourceCode = "";
        /** @hidden */
        this._rawFragmentSourceCode = "";
        this.name = baseName;
        this._key = key;
        var processCodeAfterIncludes = undefined;
        var processFinalCode = null;
        if (attributesNamesOrOptions.attributes) {
            var options = attributesNamesOrOptions;
            this._engine = uniformsNamesOrEngine;
            this._attributesNames = options.attributes;
            this._uniformsNames = options.uniformsNames.concat(options.samplers);
            this._samplerList = options.samplers.slice();
            this.defines = options.defines;
            this.onError = options.onError;
            this.onCompiled = options.onCompiled;
            this._fallbacks = options.fallbacks;
            this._indexParameters = options.indexParameters;
            this._transformFeedbackVaryings = options.transformFeedbackVaryings || null;
            this._multiTarget = !!options.multiTarget;
            this._shaderLanguage = (_a = options.shaderLanguage) !== null && _a !== void 0 ? _a : ShaderLanguage.GLSL;
            if (options.uniformBuffersNames) {
                this._uniformBuffersNamesList = options.uniformBuffersNames.slice();
                for (var i = 0; i < options.uniformBuffersNames.length; i++) {
                    this._uniformBuffersNames[options.uniformBuffersNames[i]] = i;
                }
            }
            processFinalCode = (_b = options.processFinalCode) !== null && _b !== void 0 ? _b : null;
            processCodeAfterIncludes = (_c = options.processCodeAfterIncludes) !== null && _c !== void 0 ? _c : undefined;
        }
        else {
            this._engine = engine;
            this.defines = defines == null ? "" : defines;
            this._uniformsNames = uniformsNamesOrEngine.concat(samplers);
            this._samplerList = samplers ? samplers.slice() : [];
            this._attributesNames = attributesNamesOrOptions;
            this._uniformBuffersNamesList = [];
            this._shaderLanguage = shaderLanguage;
            this.onError = onError;
            this.onCompiled = onCompiled;
            this._indexParameters = indexParameters;
            this._fallbacks = fallbacks;
        }
        this._attributeLocationByName = {};
        this.uniqueId = Effect._UniqueIdSeed++;
        var vertexSource;
        var fragmentSource;
        var hostDocument = IsWindowObjectExist() ? this._engine.getHostDocument() : null;
        if (baseName.vertexSource) {
            vertexSource = "source:" + baseName.vertexSource;
        }
        else if (baseName.vertexElement) {
            vertexSource = hostDocument ? hostDocument.getElementById(baseName.vertexElement) : null;
            if (!vertexSource) {
                vertexSource = baseName.vertexElement;
            }
        }
        else {
            vertexSource = baseName.vertex || baseName;
        }
        if (baseName.fragmentSource) {
            fragmentSource = "source:" + baseName.fragmentSource;
        }
        else if (baseName.fragmentElement) {
            fragmentSource = hostDocument ? hostDocument.getElementById(baseName.fragmentElement) : null;
            if (!fragmentSource) {
                fragmentSource = baseName.fragmentElement;
            }
        }
        else {
            fragmentSource = baseName.fragment || baseName;
        }
        this._processingContext = this._engine._getShaderProcessingContext(this._shaderLanguage);
        var processorOptions = {
            defines: this.defines.split("\n"),
            indexParameters: this._indexParameters,
            isFragment: false,
            shouldUseHighPrecisionShader: this._engine._shouldUseHighPrecisionShader,
            processor: this._engine._getShaderProcessor(this._shaderLanguage),
            supportsUniformBuffers: this._engine.supportsUniformBuffers,
            shadersRepository: EngineShaderStore.GetShadersRepository(this._shaderLanguage),
            includesShadersStore: EngineShaderStore.GetIncludesShadersStore(this._shaderLanguage),
            version: (this._engine.version * 100).toString(),
            platformName: this._engine.shaderPlatformName,
            processingContext: this._processingContext,
            isNDCHalfZRange: this._engine.isNDCHalfZRange,
            useReverseDepthBuffer: this._engine.useReverseDepthBuffer,
            processCodeAfterIncludes: processCodeAfterIncludes,
        };
        var shaderCodes = [undefined, undefined];
        var shadersLoaded = function () {
            if (shaderCodes[0] && shaderCodes[1]) {
                processorOptions.isFragment = true;
                var migratedVertexCode_1 = shaderCodes[0], fragmentCode = shaderCodes[1];
                ShaderProcessor.Process(fragmentCode, processorOptions, function (migratedFragmentCode) {
                    if (processFinalCode) {
                        migratedFragmentCode = processFinalCode("fragment", migratedFragmentCode);
                    }
                    var finalShaders = ShaderProcessor.Finalize(migratedVertexCode_1, migratedFragmentCode, processorOptions);
                    _this._useFinalCode(finalShaders.vertexCode, finalShaders.fragmentCode, baseName);
                }, _this._engine);
            }
        };
        this._loadShader(vertexSource, "Vertex", "", function (vertexCode) {
            ShaderProcessor.Initialize(processorOptions);
            ShaderProcessor.Process(vertexCode, processorOptions, function (migratedVertexCode) {
                _this._rawVertexSourceCode = vertexCode;
                if (processFinalCode) {
                    migratedVertexCode = processFinalCode("vertex", migratedVertexCode);
                }
                shaderCodes[0] = migratedVertexCode;
                shadersLoaded();
            }, _this._engine);
        });
        this._loadShader(fragmentSource, "Fragment", "Pixel", function (fragmentCode) {
            _this._rawFragmentSourceCode = fragmentCode;
            shaderCodes[1] = fragmentCode;
            shadersLoaded();
        });
    }
    Object.defineProperty(Effect, "ShadersRepository", {
        /**
         * Gets or sets the relative url used to load shaders if using the engine in non-minified mode
         */
        get: function () {
            return EngineShaderStore.ShadersRepository;
        },
        set: function (repo) {
            EngineShaderStore.ShadersRepository = repo;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Effect.prototype, "onBindObservable", {
        /**
         * Observable that will be called when effect is bound.
         */
        get: function () {
            if (!this._onBindObservable) {
                this._onBindObservable = new Observable();
            }
            return this._onBindObservable;
        },
        enumerable: false,
        configurable: true
    });
    Effect.prototype._useFinalCode = function (migratedVertexCode, migratedFragmentCode, baseName) {
        if (baseName) {
            var vertex = baseName.vertexElement || baseName.vertex || baseName.spectorName || baseName;
            var fragment = baseName.fragmentElement || baseName.fragment || baseName.spectorName || baseName;
            this._vertexSourceCode = (this._shaderLanguage === ShaderLanguage.WGSL ? "//" : "") + "#define SHADER_NAME vertex:" + vertex + "\n" + migratedVertexCode;
            this._fragmentSourceCode = (this._shaderLanguage === ShaderLanguage.WGSL ? "//" : "") + "#define SHADER_NAME fragment:" + fragment + "\n" + migratedFragmentCode;
        }
        else {
            this._vertexSourceCode = migratedVertexCode;
            this._fragmentSourceCode = migratedFragmentCode;
        }
        this._prepareEffect();
    };
    Object.defineProperty(Effect.prototype, "key", {
        /**
         * Unique key for this effect
         */
        get: function () {
            return this._key;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If the effect has been compiled and prepared.
     * @returns if the effect is compiled and prepared.
     */
    Effect.prototype.isReady = function () {
        try {
            return this._isReadyInternal();
        }
        catch (_a) {
            return false;
        }
    };
    Effect.prototype._isReadyInternal = function () {
        if (this._isReady) {
            return true;
        }
        if (this._pipelineContext) {
            return this._pipelineContext.isReady;
        }
        return false;
    };
    /**
     * The engine the effect was initialized with.
     * @returns the engine.
     */
    Effect.prototype.getEngine = function () {
        return this._engine;
    };
    /**
     * The pipeline context for this effect
     * @returns the associated pipeline context
     */
    Effect.prototype.getPipelineContext = function () {
        return this._pipelineContext;
    };
    /**
     * The set of names of attribute variables for the shader.
     * @returns An array of attribute names.
     */
    Effect.prototype.getAttributesNames = function () {
        return this._attributesNames;
    };
    /**
     * Returns the attribute at the given index.
     * @param index The index of the attribute.
     * @returns The location of the attribute.
     */
    Effect.prototype.getAttributeLocation = function (index) {
        return this._attributes[index];
    };
    /**
     * Returns the attribute based on the name of the variable.
     * @param name of the attribute to look up.
     * @returns the attribute location.
     */
    Effect.prototype.getAttributeLocationByName = function (name) {
        return this._attributeLocationByName[name];
    };
    /**
     * The number of attributes.
     * @returns the number of attributes.
     */
    Effect.prototype.getAttributesCount = function () {
        return this._attributes.length;
    };
    /**
     * Gets the index of a uniform variable.
     * @param uniformName of the uniform to look up.
     * @returns the index.
     */
    Effect.prototype.getUniformIndex = function (uniformName) {
        return this._uniformsNames.indexOf(uniformName);
    };
    /**
     * Returns the attribute based on the name of the variable.
     * @param uniformName of the uniform to look up.
     * @returns the location of the uniform.
     */
    Effect.prototype.getUniform = function (uniformName) {
        return this._uniforms[uniformName];
    };
    /**
     * Returns an array of sampler variable names
     * @returns The array of sampler variable names.
     */
    Effect.prototype.getSamplers = function () {
        return this._samplerList;
    };
    /**
     * Returns an array of uniform variable names
     * @returns The array of uniform variable names.
     */
    Effect.prototype.getUniformNames = function () {
        return this._uniformsNames;
    };
    /**
     * Returns an array of uniform buffer variable names
     * @returns The array of uniform buffer variable names.
     */
    Effect.prototype.getUniformBuffersNames = function () {
        return this._uniformBuffersNamesList;
    };
    /**
     * Returns the index parameters used to create the effect
     * @returns The index parameters object
     */
    Effect.prototype.getIndexParameters = function () {
        return this._indexParameters;
    };
    /**
     * The error from the last compilation.
     * @returns the error string.
     */
    Effect.prototype.getCompilationError = function () {
        return this._compilationError;
    };
    /**
     * Gets a boolean indicating that all fallbacks were used during compilation
     * @returns true if all fallbacks were used
     */
    Effect.prototype.allFallbacksProcessed = function () {
        return this._allFallbacksProcessed;
    };
    /**
     * Adds a callback to the onCompiled observable and call the callback immediately if already ready.
     * @param func The callback to be used.
     */
    Effect.prototype.executeWhenCompiled = function (func) {
        var _this = this;
        if (this.isReady()) {
            func(this);
            return;
        }
        this.onCompileObservable.add(function (effect) {
            func(effect);
        });
        if (!this._pipelineContext || this._pipelineContext.isAsync) {
            setTimeout(function () {
                _this._checkIsReady(null);
            }, 16);
        }
    };
    Effect.prototype._checkIsReady = function (previousPipelineContext) {
        var _this = this;
        try {
            if (this._isReadyInternal()) {
                return;
            }
        }
        catch (e) {
            this._processCompilationErrors(e, previousPipelineContext);
            return;
        }
        setTimeout(function () {
            _this._checkIsReady(previousPipelineContext);
        }, 16);
    };
    Effect.prototype._loadShader = function (shader, key, optionalKey, callback) {
        if (typeof HTMLElement !== "undefined") {
            // DOM element ?
            if (shader instanceof HTMLElement) {
                var shaderCode = GetDOMTextContent(shader);
                callback(shaderCode);
                return;
            }
        }
        // Direct source ?
        if (shader.substr(0, 7) === "source:") {
            callback(shader.substr(7));
            return;
        }
        // Base64 encoded ?
        if (shader.substr(0, 7) === "base64:") {
            var shaderBinary = window.atob(shader.substr(7));
            callback(shaderBinary);
            return;
        }
        var shaderStore = EngineShaderStore.GetShadersStore(this._shaderLanguage);
        // Is in local store ?
        if (shaderStore[shader + key + "Shader"]) {
            callback(shaderStore[shader + key + "Shader"]);
            return;
        }
        if (optionalKey && shaderStore[shader + optionalKey + "Shader"]) {
            callback(shaderStore[shader + optionalKey + "Shader"]);
            return;
        }
        var shaderUrl;
        if (shader[0] === "." || shader[0] === "/" || shader.indexOf("http") > -1) {
            shaderUrl = shader;
        }
        else {
            shaderUrl = EngineShaderStore.GetShadersRepository(this._shaderLanguage) + shader;
        }
        // Vertex shader
        this._engine._loadFile(shaderUrl + "." + key.toLowerCase() + ".fx", callback);
    };
    Object.defineProperty(Effect.prototype, "vertexSourceCode", {
        /**
         * Gets the vertex shader source code of this effect
         */
        get: function () {
            var _a, _b;
            return this._vertexSourceCodeOverride && this._fragmentSourceCodeOverride
                ? this._vertexSourceCodeOverride
                : (_b = (_a = this._pipelineContext) === null || _a === void 0 ? void 0 : _a._getVertexShaderCode()) !== null && _b !== void 0 ? _b : this._vertexSourceCode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Effect.prototype, "fragmentSourceCode", {
        /**
         * Gets the fragment shader source code of this effect
         */
        get: function () {
            var _a, _b;
            return this._vertexSourceCodeOverride && this._fragmentSourceCodeOverride
                ? this._fragmentSourceCodeOverride
                : (_b = (_a = this._pipelineContext) === null || _a === void 0 ? void 0 : _a._getFragmentShaderCode()) !== null && _b !== void 0 ? _b : this._fragmentSourceCode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Effect.prototype, "rawVertexSourceCode", {
        /**
         * Gets the vertex shader source code before it has been processed by the preprocessor
         */
        get: function () {
            return this._rawVertexSourceCode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Effect.prototype, "rawFragmentSourceCode", {
        /**
         * Gets the fragment shader source code before it has been processed by the preprocessor
         */
        get: function () {
            return this._rawFragmentSourceCode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Recompiles the webGL program
     * @param vertexSourceCode The source code for the vertex shader.
     * @param fragmentSourceCode The source code for the fragment shader.
     * @param onCompiled Callback called when completed.
     * @param onError Callback called on error.
     * @hidden
     */
    Effect.prototype._rebuildProgram = function (vertexSourceCode, fragmentSourceCode, onCompiled, onError) {
        var _this = this;
        this._isReady = false;
        this._vertexSourceCodeOverride = vertexSourceCode;
        this._fragmentSourceCodeOverride = fragmentSourceCode;
        this.onError = function (effect, error) {
            if (onError) {
                onError(error);
            }
        };
        this.onCompiled = function () {
            var scenes = _this.getEngine().scenes;
            if (scenes) {
                for (var i = 0; i < scenes.length; i++) {
                    scenes[i].markAllMaterialsAsDirty(63);
                }
            }
            _this._pipelineContext._handlesSpectorRebuildCallback(onCompiled);
        };
        this._fallbacks = null;
        this._prepareEffect();
    };
    /**
     * Prepares the effect
     * @hidden
     */
    Effect.prototype._prepareEffect = function () {
        var _this = this;
        var attributesNames = this._attributesNames;
        var defines = this.defines;
        var previousPipelineContext = this._pipelineContext;
        this._isReady = false;
        try {
            var engine_1 = this._engine;
            this._pipelineContext = engine_1.createPipelineContext(this._processingContext);
            this._pipelineContext._name = this._key;
            var rebuildRebind = this._rebuildProgram.bind(this);
            if (this._vertexSourceCodeOverride && this._fragmentSourceCodeOverride) {
                engine_1._preparePipelineContext(this._pipelineContext, this._vertexSourceCodeOverride, this._fragmentSourceCodeOverride, true, this._rawVertexSourceCode, this._rawFragmentSourceCode, rebuildRebind, null, this._transformFeedbackVaryings, this._key);
            }
            else {
                engine_1._preparePipelineContext(this._pipelineContext, this._vertexSourceCode, this._fragmentSourceCode, false, this._rawVertexSourceCode, this._rawFragmentSourceCode, rebuildRebind, defines, this._transformFeedbackVaryings, this._key);
            }
            engine_1._executeWhenRenderingStateIsCompiled(this._pipelineContext, function () {
                _this._attributes = [];
                _this._pipelineContext._fillEffectInformation(_this, _this._uniformBuffersNames, _this._uniformsNames, _this._uniforms, _this._samplerList, _this._samplers, attributesNames, _this._attributes);
                // Caches attribute locations.
                if (attributesNames) {
                    for (var i = 0; i < attributesNames.length; i++) {
                        var name_1 = attributesNames[i];
                        _this._attributeLocationByName[name_1] = _this._attributes[i];
                    }
                }
                engine_1.bindSamplers(_this);
                _this._compilationError = "";
                _this._isReady = true;
                if (_this.onCompiled) {
                    _this.onCompiled(_this);
                }
                _this.onCompileObservable.notifyObservers(_this);
                _this.onCompileObservable.clear();
                // Unbind mesh reference in fallbacks
                if (_this._fallbacks) {
                    _this._fallbacks.unBindMesh();
                }
                if (previousPipelineContext) {
                    _this.getEngine()._deletePipelineContext(previousPipelineContext);
                }
            });
            if (this._pipelineContext.isAsync) {
                this._checkIsReady(previousPipelineContext);
            }
        }
        catch (e) {
            this._processCompilationErrors(e, previousPipelineContext);
        }
    };
    Effect.prototype._getShaderCodeAndErrorLine = function (code, error, isFragment) {
        var regexp = isFragment ? /FRAGMENT SHADER ERROR: 0:(\d+?):/ : /VERTEX SHADER ERROR: 0:(\d+?):/;
        var errorLine = null;
        if (error && code) {
            var res = error.match(regexp);
            if (res && res.length === 2) {
                var lineNumber = parseInt(res[1]);
                var lines = code.split("\n", -1);
                if (lines.length >= lineNumber) {
                    errorLine = "Offending line [".concat(lineNumber, "] in ").concat(isFragment ? "fragment" : "vertex", " code: ").concat(lines[lineNumber - 1]);
                }
            }
        }
        return [code, errorLine];
    };
    Effect.prototype._processCompilationErrors = function (e, previousPipelineContext) {
        var _a, _b;
        var _c, _d, _e;
        if (previousPipelineContext === void 0) { previousPipelineContext = null; }
        this._compilationError = e.message;
        var attributesNames = this._attributesNames;
        var fallbacks = this._fallbacks;
        // Let's go through fallbacks then
        Logger.Error("Unable to compile effect:");
        Logger.Error("Uniforms: " +
            this._uniformsNames.map(function (uniform) {
                return " " + uniform;
            }));
        Logger.Error("Attributes: " +
            attributesNames.map(function (attribute) {
                return " " + attribute;
            }));
        Logger.Error("Defines:\r\n" + this.defines);
        if (Effect.LogShaderCodeOnCompilationError) {
            var lineErrorVertex = null, lineErrorFragment = null, code = null;
            if ((_c = this._pipelineContext) === null || _c === void 0 ? void 0 : _c._getVertexShaderCode()) {
                _a = this._getShaderCodeAndErrorLine(this._pipelineContext._getVertexShaderCode(), this._compilationError, false), code = _a[0], lineErrorVertex = _a[1];
                if (code) {
                    Logger.Error("Vertex code:");
                    Logger.Error(code);
                }
            }
            if ((_d = this._pipelineContext) === null || _d === void 0 ? void 0 : _d._getFragmentShaderCode()) {
                _b = this._getShaderCodeAndErrorLine((_e = this._pipelineContext) === null || _e === void 0 ? void 0 : _e._getFragmentShaderCode(), this._compilationError, true), code = _b[0], lineErrorFragment = _b[1];
                if (code) {
                    Logger.Error("Fragment code:");
                    Logger.Error(code);
                }
            }
            if (lineErrorVertex) {
                Logger.Error(lineErrorVertex);
            }
            if (lineErrorFragment) {
                Logger.Error(lineErrorFragment);
            }
        }
        Logger.Error("Error: " + this._compilationError);
        if (previousPipelineContext) {
            this._pipelineContext = previousPipelineContext;
            this._isReady = true;
            if (this.onError) {
                this.onError(this, this._compilationError);
            }
            this.onErrorObservable.notifyObservers(this);
        }
        if (fallbacks) {
            this._pipelineContext = null;
            if (fallbacks.hasMoreFallbacks) {
                this._allFallbacksProcessed = false;
                Logger.Error("Trying next fallback.");
                this.defines = fallbacks.reduce(this.defines, this);
                this._prepareEffect();
            }
            else {
                // Sorry we did everything we can
                this._allFallbacksProcessed = true;
                if (this.onError) {
                    this.onError(this, this._compilationError);
                }
                this.onErrorObservable.notifyObservers(this);
                this.onErrorObservable.clear();
                // Unbind mesh reference in fallbacks
                if (this._fallbacks) {
                    this._fallbacks.unBindMesh();
                }
            }
        }
        else {
            this._allFallbacksProcessed = true;
        }
    };
    Object.defineProperty(Effect.prototype, "isSupported", {
        /**
         * Checks if the effect is supported. (Must be called after compilation)
         */
        get: function () {
            return this._compilationError === "";
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Binds a texture to the engine to be used as output of the shader.
     * @param channel Name of the output variable.
     * @param texture Texture to bind.
     * @hidden
     */
    Effect.prototype._bindTexture = function (channel, texture) {
        this._engine._bindTexture(this._samplers[channel], texture, channel);
    };
    /**
     * Sets a texture on the engine to be used in the shader.
     * @param channel Name of the sampler variable.
     * @param texture Texture to set.
     */
    Effect.prototype.setTexture = function (channel, texture) {
        this._engine.setTexture(this._samplers[channel], this._uniforms[channel], texture, channel);
    };
    /**
     * Sets a depth stencil texture from a render target on the engine to be used in the shader.
     * @param channel Name of the sampler variable.
     * @param texture Texture to set.
     */
    Effect.prototype.setDepthStencilTexture = function (channel, texture) {
        this._engine.setDepthStencilTexture(this._samplers[channel], this._uniforms[channel], texture, channel);
    };
    /**
     * Sets an array of textures on the engine to be used in the shader.
     * @param channel Name of the variable.
     * @param textures Textures to set.
     */
    Effect.prototype.setTextureArray = function (channel, textures) {
        var exName = channel + "Ex";
        if (this._samplerList.indexOf(exName + "0") === -1) {
            var initialPos = this._samplerList.indexOf(channel);
            for (var index = 1; index < textures.length; index++) {
                var currentExName = exName + (index - 1).toString();
                this._samplerList.splice(initialPos + index, 0, currentExName);
            }
            // Reset every channels
            var channelIndex = 0;
            for (var _i = 0, _a = this._samplerList; _i < _a.length; _i++) {
                var key = _a[_i];
                this._samplers[key] = channelIndex;
                channelIndex += 1;
            }
        }
        this._engine.setTextureArray(this._samplers[channel], this._uniforms[channel], textures, channel);
    };
    /**
     * Sets a texture to be the input of the specified post process. (To use the output, pass in the next post process in the pipeline)
     * @param channel Name of the sampler variable.
     * @param postProcess Post process to get the input texture from.
     */
    Effect.prototype.setTextureFromPostProcess = function (channel, postProcess) {
        this._engine.setTextureFromPostProcess(this._samplers[channel], postProcess, channel);
    };
    /**
     * (Warning! setTextureFromPostProcessOutput may be desired instead)
     * Sets the input texture of the passed in post process to be input of this effect. (To use the output of the passed in post process use setTextureFromPostProcessOutput)
     * @param channel Name of the sampler variable.
     * @param postProcess Post process to get the output texture from.
     */
    Effect.prototype.setTextureFromPostProcessOutput = function (channel, postProcess) {
        this._engine.setTextureFromPostProcessOutput(this._samplers[channel], postProcess, channel);
    };
    /**
     * Binds a buffer to a uniform.
     * @param buffer Buffer to bind.
     * @param name Name of the uniform variable to bind to.
     */
    Effect.prototype.bindUniformBuffer = function (buffer, name) {
        var bufferName = this._uniformBuffersNames[name];
        if (bufferName === undefined || (Effect._BaseCache[bufferName] === buffer && this._engine._features.useUBOBindingCache)) {
            return;
        }
        Effect._BaseCache[bufferName] = buffer;
        this._engine.bindUniformBufferBase(buffer, bufferName, name);
    };
    /**
     * Binds block to a uniform.
     * @param blockName Name of the block to bind.
     * @param index Index to bind.
     */
    Effect.prototype.bindUniformBlock = function (blockName, index) {
        this._engine.bindUniformBlock(this._pipelineContext, blockName, index);
    };
    /**
     * Sets an integer value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value Value to be set.
     * @returns this effect.
     */
    Effect.prototype.setInt = function (uniformName, value) {
        this._pipelineContext.setInt(uniformName, value);
        return this;
    };
    /**
     * Sets an int2 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int2.
     * @param y Second int in int2.
     * @returns this effect.
     */
    Effect.prototype.setInt2 = function (uniformName, x, y) {
        this._pipelineContext.setInt2(uniformName, x, y);
        return this;
    };
    /**
     * Sets an int3 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int3.
     * @param y Second int in int3.
     * @param z Third int in int3.
     * @returns this effect.
     */
    Effect.prototype.setInt3 = function (uniformName, x, y, z) {
        this._pipelineContext.setInt3(uniformName, x, y, z);
        return this;
    };
    /**
     * Sets an int4 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int4.
     * @param y Second int in int4.
     * @param z Third int in int4.
     * @param w Fourth int in int4.
     * @returns this effect.
     */
    Effect.prototype.setInt4 = function (uniformName, x, y, z, w) {
        this._pipelineContext.setInt4(uniformName, x, y, z, w);
        return this;
    };
    /**
     * Sets an int array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setIntArray = function (uniformName, array) {
        this._pipelineContext.setIntArray(uniformName, array);
        return this;
    };
    /**
     * Sets an int array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setIntArray2 = function (uniformName, array) {
        this._pipelineContext.setIntArray2(uniformName, array);
        return this;
    };
    /**
     * Sets an int array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setIntArray3 = function (uniformName, array) {
        this._pipelineContext.setIntArray3(uniformName, array);
        return this;
    };
    /**
     * Sets an int array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setIntArray4 = function (uniformName, array) {
        this._pipelineContext.setIntArray4(uniformName, array);
        return this;
    };
    /**
     * Sets an float array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setFloatArray = function (uniformName, array) {
        this._pipelineContext.setArray(uniformName, array);
        return this;
    };
    /**
     * Sets an float array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setFloatArray2 = function (uniformName, array) {
        this._pipelineContext.setArray2(uniformName, array);
        return this;
    };
    /**
     * Sets an float array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setFloatArray3 = function (uniformName, array) {
        this._pipelineContext.setArray3(uniformName, array);
        return this;
    };
    /**
     * Sets an float array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setFloatArray4 = function (uniformName, array) {
        this._pipelineContext.setArray4(uniformName, array);
        return this;
    };
    /**
     * Sets an array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setArray = function (uniformName, array) {
        this._pipelineContext.setArray(uniformName, array);
        return this;
    };
    /**
     * Sets an array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setArray2 = function (uniformName, array) {
        this._pipelineContext.setArray2(uniformName, array);
        return this;
    };
    /**
     * Sets an array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setArray3 = function (uniformName, array) {
        this._pipelineContext.setArray3(uniformName, array);
        return this;
    };
    /**
     * Sets an array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    Effect.prototype.setArray4 = function (uniformName, array) {
        this._pipelineContext.setArray4(uniformName, array);
        return this;
    };
    /**
     * Sets matrices on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrices matrices to be set.
     * @returns this effect.
     */
    Effect.prototype.setMatrices = function (uniformName, matrices) {
        this._pipelineContext.setMatrices(uniformName, matrices);
        return this;
    };
    /**
     * Sets matrix on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     * @returns this effect.
     */
    Effect.prototype.setMatrix = function (uniformName, matrix) {
        this._pipelineContext.setMatrix(uniformName, matrix);
        return this;
    };
    /**
     * Sets a 3x3 matrix on a uniform variable. (Specified as [1,2,3,4,5,6,7,8,9] will result in [1,2,3][4,5,6][7,8,9] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     * @returns this effect.
     */
    Effect.prototype.setMatrix3x3 = function (uniformName, matrix) {
        // the cast is ok because it is gl.uniformMatrix3fv() which is called at the end, and this function accepts Float32Array and Array<number>
        this._pipelineContext.setMatrix3x3(uniformName, matrix);
        return this;
    };
    /**
     * Sets a 2x2 matrix on a uniform variable. (Specified as [1,2,3,4] will result in [1,2][3,4] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     * @returns this effect.
     */
    Effect.prototype.setMatrix2x2 = function (uniformName, matrix) {
        // the cast is ok because it is gl.uniformMatrix3fv() which is called at the end, and this function accepts Float32Array and Array<number>
        this._pipelineContext.setMatrix2x2(uniformName, matrix);
        return this;
    };
    /**
     * Sets a float on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value value to be set.
     * @returns this effect.
     */
    Effect.prototype.setFloat = function (uniformName, value) {
        this._pipelineContext.setFloat(uniformName, value);
        return this;
    };
    /**
     * Sets a boolean on a uniform variable.
     * @param uniformName Name of the variable.
     * @param bool value to be set.
     * @returns this effect.
     */
    Effect.prototype.setBool = function (uniformName, bool) {
        this._pipelineContext.setInt(uniformName, bool ? 1 : 0);
        return this;
    };
    /**
     * Sets a Vector2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector2 vector2 to be set.
     * @returns this effect.
     */
    Effect.prototype.setVector2 = function (uniformName, vector2) {
        this._pipelineContext.setVector2(uniformName, vector2);
        return this;
    };
    /**
     * Sets a float2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float2.
     * @param y Second float in float2.
     * @returns this effect.
     */
    Effect.prototype.setFloat2 = function (uniformName, x, y) {
        this._pipelineContext.setFloat2(uniformName, x, y);
        return this;
    };
    /**
     * Sets a Vector3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector3 Value to be set.
     * @returns this effect.
     */
    Effect.prototype.setVector3 = function (uniformName, vector3) {
        this._pipelineContext.setVector3(uniformName, vector3);
        return this;
    };
    /**
     * Sets a float3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float3.
     * @param y Second float in float3.
     * @param z Third float in float3.
     * @returns this effect.
     */
    Effect.prototype.setFloat3 = function (uniformName, x, y, z) {
        this._pipelineContext.setFloat3(uniformName, x, y, z);
        return this;
    };
    /**
     * Sets a Vector4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector4 Value to be set.
     * @returns this effect.
     */
    Effect.prototype.setVector4 = function (uniformName, vector4) {
        this._pipelineContext.setVector4(uniformName, vector4);
        return this;
    };
    /**
     * Sets a float4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float4.
     * @param y Second float in float4.
     * @param z Third float in float4.
     * @param w Fourth float in float4.
     * @returns this effect.
     */
    Effect.prototype.setFloat4 = function (uniformName, x, y, z, w) {
        this._pipelineContext.setFloat4(uniformName, x, y, z, w);
        return this;
    };
    /**
     * Sets a Color3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     * @returns this effect.
     */
    Effect.prototype.setColor3 = function (uniformName, color3) {
        this._pipelineContext.setColor3(uniformName, color3);
        return this;
    };
    /**
     * Sets a Color4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     * @param alpha Alpha value to be set.
     * @returns this effect.
     */
    Effect.prototype.setColor4 = function (uniformName, color3, alpha) {
        this._pipelineContext.setColor4(uniformName, color3, alpha);
        return this;
    };
    /**
     * Sets a Color4 on a uniform variable
     * @param uniformName defines the name of the variable
     * @param color4 defines the value to be set
     * @returns this effect.
     */
    Effect.prototype.setDirectColor4 = function (uniformName, color4) {
        this._pipelineContext.setDirectColor4(uniformName, color4);
        return this;
    };
    /**
     * Release all associated resources.
     **/
    Effect.prototype.dispose = function () {
        if (this._pipelineContext) {
            this._pipelineContext.dispose();
        }
        this._engine._releaseEffect(this);
    };
    /**
     * This function will add a new shader to the shader store
     * @param name the name of the shader
     * @param pixelShader optional pixel shader content
     * @param vertexShader optional vertex shader content
     * @param shaderLanguage the language the shader is written in (default: GLSL)
     */
    Effect.RegisterShader = function (name, pixelShader, vertexShader, shaderLanguage) {
        if (shaderLanguage === void 0) { shaderLanguage = ShaderLanguage.GLSL; }
        if (pixelShader) {
            EngineShaderStore.GetShadersStore(shaderLanguage)["".concat(name, "PixelShader")] = pixelShader;
        }
        if (vertexShader) {
            EngineShaderStore.GetShadersStore(shaderLanguage)["".concat(name, "VertexShader")] = vertexShader;
        }
    };
    /**
     * Resets the cache of effects.
     */
    Effect.ResetCache = function () {
        Effect._BaseCache = {};
    };
    /**
     * Enable logging of the shader code when a compilation error occurs
     */
    Effect.LogShaderCodeOnCompilationError = true;
    Effect._UniqueIdSeed = 0;
    Effect._BaseCache = {};
    /**
     * Store of each shader (The can be looked up using effect.key)
     */
    Effect.ShadersStore = EngineShaderStore.ShadersStore;
    /**
     * Store of each included file for a shader (The can be looked up using effect.key)
     */
    Effect.IncludesShadersStore = EngineShaderStore.IncludesShadersStore;
    return Effect;
}());
export { Effect };
//# sourceMappingURL=effect.js.map