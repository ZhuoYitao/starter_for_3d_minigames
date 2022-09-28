import { Material } from "./material.js";
import { MaterialPluginEvent } from "./materialPluginEvent.js";
/**
 * Class that manages the plugins of a material
 * @since 5.0
 */
var MaterialPluginManager = /** @class */ (function () {
    /**
     * Creates a new instance of the plugin manager
     * @param material material that this manager will manage the plugins for
     */
    function MaterialPluginManager(material) {
        this._plugins = [];
        this._activePlugins = [];
        this._activePluginsForExtraEvents = [];
        this._material = material;
        this._scene = material.getScene();
        this._engine = this._scene.getEngine();
    }
    /**
     * @param plugin
     * @hidden
     */
    MaterialPluginManager.prototype._addPlugin = function (plugin) {
        for (var i = 0; i < this._plugins.length; ++i) {
            if (this._plugins[i].name === plugin.name) {
                throw "Plugin \"".concat(plugin.name, "\" already added to the material \"").concat(this._material.name, "\"!");
            }
        }
        if (this._material._uniformBufferLayoutBuilt) {
            throw "The plugin \"".concat(plugin.name, "\" can't be added to the material \"").concat(this._material.name, "\" because this material has already been used for rendering! Please add plugins to materials before any rendering with this material occurs.");
        }
        var pluginClassName = plugin.getClassName();
        if (!MaterialPluginManager._MaterialPluginClassToMainDefine[pluginClassName]) {
            MaterialPluginManager._MaterialPluginClassToMainDefine[pluginClassName] = "MATERIALPLUGIN_" + ++MaterialPluginManager._MaterialPluginCounter;
        }
        this._material._callbackPluginEventGeneric = this._handlePluginEvent.bind(this);
        this._plugins.push(plugin);
        this._plugins.sort(function (a, b) { return a.priority - b.priority; });
        this._codeInjectionPoints = {};
        var defineNamesFromPlugins = {};
        defineNamesFromPlugins[MaterialPluginManager._MaterialPluginClassToMainDefine[pluginClassName]] = {
            type: "boolean",
            default: true,
        };
        for (var _i = 0, _a = this._plugins; _i < _a.length; _i++) {
            var plugin_1 = _a[_i];
            plugin_1.collectDefines(defineNamesFromPlugins);
            this._collectPointNames("vertex", plugin_1.getCustomCode("vertex"));
            this._collectPointNames("fragment", plugin_1.getCustomCode("fragment"));
        }
        this._defineNamesFromPlugins = defineNamesFromPlugins;
    };
    /**
     * @param plugin
     * @hidden
     */
    MaterialPluginManager.prototype._activatePlugin = function (plugin) {
        if (this._activePlugins.indexOf(plugin) === -1) {
            this._activePlugins.push(plugin);
            this._activePlugins.sort(function (a, b) { return a.priority - b.priority; });
            this._material._callbackPluginEventIsReadyForSubMesh = this._handlePluginEventIsReadyForSubMesh.bind(this);
            this._material._callbackPluginEventPrepareDefines = this._handlePluginEventPrepareDefines.bind(this);
            this._material._callbackPluginEventBindForSubMesh = this._handlePluginEventBindForSubMesh.bind(this);
            if (plugin.registerForExtraEvents) {
                this._activePluginsForExtraEvents.push(plugin);
                this._activePluginsForExtraEvents.sort(function (a, b) { return a.priority - b.priority; });
                this._material._callbackPluginEventHasRenderTargetTextures = this._handlePluginEventHasRenderTargetTextures.bind(this);
                this._material._callbackPluginEventFillRenderTargetTextures = this._handlePluginEventFillRenderTargetTextures.bind(this);
                this._material._callbackPluginEventHardBindForSubMesh = this._handlePluginEventHardBindForSubMesh.bind(this);
            }
        }
    };
    /**
     * Gets a plugin from the list of plugins managed by this manager
     * @param name name of the plugin
     * @returns the plugin if found, else null
     */
    MaterialPluginManager.prototype.getPlugin = function (name) {
        for (var i = 0; i < this._plugins.length; ++i) {
            if (this._plugins[i].name === name) {
                return this._plugins[i];
            }
        }
        return null;
    };
    MaterialPluginManager.prototype._handlePluginEventIsReadyForSubMesh = function (eventData) {
        var isReady = true;
        for (var _i = 0, _a = this._activePlugins; _i < _a.length; _i++) {
            var plugin = _a[_i];
            isReady = isReady && plugin.isReadyForSubMesh(eventData.defines, this._scene, this._engine, eventData.subMesh);
        }
        eventData.isReadyForSubMesh = isReady;
    };
    MaterialPluginManager.prototype._handlePluginEventPrepareDefines = function (eventData) {
        for (var _i = 0, _a = this._activePlugins; _i < _a.length; _i++) {
            var plugin = _a[_i];
            plugin.prepareDefines(eventData.defines, this._scene, eventData.mesh);
        }
    };
    MaterialPluginManager.prototype._handlePluginEventHardBindForSubMesh = function (eventData) {
        for (var _i = 0, _a = this._activePluginsForExtraEvents; _i < _a.length; _i++) {
            var plugin = _a[_i];
            plugin.hardBindForSubMesh(this._material._uniformBuffer, this._scene, this._engine, eventData.subMesh);
        }
    };
    MaterialPluginManager.prototype._handlePluginEventBindForSubMesh = function (eventData) {
        for (var _i = 0, _a = this._activePlugins; _i < _a.length; _i++) {
            var plugin = _a[_i];
            plugin.bindForSubMesh(this._material._uniformBuffer, this._scene, this._engine, eventData.subMesh);
        }
    };
    MaterialPluginManager.prototype._handlePluginEventHasRenderTargetTextures = function (eventData) {
        var hasRenderTargetTextures = false;
        for (var _i = 0, _a = this._activePluginsForExtraEvents; _i < _a.length; _i++) {
            var plugin = _a[_i];
            hasRenderTargetTextures = plugin.hasRenderTargetTextures();
            if (hasRenderTargetTextures) {
                break;
            }
        }
        eventData.hasRenderTargetTextures = hasRenderTargetTextures;
    };
    MaterialPluginManager.prototype._handlePluginEventFillRenderTargetTextures = function (eventData) {
        for (var _i = 0, _a = this._activePluginsForExtraEvents; _i < _a.length; _i++) {
            var plugin = _a[_i];
            plugin.fillRenderTargetTextures(eventData.renderTargets);
        }
    };
    MaterialPluginManager.prototype._handlePluginEvent = function (id, info) {
        var _a, _b, _c;
        switch (id) {
            case MaterialPluginEvent.GetActiveTextures: {
                var eventData = info;
                for (var _i = 0, _d = this._activePlugins; _i < _d.length; _i++) {
                    var plugin = _d[_i];
                    plugin.getActiveTextures(eventData.activeTextures);
                }
                break;
            }
            case MaterialPluginEvent.GetAnimatables: {
                var eventData = info;
                for (var _e = 0, _f = this._activePlugins; _e < _f.length; _e++) {
                    var plugin = _f[_e];
                    plugin.getAnimatables(eventData.animatables);
                }
                break;
            }
            case MaterialPluginEvent.HasTexture: {
                var eventData = info;
                var hasTexture = false;
                for (var _g = 0, _h = this._activePlugins; _g < _h.length; _g++) {
                    var plugin = _h[_g];
                    hasTexture = plugin.hasTexture(eventData.texture);
                    if (hasTexture) {
                        break;
                    }
                }
                eventData.hasTexture = hasTexture;
                break;
            }
            case MaterialPluginEvent.Disposed: {
                var eventData = info;
                for (var _j = 0, _k = this._plugins; _j < _k.length; _j++) {
                    var plugin = _k[_j];
                    plugin.dispose(eventData.forceDisposeTextures);
                }
                break;
            }
            case MaterialPluginEvent.GetDefineNames: {
                var eventData = info;
                eventData.defineNames = this._defineNamesFromPlugins;
                break;
            }
            case MaterialPluginEvent.PrepareEffect: {
                var eventData = info;
                for (var _l = 0, _m = this._activePlugins; _l < _m.length; _l++) {
                    var plugin = _m[_l];
                    eventData.fallbackRank = plugin.addFallbacks(eventData.defines, eventData.fallbacks, eventData.fallbackRank);
                }
                if (this._uniformList.length > 0) {
                    (_a = eventData.uniforms).push.apply(_a, this._uniformList);
                }
                if (this._samplerList.length > 0) {
                    (_b = eventData.samplers).push.apply(_b, this._samplerList);
                }
                if (this._uboList.length > 0) {
                    (_c = eventData.uniformBuffersNames).push.apply(_c, this._uboList);
                }
                eventData.customCode = this._injectCustomCode(eventData.customCode);
                break;
            }
            case MaterialPluginEvent.PrepareUniformBuffer: {
                var eventData = info;
                this._uboDeclaration = "";
                this._vertexDeclaration = "";
                this._fragmentDeclaration = "";
                this._uniformList = [];
                this._samplerList = [];
                this._uboList = [];
                for (var _o = 0, _p = this._plugins; _o < _p.length; _o++) {
                    var plugin = _p[_o];
                    var uniforms = plugin.getUniforms();
                    if (uniforms) {
                        if (uniforms.ubo) {
                            for (var _q = 0, _r = uniforms.ubo; _q < _r.length; _q++) {
                                var uniform = _r[_q];
                                eventData.ubo.addUniform(uniform.name, uniform.size);
                                this._uboDeclaration += "".concat(uniform.type, " ").concat(uniform.name, ";\r\n");
                                this._uniformList.push(uniform.name);
                            }
                        }
                        if (uniforms.vertex) {
                            this._vertexDeclaration += uniforms.vertex + "\r\n";
                        }
                        if (uniforms.fragment) {
                            this._fragmentDeclaration += uniforms.fragment + "\r\n";
                        }
                    }
                    plugin.getSamplers(this._samplerList);
                    plugin.getUniformBuffersNames(this._uboList);
                }
                break;
            }
        }
    };
    MaterialPluginManager.prototype._collectPointNames = function (shaderType, customCode) {
        if (!customCode) {
            return;
        }
        for (var pointName in customCode) {
            if (!this._codeInjectionPoints[shaderType]) {
                this._codeInjectionPoints[shaderType] = {};
            }
            this._codeInjectionPoints[shaderType][pointName] = true;
        }
    };
    MaterialPluginManager.prototype._injectCustomCode = function (existingCallback) {
        var _this = this;
        return function (shaderType, code) {
            var _a;
            if (existingCallback) {
                code = existingCallback(shaderType, code);
            }
            if (_this._uboDeclaration) {
                code = code.replace("#define ADDITIONAL_UBO_DECLARATION", _this._uboDeclaration);
            }
            if (_this._vertexDeclaration) {
                code = code.replace("#define ADDITIONAL_VERTEX_DECLARATION", _this._vertexDeclaration);
            }
            if (_this._fragmentDeclaration) {
                code = code.replace("#define ADDITIONAL_FRAGMENT_DECLARATION", _this._fragmentDeclaration);
            }
            var points = (_a = _this._codeInjectionPoints) === null || _a === void 0 ? void 0 : _a[shaderType];
            if (!points) {
                return code;
            }
            for (var pointName in points) {
                var injectedCode = "";
                for (var _i = 0, _b = _this._activePlugins; _i < _b.length; _i++) {
                    var plugin = _b[_i];
                    var customCode = plugin.getCustomCode(shaderType);
                    if (customCode === null || customCode === void 0 ? void 0 : customCode[pointName]) {
                        injectedCode += customCode[pointName] + "\r\n";
                    }
                }
                if (injectedCode.length > 0) {
                    if (pointName.charAt(0) === "!") {
                        // pointName is a regular expression
                        var rx = new RegExp(pointName.substring(1), "g");
                        var match = rx.exec(code);
                        while (match !== null) {
                            code = code.replace(match[0], injectedCode);
                            match = rx.exec(code);
                        }
                    }
                    else {
                        var fullPointName = "#define " + pointName;
                        code = code.replace(fullPointName, "\r\n" + injectedCode + "\r\n" + fullPointName);
                    }
                }
            }
            return code;
        };
    };
    /** Map a plugin class name to a #define name (used in the vertex/fragment shaders as a marker of the plugin usage) */
    MaterialPluginManager._MaterialPluginClassToMainDefine = {};
    MaterialPluginManager._MaterialPluginCounter = 0;
    return MaterialPluginManager;
}());
export { MaterialPluginManager };
var plugins = [];
var inited = false;
/**
 * Registers a new material plugin through a factory, or updates it. This makes the plugin available to all materials instantiated after its registration.
 * @param pluginName The plugin name
 * @param factory The factory function which allows to create the plugin
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function RegisterMaterialPlugin(pluginName, factory) {
    if (!inited) {
        Material.OnEventObservable.add(function (material) {
            for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
                var _a = plugins_1[_i], factory_1 = _a[1];
                factory_1(material);
            }
        }, MaterialPluginEvent.Created);
        inited = true;
    }
    var existing = plugins.filter(function (_a) {
        var name = _a[0], _factory = _a[1];
        return name === pluginName;
    });
    if (existing.length > 0) {
        existing[0][1] = factory;
    }
    else {
        plugins.push([pluginName, factory]);
    }
}
/**
 * Removes a material plugin from the list of global plugins.
 * @param pluginName The plugin name
 * @returns true if the plugin has been removed, else false
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function UnregisterMaterialPlugin(pluginName) {
    for (var i = 0; i < plugins.length; ++i) {
        if (plugins[i][0] === pluginName) {
            plugins.splice(i, 1);
            return true;
        }
    }
    return false;
}
/**
 * Clear the list of global material plugins
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function UnregisterAllMaterialPlugins() {
    plugins.length = 0;
}
//# sourceMappingURL=materialPluginManager.js.map