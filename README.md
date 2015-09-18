Ionic Tour
===================

This module allows devs to simulate a tour of their mobile app with the use of a tourtip that translates itself to whichever element is the next step on the tour.

The tour is instantiated inside a parent controller and steps are defined using an angular directive. You simply need to add `tour-step="1"` as an attribute to an element. You may also specify callbacks that are invoked at different points of the step including before, during, and after the animation.

The module was inspired by a similar tour called [nz-tour](https://github.com/nozzle/nzTour) created by [Tanner Linsley](https://github.com/tannerlinsley) and the codebase is modeled after the [$ionicModal](http://ionicframework.com/docs/api/service/$ionicModal/) module.

[Demo](http://codepen.io/loringdodge/pen/epNNgg)

[Blog Post]()

## Install

```
$ bower install --save ionic-tour
```

## Documentation

1.  `$ionicTour` Methods
2.  `$scope.tour` Methods
3.  Listeners
4.  Directive Attributes

---
#### `$ionicTour` Methods


**`fromTemplateUrl(url, options)`** - The module makes the assumption that the contents of the tourtip are retrived from an external template. In order to launch the module, the template must be loaded and a new tour object attached to the current scope via promise.

*   @param {string} url The url where the tooltip template is located.
*   @param {object} options Options to be passed
*   @returns {promise} A promise that will be resolved with an instance of
*   an {@link ionic.controller:ionicModal} controller.

```language-javascript
  $ionicTour.fromTemplateUrl('tour-template.html', {
    scope: $scope
  }).then(function(tour){
    $scope.tour = tour;
  });
```

---
#### `$scope.tour` Methods


**`start()`** - Appends the tourtip to the DOM and calculates positioning for all the step elements. Automatically animates to the first step unless specified otherwise.

*   @param {object} options
* @return {undefined}

```language-javascript
$scope.start = function() {
  $scope.tour.start({
    autoplay: true
  });
}
```

**`finish()`** - Removes the tourtip from the DOM and destroys the scope unless specified.

*   @param {Object} options
* @return {undefined}

```language-javascript
$scope.finish = function() {
  $scope.tour.finish({
    destroy: false
  });
}
```

**`step(index)`** - Move and animates the tourtip to the specified step.

* @param {number} index The index of the step
* @return {undefined}

```language-javascript
$scope.step = function(index) {
  $scope.tour.step(index);
}
```

**`reset()`** - Resets the index to 1 and animates the tourtip to the first step.

* @return {undefined}

```language-javascript
$scope.reset = function() {
  $scope.tour.reset();
}
```

**`next()`** - Changes the index to the next step and and triggers the tourtip animation to the next step element. If there are no longer any steps, `tourAtEnd` is broadcasted...see listeners.

* @return {undefined}

```language-javascript
$scope.next = function() {
  $scope.tour.next();
}
```

**`previous()`** - Changes the index to the previous step and and triggers the tourtip animation to the previous step element. If the index reaches 1 (beginning of steps), `tourAtStart` is broadcasted...see listeners.

* @return {undefined}

```language-javascript
$scope.previous = function() {
  $scope.tour.previous();
}
```

**`removeStep()`** - Removes a specified step from the tour. If the step being removed is the step the tourtip is currently positioned on, it will by default go to the previous element unless it is the first step, then the tourtip will go to the next element.

*   @param {number} index The step number to be removed
* @return {undefined}

```language-javascript
$scope.removeStep = function(index) {
  $scope.tour.removeStep(index);
}
```

**`sort()`** - Sorts the steps into sequential order. This is useful if you add a new step and it is not the the next in sequential order. Additionally, adding a step is as simple as compiling it and rendering it to the body.

* @return {undefined}

```language-javascript
  $scope.addStep = function() {
    var template = '<div class="button-bar padding"><a tour-step="11" tour-on-start="onStart" tour-on-leave="onLeave" class="button">11</a></div>';
    var el = $compile(template)($scope.tour.scope);

    var body = document.querySelector('.scroll');
    angular.element(body).append(el);

    $scope.tour.sort();
  }
```
---
#### Listeners

Ionic Tour broadcasts two listeners at the successful completion of two events, when the tour has succesfully been started and finshed.

**`tourStarted`** - Broadcasted when there are no longer any steps at the beginning of the steps array. There is also a property available on the tour object that returns a boolean if the step is the first step `$scope.tour._isFirst`.

```language-javascript
$scope.$on('tourAtStart', function(){
  // something
})
```

**`tourAtEnd`** - Broadcasted when there are no longer any steps at the end of the steps array. There is also a property available on the tour object that returns a boolean if the step is the last step `$scope.tour._isLast`.

```language-javascript
$scope.$on('tourAtEnd', function(){
  // something
})
```
---

#### Directive Attributes

**`tour-step`** {=} - Accepts an integer. Identifies the element as the element to reference in a that particular step. Steps should start at 1 and increment by 1 for each additional step.

```language-markup
<div tour-step="1"></div>
<div tour-step="2"></div>
<div tour-step="3"></div>
```

##### Callbacks

A set of 5 callbacks are available through directive attributes and are invoked at different times as the tourtip moves from one step to another. Each example offers a snippet on how to include attribute in the markup and also how to declare the callback (as well as parameters) in the controller. They are listed in order of invocation.

**`tour-on-enter`** {=} - Invoked before the tooltip animates to the next step element.

*   @param {object} `stepEl` The element of the current step
*   @param {object} `tourtipEl` The tooltip element
* @return {undefined}

```language-markup
<div tour-step="1" tour-on-enter="onEnter"></div>
```

```language-javascript
$scope.onEnter = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-start(stepEl, tourtipEl)`** {=} - Invoked directly before the tooltip animates to the step element.

*   @param {object} `stepEl` The element of the current step
*   @param {object} `tourtipEl` The tooltip element
* @return {undefined}

```language-markup
<div tour-step="1" tour-on-start="onStart"></div>
```

```language-javascript
$scope.onStart = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-transition`** {=} - Invoked repeatedly as the tooltip animates toward the next step element. The first parameter, `ratio`, indicates the percentage of progression of the animation.

*   @param {number} `ratio` Percentage of animation completion (0 to 1)
*   @param {object} `stepEl` The element of the current step
*   @param {object} `tourtipEl` The tooltip element
* @return {undefined}

```language-markup
<div tour-step="1" tour-on-transition="onStart"></div>
```

```language-javascript
$scope.onTransition = function(ratio, stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-end`** {=} - Invoked directly after the tooltip fully animates to the next step element.

*   @param {object} `stepEl` The element of the current step
*   @param {object} `tourtipEl` The tooltip element
* @return {undefined}

```language-markup
<div tour-step="1" tour-on-end="onEnd"></div>
```

```language-javascript
$scope.onEnd = function(stepEl, tourtipEl) {
  // do something
}
```

**`tour-on-leave`** {=} - Invoked on the element after animation but before the tourtip moves to the next step element.

*   @param {object} `stepEl` The element of the current step
*   @param {object} `tourtipEl` The tooltip element
* @return {undefined}

```language-markup
<div tour-step="1" tour-on-leave="onLeave"></div>
```

```language-javascript
$scope.onLeave = function(stepEl, tourtipEl) {
  // do something
}
```