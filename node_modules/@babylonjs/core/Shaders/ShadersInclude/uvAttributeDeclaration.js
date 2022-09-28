// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "uvAttributeDeclaration";
var shader = "#ifdef UV{X}\nattribute vec2 uv{X};\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var uvAttributeDeclaration = { name: name, shader: shader };
//# sourceMappingURL=uvAttributeDeclaration.js.map