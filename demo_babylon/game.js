import * as BABYLON from "./libs/babylon_min.js";
import {modelData} from "./models/skeleton";
import "./libs/babylon_loader.js";

export default class DemoBabylon {
  runDemoCyliner(engine) {
    const scene = new BABYLON.Scene(engine);
    
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 4, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {});

    return scene;
  }
  runDemoFaceUV(engine) {
    const scene = new BABYLON.Scene(engine);
    
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 4, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    const canMaterial = new BABYLON.StandardMaterial("material", scene);
	canMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/logo_label.jpg")
	
	const faceUV = [];
	faceUV[0] =	new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[1] =	new BABYLON.Vector4(1, 0, 0.25, 1); // x, z swapped to flip image
    faceUV[2] = new BABYLON.Vector4(0, 0, 0.24, 1);
	
	

    const faceColors = [ ];
    faceColors[0] = new BABYLON.Color4(0.5, 0.5, 0.5, 1)
	
	const can = BABYLON.MeshBuilder.CreateCylinder("can", {height:1.16, faceUV: faceUV, faceColors: faceColors});
	can.material = canMaterial;

    return scene;
  }
  runDemoSkeleton(engine) {
    var scene = new BABYLON.Scene(engine);
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(10, 0, 10), scene);
  
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI/2, Math.PI/2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    
    var strData = JSON.stringify(modelData);
    
    BABYLON.SceneLoader.ImportMesh("", "", 'data:' + strData, scene, function (meshes, particleSystems, skeletons) {
  
      var skeleton = skeletons[0];
      var mesh = meshes[0];
      
      mesh.rotation.x = Math.PI * .25;
      
      scene.registerBeforeRender(function () {
  
        skeleton.bones[0].rotate(BABYLON.Axis.Z, .01, BABYLON.Space.WORLD, mesh);
        skeleton.bones[1].rotate(BABYLON.Axis.Z, .01, BABYLON.Space.WORLD, mesh);
        skeleton.bones[2].rotate(BABYLON.Axis.Z, .01, BABYLON.Space.WORLD, mesh);
        
      });
      
    });
    
    return scene;
  }
  runDemoWalkingMan(engine) {
    var scene = new BABYLON.Scene(engine);

    var camera=new BABYLON.ArcRotateCamera("camera",0,1,25,BABYLON.Vector3.Zero(),scene);

    camera.setTarget(new BABYLON.Vector3(0,4,0));

    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

	BABYLON.SceneLoader.ImportMesh("", "https://playground.babylonjs.com/Scenes/Dude/", "Dude.babylon", scene, function (newMeshes, particleSystems, skeletons) {
	    var mesh = newMeshes[0];
		var skeleton = skeletons[0];
		mesh.scaling = new BABYLON.Vector3(0.1,0.1,0.1);
		
		var animation = scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
		
		var box = BABYLON.MeshBuilder.CreateBox('box', { size: .5 }, scene);
		
		var bone = skeleton.bones[15];
		
		scene.registerBeforeRender(function () {
			
			bone.getPositionToRef(BABYLON.Space.WORLD, mesh, box.position);
			bone.getRotationToRef(BABYLON.Space.WORLD, mesh, box.rotation);
			
		});
		
	});
    return scene;
  }
  runDemoCurve(engine) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(.5, .5, .5);

    // camera
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 0, -150));
    camera.attachControl(canvas, true);


    var catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(
        [BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(10, 1, 5),
        new BABYLON.Vector3(20, 16, 20),
        new BABYLON.Vector3(25, -21, 15),
        new BABYLON.Vector3(35, 30, 0)
        ],
        60,
        true);

    var catmullRomSpline = BABYLON.Mesh.CreateLines("catmullRom", catmullRom.getPoints(), scene);

    /***************************************Axes*************************************************/
    // show axis function
    var showAxis = function (size) {
        var makeTextPlane = function (text, color, size) {
            var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
            var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
            plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
            plane.material.backFaceCulling = false;
            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
            plane.material.diffuseTexture = dynamicTexture;
            return plane;
        };
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };

    showAxis(50);

    return scene;    
  }
  runDemoParticel(engine) {
    var scene = new BABYLON.Scene(engine);

    // Setup environment
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 5, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    scene.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0);

    // Create a particle system
    var surfaceParticles = new BABYLON.ParticleSystem("surfaceParticles", 1600, scene);

    // Texture of each particle
    surfaceParticles.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sun/T_SunSurface.png", scene);

    // Create core sphere
    var coreSphere = BABYLON.MeshBuilder.CreateSphere("coreSphere", {diameter: 2.01, segments: 64}, scene);

    // Create core material
    var coreMat = new BABYLON.StandardMaterial("coreMat", scene)
    coreMat.emissiveColor = new BABYLON.Color3(0.3773, 0.0930, 0.0266); 

    // Assign core material to sphere
    coreSphere.material = coreMat;

    // Pre-warm
    surfaceParticles.preWarmStepOffset = 10;
    surfaceParticles.preWarmCycles = 100;

    // Initial rotation
    surfaceParticles.minInitialRotation = -2 * Math.PI;
    surfaceParticles.maxInitialRotation = 2 * Math.PI;
    
    // Where the sun particles come from
    var sunEmitter = new BABYLON.SphereParticleEmitter();
    sunEmitter.radius = 1;
    sunEmitter.radiusRange = 0; // emit only from shape surface

    // Assign particles to emitters
    surfaceParticles.emitter = coreSphere; // the starting object, the emitter
    surfaceParticles.particleEmitterType = sunEmitter;

    // Color gradient over time
    surfaceParticles.addColorGradient(0, new BABYLON.Color4(0.8509, 0.4784, 0.1019, 0.0));
    surfaceParticles.addColorGradient(0.4, new BABYLON.Color4(0.6259, 0.3056, 0.0619, 0.5));
    surfaceParticles.addColorGradient(0.5, new BABYLON.Color4(0.6039, 0.2887, 0.0579, 0.5));
    surfaceParticles.addColorGradient(1.0, new BABYLON.Color4(0.3207, 0.0713, 0.0075, 0.0));

    // Size of each particle (random between...
    surfaceParticles.minSize = 0.4;
    surfaceParticles.maxSize = 0.7;
   
    // Life time of each particle (random between...
    surfaceParticles.minLifeTime = 8.0;
    surfaceParticles.maxLifeTime = 8.0;

    // Emission rate
    surfaceParticles.emitRate = 200;

    // Blend mode : BLENDMODE_ONEONE, BLENDMODE_STANDARD, or BLENDMODE_ADD
    surfaceParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // Set the gravity of all particles
    surfaceParticles.gravity = new BABYLON.Vector3(0, 0, 0);

    // Angular speed, in radians
    surfaceParticles.minAngularSpeed = -0.4;
    surfaceParticles.maxAngularSpeed = 0.4;

    // Speed
    surfaceParticles.minEmitPower = 0;
    surfaceParticles.maxEmitPower = 0;
    surfaceParticles.updateSpeed = 0.005;

    // No billboard
    surfaceParticles.isBillboardBased = false;

    // Start the particle system
    surfaceParticles.start();

    return scene;
  }
  runDemoSprite(engine) {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 8, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5));

    // Create a sprite manager
    // Parameters : name, imgUrl, capacity, cellSize, scene
    const spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "https://playground.babylonjs.com/textures/palm.png", 2000, {width: 512, height: 1024});

    //Mutliple trees
    for (let i = 0; i < 2000; i++) {
        const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.width = 1;
        tree.height = 2;
        tree.position.x = BABYLON.Scalar.RandomRange(-25, 25) ;
        tree.position.z = BABYLON.Scalar.RandomRange(-25, 25);
    }

    return scene;    
  }
  runDemoSimpleWorld(engine) {
    const scene = new BABYLON.Scene(engine);

    // This creates and initially positions a follow camera 	
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(-6, 0, 0), scene);
	
	//The goal distance of camera from target
	camera.radius = 1;
	
	// The goal height of camera above local oriin (centre) of target
	camera.heightOffset = 8;
	
	// The goal rotation of camera around local origin (centre) of target in x y plane
	camera.rotationOffset = 0;
	
	//Acceleration of camera in moving from current to goal position
	camera.cameraAcceleration = 0.005
	
	//The speed at which acceleration is halted 
	camera.maxCameraSpeed = 10
	
	//camera.target is set after the target's creation
    
	// This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    const walk = function (turn, dist) {
        this.turn = turn;
        this.dist = dist;
    }
    
    const track = [];
    track.push(new walk(86, 7));
    track.push(new walk(-85, 14.8));
    track.push(new walk(-93, 16.5));
    track.push(new walk(48, 25.5));
    track.push(new walk(-112, 30.5));
    track.push(new walk(-72, 33.2));
    track.push(new walk(42, 37.5));
    track.push(new walk(-98, 45.2));
    track.push(new walk(0, 47))

    // Dude
    BABYLON.SceneLoader.ImportMeshAsync("him", "https://playground.babylonjs.com/scenes/Dude/", "Dude.babylon", scene).then((result) => {
        var dude = result.meshes[0];
        dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);
            
        dude.position = new BABYLON.Vector3(-6, 0, 0);
        dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-95), BABYLON.Space.LOCAL);
        const startRotation = dude.rotationQuaternion.clone();    

        camera.lockedTarget = dude;
        scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

        let distance = 0;
        let step = 0.015;
        let p = 0;

        scene.onBeforeRenderObservable.add(() => {
		    dude.movePOV(0, 0, step);
            distance += step;
              
            if (distance > track[p].dist) {
                    
                dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(track[p].turn), BABYLON.Space.LOCAL);
                p +=1;
                p %= track.length; 
                if (p === 0) {
                    distance = 0;
                    dude.position = new BABYLON.Vector3(-6, 0, 0);
                    dude.rotationQuaternion = startRotation.clone();
                }
            }
			
        })
    });

    const spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "https://playground.babylonjs.com/textures/palm.png", 2000, {width: 512, height: 1024}, scene);

    //We create trees at random positions
    for (let i = 0; i < 500; i++) {
        const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (-30);
        tree.position.z = Math.random() * 20 + 8;
        tree.position.y = 0.5;
    }

    for (let i = 0; i < 500; i++) {
        const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (25) + 7;
        tree.position.z = Math.random() * -35  + 8;
        tree.position.y = 0.5;
    }
    
    //Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:100}, scene);
	  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;

    BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "valleyvillage.glb");

    return scene;    
  }
  runDemoImportMesh(engine) {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, -30, -60), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, -1, -1), scene);

    BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "valleyvillage.glb", scene);

    return scene;
  }

  runDemoMachine(engine) {
    // Create a scene.
    var scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 8, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // Create a default skybox with an environment.
    var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/environment.dds", scene);
    var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);

    // Append glTF model to scene.
    BABYLON.SceneLoader.Append("https://playground.babylonjs.com/scenes/BoomBox/", "BoomBox.gltf", scene, function (scene) {
        // Create a default arc rotate camera and light.
        scene.createDefaultCameraOrLight(true, true, true);

        // The default camera looks at the back of the asset.
        // Rotate the camera by 180 degrees to the front of the asset.
        scene.activeCamera.alpha += Math.PI;
    });

    return scene;
};  
runDemoKgAvatar(engine) {
  // Create a scene.
  var scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 8, new BABYLON.Vector3(0, 0, 0));
  // camera.attachControl(canvas, true);

  // Append glTF model to scene.
  BABYLON.SceneLoader.Append("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/Demos/treeScene/", "treeScene.glb", scene, function (scene) {
    scene.createDefaultCameraOrLight(true, true, true);
    scene.activeCamera.alpha += Math.PI;
  });

  return scene;
};
  run() {
    // 初始化引擎
    const engine = new BABYLON.Engine(canvas, true,{ preserveDrawingBuffer: true }, true);
    const scene = this.runDemoKgAvatar(engine);
    // 循环渲染
    engine.runRenderLoop(function () {
      scene.render();
    });
  }
}

const demo = new DemoBabylon();
demo.run();