(function(ionic) {

  angular.module('ionic.tour', [])
    .factory('$ionicTour', function($rootScope, $compile, $timeout, $q, $ionicTemplateLoader, $ionicBody) {

        var steps = [];

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

          },

          stop: function() {
            console.log('stop');
          },

          pause: function() {
            console.log('pause');
          },

          next: function() {
            console.log('next');
          },

          previous: function() {
            console.log('previous');
          },

          finish: function() {
            console.log('finish');
          },

          goToStep: function(index) {
            console.log('goToStep', index);
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

          options.$el = element;
          options.el = element[0];
          options.tourtipEl = options.el.querySelector('.tourtip');

          var deferred = $q.defer();

          var tour = new TourView(options);

          console.log(steps);

          tour.scope = scope;

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

    .directive('tourStep', function($ionicTour) {

      return {
        restrict: 'A',
        link: function(scope, element, attribute) {
          $ionicTour.registerStep(element[0]);
        }
      }

    });

})(window.ionic);