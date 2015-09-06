(function(ionic) {

  angular.module('ionic.tour', [])
    .factory('$ionicTour', function($rootScope, $compile, $timeout, $window, $q, $ionicTemplateLoader, $ionicBody, $ionicPosition) {

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

        var getOrientation = function(w, e, t) {

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

            var tourtipEl = angular.element(self.tourtipEl);

            console.log(self.window);

            $ionicBody.append(self.tourtipEl);

            $timeout(function() {
              tourtipEl.addClass('slide-in ng-enter active')
            });

            if(!options.autoplay) return;

            self.next();

          },

          stop: function() {
            console.log('stop');
          },

          reset: function() {
            var self = this;
            var i = self.current;

            var element = self.steps[i];

            i = 0;

            if(!self._isRunning) {
              self._isRunning = true;

              self.steps[i].onLeave(element[0], self.tourtipEl);

              self.goToStep(i)
                .then(function(){
                  self._isRunning = false;
                });
            }
          },

          next: function() {
            console.log('next');
            var self = this;
            var i = self.current;

            var element = self.steps[i];

            if((i + 1) >= self.steps.length) return undefined;

            if(!self._isRunning) {
              self._isRunning = true;

              if(i > -1) self.steps[i].onLeave(element[0], self.tourtipEl);

              self.goToStep(++i)
                .then(function(){
                  self._isRunning = false;
                });
            }
          },

          previous: function() {
            console.log('previous');
            var self = this;
            var i = self.current;

            var element = self.steps[i];

            if((i - 1) < 0) return undefined;

            if(!self._isRunning) {
              self._isRunning = true;

              if(i < self.steps.length) self.steps[i].onLeave(element[0], self.tourtipEl);

              self.goToStep(--i)
                .then(function(){
                  self._isRunning = false;
                });
            }
          },

          finish: function(options) {
            console.log('finish', options);
            var self = this;
            var i = self.current;

            options = options || { destroy: true };

            self.steps[i].onLeave(element[0], self.tourtipEl);
            self.reset();

            self.scope.$parent && self.scope.$parent.$broadcast('tourFinished');

            if(options.destroy) {
              self.scope.$destroy();
            }

            self.tourtipEl.remove();

          },

          goToStep: function(index) {
            console.log('goToStep', index);
            var self = this;

            self.current = index;
            var i = self.current;

            var element = self.steps[i];

            var duration = getDuration(self.position.top, topHeight);
            console.log(self.steps[i].position.left, self.steps[i].position.width)
            var topHeight = self.steps[i].position.top + self.steps[i].position.height + 20;
            var topWidth = (self.steps[i].position.left + (self.steps[i].position.width / 2)) - (self.window.width * 0.05);

            console.log(self.steps[i].position.left + (self.steps[i].position.width / 2));
            console.log(topWidth);

            var top = getPosition(self.position.top, topHeight);
            var left = getPosition(self.position.left, topWidth);

            var arrowLeft = getPosition(self.position.left, topWidth);

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
              self.steps[i].onStart(element[0], self.tourtipEl);
            })

            .on('step', function(v) {
              self.steps[i].onTransition(v, element[0], self.tourtipEl);
              self.tourtipEl.style.transform = self.tourtipEl.style.webkitTransform = 'translate3d(0px,' + top(v) +'px,0)';
              self.arrowEl.style.transform = self.arrowEl.style.webkitTransform = 'translate3d(' + left(v) + 'px,0px,0)';
            })

            .on('complete', function() {
              self.position.top = topHeight;
              self.position.left = topWidth;
              self.steps[i].onEnd(element[0], self.tourtipEl);
              deferred.resolve();
            })
            .start();

            return deferred.promise;

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

        var createTour = function(templateString, tour, options) {

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
            return a.step > b.step;
          });

          angular.forEach(steps, function(element){
            var position = $ionicPosition.offset(element);
            element.position = position;
          });

          options.steps = steps;
          options.current = -1;
          options.position = {top: 0, left: 0};
          options.window = {height: $window.innerHeight, width: $window.innerWidth};
          options.tour = tour;
          options.$el = element;
          options.el = element[0];
          options.tourtipEl = options.el.querySelector('.custom-tip');
          options.$tourtipEl = angular.element(options.tourtipEl);
          options.arrowEl = options.tourtipEl.querySelector('.custom-tip-arrow');
          options.$arrowEl = angular.element(options.arrowEl);
          options.tooltip = $ionicPosition.offset(options.$tourtipEl);

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
        fromTemplateUrl: function(url, tour, options) {
          if(!url) throw 'No url specified';
          if(!tour) throw 'No tour specified';

          return $ionicTemplateLoader.load(url).then(function(templateString) {
            var tour = createTour(templateString, tour, options);
            return tour;
          })
        },

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
          tourOnLeave: '='
        },
        link: function(scope, element, attrs) {
          ionic.extend(element, {
            step: attrs.tourStep,
            onStart: function(element, tourtip) {
              $timeout(function() {
                if(typeof scope.tourOnStart === 'function') scope.tourOnStart(element, tourtip);
              });
            },
            onEnd: function(element, tourtip) {
              $timeout(function() {
                if(typeof scope.tourOnEnd === 'function') scope.tourOnEnd(element, tourtip);
              });
            },
            onTransition: function(ratio, element, tourtip) {
              $timeout(function() {
                if(typeof scope.tourOnTransition === 'function') scope.tourOnTransition(ratio, element, tourtip);
              })
            },
            onLeave: function(element, tourtip) {
              $timeout(function() {
                if(typeof scope.tourOnLeave === 'function') scope.tourOnLeave(element, tourtip);
              })
            }
          })
          $ionicTour.registerStep(element);
        }
      }

    });

})(window.ionic);