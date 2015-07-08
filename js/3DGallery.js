'use strict';

angular.module('cromoflixGallery.controllers').
  controller('3DGallery', ['$scope', '$rootScope', function($scope, $rootScope) {

	var manager = new SceneManager( document );
	var controller = new Controller();

	init();
	animate();

	/* do window resize */
	function onWindowResize( window ) {

		manager.windowResize( window );

	}

	/* initialize all scene properties */
	function init() {
	
		controller.init( document, manager.getScene(), manager.getCamera() );
		manager.loadJSONScene ( "./model/roomv1.2.json" );
//		manager.loadJSONScene ( "./model/statue.json" );
		manager.initLights();

		window.addEventListener( 'resize', onWindowResize, false );

	}

	/* handle animations */
	function animate() {

		requestAnimationFrame( animate );
		controller.animate( manager.getCollisionObjects() );
		manager.animate();
		
	}

}]);