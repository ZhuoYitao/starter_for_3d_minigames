import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * block used to Generate a Voronoi Noise Pattern
 */
var VoronoiNoiseBlock = /** @class */ (function (_super) {
    __extends(VoronoiNoiseBlock, _super);
    /**
     * Creates a new VoronoiNoiseBlock
     * @param name defines the block name
     */
    function VoronoiNoiseBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("seed", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerInput("offset", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerInput("density", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("cells", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    VoronoiNoiseBlock.prototype.getClassName = function () {
        return "VoronoiNoiseBlock";
    };
    Object.defineProperty(VoronoiNoiseBlock.prototype, "seed", {
        /**
         * Gets the seed input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VoronoiNoiseBlock.prototype, "offset", {
        /**
         * Gets the offset input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VoronoiNoiseBlock.prototype, "density", {
        /**
         * Gets the density input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VoronoiNoiseBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VoronoiNoiseBlock.prototype, "cells", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    VoronoiNoiseBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (!this.seed.isConnected) {
            return;
        }
        var functionString = "vec2 voronoiRandom(vec2 seed, float offset){\n            mat2 m = mat2(15.27, 47.63, 99.41, 89.98);\n            vec2 uv = fract(sin(m * seed) * 46839.32);\n            return vec2(sin(uv.y * offset) * 0.5 + 0.5, cos(uv.x * offset) * 0.5 + 0.5);\n        }\n        ";
        state._emitFunction("voronoiRandom", functionString, "// Voronoi random generator");
        functionString = "void voronoi(vec2 seed, float offset, float density, out float outValue, out float cells){\n            vec2 g = floor(seed * density);\n            vec2 f = fract(seed * density);\n            float t = 8.0;\n            vec3 res = vec3(8.0, 0.0, 0.0);\n\n            for(int y=-1; y<=1; y++)\n            {\n                for(int x=-1; x<=1; x++)\n                {\n                    vec2 lattice = vec2(x,y);\n                    vec2 randomOffset = voronoiRandom(lattice + g, offset);\n                    float d = distance(lattice + randomOffset, f);\n                    if(d < res.x)\n                    {\n                        res = vec3(d, randomOffset.x, randomOffset.y);\n                        outValue = res.x;\n                        cells = res.y;\n                    }\n                }\n            }\n        }\n        ";
        state._emitFunction("voronoi", functionString, "// Voronoi");
        var tempOutput = state._getFreeVariableName("tempOutput");
        var tempCells = state._getFreeVariableName("tempCells");
        state.compilationString += "float ".concat(tempOutput, " = 0.0;\r\n");
        state.compilationString += "float ".concat(tempCells, " = 0.0;\r\n");
        state.compilationString += "voronoi(".concat(this.seed.associatedVariableName, ", ").concat(this.offset.associatedVariableName, ", ").concat(this.density.associatedVariableName, ", ").concat(tempOutput, ", ").concat(tempCells, ");\r\n");
        if (this.output.hasEndpoints) {
            state.compilationString += this._declareOutput(this.output, state) + " = ".concat(tempOutput, ";\r\n");
        }
        if (this.cells.hasEndpoints) {
            state.compilationString += this._declareOutput(this.cells, state) + " = ".concat(tempCells, ";\r\n");
        }
        return this;
    };
    return VoronoiNoiseBlock;
}(NodeMaterialBlock));
export { VoronoiNoiseBlock };
RegisterClass("BABYLON.VoronoiNoiseBlock", VoronoiNoiseBlock);
//# sourceMappingURL=voronoiNoiseBlock.js.map