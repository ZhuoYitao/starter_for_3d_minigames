import { UniformBuffer } from "../../Materials/uniformBuffer.js";
import { WebGPUShaderProcessor } from "./webgpuShaderProcessor.js";
/** @hidden */
var WebGPUPipelineContext = /** @class */ (function () {
    function WebGPUPipelineContext(shaderProcessingContext, engine) {
        this._name = "unnamed";
        this.shaderProcessingContext = shaderProcessingContext;
        this._leftOverUniformsByName = {};
        this.engine = engine;
    }
    Object.defineProperty(WebGPUPipelineContext.prototype, "isAsync", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUPipelineContext.prototype, "isReady", {
        get: function () {
            if (this.stages) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUPipelineContext.prototype._handlesSpectorRebuildCallback = function () {
        // Nothing to do yet for spector.
    };
    WebGPUPipelineContext.prototype._fillEffectInformation = function (effect, uniformBuffersNames, uniformsNames, uniforms, samplerList, samplers, attributesNames, attributes) {
        var engine = this.engine;
        // Prevent Memory Leak by reducing the number of string, refer to the string instead of copy.
        effect._fragmentSourceCode = "";
        effect._vertexSourceCode = "";
        // this._fragmentSourceCodeOverride = "";
        // this._vertexSourceCodeOverride = "";
        var foundSamplers = this.shaderProcessingContext.availableTextures;
        var index;
        for (index = 0; index < samplerList.length; index++) {
            var name_1 = samplerList[index];
            var sampler = foundSamplers[samplerList[index]];
            if (sampler == null || sampler == undefined) {
                samplerList.splice(index, 1);
                index--;
            }
            else {
                samplers[name_1] = index;
            }
        }
        for (var _i = 0, _a = engine.getAttributes(this, attributesNames); _i < _a.length; _i++) {
            var attr = _a[_i];
            attributes.push(attr);
        }
        // Build the uniform layout for the left over uniforms.
        this.buildUniformLayout();
        var attributeNamesFromEffect = [];
        var attributeLocationsFromEffect = [];
        for (index = 0; index < attributesNames.length; index++) {
            var location_1 = attributes[index];
            if (location_1 >= 0) {
                attributeNamesFromEffect.push(attributesNames[index]);
                attributeLocationsFromEffect.push(location_1);
            }
        }
        this.shaderProcessingContext.attributeNamesFromEffect = attributeNamesFromEffect;
        this.shaderProcessingContext.attributeLocationsFromEffect = attributeLocationsFromEffect;
    };
    /** @hidden */
    /**
     * Build the uniform buffer used in the material.
     */
    WebGPUPipelineContext.prototype.buildUniformLayout = function () {
        if (!this.shaderProcessingContext.leftOverUniforms.length) {
            return;
        }
        this.uniformBuffer = new UniformBuffer(this.engine, undefined, undefined, "leftOver-" + this._name);
        for (var _i = 0, _a = this.shaderProcessingContext.leftOverUniforms; _i < _a.length; _i++) {
            var leftOverUniform = _a[_i];
            var type = leftOverUniform.type.replace(/^(.*?)(<.*>)?$/, "$1");
            var size = WebGPUShaderProcessor.UniformSizes[type];
            this.uniformBuffer.addUniform(leftOverUniform.name, size, leftOverUniform.length);
            this._leftOverUniformsByName[leftOverUniform.name] = leftOverUniform.type;
        }
        this.uniformBuffer.create();
    };
    /**
     * Release all associated resources.
     **/
    WebGPUPipelineContext.prototype.dispose = function () {
        if (this.uniformBuffer) {
            this.uniformBuffer.dispose();
        }
    };
    /**
     * Sets an integer value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value Value to be set.
     */
    WebGPUPipelineContext.prototype.setInt = function (uniformName, value) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateInt(uniformName, value);
    };
    /**
     * Sets an int2 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int2.
     * @param y Second int in int2.
     */
    WebGPUPipelineContext.prototype.setInt2 = function (uniformName, x, y) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateInt2(uniformName, x, y);
    };
    /**
     * Sets an int3 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int3.
     * @param y Second int in int3.
     * @param z Third int in int3.
     */
    WebGPUPipelineContext.prototype.setInt3 = function (uniformName, x, y, z) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateInt3(uniformName, x, y, z);
    };
    /**
     * Sets an int4 value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int4.
     * @param y Second int in int4.
     * @param z Third int in int4.
     * @param w Fourth int in int4.
     */
    WebGPUPipelineContext.prototype.setInt4 = function (uniformName, x, y, z, w) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateInt4(uniformName, x, y, z, w);
    };
    /**
     * Sets an int array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setIntArray = function (uniformName, array) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateIntArray(uniformName, array);
    };
    /**
     * Sets an int array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setIntArray2 = function (uniformName, array) {
        this.setIntArray(uniformName, array);
    };
    /**
     * Sets an int array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setIntArray3 = function (uniformName, array) {
        this.setIntArray(uniformName, array);
    };
    /**
     * Sets an int array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setIntArray4 = function (uniformName, array) {
        this.setIntArray(uniformName, array);
    };
    /**
     * Sets an array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setArray = function (uniformName, array) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateArray(uniformName, array);
    };
    /**
     * Sets an array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setArray2 = function (uniformName, array) {
        this.setArray(uniformName, array);
    };
    /**
     * Sets an array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    WebGPUPipelineContext.prototype.setArray3 = function (uniformName, array) {
        this.setArray(uniformName, array);
    };
    /**
     * Sets an array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGPUPipelineContext.prototype.setArray4 = function (uniformName, array) {
        this.setArray(uniformName, array);
    };
    /**
     * Sets matrices on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrices matrices to be set.
     */
    WebGPUPipelineContext.prototype.setMatrices = function (uniformName, matrices) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateMatrices(uniformName, matrices);
    };
    /**
     * Sets matrix on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGPUPipelineContext.prototype.setMatrix = function (uniformName, matrix) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateMatrix(uniformName, matrix);
    };
    /**
     * Sets a 3x3 matrix on a uniform variable. (Specified as [1,2,3,4,5,6,7,8,9] will result in [1,2,3][4,5,6][7,8,9] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGPUPipelineContext.prototype.setMatrix3x3 = function (uniformName, matrix) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateMatrix3x3(uniformName, matrix);
    };
    /**
     * Sets a 2x2 matrix on a uniform variable. (Specified as [1,2,3,4] will result in [1,2][3,4] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGPUPipelineContext.prototype.setMatrix2x2 = function (uniformName, matrix) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateMatrix2x2(uniformName, matrix);
    };
    /**
     * Sets a float on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value value to be set.
     * @returns this effect.
     */
    WebGPUPipelineContext.prototype.setFloat = function (uniformName, value) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateFloat(uniformName, value);
    };
    /**
     * Sets a Vector2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector2 vector2 to be set.
     */
    WebGPUPipelineContext.prototype.setVector2 = function (uniformName, vector2) {
        this.setFloat2(uniformName, vector2.x, vector2.y);
    };
    /**
     * Sets a float2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float2.
     * @param y Second float in float2.
     */
    WebGPUPipelineContext.prototype.setFloat2 = function (uniformName, x, y) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateFloat2(uniformName, x, y);
    };
    /**
     * Sets a Vector3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector3 Value to be set.
     */
    WebGPUPipelineContext.prototype.setVector3 = function (uniformName, vector3) {
        this.setFloat3(uniformName, vector3.x, vector3.y, vector3.z);
    };
    /**
     * Sets a float3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float3.
     * @param y Second float in float3.
     * @param z Third float in float3.
     */
    WebGPUPipelineContext.prototype.setFloat3 = function (uniformName, x, y, z) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateFloat3(uniformName, x, y, z);
    };
    /**
     * Sets a Vector4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector4 Value to be set.
     */
    WebGPUPipelineContext.prototype.setVector4 = function (uniformName, vector4) {
        this.setFloat4(uniformName, vector4.x, vector4.y, vector4.z, vector4.w);
    };
    /**
     * Sets a float4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float4.
     * @param y Second float in float4.
     * @param z Third float in float4.
     * @param w Fourth float in float4.
     * @returns this effect.
     */
    WebGPUPipelineContext.prototype.setFloat4 = function (uniformName, x, y, z, w) {
        if (!this.uniformBuffer || !this._leftOverUniformsByName[uniformName]) {
            return;
        }
        this.uniformBuffer.updateFloat4(uniformName, x, y, z, w);
    };
    /**
     * Sets a Color3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     */
    WebGPUPipelineContext.prototype.setColor3 = function (uniformName, color3) {
        this.setFloat3(uniformName, color3.r, color3.g, color3.b);
    };
    /**
     * Sets a Color4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     * @param alpha Alpha value to be set.
     */
    WebGPUPipelineContext.prototype.setColor4 = function (uniformName, color3, alpha) {
        this.setFloat4(uniformName, color3.r, color3.g, color3.b, alpha);
    };
    /**
     * Sets a Color4 on a uniform variable
     * @param uniformName defines the name of the variable
     * @param color4 defines the value to be set
     */
    WebGPUPipelineContext.prototype.setDirectColor4 = function (uniformName, color4) {
        this.setFloat4(uniformName, color4.r, color4.g, color4.b, color4.a);
    };
    WebGPUPipelineContext.prototype._getVertexShaderCode = function () {
        var _a;
        return (_a = this.sources) === null || _a === void 0 ? void 0 : _a.vertex;
    };
    WebGPUPipelineContext.prototype._getFragmentShaderCode = function () {
        var _a;
        return (_a = this.sources) === null || _a === void 0 ? void 0 : _a.fragment;
    };
    return WebGPUPipelineContext;
}());
export { WebGPUPipelineContext };
//# sourceMappingURL=webgpuPipelineContext.js.map