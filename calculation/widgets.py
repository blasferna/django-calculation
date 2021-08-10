import json

from django import forms


class NumericCalculationInput(forms.NumberInput):
    # constants
    # modes
    FORMULA = 'formula'
    SUMMARY = 'summary'

    LOCAL = 'local'
    GLOBAL = 'global'

    # summary functions
    SUM = 'sum'
    AVG = 'avg'
    COUNT = 'count'
    MAX = 'max'
    MIN = 'min'
    
    input_type = 'number'
    
    class Media:
        js = [
            'calculation/js/calculation.js',
        ]
    
    def __init__(self, attrs=None):
        # sum|avg|count|max|min"
        calculation = {
            "mode": "formula",
            "formula": "",
            "summaryFunction": "",
            "summaryField": "",
            "summaryContext": NumericCalculationInput.GLOBAL
        }
        if attrs is None: attrs = {}
        if "calculation" in attrs:
            if attrs['calculation']['mode'] != NumericCalculationInput.SUMMARY:
                attrs['calculation']['summaryContext'] = ""
            calculation.update(attrs['calculation'])
            attrs['calculation'] = json.dumps(calculation)
        super().__init__(attrs)

