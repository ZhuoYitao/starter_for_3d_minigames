import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { InputBlock } from "../Input/inputBlock.js";
/**
 * Block used to transform a vector3 or a vector4 into screen space
 */
var ScreenSpaceBlock = /** @class */ (function (_super) {
    __extends(ScreenSpaceBlock, _super);
    /**
     * Creates a new ScreenSpaceBlock
     * @param name defines the block name
     */
    function ScreenSpaceBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this.registerInput("vector", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("worldViewProjection", NodeMaterialBlockConnectionPointTypes.Matrix);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("x", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("y", NodeMaterialBlockConnectionPointTypes.Float);
        _this.inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ScreenSpaceBlock.prototype.getClassName = function () {
        return "ScreenSpaceBlock";
    };
    Object.defineProperty(ScreenSpaceBlock.prototype, "vector", {
        /**
         * Gets the vector input
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceBlock.prototype, "worldViewProjection", {
        /**
         * Gets the worldViewProjection transform input
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceBlock.prototype, "x", {
        /**
         * Gets the x output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSpaceBlock.prototype, "y", {
        /**
         * Gets the y output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    ScreenSpaceBlock.prototype.autoConfigure = function (material) {
        if (!this.worldViewProjection.isConnected) {
            var worldViewProjectionInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.WorldViewProjection; });
            if (!worldViewProjectionInput) {
                worldViewProjectionInput = new InputBlock("worldViewProjection");
                worldViewProjectionInput.setAsSystemValue(NodeMaterialSystemValues.WorldViewProjection);
            }
            worldViewProjectionInput.output.connectTo(this.worldViewProjection);
        }
    };
    ScreenSpaceBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var vector = this.vector;
        var worldViewProjection = this.worldViewProjection;
        if (!vector.connectedPoint) {
            return;
        }
        var worldViewProjectionName = worldViewProjection.associatedVariableName;
        var tempVariableName = state._getFreeVariableName("screenSpaceTemp");
        switch (vector.connectedPoint.type) {
            case NodeMaterialBlockConnectionPointTypes.Vector3:
                state.compilationString += "vec4 ".concat(tempVariableName, " = ").concat(worldViewProjectionName, " * vec4(").concat(vector.associatedVariableName, ", 1.0);\r\n");
                break;
            case NodeMaterialBlockConnectionPointTypes.Vector4:
                state.compilationString += "vec4 ".concat(tempVariableName, " = ").concat(worldViewProjectionName, " * ").concat(vector.associatedVariableName, ";\r\n");
                break;
        }
        state.compilationString += "".concat(tempVariableName, ".xy /= ").concat(tempVariableName, ".w;");
        state.compilationString += "".concat(tempVariableName, ".xy = ").concat(tempVariableName, ".xy * 0.5 + vec2(0.5, 0.5);");
        if (this.output.hasEndpoints) {
            state.compilationString += this._declareOutput(this.output, state) + " = ".concat(tempVariableName, ".xy;\r\n");
        }
        if (this.x.hasEndpoints) {
            state.compilationString += this._declareOutput(this.x, state) + " = ".concat(tempVariableName, ".x;\r\n");
        }
        if (this.y.hasEndpoints) {
            state.compilationString += this._declareOutput(this.y, state) + " = ".concat(tempVariableName, ".y;\r\n");
        }
        return this;
    };
    return ScreenSpaceBlock;
}(NodeMaterialBlock));
export { ScreenSpaceBlock };
RegisterClass("BABYLON.ScreenSpaceBlock", ScreenSpaceBlock);
//# sourceMappingURL=screenSpaceBlock.js.map