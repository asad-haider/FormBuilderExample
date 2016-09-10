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
        Helper.ClearHTMLById('formPreview');
        Helper.AppendHTML('formPreview', '<form-builder settings="settings"></form-builder>', $scope);
    };

    $scope.$watch('formFields', function() {
        console.log('hey, formFields has changed!');
    });
}]);
app.service('Helper', ['$compile', function($compile){
    this.AppendHTML = function (elementId, html, scope) {
        var appendHTML = $compile(html)(scope);
        var element = angular.element(document.querySelector('#' + elementId));
        element.append(appendHTML);
    };

    this.RemoveHTMLByAttribute = function (attribute, value) {
        var element = angular.element(document.querySelector('['+ attribute + '=' + value + ']'));
        element.remove();
    };
    this.RemoveHTMLById = function (elementId) {
        var element = angular.element(document.querySelector('#' + elementId));
        element.remove();
    };
    this.ClearHTMLById = function (elementId) {
        var element = angular.element(document.querySelector('#' + elementId));
        element.empty();
    };
}]);


app.directive("textField", ['settings', function(settings) {
    return {
        replace: true,
        templateUrl : "Templates/textField.html",
        scope: {
            field: '=?',
            condition: '=?'

        }, link: function (scope, elements, attrs) {
            // console.log(scope.field);
            console.log(scope.condition);
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
app.directive("radioButton", ['settings', function() {
    return {
        replace: true,
        templateUrl : "Templates/radioGroup.html",
        scope: {
            field: '=?'
        }
    };
}]);
app.directive("checkBox", ['settings', function() {
    return {
        replace: true,
        templateUrl : "Templates/checkBox.html",
        scope: {
            field: '=?',
            changed: '&'
        }
    };
}]);
app.directive("selectField", ['settings', function() {
    return {
        replace: true,
        templateUrl : "Templates/select.html",
        scope: {
            field: '=?'
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
                    Helper.RemoveHTMLByAttribute('field-name', fieldName);
                }
            });
        };

        init = function () {

            $scope.field_data.fieldLabel = "";
            $scope.field_data.required = false;
            $scope.field_data.enabled = true;
            $scope.field_data.dependsOn = null;
            $scope.field_data.visible = true;

            if($scope.fieldType === 'TextField'){

                $scope.types = ["text", "number", "date", "email", "url", "password", "color"];
                $scope.field_data.inputFieldType = $scope.types[0];

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

            console.log(JSON.stringify(scope.settings));

            angular.forEach(scope.settings.form_fields, function(field, key) {

                var newScope = $rootScope.$new();
                newScope.field = field.field_data;

                newScope.changed = function (changedField) {

                    angular.forEach(scope.settings.form_fields, function(field, key) {

                        var dependsOn = field.field_data.dependsOn;

                        if (dependsOn !== undefined && dependsOn !== null){
                            var mainField = dependsOn.substring(0, dependsOn.indexOf('.'));
                            var condition = dependsOn.substring(dependsOn.indexOf('.') + 1);
                            
                            if(mainField === changedField.field_id){

                                scope.leftHandValue = changedField.IsChecked;
                                scope.condition = '==';
                                scope.rightHandValue =  scope.$eval(condition.replace('checked', '').replace('==', ''));

                                field.field_data.visible = scope.$eval('leftHandValue == rightHandValue');

                                console.log(field.field_data.visible);
                            }
                        }
                    });
                };

                if(field.field_type === 'TextField'){
                    html = '<text-field field="field"></text-field>';
                }
                else if(field.field_type === 'TextArea'){
                    html = '<text-area field="field"></text-area>';
                }
                else if(field.field_type === 'RadioButton'){
                    html = '<radio-button field="field"></radio-button>';
                }
                else if(field.field_type === 'CheckBox'){
                    html = '<check-box field="field" changed="changed(fieldChanged)"></check-box>';
                }
                else if(field.field_type === 'Select'){
                    html = '<select-field field="field"></select-field>';
                }

                Helper.AppendHTML('formPreview', html, newScope);

            });

        }
    };
}]);

