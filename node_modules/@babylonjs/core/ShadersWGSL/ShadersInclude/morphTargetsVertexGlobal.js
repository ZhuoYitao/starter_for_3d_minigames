// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertexGlobal";
var shader = "#ifdef MORPHTARGETS\n#ifdef MORPHTARGETS_TEXTURE\nvar vertexID : f32;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var morphTargetsVertexGlobal = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertexGlobal.js.map