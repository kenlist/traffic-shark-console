# gen thrift
thrift -out . --gen py traffic_shark_thrift.thrift

# run service
python manage.py runserver 0.0.0.0:8080