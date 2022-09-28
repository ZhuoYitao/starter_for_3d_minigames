// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertexDeclaration";
var shader = "#ifdef MORPHTARGETS\n#ifndef MORPHTARGETS_TEXTURE\nattribute position{X} : vec3<f32>;\n#ifdef MORPHTARGETS_NORMAL\nattribute normal{X} : vec3<f32>;\n#endif\n#ifdef MORPHTARGETS_TANGENT\nattribute tangent{X} : vec3<f32>;\n#endif\n#ifdef MORPHTARGETS_UV\nattribute uv_{X} : vec2<f32>;\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var morphTargetsVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertexDeclaration.js.map