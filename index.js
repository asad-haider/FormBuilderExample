var app = angular.module("myApp", []);

app.factory('settings', function($http){
    return $http.get('settings.json');
});

app.directive("textfield", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/textField.html",
        scope: {
            field: '=?',
            fieldName: '@'
        },
        link: function (scope, elements, attrs) {
            settings.success(function(data) {

                console.log(data.form_fields);
                angular.forEach(data.form_fields, function(value, key) {
                    if (value.field_name === scope.fieldName) {
                        console.log(value.field_data);
                        scope.field = value.field_data;
                    }
                });

                // scope.field = data.form_fields;
            });
        }
    };
}]);