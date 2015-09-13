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
            var self = this;

            options = options || { autoplay: true };

            $ionicScrollDelegate.freezeScroll(true);

            $ionicBody.append(self._$tourtipEl);

            self._tourtipOffset = $ionicPosition.offset(self._$tourtipEl);

            self._arrowStyles = {
              color: getStyle(self._arrowEl, 'borderBottomColor'),
              top: getStyle(self._arrowEl, 'top')
            }

            steps.sort(function(a,b){
              return a.step - b.step;
            });

            for(var i = 0; i < steps.length; i++){
              var offset = $ionicPosition.offset(steps[i]);
              ionic.extend(steps[i], {
                offset: offset,
                scrollDiff: 0
              });
            }

            $timeout(function() {
              self._$tourtipEl.addClass('slide-in-up ng-enter active')
            });


            if(!options.autoplay) return;

            self.next();

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
            var self = this;
            var i = self._index;

            var stepEl = self._steps[i];
            var tourtipEl = self._tourtipEl;

            options = options || { destroy: true };

            $ionicScrollDelegate.freezeScroll(false);

            self._orientation = 'next';

            stepEl.onLeave(stepEl[0], tourtipEl);

            self._index = -1;

            self.scope.$parent && self.scope.$parent.$broadcast('tourFinished');

            if(options.destroy) {
              self.scope.$destroy();
            }

            tourtipEl.remove();

          },

          /**
           * @ngdoc method
           * @name ionicTour#goToStep
           * @description Triggers the tourtip animation if not currently running
           * @param {number} index The index of the step
           * @param {function} onLeave The callback to be invoked before leaving
           */
          goToStep: function(index, onLeave) {
            var self = this;

            var stepEl = self._steps[index];
            var tourtipEl = self._tourtipEl;

            onLeave = onLeave || stepEl.onLeave;

            if(!self._isRunning) {
              self._isRunning = true;

              self._isFirst = (index === 0);
              self._isLast = (index === (self._steps.length - 1));

              onLeave();
              stepEl.onEnter(stepEl, tourtipEl);

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
            var i = self._index;

            var stepEl = self._steps[i];
            var tourtipEl = self._tourtipEl;

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
            var i = self._index;

            var stepEl = self._steps[i];
            var tourtipEl = self._tourtipEl;

            i = --index;

            if(i < 0) {
              self.scope.$parent.$broadcast('tourAtStart');
              return undefined;
            }

            if(i >= self._steps.length) {
              self.scope.$parent.$broadcast('tourAtEnd');
              return undefined;
            }

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
            var self = this;
            var i = self._index;

            var stepEl = self._steps[i];
            var tourtipEl = self._tourtipEl;

            self._orientation = 'next';

            i++;

            if(i >= self._steps.length) {
              self.scope.$parent.$broadcast('tourAtEnd');
              return undefined;
            }

            self.goToStep(i, function(){
              if((i-1) > -1) self._steps[i-1].onLeave(stepEl[0], tourtipEl);
            });

          },

          /**
           * @ngdoc method
           * @name ionicTour#previous
           * @description Change the index to the previous step and trigger goToStep
           */
          previous: function() {
            var self = this;
            var i = self._index;

            var stepEl = self._steps[i];
            var tourtipEl = self._tourtipEl;

            self._orientation = 'previous';

            i--;

            if(i < 0) {
              self.scope.$parent.$broadcast('tourAtStart');
              return undefined;
            }

            self.goToStep(i, function(){
              if((i+1) < self._steps.length) stepEl.onLeave(stepEl[0], tourtipEl);
            });

          },

          /**
           * @ngdoc method
           * @name ionicTour#animateStep
           * @description Animate the tourtip to a specific index
           * @param {number} index The index of the step
           */
          animateStep: function(index) {
            var self = this;

            self._index = index;
            var i = self._index;

            var stepEl = self._steps[i],
                tourtipEl = self._tourtipEl,
                tourtipOffset = self._tourtipOffset,
                windowOffset = self._windowOffset,
                arrowEl = self._arrowEl,
                arrowStyles = self._arrowStyles,
                scrollView = $ionicScrollDelegate.getScrollView(),
                newTourtipTop = stepEl.offset.top + stepEl.offset.height + 20,
                newArrowLeft = (stepEl.offset.left + (stepEl.offset.width / 2)) - ((windowOffset.width - tourtipOffset.width) / 2),
                scrollDiff = 0,
                lowerPadding = 10;

            if(typeof stepEl.scrollDiff !== 'undefined') {
              $ionicScrollDelegate.scrollBy(0, -stepEl.scrollDiff, true);
            }

            if(newTourtipTop > windowOffset.height) {
              scrollDiff = Math.min(newTourtipTop - windowOffset.height, scrollView.__maxScrollTop);
              $ionicScrollDelegate.scrollBy(0, scrollDiff, true);
              self._steps[i-1].scrollDiff = scrollDiff;
              self._steps[i+1].scrollDiff = scrollDiff;
            }

            if(newTourtipTop + tourtipOffset.height + lowerPadding > (windowOffset.height + lowerPadding)){
              newTourtipTop = stepEl.offset.top - tourtipOffset.height - scrollDiff - 20;
              self.styleArrow('bottom');
            } else {
              self.styleArrow('top');
            }

            var tourtipTop = getPosition(tourtipOffset.top, newTourtipTop);
            var arrowLeft = getPosition(tourtipOffset.left, newArrowLeft);
            var duration = getDuration(tourtipOffset.top, newTourtipTop);

            tourtipOffset.top = newTourtipTop;
            tourtipOffset.left = newArrowLeft;

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
              arrowEl.style.transform = self._arrowEl.style.webkitTransform = 'translate3d(' + arrowLeft(v) + 'px,0,0)';
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

            var arrowEl = self._arrowEl;
            var arrow = self._arrowStyles;

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

          _arrowEl: null,
          _$arrowEl: null,
          _arrowStyles: {},
          _el: null,
          _$el: null,
          _index: -1,
          _isFirst: false,
          _isLast: false,
          _isRunning: false,
          _isShown: false,
          _orientation: 'next',
          _steps: [],
          _scrollDiff: 0,
          _tourtipEl: null,
          _$tourtipEl: null,
          _tourtipOffset: {},
          _windowOffset: {},

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

          options._steps = steps;

          options._windowOffset = { height: $window.innerHeight, width: $window.innerWidth };

          options._$el = element;
          options._el = element[0];

          options._tourtipEl = options._el.querySelector('tourtip');
          options._$tourtipEl = angular.element(options._tourtipEl);
          options._tourtipOffset = { top: 0, left: 0 };

          options._arrowEl = options._tourtipEl.querySelector('tourtip-arrow');
          options._$arrowEl = angular.element(options._arrowEl);

          options.tour = tour;

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
                });
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
                });
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
                });
              }
            }
          })

          $ionicTour.registerStep(element);

        }
      }

    });

})(window.ionic);