import { __decorate, __extends } from "tslib";
import { serialize } from "../../../Misc/decorators.js";
import { Observable } from "../../../Misc/observable.js";
import { VertexBuffer } from "../../../Buffers/buffer.js";
import { SceneComponentConstants } from "../../../sceneComponent.js";
import { Material } from "../../../Materials/material.js";
import { Texture } from "../../../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../../../Materials/Textures/renderTargetTexture.js";
import { ProceduralTextureSceneComponent } from "./proceduralTextureSceneComponent.js";
import "../../../Engines/Extensions/engine.renderTarget.js";
import "../../../Engines/Extensions/engine.renderTargetCube.js";
import "../../../Shaders/procedural.vertex.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { EngineStore } from "../../../Engines/engineStore.js";

import { DrawWrapper } from "../../drawWrapper.js";
/**
 * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes calmpler' images.
 * This is the base class of any Procedural texture and contains most of the shareable code.
 * @see https://doc.babylonjs.com/how_to/how_to_use_procedural_textures
 */
var ProceduralTexture = /** @class */ (function (_super) {
    __extends(ProceduralTexture, _super);
    /**
     * Instantiates a new procedural texture.
     * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes called 'refMaps' or 'sampler' images.
     * This is the base class of any Procedural texture and contains most of the shareable code.
     * @see https://doc.babylonjs.com/how_to/how_to_use_procedural_textures
     * @param name  Define the name of the texture
     * @param size Define the size of the texture to create
     * @param fragment Define the fragment shader to use to generate the texture or null if it is defined later
     * @param scene Define the scene the texture belongs to
     * @param fallbackTexture Define a fallback texture in case there were issues to create the custom texture
     * @param generateMipMaps Define if the texture should creates mip maps or not
     * @param isCube Define if the texture is a cube texture or not (this will render each faces of the cube)
     * @param textureType The FBO internal texture type
     */
    function ProceduralTexture(name, size, fragment, scene, fallbackTexture, generateMipMaps, isCube, textureType) {
        if (fallbackTexture === void 0) { fallbackTexture = null; }
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (isCube === void 0) { isCube = false; }
        if (textureType === void 0) { textureType = 0; }
        var _this = _super.call(this, null, scene, !generateMipMaps) || this;
        /**
         * Define if the texture is enabled or not (disabled texture will not render)
         */
        _this.isEnabled = true;
        /**
         * Define if the texture must be cleared before rendering (default is true)
         */
        _this.autoClear = true;
        /**
         * Event raised when the texture is generated
         */
        _this.onGeneratedObservable = new Observable();
        /**
         * Event raised before the texture is generated
         */
        _this.onBeforeGenerationObservable = new Observable();
        /**
         * Gets or sets the node material used to create this texture (null if the texture was manually created)
         */
        _this.nodeMaterialSource = null;
        /** @hidden */
        _this._textures = {};
        _this._currentRefreshId = -1;
        _this._frameId = -1;
        _this._refreshRate = 1;
        _this._vertexBuffers = {};
        _this._uniforms = new Array();
        _this._samplers = new Array();
        _this._floats = {};
        _this._ints = {};
        _this._floatsArrays = {};
        _this._colors3 = {};
        _this._colors4 = {};
        _this._vectors2 = {};
        _this._vectors3 = {};
        _this._matrices = {};
        _this._fallbackTextureUsed = false;
        _this._cachedDefines = null;
        _this._contentUpdateId = -1;
        _this._rtWrapper = null;
        scene = _this.getScene() || EngineStore.LastCreatedScene;
        var component = scene._getComponent(SceneComponentConstants.NAME_PROCEDURALTEXTURE);
        if (!component) {
            component = new ProceduralTextureSceneComponent(scene);
            scene._addComponent(component);
        }
        scene.proceduralTextures.push(_this);
        _this._fullEngine = scene.getEngine();
        _this.name = name;
        _this.isRenderTarget = true;
        _this._size = size;
        _this._textureType = textureType;
        _this._generateMipMaps = generateMipMaps;
        _this._drawWrapper = new DrawWrapper(_this._fullEngine);
        _this.setFragment(fragment);
        _this._fallbackTexture = fallbackTexture;
        var rtWrapper = _this._createRtWrapper(isCube, size, generateMipMaps, textureType);
        _this._texture = rtWrapper.texture;
        // VBO
        var vertices = [];
        vertices.push(1, 1);
        vertices.push(-1, 1);
        vertices.push(-1, -1);
        vertices.push(1, -1);
        _this._vertexBuffers[VertexBuffer.PositionKind] = new VertexBuffer(_this._fullEngine, vertices, VertexBuffer.PositionKind, false, false, 2);
        _this._createIndexBuffer();
        return _this;
    }
    ProceduralTexture.prototype._createRtWrapper = function (isCube, size, generateMipMaps, textureType) {
        if (isCube) {
            this._rtWrapper = this._fullEngine.createRenderTargetCubeTexture(size, {
                generateMipMaps: generateMipMaps,
                generateDepthBuffer: false,
                generateStencilBuffer: false,
                type: textureType,
            });
            this.setFloat("face", 0);
        }
        else {
            this._rtWrapper = this._fullEngine.createRenderTargetTexture(size, {
                generateMipMaps: generateMipMaps,
                generateDepthBuffer: false,
                generateStencilBuffer: false,
                type: textureType,
            });
        }
        return this._rtWrapper;
    };
    /**
     * The effect that is created when initializing the post process.
     * @returns The created effect corresponding the the postprocess.
     */
    ProceduralTexture.prototype.getEffect = function () {
        return this._drawWrapper.effect;
    };
    /**
     * @param effect
     * @hidden*
     */
    ProceduralTexture.prototype._setEffect = function (effect) {
        this._drawWrapper.effect = effect;
    };
    /**
     * Gets texture content (Use this function wisely as reading from a texture can be slow)
     * @returns an ArrayBufferView promise (Uint8Array or Float32Array)
     */
    ProceduralTexture.prototype.getContent = function () {
        var _this = this;
        if (this._contentData && this._frameId === this._contentUpdateId) {
            return this._contentData;
        }
        if (this._contentData) {
            this._contentData.then(function (buffer) {
                _this._contentData = _this.readPixels(0, 0, buffer);
                _this._contentUpdateId = _this._frameId;
            });
        }
        else {
            this._contentData = this.readPixels(0, 0);
            this._contentUpdateId = this._frameId;
        }
        return this._contentData;
    };
    ProceduralTexture.prototype._createIndexBuffer = function () {
        var engine = this._fullEngine;
        // Indices
        var indices = [];
        indices.push(0);
        indices.push(1);
        indices.push(2);
        indices.push(0);
        indices.push(2);
        indices.push(3);
        this._indexBuffer = engine.createIndexBuffer(indices);
    };
    /** @hidden */
    ProceduralTexture.prototype._rebuild = function () {
        var vb = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vb) {
            vb._rebuild();
        }
        this._createIndexBuffer();
        if (this.refreshRate === RenderTargetTexture.REFRESHRATE_RENDER_ONCE) {
            this.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        }
    };
    /**
     * Resets the texture in order to recreate its associated resources.
     * This can be called in case of context loss
     */
    ProceduralTexture.prototype.reset = function () {
        var _a;
        (_a = this._drawWrapper.effect) === null || _a === void 0 ? void 0 : _a.dispose();
    };
    ProceduralTexture.prototype._getDefines = function () {
        return "";
    };
    /**
     * Is the texture ready to be used ? (rendered at least once)
     * @returns true if ready, otherwise, false.
     */
    ProceduralTexture.prototype.isReady = function () {
        var _this = this;
        var engine = this._fullEngine;
        var shaders;
        if (this.nodeMaterialSource) {
            return this._drawWrapper.effect.isReady();
        }
        if (!this._fragment) {
            return false;
        }
        if (this._fallbackTextureUsed) {
            return true;
        }
        if (!this._texture) {
            return false;
        }
        var defines = this._getDefines();
        if (this._drawWrapper.effect && defines === this._cachedDefines && this._drawWrapper.effect.isReady()) {
            return true;
        }
        if (this._fragment.fragmentElement !== undefined) {
            shaders = { vertex: "procedural", fragmentElement: this._fragment.fragmentElement };
        }
        else {
            shaders = { vertex: "procedural", fragment: this._fragment };
        }
        if (this._cachedDefines !== defines) {
            this._cachedDefines = defines;
            this._drawWrapper.effect = engine.createEffect(shaders, [VertexBuffer.PositionKind], this._uniforms, this._samplers, defines, undefined, undefined, function () {
                var _a;
                (_a = _this._rtWrapper) === null || _a === void 0 ? void 0 : _a.dispose();
                _this._rtWrapper = _this._texture = null;
                if (_this._fallbackTexture) {
                    _this._texture = _this._fallbackTexture._texture;
                    if (_this._texture) {
                        _this._texture.incrementReferences();
                    }
                }
                _this._fallbackTextureUsed = true;
            });
        }
        return this._drawWrapper.effect.isReady();
    };
    /**
     * Resets the refresh counter of the texture and start bak from scratch.
     * Could be useful to regenerate the texture if it is setup to render only once.
     */
    ProceduralTexture.prototype.resetRefreshCounter = function () {
        this._currentRefreshId = -1;
    };
    /**
     * Set the fragment shader to use in order to render the texture.
     * @param fragment This can be set to a path (into the shader store) or to a json object containing a fragmentElement property.
     */
    ProceduralTexture.prototype.setFragment = function (fragment) {
        this._fragment = fragment;
    };
    Object.defineProperty(ProceduralTexture.prototype, "refreshRate", {
        /**
         * Define the refresh rate of the texture or the rendering frequency.
         * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
         */
        get: function () {
            return this._refreshRate;
        },
        set: function (value) {
            this._refreshRate = value;
            this.resetRefreshCounter();
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    ProceduralTexture.prototype._shouldRender = function () {
        if (!this.isEnabled || !this.isReady() || !this._texture) {
            if (this._texture) {
                this._texture.isReady = false;
            }
            return false;
        }
        if (this._fallbackTextureUsed) {
            return false;
        }
        if (this._currentRefreshId === -1) {
            // At least render once
            this._currentRefreshId = 1;
            this._frameId++;
            return true;
        }
        if (this.refreshRate === this._currentRefreshId) {
            this._currentRefreshId = 1;
            this._frameId++;
            return true;
        }
        this._currentRefreshId++;
        return false;
    };
    /**
     * Get the size the texture is rendering at.
     * @returns the size (on cube texture it is always squared)
     */
    ProceduralTexture.prototype.getRenderSize = function () {
        return this._size;
    };
    /**
     * Resize the texture to new value.
     * @param size Define the new size the texture should have
     * @param generateMipMaps Define whether the new texture should create mip maps
     */
    ProceduralTexture.prototype.resize = function (size, generateMipMaps) {
        if (this._fallbackTextureUsed || !this._rtWrapper || !this._texture) {
            return;
        }
        var isCube = this._texture.isCube;
        this._rtWrapper.dispose();
        var rtWrapper = this._createRtWrapper(isCube, size, generateMipMaps, this._textureType);
        this._texture = rtWrapper.texture;
        // Update properties
        this._size = size;
        this._generateMipMaps = generateMipMaps;
    };
    ProceduralTexture.prototype._checkUniform = function (uniformName) {
        if (this._uniforms.indexOf(uniformName) === -1) {
            this._uniforms.push(uniformName);
        }
    };
    /**
     * Set a texture in the shader program used to render.
     * @param name Define the name of the uniform samplers as defined in the shader
     * @param texture Define the texture to bind to this sampler
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setTexture = function (name, texture) {
        if (this._samplers.indexOf(name) === -1) {
            this._samplers.push(name);
        }
        this._textures[name] = texture;
        return this;
    };
    /**
     * Set a float in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setFloat = function (name, value) {
        this._checkUniform(name);
        this._floats[name] = value;
        return this;
    };
    /**
     * Set a int in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setInt = function (name, value) {
        this._checkUniform(name);
        this._ints[name] = value;
        return this;
    };
    /**
     * Set an array of floats in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setFloats = function (name, value) {
        this._checkUniform(name);
        this._floatsArrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Color3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setColor3 = function (name, value) {
        this._checkUniform(name);
        this._colors3[name] = value;
        return this;
    };
    /**
     * Set a vec4 in the shader from a Color4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setColor4 = function (name, value) {
        this._checkUniform(name);
        this._colors4[name] = value;
        return this;
    };
    /**
     * Set a vec2 in the shader from a Vector2.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setVector2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Vector3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setVector3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3[name] = value;
        return this;
    };
    /**
     * Set a mat4 in the shader from a MAtrix.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setMatrix = function (name, value) {
        this._checkUniform(name);
        this._matrices[name] = value;
        return this;
    };
    /**
     * Render the texture to its associated render target.
     * @param useCameraPostProcess Define if camera post process should be applied to the texture
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ProceduralTexture.prototype.render = function (useCameraPostProcess) {
        var _a, _b;
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = this._fullEngine;
        // Render
        engine.enableEffect(this._drawWrapper);
        this.onBeforeGenerationObservable.notifyObservers(this);
        engine.setState(false);
        if (!this.nodeMaterialSource) {
            // Texture
            for (var name_1 in this._textures) {
                this._drawWrapper.effect.setTexture(name_1, this._textures[name_1]);
            }
            // Float
            for (var name_2 in this._ints) {
                this._drawWrapper.effect.setInt(name_2, this._ints[name_2]);
            }
            // Float
            for (var name_3 in this._floats) {
                this._drawWrapper.effect.setFloat(name_3, this._floats[name_3]);
            }
            // Floats
            for (var name_4 in this._floatsArrays) {
                this._drawWrapper.effect.setArray(name_4, this._floatsArrays[name_4]);
            }
            // Color3
            for (var name_5 in this._colors3) {
                this._drawWrapper.effect.setColor3(name_5, this._colors3[name_5]);
            }
            // Color4
            for (var name_6 in this._colors4) {
                var color = this._colors4[name_6];
                this._drawWrapper.effect.setFloat4(name_6, color.r, color.g, color.b, color.a);
            }
            // Vector2
            for (var name_7 in this._vectors2) {
                this._drawWrapper.effect.setVector2(name_7, this._vectors2[name_7]);
            }
            // Vector3
            for (var name_8 in this._vectors3) {
                this._drawWrapper.effect.setVector3(name_8, this._vectors3[name_8]);
            }
            // Matrix
            for (var name_9 in this._matrices) {
                this._drawWrapper.effect.setMatrix(name_9, this._matrices[name_9]);
            }
        }
        if (!this._texture || !this._rtWrapper) {
            return;
        }
        (_a = engine._debugPushGroup) === null || _a === void 0 ? void 0 : _a.call(engine, "procedural texture generation for ".concat(this.name), 1);
        if (this.isCube) {
            for (var face = 0; face < 6; face++) {
                engine.bindFramebuffer(this._rtWrapper, face, undefined, undefined, true);
                // VBOs
                engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._drawWrapper.effect);
                this._drawWrapper.effect.setFloat("face", face);
                // Clear
                if (this.autoClear) {
                    engine.clear(scene.clearColor, true, false, false);
                }
                // Draw order
                engine.drawElementsType(Material.TriangleFillMode, 0, 6);
            }
        }
        else {
            engine.bindFramebuffer(this._rtWrapper, 0, undefined, undefined, true);
            // VBOs
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._drawWrapper.effect);
            // Clear
            if (this.autoClear) {
                engine.clear(scene.clearColor, true, false, false);
            }
            // Draw order
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        // Unbind
        engine.unBindFramebuffer(this._rtWrapper, this.isCube);
        // Mipmaps
        if (this.isCube) {
            engine.generateMipMapsForCubemap(this._texture);
        }
        (_b = engine._debugPopGroup) === null || _b === void 0 ? void 0 : _b.call(engine, 1);
        if (this.onGenerated) {
            this.onGenerated();
        }
        this.onGeneratedObservable.notifyObservers(this);
    };
    /**
     * Clone the texture.
     * @returns the cloned texture
     */
    ProceduralTexture.prototype.clone = function () {
        var textureSize = this.getSize();
        var newTexture = new ProceduralTexture(this.name, textureSize.width, this._fragment, this.getScene(), this._fallbackTexture, this._generateMipMaps);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        return newTexture;
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    ProceduralTexture.prototype.dispose = function () {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var index = scene.proceduralTextures.indexOf(this);
        if (index >= 0) {
            scene.proceduralTextures.splice(index, 1);
        }
        var vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        if (this._indexBuffer && this._fullEngine._releaseBuffer(this._indexBuffer)) {
            this._indexBuffer = null;
        }
        this.onGeneratedObservable.clear();
        this.onBeforeGenerationObservable.clear();
        _super.prototype.dispose.call(this);
    };
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "autoClear", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "_generateMipMaps", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "_size", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "refreshRate", null);
    return ProceduralTexture;
}(Texture));
export { ProceduralTexture };
RegisterClass("BABYLON.ProceduralTexture", ProceduralTexture);
//# sourceMappingURL=proceduralTexture.js.map