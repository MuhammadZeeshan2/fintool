# from django.conf import settings
from django.urls import path,include
from . import views

urlpatterns=[
     path('', views.home, name='index'),
     path('chatbot/', views.chatbot_view, name='chatbot'),
     path('api/chatbot/', views.chatbot_api, name='chatbot_api'),


]

