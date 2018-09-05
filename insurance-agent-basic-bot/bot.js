// Load the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var InsuranceType = {
    Driver: 'Driver',
    Home: 'Home',
    Farm: 'Farm',
    Travel: 'Travel'
};

var inMemoryStorage = new builder.MemoryBotStorage();

const bot = module.exports = new builder.UniversalBot(connector, [
    function (session) {
        builder.Prompts.choice(
            session,
            'What kind of insurance do you need?',
            [InsuranceType.Driver, InsuranceType.Home, InsuranceType.Farm, InsuranceType.Travel],
            {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },
    function (session, result) {
        if (!result.response) {
            // exhausted attemps and no selection, start over
            session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
            return session.endDialog();
        }

        // on error, start over
        session.on('error', function (err) {
            session.send('Failed with message: %s', err.message);
            session.endDialog();
        });

        // continue on proper dialog
        var selection = result.response.entity;
        switch (selection) {
            case InsuranceType.Driver:
                return session.beginDialog('insurance-driver');
            case InsuranceType.Home:
                return session.beginDialog('insurance-home');
            case DialogLabels.Farm:
                return session.beginDialog('insurance-farm');
            case DialogLabels.Travel:
                return session.beginDialog('insurance-travel');
        }
    }
]).set('storage', inMemoryStorage); // Register in memory storage

bot.dialog('insurance-driver',[
    function (session) {
        session.send("OK, lets talk about driver insurance.");
        builder.Prompts.time(session, 'When do you want the insurance coverage to start?');
    },
    function (session, results, next) {
        session.dialogData.policyStart = results.response.resolution.start;
        next();
    },
    function (session) {
        builder.Prompts.time(session, 'When do you want the insurance coverage to end?');
    },
    function (session, results, next) {
        session.dialogData.policyEnd = results.response.resolution.start;
        next();
    },
    function (session) {
        session.send("One more question:");
        builder.Prompts.number(session, 'How many claims did you have in last 5 years?');
    },
    function (session, results, next) {
        session.dialogData.claimsNo = results.response;
        next();
    },
    function (session) {
        session.send("Let wrap up: you need driver insurance from %s to %s and you declared %s claim(s) during last 5 years",
            session.dialogData.policyStart,
            session.dialogData.policyEnd,
            session.dialogData.claimsNo);
        session.endDialog()
    }
]);

bot.dialog('insurance-home',[
    function (session) {
        session.send("I'm sorry, home insurance is not supported yet.");
        session.endDialog();
    }
]);

bot.dialog('insurance-farm',[
    function (session) {
        session.send("I'm sorry, farm insurance is not supported yet.");
        session.endDialog();
    }
]);

bot.dialog('insurance-travel',[
    function (session) {
        session.send("I'm sorry, travel insurance is not supported yet.");
        session.endDialog();
    }
]);

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});
