/** @hidden */
var WebGLPipelineContext = /** @class */ (function () {
    function WebGLPipelineContext() {
        this._valueCache = {};
        this.vertexCompilationError = null;
        this.fragmentCompilationError = null;
        this.programLinkError = null;
        this.programValidationError = null;
    }
    Object.defineProperty(WebGLPipelineContext.prototype, "isAsync", {
        get: function () {
            return this.isParallelCompiled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGLPipelineContext.prototype, "isReady", {
        get: function () {
            if (this.program) {
                if (this.isParallelCompiled) {
                    return this.engine._isRenderingStateCompiled(this);
                }
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    WebGLPipelineContext.prototype._handlesSpectorRebuildCallback = function (onCompiled) {
        if (onCompiled && this.program) {
            onCompiled(this.program);
        }
    };
    WebGLPipelineContext.prototype._fillEffectInformation = function (effect, uniformBuffersNames, uniformsNames, uniforms, samplerList, samplers, attributesNames, attributes) {
        var engine = this.engine;
        if (engine.supportsUniformBuffers) {
            for (var name_1 in uniformBuffersNames) {
                effect.bindUniformBlock(name_1, uniformBuffersNames[name_1]);
            }
        }
        var effectAvailableUniforms = this.engine.getUniforms(this, uniformsNames);
        effectAvailableUniforms.forEach(function (uniform, index) {
            uniforms[uniformsNames[index]] = uniform;
        });
        this._uniforms = uniforms;
        var index;
        for (index = 0; index < samplerList.length; index++) {
            var sampler = effect.getUniform(samplerList[index]);
            if (sampler == null) {
                samplerList.splice(index, 1);
                index--;
            }
        }
        samplerList.forEach(function (name, index) {
            samplers[name] = index;
        });
        for (var _i = 0, _a = engine.getAttributes(this, attributesNames); _i < _a.length; _i++) {
            var attr = _a[_i];
            attributes.push(attr);
        }
    };
    /**
     * Release all associated resources.
     **/
    WebGLPipelineContext.prototype.dispose = function () {
        this._uniforms = {};
    };
    /**
     * @param uniformName
     * @param matrix
     * @hidden
     */
    WebGLPipelineContext.prototype._cacheMatrix = function (uniformName, matrix) {
        var cache = this._valueCache[uniformName];
        var flag = matrix.updateFlag;
        if (cache !== undefined && cache === flag) {
            return false;
        }
        this._valueCache[uniformName] = flag;
        return true;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @hidden
     */
    WebGLPipelineContext.prototype._cacheFloat2 = function (uniformName, x, y) {
        var cache = this._valueCache[uniformName];
        if (!cache || cache.length !== 2) {
            cache = [x, y];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        return changed;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @param z
     * @hidden
     */
    WebGLPipelineContext.prototype._cacheFloat3 = function (uniformName, x, y, z) {
        var cache = this._valueCache[uniformName];
        if (!cache || cache.length !== 3) {
            cache = [x, y, z];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        if (cache[2] !== z) {
            cache[2] = z;
            changed = true;
        }
        return changed;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @param z
     * @param w
     * @hidden
     */
    WebGLPipelineContext.prototype._cacheFloat4 = function (uniformName, x, y, z, w) {
        var cache = this._valueCache[uniformName];
        if (!cache || cache.length !== 4) {
            cache = [x, y, z, w];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        if (cache[2] !== z) {
            cache[2] = z;
            changed = true;
        }
        if (cache[3] !== w) {
            cache[3] = w;
            changed = true;
        }
        return changed;
    };
    /**
     * Sets an integer value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value Value to be set.
     */
    WebGLPipelineContext.prototype.setInt = function (uniformName, value) {
        var cache = this._valueCache[uniformName];
        if (cache !== undefined && cache === value) {
            return;
        }
        if (this.engine.setInt(this._uniforms[uniformName], value)) {
            this._valueCache[uniformName] = value;
        }
    };
    /**
     * Sets a int2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int2.
     * @param y Second int in int2.
     */
    WebGLPipelineContext.prototype.setInt2 = function (uniformName, x, y) {
        if (this._cacheFloat2(uniformName, x, y)) {
            if (!this.engine.setInt2(this._uniforms[uniformName], x, y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a int3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int3.
     * @param y Second int in int3.
     * @param z Third int in int3.
     */
    WebGLPipelineContext.prototype.setInt3 = function (uniformName, x, y, z) {
        if (this._cacheFloat3(uniformName, x, y, z)) {
            if (!this.engine.setInt3(this._uniforms[uniformName], x, y, z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a int4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int4.
     * @param y Second int in int4.
     * @param z Third int in int4.
     * @param w Fourth int in int4.
     */
    WebGLPipelineContext.prototype.setInt4 = function (uniformName, x, y, z, w) {
        if (this._cacheFloat4(uniformName, x, y, z, w)) {
            if (!this.engine.setInt4(this._uniforms[uniformName], x, y, z, w)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets an int array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setIntArray = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setIntArray2 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray2(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setIntArray3 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray3(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setIntArray4 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray4(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setArray = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setArray2 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray2(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    WebGLPipelineContext.prototype.setArray3 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray3(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    WebGLPipelineContext.prototype.setArray4 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray4(this._uniforms[uniformName], array);
    };
    /**
     * Sets matrices on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrices matrices to be set.
     */
    WebGLPipelineContext.prototype.setMatrices = function (uniformName, matrices) {
        if (!matrices) {
            return;
        }
        this._valueCache[uniformName] = null;
        this.engine.setMatrices(this._uniforms[uniformName], matrices);
    };
    /**
     * Sets matrix on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGLPipelineContext.prototype.setMatrix = function (uniformName, matrix) {
        if (this._cacheMatrix(uniformName, matrix)) {
            if (!this.engine.setMatrices(this._uniforms[uniformName], matrix.toArray())) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a 3x3 matrix on a uniform variable. (Specified as [1,2,3,4,5,6,7,8,9] will result in [1,2,3][4,5,6][7,8,9] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGLPipelineContext.prototype.setMatrix3x3 = function (uniformName, matrix) {
        this._valueCache[uniformName] = null;
        this.engine.setMatrix3x3(this._uniforms[uniformName], matrix);
    };
    /**
     * Sets a 2x2 matrix on a uniform variable. (Specified as [1,2,3,4] will result in [1,2][3,4] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    WebGLPipelineContext.prototype.setMatrix2x2 = function (uniformName, matrix) {
        this._valueCache[uniformName] = null;
        this.engine.setMatrix2x2(this._uniforms[uniformName], matrix);
    };
    /**
     * Sets a float on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value value to be set.
     * @returns this effect.
     */
    WebGLPipelineContext.prototype.setFloat = function (uniformName, value) {
        var cache = this._valueCache[uniformName];
        if (cache !== undefined && cache === value) {
            return;
        }
        if (this.engine.setFloat(this._uniforms[uniformName], value)) {
            this._valueCache[uniformName] = value;
        }
    };
    /**
     * Sets a Vector2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector2 vector2 to be set.
     */
    WebGLPipelineContext.prototype.setVector2 = function (uniformName, vector2) {
        if (this._cacheFloat2(uniformName, vector2.x, vector2.y)) {
            if (!this.engine.setFloat2(this._uniforms[uniformName], vector2.x, vector2.y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a float2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float2.
     * @param y Second float in float2.
     */
    WebGLPipelineContext.prototype.setFloat2 = function (uniformName, x, y) {
        if (this._cacheFloat2(uniformName, x, y)) {
            if (!this.engine.setFloat2(this._uniforms[uniformName], x, y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Vector3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector3 Value to be set.
     */
    WebGLPipelineContext.prototype.setVector3 = function (uniformName, vector3) {
        if (this._cacheFloat3(uniformName, vector3.x, vector3.y, vector3.z)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], vector3.x, vector3.y, vector3.z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a float3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float3.
     * @param y Second float in float3.
     * @param z Third float in float3.
     */
    WebGLPipelineContext.prototype.setFloat3 = function (uniformName, x, y, z) {
        if (this._cacheFloat3(uniformName, x, y, z)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], x, y, z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Vector4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector4 Value to be set.
     */
    WebGLPipelineContext.prototype.setVector4 = function (uniformName, vector4) {
        if (this._cacheFloat4(uniformName, vector4.x, vector4.y, vector4.z, vector4.w)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], vector4.x, vector4.y, vector4.z, vector4.w)) {
                this._valueCache[uniformName] = null;
            }
        }
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
    WebGLPipelineContext.prototype.setFloat4 = function (uniformName, x, y, z, w) {
        if (this._cacheFloat4(uniformName, x, y, z, w)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], x, y, z, w)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     */
    WebGLPipelineContext.prototype.setColor3 = function (uniformName, color3) {
        if (this._cacheFloat3(uniformName, color3.r, color3.g, color3.b)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], color3.r, color3.g, color3.b)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     * @param alpha Alpha value to be set.
     */
    WebGLPipelineContext.prototype.setColor4 = function (uniformName, color3, alpha) {
        if (this._cacheFloat4(uniformName, color3.r, color3.g, color3.b, alpha)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], color3.r, color3.g, color3.b, alpha)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color4 on a uniform variable
     * @param uniformName defines the name of the variable
     * @param color4 defines the value to be set
     */
    WebGLPipelineContext.prototype.setDirectColor4 = function (uniformName, color4) {
        if (this._cacheFloat4(uniformName, color4.r, color4.g, color4.b, color4.a)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], color4.r, color4.g, color4.b, color4.a)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    WebGLPipelineContext.prototype._getVertexShaderCode = function () {
        return this.vertexShader ? this.engine._getShaderSource(this.vertexShader) : null;
    };
    WebGLPipelineContext.prototype._getFragmentShaderCode = function () {
        return this.fragmentShader ? this.engine._getShaderSource(this.fragmentShader) : null;
    };
    return WebGLPipelineContext;
}());
export { WebGLPipelineContext };
//# sourceMappingURL=webGLPipelineContext.js.map