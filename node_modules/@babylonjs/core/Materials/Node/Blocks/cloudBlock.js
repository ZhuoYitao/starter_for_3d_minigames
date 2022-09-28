import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../nodeMaterialDecorator.js";
/**
 * block used to Generate Fractal Brownian Motion Clouds
 */
var CloudBlock = /** @class */ (function (_super) {
    __extends(CloudBlock, _super);
    /**
     * Creates a new CloudBlock
     * @param name defines the block name
     */
    function CloudBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /** Gets or sets the number of octaves */
        _this.octaves = 6.0;
        _this.registerInput("seed", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("chaos", NodeMaterialBlockConnectionPointTypes.AutoDetect, true);
        _this.registerInput("offsetX", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("offsetY", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("offsetZ", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector2);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._linkConnectionTypes(0, 1);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    CloudBlock.prototype.getClassName = function () {
        return "CloudBlock";
    };
    Object.defineProperty(CloudBlock.prototype, "seed", {
        /**
         * Gets the seed input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CloudBlock.prototype, "chaos", {
        /**
         * Gets the chaos input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CloudBlock.prototype, "offsetX", {
        /**
         * Gets the offset X input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CloudBlock.prototype, "offsetY", {
        /**
         * Gets the offset Y input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CloudBlock.prototype, "offsetZ", {
        /**
         * Gets the offset Z input component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CloudBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    CloudBlock.prototype._buildBlock = function (state) {
        var _a, _b;
        _super.prototype._buildBlock.call(this, state);
        if (!this.seed.isConnected) {
            return;
        }
        if (!this._outputs[0].hasEndpoints) {
            return;
        }
        var functionString = "\n\n        float cloudRandom(in float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }\n\n        // Based on Morgan McGuire @morgan3d\n        // https://www.shadertoy.com/view/4dS3Wd\n        float cloudNoise(in vec2 x, in vec2 chaos) {\n            vec2 step = chaos * vec2(75., 120.) + vec2(75., 120.);\n\n            vec2 i = floor(x);\n            vec2 f = fract(x);\n\n            float n = dot(i, step);\n\n            vec2 u = f * f * (3.0 - 2.0 * f);\n            return mix(\n                    mix(cloudRandom(n + dot(step, vec2(0, 0))), cloudRandom(n + dot(step, vec2(1, 0))), u.x),\n                    mix(cloudRandom(n + dot(step, vec2(0, 1))), cloudRandom(n + dot(step, vec2(1, 1))), u.x),\n                    u.y\n                );\n        }\n\n        float cloudNoise(in vec3 x, in vec3 chaos) {\n            vec3 step = chaos * vec3(60., 120., 75.) + vec3(60., 120., 75.);\n\n            vec3 i = floor(x);\n            vec3 f = fract(x);\n\n            float n = dot(i, step);\n\n            vec3 u = f * f * (3.0 - 2.0 * f);\n            return mix(mix(mix( cloudRandom(n + dot(step, vec3(0, 0, 0))), cloudRandom(n + dot(step, vec3(1, 0, 0))), u.x),\n                           mix( cloudRandom(n + dot(step, vec3(0, 1, 0))), cloudRandom(n + dot(step, vec3(1, 1, 0))), u.x), u.y),\n                       mix(mix( cloudRandom(n + dot(step, vec3(0, 0, 1))), cloudRandom(n + dot(step, vec3(1, 0, 1))), u.x),\n                           mix( cloudRandom(n + dot(step, vec3(0, 1, 1))), cloudRandom(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);\n        }";
        var fractalBrownianString = "\n        float fbm(in vec2 st, in vec2 chaos) {\n            // Initial values\n            float value = 0.0;\n            float amplitude = .5;\n            float frequency = 0.;\n\n            // Loop of octaves\n            for (int i = 0; i < OCTAVES; i++) {\n                value += amplitude * cloudNoise(st, chaos);\n                st *= 2.0;\n                amplitude *= 0.5;\n            }\n            return value;\n        }\n\n        float fbm(in vec3 x, in vec3 chaos) {\n            // Initial values\n            float value = 0.0;\n            float amplitude = 0.5;\n            for (int i = 0; i < OCTAVES; ++i) {\n                value += amplitude * cloudNoise(x, chaos);\n                x = x * 2.0;\n                amplitude *= 0.5;\n            }\n            return value;\n        }";
        var fbmNewName = "fbm".concat(this.octaves);
        state._emitFunction("CloudBlockCode", functionString, "// CloudBlockCode");
        state._emitFunction("CloudBlockCodeFBM" + this.octaves, fractalBrownianString.replace(/fbm/gi, fbmNewName).replace(/OCTAVES/gi, (this.octaves | 0).toString()), "// CloudBlockCode FBM");
        var localVariable = state._getFreeVariableName("st");
        var seedType = ((_a = this.seed.connectedPoint) === null || _a === void 0 ? void 0 : _a.type) === NodeMaterialBlockConnectionPointTypes.Vector2 ? "vec2" : "vec3";
        state.compilationString += "".concat(seedType, " ").concat(localVariable, " = ").concat(this.seed.associatedVariableName, ";\r\n");
        if (this.offsetX.isConnected) {
            state.compilationString += "".concat(localVariable, ".x += 0.1 * ").concat(this.offsetX.associatedVariableName, ";\r\n");
        }
        if (this.offsetY.isConnected) {
            state.compilationString += "".concat(localVariable, ".y += 0.1 * ").concat(this.offsetY.associatedVariableName, ";\r\n");
        }
        if (this.offsetZ.isConnected && seedType === "vec3") {
            state.compilationString += "".concat(localVariable, ".z += 0.1 * ").concat(this.offsetZ.associatedVariableName, ";\r\n");
        }
        var chaosValue = "";
        if (this.chaos.isConnected) {
            chaosValue = this.chaos.associatedVariableName;
        }
        else {
            chaosValue = ((_b = this.seed.connectedPoint) === null || _b === void 0 ? void 0 : _b.type) === NodeMaterialBlockConnectionPointTypes.Vector2 ? "vec2(0., 0.)" : "vec3(0., 0., 0.)";
        }
        state.compilationString += this._declareOutput(this._outputs[0], state) + " = ".concat(fbmNewName, "(").concat(localVariable, ", ").concat(chaosValue, ");\r\n");
        return this;
    };
    CloudBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this) + "".concat(this._codeVariableName, ".octaves = ").concat(this.octaves, ";\r\n");
        return codeString;
    };
    CloudBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.octaves = this.octaves;
        return serializationObject;
    };
    CloudBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.octaves = serializationObject.octaves;
    };
    __decorate([
        editableInPropertyPage("Octaves", PropertyTypeForEdition.Int)
    ], CloudBlock.prototype, "octaves", void 0);
    return CloudBlock;
}(NodeMaterialBlock));
export { CloudBlock };
RegisterClass("BABYLON.CloudBlock", CloudBlock);
//# sourceMappingURL=cloudBlock.js.map