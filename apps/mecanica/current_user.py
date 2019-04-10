from threading import local
from django.contrib.auth.models import User
_user = local()
_user.value = None
_cuenta_id = None
import pdb

class CurrentUserMiddleware(object):

    def process_request(self, request):
        _user.value = request.user
        _cuenta_id = request.session.get('cuenta_id', '')

def get_current_user():
	if isinstance(_user.value, User):
		return _user.value or None
	else:
		return ''

def get_current_account():
	if isinstance(_user.value, User):
		return _user.value.perfil.cuenta or None
	else:
		return ''