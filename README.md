# django-calculation

[![Release](https://github.com/blasferna/django-calculation/actions/workflows/release.yml/badge.svg)](https://github.com/blasferna/django-calculation/actions/workflows/release.yml)
[![PyPI version](https://img.shields.io/pypi/v/django-calculation.svg?color=success)](https://pypi.python.org/pypi/django-calculation)
![PyPI - Django Version](https://img.shields.io/pypi/djversions/django-calculation) ![PyPI - Python Version](https://img.shields.io/pypi/pyversions/django-calculation)

Make simple calculations in your django forms using `django-calculation`. This app provide a **[Django Widget](https://docs.djangoproject.com/en/3.2/ref/forms/widgets/)** that derives its value from a expression defined in the widget instance. 

The field is updated when any of the source fields change.

![calculation](https://user-images.githubusercontent.com/8385910/142947517-49a5d6a0-6a6c-41d6-8f14-a140ad44fa1e.gif)



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

Import `calculation` and complete the definition. 

### Example

Using `FormulaInput` widget

```python
from django import forms

import calculation


class TestForm(forms.Form):
    quantity = forms.DecimalField()
    price = forms.DecimalField()
    amount = forms.DecimalField(
        widget=calculation.FormulaInput('quantity*price') # <- using single math expression
    )
    apply_taxes = forms.BooleanField(initial=True)
    tax = forms.DecimalField(
        # using math expression and javascript functions.
        widget=calculation.FormulaInput('apply_taxes ? parseFloat(amount/11).toFixed(2) : 0.0') 
    )

```

`django-calculation` works with static files and therefore it is necessary to include the media of the form in the template file.

```html
<form method="post">
    {% csrf_token %}
    {{ form }}
    <input type="submit" value="Submit">
</form>

{{ form.media }}
```

### Modes

Currently the app support two modes of calculation `FORMULA` and `SUMMARY`.

***`FORMULA`*** 

The field value derive from a formula expression. In the expression you can refer to the form field using its name.

```python
amount = forms.DecimalField(
    widget=calculation.FormulaInput('quantity*price')
)
```

***`SUMMARY`*** 

The field value derive from a summary definition, it is useful when you need to get the sum of a django formset field.

```python
total = forms.DecimalField(
    widget=calculation.SummaryInput(
            function=calculation.SUM,
            field='amount' 
    )
```

#### Summary example

Summary definition in `OrderForm`

```python
class OrderForm(forms.ModelForm):
    total = forms.DecimalField(
        # using SumInput a SummaryInput abstraction
        widget=calculation.SumInput('subtotal')
    )
    class Meta:
        model = Order
        fields = ['date', 'customer']
```

`OrderDetForm` also contain a calculated field `subtotal`.
```python
class OrderDetForm(forms.ModelForm):
    subtotal = forms.DecimalField(
        widget=calculation.FormulaInput('quantity*price')
    )
    class Meta:
        model = OrderDet
        fields = ['product', 'price', 'quantity', 'subtotal']

# formset definition
OrderDetFormSet = forms.inlineformset_factory(Order, OrderDet, OrderDetForm)
```

![chrome-capture](https://user-images.githubusercontent.com/8385910/129214716-e3876719-1912-49b0-989f-125e724dfb92.gif)


## Roadmap

- Create demo project.
- Create documentation.
- Add changelog.
- Create minified version of `calculation.js` for production usage.
