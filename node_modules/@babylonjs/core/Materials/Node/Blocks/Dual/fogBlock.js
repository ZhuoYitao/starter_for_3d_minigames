import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { MaterialHelper } from "../../../materialHelper.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import "../../../../Shaders/ShadersInclude/fogFragmentDeclaration.js";
/**
 * Block used to add support for scene fog
 */
var FogBlock = /** @class */ (function (_super) {
    __extends(FogBlock, _super);
    /**
     * Create a new FogBlock
     * @param name defines the block name
     */
    function FogBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment, false) || this;
        // Vertex
        _this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Vertex);
        _this.registerInput("view", NodeMaterialBlockConnectionPointTypes.Matrix, false, NodeMaterialBlockTargets.Vertex);
        // Fragment
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.Color3, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("fogColor", NodeMaterialBlockConnectionPointTypes.Color3, false, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Color3, NodeMaterialBlockTargets.Fragment);
        _this.input.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        _this.fogColor.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    FogBlock.prototype.getClassName = function () {
        return "FogBlock";
    };
    Object.defineProperty(FogBlock.prototype, "worldPosition", {
        /**
         * Gets the world position input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FogBlock.prototype, "view", {
        /**
         * Gets the view input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FogBlock.prototype, "input", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FogBlock.prototype, "fogColor", {
        /**
         * Gets the fog color input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FogBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    FogBlock.prototype.autoConfigure = function (material) {
        if (!this.view.isConnected) {
            var viewInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.View; });
            if (!viewInput) {
                viewInput = new InputBlock("view");
                viewInput.setAsSystemValue(NodeMaterialSystemValues.View);
            }
            viewInput.output.connectTo(this.view);
        }
        if (!this.fogColor.isConnected) {
            var fogColorInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.FogColor; });
            if (!fogColorInput) {
                fogColorInput = new InputBlock("fogColor", undefined, NodeMaterialBlockConnectionPointTypes.Color3);
                fogColorInput.setAsSystemValue(NodeMaterialSystemValues.FogColor);
            }
            fogColorInput.output.connectTo(this.fogColor);
        }
    };
    FogBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        var scene = mesh.getScene();
        defines.setValue("FOG", nodeMaterial.fogEnabled && MaterialHelper.GetFogState(mesh, scene));
    };
    FogBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        if (!mesh) {
            return;
        }
        var scene = mesh.getScene();
        effect.setFloat4(this._fogParameters, scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
    };
    FogBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.blocksWithDefines.push(this);
            state.sharedData.bindableBlocks.push(this);
            state._emitFunctionFromInclude("fogFragmentDeclaration", "//".concat(this.name), {
                removeUniforms: true,
                removeVaryings: true,
                removeIfDef: false,
                replaceStrings: [{ search: /float CalcFogFactor\(\)/, replace: "float CalcFogFactor(vec3 vFogDistance, vec4 vFogInfos)" }],
            });
            var tempFogVariablename = state._getFreeVariableName("fog");
            var color = this.input;
            var fogColor = this.fogColor;
            this._fogParameters = state._getFreeVariableName("fogParameters");
            var output = this._outputs[0];
            state._emitUniformFromString(this._fogParameters, "vec4");
            state.compilationString += "#ifdef FOG\r\n";
            state.compilationString += "float ".concat(tempFogVariablename, " = CalcFogFactor(").concat(this._fogDistanceName, ", ").concat(this._fogParameters, ");\r\n");
            state.compilationString +=
                this._declareOutput(output, state) +
                    " = ".concat(tempFogVariablename, " * ").concat(color.associatedVariableName, ".rgb + (1.0 - ").concat(tempFogVariablename, ") * ").concat(fogColor.associatedVariableName, ".rgb;\r\n");
            state.compilationString += "#else\r\n".concat(this._declareOutput(output, state), " =  ").concat(color.associatedVariableName, ".rgb;\r\n");
            state.compilationString += "#endif\r\n";
        }
        else {
            var worldPos = this.worldPosition;
            var view = this.view;
            this._fogDistanceName = state._getFreeVariableName("vFogDistance");
            state._emitVaryingFromString(this._fogDistanceName, "vec3");
            state.compilationString += "".concat(this._fogDistanceName, " = (").concat(view.associatedVariableName, " * ").concat(worldPos.associatedVariableName, ").xyz;\r\n");
        }
        return this;
    };
    return FogBlock;
}(NodeMaterialBlock));
export { FogBlock };
RegisterClass("BABYLON.FogBlock", FogBlock);
//# sourceMappingURL=fogBlock.js.map