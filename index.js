var app = angular.module("myApp", []);

app.factory('settings', function($http){
    return $http.get('settings.json');
});

app.controller('CreateFormController', ['$scope', '$rootScope', 'Helper', function($scope, $rootScope, Helper) {

    $scope.fields = ["TextField", "TextArea", "RadioButton", "CheckBox", "Select"];

    $scope.fieldNumber = 1;
    $scope.formFields = [];

    $scope.AddField = function () {
        var newScope = $rootScope.$new();
        newScope.fieldName = 'Field' +  $scope.fieldNumber;
        newScope.selectedField = $scope.selectedField;
        newScope.formName = $scope.formName;
        newScope.formFields = $scope.formFields;

        var appendHtml = '<add-field ' +
            'field-name={{fieldName}} ' +
            'field-type={{selectedField}} ' +
            'form-name={{formName}} ' +
            'form-fields="formFields" ></add-field>';

        Helper.AppendHTML('fieldDiv', appendHtml, newScope);
        $scope.fieldNumber++;
    };

    $scope.CreateForm = function () {
        $scope.settings = {
            "form_name": $scope.formName,
            "form_fields": $scope.formFields
        };

        console.log($scope.settings);

        // Helper.AppendHTML('formPreview', '<form-builder settings="settings"></form-builder>', $scope);
    }
}]);

app.service('Helper', ['$compile', function($compile){
    this.AppendHTML = function (divId, html, scope) {
        var appendHTML = $compile(html)(scope);
        var divElement = angular.element(document.querySelector('#' + divId));
        divElement.append(appendHTML);
    }
}]);
app.directive("textField", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/textField.html",
        scope: {
            field: '=?'
        }, link: function (scope, elements, attrs) {
            console.log(scope.field);
        }
    };
}]);
app.directive("textArea", ['settings', function() {
    return {
        replace: true,
        templateUrl : "Templates/textArea.html",
        scope: {
            field: '=?'
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

        $scope.field_data = {};
        $scope.field_data.field_id = $scope.fieldName;
        $scope.selectOption = {};

        $scope.AddField = function () {

            var object = {
                "field_name": $scope.fieldName,
                "field_type": $scope.fieldType,
                "field_data": $scope.field_data
            };

            var ObjectIndex = null;

            angular.forEach($scope.formFields, function(value, key) {
                if (value.field_name === $scope.fieldName) {
                    ObjectIndex = key;
                }
            });

            if(ObjectIndex == null){
                $scope.formFields.push(object);
            }else{
                $scope.formFields[ObjectIndex] = object;
            }
        };

        $scope.AddOption = function () {

            $scope.field_data.options.push($scope.selectOption);
            $scope.selectOption = {};
        };
    }];

    return {
        restrict: 'E',
        scope: {
            formName: '@',
            fieldType: '@',
            fieldName: '@',
            formFields: '='
        },
        templateUrl : "Templates/AddField.html",
        controller: controller,
        link: function (scope, elements, attrs) {
            scope.types = ["text", "number", "date", "email", "url", "password"];
        }
    };
});

app.directive("formBuilder", ['Helper', '$compile', '$rootScope', function (Helper, $compile, $rootScope) {
    var controller = ['$scope', function ($scope) {
    }];

    return {
        restrict: 'E',
        scope: {
            settings: '='
        },
        templateUrl : "Templates/FormDirective.html",
        controller: controller,
        link: function (scope, elements, attrs) {

            // angular.forEach(scope.settings.form_fields, function(field, key) {
            //     var newScope = $rootScope.$new();
            //     newScope.field = field.field_data;
            //     var html = '<text-field field="field"></text-field>';
            //     Helper.AppendHTML('form', html, newScope);
            // });

        }
    };
}]);

