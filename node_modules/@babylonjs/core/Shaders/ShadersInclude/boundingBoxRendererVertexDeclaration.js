// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "boundingBoxRendererVertexDeclaration";
var shader = "uniform mat4 world;\nuniform mat4 viewProjection;\n#ifdef MULTIVIEW\nuniform mat4 viewProjectionR;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var boundingBoxRendererVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=boundingBoxRendererVertexDeclaration.js.map