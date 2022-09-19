import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders"
import * as GUI from "@babylonjs/gui";
import  * as BABYLON from "@babylonjs/core";
import { ethers } from 'ethers';
import {default as SandglassIridium} from './artifacts/contracts/SandglassIridium.sol/SandglassIridium.json';
const contractAddress = "0x36ADfAbDBd6A2fF9F1f2504F6b9550DEf44A61C4";

declare var window: any

class FirstPersonTemplate {
    private _scene: BABYLON.Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _camera: BABYLON.FreeCamera;

    constructor() {
        this._canvas = document.querySelector("#renderCanvas");

        // initialize babylon scene and engine
        this._engine =new BABYLON.Engine(this._canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false
        });
        this._scene = new BABYLON.Scene(this._engine);
        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-7, 2, -25), this._scene);


        if(window.ethereum) {
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          })
          window.ethereum.on('accountsChanged', () => {
            window.location.reload();
          })
        }
 
		this._camera.setTarget(new BABYLON.Vector3(8, 1, 5));

		// This attaches the camera to the canvas
		this._camera.attachControl(this._canvas, true);

		// Camera speed
		this._camera.speed = 0.35;
		this._camera.angularSensibility = 8000;

		// View distance
		this._camera.minZ = 0.4;

		// Keyboard mapping
		this._camera.keysUp.push(87);
		this._camera.keysLeft.push(65);
		this._camera.keysDown.push(83);
		this._camera.keysRight.push(68);

		// Collision and gravity
		this._camera.applyGravity = true;
		this._camera.checkCollisions = true;

		// Camera Ellipsoid
		this._camera.ellipsoid = new BABYLON.Vector3(1,1,1);

        // main loop for render scene
        this._main();
    }


    private _createScene() {

		let fullscreenGUI;
		let loadingScreen = (function(){
			function loadingScreen(scene){
			
				if(!fullscreenGUI){
					fullscreenGUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
				}
				this.loadingScene = scene;

				this.loadingContainer = new GUI.Container();
				this.loadingContainer.zIndex = 1000;
				this.loadingBackground = new GUI.Rectangle();
				this.loadingBackground.width = 1;
				this.loadingBackground.height = 1;
				this.loadingBackground.background = "black";


				this.quoteText = new GUI.TextBlock();
				this.quoteText.text = "Nothing lasts, but nothing is forgotten.";
				this.quoteText.left = 0.5;
				this.quoteText.top = -30;
				this.quoteText.color = "#6495ED";


				this.loadingText = new GUI.TextBlock();
				this.loadingText.text = "Loading...";
				this.loadingText.left = 0.5;
				this.loadingText.top = -80;
				this.loadingText.color = "#6495ED";
				this.loadingText.fontSize = '40px'
				fullscreenGUI.addControl(this.loadingContainer); //Add all the elements to the screen
				this.loadingContainer.addControl(this.loadingBackground);
				this.loadingContainer.addControl(this.quoteText);
				this.loadingContainer.addControl(this.loadingText);
				
				var _this = this;
				this.loadingFadeout = function() //Fade out the loading screen
				{
					var deltaTime = _this.loadingScene.getEngine().getDeltaTime();
					_this.loadingContainer.alpha -= 0.001 * deltaTime; //Subtract from the alpha every frame

					if (_this.loadingContainer.alpha < 0) //When no longer visible, remove from update function
					{
						_this.unregisterAnims();
					}
				}

				this.unregisterAnims = function() //Unregister the functions from every frame
				{
					_this.loadingScene.unregisterBeforeRender(_this.loadingAnimation);
					_this.loadingScene.unregisterBeforeRender(_this.loadingFadeout);
					_this.loadingContainer.alpha = 0.0; //Negative alphas cause the GUI to become visible, so make sure we stay at 0
				}
			}
				loadingScreen.prototype.displayLoadingUI = function()
				{
					var _this = this;
					if (_this.loadingScene)
					{
						_this.loadingScene.registerBeforeRender(_this.loadingAnimation);
					}

					_this.loadingContainer.alpha = 1.0; //Reset loading screen to visible
					
				}

				loadingScreen.prototype.hideLoadingUI = function()
				{
					var _this = this;

					if(_this.loadingScene)
					{
						_this.loadingScene.registerBeforeRender(_this.loadingFadeout);
					}
				}

			return loadingScreen;
		}());



        let engine = this._engine;
        let canvas = this._canvas;
        let scene = this._scene;
        let camera = this._camera;
        const framesPerSecond = 60;
        const gravity = -9.81;
        scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);

		engine.loadingScreen = new loadingScreen(scene);
    	engine.displayLoadingUI();
		let hdrTexture =new BABYLON.HDRCubeTexture("/assets/HighFantasy4k.hdr", scene, 1024, false, true, false, true);
		scene.createDefaultSkybox(hdrTexture, true, 10000);
		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 4, 0), scene);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = .2;

		//Creates a gui label to display the clicked mesh
		let guiCanvas = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


		let modal = document.querySelector(".modal");
		let trigger = document.querySelector(".trigger");
		let closeButton = document.querySelector(".close-button");


		let modal2 = document.querySelector(".modal2");
		let trigger2 = document.querySelector(".trigger2");
		let closeButton2 = document.querySelector(".close-button2");

		let modal3 = document.querySelector(".modal3");
		let closeButton3 = document.querySelector(".close-button3");


		let modal4 = document.querySelector(".modal4");
		let closeButton4 = document.querySelector(".close-button4");

		function toggleModal() {
			modal.classList.toggle("show-modal");
		}


		function toggleModal2() {
			modal2.classList.toggle("show-modal2");
		}

		
		async function connectWallet() {
			if (window.ethereum && !window.ethereum.selectedAddress) {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			}
		}

		async function mint() {
			if (typeof window?.ethereum !== 'undefined') {
			  const provider = new ethers.providers.Web3Provider(window?.ethereum);
			  const signer = await provider.getSigner();
			  const contract = new ethers.Contract(contractAddress, SandglassIridium.abi, signer);
		 
			  let price = 150000000000000000 * 1;
			  
			  try {
				const transaction = await contract.mint(1, {value: price.toString()});
				await transaction.wait();
				let hourglassModalElement = document.getElementById('hourglass_modal');
				let hourglassClasses = hourglassModalElement.classList;
				if (hourglassClasses.contains("show-modal3")) {
					toggleModal3();
				}
				toggleModal4();
			  } catch (err) {
				alert('Sorry, there was an issue minting your NFT. Please try again later.');
				console.log(err)
				toggleModal3();
			  }
			}
		}

	
		async function getSupply() {
			if (typeof window.ethereum !== 'undefined') {
			  const provider = new ethers.providers.Web3Provider(window.ethereum);
			  const contract = new ethers.Contract(contractAddress, SandglassIridium.abi, provider);
	
			  try {
				const data = await contract.totalSupply();
				return data;
			  } catch (err) {
				console.log(err);
			  }
		  }
	  }


		const mintButton = document.getElementById("mintButton");
		const connectButton = document.getElementById("connectButton");
		const mintContainer = document.getElementById("mint-container");
		const connectContainer = document.getElementById("connect-container");
	  	const mintSupplyText = document.createElement("h4");
	  	mintContainer.appendChild(mintSupplyText);
		connectButton.addEventListener("click", connectWallet);
		mintButton.addEventListener("click", mint);

		
		async function toggleModal3() {
			if (!window.ethereum) {
				alert('Please connect a wallet!');
			}
			if (!window?.ethereum.selectedAddress) {
				mintContainer.style.visibility = 'hidden';
				connectContainer.style.visibility = 'visible';
				connectButton.style.visibility = 'visible';
				mintButton.style.visibility = 'hidden';
              } else {
				mintContainer.style.visibility = 'visible';
				connectContainer.style.visibility = 'hidden';
				connectButton.style.visibility = 'hidden';
				mintButton.style.visibility = 'visible'
              }
			const supply = await getSupply();
			mintSupplyText.textContent = supply + ' / 729 Minted';
			modal3.classList.toggle("show-modal3");
		}

		async function toggleModal4() {
			
			
			const supply = await getSupply();
			const mintedText = document.getElementById('minted-supply-text');

			mintedText.textContent = supply + ' / 729 Minted';
			modal4.classList.toggle("show-modal4");
		}

		function windowOnClick(event) {
			var ray =  scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);//this._scene.createPickingRay(this._camera.position.x, this._camera.position.y, BABYLON.Matrix.Identity(), this._camera);
			var hit =  scene.pickWithRay(ray);		
			if (!hit.pickedMesh) {
				return;
			}
			var meshContentHeader = {
				'Plane.003': `Sandglass Iridium #4 - Oasis - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/4" target="_blank">More Info</a>`,
				'Plane.011': `Sandglass Iridium #12 - Warriors - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/12" target="_blank">More Info</a>`,
				'Plane.009': `Sandglass Iridium #8 - Carpet Riders - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/8" target="_blank">More Info</a>`,
				'Plane.004': `Sandglass Iridium #2 - Shepherd - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/2" target="_blank">More Info</a>`,
				'Plane.001': `Sandglass Iridium #3 - Mudang - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/3" target="_blank">More Info</a>`,
				'Plane.005': `Sandglass Iridium #5 - Flute Player - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/5" target="_blank">More Info</a>`,
				'Plane.006': `Sandglass Iridium #7 - Alchemist - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/7" target="_blank">More Info</a>`,
				'Plane.010': `Sandglass Iridium #10 - Grizzly Woman - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/10" target="_blank">More Info</a>`,
				'Plane.002': `Sandglass Iridium #1 - Siren - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/1" target="_blank">More Info</a>`,
				'Plane.007': `Sandglass Iridium #6 - Water Bearers - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/6" target="_blank">More Info</a>`,
				'Plane.008': `Sandglass Iridium #13 - Dragon Fly - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/13" target="_blank">More Info</a>`,
				'Plane': `Sandglass Iridium #11 - Pharaoh - <a href="https://nftrade.com/assets/avalanche/0x36adfabdbd6a2ff9f1f2504f6b9550def44a61c4/11" target="_blank">More Info</a>`,
			}

			var meshContentMain = {
				'Plane.011': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/12.png" alt="Sandglass Iridium #12 - Warriors"/>',
				'Plane.003': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/4.png" alt="Sandglass Iridium #4 - Oasis"/>',
				'Plane.009': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/9.png" alt="Sandglass Iridium #9 - Carpet Riders"/>',			
				'Plane.004': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/2.png" alt="Sandglass Iridium #2 - Shepherd"/>',
				'Plane.001': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/3.png" alt="Sandglass Iridium #3 - Mudang"/>',
				'Plane.005': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/5.png" alt="Sandglass Iridium #5 - Flute Player"/>',
				'Plane.006': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/7.png" alt="Sandglass Iridium #7 - Alchemist"/>',							
				'Plane.010': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/10.png" alt="Sandglass Iridium #10 - Grizzly Woman"/>',							
				'Plane.007': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/6.png" alt="Sandglass Iridium #6 - Water Bearers"/>',							
				'Plane.002': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/1.png" alt="Sandglass Iridium #1 - Siren"/>',							
				'Plane.008': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/13.png" alt="Sandglass Iridium #13 - Dragon Fly"/>',							
				'Plane': '<img class="imgPortrait" src="https://7qa3fwceezwijcmxffj7t7cjh3chk2fxtgswdcsbi5im33iveqqa.arweave.net/_AGy2EQmbISJlylT-fxJPsR1aLeZpWGKQUdQze0VJCA/11.png" alt="Sandglass Iridium #11 - Pharaoh"/>',
			}
			
		
			
			if (hit.pickedMesh.id.indexOf('Plane') > -1 && event.target.className !== 'close-button' && meshContentHeader[hit.pickedMesh.name] && meshContentMain[hit.pickedMesh.name]) {
				document.getElementById("modalHeaderDiv").innerHTML = meshContentHeader[hit.pickedMesh.name];
							// Fill with image
				document.getElementById("modalMainFrame").innerHTML = meshContentMain[hit.pickedMesh.name];
				toggleModal();
			}
			let hourglassModalElement = document.getElementById('hourglass_modal');
			let hourglassClasses = hourglassModalElement.classList;
			if ((hit.pickedMesh.id === 'Glass' || hit.pickedMesh.id === 'Wood') && event.target.className !== 'close-button3' && !hourglassClasses.contains("show-modal3") ) {
				toggleModal3();
			}
		}

		closeButton.addEventListener("click", toggleModal);
		trigger2.addEventListener("click", toggleModal2);
		closeButton2.addEventListener("click", toggleModal2);
		window.addEventListener("click", windowOnClick);
		closeButton3.addEventListener("click", toggleModal3);
		closeButton4.addEventListener("click", toggleModal4);

		// Image MESH Feedback Button
		let imageMeshButton = GUI.Button.CreateSimpleButton("imageMeshButton", "Will post here if something is detected");
		imageMeshButton.width = "320px"
		imageMeshButton.height = "40px";
		imageMeshButton.color = "white";
		imageMeshButton.cornerRadius = 5;
		imageMeshButton.background = "green";
		imageMeshButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		imageMeshButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		imageMeshButton.isVisible = false;
		guiCanvas.addControl(imageMeshButton);
		
		// Info Button
		let infoButton = GUI.Button.CreateSimpleButton("infoButton", "INFO");
		infoButton.width = "96px"
		infoButton.height = "96px";
		infoButton.color = "#6495ED";
		infoButton.cornerRadius = 40;
		infoButton.background = "transparent";
		infoButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		infoButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		infoButton.isVisible = true;
		infoButton.paddingRight = "26px";
		infoButton.paddingBottom = "26px";
		infoButton.onPointerUpObservable.add(function() {
			toggleModal2();
		});
		guiCanvas.addControl(infoButton);
			// ****** BEGIN Draw Left Virtual Joysticks ****** //
			function drawJoystick() {
				let adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
				console.log("adt ", adt)
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
				leftThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
				leftThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
				leftThumbContainer.alpha = 0.4;
				leftThumbContainer.left = sideJoystickOffset;
				leftThumbContainer.top = bottomJoystickOffset;
				
				// Inner Ring
				let leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 4, "grey", null);
				leftInnerThumbContainer.height = "80px";
				leftInnerThumbContainer.width = "80px";
				leftInnerThumbContainer.isPointerBlocker = true;
				leftInnerThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
				leftInnerThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
				
				// Puck that moves
				let leftPuck = makeThumbArea("leftPuck", 0, "darkred", "darkred");
				leftPuck.height = "60px";
				leftPuck.width = "60px";
				leftPuck.isPointerBlocker = true;
				leftPuck.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
				leftPuck.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
				console.log("canvas ",canvas)
				leftThumbContainer.onPointerDownObservable.add(function (coordinates) {
					leftPuck.isVisible = true;
					leftPuck['floatLeft'] = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
					leftPuck.left = leftPuck['floatLeft'];
					leftPuck['floatTop'] = canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
					leftPuck.top = leftPuck['floatTop'] * -1;
					leftPuck['isDown'] = true;
					leftThumbContainer.alpha = 0.9;
				});

				leftThumbContainer.onPointerUpObservable.add(function (coordinates) {
					xAddPos = 0;
					yAddPos = 0;
					leftPuck['isDown'] = false;
					leftPuck.isVisible = false;
					leftThumbContainer.alpha = 0.4;
				});

				leftThumbContainer.onPointerMoveObservable.add(function (coordinates) {
					if (leftPuck['isDown']) {
						xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
						yAddPos = canvas.height  - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
						leftPuck['floatLeft'] = xAddPos;
						leftPuck['floatTop'] = yAddPos * -1;
						leftPuck.left = leftPuck['floatLeft'];
						leftPuck.top = leftPuck['floatTop'];
					}
				});

				adt.addControl(leftThumbContainer);
				leftThumbContainer.addControl(leftInnerThumbContainer);
				leftThumbContainer.addControl(leftPuck);
				leftPuck.isVisible = false;

				// Walking and rotation speed with VirtualJoystick
				scene.registerBeforeRender(function () {
					//walke
					translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(xAddPos / 15000, 0, yAddPos / 15000), BABYLON.Matrix.RotationY(camera.rotation.y));
					camera.cameraDirection.addInPlace(translateTransform);
					camera.cameraRotation.y += xAddRot / 120000 * -1;
					camera.cameraRotation.x += yAddRot / 120000 * -1;
				});
							
				// Run VirtualJoystick initially
				function makeThumbArea(name, thickness, color, background) {
					console.log("Drawing Joystick");
					
					let rect = new GUI.Ellipse();
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

			function removeJoystick() {
				let adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

				adt['isVisible'] = false;
				
				// Outer Ring
				let leftThumbContainer = makeThumbArea("leftThumb", 0, "yellow", null);
				leftThumbContainer.isVisible = false;

				
				// Inner Ring
				let leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 0, "green", null);
				leftInnerThumbContainer.isVisible = false;

				// Puck that moves
				let leftPuck = makeThumbArea("leftPuck", 0, "blue", "blue");
				leftPuck.isVisible = false;


				leftThumbContainer.onPointerDownObservable.add(function (coordinates) {
					leftPuck.isVisible = false;
				});

				leftThumbContainer.onPointerUpObservable.add(function (coordinates) {
					/*xAddPos = 0;
					yAddPos = 0;*/
					leftPuck['isDown'] = false;
					leftPuck.isVisible = false;

					leftThumbContainer.alpha = 0.0;
				});

				leftThumbContainer.onPointerMoveObservable.add(function (coordinates) {
					if (leftPuck['isDown']) {
	
					}
				});

				adt.addControl(leftThumbContainer);
				leftThumbContainer.addControl(leftInnerThumbContainer);
				leftThumbContainer.addControl(leftPuck);
				leftPuck.isVisible = false;

							

				function makeThumbArea(name, thickness, color, background) {
					console.log("Removing Joystick");
					
					let rect = new GUI.Ellipse();
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

			const smallDevice = window.matchMedia("(min-width: 919px)");
			smallDevice.addListener(handleDeviceChange);
			
			function handleDeviceChange(e) {
				if (e.matches) { 
					removeJoystick();
					console.log("Larger Window");
				} else { 
					drawJoystick();
					console.log("Drawing The Joystick");
				}
			}

			handleDeviceChange(smallDevice);
			
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				drawJoystick();
			}


			BABYLON.SceneLoader.ImportMeshAsync("", "", "https://sandglass.s3.us-west-2.amazonaws.com/sandPre5.glb", scene).then(function (result) {
				result.meshes.forEach(mesh => {
					mesh.checkCollisions = true;
				});
			});
			scene.executeWhenReady(function () { //When everything is done loading
				engine.hideLoadingUI(); //Run our loading screen fadeout function
			});
			this._scene = scene;
    }
    

    private async _main(): Promise<void> {
        this._createScene();
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

new FirstPersonTemplate();