import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to output the vertex position
 */
var VertexOutputBlock = /** @class */ (function (_super) {
    __extends(VertexOutputBlock, _super);
    /**
     * Creates a new VertexOutputBlock
     * @param name defines the block name
     */
    function VertexOutputBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Vertex, true) || this;
        _this.registerInput("vector", NodeMaterialBlockConnectionPointTypes.Vector4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    VertexOutputBlock.prototype.getClassName = function () {
        return "VertexOutputBlock";
    };
    Object.defineProperty(VertexOutputBlock.prototype, "vector", {
        /**
         * Gets the vector input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    VertexOutputBlock.prototype._isLogarithmicDepthEnabled = function (nodeList) {
        for (var _i = 0, nodeList_1 = nodeList; _i < nodeList_1.length; _i++) {
            var node = nodeList_1[_i];
            if (node.useLogarithmicDepth) {
                return true;
            }
        }
        return false;
    };
    VertexOutputBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var input = this.vector;
        state.compilationString += "gl_Position = ".concat(input.associatedVariableName, ";\r\n");
        if (this._isLogarithmicDepthEnabled(state.sharedData.fragmentOutputNodes)) {
            state._emitUniformFromString("logarithmicDepthConstant", "float");
            state._emitVaryingFromString("vFragmentDepth", "float");
            state.compilationString += "vFragmentDepth = 1.0 + gl_Position.w;\r\n";
            state.compilationString += "gl_Position.z = log2(max(0.000001, vFragmentDepth)) * logarithmicDepthConstant;\r\n";
        }
        return this;
    };
    return VertexOutputBlock;
}(NodeMaterialBlock));
export { VertexOutputBlock };
RegisterClass("BABYLON.VertexOutputBlock", VertexOutputBlock);
//# sourceMappingURL=vertexOutputBlock.js.map