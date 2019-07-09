
// function youtube_parser(url) {
//     var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
//     var match = url.match(regExp);
//     return (match && match[7].length == 11) ? match[7] : false;
// }


var request = require('request');
request('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=gdragon&key=AIzaSyCCY6Iit2lMLDRP84oVMDDPIOjgpv1fMOk', function (error, response, body) {
    console.log(JSON.parse(body))  // Print the HTML for the Google homepage.
});