'use strict';


angular.module('cromoflixGallery.factories', ['ngResource']).
	factory('searchService', ['$resource', function ($resource) {
	    return $resource('http://www.cromoflix.com/WidgetsHomeGallery/Search', { searchTerm: '@searchTerm '});
	}]);