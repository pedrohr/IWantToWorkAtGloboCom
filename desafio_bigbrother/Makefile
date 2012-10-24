all:
	sudo apt-get install memcached
	wget http://nodejs.org/dist/v0.8.12/node-v0.8.12.tar.gz
	tar xzvf node-v0.8.12.tar.gz
	cd node-v0.8.12; ./configure; make; sudo make install
	sudo npm install -g node-gyp
	sudo npm install
	memcached -d -c 2048 -m 1024 &
	NODE_ENV=production node app.js