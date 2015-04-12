'use strict';

/* Controllers */

angular.module('cromoflixGallery.controllers', []).
  controller('searchGalleryController', ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window){
    var myContainer = angular.element('#myContainer');
    var item = angular.element('.galleryContainer');
    var maxOffset = 0;
    var index = 0;
    var throttledRight = _.throttle(scrollRightInner, 500, {trailing:false, leading:false});
    var throttledLeft = _.throttle(scrollLeftInner, 500, {trailing:false, leading:false});
    $scope.$watchCollection('images', function(){
      maxOffset = item[0].offsetWidth * ($scope.images.length - 1);
      setSelectedImage(index);
    });
      $scope.scrollLeft = function(){
        throttledLeft();
      }

      $scope.scrollRight = function(){
        throttledRight();
      }

      function scrollRightInner(){
        console.log("throttle");
        var leftPos = myContainer[0].offsetLeft;
        if(-leftPos < maxOffset){
          myContainer.animate({'marginLeft': '' + (leftPos - item[0].offsetWidth) + 'px'}, 300); 
          index++;
          setSelectedImage(index);         
        }
      }

      function scrollLeftInner(){
        var leftPos = myContainer[0].offsetLeft;
        if(leftPos < 0){
          myContainer.animate({'marginLeft': '' + (leftPos + item[0].offsetWidth) + 'px'}, 300);
          index--;
          setSelectedImage(index);
        }
      }

      function setSelectedImage(index){
        if($scope.images.length > 0 && typeof $scope.images[index] != 'undefined' && !$scope.images[index].selected){
          $scope.images[index].selected = true;
          angular.forEach($scope.images, function(image, currentIndex){
            if(currentIndex !== index){
              image.selected = false;
            }
          });
          $rootScope.$broadcast('imageSelected', $scope.images[index]);
        }
      }

      $rootScope.$on('cromoSearchGalleryLoading', function(value, args){
        if(!args){
            index = 0;
            angular.forEach($scope.images, function(image, currentIndex){
                image.selected = false;
            });
            myContainer.animate({'marginLeft': '0px'}, 300);
            setSelectedImage(0); 
        } 
      });
  }])