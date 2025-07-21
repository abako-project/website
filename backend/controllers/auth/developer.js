const virtoService = require('../../services/virtoFake');

const {models: {User, Developer}} = require('../../models');


exports.registerCreate = async (req, res, next) => {

    const {email, name, preparedData: json} = req.body;

    if (!email) {
        return res.status(400).send('El campo email es obligatorio');
    }

    try {
        preparedData = JSON.parse(decodeURIComponent(json));

        if (!preparedData.userId || !preparedData.attestationResponse || !preparedData.blockNumber) {
            return res.status(400).json({error: 'Incomplete registration data'});
        }

        const result = await virtoService.customRegister(preparedData);


        console.log("======================================================");
        console.log("customRegister result", JSON.stringify(result, undefined, 2));
        console.log("======================================================");

        if (result.error) {
            throw new Error(result.message);
        }

        const address = result.address;

        const user = await User.create({email});
        const developer = await Developer.create({email, name, address});
        await user.setDeveloper(developer);

        req.flash("success", '✅ Registrado correctamente');

        res.redirect('/auth/login/developer/new');


    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/developer/new');
    }
};


exports.loginCreate = async (req, res, next) => {

    const {email, preparedData: json} = req.body;

    if (!email) {
        return res.status(400).send('El campo email es obligatorio');
    }

    try {
        const user = await User.findOne({
            where: {email},
            include: [{model: Developer, as: "developer"},]
        });
        if (!user) {
            req.flash("error", "El developer " + email + " no existe.");
            res.redirect('/auth/login/developer/new');
            return;
        }


        preparedData = JSON.parse(decodeURIComponent(json));

        if (!preparedData.userId || !preparedData.assertionResponse || !preparedData.blockNumber) {
            return res.status(400).json({error: 'Incomplete connection data'});
        }

        console.log("======================================================");
        console.log("preparedData", JSON.stringify(preparedData, undefined, 2));
        console.log("======================================================");

        const result = await virtoService.customConnect(preparedData);

        if (result.error) {
            throw new Error(result.message);
        }

        console.log("======================================================");
        console.log("result", JSON.stringify(result, undefined, 2));
        console.log("======================================================");


        connectedUserId = preparedData.userId;
        authToken = result.token || null;

        if (authToken) {
            console.log('JWT token received and stored for future requests', 'success');
            //  saveToLocalStorage();
        } else {
            console.log('Warning: No JWT token received from server', 'warning');
        }


        // Create req.session.loginUser.
        // The existence of req.session.loginUser indicates that the session exists.
        // I also save the moment when the session will expire due to inactivity.
        req.session.loginUser = {
            id: user.id,
            email: user.email,
            name: user.developer.name,
            clientId: undefined,
            developerId: user.developer.id
        };

        req.flash("success", 'Developer authentication completed.');
        res.redirect(`/developers/${user.developer.id}/projects`);

    } catch (error) {
        req.flash("error", 'Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login
        error: $
        {
            error instanceof Error ? error.message : 'Unknown error'
        }
        `);
        res.redirect('/auth/login/developer/new');
    }
};

