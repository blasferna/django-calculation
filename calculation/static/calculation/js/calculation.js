'use strict'; {
    const regexp = /[a-z_]\w*(?!\w*\s*\()/ig;
    const modes = {
        FORMULA: 'formula',
        SUMMARY: 'summary'
    }
    const summaryTypes = {
        SUM: 'sum',
        AVG: 'avg',
        COUNT: 'count',
        MAX: 'max',
        MIN: 'min'
    }
    const summaryContexts = {
        LOCAL: 'local',
        GLOBAL: 'global'
    }
    window.calculatedFields = [];
    window.calculatedSrcFields = [];
    // Django formset helper support (Dynamic formsets)
    window.dynamicFormsets = [];

    // calculated field instance
    function CalculatedField(fieldId) {
        this.field = document.getElementById(fieldId);
        this.dependencies = [];
        this.fieldsInFormula = {};
        this.summaryFields = [];
        this.summaryContext = null;
        this.isFormSet = false;
        this.formSetKey = null;
        this.formSetNumber = null;
        this.parent = null;
        this.weight = -1;
    }

    CalculatedField.prototype = {
        init: function () {
            this._parseDefinition();
            this.isFormSet = this._isFormSet();
            if (this.isFormSet) {
                this._loadFormSetAttrs();
            }
            this.summaryContext = this._getSummaryContext();
            this.parent = this._getParent();
            this.fieldsInFormula = this._getFieldsInFormula();
            this.summaryFields = this._getSummaryFields();
        },
        _parseDefinition: function () {
            this.definition = JSON.parse(this.field.getAttribute("data-calculation"));
        },
        addDependency: function (obj) {
            this.dependencies.push(obj);
        },
        _getSummaryContext: function () {
            if (this.definition.summaryField) {
                return this.definition.summaryContext;
            }
            return null;
        },
        _getParent: function () {
            let parent = null;
            let form = this.field.closest('form');
            if (form) {
                parent = form;
            }
            return parent;
        },
        _loadFormSetAttrs: function () {
            let match = this.field.name.match(/(?<form>\w+)-(?<number>\w+)-/);
            this.formSetKey = match[0];
            this.formSetNumber = match.groups.number;
        },
        _isFormSet: function () {
            return this.field.name.includes("form-") || this.field.name.includes("_set-");
        },
        _getFieldsInFormula: function () {
            let fields = {};
            let rawList = this.definition.formula.match(regexp);
            if (rawList) {
                // TODO: move to regexp
                rawList = rawList.filter(function (e) {
                    return e != 'this'
                });
                for (let index = 0; index < rawList.length; index++) {
                    let name = this.isFormSet ? `${this.formSetKey}${rawList[index]}` : rawList[index];
                    let field = this.parent.querySelector('input[name=' + name + ']');
                    fields[name] = {
                        "element": field
                    };
                }
            }
            return fields;
        },
        _getSummaryFields: function () {
            let fields = [];
            if (this.definition.summaryField) {
                let elements = Array.from(document.querySelectorAll('input[type=number]'));
                Array.from(document.querySelectorAll('[data-inputmask]')).forEach(function (element) {
                    elements.push(element);
                })
                let definition = this.definition;
                let that = this;
                fields = elements.filter(function (element) {
                    let name = definition.summaryField;
                    // Find elements in formsets if summary context is global.
                    let match = definition.summaryContext == summaryContexts.GLOBAL ? element.name.match(/(?<form>\w+)-(?<number>\w+)-(?<name>\w+)/) : null;
                    if (element == that.field) {
                        return false;
                    }
                    return match != null ? match.groups.name == name : element.name == name;
                });

            }
            return fields;
        },
        _isFormSetRowDeleted: function (element) {
            let deleted = false;
            let formset = element.name.match(/(?<form>\w+)-(?<number>\w+)-/);
            if (formset != null) {
                let deleteElement = this.parent.querySelector('input[name=' + formset[0] + 'DELETE]');
                if (deleteElement != null) {
                    deleted = deleteElement.checked;
                }
            }
            return deleted;
        },
        _getUnmaskedValue(element) {
            let value = element.inputmask.unmaskedvalue();
            return value.toString().replace(',', '.');
        },
        _getValue: function (element) {
            if (element.hasOwnProperty('inputmask')) {
                return this._getUnmaskedValue(element);
            } else {
                if (element.type == 'checkbox') {
                    return element.checked;
                } else {
                    return element.value;
                }
            }
        },
        _getValues: function () {
            let values = [];
            if (this.summaryFields.length > 0) {
                let that = this;
                this.summaryFields.forEach(function (element) {
                    let value = that._getValue(element);
                    let deleted = that._isFormSetRowDeleted(element);
                    if (typeof value != "boolean") {
                        if (value.length > 0 && deleted === false) {
                            values.push(parseFloat(value));
                        }
                    } else {
                        values.push(value);
                    }
                });
            }
            return values;
        },
        _getSum: function () {
            let values = this._getValues();
            if (values.length === 0) {
                return 0;
            }
            return values.reduce((accumulator, curr) => accumulator + curr);
        },
        _getCount: function () {
            return this._getValues().length;
        },
        executeAll: function () {
            this.runFormula();
            this.runSummary();
        },
        runFormula: function () {
            if (this.definition.formula.length > 0) {
                let parsedFormula = this.definition.formula;
                for (let [key, value] of Object.entries(this.fieldsInFormula)) {
                    let name = this.isFormSet ? value.element.name.replaceAll(this.formSetKey, "") : value.element.name;
                    parsedFormula = parsedFormula.replaceAll(name, this._getValue(value.element));
                };
                try {
                    this.field.value = eval(parsedFormula);
                } catch {
                    this.field.value = 0;
                }
            }
        },
        runSummary: function () {
            switch (this.definition.summaryFunction) {
                case summaryTypes.SUM:
                    this.runSum();
                    break;
                case summaryTypes.COUNT:
                    this.runCount();
                    break;
                case summaryTypes.AVG:
                    this.runAvg();
                    break;
                case summaryTypes.MIN:
                    this.runMin();
                    break;
                case summaryTypes.MAX:
                    this.runMax();
                    break;
            }
        },
        runAvg: function () {
            let count = this._getCount();
            let sum = this._getSum();
            return this.field.value = !isNaN(sum / count) ? sum / count : null;
        },
        runCount: function () {
            this.field.value = this._getCount();
        },
        runSum: function () {
            this.field.value = this._getSum();
        },
        runMin: function () {
            return Math.min(...this.getValues());
        },
        funMax: function () {
            return Math.max(...this.getValues());
        }
    }

    function resolveDependencies() {
        for (let index = 0; index < calculatedFields.length; index++) {
            let obj = calculatedFields[index];
            calculatedFields.forEach(function (o) {
                let result = false;
                if (o.fieldsInFormula.hasOwnProperty(obj.field.name)) {
                    result = true;
                }
                if (o.summaryFields.length > 0) {
                    result = o.summaryFields.filter(function (sf) {
                        return obj.field.name == sf.name;
                    }).length > 0;
                }
                if (result) {
                    o.addDependency(obj);
                }
            });
        }
    }

    /**
     *   Calculate and returns the weight of the CalculatedField instance based on 
     *   its dependencies.
     *   
     *   @param {CalculatedField} obj The CalculatedField instance.
     *   @param {number} weight The default weight.
     */
    function calculateWeight(obj, weight = 0) {
        weight++;
        for (let index = 0; index < obj.dependencies.length; index++) {
            let o = obj.dependencies[index];
            weight = calculateWeight(o, weight);
        }
        return weight;
    }

    function sortExecution() {
        for (let index = 0; index < calculatedFields.length; index++) {
            let obj = calculatedFields[index];
            obj.weight = calculateWeight(obj);
        }
        calculatedFields.sort(function (a, b) {
            return a.weight - b.weight;
        });
    }

    function findSrcFields() {
        calculatedFields.forEach(function (obj) {
            for (let [key, value] of Object.entries(obj.fieldsInFormula)) {
                let isCalculated = calculatedFields.filter(function (e) {
                    return e.field.name === key;
                }).length > 0;
                if (!isCalculated) {
                    let exists = calculatedSrcFields.filter(function (e) {
                        return e == value.element;
                    }).length > 0;
                    if (!exists) {
                        calculatedSrcFields.push(value.element);
                    }
                }
            }
            for (let element of obj.summaryFields) {
                let isCalculated = calculatedFields.filter(function (e) {
                    return e.field.name === element.name;
                }).length > 0;
                if (!isCalculated) {
                    let exists = calculatedSrcFields.filter(function (e) {
                        return e == element;
                    }).length > 0;
                    if (!exists) {
                        calculatedSrcFields.push(element);
                    }
                }
            }
        });
    }

    function handleBlurCb(event) {
        for (let index = 0; index < calculatedFields.length; index++) {
            let obj = calculatedFields[index];
            obj.executeAll();
        }
    }


    /**
     *   Configure: add or remove events
     *   
     *   @param {String} mode ['add'|'remove'].
     */
    function configureEvents(mode) {
        calculatedSrcFields.forEach(function (element) {
            if (element) {
                if (mode === 'add') {
                    if (element.type == 'checkbox') {
                        element.addEventListener("change", handleBlurCb);
                    } else {
                        element.addEventListener("blur", handleBlurCb);
                    }
                }
                if (mode === 'remove') {
                    if (element.type == 'checkbox') {
                        element.removeEventListener("change", handleBlurCb);
                    } else {
                        element.removeEventListener("blur", handleBlurCb);
                    }

                }
            }
        });
        // Add or remove events of formset delete buttons (Static formsets)
        let checkboxes = Array.from(document.querySelectorAll('input[type=checkbox]'));
        let formsetDeleteButtons = checkboxes.filter(function (element) {
            let match = element.name.match(/(?<form>\w+)-(?<number>\w+)-(?<name>\w+)/);
            return match != null ? match.groups.name == 'DELETE' : false;
        });
        formsetDeleteButtons.forEach(function (element) {
            if (element) {
                if (mode === 'add') {
                    element.addEventListener("change", handleBlurCb);
                }
                if (mode === 'remove') {
                    element.removeEventListener("change", handleBlurCb);
                }
            }
        });
    };

    function addEvents() {
        configureEvents('add');
    }

    function removeEvents() {
        configureEvents('remove');
    }

    function findDynamicFormsets() {
        let elements = document.querySelectorAll("[data-formset-prefix]");
        elements.forEach(function (element) {
            let obj = {
                "prefix": element.getAttribute('data-formset-prefix'),
                "containerElement": element
            }
            dynamicFormsets.push(obj);
        });
    }

    function configure() {
        const fields = document.querySelectorAll("input[data-calculation]");
        fields.forEach(function (field) {
            let instance = new CalculatedField(field.getAttribute("id"));
            instance.init();
            calculatedFields.push(instance);
        });
        resolveDependencies();
        sortExecution();
        findSrcFields();
        addEvents();
    }

    window.resetCalculatedFields = function () {
        removeEvents();
        calculatedFields = [];
        calculatedSrcFields = [];
        configure();
    }

    // Call function fn when the DOM is loaded and ready. If it is already
    // loaded, call the function now.
    // http://youmightnotneedjquery.com/#ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        configure();
        findDynamicFormsets();
    });

}
