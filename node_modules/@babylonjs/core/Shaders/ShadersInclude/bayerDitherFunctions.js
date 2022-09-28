// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bayerDitherFunctions";
var shader = "float bayerDither2(vec2 _P) {\nreturn mod(2.0*_P.y+_P.x+1.0,4.0);\n}\nfloat bayerDither4(vec2 _P) {\nvec2 P1=mod(_P,2.0); \nvec2 P2=floor(0.5*mod(_P,4.0)); \nreturn 4.0*bayerDither2(P1)+bayerDither2(P2);\n}\nfloat bayerDither8(vec2 _P) {\nvec2 P1=mod(_P,2.0); \nvec2 P2=floor(0.5 *mod(_P,4.0)); \nvec2 P4=floor(0.25*mod(_P,8.0)); \nreturn 4.0*(4.0*bayerDither2(P1)+bayerDither2(P2))+bayerDither2(P4);\n}\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var bayerDitherFunctions = { name: name, shader: shader };
//# sourceMappingURL=bayerDitherFunctions.js.map