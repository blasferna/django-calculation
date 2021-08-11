# django-calculation

[![Release](https://github.com/blasferna/django-calculation/actions/workflows/release.yml/badge.svg)](https://github.com/blasferna/django-calculation/actions/workflows/release.yml)
[![PyPI version](https://badge.fury.io/py/django-calculation.svg)](https://badge.fury.io/py/django-calculation)
![PyPI - Django Version](https://img.shields.io/pypi/djversions/django-calculation) ![PyPI - Python Version](https://img.shields.io/pypi/pyversions/django-calculation)

Make simple calculations in your django forms.

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

Import `calculation` and complete the definition like this. The widget `NumericCalculationInput` 
expects the calculation definition as the first argument.

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
                'formula': 'quantity*price'    
            },
            attrs = {'disabled': True}
        )
    )
    tax = forms.DecimalField(
        widget=calculation.NumericCalculationInput(
            {
                'mode': calculation.FORMULA,
                'formula': 'parseFloat(amount/11).toFixed(2)'    
            },
            attrs = {'disabled': True}
        )
    )

```
