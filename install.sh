#!/bin/sh  

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
thrift -out . --gen py traffic_shark_thrift.thrift

# setup django
python manage.py migrate
