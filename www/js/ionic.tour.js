(function(ionic) {

  angular.module('ionic.tour', [])
    .factory('$ionicTour', function($rootScope, $compile, $timeout, $q, $ionicTemplateLoader, $ionicBody, $ionicPosition) {

        var steps = [];

        var getPosition = function(oldVal, newVal) {
          if(oldVal <= newVal) {
            return function(v) {
              return oldVal + (newVal * v);
            }
          }
          return function(v) {
            return oldVal - (newVal * v);
          }
        };

        var TourView = ionic.views.View.inherit({

          initialize: function(opts) {
            opts = ionic.extend({}, opts);
            ionic.extend(this, opts);
          },

          start: function() {
            console.log('start');
            var self = this;

            var tourtipEl = angular.element(self.tourtipEl);

            $ionicBody.append(self.tourtipEl);

            $timeout(function() {
              tourtipEl.addClass('slide-in ng-enter active')
            });

            // self.next(++self.current);

          },

          next: function() {
            console.log('next');
            var self = this;
            if((self.current + 1) > self.steps.length) {
              return;
            }
            self.goToStep(self.current);
            self.current++;
          },

          previous: function() {
            console.log('previous');
            var self = this;
            if((self.current - 1) < 0) {
              return;
            }
            self.goToStep(--self.current);
          },

          finish: function(options) {
            console.log('finish', options);
            var self = this;

            options = options || { destroy: true };

            self.scope.$parent && self.scope.$parent.$broadcast('tourRemoved');

            if(options.destroy) {
              self.scope.$destroy();
            }

            self.$el.remove();

          },

          goToStep: function(index) {
            console.log('goToStep', index);
            var self = this;
            var i = self.current;

            var top = getPosition(self.position.top, 0);
            var left = getPosition(self.position.left, 0);

            var deferred = $q.defer();

            var animation = collide.animation({
              duration: 800,
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
              self.steps[i].onStart();
            })

            .on('step', function(v) {
              // self.steps[i].onTransition(v);
              self.el.transform = self.el.webkitTransform = 'translate3d(' + left(v) + ',' + top(v) +' ,0)';
            })

            .on('complete', function() {
              // self.position.top = top;
              // self.position.left = left;
              self.steps[i].onEnd();
              deferred.resolve();
            })
            .start();

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

          angular.forEach(steps, function(element){
            console.log(element)
            element['position'] = $ionicPosition.offset(element);
          });

          options.steps = steps;
          options.current = 0;
          options.position = {top: 0, left: 0};
          options.tour = tour;
          options.$el = element;
          options.el = element[0];
          options.tourtipEl = options.el.querySelector('.tourtip');

          var deferred = $q.defer();

          var tour = new TourView(options);

          tour.scope = scope;

          if (!options.scope) {
            scope[ options.tour ] = tour;
          }

          deferred.resolve(tour);

          return deferred.promise;

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
          tourOnStart: '&',
          tourOnEnd: '&',
          tourOnTransition: '&'
        },
        link: function(scope, element, attrs) {
          ionic.extend(element, {
            step: attrs.tourStep,
            onStart: function() {
              $timeout(function() {
                if(typeof scope.tourOnStart === 'function') scope.tourOnStart();
              });
            },
            onEnd: function() {
              $timeout(function() {
                if(typeof scope.tourOnEnd === 'function') scope.tourOnEnd();
              });
            },
            onTransition: function(ratio) {
              $timeout(function() {
                if(typeof scope.tourOnTransition === 'function') scope.tourOnTransition(ratio);
              })
            }
          })
          $ionicTour.registerStep(element);
        }
      }

    });

})(window.ionic);