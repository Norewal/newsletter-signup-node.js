//jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require("https");


const app = express();

// tell express to use files in the public folder when it needs to use static files like images or css
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended : true}));

// load the homepage and form to sign up
app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
});

// post to the mailchimp database
app.post("/", function(req, res) {

    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    // create data object that will be sent to mailchimp
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    // create the url that the request will be sent to
    const list_id = process.env.MY_MAILCHIMP_LIST_ID;
    const url = "https://us17.api.mailchimp.com/3.0/lists/" + list_id;

    // add api key to http request and specify post method
    const apiKey = process.env.MY_MAILCHIMP_API_KEY;
    const options = {
        method: "POST",
        auth: "gabriella:https://us17.api.mailchimp.com/3.0/lists/" + apiKey,
    };

    // create http request
    const request = https.request(url, options, function(response) {

        // send a success or error message based on the response status
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }
        response.on("data", function(data) {
            console.log(JSON.parse(data));
        });
    });

    // send data through http request
    request.write(jsonData);
    request.end();
    
});

// redirect user back to homepage if there was an error
app.post("/failure", function(req,res) {
    res.redirect("/");
});


//it will work on Heroku and local host
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});


