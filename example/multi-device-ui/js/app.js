var httpServer = new HTTPServer(8080);

httpServer.addEventListener('request', function(evt) {
  var request  = evt.request;
  var response = evt.response;

  var message = document.getElementById('message').value;

  response.send('accepted');
});

window.addEventListener('load', function() {
  if (!window.P2PHelper) {
    alert('WiFi Direct is not available on this device');
    window.close();
    return;
  }

  var peers = document.getElementById('peers');
  var serverURL;

  P2PHelper.addEventListener('peerlistchange', function(evt) {
    peers.innerHTML = '';

    evt.peerList.forEach(function(peer) {
      var li = document.createElement('li');
      li.dataset.address = peer.address;
      li.dataset.status = peer.connectionStatus;

      var a = document.createElement('a');
      a.href = '#' + peer.address;
      a.textContent = peer.name;

      li.appendChild(a);
      peers.appendChild(li);
    });
  });


  P2PHelper.addEventListener('pairingrequest', function(evt) {
    console.log("CAA");
  });


  P2PHelper.addEventListener('connected', function(evt) {
    serverURL = 'http://' + evt.groupOwner.ipAddress + ':8080';
    superagent
      //.post(serverURL + '/map-updates?ip=' + P2PHelper.localAddress)
      .get(serverURL)
      .end(function(res){
        console.log("CACA");
      });
  });

  P2PHelper.addEventListener('disconnected', function(evt) {

  });

  // Set the device name that will be shown to nearby peers.
  P2PHelper.setDisplayName('P2P Web Server ' + P2PHelper.localAddress);

  // Start scanning for nearby peers.
  P2PHelper.startScan();

  var home   = document.getElementById('home');
  var remote = document.getElementById('remote');
  var frame  = document.getElementById('frame');

  window.addEventListener('hashchange', function(evt) {
    var address = window.location.hash.substring(1);
    if (!address) {
      home.style.display = 'block';
      map.style.display = 'none';

      P2PHelper.disconnect();
      return;
    }

    home.style.display = 'none';
    map.style.display = 'block';

    P2PHelper.connect(address);
  });

  var start = document.getElementById('start');

  start.addEventListener('click', function() {
    httpServer.start();
    home.style.display = 'none';
    list.style.display = 'block';
  });

  var spaces = document.querySelectorAll('.spaces li');
  var selected;
  var i;
  for (i=0; i<spaces.length; i++) {
    spaces[i].addEventListener('click', function(evt) {
      var item = evt.target;
      if (selected) {
        selected.classList.remove('selected');
      }
      item.classList.add('selected');
      selected = item;
    });
  }

});

window.addEventListener('visibilitychange', function(evt) {
  P2PHelper.restartScan();
});

window.addEventListener('beforeunload', function() {
  httpServer.stop();

  P2PHelper.disconnect();
  P2PHelper.stopScan();
});
