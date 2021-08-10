# django-calculation

Make simple calculations in your django forms.

## Installation

```bash
pip install git+https://github.com/blasferna/django-calculation.git#egg=django-calculation
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
