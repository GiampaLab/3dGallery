
var SceneManager = function( document ) {

	var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );

	var scene = new THREE.Scene();
//	scene.fog = new THREE.Fog( 0xcccccc, 500, 3000 );
	
	// switch shadows
	var globalShadows = false;

	// switch composer render
	var useComposer = false;

	// all objects translate y axis
	var offsety = -165;

	// list of objects for collision detection
	var collisionObjects = [];

	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight-50 );
	renderer.sortObjects = true;

	if ( globalShadows ) {
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;
	}

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	
	var composer, effectFXAA;

	// COMPOSER
	if ( useComposer ) {

		renderer.autoClear = false;

		var renderModel = new THREE.RenderPass( scene, camera );

		var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );
		effectBleach.uniforms[ 'opacity' ].value = 0.4;

		var effectColor = new THREE.ShaderPass( THREE.ColorCorrectionShader );
		effectColor.uniforms[ 'powRGB' ].value.set( 1.4, 1.45, 1.45 );
		effectColor.uniforms[ 'mulRGB' ].value.set( 1.1, 1.1, 1.1 );

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
		effectFXAA.renderToScreen = true;

		composer = new THREE.EffectComposer( renderer );
		composer.addPass( renderModel );
		composer.addPass( effectBleach );
//		composer.addPass( effectColor );
		composer.addPass( effectFXAA );

	}

	document.body.appendChild( renderer.domElement );

	this.getCamera = function() {
		return camera;	
	};
	this.getScene = function() {
		return scene;	
	};
	this.getRenderer = function() {
		return renderer;	
	};
	this.getCollisionObjects = function() {
		return collisionObjects;	
	};


	/* LIGHTS */
	this.createAmbientLight = function ( intensity ) {

		var ambientLight = new THREE.AmbientLight( intensity );
		scene.add( ambientLight );

	};

	this.createDirectionalLight = function ( intensity, pos ) {

		var directionalLight = new THREE.DirectionalLight( intensity );
		directionalLight.position.set( pos[0], pos[1], pos[2] );

		scene.add( directionalLight );

	};

	this.createPointLight = function ( intensity, start, end, pos ) {

		var pointLight = new THREE.PointLight( intensity, start, end );
		pointLight.position.set( pos[0], pos[1], pos[2] );

		scene.add( pointLight );

	};

	this.createHemiLight = function ( colorStart, colorEnd, intensity, pos ) {

		var hemiLight = new THREE.HemisphereLight( colorStart, colorEnd, intensity );
		hemiLight.position.set( pos[0], pos[1], pos[2] );

		scene.add( hemiLight );

	};

	this.createSpotLight = function ( color, intensity, pos, targetPos, enableShadows ) {

		var spotLight = new THREE.SpotLight( color, intensity ); 
		spotLight.position.set( pos[0], pos[1], pos[2] );
		spotLight.target.position.set( targetPos[0], targetPos[1], targetPos[2] );

		if ( globalShadows && enableShadows ) spotLight.castShadow = true;
		else spotLight.castShadow = false;

		scene.add( spotLight );

	};


	/* create all scene lights */
	this.initLights = function() {
 
 		// ambient light
 		this.createAmbientLight( 0x333333 );

 //		this.createHemiLight( 0xddffdd, 0x111122, 0.3, [ 0, 500 + offsety, 0 ] );

 		// external lights
// 		this.createDirectionalLight( 0xffeeaa, [ 830, 150 + offsety, -700 ]);
		this.createSpotLight( 0xffeeaa, 1, [ 830, 150 + offsety, -1100 ], [ 350, 0 + offsety, -1200 ], false );
//		this.createSpotLight( 0xffeeaa, 1, [ 830, 150 + offsety, -500 ], [ 350, 0 + offsety, -600 ], false );

		// central lamp light
		this.createPointLight( 0xdddddd, 1, 800, [ -150.036, 200 + offsety, -172.72 ] );
//		this.createSpotLight( 0xffffff, 1, [ -150.036, 200 + offsety, -172.72 ], [ -150.036, 0 + offsety, -172.72 ], false );

		// sofa light
		this.createPointLight( 0xdddddd, 1, 800, [ 419.5, 239 + offsety, 49.609 ] );
//		this.createSpotLight( 0xffffff, 1, [ 419.5, 239 + offsety, 49.609 ], [ 350, 0 + offsety, -800 ], false );

		// opera light
//		this.createSpotLight( 0xffffff, 2.5, [ 22.78, 246.971 + offsety, -573.964 ], [ -200, 130 + offsety, -750 ]);

	};


	/* load a model from a JSON file and insert it in the scene */
	this.loadJSONScene = function( filename ) {

		var loader = new THREE.ObjectLoader();
//		var loader = new THREE.JSONLoader();

	    loader.load( filename, function( object ) {

    		object.traverse( function ( child ) {

	      		if ( child instanceof THREE.Mesh ) {

	      			// pre processing ops.
	      			child.position.y += offsety;
//	      			child.geometry.computeVertexNormals();
//	      			child.geometry.computeTangents();

	      			// material

	 				var newMaterial = new THREE.MeshLambertMaterial( child.material );

					if (child.material.name.indexOf("Flat") >= 0) {
	      				newMaterial.shading = THREE.FlatShading;
	      			} else {
	      				newMaterial.shading = THREE.SmoothShading;
	      			}

	 				if (child.material.mapBump != null) {

						child.material.normalMap = child.material.mapBump;
	 					child.material.mapBump = null; 
						child.material.normalScale = new THREE.Vector2( 0.5, 0.5); 

//						newMaterial.ambient = 13421772;
/*						newMaterial.specular = 5855577;
						
						newMaterial.emissive = 0; 
						newMaterial.shininess = 2;*/
	 					newMaterial.normalMap = child.material.mapBump;
	 					newMaterial.mapBump = null; 
//	 					newMaterial.normalScale = new THREE.Vector2( 0.5, 0.5);
						newMaterial.wrapRGB = new THREE.Vector3( 0.5, 0.5, 0.5 );
						newMaterial.wrapAround = true;

	 				} 

	 				var mesh = new THREE.Mesh( child.geometry, newMaterial );

					mesh.position.y += offsety;	

					if ( globalShadows ) {	
			            mesh.receiveShadow = true;
			            mesh.castShadow = true;
			        }

			        collisionObjects.push( mesh );
		            scene.add( mesh );
		            
	        	}

	/*        	if ( child instanceof THREE.Light ) {
	        		scene.add( child );
	        	} */

			});
		});
	};


	this.windowResize = function( window ) {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		if ( useComposer ) {
			composer.reset();
			effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );
		}
	}


	this.animate = function() {

		if ( useComposer ) {
			composer.render();
		} else {
			renderer.render( scene, camera );
		}

	};

};