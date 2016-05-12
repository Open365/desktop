Desktop
=======

## Overview

Desktop is a static component for the eyeOs platform

## How to use it

Update latest code and make sure you have all latest node/bower things:

```bash
git pull
rm -rf dist node_modules bower_components
npm install
bower install
```
          
Run `grunt build && grunt serve` in order to put the desktop in development mode

`NOTE`: app/index.html and app/scripts/settings.js are no longer files that should ve versioned. These files are 
generated by grunt serve or grunt build (development and release build).
If you want to modify index.html or settings.js please modify the following templates:

* `app/index.template`
* `app/settings/<develop|release>.js`


### Config nginx to use desktop in develop mode (port 9000) with all the other apps working in port 80
This will allow you to have virtualized apps and also apps like viewer and files that run on port 80.

1- Run desktop in develop mode.

2- Modify nginx to redirect requests from port 80 to grunt's port (9000)

```bash
    $ sudo vi /etc/nginx/nginx.conf
```

Add the following config:

```
     location / {
        #root /usr/share/nginx/html/desktop;
        proxy_pass http://localhost:9000;
     }
```

Restart nginx

```bash
    $ sudo docker restart lib_proxy_1
```

3- Open browser and go to localhost (port 443)

## Quick help

* Install modules

```bash
	$ npm install
	$ bower install
```

* Check tests

```bash
    $ npm test
```