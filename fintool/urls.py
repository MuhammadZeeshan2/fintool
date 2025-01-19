# from django.conf import settings
from django.urls import path,include
from . import views

urlpatterns=[
     path('', views.home, name='index'),

]
