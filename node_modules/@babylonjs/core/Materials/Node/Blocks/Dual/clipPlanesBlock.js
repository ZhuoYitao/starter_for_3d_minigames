import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { MaterialHelper } from "../../../materialHelper.js";
/**
 * Block used to implement clip planes
 */
var ClipPlanesBlock = /** @class */ (function (_super) {
    __extends(ClipPlanesBlock, _super);
    /**
     * Create a new ClipPlanesBlock
     * @param name defines the block name
     */
    function ClipPlanesBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment, true) || this;
        _this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4, false);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ClipPlanesBlock.prototype.getClassName = function () {
        return "ClipPlanesBlock";
    };
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    ClipPlanesBlock.prototype.initialize = function (state) {
        state._excludeVariableName("vClipPlane");
        state._excludeVariableName("fClipDistance");
        state._excludeVariableName("vClipPlane2");
        state._excludeVariableName("fClipDistance2");
        state._excludeVariableName("vClipPlane3");
        state._excludeVariableName("fClipDistance3");
        state._excludeVariableName("vClipPlane4");
        state._excludeVariableName("fClipDistance4");
        state._excludeVariableName("vClipPlane5");
        state._excludeVariableName("fClipDistance5");
        state._excludeVariableName("vClipPlane6");
        state._excludeVariableName("fClipDistance6");
    };
    Object.defineProperty(ClipPlanesBlock.prototype, "worldPosition", {
        /**
         * Gets the worldPosition input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClipPlanesBlock.prototype, "target", {
        get: function () {
            return NodeMaterialBlockTargets.VertexAndFragment;
        },
        set: function (value) { },
        enumerable: false,
        configurable: true
    });
    ClipPlanesBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        var scene = mesh.getScene();
        var useClipPlane1 = scene.clipPlane !== undefined && scene.clipPlane !== null;
        var useClipPlane2 = scene.clipPlane2 !== undefined && scene.clipPlane2 !== null;
        var useClipPlane3 = scene.clipPlane3 !== undefined && scene.clipPlane3 !== null;
        var useClipPlane4 = scene.clipPlane4 !== undefined && scene.clipPlane4 !== null;
        var useClipPlane5 = scene.clipPlane5 !== undefined && scene.clipPlane5 !== null;
        var useClipPlane6 = scene.clipPlane6 !== undefined && scene.clipPlane6 !== null;
        defines.setValue("CLIPPLANE", useClipPlane1, true);
        defines.setValue("CLIPPLANE2", useClipPlane2, true);
        defines.setValue("CLIPPLANE3", useClipPlane3, true);
        defines.setValue("CLIPPLANE4", useClipPlane4, true);
        defines.setValue("CLIPPLANE5", useClipPlane5, true);
        defines.setValue("CLIPPLANE6", useClipPlane6, true);
    };
    ClipPlanesBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        if (!mesh) {
            return;
        }
        var scene = mesh.getScene();
        MaterialHelper.BindClipPlane(effect, scene);
    };
    ClipPlanesBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var comments = "//".concat(this.name);
        if (state.target !== NodeMaterialBlockTargets.Fragment) {
            // Vertex
            var worldPos = this.worldPosition;
            state._emitFunctionFromInclude("clipPlaneVertexDeclaration", comments, {
                replaceStrings: [{ search: /uniform vec4 vClipPlane\d*;/g, replace: "" }],
            });
            state.compilationString += state._emitCodeFromInclude("clipPlaneVertex", comments, {
                replaceStrings: [{ search: /worldPos/g, replace: worldPos.associatedVariableName }],
            });
            state._emitUniformFromString("vClipPlane", "vec4");
            state._emitUniformFromString("vClipPlane2", "vec4");
            state._emitUniformFromString("vClipPlane3", "vec4");
            state._emitUniformFromString("vClipPlane4", "vec4");
            state._emitUniformFromString("vClipPlane5", "vec4");
            state._emitUniformFromString("vClipPlane6", "vec4");
            return;
        }
        // Fragment
        state.sharedData.bindableBlocks.push(this);
        state.sharedData.blocksWithDefines.push(this);
        state._emitFunctionFromInclude("clipPlaneFragmentDeclaration", comments);
        state.compilationString += state._emitCodeFromInclude("clipPlaneFragment", comments);
        return this;
    };
    return ClipPlanesBlock;
}(NodeMaterialBlock));
export { ClipPlanesBlock };
RegisterClass("BABYLON.ClipPlanesBlock", ClipPlanesBlock);
//# sourceMappingURL=clipPlanesBlock.js.map