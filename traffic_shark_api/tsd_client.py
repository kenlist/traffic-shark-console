from traffic_shark_api.settings import tsd_api_settings
from traffic_shark_thrift import TrafficSharkService
from thrift.transport import TSocket, TTransport
from thrift.protocol import TBinaryProtocol


def tsdClient():
    try:
        transport = TSocket.TSocket(
            tsd_api_settings.TSD_HOST,
            tsd_api_settings.TSD_PORT
        )
        transport = TTransport.TFramedTransport(transport)
        transport.open()
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        return TrafficSharkService.Client(protocol)
    except TTransport.TTransportException as e:
        print 'tsdClient: %s: %s' % (e.__class__.__name__, str(e))
