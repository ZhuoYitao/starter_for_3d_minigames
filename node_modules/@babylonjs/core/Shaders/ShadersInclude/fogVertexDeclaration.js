// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "fogVertexDeclaration";
var shader = "#ifdef FOG\nvarying vec3 vFogDistance;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var fogVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=fogVertexDeclaration.js.map