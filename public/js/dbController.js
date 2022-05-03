// Localhost / Webserver URL to save / retrieve data. 
// const url = "http://localhost:5001/"; // Localhost URL
const url = "https://bundle-work.herokuapp.com/" // Heroku URL

class DBController {
    constructor() {
        console.log('Object created');
    }

    saveBundle(key, jsonBundle) {
        let postData = {'key': key, 'bundle': jsonBundle};
        let postUrl = url + 'save';
        httpPost(postUrl, postData, function(response) {
            // messageBox.innerHTML = response; 
            console.log(response);
        });
    }

    retrieveBundle(key, bundleCallback) {
        let postData = {'key': key };
        let postUrl = url + 'retrieve';
        httpPost(postUrl, postData, response => {
            console.log('I am retrieving for key:' + key);
            if (response === 'empty') {
                messageBox.innerHTML = 'No Data';
            } else {
                response = JSON.parse(response);
                bundleCallback(key, response); 
            }
        });
    }
}

