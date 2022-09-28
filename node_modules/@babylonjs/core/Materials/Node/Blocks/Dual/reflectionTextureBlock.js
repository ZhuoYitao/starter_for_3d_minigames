import { __extends } from "tslib";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { ReflectionTextureBaseBlock } from "./reflectionTextureBaseBlock.js";
/**
 * Block used to read a reflection texture from a sampler
 */
var ReflectionTextureBlock = /** @class */ (function (_super) {
    __extends(ReflectionTextureBlock, _super);
    /**
     * Create a new ReflectionTextureBlock
     * @param name defines the block name
     */
    function ReflectionTextureBlock(name) {
        var _this = _super.call(this, name) || this;
        _this.registerInput("position", NodeMaterialBlockConnectionPointTypes.Vector3, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("worldNormal", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Fragment); // Flagging as fragment as the normal can be changed by fragment code
        _this.registerInput("world", NodeMaterialBlockConnectionPointTypes.Matrix, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("cameraPosition", NodeMaterialBlockConnectionPointTypes.Vector3, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("view", NodeMaterialBlockConnectionPointTypes.Matrix, false, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("rgb", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("rgba", NodeMaterialBlockConnectionPointTypes.Color4, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("r", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("g", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("b", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("a", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ReflectionTextureBlock.prototype.getClassName = function () {
        return "ReflectionTextureBlock";
    };
    Object.defineProperty(ReflectionTextureBlock.prototype, "position", {
        /**
         * Gets the world position input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "worldPosition", {
        /**
         * Gets the world position input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "worldNormal", {
        /**
         * Gets the world normal input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "world", {
        /**
         * Gets the world input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "cameraPosition", {
        /**
         * Gets the camera (or eye) position component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "view", {
        /**
         * Gets the view input component
         */
        get: function () {
            return this._inputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "rgb", {
        /**
         * Gets the rgb output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "rgba", {
        /**
         * Gets the rgba output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "r", {
        /**
         * Gets the r output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "g", {
        /**
         * Gets the g output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "b", {
        /**
         * Gets the b output component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionTextureBlock.prototype, "a", {
        /**
         * Gets the a output component
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    ReflectionTextureBlock.prototype.autoConfigure = function (material) {
        _super.prototype.autoConfigure.call(this, material);
        if (!this.cameraPosition.isConnected) {
            var cameraPositionInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.CameraPosition; });
            if (!cameraPositionInput) {
                cameraPositionInput = new InputBlock("cameraPosition");
                cameraPositionInput.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);
            }
            cameraPositionInput.output.connectTo(this.cameraPosition);
        }
    };
    ReflectionTextureBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (!this.texture) {
            state.compilationString += this.writeOutputs(state, "vec3(0.)");
            return this;
        }
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            state.compilationString += this.handleVertexSide(state);
            return this;
        }
        this.handleFragmentSideInits(state);
        var normalWUnit = state._getFreeVariableName("normalWUnit");
        state.compilationString += "vec4 ".concat(normalWUnit, " = normalize(").concat(this.worldNormal.associatedVariableName, ");\r\n");
        state.compilationString += this.handleFragmentSideCodeReflectionCoords(normalWUnit);
        state.compilationString += this.handleFragmentSideCodeReflectionColor(undefined, "");
        state.compilationString += this.writeOutputs(state, this._reflectionColorName);
        return this;
    };
    return ReflectionTextureBlock;
}(ReflectionTextureBaseBlock));
export { ReflectionTextureBlock };
RegisterClass("BABYLON.ReflectionTextureBlock", ReflectionTextureBlock);
//# sourceMappingURL=reflectionTextureBlock.js.map