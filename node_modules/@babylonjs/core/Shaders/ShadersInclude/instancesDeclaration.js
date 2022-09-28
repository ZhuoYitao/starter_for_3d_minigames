// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "instancesDeclaration";
var shader = "#ifdef INSTANCES\nattribute vec4 world0;\nattribute vec4 world1;\nattribute vec4 world2;\nattribute vec4 world3;\n#ifdef INSTANCESCOLOR\nattribute vec4 instanceColor;\n#endif\n#if defined(THIN_INSTANCES) && !defined(WORLD_UBO)\nuniform mat4 world;\n#endif\n#if defined(VELOCITY) || defined(PREPASS_VELOCITY)\nattribute vec4 previousWorld0;\nattribute vec4 previousWorld1;\nattribute vec4 previousWorld2;\nattribute vec4 previousWorld3;\n#ifdef THIN_INSTANCES\nuniform mat4 previousWorld;\n#endif\n#endif\n#else\n#if !defined(WORLD_UBO)\nuniform mat4 world;\n#endif\n#if defined(VELOCITY) || defined(PREPASS_VELOCITY)\nuniform mat4 previousWorld;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var instancesDeclaration = { name: name, shader: shader };
//# sourceMappingURL=instancesDeclaration.js.map