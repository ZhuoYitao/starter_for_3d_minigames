// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "boundingBoxRendererUboDeclaration";
var shader = "#ifdef WEBGL2\nuniform vec4 color;\nuniform mat4 world;\nuniform mat4 viewProjection;\n#ifdef MULTIVIEW\nuniform mat4 viewProjectionR;\n#endif\n#else\nlayout(std140,column_major) uniform;\nuniform BoundingBoxRenderer {\nvec4 color;\nmat4 world;\nmat4 viewProjection;\nmat4 viewProjectionR;\n};\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var boundingBoxRendererUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=boundingBoxRendererUboDeclaration.js.map