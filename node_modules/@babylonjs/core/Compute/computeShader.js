import { __assign, __decorate } from "tslib";
import { SerializationHelper, serialize } from "../Misc/decorators.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { ComputeBindingType } from "../Engines/Extensions/engine.computeShader.js";
import { Texture } from "../Materials/Textures/texture.js";
import { UniqueIdGenerator } from "../Misc/uniqueIdGenerator.js";
import { Logger } from "../Misc/logger.js";
import { TextureSampler } from "../Materials/Textures/textureSampler.js";
/**
 * The ComputeShader object lets you execute a compute shader on your GPU (if supported by the engine)
 */
var ComputeShader = /** @class */ (function () {
    /**
     * Instantiates a new compute shader.
     * @param name Defines the name of the compute shader in the scene
     * @param engine Defines the engine the compute shader belongs to
     * @param shaderPath Defines  the route to the shader code in one of three ways:
     *  * object: { compute: "custom" }, used with ShaderStore.ShadersStoreWGSL["customComputeShader"]
     *  * object: { computeElement: "HTMLElementId" }, used with shader code in script tags
     *  * object: { computeSource: "compute shader code string" using with string containing the shader code
     *  * string: try first to find the code in ShaderStore.ShadersStoreWGSL[shaderPath + "ComputeShader"]. If not, assumes it is a file with name shaderPath.compute.fx in index.html folder.
     * @param options Define the options used to create the shader
     */
    function ComputeShader(name, engine, shaderPath, options) {
        if (options === void 0) { options = {}; }
        this._bindings = {};
        this._samplers = {};
        this._contextIsDirty = false;
        /**
         * Callback triggered when the shader is compiled
         */
        this.onCompiled = null;
        /**
         * Callback triggered when an error occurs
         */
        this.onError = null;
        this.name = name;
        this._engine = engine;
        this.uniqueId = UniqueIdGenerator.UniqueId;
        if (!this._engine.getCaps().supportComputeShaders) {
            Logger.Error("This engine does not support compute shaders!");
            return;
        }
        if (!options.bindingsMapping) {
            Logger.Error("You must provide the binding mappings as browsers don't support reflection for wgsl shaders yet!");
            return;
        }
        this._context = engine.createComputeContext();
        this._shaderPath = shaderPath;
        this._options = __assign({ bindingsMapping: {}, defines: [] }, options);
    }
    Object.defineProperty(ComputeShader.prototype, "options", {
        /**
         * The options used to create the shader
         */
        get: function () {
            return this._options;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ComputeShader.prototype, "shaderPath", {
        /**
         * The shaderPath used to create the shader
         */
        get: function () {
            return this._shaderPath;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name of the material e.g. "ComputeShader"
     * Mainly use in serialization.
     * @returns the class name
     */
    ComputeShader.prototype.getClassName = function () {
        return "ComputeShader";
    };
    /**
     * Binds a texture to the shader
     * @param name Binding name of the texture
     * @param texture Texture to bind
     * @param bindSampler Bind the sampler corresponding to the texture (default: true). The sampler will be bound just before the binding index of the texture
     */
    ComputeShader.prototype.setTexture = function (name, texture, bindSampler) {
        if (bindSampler === void 0) { bindSampler = true; }
        var current = this._bindings[name];
        this._bindings[name] = {
            type: bindSampler ? ComputeBindingType.Texture : ComputeBindingType.TextureWithoutSampler,
            object: texture,
            indexInGroupEntries: current === null || current === void 0 ? void 0 : current.indexInGroupEntries,
        };
        this._contextIsDirty || (this._contextIsDirty = !current || current.object !== texture || current.type !== this._bindings[name].type);
    };
    /**
     * Binds a storage texture to the shader
     * @param name Binding name of the texture
     * @param texture Texture to bind
     */
    ComputeShader.prototype.setStorageTexture = function (name, texture) {
        var current = this._bindings[name];
        this._contextIsDirty || (this._contextIsDirty = !current || current.object !== texture);
        this._bindings[name] = {
            type: ComputeBindingType.StorageTexture,
            object: texture,
            indexInGroupEntries: current === null || current === void 0 ? void 0 : current.indexInGroupEntries,
        };
    };
    /**
     * Binds a uniform buffer to the shader
     * @param name Binding name of the buffer
     * @param buffer Buffer to bind
     */
    ComputeShader.prototype.setUniformBuffer = function (name, buffer) {
        var current = this._bindings[name];
        this._contextIsDirty || (this._contextIsDirty = !current || current.object !== buffer);
        this._bindings[name] = {
            type: ComputeBindingType.UniformBuffer,
            object: buffer,
            indexInGroupEntries: current === null || current === void 0 ? void 0 : current.indexInGroupEntries,
        };
    };
    /**
     * Binds a storage buffer to the shader
     * @param name Binding name of the buffer
     * @param buffer Buffer to bind
     */
    ComputeShader.prototype.setStorageBuffer = function (name, buffer) {
        var current = this._bindings[name];
        this._contextIsDirty || (this._contextIsDirty = !current || current.object !== buffer);
        this._bindings[name] = {
            type: ComputeBindingType.StorageBuffer,
            object: buffer,
            indexInGroupEntries: current === null || current === void 0 ? void 0 : current.indexInGroupEntries,
        };
    };
    /**
     * Binds a texture sampler to the shader
     * @param name Binding name of the sampler
     * @param sampler Sampler to bind
     */
    ComputeShader.prototype.setTextureSampler = function (name, sampler) {
        var current = this._bindings[name];
        this._contextIsDirty || (this._contextIsDirty = !current || !sampler.compareSampler(current.object));
        this._bindings[name] = {
            type: ComputeBindingType.Sampler,
            object: sampler,
            indexInGroupEntries: current === null || current === void 0 ? void 0 : current.indexInGroupEntries,
        };
    };
    /**
     * Specifies that the compute shader is ready to be executed (the compute effect and all the resources are ready)
     * @returns true if the compute shader is ready to be executed
     */
    ComputeShader.prototype.isReady = function () {
        var effect = this._effect;
        for (var key in this._bindings) {
            var binding = this._bindings[key], type = binding.type, object = binding.object;
            switch (type) {
                case ComputeBindingType.Texture:
                case ComputeBindingType.TextureWithoutSampler:
                case ComputeBindingType.StorageTexture: {
                    var texture = object;
                    if (!texture.isReady()) {
                        return false;
                    }
                    break;
                }
            }
        }
        var defines = [];
        var shaderName = this._shaderPath;
        if (this._options.defines) {
            for (var index = 0; index < this._options.defines.length; index++) {
                defines.push(this._options.defines[index]);
            }
        }
        var join = defines.join("\n");
        if (this._cachedDefines !== join) {
            this._cachedDefines = join;
            effect = this._engine.createComputeEffect(shaderName, {
                defines: join,
                entryPoint: this._options.entryPoint,
                onCompiled: this.onCompiled,
                onError: this.onError,
            });
            this._effect = effect;
        }
        if (!effect.isReady()) {
            return false;
        }
        return true;
    };
    /**
     * Dispatches (executes) the compute shader
     * @param x Number of workgroups to execute on the X dimension
     * @param y Number of workgroups to execute on the Y dimension (default: 1)
     * @param z Number of workgroups to execute on the Z dimension (default: 1)
     * @returns True if the dispatch could be done, else false (meaning either the compute effect or at least one of the bound resources was not ready)
     */
    ComputeShader.prototype.dispatch = function (x, y, z) {
        var _a;
        if (!this.isReady()) {
            return false;
        }
        // If the sampling parameters of a texture bound to the shader have changed, we must clear the compute context so that it is recreated with the updated values
        for (var key in this._bindings) {
            var binding = this._bindings[key];
            // TODO: remove this when browsers support reflection for wgsl shaders
            if (!this._options.bindingsMapping[key]) {
                throw new Error("ComputeShader ('" + this.name + "'): No binding mapping has been provided for the property '" + key + "'");
            }
            if (binding.type !== ComputeBindingType.Texture) {
                continue;
            }
            var sampler = this._samplers[key];
            var texture = binding.object;
            if (!sampler || !texture._texture || !sampler.compareSampler(texture._texture)) {
                this._samplers[key] = new TextureSampler().setParameters(texture.wrapU, texture.wrapV, texture.wrapR, texture.anisotropicFilteringLevel, texture._texture.samplingMode, (_a = texture._texture) === null || _a === void 0 ? void 0 : _a._comparisonFunction);
                this._contextIsDirty = true;
            }
        }
        if (this._contextIsDirty) {
            this._contextIsDirty = false;
            this._context.clear();
        }
        this._engine.computeDispatch(this._effect, this._context, this._bindings, x, y, z, this._options.bindingsMapping);
        return true;
    };
    /**
     * Waits for the compute shader to be ready and executes it
     * @param x Number of workgroups to execute on the X dimension
     * @param y Number of workgroups to execute on the Y dimension (default: 1)
     * @param z Number of workgroups to execute on the Z dimension (default: 1)
     * @param delay Delay between the retries while the shader is not ready (in milliseconds - 10 by default)
     * @returns A promise that is resolved once the shader has been sent to the GPU. Note that it does not mean that the shader execution itself is finished!
     */
    ComputeShader.prototype.dispatchWhenReady = function (x, y, z, delay) {
        var _this = this;
        if (delay === void 0) { delay = 10; }
        return new Promise(function (resolve) {
            var check = function () {
                if (!_this.dispatch(x, y, z)) {
                    setTimeout(check, delay);
                }
                else {
                    resolve();
                }
            };
            check();
        });
    };
    /**
     * Serializes this compute shader in a JSON representation
     * @returns the serialized compute shader object
     */
    ComputeShader.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.options = this._options;
        serializationObject.shaderPath = this._shaderPath;
        serializationObject.bindings = {};
        serializationObject.textures = {};
        for (var key in this._bindings) {
            var binding = this._bindings[key];
            var object = binding.object;
            switch (binding.type) {
                case ComputeBindingType.Texture:
                case ComputeBindingType.TextureWithoutSampler:
                case ComputeBindingType.StorageTexture: {
                    var serializedData = object.serialize();
                    if (serializedData) {
                        serializationObject.textures[key] = serializedData;
                        serializationObject.bindings[key] = {
                            type: binding.type,
                        };
                    }
                    break;
                }
                case ComputeBindingType.UniformBuffer: {
                    break;
                }
            }
        }
        return serializationObject;
    };
    /**
     * Creates a compute shader from parsed compute shader data
     * @param source defines the JSON representation of the compute shader
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new compute shader
     */
    ComputeShader.Parse = function (source, scene, rootUrl) {
        var compute = SerializationHelper.Parse(function () { return new ComputeShader(source.name, scene.getEngine(), source.shaderPath, source.options); }, source, scene, rootUrl);
        for (var key in source.textures) {
            var binding = source.bindings[key];
            var texture = Texture.Parse(source.textures[key], scene, rootUrl);
            if (binding.type === ComputeBindingType.Texture) {
                compute.setTexture(key, texture);
            }
            else if (binding.type === ComputeBindingType.TextureWithoutSampler) {
                compute.setTexture(key, texture, false);
            }
            else {
                compute.setStorageTexture(key, texture);
            }
        }
        return compute;
    };
    __decorate([
        serialize()
    ], ComputeShader.prototype, "name", void 0);
    return ComputeShader;
}());
export { ComputeShader };
RegisterClass("BABYLON.ComputeShader", ComputeShader);
//# sourceMappingURL=computeShader.js.map