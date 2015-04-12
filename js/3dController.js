'use strict';

/* Controllers */

angular.module('cromoflixGallery.controllers').
  controller('3dController', ['$scope', '$rootScope', function($scope, $rootScope) {
	 
	var container;
	var camera, scene, renderer, supporto, controls, raycasterdown, raycaster;
	var objects = [];
	var mesh;
  	var opera = new Array();
	var offsety = -165;
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controls.enabled = true;

				blocker.style.display = 'none';

			} else {

				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		}

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function ( event ) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

			var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}

			}

			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}

  	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	//var mouse = new THREE.Vector2();
	var offset = new THREE.Vector3( 10, 10, 10 );
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	init();
	animate();
	
	function initCamera( ) {

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.x = 0;
		camera.position.z = 0;
		camera.position.y = 0;
		camera.castShadow = true;

	}

	function initControls( ) {

		controls = new THREE.PointerLockControls( camera );
		
		scene.add( controls.getObject() );

		controls.enabled = false;

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		raycasterdown = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
		raycaster = new THREE.Raycaster(controls.getObject().position, new THREE.Vector3( 0, 0, 0 ), 0, 30 );

	}

	function initRenderer( ) {
		renderer = new THREE.WebGLRenderer( { antialias: true  } ); // antialias: true, alpha: true , logarithmicDepthBuffer: true
	
		renderer.setClearColor( 0xffffff, 1 );
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		
		renderer.sortObjects = true;
        renderer.shadowMapEnabled = false;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
 //		renderer.shadowMapType = THREE.PCFShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;

		renderer.gammaInput = true;
		renderer.gammaOutput = true;

		container.appendChild( renderer.domElement );
	}

  	function Opera(sNome,sWidth,sHeight,sImage) {
			this.nome=sNome;
			this.width=sWidth;
			this.height=sHeight;
			this.image=sImage;
			return this;
	}
	
	function createLabel( opera ) {

		var canvas = document.createElement("canvas");
		var size = 13;
		var color = { r:0, g:0, b:0, a:1.0 };
		var backGroundColor = { r:255, g:255, b:255, a:1.0 };
		var	backgroundMargin = 2;

		var context = canvas.getContext("2d");
		context.font = size + "pt Arial";

		var textWidth = context.measureText(opera.nome).width;

		canvas.width = (textWidth + backgroundMargin) * 10;
		canvas.height = (size + backgroundMargin) * 10;
		context = canvas.getContext("2d");
		context.font = size + "pt Arial";
		

/*		if(backGroundColor) {
			context.fillStyle = backGroundColor;
			context.fillRect(canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, canvas.height / 2 - size / 2 - +backgroundMargin / 2, textWidth + backgroundMargin, size + backgroundMargin);
		} */

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = color;
		context.fillText(opera.nome, canvas.width / 2, canvas.height / 2);

//		context.strokeStyle = "black";
//		context.strokeRect(0, 0, canvas.width, canvas.height);

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial({
			map : texture, transparent : true
		});

		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width/5, canvas.height/5), material);
		mesh.overdraw = true;
		mesh.doubleSided = true;
		mesh.position.set(supporto.position.x-opera.width, supporto.position.y, supporto.position.z);
		

		scene.add( mesh );
	}

	function addOpera( opera ) {
		var geometry = new THREE.PlaneGeometry( opera.width, opera.height );
		var image = new THREE.MeshPhongMaterial( {map:  new THREE.ImageUtils.loadTexture( opera.image ) } );
		
		clearScene(supporto);
		
		supporto = new THREE.Mesh( geometry, image );
		supporto.position.x = -200;
		supporto.position.y = 0;
		supporto.position.z = -590;
		
		scene.add( supporto );

		createLabel( opera );
	}

	function addObjectToScene( object ) {
//		var maxAnisotropy = renderer.getMaxAnisotropy();
		
    	object.traverse( function ( child ) {

      		if ( child instanceof THREE.Mesh ) {
      			child.position.y += offsety;
      			child.material.bumpScale = 0.3;
				mesh = new THREE.Mesh( child.geometry, new THREE.MeshPhongMaterial( child.material ) );
				mesh.position.y += offsety;		
	            mesh.receiveShadow = true;
	            mesh.castShadow = true;
	            scene.add( mesh );
	            objects.push( mesh );
        	}
    	} );
    }

    function initScene() {
    	scene = new THREE.Scene( );
    	scene.castShadow = true;

//		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
//
		var loader = new THREE.OBJMTLLoader( );
		loader.load( './model/room.obj', './model/room.mtl', function ( object ) { addObjectToScene( object ) } ); 
		
//	    var jsonLoader = new THREE.JSONLoader();
//      jsonLoader.load( "./model/room.js", createScene );

		opera[0]=new Opera('Artist: Alik Vetrof\ncity ​​after rain\ncity ​​after rain 2012, 75x125cm oil on canvas\nгород после дождя 2012, 75x125cm холст, масло', 75, 125, '/images/0002380_city-after-rain_700.jpeg');
		addOpera(opera[0]);	

		initLights();
//		initDeferredLights();
    }

	function clearScene(object) {
      scene.remove(object);
	}

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		// Ask the browser to lock the pointer
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
		document.body.requestPointerLock();

		initScene( );
		initCamera( );
		initControls( );
		initRenderer();
