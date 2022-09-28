import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import "../../../../Shaders/ShadersInclude/helperFunctions.js";
import "../../../../Shaders/ShadersInclude/imageProcessingDeclaration.js";
import "../../../../Shaders/ShadersInclude/imageProcessingFunctions.js";
/**
 * Block used to add image processing support to fragment shader
 */
var ImageProcessingBlock = /** @class */ (function (_super) {
    __extends(ImageProcessingBlock, _super);
    /**
     * Create a new ImageProcessingBlock
     * @param name defines the block name
     */
    function ImageProcessingBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        /**
         * Defines if the input should be converted to linear space (default: true)
         */
        _this.convertInputToLinearSpace = true;
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color4);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Color4);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ImageProcessingBlock.prototype.getClassName = function () {
        return "ImageProcessingBlock";
    };
    Object.defineProperty(ImageProcessingBlock.prototype, "color", {
        /**
         * Gets the color input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImageProcessingBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    ImageProcessingBlock.prototype.initialize = function (state) {
        state._excludeVariableName("exposureLinear");
        state._excludeVariableName("contrast");
        state._excludeVariableName("vInverseScreenSize");
        state._excludeVariableName("vignetteSettings1");
        state._excludeVariableName("vignetteSettings2");
        state._excludeVariableName("vCameraColorCurveNegative");
        state._excludeVariableName("vCameraColorCurveNeutral");
        state._excludeVariableName("vCameraColorCurvePositive");
        state._excludeVariableName("txColorTransform");
        state._excludeVariableName("colorTransformSettings");
    };
    ImageProcessingBlock.prototype.isReady = function (mesh, nodeMaterial, defines) {
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            if (!nodeMaterial.imageProcessingConfiguration.isReady()) {
                return false;
            }
        }
        return true;
    };
    ImageProcessingBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            nodeMaterial.imageProcessingConfiguration.prepareDefines(defines);
        }
    };
    ImageProcessingBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        if (!mesh) {
            return;
        }
        if (!nodeMaterial.imageProcessingConfiguration) {
            return;
        }
        nodeMaterial.imageProcessingConfiguration.bind(effect);
    };
    ImageProcessingBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        // Register for defines
        state.sharedData.blocksWithDefines.push(this);
        // Register for blocking
        state.sharedData.blockingBlocks.push(this);
        // Register for binding
        state.sharedData.bindableBlocks.push(this);
        // Uniforms
        state.uniforms.push("exposureLinear");
        state.uniforms.push("contrast");
        state.uniforms.push("vInverseScreenSize");
        state.uniforms.push("vignetteSettings1");
        state.uniforms.push("vignetteSettings2");
        state.uniforms.push("vCameraColorCurveNegative");
        state.uniforms.push("vCameraColorCurveNeutral");
        state.uniforms.push("vCameraColorCurvePositive");
        state.uniforms.push("txColorTransform");
        state.uniforms.push("colorTransformSettings");
        // Emit code
        var color = this.color;
        var output = this._outputs[0];
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        state._emitFunctionFromInclude("imageProcessingDeclaration", comments);
        state._emitFunctionFromInclude("imageProcessingFunctions", comments);
        if (color.connectedPoint.type === NodeMaterialBlockConnectionPointTypes.Color4 || color.connectedPoint.type === NodeMaterialBlockConnectionPointTypes.Vector4) {
            state.compilationString += "".concat(this._declareOutput(output, state), " = ").concat(color.associatedVariableName, ";\r\n");
        }
        else {
            state.compilationString += "".concat(this._declareOutput(output, state), " = vec4(").concat(color.associatedVariableName, ", 1.0);\r\n");
        }
        state.compilationString += "#ifdef IMAGEPROCESSINGPOSTPROCESS\r\n";
        if (this.convertInputToLinearSpace) {
            state.compilationString += "".concat(output.associatedVariableName, ".rgb = toLinearSpace(").concat(color.associatedVariableName, ".rgb);\r\n");
        }
        state.compilationString += "#else\r\n";
        state.compilationString += "#ifdef IMAGEPROCESSING\r\n";
        if (this.convertInputToLinearSpace) {
            state.compilationString += "".concat(output.associatedVariableName, ".rgb = toLinearSpace(").concat(color.associatedVariableName, ".rgb);\r\n");
        }
        state.compilationString += "".concat(output.associatedVariableName, " = applyImageProcessing(").concat(output.associatedVariableName, ");\r\n");
        state.compilationString += "#endif\r\n";
        state.compilationString += "#endif\r\n";
        return this;
    };
    ImageProcessingBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".convertInputToLinearSpace = ").concat(this.convertInputToLinearSpace, ";\r\n");
        return codeString;
    };
    ImageProcessingBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.convertInputToLinearSpace = this.convertInputToLinearSpace;
        return serializationObject;
    };
    ImageProcessingBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.convertInputToLinearSpace = (_a = serializationObject.convertInputToLinearSpace) !== null && _a !== void 0 ? _a : true;
    };
    __decorate([
        editableInPropertyPage("Convert input to linear space", PropertyTypeForEdition.Boolean, "ADVANCED")
    ], ImageProcessingBlock.prototype, "convertInputToLinearSpace", void 0);
    return ImageProcessingBlock;
}(NodeMaterialBlock));
export { ImageProcessingBlock };
RegisterClass("BABYLON.ImageProcessingBlock", ImageProcessingBlock);
//# sourceMappingURL=imageProcessingBlock.js.map