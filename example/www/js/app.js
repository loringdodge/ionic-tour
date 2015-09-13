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

  $scope.step = function(index) {
    $scope.tour.step(index);
  }

  $scope.reset = function() {
    $scope.tour.reset();
  }

  $scope.onStart = function(element, tourtip) {
    angular.element(element).addClass('button-outline button-assertive')
  }

  $scope.onEnd = function(element, tourtip) {

  }

  $scope.onLeave = function(element, tourtip) {
    angular.element(element).removeClass('button-outline button-assertive')
  }

  $scope.onTransition = function(ratio) {

  }

  $scope.$on('tourAtStart', function(){

  })

  $scope.$on('tourAtEnd', function(){

  })

  $scope.openSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(true);
  }

  $scope.closeSideMenuPrevious = function(element, tourtip) {
    if($scope.tour._orientation === 'previous') {
      $ionicSideMenuDelegate.toggleLeft(false);
    }
  }

  $scope.closeSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(false);
  }


});