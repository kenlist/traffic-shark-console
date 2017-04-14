from django.conf import settings

USER_SETTINGS = getattr(settings, 'TS_API', None)

DEFAULTS = {
    'TSD_HOST': '192.168.2.103',
    'TSD_PORT': 9090,
    # Default timeout is a day in seconds
    'DEFAULT_TC_TIMEOUT': 24 * 60 * 60,
    'PROXY_IPS': ['127.0.0.1'],
}

class APISettings(object):
    def __init__(self, user_settings=None, defaults=None):
        self.__user_settings = user_settings or {}
        self.__defaults = defaults or {}

    def __getattr__(self, attr):
        if attr not in self.__defaults.keys():
            raise AttributeError("Invalid API setting: '%s'" % attr)

        try:
            # Check if user have set that key.
            val = self.__user_settings[attr]
        except KeyError:
            # Use defaults otherwise.
            val = self.__defaults[attr]

        return val


tsd_api_settings = APISettings(USER_SETTINGS, DEFAULTS)
