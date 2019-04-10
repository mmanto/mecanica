from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from mecanica.models import Cuenta, Perfil, EstadoOrden, EstadoProyecto, EstadoTarea
from django.db import transaction
import uuid, pdb

class LoginForm(forms.Form):
    username = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': "form-control"})
    )

class MyRegistrationForm(UserCreationForm):
    company = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    username = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    first_name = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    last_name = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    email = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    password1 = forms.CharField(
        required = True,
        widget=forms.PasswordInput(attrs={'class': "form-control"}))
    password2 = forms.CharField(
        required = True,
        widget=forms.PasswordInput(attrs={'class': "form-control"}))

    class Meta:
        model = User
        fields = ('last_name', 'first_name', 'username', 'email', 'password1', 'password2')
#Usar solo para registro de cuentas
    def save(self, commit = True):
        transaction.set_autocommit(False)
        try:
            user = super(UserCreationForm, self).save(commit = False)
            user.set_password(self.cleaned_data["password1"])

            user.is_active = True
            user.save()
            cuenta = Cuenta(nombre=self.cleaned_data["company"], owner=user)
            cuenta.save()

            from django.conf import settings
            estados_proyectos = settings.FIXTURES['ESTADOS_PROYECTOS']
            estados_ordenes = settings.FIXTURES['ESTADOS_ORDENES']
            for es in estados_proyectos:
                obj = EstadoProyecto(nombre=es['nombre'], codigo=es['codigo'], color=es['color'], cuenta=cuenta)
                obj.save()
            for es in estados_ordenes:
                obj = EstadoOrden(nombre=es['nombre'], codigo=es['codigo'], color=es['color'], cuenta=cuenta)
                obj.save()
            for es in estados_ordenes:
                obj = EstadoTarea(nombre=es['nombre'], codigo=es['codigo'], color=es['color'], cuenta=cuenta)
                obj.save()

            profile = Perfil(usuario=user, cuenta=cuenta, creado_por=user)
            profile.save()
            user.cuenta = cuenta
            user.save()
            transaction.commit()
            transaction.set_autocommit(True)
        except:
            transaction.rollback()
            return False

        return user

class UsuarioForm(UserCreationForm):
    tipo = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    username = forms.CharField(
        required = False,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    tipo_proveedor = forms.CharField(
        required = False,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    first_name = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    last_name = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    email = forms.CharField(
        required = True,
        widget=forms.TextInput(attrs={'class': "form-control"}))
    password1 = forms.CharField(
        required = False,
        widget=forms.PasswordInput(attrs={'class': "form-control"}))
    password2 = forms.CharField(
        required = False,
        widget=forms.PasswordInput(attrs={'class': "form-control"}))

    domicilio = forms.CharField(required = False)
    codigo_postal = forms.CharField(required = False)
    ciudad = forms.CharField(required = False)
    telefono = forms.CharField(required = False)
    celular = forms.CharField(required = False)
    razon_social = forms.CharField(required = False)
    facebook = forms.CharField(required = False)
    twitter = forms.CharField(required = False)
    linkedin = forms.CharField(required = False)
    whatsapp = forms.CharField(required = False)

    class Meta:
        model = User
        fields = ('last_name', 'first_name', 'username', 'email', 'password1', 'password2')

    def save(self, commit = True):
        transaction.set_autocommit(False)
        try:
            request = self.initial.get('request')
            cuenta_id = request.session.get('cuenta_id', '')
            nick, fulldomain = self.cleaned_data["email"].split('@')

            user = super(UserCreationForm, self).save(commit = False)
            if not self.instance.id:
                count = User.objects.filter(username=nick).count()
                if count:
                    nick = "{0}_{1}".format(nick, count+1)
                user.username = nick
                user.set_password(self.cleaned_data["password1"])
                user.cuenta = cuenta_id
                user.is_active = True
                user.save()
                profile = Perfil(
                    usuario=user,
                    creado_por=request.user,
                    cuenta_id=cuenta_id,
                    tipo=self.cleaned_data["tipo"],
                    domicilio=self.cleaned_data["domicilio"],
                    codigo_postal=self.cleaned_data["codigo_postal"],
                    ciudad=self.cleaned_data["ciudad"],
                    telefono=self.cleaned_data["telefono"],
                    celular=self.cleaned_data["celular"]
                )
                profile.save()

            else:
                user.save()
                user.set_password(self.instance.password)
                user.perfil.creado_por=request.user
                user.perfil.tipo=self.cleaned_data["tipo"]
                user.perfil.domicilio=self.cleaned_data["domicilio"]
                user.perfil.codigo_postal=self.cleaned_data["codigo_postal"]
                user.perfil.ciudad=self.cleaned_data["ciudad"]
                user.perfil.telefono=self.cleaned_data["telefono"]
                user.perfil.celular=self.cleaned_data["celular"]
                user.perfil.save()

            transaction.commit()
            transaction.set_autocommit(True)

        except:
            transaction.rollback()
            return False

        return user