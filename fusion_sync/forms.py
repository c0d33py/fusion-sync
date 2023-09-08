from django import forms

from .models import FusionSync


class FusionSyncForm(forms.ModelForm):
    """FusionSync form"""

    class Meta:
        model = FusionSync
        fields = ['file']
