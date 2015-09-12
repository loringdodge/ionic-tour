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

---
## Documentation

1.  `$ionicTour` Methods
2.  `$scope.tour` Methods
3.  Listeners
4.  Directive Attributes

---
##### `$ionicTour` Methods

**`fromTemplateUrl(url, options)`**

*   @param {string} url The url where the tooltip template is located.
*   @param {object} options Options to be passed {@link ionic.controller:ionicTour#initialize ionicTour#initialize} method.
*   @returns {promise} A promise that will be resolved with an instance of
*   an {@link ionic.controller:ionicModal} controller.

```
  $ionicTour.fromTemplateUrl('tour-template.html', {
    scope: $scope
  }).then(function(tour){
    console.log('tourLoaded');
    $scope.tour = tour;
  });
```
---
##### `$scope.tour` Methods

**`start()`** - Appends the tourtip to the DOM

*   @param {object} options
* @return {undefined}

```
$scope.start = function() {
  $scope.tour.start();
}
```

**`finish()`** - Remove the tourtip from the DOM and destroy the scope

*   @param {Object} options
* @return {undefined}

```
$scope.finish = function() {
  $scope.tour.finish();
}
```

**`step(index)`** - Move the tourtip to a specific step

* @param {number} index The index of the step
* @return {undefined}

```
$scope.step = function(index) {
  $scope.tour.step(index);
}
```

**`reset()`** - Resets the index to 1.

* @return {undefined}

```
$scope.reset = function() {
  $scope.tour.reset();
}
```

**`next()`** - Change the index to the next step and trigger goToStep

* @return {undefined}

```
$scope.next = function() {
  $scope.tour.next();
}
```

**`previous()`** - Animate the tourtip to a specific index

* @return {undefined}

```
$scope.previous = function() {
  $scope.tour.previous();
}
```

**`isRunning()`** - Whether a step is in progress or running

* @param {boolean}

```
$scope.doSomething = function() {
  if($scope.tour.isRunning()){
    // something
  }
}
```

**`isShown()`** - Whether the tooltip is shown

* @return {undefined}

```
$scope.doSomething = function() {
  if($scope.tour.isShown()){
    // something
  }
}
```
---
##### Listeners

**`tourStarted`** - Broadcasted when the $scope.tour.start() function is invoked

```
$scope.$on('tourStarted', function(){
  // something
})
```

**`tourFinished`** - Broadcasted when the $scope.tour.finish() function is invoked

```
$scope.$on('tourFinished', function(){
  // something
})
```
---

##### Directive Attributes

**`tour-on-start(stepEl, tourtipEl)`** - Invoked before the tooltip animates to the step element

*   @param {object} stepEl The element of the current step
*   @param {object} tourtipEl The tooltip element
* @return {undefined}

```
<div tour-step="1" tour-on-start="onStart"></div>
```

```
$scope.onStart = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-end()`** - Invoked after the tooltip fully animates to the step element

*   @param {object} stepEl The element of the current step
*   @param {object} tourtipEl The tooltip element
* @return {undefined}

```
<div tour-step="1" tour-on-end="onEnd"></div>
```

```
$scope.onEnd = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-transition`** - Invoked as the tooltip animates toward the step element

*   @param {number} ratio Percentage of animation completion (0 to 1)
*   @param {object} stepEl The element of the current step
*   @param {object} tourtipEl The tooltip element
* @return {undefined}

```
<div tour-step="1" tour-on-transition="onStart"></div>
```

```
$scope.onTransition = function(ratio, stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-enter`** - Invoked before the tooltip moves toward the step element

*   @param {object} stepEl The element of the current step
*   @param {object} tourtipEl The tooltip element
* @return {undefined}

```
<div tour-step="1" tour-on-enter="onEnter"></div>
```

```
$scope.onEnter = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-leave`** - Invoked before the tooltip moves away from the step element

*   @param {object} stepEl The element of the current step
*   @param {object} tourtipEl The tooltip element
* @return {undefined}

```
<div tour-step="1" tour-on-leave="onLeave"></div>
```

```
$scope.onLeave = function(stepEl, tourtipEl) {
  // do something
}
```










