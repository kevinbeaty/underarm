var static = require('node-static')
  , file = new(static.Server)('.')

require('http').createServer(function(request, response){
  request.addListener('end', function(){
    file.serve(request, response, function(err, res){
      if(err){
        console.error("> Error serving " + request.url + " - " + err.message)
        response.writeHead(err.status, err.headers)
        response.end()
      } else {
        console.log("> " + request.url + " - " + res.message)
      }
    })
  })
}).listen(3000)

console.log("> Tests on http://127.0.0.1:3000/test/index.html")
