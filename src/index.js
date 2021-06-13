// external packages
const express = require('express');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT || 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

// create utterance transcript
const utteranceTranscript = (req, flag, oc='') => {

    let fulfillmentText = '';
    let queryText = '';
    let transcript = [];
    let session = '';

    if (!flag) {
        fulfillmentText += req.body.queryResult.fulfillmentText;
        queryText += req.body.queryResult.queryText;

        session += req.body.session;

        let outputContexts = req.body.queryResult.outputContexts;

        outputContexts.forEach(outputContext => {
            let session = outputContext.name;
            if (session.includes('/contexts/session')) {
                if (outputContext.hasOwnProperty('parameters')) {
                    if (outputContext.parameters.hasOwnProperty('transcript')) {
                        transcript = outputContext.parameters.transcript;
                    }
                }
            }
        });
    } else {
        fulfillmentText += req.fulfillmentText;
        queryText += req.queryText;
        session += req.session;
        transcript = req.transcript;
    }

    let date = new Date();

    transcript.push({
        user: `${queryText}\n`,
        SmartBox_Agent: `${fulfillmentText}\n`,
        date: `${date.toLocaleString('en', { timeZone: 'Asia/Kolkata' })}\n`
    });

    let contextName = `${session}/contexts/session`;

    if (oc === '') {
        return {
            fulfillmentText: fulfillmentText,
            outputContexts: [{
                name: contextName,
                lifespanCount: 50,
                parameters: {
                    transcript: transcript
                }
            }]
        };
    } else {
        let outputContext = [];
        outputContext.push({
            name: contextName,
            lifespanCount: 50,
            parameters: {
                transcript: transcript
            }
        });
        oc.forEach(out => {
            outputContext.push(out);
        });
        return {
            fulfillmentText: fulfillmentText,
            outputContexts: outputContext
        };
    }
};

