// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertexDeclaration";
var shader = "#ifdef MORPHTARGETS\n#ifndef MORPHTARGETS_TEXTURE\nattribute vec3 position{X};\n#ifdef MORPHTARGETS_NORMAL\nattribute vec3 normal{X};\n#endif\n#ifdef MORPHTARGETS_TANGENT\nattribute vec3 tangent{X};\n#endif\n#ifdef MORPHTARGETS_UV\nattribute vec2 uv_{X};\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var morphTargetsVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertexDeclaration.js.map