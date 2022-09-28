import { ShaderLanguage } from "../../Materials/shaderLanguage.js";
/** @hidden */
var WebGLShaderProcessor = /** @class */ (function () {
    function WebGLShaderProcessor() {
        this.shaderLanguage = ShaderLanguage.GLSL;
    }
    WebGLShaderProcessor.prototype.postProcessor = function (code, defines, isFragment, processingContext, engine) {
        // Remove extensions
        if (!engine.getCaps().drawBuffersExtension) {
            // even if enclosed in #if/#endif, IE11 does parse the #extension declaration, so we need to remove it altogether
            var regex = /#extension.+GL_EXT_draw_buffers.+(enable|require)/g;
            code = code.replace(regex, "");
        }
        return code;
    };
    return WebGLShaderProcessor;
}());
export { WebGLShaderProcessor };
//# sourceMappingURL=webGLShaderProcessors.js.map