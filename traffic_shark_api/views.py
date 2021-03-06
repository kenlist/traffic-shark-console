from traffic_shark_api.tsd_client import tsdClient
from traffic_shark_api.serializers import SettingSerializer, ProfileSerializer, MachineControlStateSerializer, MachineControlSerializer
from traffic_shark_api.settings import tsd_api_settings
from traffic_shark_api.utils import get_client_ip
from traffic_shark_thrift.ttypes import TrafficControlException

from functools import wraps
from django.http import HttpResponse
from rest_framework.exceptions import APIException
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class BadGateway(APIException):
    status_code = 502
    default_detail = 'Could not connect to TrafficShark gateway.'


def serviced(method):
    '''
    A decorator to check if the service is available or not.
    Raise a BadGateway exception on failure to connect to the TrafficShark gateway
    '''
    @wraps(method)
    def decorator(cls, request, *args, **kwargs):
        service = tsdClient()
        if service is None:
            raise BadGateway()
        return method(cls, request, service, *args, **kwargs)
    return decorator

class MachineControlApi(APIView):
    @serviced
    def get(self, request, service):
        print 'MachineControlApi get'
        try:
            mcontrols = service.getMachineControls()
        except TrafficControlException as e:
            return Response(
                {'detail': e.message},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = {}
        for mc in mcontrols:
            serializer = MachineControlStateSerializer(mc.state)
            data[mc.mac] = serializer.data

        return Response(
            data, 
            status=status.HTTP_200_OK)

    @serviced
    def patch(self, request, service):
        print 'MachineControlApi patch: {}'.format(request.data)
        mc_serializer = MachineControlSerializer(data=request.data)

        if (not mc_serializer.is_valid()):
            raise ParseError(detail=repr(mc_serializer.errors))

        mc = mc_serializer.save()
        # print 'patch: {}'.format(mc)
        
        try:
            tcrc = service.updateMachineControl(mc)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK
        )

    @serviced
    def post(self, request, service):
        mac = request.data
        print 'MachineControlApi post: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.shapeMachine(mac)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_201_CREATED)

    @serviced
    def delete(self, request, service):
        mac = request.data
        print 'MachineControlApi delete: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.unshapeMachine(mac)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK)

class ProfileApi(APIView) :

    @serviced
    def get(self, request, service):
        print 'ProfileApi get'
        try:
            profiles = service.getProfiles()
        except TrafficControlException as e:
            return Response(
                {'detail': e.message},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = {}
        for profile in profiles:
            serializer = SettingSerializer(profile.tc_setting)
            data[profile.name] = serializer.data

        return Response(
            data, 
            status=status.HTTP_200_OK)
        
    @serviced
    def post(self, request, service):
        print 'ProfileApi post: {}'.format(request.data)
        profile_serializer = ProfileSerializer(data=request.data)

        if (not profile_serializer.is_valid()):
            raise ParseError(detail=repr(profile_serializer.errors))

        profile = profile_serializer.save()
        
        try:
            tcrc = service.addProfile(profile)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_201_CREATED
        )

    @serviced
    def delete(self, request, service):
        profile_name = request.data
        print 'ProfileApi delete: {}'.format(profile_name)

        if profile_name is None:
            return Response(
                {'details': 'invalid profile name'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.removeProfile(profile_name)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK)

class CaptureApi(APIView) :

    @serviced
    def get(self, request, service, mac=None):
        print 'CaptureApi get: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.getCapturePackets(mac)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            tcrc.message, 
            status=status.HTTP_200_OK)
        
    @serviced
    def post(self, request, service):
        data = request.data
        print 'CaptureApi post: {}'.format(data)

        mac = data.get('mac')
        capture_filter = data.get('filter')

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.startCapture(mac, capture_filter)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK)

    @serviced
    def delete(self, request, service):
        mac = request.data
        print 'CaptureApi delete: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        try:
            tcrc = service.stopCapture(mac)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK)

    @serviced
    def patch(self, request, service):
        mac = request.data
        print 'CaptureApi patch: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            tcrc = service.exportPcap(mac)
        except TrafficControlException as e:
            return Response(e.message, status=status.HTTP_401_UNAUTHORIZED)
        result = {'result': tcrc.code, 'message': tcrc.message}
        if tcrc.code:
            raise ParseError(detail=repr(result))

        return Response(
            '', 
            status=status.HTTP_200_OK
        )

class PcapFileApi(APIView):
    DEFAULT_PCAP_PATH = '/tmp/pcaps/'

    @serviced
    def get(self, request, service, mac=None):
        print 'PcapFileApi get: {}'.format(mac)

        if mac is None:
            return Response(
                {'details': 'invalid mac address'},
                status=status.HTTP_401_UNAUTHORIZED)

        pcap_path = self.DEFAULT_PCAP_PATH + "[" + mac + "].pcap"

        # file = open('/Users/kenlist/serverprojects/traffic-shark-console/tmp.pcap', 'rb')
        file = open(pcap_path, 'rb')
        response = HttpResponse(file, content_type='application/octet-stream')
        response['Content-Disposition'] = 'attachment; filename=[{}].pcap'.format(mac)
        return response
            
