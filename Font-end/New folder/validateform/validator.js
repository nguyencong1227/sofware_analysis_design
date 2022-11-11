function Validator(options) {

    function getParent(element, selector){
        while (element.parentElement) {
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};


    function Validate(inputElement,rule){

        
        var errorMessage ;
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);

        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rules & kiểm tra
        // nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i){

            switch(inputElement.type){
                case 'radio':
                case 'checkbox':                    
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            if(errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }


    // lấy elements của form cần validate
    var formElement = document.querySelector(options.form);

    // khi submit form
    if (formElement) {
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            // lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement =formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // trường hợp submit với javascript
                if ( typeof options.onSubmit === 'function'){

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                                break;
                        }

                        return values;
                    },{});

                    options.onSubmit(formValues); 
                }
                // trường hợp submit với hành vi mặc dịnh
                else{
                    formElement.submit();
                }
            }
        }

        // lặp qua mỗi rules và xử lý
        options.rules.forEach(function (rule) {

            // lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElements =formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                }

                // xử lý mỗi khi user nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid'); 
                }
            });
        });
    }
}


// định nghĩa các rules
// Nguyên tắc các rules
// 1. Khi có lỗi => trả ra messages lỗi
// 2.khi hợp lệ => undefined
Validator.isRequired = function (selector,message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhập lại trường này'
        }
    }
}

Validator.isEmail = function (selector,message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector,min,message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập vào tối thiểu ${min} kí tự`;
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmvalue,message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmvalue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}