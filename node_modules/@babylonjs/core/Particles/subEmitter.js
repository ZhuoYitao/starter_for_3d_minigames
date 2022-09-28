import { Vector3 } from "../Maths/math.vector.js";
import { _WarnImport } from "../Misc/devTools.js";
import { GetClass } from "../Misc/typeStore.js";
/**
 * Type of sub emitter
 */
export var SubEmitterType;
(function (SubEmitterType) {
    /**
     * Attached to the particle over it's lifetime
     */
    SubEmitterType[SubEmitterType["ATTACHED"] = 0] = "ATTACHED";
    /**
     * Created when the particle dies
     */
    SubEmitterType[SubEmitterType["END"] = 1] = "END";
})(SubEmitterType || (SubEmitterType = {}));
/**
 * Sub emitter class used to emit particles from an existing particle
 */
var SubEmitter = /** @class */ (function () {
    /**
     * Creates a sub emitter
     * @param particleSystem the particle system to be used by the sub emitter
     */
    function SubEmitter(
    /**
     * the particle system to be used by the sub emitter
     */
    particleSystem) {
        this.particleSystem = particleSystem;
        /**
         * Type of the submitter (Default: END)
         */
        this.type = SubEmitterType.END;
        /**
         * If the particle should inherit the direction from the particle it's attached to. (+Y will face the direction the particle is moving) (Default: false)
         * Note: This only is supported when using an emitter of type Mesh
         */
        this.inheritDirection = false;
        /**
         * How much of the attached particles speed should be added to the sub emitted particle (default: 0)
         */
        this.inheritedVelocityAmount = 0;
        // Create mesh as emitter to support rotation
        if (!particleSystem.emitter || !particleSystem.emitter.dispose) {
            var internalClass = GetClass("BABYLON.AbstractMesh");
            particleSystem.emitter = new internalClass("SubemitterSystemEmitter", particleSystem.getScene());
            particleSystem._disposeEmitterOnDispose = true;
        }
    }
    /**
     * Clones the sub emitter
     * @returns the cloned sub emitter
     */
    SubEmitter.prototype.clone = function () {
        // Clone particle system
        var emitter = this.particleSystem.emitter;
        if (!emitter) {
            emitter = new Vector3();
        }
        else if (emitter instanceof Vector3) {
            emitter = emitter.clone();
        }
        else if (emitter.getClassName().indexOf("Mesh") !== -1) {
            var internalClass = GetClass("BABYLON.Mesh");
            emitter = new internalClass("", emitter.getScene());
            emitter.isVisible = false;
        }
        var clone = new SubEmitter(this.particleSystem.clone(this.particleSystem.name, emitter));
        // Clone properties
        clone.particleSystem.name += "Clone";
        clone.type = this.type;
        clone.inheritDirection = this.inheritDirection;
        clone.inheritedVelocityAmount = this.inheritedVelocityAmount;
        clone.particleSystem._disposeEmitterOnDispose = true;
        clone.particleSystem.disposeOnStop = true;
        return clone;
    };
    /**
     * Serialize current object to a JSON object
     * @param serializeTexture defines if the texture must be serialized as well
     * @returns the serialized object
     */
    SubEmitter.prototype.serialize = function (serializeTexture) {
        if (serializeTexture === void 0) { serializeTexture = false; }
        var serializationObject = {};
        serializationObject.type = this.type;
        serializationObject.inheritDirection = this.inheritDirection;
        serializationObject.inheritedVelocityAmount = this.inheritedVelocityAmount;
        serializationObject.particleSystem = this.particleSystem.serialize(serializeTexture);
        return serializationObject;
    };
    /**
     * @param system
     * @param sceneOrEngine
     * @param rootUrl
     * @param doNotStart
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SubEmitter._ParseParticleSystem = function (system, sceneOrEngine, rootUrl, doNotStart) {
        if (doNotStart === void 0) { doNotStart = false; }
        throw _WarnImport("ParseParticle");
    };
    /**
     * Creates a new SubEmitter from a serialized JSON version
     * @param serializationObject defines the JSON object to read from
     * @param sceneOrEngine defines the hosting scene or the hosting engine
     * @param rootUrl defines the rootUrl for data loading
     * @returns a new SubEmitter
     */
    SubEmitter.Parse = function (serializationObject, sceneOrEngine, rootUrl) {
        var system = serializationObject.particleSystem;
        var subEmitter = new SubEmitter(SubEmitter._ParseParticleSystem(system, sceneOrEngine, rootUrl, true));
        subEmitter.type = serializationObject.type;
        subEmitter.inheritDirection = serializationObject.inheritDirection;
        subEmitter.inheritedVelocityAmount = serializationObject.inheritedVelocityAmount;
        subEmitter.particleSystem._isSubEmitter = true;
        return subEmitter;
    };
    /** Release associated resources */
    SubEmitter.prototype.dispose = function () {
        this.particleSystem.dispose();
    };
    return SubEmitter;
}());
export { SubEmitter };
//# sourceMappingURL=subEmitter.js.map