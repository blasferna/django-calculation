# django-calculation

[![Release](https://github.com/blasferna/django-calculation/actions/workflows/release.yml/badge.svg)](https://github.com/blasferna/django-calculation/actions/workflows/release.yml)
[![PyPI version](https://badge.fury.io/py/django-calculation.svg)](https://badge.fury.io/py/django-calculation)
![PyPI - Django Version](https://img.shields.io/pypi/djversions/django-calculation) ![PyPI - Python Version](https://img.shields.io/pypi/pyversions/django-calculation)

Make simple calculations in your django forms using `django-calculation`. This app provide a **[Django Widget](https://docs.djangoproject.com/en/3.2/ref/forms/widgets/)** that derives its value from a expression defined in the widget instance. 

The field is updated when any of the source fields change.

![chrome-capture](https://user-images.githubusercontent.com/8385910/129076392-9f255fe1-830c-456d-8852-717a4abeb5f6.gif)


## Installation

```bash
pip install django-calculation
```

### Add `calculation` to your INSTALLED_APPS

```python
INSTALLED_APPS = [
    ...
    'calculation',
]
````


## Usage

Import `calculation` and complete the definition. The widget `NumericCalculationInput` 
expects the calculation definition as the first argument.

### Example

```python
from django import forms

import calculation


class TestForm(forms.Form):
    quantity = forms.DecimalField()
    price = forms.DecimalField()
    amount = forms.DecimalField(
        widget=calculation.NumericCalculationInput(
            {
                'mode': calculation.FORMULA,
                'formula': 'quantity*price'  #<-- using single math expresion.
            },
            attrs = {'disabled': True}
        )
    )
    tax = forms.DecimalField(
        widget=calculation.NumericCalculationInput(
            {
                'mode': calculation.FORMULA,
                'formula': 'parseFloat(amount/11).toFixed(2)' #<-- using math expression and javascript functions.  
            },
            attrs = {'disabled': True}
        )
    )

```

### Modes

Currently the app support two modes of calculation `FORMULA` and `SUMMARY`.

***`FORMULA`*** 

The field value derive from a formula expression. In the expression you can refer to the form field using its name.

```python
amount = forms.DecimalField(
    widget=calculation.NumericCalculationInput(
        {
            'mode': calculation.FORMULA,
            'formula': 'quantity*price' 
        }
    )
```

***`SUMMARY`*** 

The field value derive from a summary definition, it is useful when you need to get the sum of a django formset field.

```python
total = forms.DecimalField(
    widget=calculation.NumericCalculationInput(
        {
            'mode': calculation.SUMMARY,
            'summaryFunction': calculation.SUM,
            'summaryField': 'amount' 
        }
    )
```