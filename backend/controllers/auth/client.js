const seda = require("../../services/seda");

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

  return await seda.clientFindByEmailPassword(email, password);
};

exports.loginCreate = async (req, res, next) => {

  const email = req.body.email ?? "";
  const password = req.body.password ?? "";

  try {
    const client = await authenticate(email, password);
    if (client) {
      console.log('Info: Client authentication successful.');

      // Guardar la zona horaria del navegador y del servidor en la session
      let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
      req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
      req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

      // Create req.session.loginUser.
      // The existence of req.session.loginUser indicates that the session exists.
      // I also save the moment when the session will expire due to inactivity.
      req.session.loginUser = {
        id: client.user.id,
        email: client.user.email,
        name: client.name,
        clientId: client.id,
        developerId: undefined
      };

      res.redirect(`/clients/${client.id}/projects`);
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

  await seda.clientCreate(email, password);

  res.redirect('/auth/login/client/new');
};
