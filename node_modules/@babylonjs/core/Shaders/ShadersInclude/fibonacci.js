// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "fibonacci";
var shader = "#define rcp(x) 1./x\n#define GOLDEN_RATIO 1.618033988749895\n#define TWO_PI 6.2831855\nvec2 Golden2dSeq(int i,float n)\n{\nreturn vec2(float(i)/n+(0.5/n),fract(float(i)*rcp(GOLDEN_RATIO)));\n}\nvec2 SampleDiskGolden(int i,int sampleCount)\n{\nvec2 f=Golden2dSeq(i,float(sampleCount));\nreturn vec2(sqrt(f.x),TWO_PI*f.y);\n}";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var fibonacci = { name: name, shader: shader };
//# sourceMappingURL=fibonacci.js.map