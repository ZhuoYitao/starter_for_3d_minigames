// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockNormalFinal";
var shader = "#if defined(FORCENORMALFORWARD) && defined(NORMAL)\nvec3 faceNormal=normalize(cross(dFdx(vPositionW),dFdy(vPositionW)))*vEyePosition.w;\n#if defined(TWOSIDEDLIGHTING)\nfaceNormal=gl_FrontFacing ? faceNormal : -faceNormal;\n#endif\nnormalW*=sign(dot(normalW,faceNormal));\n#endif\n#if defined(TWOSIDEDLIGHTING) && defined(NORMAL)\nnormalW=gl_FrontFacing ? normalW : -normalW;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockNormalFinal = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockNormalFinal.js.map