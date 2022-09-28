import { Tools } from "../Misc/tools.js";
import { Matrix, Vector3 } from "../Maths/math.vector.js";
import { Scalar } from "../Maths/math.scalar.js";
import { EngineStore } from "../Engines/engineStore.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Ray } from "../Culling/ray.js";
import { Material } from "../Materials/material.js";
import { LensFlare } from "./lensFlare.js";

import "../Shaders/lensFlare.fragment.js";
import "../Shaders/lensFlare.vertex.js";
import { _WarnImport } from "../Misc/devTools.js";
import { Color3 } from "../Maths/math.color.js";
/**
 * This represents a Lens Flare System or the shiny effect created by the light reflection on the  camera lenses.
 * It is usually composed of several `lensFlare`.
 * @see https://doc.babylonjs.com/how_to/how_to_use_lens_flares
 */
var LensFlareSystem = /** @class */ (function () {
    /**
     * Instantiates a lens flare system.
     * This represents a Lens Flare System or the shiny effect created by the light reflection on the  camera lenses.
     * It is usually composed of several `lensFlare`.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lens_flares
     * @param name Define the name of the lens flare system in the scene
     * @param emitter Define the source (the emitter) of the lens flares (it can be a camera, a light or a mesh).
     * @param scene Define the scene the lens flare system belongs to
     */
    function LensFlareSystem(
    /**
     * Define the name of the lens flare system
     */
    name, emitter, scene) {
        this.name = name;
        /**
         * List of lens flares used in this system.
         */
        this.lensFlares = new Array();
        /**
         * Define a limit from the border the lens flare can be visible.
         */
        this.borderLimit = 300;
        /**
         * Define a viewport border we do not want to see the lens flare in.
         */
        this.viewportBorder = 0;
        /**
         * Restricts the rendering of the effect to only the camera rendering this layer mask.
         */
        this.layerMask = 0x0fffffff;
        this._vertexBuffers = {};
        this._isEnabled = true;
        this._scene = scene || EngineStore.LastCreatedScene;
        LensFlareSystem._SceneComponentInitialization(this._scene);
        this._emitter = emitter;
        this.id = name;
        scene.lensFlareSystems.push(this);
        this.meshesSelectionPredicate = function (m) {
            return (scene.activeCamera && m.material && m.isVisible && m.isEnabled() && m.isBlocker && (m.layerMask & scene.activeCamera.layerMask) != 0);
        };
        var engine = scene.getEngine();
        // VBO
        var vertices = [];
        vertices.push(1, 1);
        vertices.push(-1, 1);
        vertices.push(-1, -1);
        vertices.push(1, -1);
        this._vertexBuffers[VertexBuffer.PositionKind] = new VertexBuffer(engine, vertices, VertexBuffer.PositionKind, false, false, 2);
        // Indices
        this._createIndexBuffer();
    }
    Object.defineProperty(LensFlareSystem.prototype, "scene", {
        /** Gets the scene */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    LensFlareSystem.prototype._createIndexBuffer = function () {
        var indices = [];
        indices.push(0);
        indices.push(1);
        indices.push(2);
        indices.push(0);
        indices.push(2);
        indices.push(3);
        this._indexBuffer = this._scene.getEngine().createIndexBuffer(indices);
    };
    Object.defineProperty(LensFlareSystem.prototype, "isEnabled", {
        /**
         * Define if the lens flare system is enabled.
         */
        get: function () {
            return this._isEnabled;
        },
        set: function (value) {
            this._isEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the scene the effects belongs to.
     * @returns the scene holding the lens flare system
     */
    LensFlareSystem.prototype.getScene = function () {
        return this._scene;
    };
    /**
     * Get the emitter of the lens flare system.
     * It defines the source of the lens flares (it can be a camera, a light or a mesh).
     * @returns the emitter of the lens flare system
     */
    LensFlareSystem.prototype.getEmitter = function () {
        return this._emitter;
    };
    /**
     * Set the emitter of the lens flare system.
     * It defines the source of the lens flares (it can be a camera, a light or a mesh).
     * @param newEmitter Define the new emitter of the system
     */
    LensFlareSystem.prototype.setEmitter = function (newEmitter) {
        this._emitter = newEmitter;
    };
    /**
     * Get the lens flare system emitter position.
     * The emitter defines the source of the lens flares (it can be a camera, a light or a mesh).
     * @returns the position
     */
    LensFlareSystem.prototype.getEmitterPosition = function () {
        return this._emitter.getAbsolutePosition ? this._emitter.getAbsolutePosition() : this._emitter.position;
    };
    /**
     * @param globalViewport
     * @hidden
     */
    LensFlareSystem.prototype.computeEffectivePosition = function (globalViewport) {
        var position = this.getEmitterPosition();
        position = Vector3.Project(position, Matrix.Identity(), this._scene.getTransformMatrix(), globalViewport);
        this._positionX = position.x;
        this._positionY = position.y;
        position = Vector3.TransformCoordinates(this.getEmitterPosition(), this._scene.getViewMatrix());
        if (this.viewportBorder > 0) {
            globalViewport.x -= this.viewportBorder;
            globalViewport.y -= this.viewportBorder;
            globalViewport.width += this.viewportBorder * 2;
            globalViewport.height += this.viewportBorder * 2;
            position.x += this.viewportBorder;
            position.y += this.viewportBorder;
            this._positionX += this.viewportBorder;
            this._positionY += this.viewportBorder;
        }
        var rhs = this._scene.useRightHandedSystem;
        var okZ = (position.z > 0 && !rhs) || (position.z < 0 && rhs);
        if (okZ) {
            if (this._positionX > globalViewport.x && this._positionX < globalViewport.x + globalViewport.width) {
                if (this._positionY > globalViewport.y && this._positionY < globalViewport.y + globalViewport.height) {
                    return true;
                }
            }
            return true;
        }
        return false;
    };
    /** @hidden */
    LensFlareSystem.prototype._isVisible = function () {
        if (!this._isEnabled || !this._scene.activeCamera) {
            return false;
        }
        var emitterPosition = this.getEmitterPosition();
        var direction = emitterPosition.subtract(this._scene.activeCamera.globalPosition);
        var distance = direction.length();
        direction.normalize();
        var ray = new Ray(this._scene.activeCamera.globalPosition, direction);
        var pickInfo = this._scene.pickWithRay(ray, this.meshesSelectionPredicate, true);
        return !pickInfo || !pickInfo.hit || pickInfo.distance > distance;
    };
    /**
     * @hidden
     */
    LensFlareSystem.prototype.render = function () {
        if (!this._scene.activeCamera) {
            return false;
        }
        var engine = this._scene.getEngine();
        var viewport = this._scene.activeCamera.viewport;
        var globalViewport = viewport.toGlobal(engine.getRenderWidth(true), engine.getRenderHeight(true));
        // Position
        if (!this.computeEffectivePosition(globalViewport)) {
            return false;
        }
        // Visibility
        if (!this._isVisible()) {
            return false;
        }
        // Intensity
        var awayX;
        var awayY;
        if (this._positionX < this.borderLimit + globalViewport.x) {
            awayX = this.borderLimit + globalViewport.x - this._positionX;
        }
        else if (this._positionX > globalViewport.x + globalViewport.width - this.borderLimit) {
            awayX = this._positionX - globalViewport.x - globalViewport.width + this.borderLimit;
        }
        else {
            awayX = 0;
        }
        if (this._positionY < this.borderLimit + globalViewport.y) {
            awayY = this.borderLimit + globalViewport.y - this._positionY;
        }
        else if (this._positionY > globalViewport.y + globalViewport.height - this.borderLimit) {
            awayY = this._positionY - globalViewport.y - globalViewport.height + this.borderLimit;
        }
        else {
            awayY = 0;
        }
        var away = awayX > awayY ? awayX : awayY;
        away -= this.viewportBorder;
        if (away > this.borderLimit) {
            away = this.borderLimit;
        }
        var intensity = 1.0 - Scalar.Clamp(away / this.borderLimit, 0, 1);
        if (intensity < 0) {
            return false;
        }
        if (intensity > 1.0) {
            intensity = 1.0;
        }
        if (this.viewportBorder > 0) {
            globalViewport.x += this.viewportBorder;
            globalViewport.y += this.viewportBorder;
            globalViewport.width -= this.viewportBorder * 2;
            globalViewport.height -= this.viewportBorder * 2;
            this._positionX -= this.viewportBorder;
            this._positionY -= this.viewportBorder;
        }
        // Position
        var centerX = globalViewport.x + globalViewport.width / 2;
        var centerY = globalViewport.y + globalViewport.height / 2;
        var distX = centerX - this._positionX;
        var distY = centerY - this._positionY;
        // Effects
        engine.setState(false);
        engine.setDepthBuffer(false);
        // Flares
        for (var index = 0; index < this.lensFlares.length; index++) {
            var flare = this.lensFlares[index];
            if (!flare._drawWrapper.effect.isReady() || (flare.texture && !flare.texture.isReady())) {
                continue;
            }
            engine.enableEffect(flare._drawWrapper);
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, flare._drawWrapper.effect);
            engine.setAlphaMode(flare.alphaMode);
            var x = centerX - distX * flare.position;
            var y = centerY - distY * flare.position;
            var cw = flare.size;
            var ch = flare.size * engine.getAspectRatio(this._scene.activeCamera, true);
            var cx = 2 * (x / (globalViewport.width + globalViewport.x * 2)) - 1.0;
            var cy = 1.0 - 2 * (y / (globalViewport.height + globalViewport.y * 2));
            var viewportMatrix = Matrix.FromValues(cw / 2, 0, 0, 0, 0, ch / 2, 0, 0, 0, 0, 1, 0, cx, cy, 0, 1);
            flare._drawWrapper.effect.setMatrix("viewportMatrix", viewportMatrix);
            // Texture
            flare._drawWrapper.effect.setTexture("textureSampler", flare.texture);
            // Color
            flare._drawWrapper.effect.setFloat4("color", flare.color.r * intensity, flare.color.g * intensity, flare.color.b * intensity, 1.0);
            // Draw order
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        engine.setDepthBuffer(true);
        engine.setAlphaMode(0);
        return true;
    };
    /**
     * Rebuilds the lens flare system
     */
    LensFlareSystem.prototype.rebuild = function () {
        var _a;
        this._createIndexBuffer();
        for (var key in this._vertexBuffers) {
            (_a = this._vertexBuffers[key]) === null || _a === void 0 ? void 0 : _a._rebuild();
        }
    };
    /**
     * Dispose and release the lens flare with its associated resources.
     */
    LensFlareSystem.prototype.dispose = function () {
        var vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        if (this._indexBuffer) {
            this._scene.getEngine()._releaseBuffer(this._indexBuffer);
            this._indexBuffer = null;
        }
        while (this.lensFlares.length) {
            this.lensFlares[0].dispose();
        }
        // Remove from scene
        var index = this._scene.lensFlareSystems.indexOf(this);
        this._scene.lensFlareSystems.splice(index, 1);
    };
    /**
     * Parse a lens flare system from a JSON representation
     * @param parsedLensFlareSystem Define the JSON to parse
     * @param scene Define the scene the parsed system should be instantiated in
     * @param rootUrl Define the rootUrl of the load sequence to easily find a load relative dependencies such as textures
     * @returns the parsed system
     */
    LensFlareSystem.Parse = function (parsedLensFlareSystem, scene, rootUrl) {
        var emitter = scene.getLastEntryById(parsedLensFlareSystem.emitterId);
        var name = parsedLensFlareSystem.name || "lensFlareSystem#" + parsedLensFlareSystem.emitterId;
        var lensFlareSystem = new LensFlareSystem(name, emitter, scene);
        lensFlareSystem.id = parsedLensFlareSystem.id || name;
        lensFlareSystem.borderLimit = parsedLensFlareSystem.borderLimit;
        for (var index = 0; index < parsedLensFlareSystem.flares.length; index++) {
            var parsedFlare = parsedLensFlareSystem.flares[index];
            LensFlare.AddFlare(parsedFlare.size, parsedFlare.position, Color3.FromArray(parsedFlare.color), parsedFlare.textureName ? rootUrl + parsedFlare.textureName : "", lensFlareSystem);
        }
        return lensFlareSystem;
    };
    /**
     * Serialize the current Lens Flare System into a JSON representation.
     * @returns the serialized JSON
     */
    LensFlareSystem.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.id = this.id;
        serializationObject.name = this.name;
        serializationObject.emitterId = this.getEmitter().id;
        serializationObject.borderLimit = this.borderLimit;
        serializationObject.flares = [];
        for (var index = 0; index < this.lensFlares.length; index++) {
            var flare = this.lensFlares[index];
            serializationObject.flares.push({
                size: flare.size,
                position: flare.position,
                color: flare.color.asArray(),
                textureName: Tools.GetFilename(flare.texture ? flare.texture.name : ""),
            });
        }
        return serializationObject;
    };
    /**
     * @param _
     * @hidden
     */
    LensFlareSystem._SceneComponentInitialization = function (_) {
        throw _WarnImport("LensFlareSystemSceneComponent");
    };
    return LensFlareSystem;
}());
export { LensFlareSystem };
//# sourceMappingURL=lensFlareSystem.js.map