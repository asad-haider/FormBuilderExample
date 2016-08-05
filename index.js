var app = angular.module("myApp", []);

// app.factory('settings', function($http){
//     return $http.get('settings.json');
// });

app.controller('CreateFormController', ['$scope', '$compile', '$document', function($scope, $compile, $document) {

    $scope.fields = ["TextField", "TextArea", "RadioButton"];
    var formName = $scope.formName;

    $scope.AddField = function () {

        var selectedField = $scope.selectedField;
        var divElement = angular.element(document.querySelector('#fieldDiv'));
        var appendHtml = $compile('<add-field form-name="{{formName}}" field-type="{{selectedField}}"></add-field>')($scope);
        divElement.append(appendHtml);
    }

}]);

app.directive("textField", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/textField.html",
        scope: {
            field: '=?',
            fieldName: '@'
        },
        link: function (scope, elements, attrs) {
            settings.success(function(data) {

                angular.forEach(data.form_fields, function(value, key) {
                    if (value.field_name === scope.fieldName) {
                        scope.field = value.field_data;
                    }
                });
            });
        }
    };
}]);
app.directive("textArea", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/textArea.html",
        scope: {
            field: '=?',
            fieldName: '@'
        },
        link: function (scope, elements, attrs) {
            settings.success(function(data) {

                angular.forEach(data.form_fields, function(value, key) {
                    if (value.field_name === scope.fieldName) {
                        scope.field = value.field_data;
                    }
                });
            });
        }
    };
}]);
app.directive("datePicker", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/date.html",
        scope: {
            field: '=?',
            fieldName: '@'
        },
        link: function (scope, elements, attrs) {
            settings.success(function(data) {
                console.log(data.form_fields);
                angular.forEach(data.form_fields, function(value, key) {
                    if (value.field_name === scope.fieldName) {
                        console.log(value);
                        scope.field = value.field_data;
                    }
                });
            });
        }
    };
}]);

app.directive("addField", function () {

    var controller = ['$scope', function ($scope) {
        $scope.AddField = function () {

            var formFields =  [];
            formFields.push({
                "field_name": $scope.fieldName,
                "field_data": {
                    "field_title": $scope.fieldTitle,
                    "field_value": $scope.defaultValue,
                    "place_holder": $scope.placeHolder,
                    "field_required": $scope.required,
                    "field_disabled": $scope.enabled
                }
            });
            $scope.settings = [];
            $scope.settings.push({
                "form_name": $scope.formName,
                "form_fields": formFields
            });

            console.log(JSON.stringify($scope.settings));
        }
    }];

    return {
        scope: {
            formName: '@',
            fieldType: '@'
        },
        replace:true,
        templateUrl : "Templates/AddFieldDirective.html",
        controller: controller,
        link: function (scope, elements, attrs) {
           if(scope.fieldType == 'TextField'){
               scope.types = ["text", "number", "date", "email", "url"];
               console.log(scope.types);

           }
        }
    };
});

