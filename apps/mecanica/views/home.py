from django.shortcuts import render, render_to_response, redirect
from django.http import  HttpResponse, HttpResponseRedirect, JsonResponse
from django.template import RequestContext
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.models import User
from mecanica.serializers import *
from mecanica.forms import LoginForm, UsuarioForm, MyRegistrationForm
from mecanica.utils import create_cuenta_session, get_cuenta_session
from django.contrib.auth import authenticate, login, logout
from django.core.context_processors import csrf
import pdb

def _is_valid_email(email):
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@login_required
def index(request):
    return render(request, 'mecanica/default/index.html', {})

def login_page(request):
    message = None
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']
            if _is_valid_email(username):
                user = User.objects.filter(email=username).first()
                if user:
                    username = user.username
                else:
                    username = None

            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    message = "Se ha loggeado de correctamente"
                    cuenta = user.perfil.cuenta
                    request.session['cuenta_id'] = cuenta.id
                    # request.session['rol'] = user.perfil.tipo_usuario.codigo or '__custom'
                    if request.GET.get('next'):
                        return HttpResponseRedirect(request.GET.get('next'))
                    return redirect('mecanica:index')
                else:
                    message = "Su usuario esta inactivo"
            else:
                message = "Nombre de usuario y/o contraseña incorrectos. Por favor vuelva a intentarlo"
    else:
        form = LoginForm()
    return render_to_response('login.html', {'message': message, 'form': form}, context_instance=RequestContext(request))

def logout_page(request):
    logout(request)
    return redirect('mecanica:index')

@csrf_protect
def registro(request, key):
    args = {}
    args.update(csrf(request))
    if request.method == 'POST' and key == 'ACCESS-GRANTED':
        form = MyRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect('/app/login')
        else:
            args['form'] = form
    else:
        args['form'] = MyRegistrationForm()

    return render_to_response('registro.html', args)
