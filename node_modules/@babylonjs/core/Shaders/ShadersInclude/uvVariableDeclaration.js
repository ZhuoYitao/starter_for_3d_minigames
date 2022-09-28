// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "uvVariableDeclaration";
var shader = "#if !defined(UV{X}) && defined(MAINUV{X})\nvec2 uv{X}=vec2(0.,0.);\n#endif\n#ifdef MAINUV{X}\nvMainUV{X}=uv{X};\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var uvVariableDeclaration = { name: name, shader: shader };
//# sourceMappingURL=uvVariableDeclaration.js.map