const handleCallbackRequest = (req) => {

    let outputContexts = req.body.queryResult.outputContexts;
    let queryText = req.body.queryResult.queryText;
    let session = req.body.session;

    let first_name, last_name, phone, email, issue;
    let transcript = [];

    outputContexts.forEach(outputContext => {
        let session = outputContext.name;
        if (session.includes('/contexts/session')) {
            if (outputContext.hasOwnProperty('parameters')) {
                first_name = outputContext.parameters.first_name;
                last_name = outputContext.parameters.last_name;
                phone = outputContext.parameters.phone;
                email = outputContext.parameters.email;
                issue = outputContext.parameters.issue;
                transcript = outputContext.parameters.transcript;
            }
        }
    });

    let outString = '';

    if (issue === undefined) {
        outString += `Sounds good.I'll gather your information and have a <%company_name%> customer service agent call you ASAP. ::next-2000:: What is the problem or what type of service do you need?`;
        let awaitIssue = `${session}/contexts/await-issue`;
        let oc = [{
            name: awaitIssue,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (first_name === undefined) {
        outString += `Ok, I will have a <%company_name%> customer service rep call you. ::next-2000::To get started, what is your first name?`;
        let awaitFirstname = `${session}/contexts/await-firstname`;
        let oc = [{
            name: awaitFirstname,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (last_name === undefined) {
        outString += `Thanks ${first_name}.::next-1000::What is your last name?`;
        let awaitLastname = `${session}/contexts/await-lastname`;
        let oc = [{
            name: awaitLastname,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (phone === undefined) {
        outString += `Just let me know your phone number and I'll have <%company_name%> call you.::next-1000::Enter your 10 digit mobile phone number.`;
        let awaitPhone = `${session}/contexts/await-phone`;
        let oc = [{
            name: awaitPhone,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (email === undefined) {
        outString += `Finally, we can also contact you by email.::next-2000::What is your email address?`;
        let awaitEmail = `${session}/contexts/await-email`;
        let oc = [{
            name: awaitEmail,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else {
        outString += `You are all set! One of our customer service agents will be in touch ASAP. ::next-2000::Thank you for choosing <%company_name%>.<button type="button" class"quick_reply">Disconnect</button>%disable`;
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true);
    }
};

const handleServiceRequest = (req) => {

    let outputContexts = req.body.queryResult.outputContexts;
    let queryText = req.body.queryResult.queryText;
    let session = req.body.session;

    let first_name, last_name, phone, issue, date, time, email, address;
    let transcript = [];

    outputContexts.forEach(outputContext => {
        let session = outputContext.name;
        if (session.includes('/contexts/session')) {
            if (outputContext.hasOwnProperty('parameters')) {
                first_name = outputContext.parameters.first_name;
                last_name = outputContext.parameters.last_name;
                phone = outputContext.parameters.phone;
                issue = outputContext.parameters.issue;
                address = outputContext.parameters.address;
                email = outputContext.parameters.email;
                transcript = outputContext.parameters.transcript;
                date = outputContext.parameters.date;
                if (outputContext.parameters.hasOwnProperty('time')) {
                    time = outputContext.parameters.time.startTime;
                }
            }
        }
    });

    let outString = '';

    if (issue === undefined) {
        outString += `Sounds good. I can help you schedule service.::next-2000::To get started, what is your problem or issue?`;
        let awaitIssue = `${session}/contexts/await-issue-sr`;
        let oc = [{
            name: awaitIssue,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (first_name === undefined) {
        outString += `Sounds good. Let's schedule your <%company_name%> appointment. ::next-1000::To get started, what is your first name?`;
        let awaitFirstname = `${session}/contexts/await-firstname-sr`;
        let oc = [{
            name: awaitFirstname,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (last_name === undefined) {
        outString += `Thanks ${first_name}.::next-1000::What is your last name?`;
        let awaitLastname = `${session}/contexts/await-lastname-sr`;
        let oc = [{
            name: awaitLastname,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (address === undefined) {
        outString += `What is your street address including city and zip code?`;
        let awaitAddress = `${session}/contexts/await-address-sr`;
        let oc = [{
            name: awaitAddress,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (email === undefined) {
        outString += `What is your email address for the appointment confirmation?`;
        let awaitEmail = `${session}/contexts/await-email-sr`;
        let oc = [{
            name: awaitEmail,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (date === undefined) {
        outString += `What day of the week works best for you?`;
        let awaitDay = `${session}/contexts/await-day-sr`;
        let oc = [{
            name: awaitDay,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else if (time === undefined) {
        outString += `Great. What time works best for you on $day? <button type="button" class"quick_reply">Morning</button> <button type="button" class"quick_reply">Mid-day</button> <button type="button" class"quick_reply">Afternoon</button> <button type="button" class"quick_reply">Evening</button>`;
        let awaitTime = `${session}/contexts/await-time-sr`;
        let oc = [{
            name: awaitTime,
            lifespanCount: 1
        }];
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true, oc);
    } else {
        outString += `Sounds good. Expect a call from our representative.::next-2000::Can I help with anything else?<button type="button" class"quick_reply">Disconnect</button>`;
        return utteranceTranscript({
            fulfillmentText: outString,
            queryText: queryText,
            session: session,
            transcript: transcript
        }, true);
    }
}

// Webhook route
webApp.post('/webhook', async (req, res) => {

    let action = req.body.queryResult.action;
    let session = req.body.session;
    console.log('Webhook called.');
    console.log(`Action --> ${action}`);
    console.log(`Session --> ${session}`);

    let responseData = {};

    if (action === 'handleCallbackRequest') {
        responseData = handleCallbackRequest(req);
    } else if (action === 'handleServiceRequest') {
        responseData = handleServiceRequest(req);
    } else if (action === 'utteranceTranscript') {
        responseData = utteranceTranscript(req);
    } else {
        responseData = {
            fulfillmentText: 'No action is set for this intent.'
        };
    }

    res.send(responseData);
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});