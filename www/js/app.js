angular.module('starter', ['ionic', 'ionic.tour'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "side-menu.html"
  })

  .state('app.home', {
    url: "/home",
    views: {
      'content': {
        templateUrl: "home.html"
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('MainCtrl', function($scope, $ionicTour, $ionicSideMenuDelegate) {

  $ionicTour.fromTemplateUrl('tour-template.html', {
    scope: $scope
  }).then(function(tour){
    console.log('tourLoaded');
    $scope.tour = tour;
  });

  $scope.next = function() {
    $scope.tour.next();
  }

  $scope.previous = function() {
    $scope.tour.previous();
  }

  $scope.finish = function() {
    $scope.tour.finish({
      destroy: false
    });
  }

  $scope.goToStep = function(index) {
    $scope.tour.goToStep(index);
  }

  $scope.reset = function() {
    // console.log('reset');
    $scope.tour.reset();
  }

  $scope.onStart = function(element, tourtip) {
    // console.log('onStart', element, tourtip);
    angular.element(element).addClass('button-outline button-assertive')
    // element.style.backgroundColor = 'red';
  }

  $scope.onEnd = function(element, tourtip) {
    // console.log('onEnd', element, tourtip);
  }

  $scope.onLeave = function(element, tourtip) {
    console.log('onLeave', element, tourtip);
    angular.element(element).removeClass('button-outline button-assertive')
  }

  $scope.onTransition = function(ratio) {
    // console.log('onTransition', ratio);
  }

  $scope.$on('tourFinished', function(){
    // console.log('tourFinished');
  })

  $scope.openSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(true);
  }

  $scope.closeSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(false);
  }


})