#BigBrother

This is a node.js implementation of the Globo.com task for setting up a server capable of attending over 1,000 requests hourly for a contest show.

To run the server, first install the dependencies:

> make

then start the server (the Makefile script will start it automatically):

> NODE_ENV=production node app.js