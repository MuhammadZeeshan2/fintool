
# """
# URL configuration for fintool project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/5.1/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """

from django.contrib import admin
from django.urls import path,include
from django.contrib.auth import views as auth_views
from django.contrib import admin
from django.urls import include, path
from django.contrib.auth.views import LoginView
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView

import fintool

from fintool import views


admin.site.site_header = "DREgine: Financial_tool"
admin.site.site_title = "DREgine: Financial_tool Portal"
admin.site.index_title = "Welcome to DREgine: Financial_tool"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('home/', views.home, name='home'),
    path('privacy_policy', TemplateView.as_view(template_name="privacy_policy.html"), name='privacy_policy'),
    path('', include(('fintool.urls', 'fintool'), namespace='fintool')), 
]
