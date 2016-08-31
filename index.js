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

        // console.log($scope.settings);

        Helper.AppendHTML('formPreview', '<form-builder settings="settings"></form-builder>', $scope);
    }
}]);
app.service('Helper', ['$compile', function($compile){
    this.AppendHTML = function (elementId, html, scope) {
        var appendHTML = $compile(html)(scope);
        var element = angular.element(document.querySelector('#' + elementId));
        element.append(appendHTML);
    }

    this.RemoveHTMLByFieldNameAttribute = function (fieldNames) {
        debugger;
        var element = angular.element(document.querySelector('[field-name=' + fieldNames + ']'));
        element.remove();
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

    var controller = ['$scope', 'Helper', function ($scope, Helper) {

        $scope.field_data = {};
        $scope.field_data.field_id = $scope.fieldName;
        $scope.selectOption = {};

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

        $scope.RemoveField = function (fieldName) {

            angular.forEach($scope.formFields, function(value, key) {
                if (value.field_name === fieldName) {
                    $scope.formFields.splice(key, 1);
                    Helper.RemoveHTMLByFieldNameAttribute(fieldName);
                }
            });
        };

        init = function () {

            $scope.field_data.required = false;
            $scope.field_data.enabled = true;

            if($scope.fieldType === 'TextField'){

                $scope.types = ["text", "number", "date", "email", "url", "password", "color"];

            }else if($scope.fieldType === 'RadioButton'){

                $scope.field_data.buttons = [];
                $scope.field_data.InlineRadioButton = true;

                $scope.AddRadioButton = function () {
                    $scope.field_data.buttons.push($scope.radioButton);
                    $scope.radioButton = {};
                };

            }else if($scope.fieldType === 'TextArea'){

                $scope.field_data.rows = 5;

            }else if($scope.fieldType === 'CheckBox'){

                $scope.field_data.IsChecked = false;

            }else if($scope.fieldType === 'Select'){

                $scope.field_data.options = [];
                $scope.field_data.selected = null;
                $scope.field_data.multiSelect = false;

                $scope.AddOption = function () {

                    $scope.field_data.options.push($scope.selectOption);
                    $scope.selectOption = {};
                };
            }

        };
        init();


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

                if(field.field_type === 'TextField'){
                    var newScope = $rootScope.$new();
                    newScope.field = field.field_data;
                    var html = '<text-field field="field"></text-field>';
                    Helper.AppendHTML('formPreview', html, newScope);
                }

            });

        }
    };
}]);

