'use strict';

angular.module('cromoflixGallery.directives').
    directive('loading', ['$rootScope', function($rootScope) {
        var directiveDefinitionObject = {
            replace: false,
            scope: {
                loadingEvent: '@'    
            },
            template: '<div class=\"row ajax-loading-block-window\" style=\"display: none\"  ng-style=\"showLoading\"><div class=\"loading-image\"></div></div>',
            link: function preLink(scope, iElement, iAttrs) {
                $rootScope.$on(scope.loadingEvent, function (event, args) {
                    scope.showLoading = {
                        display: 'none'
                    };
                    if (args) {
                        scope.showLoading.display = 'block';
                    } else {
                        scope.showLoading.display = 'none';
                    }
                });
            }
        };
        return directiveDefinitionObject;
    }]);