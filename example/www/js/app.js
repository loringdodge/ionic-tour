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

.controller('MainCtrl', function($scope, $ionicTour, $ionicSideMenuDelegate, $compile) {

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

  $scope.addStep = function() {
    var template = '<div class="button-bar padding"><a tour-step="11" tour-on-start="onStart" tour-on-leave="onLeave" class="button">11</a></div>';
    var el = $compile(template)($scope.tour.scope);

    var body = document.querySelector('.scroll');
    angular.element(body).append(el);

    $scope.tour.sort();
  }

  $scope.removeStep = function(index) {
    $scope.tour.removeStep(index);
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
    console.log('in')
    if($scope.tour._orientation !== 'next') {
      console.log('inside')
      $ionicSideMenuDelegate.toggleLeft(false);
    }
  }

  $scope.closeSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(false);
  }


});