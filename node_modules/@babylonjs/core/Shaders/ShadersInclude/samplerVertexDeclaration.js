// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "samplerVertexDeclaration";
var shader = "#if defined(_DEFINENAME_) && _DEFINENAME_DIRECTUV==0\nvarying vec2 v_VARYINGNAME_UV;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var samplerVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=samplerVertexDeclaration.js.map