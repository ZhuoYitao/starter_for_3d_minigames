// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "fogVertex";
var shader = "#ifdef FOG\nvFogDistance=(view*worldPos).xyz;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var fogVertex = { name: name, shader: shader };
//# sourceMappingURL=fogVertex.js.map