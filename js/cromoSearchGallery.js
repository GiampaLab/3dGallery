'use strict';

/* Directives */


angular.module('cromoflixGallery.directives',[]).
  directive('cromoSearchGallery', ['searchService', '$rootScope', function (searchService, $rootScope) {
      var directiveDefinitionObject = {
          restrict: 'E',
          replace: true,
          templateUrl: 'templates/horizontalGalleryTemplate.html',
          scope: { searchTerm: '=' },
          link: function postLink(scope, iElement, iAttrs) {
              var result;
              scope.images = [];
              scope.$watch('searchTerm', function (value) {
                scope.images.splice(0, scope.images.length);
                $rootScope.$broadcast('cromoSearchGalleryLoading', true);
                var result = searchService.get({ searchTerm: value }, function () {
                    $rootScope.$broadcast('cromoSearchGalleryLoading', false);
                    var i = 0;
                    var interval = setInterval(function () {
                        scope.$apply(function () {
                            if (i == result.Images.length) {
                                clearInterval(interval);
                                
                            }
                            else{
                              scope.images.push(result.Images[i]);
                              $rootScope.$broadcast('cromoSearchGalleryImageAdded', result.Images[i]);
                              i++;
                            }
                        });
                    }, 400);
                });
              });
          }
      }
      return directiveDefinitionObject;
  }]);
