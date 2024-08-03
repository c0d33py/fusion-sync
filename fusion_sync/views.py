from django.shortcuts import render

from .forms import FusionSyncForm
from .models import FusionSync


def index(request):
    """Index view"""
    if request.method == 'POST':
        form = FusionSyncForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
    else:
        form = FusionSyncForm()

    context = {
        'form': form,
        'fusions': FusionSync.objects.all(),
    }
    return render(request, 'aws.html', context)
