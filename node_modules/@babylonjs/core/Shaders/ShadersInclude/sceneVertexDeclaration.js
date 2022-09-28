// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "sceneVertexDeclaration";
var shader = "uniform mat4 viewProjection;\n#ifdef MULTIVIEW\nuniform mat4 viewProjectionR;\n#endif\nuniform mat4 view;\nuniform mat4 projection;\nuniform vec4 vEyePosition;\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var sceneVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=sceneVertexDeclaration.js.map