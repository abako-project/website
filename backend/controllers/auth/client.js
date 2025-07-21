

const {models:{User, Client, Developer}} = require('../../models');


// --------- LOGIN CON CONTRASEÑA

/*
 * Client authentication: Checks that the client is registered.
 *
 * Searches a user with the given email, and checks that
 * the password is correct.
 * If the authentication is correct, then returns the user object.
 * If the authentication fails, then returns null.
 */
const authenticate = async (email, password) => {

    const user = await User.findOne({
        where: {email},
        include: [
            {model: Client, as: "client"}
        ]
    });

    if (!user || !user.client) {
        return null;
    }

    const valid = await user.client.verifyPassword(password);

    return valid ? user : null;
};

exports.loginCreate = async (req, res, next) => {

    const email = req.body.email ?? "";
    const password = req.body.password ?? "";

    try {
        const user = await authenticate(email, password);
        if (user) {
            console.log('Info: Client authentication successful.');

            // Create req.session.loginUser.
            // The existence of req.session.loginUser indicates that the session exists.
            // I also save the moment when the session will expire due to inactivity.
            req.session.loginUser = {
                id: user.id,
                email: user.email,
                name: user.client.name,
                clientId: user.client.id,
                developerId: undefined
            };

            res.redirect(`/clients/${user.client.id}/projects`);
        } else {
            req.flash("error", 'Authentication has failed. Retry it again.');
            res.redirect('/auth/login/client/new');
        }
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


// --------- REGISTRO CON CONTRASEÑA

exports.registerCreate = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).send('Todos los campos son obligatorios');
    }
    const user = await User.create({email});
    const client = await Client.create({password});
    await user.setClient(client);
    res.redirect('/auth/login/client/new');
};
