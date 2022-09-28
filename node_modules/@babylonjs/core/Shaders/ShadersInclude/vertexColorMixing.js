// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "vertexColorMixing";
var shader = "#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR)\nvColor=vec4(1.0);\n#ifdef VERTEXCOLOR\nvColor*=color;\n#endif\n#ifdef INSTANCESCOLOR\nvColor*=instanceColor;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var vertexColorMixing = { name: name, shader: shader };
//# sourceMappingURL=vertexColorMixing.js.map