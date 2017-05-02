from traffic_shark_api.utils import get_client_ip
from traffic_shark_thrift.ttypes import Corruption
from traffic_shark_thrift.ttypes import Delay
from traffic_shark_thrift.ttypes import Loss
from traffic_shark_thrift.ttypes import Reorder
from traffic_shark_thrift.ttypes import Shaping
from traffic_shark_thrift.ttypes import TrafficControlSetting
from traffic_shark_thrift.ttypes import Profile
from traffic_shark_thrift.ttypes import MachineControl
from traffic_shark_thrift.ttypes import MachineControlState

from rest_framework import serializers
from thrift.Thrift import TType

import socket

def validate_ipaddr(ipaddr):
    try:
        socket.inet_aton(ipaddr)
        return True
    except socket.error:
        return False


class ThriftSerializer(serializers.Serializer):
    # Should be set by the serializer to the concrete thrift class
    # to be serialized.
    _THRIFT_CLASS = None

    # A map of renamed fields.
    # Keys in the map are the names of thrift fields. Their values
    # are the names of the serializer fields they correspond to.
    _THRIFT_RENAMED_FIELDS = {}

    def create(self, attrs):
        args = {}

        for field_tuple in self._THRIFT_CLASS.thrift_spec:
            if not field_tuple:
                continue

            _, thrift_type, arg_name, _, default = field_tuple

            f_name = arg_name
            if arg_name in self._THRIFT_RENAMED_FIELDS:
                f_name = self._THRIFT_RENAMED_FIELDS[arg_name]

            serializer = self.fields[f_name]

            if f_name not in attrs:
                args[arg_name] = default
                continue

            if thrift_type == TType.STRUCT:
                args[arg_name] = serializer.create(attrs[f_name])
            else:
                # Primitive
                args[arg_name] = attrs[f_name]

        return self._THRIFT_CLASS(**args)


class BaseShapingSettingSerializer(ThriftSerializer):
    percentage = serializers.FloatField(default=0)
    correlation = serializers.FloatField(default=0)


class DelaySerializer(ThriftSerializer):
    _THRIFT_CLASS = Delay

    delay = serializers.IntegerField(default=0)
    jitter = serializers.IntegerField(default=0)
    correlation = serializers.FloatField(default=0)


class LossSerializer(BaseShapingSettingSerializer):
    _THRIFT_CLASS = Loss


class CorruptionSerializer(BaseShapingSettingSerializer):
    _THRIFT_CLASS = Corruption


class ReorderSerializer(BaseShapingSettingSerializer):
    _THRIFT_CLASS = Reorder

    gap = serializers.IntegerField(default=0)


class IptablesOptionsField(serializers.Field):

    def to_representation(self, data):
        if isinstance(data, list):
            return data
        else:
            msg = self.error_messages['invalid']
            raise serializers.ValidationError(msg)

    def to_internal_value(self, obj):
        if obj:
            return obj
        else:
            return []

class ShapingSerializer(ThriftSerializer):
    _THRIFT_CLASS = Shaping

    rate = serializers.IntegerField(default=0, allow_null=True, required=False)
    loss = LossSerializer(default=None, allow_null=True, required=False)
    delay = DelaySerializer(default=None, allow_null=True, required=False)
    corruption = CorruptionSerializer(
        default=None, allow_null=True, required=False)
    reorder = ReorderSerializer(default=None, allow_null=True, required=False)
    iptables_options = IptablesOptionsField(
        default=None, allow_null=True, required=False)


class SettingSerializer(ThriftSerializer):
    _THRIFT_CLASS = TrafficControlSetting

    down = ShapingSerializer()
    up = ShapingSerializer()

class ProfileSerializer(ThriftSerializer):
    _THRIFT_CLASS = Profile

    name = serializers.CharField(
        max_length=128, allow_blank=False, allow_null=False, required=True)
    tc_setting = SettingSerializer(allow_null=False, required=True)

class MachineControlStateSerializer(ThriftSerializer):
    _THRIFT_CLASS = MachineControlState

    ip = serializers.CharField(
        max_length=128, allow_blank=True, allow_null=False, required=True)
    profile_name = serializers.CharField(
        max_length=128, allow_blank=False, allow_null=False, required=True)
    is_capturing = serializers.BooleanField(default=False)
    is_shaping = serializers.BooleanField(default=False)
    online = serializers.BooleanField(default=False)
    capture_filter = serializers.CharField(default=None, max_length=128, allow_blank=True, allow_null=True)
    last_update_time = serializers.IntegerField(default=0)


class MachineControlSerializer(ThriftSerializer):
    _THRIFT_CLASS = MachineControl

    mac = serializers.CharField(
        max_length=128, allow_blank=False, allow_null=False, required=True)
    state = MachineControlStateSerializer(allow_null=False, required=True)
