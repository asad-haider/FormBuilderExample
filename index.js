var app = angular.module("myApp", []);

app.factory('settings', function($http){
    return $http.get('settings.json');
});

app.controller('CreateFormController', ['$scope', 'Helper', function($scope, Helper) {

    $scope.fields = ["TextField", "TextArea", "RadioButton"];

    var formName = $scope.formName;
    $scope.fieldNumber = 0;
    $scope.formFields = [];

    $scope.AddField = function () {
        var selectedField = $scope.selectedField;
        var fieldNumber =  $scope.fieldNumber;
        var appendHtml = '<add-field form-name="{{tempFieldNumber}}" ' +
                                'field-type="{{selectedField}}" ' +
                                'field-id="{{fieldNumber}}"' +
                                'form-fields="formFields"' +
                                '></add-field>';

        Helper.AppendHTML('fieldDiv', appendHtml, $scope);
        $scope.fieldNumber++;
    }

    $scope.CreateForm = function () {
        $scope.settings = {
            "form_name": $scope.formName,
            "form_fields": $scope.formFields
        };

        Helper.AppendHTML('formPreview', '<form-builder settings="settings"></form-builder>', $scope);
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

        $scope.fieldName = "Field" + $scope.fieldNumber

        $scope.AddField = function () {

            var object = {
                "field_name": $scope.fieldName,
                "field_data": {
                    "field_title": $scope.fieldTitle,
                    "field_id": "field" + $scope.fieldNumber,
                    "field_value": $scope.defaultValue,
                    "field_type": $scope.selectedInputFieldType,
                    "place_holder": $scope.placeHolder,
                    "field_required": $scope.required,
                    "field_disabled": $scope.enabled
                }
            };

            var ObjectIndex = null;

            angular.forEach($scope.formFields, function(value, key) {
                if (value.field_name === $scope.fieldName) {
                    console.log(value);
                    ObjectIndex = key;
                }
            });

            if(ObjectIndex == null){
                $scope.formFields.push(object);
            }else{
                $scope.formFields[ObjectIndex] = object;
            }
            console.log(JSON.stringify($scope.formFields));
        }
    }];

    return {
        restrict: 'E',
        scope: {
            formName: '@',
            fieldType: '@',
            fieldNumber: '@fieldId',
            formFields: '='
        },
        templateUrl : "Templates/AddFieldDirective.html",
        controller: controller,
        link: function (scope, elements, attrs) {
           if(scope.fieldType == 'TextField'){
               scope.types = ["text", "number", "date", "email", "url", "password"];
           }
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

            angular.forEach(scope.settings.form_fields, function(field, key) {
                var newScope = $rootScope.$new();
                newScope.field = field.field_data;
                var html = '<text-field field="field"></text-field>';
                Helper.AppendHTML('form', html, newScope);
            });

        }
    };
}]);

