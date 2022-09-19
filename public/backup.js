var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
	return new BABYLON.Engine(canvas, true, {
		preserveDrawingBuffer: true,
		stencil: true,
		disableWebGL2Support: false
	});
};
console.log("YO ", createDefaultEngine)
var createScene = function () {
	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);

	// Setup scene
	var framesPerSecond = 60;
	var gravity = -9.81;
	scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);

	// This creates and positions a free camera (non-mesh)
	var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-1, 20, -1), scene);

	// This targets the camera (to scene origin)
	camera.setTarget(new BABYLON.Vector3(0, 6, 5));

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// Camera speed
	camera.speed = 0.5;
	camera.angularSensibility = 8000;

	// View distance
	camera.minZ = 0.4;

	// Keyboard mapping
	camera.keysUp.push(87);
	camera.keysLeft.push(65);
	camera.keysDown.push(83);
	camera.keysRight.push(68);

	// Collision and gravity
	camera.applyGravity = true;
	camera.checkCollisions = true;

	// Camera Ellipsoid
	camera.ellipsoid = new BABYLON.Vector3(1, 3.5, 1);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 1.6;

	// Testing sphere Enable and Disable at leisure, or Delete
	// var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
	// var mesh = BABYLON.MeshBuilder.CreateSphere("shpere", { diameter: 2, segments: 32 }, scene);			

	//Creates a gui label to display the clicked mesh
	let guiCanvas = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

	// Image MESH Feedback Button
	let imageMeshButton = BABYLON.GUI.Button.CreateSimpleButton("imageMeshButton", "Will post here if something is detected");
	imageMeshButton.width = "320px"
	imageMeshButton.height = "40px";
	imageMeshButton.color = "white";
	imageMeshButton.cornerRadius = 5;
	imageMeshButton.background = "green";
	imageMeshButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
	imageMeshButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	imageMeshButton.isVisible = false;
	guiCanvas.addControl(imageMeshButton);
	
	// Info Button
	let infoButton = BABYLON.GUI.Button.CreateSimpleButton("infoButton", "Info");
	infoButton.width = "96px"
	infoButton.height = "96px";
	infoButton.color = "white";
	infoButton.cornerRadius = 5;
	infoButton.background = "transparent";
	infoButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
	infoButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	infoButton.isVisible = true;
	infoButton.paddingRight = "26px";
	infoButton.paddingBottom = "26px";
	infoButton.onPointerUpObservable.add(function() {
		/*alert("you did it!");*/
		toggleModal2();
	});
	guiCanvas.addControl(infoButton);

	// ****** BEGIN Draw Left Virtual Joysticks ****** //
	function drawJoystick() {
		let adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		let xAddPos = 0;
		let yAddPos = 0;
		let xAddRot = 0;
		let yAddRot = 0;
		let sideJoystickOffset = 150;
		let bottomJoystickOffset = -50;
		let translateTransform;
		
		// Outer Ring
		let leftThumbContainer = makeThumbArea("leftThumb", 2, "white", null);
		leftThumbContainer.height = "200px";
		leftThumbContainer.width = "200px";
		leftThumbContainer.isPointerBlocker = true;
		leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		leftThumbContainer.alpha = 0.4;
		leftThumbContainer.left = sideJoystickOffset;
		leftThumbContainer.top = bottomJoystickOffset;
		
		// Inner Ring
		let leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 4, "grey", null);
		leftInnerThumbContainer.height = "80px";
		leftInnerThumbContainer.width = "80px";
		leftInnerThumbContainer.isPointerBlocker = true;
		leftInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		leftInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		
		// Puck that moves
		let leftPuck = makeThumbArea("leftPuck", 0, "darkred", "darkred");
		leftPuck.height = "60px";
		leftPuck.width = "60px";
		leftPuck.isPointerBlocker = true;
		leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

		leftThumbContainer.onPointerDownObservable.add(function (coordinates) {
			leftPuck.isVisible = true;
			leftPuck.floatLeft = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
			leftPuck.left = leftPuck.floatLeft;
			leftPuck.floatTop = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
			leftPuck.top = leftPuck.floatTop * -1;
			leftPuck.isDown = true;
			leftThumbContainer.alpha = 0.9;
		});

		leftThumbContainer.onPointerUpObservable.add(function (coordinates) {
			xAddPos = 0;
			yAddPos = 0;
			leftPuck.isDown = false;
			leftPuck.isVisible = false;
			leftThumbContainer.alpha = 0.4;
		});

		leftThumbContainer.onPointerMoveObservable.add(function (coordinates) {
			if (leftPuck.isDown) {
				xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
				yAddPos = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
				leftPuck.floatLeft = xAddPos;
				leftPuck.floatTop = yAddPos * -1;
				leftPuck.left = leftPuck.floatLeft;
				leftPuck.top = leftPuck.floatTop;
			}
		});

		adt.addControl(leftThumbContainer);
		leftThumbContainer.addControl(leftInnerThumbContainer);
		leftThumbContainer.addControl(leftPuck);
		leftPuck.isVisible = false;

		// Walking and rotation speed with VirtualJoystick
		scene.registerBeforeRender(function () {
			translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(xAddPos / 15000, 0, yAddPos / 15000), BABYLON.Matrix.RotationY(camera.rotation.y));
			camera.cameraDirection.addInPlace(translateTransform);
			camera.cameraRotation.y += xAddRot / 120000 * -1;
			camera.cameraRotation.x += yAddRot / 120000 * -1;
		});
					
		// Run VirtualJoystick initially
		function makeThumbArea(name, thickness, color, background, curves) {
			console.log("Drawing Joystick");
			
			let rect = new BABYLON.GUI.Ellipse();
			rect.name = name;
			rect.thickness = thickness;
			rect.color = color;

			rect.background = background;
			rect.paddingLeft = "0px";
			rect.paddingRight = "0px";
			rect.paddingTop = "0px";
			rect.paddingBottom = "0px";

			return rect;
		}
	}			
	// ****** END Draw Left Virtual Joystick ****** //

	// ****** BEGIN Remove Left Virtual Joysticks ****** //
	function removeJoystick() {
		let adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		/*let xAddPos = 0;
		let yAddPos = 0;
		let xAddRot = 0;
		let yAddRot = 0;
		let sideJoystickOffset = 150;
		let bottomJoystickOffset = -50;
		let translateTransform;*/
		adt.isVisible = false;
		
		// Outer Ring
		let leftThumbContainer = makeThumbArea("leftThumb", 0, "yellow", null);
		leftThumbContainer.isVisible = false;
		leftThumbContainer._doNotRender = true;
		/*leftThumbContainer.height = "200px";
		leftThumbContainer.width = "200px";
		leftThumbContainer.isPointerBlocker = false;
		leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		leftThumbContainer.alpha = 0.0;
		leftThumbContainer.left = sideJoystickOffset;
		leftThumbContainer.top = bottomJoystickOffset;*/
		
		// Inner Ring
		let leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 0, "green", null);
		leftInnerThumbContainer.isVisible = false;
		leftInnerThumbContainer._doNotRender = true;
		/*leftInnerThumbContainer.height = "80px";
		leftInnerThumbContainer.width = "80px";
		leftInnerThumbContainer.isPointerBlocker = true;
		leftInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		leftInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;*/
		
		// Puck that moves
		let leftPuck = makeThumbArea("leftPuck", 0, "blue", "blue");
		leftPuck.isVisible = false;
		leftPuck._doNotRender = true;
		/*leftPuck.height = "60px";
		leftPuck.width = "60px";
		leftPuck.isPointerBlocker = false;
		leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;*/

		leftThumbContainer.onPointerDownObservable.add(function (coordinates) {
			leftPuck.isVisible = false;
			leftPuck._doNotRender = true;
			/*leftPuck.floatLeft = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
			leftPuck.left = leftPuck.floatLeft;
			leftPuck.floatTop = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
			leftPuck.top = leftPuck.floatTop * -1;
			leftPuck.isDown = false;
			leftThumbContainer.alpha = 0.0;*/
		});

		leftThumbContainer.onPointerUpObservable.add(function (coordinates) {
			/*xAddPos = 0;
			yAddPos = 0;*/
			leftPuck.isDown = false;
			leftPuck.isVisible = false;
			leftPuck._doNotRender = true;
			leftThumbContainer.alpha = 0.0;
		});

		leftThumbContainer.onPointerMoveObservable.add(function (coordinates) {
			if (leftPuck.isDown) {
				/*xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
				yAddPos = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
				leftPuck.floatLeft = xAddPos;
				leftPuck.floatTop = yAddPos * -1;
				leftPuck.left = leftPuck.floatLeft;
				leftPuck.top = leftPuck.floatTop;*/
			}
		});

		adt.addControl(leftThumbContainer);
		leftThumbContainer.addControl(leftInnerThumbContainer);
		leftThumbContainer.addControl(leftPuck);
		leftPuck.isVisible = false;
		leftPuck._doNotRender = true;

		// Walking and rotation speed with VirtualJoystick
		scene.registerBeforeRender(function () {
			/*translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(xAddPos / 15000, 0, yAddPos / 15000), BABYLON.Matrix.RotationY(camera.rotation.y));
			camera.cameraDirection.addInPlace(translateTransform);
			camera.cameraRotation.y += xAddRot / 120000 * -1;
			camera.cameraRotation.x += yAddRot / 120000 * -1;*/
		});
					
		// Run VirtualJoystick initially
		function makeThumbArea(name, thickness, color, background, curves) {
			console.log("Removing Joystick");
			
			let rect = new BABYLON.GUI.Ellipse();
			rect.isVisible = false;
			rect.name = name;
			rect.thickness = thickness;
			rect.color = color;

			rect.background = background;
			rect.paddingLeft = "0px";
			rect.paddingRight = "0px";
			rect.paddingTop = "0px";
			rect.paddingBottom = "0px";

			return rect;
		}
	}			
	// ****** END Remove Left Virtual Joystick ****** //

	// Here we decide if the VirtualJoystick is drawn baswed on window width: https://css-tricks.com/working-with-javascript-media-queries/
	// This needs to run on initial load...
	const outputElement = document.getElementById("canvas");

	const smallDevice = window.matchMedia("(min-width: 919px)");
	console.log("smallDevice: " + 'smallDevice');

	smallDevice.addListener(handleDeviceChange);
	
	function handleDeviceChange(e) {
		if (e.matches) { /* outputElement.textContent = "Bigger Than Mobile"; */
			/* Here we'd remove the VirtualJoystick */
			removeJoystick();
			console.log("Larger Window");
		} else { /* outputElement.textContent = "Mobile"; */
			drawJoystick();
			console.log("Drawing The Joystick");
		}
	}
	
	// Run it initially
	handleDeviceChange(smallDevice);
	
	// Draw the joystick if user agent is mobileS
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		drawJoystick();
	}


					
			
	window.addEventListener("click", function () {
				
			// Shoot a ray by clicking
			var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
			var hit = scene.pickWithRay(ray);
			console.log("ray ", hit.pickedMesh.id)
	});
	
	//handleDeviceChange();
	// END VirtualJoystick based on window size
	
	// Load my model and identify if any of the meshes with "VirtualImage_MESH" is clicked OLD FILE:   
	// OLD: ("", "https://dl.dropbox.com/s/opjteez2x95if0j/", "ArtRoom-2022_v08_ImageFrames_Optimized_BlenderExport.glb")
	// OLD: ("", "https://dl.dropbox.com/s/nk5z1vcc46vd4ly/", "ArtRoom-2022_v10_ImageFrames_Optimized_BlenderExport.glb")
	// NEW: ("", "https://dl.dropbox.com/s/ulhmp70nju52slm/", "ArtRoom-2022_v10_ImageFrames_Optimized_BabylonJSExport.glb")

	BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "mars3.glb", scene).then(function (result) {
		result.meshes.forEach(mesh => {
			// mesh.isPickable = true;
			mesh.checkCollisions = true;
			// mesh.showBoundingBox = true;

		});
		scene.onPointerDown
		console.log("SCENE ", scene.onPointerDown)
		scene.getMeshByID("__root__").position = new BABYLON.Vector3(1, -17, 1);
		var wall01Mtl = scene.getMaterialByName("wall01.000");
		console.log("hey ", scene)
		wall01Mtl.ambientColor= new BABYLON.Color3(1.87, 0.2, 0.57);
		//for (var k = 0; k < scene.materials.length; k++) {
		//	scene.materials[k].invertNormalMapY = true;
		//}
		// Lock the mouse pointer to the 3D view
		/* DOES NOT WORK... scene.onPointerDown = function lockPointer() {
			engine.enterPointerlock();
		} */



		var diffCamRotationX = 0;
		var diffCamPositionX = 0;

		scene.onPointerDownObservable = function figureStartingPositionOfVectorOfCamera() {
			// console.log("Mouse Down" + camera.rotation);
			origCamRotationX = camera.rotation.x;
			origCamPositionX = camera.position.x;
			/* WORKS BUT BREAKS engine.enterPointerlock();
			concole.log("Pointer Lock?"); */
		}

		scene.onPointerUp = function castRay() { //was PointerUp
			// console.log("Mouse Up" + camera.rotation);
			// console.log("Camera Rotation Diff: " + Math.abs(origCamRotationX - camera.rotation.x))
			// console.log("Camera Position Diff: " + Math.abs(origCamPositionX - camera.position.x))
			var diffCamRotationX = Math.abs(origCamRotationX - camera.rotation.x);
			var diffCamPositionX = Math.abs(origCamPositionX - camera.position.x);


			console.log("BA")
			// I guess here we should close the pointer up and then wait for another pointer down. And on each pointer down we evaluate if it was a click or a drag. If it was a click, we run the showModal. Right now, I think, we're running all the detection in the mouse up from a potential click or drag. We should split that up. But I need help on this one...
			/* The canvas is not 100% width and height anymore. It has to do with the imgPortrait and imgLandscape display...

			Scaling the modal to 1.0 instead of 1.1 fixed the issue as well, but it's worse after clicking an image.

			I think it has to do on how we distinguish clicks and drags. We kinda make all the magic in the mouse up (pointerUp). We should prbably
			- Detect click or drag on mouse down and mouse up.
			- Then only shoot a ray if it has been a click, not on drag */

						// Lock the mouse pointer to the 3D view
			// engine.enterPointerlock();

			// Shoot a ray by clicking
			var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);

			// Detect if a mesh with a predefined name is clicked on
			var hit = scene.pickWithRay(ray);
			console.log("HIT ", hit)
			if (hit.pickedMesh.name.indexOf('VirtualImage_MESH.') > -1) {
				imageMeshButton.textBlock.text = hit.pickedMesh.name;
				imageMeshButton.isVisible = false;
				// console.log(hit.pickedMesh.name);

				// Predefine (hardcode...) picture titles and images (pictures itself)
				var meshContentHeader = {
					'VirtualImage_MESH.000': 'Alex Furer - "Dragon Cloud"',
					'VirtualImage_MESH.001': 'Alex Furer - "Averell Dalton"',
					'VirtualImage_MESH.002': 'Alex Furer - "William Dalton"',
					'VirtualImage_MESH.003': 'Alex Furer - "Jack Dalton"',
					'VirtualImage_MESH.004': 'Alex Furer - "Joe Dalton"',
					'VirtualImage_MESH.005': 'Alex Furer - "-Mon"',
					'VirtualImage_MESH.006': 'Alex Furer - "-Ke-"',
					'VirtualImage_MESH.007': 'Alex Furer - "Po-"'
				}

				var meshContentMain = {
					'VirtualImage_MESH.000': '<img class="imgLandscape" src="images/Gsfsfsantrisch-Region_Wolken_Pano-E_LRStitch_01_Edit_01_FINAL-WEB.jpg" alt="Alex Furer - "Dragon Cloud" title="Alex Furer - "Dragon Cloud"/>',
					'VirtualImage_MESH.001': '<img class="imgPortrait" src="images/DronePainting-Tree_008_Edit_FINAL_WEB.jpg" width:alt="Alex Furer - "Averell Dalton" title="Alex Furer - "Averell Dalton"/>',
					'VirtualImage_MESH.002': '<img class="imgPortrait" src="images/DronePainting-Tree_006_Edit_FINAL_WEB.jpg" alt="Alex Furer - "William Dalton" title="Alex Furer - "William Dalton"/>',
					'VirtualImage_MESH.003': '<img class="imgPortrait" src="images/DronePainting-Tree_004_FINAL_WEB.jpg" alt="Alex Furer - "Jack Dalton" title="Alex Furer - "Jack Dalton"/>',
					'VirtualImage_MESH.004': '<img class="imgPortrait" src="images/DronePainting-Tree_009_Edit_01_FINAL_WEB.jpg" alt="Alex Furer - "Joe Dalton" title="Alex Furer - "Joe Dalton"/>',
					'VirtualImage_MESH.005': '<img class="imgPortrait" src="images/2020-08_La-Santa_La-Isleta_010_Edit_01_FINAL-WEB.jpg" alt="Alex Furer - "Mon" title="Alex Furer - "Mon"/>',
					'VirtualImage_MESH.006': '<img class="imgPortrait" src="images/2020-08_La-Santa_La-Isleta_044_Edit_01_FINAL-WEB.jpg" alt="Alex Furer - "Ke" title="Alex Furer - "Ke"/>',
					'VirtualImage_MESH.007': '<img class="imgPortrait" src="images/2020-08_La-Santa_La-Isleta_003_Edit_01_FINAL-WEB.jpg" alt="Alex Furer - "Po" title="Alex Furer - "Po"/>'
				}
				
				var meshContentLeftButton = {
					'VirtualImage_MESH.000': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.001': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.002': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.003': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.004': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.005': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.006': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
					'VirtualImage_MESH.007': '<button onclick="window.open(\'https://fullframestudios.ch/\')" class="myButton">Order Postcards</button>',
				}
				
				var meshContentRightButton = {
					'VirtualImage_MESH.000': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.001': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.002': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.003': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.004': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.005': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.006': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
					'VirtualImage_MESH.007': '<button onclick="window.open(\'https://alexfurer.art/\')" class="myButton">Order Print</button>',
				}

				if (diffCamRotationX < 0.0005 && diffCamPositionX < 0.0005) {
					// Call the modal
					toggleModal(); // If there was no modal before, it will be shown; it there was modal already, it will be invisible
					
					// Fill the header div with the picture title
					document.getElementById("modalHeaderDiv").innerHTML = meshContentHeader[hit.pickedMesh.name];

					// Fill the main content div (picture)
					document.getElementById("modalMainFrame").innerHTML = meshContentMain[hit.pickedMesh.name];
					
					// Change the link on the buttons in the modal
					// Left Button
					document.getElementById("modalButtonDivLeft").innerHTML = meshContentLeftButton[hit.pickedMesh.name];
					// Right Button
					document.getElementById("modalButtonDivRight").innerHTML = meshContentRightButton[hit.pickedMesh.name];
					
					// You can also use iframe here to display any content. All you need is to bind iframe src value with mesh in our meshContent list
					// and then change the code above to load the iframe src into the modal

					// And get out of pointer lock to 3D canvas
					// engine.exitPointerlock();
				}


				// This opens a new browser window to a speciffic URL (will have to detect which image is selected and open the apropriate link)
				// window.open('https://fullframestudios.ch')

				// Try: Hide button on mouse up
				/* scene.onPointerUp = function hideButton() {
				imageMeshButton.isVisible = false;
				} */
			}
		}
	});
	return scene;
};

// The engine part, don't touch if you don't know what to do :)

window.initFunction = async function () {
	console.log("WEEEE")
	var asyncEngineCreation = async function () {
		try {
			return createDefaultEngine();
		} catch (e) {
			console.log("the available createEngine function failed. Creating the default engine instead");
			return createDefaultEngine();
		}
	}

	window.engine = await asyncEngineCreation();
	console.log("SCENE B4", window.engine)
	if (!engine) throw 'engine should not be null.';
	window.scene = createScene();
	console.log("SCENE after", window.scene)
};
initFunction().then(() => {
	sceneToRender = scene
	engine.runRenderLoop(function () {
		if (sceneToRender && sceneToRender.activeCamera) {
			sceneToRender.render();
		}
	});
});

// Resize
window.addEventListener("resize", function () {
	engine.resize();
});