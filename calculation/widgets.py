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


class CalculationInputMixin:
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


class CalculationNumberInput(CalculationInputMixin, forms.NumberInput):    
    class Media:
        js = [
            'calculation/js/calculation.js',
        ]


class FormulaInput(CalculationNumberInput):
    def __init__(self, formula, attrs=None):
        definition = {
            "mode": FORMULA,
            "formula": formula
        }
        super().__init__(definition, attrs)


class SummaryInput(CalculationNumberInput):
    def __init__(self, function, field, context=GLOBAL, attrs=None):
        definition = {
            "mode": SUMMARY,
            "summaryFunction": function,
            "summaryField": field,
            "summaryContext": context
        }
        super().__init__(definition, attrs)


class SumInput(SummaryInput):
    def __init__(self, field, context=GLOBAL, attrs=None):
        super().__init__(SUM, field, context, attrs)


class AvgInput(SummaryInput):
    def __init__(self, field, context=GLOBAL, attrs=None):
        super().__init__(AVG, field, context, attrs)


class CountInput(SummaryInput):
    def __init__(self, field, context=GLOBAL, attrs=None):
        super().__init__(AVG, field, context, attrs)


class MaxInput(SummaryInput):
    def __init__(self, field, context=GLOBAL, attrs=None):
        super().__init__(MAX, field, context, attrs)


class MinInput(SummaryInput):
    def __init__(self, field, context=GLOBAL, attrs=None):
        super().__init__(MIN, field, context, attrs)
