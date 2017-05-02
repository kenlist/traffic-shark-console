#!/bin/bash  

packages=(
  "django"
  "djangorestframework"
  "django-bootstrap-themes"
  "django-static-jquery"
  "thrift"
)

packages_str=${packages[@]}

pip install -U -I -t ./packages $packages_str

# gen thrift
which thrift > /dev/null 2>&1
if [ $? == 0 ]; then
  thrift -out . --gen py traffic_shark_thrift.thrift
fi

# setup django
python manage.py migrate
