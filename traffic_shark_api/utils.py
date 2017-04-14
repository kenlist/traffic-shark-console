from traffic_shark_api.settings import tsd_api_settings


def get_client_ip(request):
    '''
    Return the real IP of a client even when using a proxy
    '''
    if 'HTTP_X_REAL_IP' in request.META:
        if request.META['REMOTE_ADDR'] not in tsd_api_settings.PROXY_IPS:
            raise ValueError('HTTP_X_REAL_IP set by non-proxy')
        return request.META['HTTP_X_REAL_IP']
    else:
        return request.META['REMOTE_ADDR']
