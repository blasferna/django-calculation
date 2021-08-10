# django-calculation

[![Release](https://github.com/blasferna/django-calculation/actions/workflows/release.yml/badge.svg)](https://github.com/blasferna/django-calculation/actions/workflows/release.yml)
[![PyPI version](https://badge.fury.io/py/django-calculation.svg)](https://badge.fury.io/py/django-calculation)
![PyPI - Django Version](https://img.shields.io/pypi/djversions/django-calculation) ![PyPI - Python Version](https://img.shields.io/pypi/pyversions/django-calculation)

Make simple calculations in your django forms.

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

Import `NumericCalculationInput` from `calculation.widgets` and complete the `calculation` attribute like this.

```python
from django import forms

from calculation.widgets import NumericCalculationInput

class TestForm(forms.Form):
    quantity = forms.DecimalField()
    price = forms.DecimalField()
    amount = forms.DecimalField(
        widget=NumericCalculationInput(
            attrs={
                'calculation': {
                    'mode': NumericCalculationInput.FORMULA,
                    'formula': 'quantity*price'
                }
            }
        )
    )

```
