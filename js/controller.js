
var Controller = function() {
	
	var controls;
	
	var havePointerLock;

	// movements
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	// time to calculate velocity
	var prevTime = -1;

	// velocity
	var velocity = 1000.0;
	var velocityVec = new THREE.Vector3();

	// all objects translate y axis
	var offsety = -165;

	// controlos against an obstacle
	var isOnObstacle = false;

	// raycaster for collision detection
	var raycaster = new THREE.Raycaster( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), 0, 30 );


	this.init = function( document, scene, camera ) {

		controls = new THREE.PointerLockControls( camera );
		scene.add( controls.getObject() );

		var blocker = document.getElementById( 'blocker' );
		var instructions = document.getElementById( 'instructions' );

		havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if ( havePointerLock ) {

			var element = document.body;
			var pointerlockchange = function ( event ) {

				if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
					controls.enabled = true;
					blocker.style.display = 'none';

				} else {
					controls.enabled = false;
					prevTime = -1;
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


		this.onKeyDown = function ( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true; 
					break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;
			}

		};


		this.onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;

			}

		};

		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );

	};


	/* get collisions with objects in the scene */
	this.detectCollision = function( objects ) {

		// get camera direction
		var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

		// rotate camera direction
		var rotationMatrix = new THREE.Matrix4().makeRotationY(0);

		if ((moveForward) && (moveRight))
		    rotationMatrix.makeRotationY(315 * Math.PI / 180);
		else if ((moveForward) && (moveLeft))
		    rotationMatrix.makeRotationY(45 * Math.PI / 180);
		else if ((moveBackward) && (moveRight))
		    rotationMatrix.makeRotationY(225 * Math.PI / 180);
		else if ((moveBackward) && (moveLeft))
		    rotationMatrix.makeRotationY(135 * Math.PI / 180);
		else if (moveBackward)
		    rotationMatrix.makeRotationY(180 * Math.PI / 180);
		else if (moveLeft)
		    rotationMatrix.makeRotationY(90 * Math.PI / 180);
		else if (moveRight)
		    rotationMatrix.makeRotationY(270 * Math.PI / 180);
		
		cameraDirection.applyMatrix4(rotationMatrix);

		// get intersections
		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y += offsety + 23;
		raycaster.ray.direction = cameraDirection; 
		raycaster.ray.direction.y = 0;

		var intersections = raycaster.intersectObjects( objects );

		if ( intersections.length > 0 ) 
			isOnObstacle = true;
		else
			isOnObstacle = false;

	};


	this.animate = function ( objects ) {

		if ( controls.enabled ) {
			var time = performance.now();

			this.detectCollision( objects );

			if ( isOnObstacle === false ) {
				var delta;

				if (prevTime == -1) 
					delta = 0;
				else
					delta = ( time - prevTime ) / 1000;

				velocityVec.x -= velocityVec.x * 10.0 * delta;
				velocityVec.z -= velocityVec.z * 10.0 * delta;
//				velocityVec.y -= 9.8 * 100.0 * delta; // 100.0 = mass

				if ( moveForward ) velocityVec.z -= velocity * delta;
				if ( moveBackward ) velocityVec.z += velocity * delta;
				if ( moveLeft ) velocityVec.x -= velocity * delta;
				if ( moveRight ) velocityVec.x += velocity * delta;

				controls.getObject().translateX( velocityVec.x * delta );
//				controls.getObject().translateY( velocityVec.y * delta );
				controls.getObject().translateZ( velocityVec.z * delta );
				
			}

			prevTime = time;

		}


	};
}