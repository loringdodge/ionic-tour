Ionic Tour
===================

A demo of how to achieve a side menu similar to that of the OkCupid App.
When the side menu is triggered, a ratio is returned via the `$ionicSideMenuDelegate.getOpenRatio()` provider method.
This ratio is then by a callback which is passed to the the animate ratio directive through
the `animate-ratio` ratio.

[Demo](http://codepen.io/loringdodge/pen/epNNgg)

## Usage

In your sidemenu:
```html
<ion-view view-title="Ionic Tour">
  <ion-pane>

  <ion-content>

    <div class="button-bar padding">
      <a class="button" ng-click="tour.start({autoplay: true})">Start</a>
    </div>

    <div class="button-bar padding">
      <a class="button"></a>
      <a class="button"></a>
      <a tour-step="1" tour-on-start="onStart" tour-on-end="onEnd" tour-on-transition="onTransition" tour-on-leave="onLeave" class="button">1</a>
    </div>

    <div class="button-bar padding">
      <a tour-step="2" tour-on-start="onStart" tour-on-end="onEnd" tour-on-transition="onTransition" tour-on-leave="onLeave" class="button">2</a>
    </div>

    <div class="button-bar padding">
      <a class="button"></a>
      <a tour-step="3" tour-on-start="onStart" tour-on-leave="onLeave" class="button">3</a>
    </div>

  </ion-content>

  </ion-pane>
</ion-view>
```

```html
<div class="custom-tip">
  <div class="custom-tip-arrow"></div>
  <div class="button-bar">
    <button class="button" ng-click="next()">Next</button>
    <button class="button" ng-click="previous()">Previous</button>
  </div>

  <div class="button-bar">
    <button class="button" ng-click="finish()">Finish</button>
    <button class="button" ng-click="step(1)">goToStep 1</button>
    <button class="button" ng-click="reset()">Reset</button>
  </div>
```

In your parent controller:
```js
angular.module('starter', ['ionic', 'ionic.tour'])
.controller('MainCtrl', function($scope, $ionicTour, $ionicSideMenuDelegate) {

  $ionicTour.fromTemplateUrl('tour-template.html', {
    scope: $scope
  }).then(function(tour){
    console.log('tourLoaded');
    $scope.tour = tour;
  });

  $scope.next = function() {
    // console.log('next');
    $scope.tour.next();
  }

  $scope.previous = function() {
    // console.log('previous');
    $scope.tour.previous();
  }

  $scope.finish = function() {
    // console.log('finish');
    $scope.tour.finish({
      destroy: false
    });
  }

  $scope.step = function(index) {
    $scope.tour.step(index);
  }

  $scope.reset = function() {
    // console.log('reset');
    $scope.tour.reset();
  }

  $scope.onStart = function(element, tourtip) {
    // console.log('onStart', element, tourtip);
    angular.element(element).addClass('button-outline button-assertive')
  }

  $scope.onEnd = function(element, tourtip) {
    // console.log('onEnd', element, tourtip);
  }

  $scope.onLeave = function(element, tourtip) {
    // console.log('onLeave', element, tourtip);
    angular.element(element).removeClass('button-outline button-assertive')
  }

  $scope.onTransition = function(ratio) {
    // console.log('onTransition', ratio);
  }

  $scope.$on('tourFinished', function(){
    // console.log('tourFinished');
  })

  $scope.$on('tourStarted', function(){
    // console.log('tourStarted');
  })

  $scope.openSideMenu = function(element, tourtip) {
    $ionicSideMenuDelegate.toggleLeft(true);
  }

  $scope.closeSideMenu = function(element, tourtip) {
    if($scope.tour._orientation === 'previous') {
      $ionicSideMenuDelegate.toggleLeft(false);
    }
  }

})
```

## Directive Attributes

| Name                   | Scope  | Options| Params | Action                                                        |
|------------------------|--------|--------|---------------------------------------------------------------|
| `tour-step`            | =      | fn     |        | Callback used to customize animation                          |
| `tour-on-start`        | =      | fn     |        | Callback used to customize animation                          |
| `tour-on-end`          | =      | fn     |        | Callback used to customize animation                          |
| `tour-on-transition`   | =      | fn     |        | Callback used to customize animation                          |
| `tour-on-enter`        | =      | fn     |        | Callback used to customize animation                          |
| `tour-on-leave`        | =      | fn     |        | Callback used to customize animation                          |