//		initDeferredRenderer();

		window.addEventListener( 'resize', onWindowResize, false );
	}

	function initDeferredRenderer( ) {
		renderer = new THREE.WebGLDeferredRenderer( { antialias: true, tonemapping: THREE.FilmicOperator, brightness: 2.5 } );
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		container.appendChild( renderer.domElement );

        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;

		renderer.gammaInput = true;
		renderer.gammaOutput = true;
	}

	function initLights( ) {
		var directionalLight1 = new THREE.SpotLight( 0xffeeaa, 2.5 ); 
		directionalLight1.position.set( 830, 150 + offsety, -700 );
		directionalLight1.target.position.set( 350, 0 + offsety, -800 );
		scene.add( directionalLight1 ); 

		var directionalLight2 = new THREE.SpotLight( 0xffeeaa, 2.5 ); 
		directionalLight2.position.set( 830, 150 + offsety, -300 );
		directionalLight2.target.position.set( 350, 0 + offsety, -400 );
		scene.add( directionalLight2 ); 

		var hemiLight1 = new THREE.HemisphereLight( 0xffffff, 0x222211, 0.6 );
		hemiLight1.position.set( 0, 500 + offsety, 0 );
		scene.add( hemiLight1 );

		// luce tavolino
		var spotLight = new THREE.SpotLight( 0xffffff, 2.5, 600, Math.PI/3.3, 3.5 );
        spotLight.position.set( -150.036, 200 + offsety, -172.72 );
        spotLight.target.position.set( -150.036, 0 + offsety, -172.72 );
		spotLight.castShadow = true;
		spotLight.shadowMapWidth = 128;
		spotLight.shadowMapHeight = 128;
		spotLight.shadowCameraNear = 10;
		spotLight.shadowCameraFar = 300;
		spotLight.shadowCameraFov = 110;
		spotLight.shadowBias = -0.004;
		spotLight.shadowDarkness = 0.7;
		scene.add( spotLight );

		// lamapada divano
		var spotLight2 = new THREE.SpotLight( 0xffffff, 2.5, 600, Math.PI/2.7, 5 );
        spotLight2.position.set( 419.5, 239 + offsety, 49.609 );
        spotLight2.target.position.set( 419.5, 0 + offsety, 49.609 );
		spotLight2.castShadow = true;
		spotLight2.shadowMapWidth = 128;
		spotLight2.shadowMapHeight = 128;
		spotLight2.shadowCameraNear = 10;
		spotLight2.shadowCameraFar = 300;
		spotLight2.shadowCameraFov = 100;
		spotLight2.shadowBias = -0.004;
		spotLight2.shadowDarkness = 0.7;
		scene.add( spotLight2 );

		// faretto
		var spotLight3 = new THREE.SpotLight( 0xffffff, 2.5, 800, Math.PI/4.3, 9 );
        spotLight3.position.set( 22.78, 246.971 + offsety, -573.964 );
        spotLight3.target.position.set( -200, 130 + offsety, -750 );
		spotLight3.castShadow = false;
/*		spotLight3.shadowMapWidth = 128;
		spotLight3.shadowMapHeight = 128;
		spotLight3.shadowCameraNear = 10;
		spotLight3.shadowCameraFar = 300;
		spotLight3.shadowCameraFov = 100;
		spotLight3.shadowBias = -0.004;
		spotLight3.shadowDarkness = 0.9; */
		scene.add( spotLight3 );

//		var ambientLight = new THREE.AmbientLight( 0x111111 );
//		scene.add( ambientLight );
	}
	
	function createAreaEmitter( light ) {
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: light.color.getHex(), vertexColors: THREE.FaceColors } );

		var backColor = 0x222222;

		geometry.faces[ 5 ].color.setHex( backColor );
		geometry.faces[ 4 ].color.setHex( backColor );
		geometry.faces[ 2 ].color.setHex( backColor );
		geometry.faces[ 1 ].color.setHex( backColor );
		geometry.faces[ 0 ].color.setHex( backColor );

		var emitter = new THREE.Mesh( geometry, material );
		emitter.scale.set( light.width * 2, 0.2, light.height * 2 );

		return emitter;

	}

	function initDeferredLights( ) {
		var directionalLight1 = new THREE.SpotLight( 0xffeeaa, 2.5 ); 
		directionalLight1.position.set( 830, 150 + offsety, -700 );
		directionalLight1.target.position.set( 350, 0 + offsety, -800 );
		scene.add( directionalLight1 ); 

		var directionalLight2 = new THREE.SpotLight( 0xffeeaa, 2.5 ); 
		directionalLight2.position.set( 830, 150 + offsety, -300 );
		directionalLight2.target.position.set( 350, 0 + offsety, -400 );
		scene.add( directionalLight2 ); 

/*		var pointLight = new THREE.PointLight ( 0xeeeeee, 1, 4000 );
        pointLight.position.set( -150.036, 207, -172.72 );
        scene.add(pointLight); */
		
		var areaLight1 = new THREE.AreaLight( 0xffffff, 1 );
		areaLight1.position.set( 830, 150, -700 );
		areaLight1.rotation.set( -0.74719, 0.0001, 0.0001 );
		areaLight1.width = 50;
		areaLight1.height = 50;
		scene.add( areaLight1 );

		var meshEmitter = createAreaEmitter( areaLight1 );
		areaLight1.add( meshEmitter );

		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
		hemiLight.color.setHSL( 0.8, 1, 0.8 );
		hemiLight.groundColor.setHSL( 0.4, 1, 0.3 );
		hemiLight.position.set( 0, 500, 0 );
		scene.add( hemiLight ); 
	}
    
    function createScene( geometry, materials ) {

        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        mesh.receiveShadow = true;
	    mesh.castShadow = true;

        scene.add( mesh );
    }

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
//		controls.handleResize();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onMouseMove( e ) {

		mouse.x = e.clientX;
		mouse.y = e.clientY;
	}

	function animate() {

		requestAnimationFrame( animate );
		
		// get camera direction
		var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

		var rotationMatrix = new THREE.Matrix4();
		if ((controls.moveForward()) && (controls.moveRight())) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY((360-45) * Math.PI / 180);
		}
		else if ((controls.moveForward()) && (controls.moveLeft())) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY(45 * Math.PI / 180);
		}
		else if ((controls.moveBackward()) && (controls.moveRight())) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY((180 + 45) * Math.PI / 180);
		}
		else if ((controls.moveBackward()) && (controls.moveLeft())) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY((180 - 45) * Math.PI / 180);
		}
		else if (controls.moveBackward()) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY(180 * Math.PI / 180);
		}
		else if (controls.moveLeft()) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY(90 * Math.PI / 180);
		}
		else if (controls.moveRight()) {
			rotationMatrix = new THREE.Matrix4();
		    rotationMatrix.makeRotationY((360-90) * Math.PI / 180);
		} 
		if (rotationMatrix !== undefined) {
		    cameraDirection.applyMatrix4(rotationMatrix);
		}

		// check intersections
		controls.isOnObject( false );
		controls.isOnObstacle( false );

		raycasterdown.ray.origin.copy( controls.getObject().position );
		raycasterdown.ray.origin.y += offsety;

		var intersections = raycasterdown.intersectObjects( objects );

		if ( intersections.length > 0 ) {
			controls.isOnObject( true );
		}

		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y += offsety + 23;
		raycaster.ray.direction = cameraDirection; 
		raycaster.ray.direction.y = 0;

		var intersections = raycaster.intersectObjects( objects );

		if ( intersections.length > 0 ) {
			controls.isOnObstacle( true );
		} 

		render();
	}

	function render() {

		controls.update( );
//		camera.updateProjectionMatrix();
		renderer.render( scene, camera );
	}
  }
]);