// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic.tour'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainCtrl', function($scope, $ionicTour) {

  $scope.items = [0,1,2,3,4,5];

  // var tour = {
  //   config: {},
  //   steps: [{
  //       target: '.button-1',
  //       content: 'This is the first step!',
  //   }, {
  //       target: '.button-2',
  //       content: 'Blah blah blah.',
  //   }, {
  //       target: '.button-3',
  //       content: 'I guess this is a menu!',
  //   }, {
  //       target: '.button-4',
  //       content: 'I guess this is a menu!',
  //   }, {
  //       target: '.button-5',
  //       content: 'I guess this is a menu!',
  //   }]
  // };

  // $scope.startTour = function() {
  //   console.log('start');
  //   nzTour.start(tour);
  // }

  var tour = {};

  $ionicTour.fromTemplateUrl('tour-template.html', tour, {
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
    $scope.tour.finish();
  }

  $scope.onStart = function() {
    console.log('onStart');
  }

  $scope.onEnd = function() {
    console.log('onEnd');
  }

  $scope.onTransition = function(ratio) {
    console.log('onTransition', ratio);
  }


})