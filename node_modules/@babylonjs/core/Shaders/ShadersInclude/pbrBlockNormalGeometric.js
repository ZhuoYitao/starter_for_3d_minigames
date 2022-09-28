// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockNormalGeometric";
var shader = "vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);\n#ifdef NORMAL\nvec3 normalW=normalize(vNormalW);\n#else\nvec3 normalW=normalize(cross(dFdx(vPositionW),dFdy(vPositionW)))*vEyePosition.w;\n#endif\nvec3 geometricNormalW=normalW;\n#if defined(TWOSIDEDLIGHTING) && defined(NORMAL)\ngeometricNormalW=gl_FrontFacing ? geometricNormalW : -geometricNormalW;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockNormalGeometric = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockNormalGeometric.js.map