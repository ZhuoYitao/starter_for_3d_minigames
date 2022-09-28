// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "mainUVVaryingDeclaration";
var shader = "#ifdef MAINUV{X}\nvarying vec2 vMainUV{X};\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var mainUVVaryingDeclaration = { name: name, shader: shader };
//# sourceMappingURL=mainUVVaryingDeclaration.js.map