
var Controller = function() {
	
	var controls;
	
	var havePointerLock;

	// enable control movements
	this.enabled = false;

	// movements
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	// time to calculate velocity
	var prevTime = performance.now();

	// velocity
	var velocity = 800.0;
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

					this.enabled = true;
					controls.enabled = true;
					blocker.style.display = 'none';

				} else {

					this.enabled = false;
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


		var onKeyDown = function ( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					this.moveForward = true;
					break;

				case 37: // left
				case 65: // a
					this.moveLeft = true; 
					break;

				case 40: // down
				case 83: // s
					this.moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					this.moveRight = true;
					break;
			}

		};


		var onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					this.moveForward = false;
					break;

				case 37: // left
				case 65: // a
					this.moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					this.moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					this.moveRight = false;
					break;

			}

		};

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

	};


	/* get collisions with objects in the scene */
	var detectCollision = function( objects ) {

		// get camera direction
		var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

		// rotate camera direction
		var rotationMatrix = new THREE.Matrix4().makeRotationY(0);

		if ((this.moveForward) && (this.moveRight))
		    rotationMatrix.makeRotationY(315 * Math.PI / 180);
		else if ((this.moveForward) && (this.moveLeft))
		    rotationMatrix.makeRotationY(45 * Math.PI / 180);
		else if ((this.moveBackward) && (this.moveRight))
		    rotationMatrix.makeRotationY(225 * Math.PI / 180);
		else if ((this.moveBackward) && (this.moveLeft))
		    rotationMatrix.makeRotationY(135 * Math.PI / 180);
		else if (this.moveBackward)
		    rotationMatrix.makeRotationY(180 * Math.PI / 180);
		else if (this.moveLeft)
		    rotationMatrix.makeRotationY(90 * Math.PI / 180);
		else if (this.moveRight)
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


	this.animate = function (  ) {

		if ( this.enabled ) {

			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;

//			detectCollision( objects );

			if ( isOnObstacle === false ) {

				velocityVec.x -= velocityVec.x * 10.0 * delta;
				velocityVec.z -= velocityVec.z * 10.0 * delta;

				velocityVec.y -= 9.8 * 100.0 * delta; // 100.0 = mass

				if ( this.moveForward ) velocityVec.z -= velocity * delta;
				if ( this.moveBackward ) velocityVec.z += velocity * delta;
				if ( this.moveLeft ) velocityVec.x -= velocity * delta;
				if ( this.moveRight ) velocityVec.x += velocity * delta;

				controls.getObject().translateX( velocityVec.x * delta );
				controls.getObject().translateY( velocityVec.y * delta );
				controls.getObject().translateZ( velocityVec.z * delta );
				
			}

			prevTime = time;

		}
	};
}