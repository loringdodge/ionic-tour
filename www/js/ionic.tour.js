(function(ionic) {

  angular.module('ionic.tour', [])
    .factory('$ionicTour', function($rootScope, $compile, $timeout, $window, $q, $ionicTemplateLoader, $ionicBody, $ionicPosition, $ionicScrollDelegate) {

        var steps = [];

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

        var getDuration = function(oldVal, newVal) {
          return Math.abs((oldVal - newVal)) / 0.5;
        };

        // Function from https://github.com/angular/angular.js/issues/2866
        // Kudos to https://github.com/calummoore
        var getStyle = function(element, name, value) {
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

          initialize: function(opts) {
            opts = ionic.extend({}, opts);
            ionic.extend(this, opts);
          },

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

          goToStep: function(index, onLeave) {
            console.log('goToStep', index);
            var self = this;

            if(!self._isRunning) {
              self._isRunning = true;

              onLeave();

              self.animateStep(index)
                .then(function(){
                  self._isRunning = false;
                });
            }
          },

          reset: function() {
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            i = 0;

            self.goToStep(i, function(){
              stepEl.onLeave(stepEl[0], tourtipEl);
            });

          },

          next: function() {
            console.log('next');
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            i++;

            if(i >= self.steps.length) return undefined;

            self.goToStep(i, function(){
              if((i-1) > -1) self.steps[i-1].onLeave(stepEl[0], tourtipEl);
            });

          },

          previous: function() {
            console.log('previous');
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            i--;

            if(i < 0) return undefined;

            self.goToStep(i, function(){
              if((i+1) < self.steps.length) stepEl.onLeave(stepEl[0], tourtipEl);
            });

          },

          finish: function(options) {
            console.log('finish', options);
            var self = this;
            var i = self.index;

            var stepEl = self.steps[i];
            var tourtipEl = self.tourtipEl;

            options = options || { destroy: true };

            $ionicScrollDelegate.freezeScroll(false);

            stepEl.onLeave(stepEl[0], tourtipEl);

            self.index = -1;

            self.scope.$parent && self.scope.$parent.$broadcast('tourFinished');

            if(options.destroy) {
              self.scope.$destroy();
            }

            tourtipEl.remove();

          },

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
                scrollVal = 0;

            if(typeof stepEl.scrollVal !== 'undefined') {
              $ionicScrollDelegate.scrollBy(0, -stepEl.scrollVal, true);
            }

            if(newTourtipTop > windowEl.height) {
              scrollVal = Math.min(newTourtipTop - windowEl.height, scrollView.__maxScrollTop);
              $ionicScrollDelegate.scrollBy(0, scrollVal, true);
              self.steps[i-1].scrollVal = scrollVal;
            }

            if(newTourtipTop + tourtip.height > windowEl.height){
              newTourtipTop = stepEl.position.top - tourtip.height - scrollVal - 20;
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

          styleArrow: function(orientation) {
            var self = this;

            var arrowEl = self.arrowEl;
            var arrow = self.arrow;

            if(orientation === 'top'){
              arrowEl.style.top = arrow.top;
              arrowEl.style.borderTopColor = 'transparent';
              arrowEl.style.borderBottomColor = arrow.color;
            } else if (orientation === 'bottom'){
              arrowEl.style.top = '100%';
              arrowEl.style.borderTopColor = arrow.color;
              arrowEl.style.borderBottomColor = 'transparent';
            } else if(orientation === 'none'){
              arrowEl.style.display = 'none';
            }
          },

          _isShown: false,
          isShown: function() {
            return !!this._isShown;
          },

          _isRunning: false,
          isRunning: function() {
            return !!this._isRunning;
          }

        });

        var createTour = function(templateString, options) {

          console.log(options)

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

          console.log(steps)
          steps.sort(function(a,b){
            console.log(a.step, b.step);
            return a.step - b.step;
          });

          angular.forEach(steps, function(element){
            var position = $ionicPosition.offset(element);
            console.log(element)
            ionic.extend(element, {
              position: position,
              scrollVal: 0
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
         * @param {string}
         * @param {object}
         * @returns {promise}
         */
        fromTemplateUrl: function(url, options) {
          if(!url) throw 'A template was not defined.';
          if(!options) throw 'Options are not defined.';

          return $ionicTemplateLoader.load(url).then(function(templateString) {
            var tour = createTour(templateString, options);
            return tour;
          })
        },

        registerStep: function(element) {
          steps.push(element);
        },

        getSteps: function(){
          return steps;
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
            onStart: function(element, tourtip) {
              if(typeof scope.tourOnStart === 'function') {
                $timeout(function() {
                  scope.tourOnStart(element, tourtip);
                });
              }
            },
            onEnd: function(element, tourtip) {
              if(typeof scope.tourOnEnd === 'function') {
                $timeout(function() {
                  scope.tourOnEnd(element, tourtip);
                });
              }
            },
            onTransition: function(ratio, element, tourtip) {
              if(typeof scope.tourOnTransition === 'function') {
                $timeout(function() {
                  scope.tourOnTransition(ratio, element, tourtip);
                })
              }
            },
            onEnter: function(element, tourtip) {
              if(typeof scope.tourOnEnter === 'function') {
                $timeout(function() {
                  scope.tourOnEnter(element, tourtip);
                })
              }
            },
            onLeave: function(element, tourtip) {
              if(typeof scope.tourOnLeave === 'function') {
                $timeout(function() {
                  scope.tourOnLeave(element, tourtip);
                })
              }
            }
          })

          var steps = $ionicTour.getSteps();
          if(steps.indexOf(element === -1)) {
            $ionicTour.registerStep(element);
          }
        }
      }

    });

})(window.ionic);