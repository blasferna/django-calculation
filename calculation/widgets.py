import json

from django import forms

# modes
FORMULA = 'formula'
SUMMARY = 'summary'

# contexts
LOCAL = 'local'
GLOBAL = 'global'

# summary functions
SUM = 'sum'
AVG = 'avg'
COUNT = 'count'
MAX = 'max'
MIN = 'min'


class NumericCalculationInput(forms.NumberInput):
    input_type = 'number'
    
    class Media:
        js = [
            'calculation/js/calculation.js',
        ]
    
    def __init__(self, calculation, attrs=None):
        default = {
            "mode": "formula",
            "formula": "",
            "summaryFunction": "",
            "summaryField": "",
            "summaryContext": GLOBAL
        }
        if attrs is None: attrs = {}
        if calculation['mode'] != SUMMARY:
            calculation['summaryContext'] = ""
        default.update(calculation)
        attrs['data-calculation'] = json.dumps(default)
        super().__init__(attrs)
