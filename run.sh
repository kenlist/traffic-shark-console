# gen thrift
which thrift > /dev/null 2>&1
if [ $? == 0 ]; then
  thrift -out . --gen py traffic_shark_thrift.thrift
fi

# run service
python manage.py runserver 0.0.0.0:8080