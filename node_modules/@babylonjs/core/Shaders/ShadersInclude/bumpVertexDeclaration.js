// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bumpVertexDeclaration";
var shader = "#if defined(BUMP) || defined(PARALLAX) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC)\n#if defined(TANGENT) && defined(NORMAL) \nvarying mat3 vTBN;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var bumpVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=bumpVertexDeclaration.js.map