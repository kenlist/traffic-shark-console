from django.conf.urls import url
from traffic_shark_api.views import MachineControlApi, ProfileApi, CaptureApi

urlpatterns = [
    url('^mc/$', MachineControlApi.as_view()),
    url('^profile/$', ProfileApi.as_view()),
    url('^capture/$', CaptureApi.as_view()),
    url('^capture/'
        '(?P<mac>[a-z|0-9]{2}:[a-z|0-9]{2}:[a-z|0-9]{2}:[a-z|0-9]{2}:[a-z|0-9]{2}:[a-z|0-9]{2})/$', CaptureApi.as_view()),
]
