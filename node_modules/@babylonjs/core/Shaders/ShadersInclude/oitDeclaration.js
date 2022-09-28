// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "oitDeclaration";
var shader = "#ifdef ORDER_INDEPENDENT_TRANSPARENCY\n#extension GL_EXT_draw_buffers : require\nlayout(location=0) out vec2 depth; \nlayout(location=1) out vec4 frontColor;\nlayout(location=2) out vec4 backColor;\n#define MAX_DEPTH 99999.0\nhighp vec4 gl_FragColor;\nuniform sampler2D oitDepthSampler;\nuniform sampler2D oitFrontColorSampler;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var oitDeclaration = { name: name, shader: shader };
//# sourceMappingURL=oitDeclaration.js.map