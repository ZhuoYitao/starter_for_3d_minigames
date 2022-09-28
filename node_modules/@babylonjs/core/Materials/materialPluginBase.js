import { __decorate } from "tslib";
import { SerializationHelper, serialize } from "../Misc/decorators.js";
import { MaterialPluginManager } from "./materialPluginManager.js";

/**
 * Base class for material plugins.
 * @since 5.0
 */
var MaterialPluginBase = /** @class */ (function () {
    /**
     * Creates a new material plugin
     * @param material parent material of the plugin
     * @param name name of the plugin
     * @param priority priority of the plugin
     * @param defines list of defines used by the plugin. The value of the property is the default value for this property
     * @param addToPluginList true to add the plugin to the list of plugins managed by the material plugin manager of the material (default: true)
     * @param enable true to enable the plugin (it is handy if the plugin does not handle properties to switch its current activation)
     */
    function MaterialPluginBase(material, name, priority, defines, addToPluginList, enable) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        if (enable === void 0) { enable = false; }
        /**
         * Defines the priority of the plugin. Lower numbers run first.
         */
        this.priority = 500;
        /**
         * Indicates that this plugin should be notified for the extra events (HasRenderTargetTextures / FillRenderTargetTextures / HardBindForSubMesh)
         */
        this.registerForExtraEvents = false;
        this._material = material;
        this.name = name;
        this.priority = priority;
        if (!material.pluginManager) {
            material.pluginManager = new MaterialPluginManager(material);
        }
        this._pluginDefineNames = defines;
        this._pluginManager = material.pluginManager;
        if (addToPluginList) {
            this._pluginManager._addPlugin(this);
        }
        if (enable) {
            this._enable(true);
        }
        this.markAllDefinesAsDirty = material._dirtyCallbacks[63];
    }
    MaterialPluginBase.prototype._enable = function (enable) {
        if (enable) {
            this._pluginManager._activatePlugin(this);
        }
    };
    /**
     * Gets the current class name useful for serialization or dynamic coding.
     * @returns The class name.
     */
    MaterialPluginBase.prototype.getClassName = function () {
        return "MaterialPluginBase";
    };
    /**
     * Specifies that the submesh is ready to be used.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     * @param engine the engine this scene belongs to.
     * @param subMesh the submesh to check for readiness
     * @returns - boolean indicating that the submesh is ready or not.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.isReadyForSubMesh = function (defines, scene, engine, subMesh) {
        return true;
    };
    /**
     * Binds the material data (this function is called even if mustRebind() returns false)
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param engine defines the engine the material belongs to.
     * @param subMesh the submesh to bind data for
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.hardBindForSubMesh = function (uniformBuffer, scene, engine, subMesh) { };
    /**
     * Binds the material data.
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param engine the engine this scene belongs to.
     * @param subMesh the submesh to bind data for
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, subMesh) { };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.dispose = function (forceDisposeTextures) { };
    /**
     * Returns a list of custom shader code fragments to customize the shader.
     * @param shaderType "vertex" or "fragment"
     * @returns null if no code to be added, or a list of pointName => code.
     * Note that `pointName` can also be a regular expression if it starts with a `!`.
     * In that case, the string found by the regular expression (if any) will be
     * replaced by the code provided.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.getCustomCode = function (shaderType) {
        return null;
    };
    /**
     * Collects all defines.
     * @param defines The object to append to.
     */
    MaterialPluginBase.prototype.collectDefines = function (defines) {
        if (!this._pluginDefineNames) {
            return;
        }
        for (var _i = 0, _a = Object.keys(this._pluginDefineNames); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key[0] === "_") {
                continue;
            }
            var type = typeof this._pluginDefineNames[key];
            defines[key] = {
                type: type === "number" ? "number" : type === "string" ? "string" : type === "boolean" ? "boolean" : "object",
                default: this._pluginDefineNames[key],
            };
        }
    };
    /**
     * Sets the defines for the next rendering
     * @param defines the list of "defines" to update.
     * @param scene defines the scene to the material belongs to.
     * @param mesh the mesh being rendered
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.prepareDefines = function (defines, scene, mesh) { };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.hasTexture = function (texture) {
        return false;
    };
    /**
     * Gets a boolean indicating that current material needs to register RTT
     * @returns true if this uses a render target otherwise false.
     */
    MaterialPluginBase.prototype.hasRenderTargetTextures = function () {
        return false;
    };
    /**
     * Fills the list of render target textures.
     * @param renderTargets the list of render targets to update
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.fillRenderTargetTextures = function (renderTargets) { };
    /**
     * Returns an array of the actively used textures.
     * @param activeTextures Array of BaseTextures
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.getActiveTextures = function (activeTextures) { };
    /**
     * Returns the animatable textures.
     * @param animatables Array of animatable textures.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.getAnimatables = function (animatables) { };
    /**
     * Add fallbacks to the effect fallbacks list.
     * @param defines defines the Base texture to use.
     * @param fallbacks defines the current fallback list.
     * @param currentRank defines the current fallback rank.
     * @returns the new fallback rank.
     */
    MaterialPluginBase.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        return currentRank;
    };
    /**
     * Gets the samplers used by the plugin.
     * @param samplers list that the sampler names should be added to.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.getSamplers = function (samplers) { };
    /**
     * Gets the uniform buffers names added by the plugin.
     * @param ubos list that the ubo names should be added to.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MaterialPluginBase.prototype.getUniformBuffersNames = function (ubos) { };
    /**
     * Gets the description of the uniforms to add to the ubo (if engine supports ubos) or to inject directly in the vertex/fragment shaders (if engine does not support ubos)
     * @returns the description of the uniforms
     */
    MaterialPluginBase.prototype.getUniforms = function () {
        return {};
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param plugin define the config where to copy the info
     */
    MaterialPluginBase.prototype.copyTo = function (plugin) {
        SerializationHelper.Clone(function () { return plugin; }, this);
    };
    /**
     * Serializes this clear coat configuration.
     * @returns - An object with the serialized config.
     */
    MaterialPluginBase.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a anisotropy Configuration from a serialized object.
     * @param source - Serialized object.
     * @param scene Defines the scene we are parsing for
     * @param rootUrl Defines the rootUrl to load from
     */
    MaterialPluginBase.prototype.parse = function (source, scene, rootUrl) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], MaterialPluginBase.prototype, "name", void 0);
    __decorate([
        serialize()
    ], MaterialPluginBase.prototype, "priority", void 0);
    __decorate([
        serialize()
    ], MaterialPluginBase.prototype, "registerForExtraEvents", void 0);
    return MaterialPluginBase;
}());
export { MaterialPluginBase };
//# sourceMappingURL=materialPluginBase.js.map