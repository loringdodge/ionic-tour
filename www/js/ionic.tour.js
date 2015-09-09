(function(ionic) {

  angular.module('ionic.tour', [])
    .factory('$ionicTour', function($rootScope, $compile, $timeout, $window, $q, $ionicTemplateLoader, $ionicBody, $ionicPosition, $ionicScrollDelegate) {

        var steps = [];

        /**
         * Returns a closure depending on which parameter value is larger
         *
         * @param {number} oldVal The old value.
         * @param {number} newVal The new value.
         * @return {function} Returns a closure that accepts the ratio as first parameter
         */
        var getPosition = function(oldVal, newVal) {
          if(oldVal <= newVal) {
            return function(v) {
              return oldVal + ((newVal - oldVal) * v);
            }
          }
          return function(v) {
            return oldVal - ((oldVal - newVal) * v);
          }
        };

        /**
         * Returns the duration based on the difference of the two parameters over a ratio
         *
         * @param {number} oldVal The old value.
         * @param {number} newVal The new value.
         * @return {number} Returns the duration based on a ratio (0.5)
         */
        var getDuration = function(oldVal, newVal) {
          return Math.abs((oldVal - newVal)) / 0.5;
        };

        /**
         * Gets the CSS value of a property
         *
         * @param {object} element The DOM element
         * @param {string} name The CSS property
         * @return {Boolean} Returns the value of the property. Otherwise, 'undefined' if the value is not specified
         */
        // Function from https://github.com/angular/angular.js/issues/2866
        // Kudos to https://github.com/calummoore
        var getStyle = function(element, name) {
          var val;
          //for old IE
          if (typeof element.currentStyle === 'function'){
              val = element.currentStyle[name];
          }
          //for modern browsers
          else if (typeof window.getComputedStyle === 'function'){
              val = element.ownerDocument.defaultView
                  .getComputedStyle(element,null)[name];
          }
          else {
              val = element.style[name];
          }
          return  (val === '') ? undefined : val;
        };

        var TourView = ionic.views.View.inherit({

          /**
           * @ngdoc method
           * @name ionicTour#initialize
           * @description Creates a new modal controller instance.
           * @param {object} opts an object with the following properties
           *  - `{object=}` `scope` The scope to be a child of.
           *    Default: creates a child of $rootScope.
           */
          initialize: function(opts) {
            opts = ionic.extend({}, opts);
            ionic.extend(this, opts);
          },

          /**
           * @ngdoc method
           * @name ionicTour#start
           * @description Appends the tourtip to the DOM
           * @param {object} options
           *  - `{boolean=}` `autoplay` Whether the tooltip animates to the first element
           *    Default: does not automatically go to the first stepEl
           */
          start: function(options) {
            console.log('start');
            var self = this;

            options = options || { autoplay: true };

            $ionicScrollDelegate.freezeScroll(true);

            $ionicBody.append(self.$tourtipEl);

            self.tooltip = $ionicPosition.offset(self.$tourtipEl);

            self.arrow = {
              color: getStyle(self.arrowEl, 'borderBottomColor'),
              top: getStyle(self.arrowEl, 'top')
            }

            $timeout(function() {
              self.$tourtipEl.addClass('slide-in ng-enter active')
            });

            if(!options.autoplay) return;

            self.next();

          },

          /**
           * @ngdoc method
           * @name ionicTour#goToStep
           * @description Triggers the tourtip animation if not currently running
           * @param {number} index The index of the step
           * @param {function} onLeave The callback to be invoked before leaving
           */
          goToStep: function(index, onLeave) {
            console.log('goToStep', index);
            var self = this;

            onLeave = onLeave || self.steps[index].onLeave;

            if(!self._isRunning) {
              self._isRunning = true;

              self._isFirst = (index === 0);
              self._isLast = (index === (self.steps.length - 1));

              onLeave();

              self.animateStep(index)
                .then(function(){
                  self._isRunning = false;
                });
            }
          },

          /**
           * @ngdoc method
           * @name ionicTour#reset
           * @description Resets the index to 1. Same as goToStep(1)
           */
          reset: function() {
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            self._orientation = 'next';

            i = 0;

            self.goToStep(i, function(){
              stepEl.onLeave(stepEl[0], tourtipEl);
            });

          },

          /**
           * @ngdoc method
           * @name ionicTour#step
           * @description Move the tourtip to a specific step
           * @param {number} index The index of the step
           */
          step: function(index) {
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            i = --index;

            self._orientation = 'next';

            self.goToStep(i, function(){
              stepEl.onLeave(stepEl[0], tourtipEl);
            });
          },

          /**
           * @ngdoc method
           * @name ionicTour#next
           * @description Change the index to the next step and trigger goToStep
           */
          next: function() {
            console.log('next');
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            self._orientation = 'next';

            i++;

            if(i >= self.steps.length) return undefined;

            self.goToStep(i, function(){
              if((i-1) > -1) self.steps[i-1].onLeave(stepEl[0], tourtipEl);
            });

          },

          /**
           * @ngdoc method
           * @name ionicTour#previous
           * @description Change the index to the previous step and trigger goToStep
           */
          previous: function() {
            console.log('previous');
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            self._orientation = 'previous';

            i--;

            if(i < 0) return undefined;

            self.goToStep(i, function(){
              if((i+1) < self.steps.length) stepEl.onLeave(stepEl[0], tourtipEl);
            });

          },

          /**
           * @ngdoc method
           * @name ionicTour#finish
           * @description Remove the tourtip from the DOM and destroy the scope
           * @param {Object} options
           *  - `{boolean=}` `scope` Whether the scope should be destroyed
           *    Default: true
           */
          finish: function(options) {
            console.log('finish', options);
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            options = options || { destroy: true };

            $ionicScrollDelegate.freezeScroll(false);

            self._orientation = 'next';

            stepEl.onLeave(stepEl[0], tourtipEl);

            self.index = -1;

            self.scope.$parent && self.scope.$parent.$broadcast('tourFinished');

            if(options.destroy) {
              self.scope.$destroy();
            }

            tourtipEl.remove();

          },

          /**
           * @ngdoc method
           * @name ionicTour#animateStep
           * @description Animate the tourtip to a specific index
           * @param {number} index The index of the step
           */
          animateStep: function(index) {
            console.log('animateStep', index);
            var self = this;

            self.index = index;
            var i = self.index;

            var stepEl = self.steps[i],
                tourtip = self.tooltip,
                tourtipEl = self.tourtipEl,
                windowEl = self.windowEl,
                arrowEl = self.arrowEl,
                scrollView = $ionicScrollDelegate.getScrollView(),
                newTourtipTop = stepEl.position.top + stepEl.position.height + 20,
                newArrowLeft = (stepEl.position.left + (stepEl.position.width / 2)) - (windowEl.width * 0.01),
                scrollDiff = 0;

            if(typeof stepEl.scrollDiff !== 'undefined') {
              $ionicScrollDelegate.scrollBy(0, -stepEl.scrollDiff, true);
            }

            if(newTourtipTop > windowEl.height) {
              scrollDiff = Math.min(newTourtipTop - windowEl.height, scrollView.__maxScrollTop);
              $ionicScrollDelegate.scrollBy(0, scrollDiff, true);
              self.steps[i-1].scrollDiff = scrollDiff;
            }

            if(newTourtipTop + tourtip.height > windowEl.height){
              newTourtipTop = stepEl.position.top - tourtip.height - scrollDiff - 20;
              self.styleArrow('bottom');
            } else {
              self.styleArrow('top');
            }

            var tourtipTop = getPosition(self.position.top, newTourtipTop);
            var arrowLeft = getPosition(self.position.left, newArrowLeft);
            var duration = getDuration(self.position.top, newTourtipTop);

            self.position.top = newTourtipTop;
            self.position.left = newArrowLeft;

            var deferred = $q.defer();

            var animation = collide.animation({
              duration: duration,
              percent: 0,
              reverse: false
            })

            .easing({
              type: 'spring',
              frequency: 5,
              friction: 250,
              initialForce: false
            })

            .on('start', function() {
              stepEl.onStart(stepEl[0], tourtipEl);
            })

            .on('step', function(v) {
              stepEl.onTransition(v, stepEl[0], tourtipEl);
              tourtipEl.style.transform = tourtipEl.style.webkitTransform = 'translate3d(0,' + tourtipTop(v) +'px,0)';
              arrowEl.style.transform = self.arrowEl.style.webkitTransform = 'translate3d(' + arrowLeft(v) + 'px,0,0)';
            })

            .on('complete', function() {
              stepEl.onEnd(stepEl[0], tourtipEl);
              deferred.resolve();
            })
            .start();

            return deferred.promise;

          },

          /**
           * @ngdoc method
           * @name $ionicTour#registerStep
           * @description Change the orientation of the tourtip arrow
           * @param {string} orientation Either 'top', 'bottom', or 'none'
           */
          styleArrow: function(orientation) {
            var self = this;

            orientation = orientation || 'top';

            var arrowEl = self.arrowEl;
            var arrow = self.arrow;

            if(orientation === 'top'){
              arrowEl.style.top = arrow.top;
              arrowEl.style.borderTopColor = 'transparent';
              arrowEl.style.borderBottomColor = arrow.color;

              self._arrowStyle = 'top';
            } else if (orientation === 'bottom'){
              arrowEl.style.top = '100%';
              arrowEl.style.borderTopColor = arrow.color;
              arrowEl.style.borderBottomColor = 'transparent';

              self._arrowStyle = 'bottom';
            } else if(orientation === 'none'){
              arrowEl.style.display = 'none';

              self._arrowStyle = 'none';
            }
          },

          /**
           * @ngdoc method
           * @name $ionicTour#isRunning
           * @description Whether a step is in progress or running
           * @param {boolean}
           */
          isRunning: function() {
            return !!this._isRunning;
          },

          /**
           * @ngdoc method
           * @name $ionicTour#isShown
           * @description Whether the tooltip is shown
           * @param {boolean}
           */
          isShown: function() {
            return !!this._isShown;
          },

          _arrowColor: null,
          _arrowEl: null,
          _arrowStyle: 'top',
          _arrowTop: null,
          _arrowLeft: null,
          _index: -1,
          _isFirst: true,
          _isLast: false,
          _isRunning: false,
          _isShown: false,
          _orientation: 'next',
          _steps: [],
          _scrollDiff: null,
          _tourtipEl: null,
          _tourtipTop: null,
          _tourtipHeight: null,
          _tourtipWidth: null,
          _windowHeight: null,
          _windowWidth: null,

        });

        var createTour = function(templateString, options) {

          var scope = options.scope && options.scope.$new() || $rootScope.$new(true);

          options.viewType = 'tour';

          ionic.extend(scope, {
            $hasHeader: false,
            $hasSubheader: false,
            $hasFooter: false,
            $hasSubfooter: false,
            $hasTabs: false,
            $hasTabsTop: false
          });

          var element = $compile('<div class="ion-tourtip">' + templateString + '</div>')(scope);

          steps.sort(function(a,b){
            return a.step - b.step;
          });

          angular.forEach(steps, function(element){
            var position = $ionicPosition.offset(element);
            ionic.extend(element, {
              position: position,
              scrollDiff: 0
            });
          });

          options.steps = steps;
          options.index = -1;
          options.position = { top: 0, left: 0 };
          options.tour = tour;

          options.windowEl = { height: $window.innerHeight, width: $window.innerWidth };

          options.$el = element;
          options.el = element[0];

          options.tourtipEl = options.el.querySelector('.custom-tip');
          options.$tourtipEl = angular.element(options.tourtipEl);

          options.arrowEl = options.tourtipEl.querySelector('.custom-tip-arrow');
          options.$arrowEl = angular.element(options.arrowEl);

          var tour = new TourView(options);

          tour.scope = scope;

          if (!options.scope) {
            scope[ options.tour ] = tour;
          }

          return $q.when(tour);

        }

      return {
        /**
         * @ngdoc method
         * @name $ionicTour#fromTemplateUrl
         * @param {string} url The url where the tooltip template is located.
         * @param {object} options Options to be passed {@link ionic.controller:ionicTour#initialize ionicTour#initialize} method.
         * @returns {promise} A promise that will be resolved with an instance of
         * an {@link ionic.controller:ionicModal} controller.
         */
        fromTemplateUrl: function(url, options) {
          if(!url) throw 'A template was not defined.';
          if(!options) throw 'Options are not defined.';

          return $ionicTemplateLoader.load(url).then(function(templateString) {
            var tour = createTour(templateString, options);
            return tour;
          })
        },

        /**
         * @ngdoc method
         * @name $ionicTour#registerStep
         * @description Registers an element (step) with the factory.
         * @param {object} element A jQLite object
         */
        registerStep: function(element) {
          steps.push(element);
        }

      }

    })

    .directive('tourStep', function($timeout, $ionicTour) {

      return {
        restrict: 'A',

        scope: {
          tourOnStart: '=',
          tourOnEnd: '=',
          tourOnTransition: '=',
          tourOnEnter: '=',
          tourOnLeave: '='
        },

        link: function(scope, element, attrs) {
          ionic.extend(element, {
            step: attrs.tourStep,

            /**
             * @ngdoc method
             * @name tourStep#OnStart
             * @description Invoked before the tooltip animates to the step element
             * @param {object} stepEl The element of the current step
             * @param {object} tourtipEl The tooltip element
             */
            onStart: function(stepEl, tourtipEl) {
              if(typeof scope.tourOnStart === 'function') {
                $timeout(function() {
                  scope.tourOnStart(stepEl, tourtipEl);
                });
              }
            },

            /**
             * @ngdoc method
             * @name tourStep#onEnd
             * @description Invoked after the tooltip fully animates to the step element
             * @param {object} stepEl The element of the current step
             * @param {object} tourtipEl The tooltip element
             */
            onEnd: function(stepEl, tourtipEl) {
              if(typeof scope.tourOnEnd === 'function') {
                $timeout(function() {
                  scope.tourOnEnd(stepEl, tourtipEl);
                });
              }
            },

            /**
             * @ngdoc method
             * @name tourStep#onTransition
             * @description Invoked as the tooltip animates toward the step element
             * @param {number} ratio Percentage of animation completion (0 to 1)
             * @param {object} stepEl The element of the current step
             * @param {object} tourtipEl The tooltip element
             */
            onTransition: function(ratio, stepEl, tourtipEl) {
              if(typeof scope.tourOnTransition === 'function') {
                $timeout(function() {
                  scope.tourOnTransition(ratio, stepEl, tourtipEl);
                })
              }
            },

            /**
             * @ngdoc method
             * @name tourStep#onEnter
             * @description Invoked before the tooltip moves toward the step element
             * @param {object} stepEl The element of the current step
             * @param {object} tourtipEl The tooltip element
             */
            onEnter: function(stepEl, tourtipEl) {
              if(typeof scope.tourOnEnter === 'function') {
                $timeout(function() {
                  scope.tourOnEnter(stepEl, tourtipEl);
                })
              }
            },

            /**
             * @ngdoc method
             * @name tourStep#onLeave
             * @description Invoked before the tooltip moves away from the step element
             * @param {object} stepEl The element of the current step
             * @param {object} tourtipEl The tooltip element
             */
            onLeave: function(stepEl, tourtipEl) {
              if(typeof scope.tourOnLeave === 'function') {
                $timeout(function() {
                  scope.tourOnLeave(stepEl, tourtipEl);
                })
              }
            }
          })

          $ionicTour.registerStep(element);

        }
      }

    });

})(window.ionic);