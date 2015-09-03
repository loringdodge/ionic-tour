angular.module('custom.repeat', [])

  .directive('customRepeat', [ '$parse', '$animate', function($parse, $animate) {

    /**
     * Creates a new object without a prototype. This object is useful for lookup without having to
     * guard against prototypically inherited properties via hasOwnProperty.
     *
     * Related micro-benchmarks:
     * - http://jsperf.com/object-create2
     * - http://jsperf.com/proto-map-lookup/2
     * - http://jsperf.com/for-in-vs-object-keys2
     *
     * @returns {Object}
     */
    function createMap() {
      return Object.create(null);
    }

    var updateScope = function(scope, index, value, key, arrayLength) {
      scope.$index = index;
      scope.$first = (index === 0);
      scope.$last = (index === (arrayLength - 1));
      scope.$middle = !(scope.$first || scope.$last);
      scope.$odd = !(scope.$even = (index&1) === 0);
    };

    return {
      restrict: 'A',
      transclude: 'element',
      compile: function($element, $attrs) {

        var expression = $attrs.customRepeat;

        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)?\s*$/);

        var collection = match[2];

        return function($scope, $element, $attr, ctrl, $transclude) {

          $scope.$watchCollection(collection, function(collection) {
            var index, length,
              previousNode = $element[0],
              collectionLength,
              key, value;

              collectionLength = collection.length;

              for (index = 0; index < collectionLength; index++) {
                key = index;
                value = collection[key];

                $transclude(function(clone, scope) {
                  $animate.enter(clone, null, angular.element(previousNode));
                  previousNode = clone;
                  updateScope(scope, index, value, key, collectionLength);
                });

              }
          });

        }
      }
    }

  }]);