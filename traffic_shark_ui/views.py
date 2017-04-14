from django.shortcuts import render_to_response
from django.template import RequestContext

DEFAULTS = {
    'SHORT_TITLE': 'TrafficShark Console',
    'TITLE': 'TrafficShark Console',
    'EMAIL': 'rijian.lrj@alibaba-inc.com',
    'INFO_MESSAGE': '',
    'REST_ENDPOINT': '/api/v1/',
    'BOOTSTRAP_VERSION': '3.3.0',
}

def index(request):
    context = {'ts_console_settings': DEFAULTS}
    return render_to_response(
        'index.html',
        context,
        RequestContext(request)
    )
