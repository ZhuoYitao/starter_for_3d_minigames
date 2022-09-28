// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "circleOfConfusionPixelShader";
var shader = "uniform sampler2D depthSampler;\nvarying vec2 vUV;\nuniform vec2 cameraMinMaxZ;\nuniform float focusDistance;\nuniform float cocPrecalculation;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nfloat depth=texture2D(depthSampler,vUV).r;\nfloat pixelDistance=(cameraMinMaxZ.x+(cameraMinMaxZ.y-cameraMinMaxZ.x)*depth)*1000.0; \nfloat coc=abs(cocPrecalculation* ((focusDistance-pixelDistance)/pixelDistance));\ncoc=clamp(coc,0.0,1.0);\ngl_FragColor=vec4(coc,depth,coc,1.0);\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var circleOfConfusionPixelShader = { name: name, shader: shader };
//# sourceMappingURL=circleOfConfusion.fragment.js.map