
console.log("!! Inicializando el modulo virto !!");

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}



let serverSdk;

const createServerSdk = async () => {

    if (serverSdk) {
        return;
    }

    const ServerSDK = (await import("@virtonetwork/sdk")).default;

    serverSdk = new ServerSDK({
        federate_server: 'http://localhost:3000/api',
        provider_url: 'ws://localhost:12281',
        config: {
            wallet: "polkadot",
            jwt: {
                secret: process.env.JWT_SECRET || 'virto-server-example-secret-key-change-in-production',
                expiresIn: '1h'
            }
        }
    });
};



exports.index = async (req, res) => {
    res.render("virto/index");
};


exports.checkRegistered = async (req, res) => {
    try {
        const userId = req.params.userId;

        await createServerSdk();
        const isRegistered = await serverSdk.auth.isRegistered(userId);

        res.json({
            userId,
            isRegistered
        });
    } catch (error) {
        console.error('Error checking registration:', error);
        res.status(500).json({
            error: 'Error checking if the user is registered',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/*
   customRegister

   Si el registro va bien se devuelve un json con este formato:
     {
         ext: '0xa1070406000a041b9462caa4a31bac3567e0b6e6fd9100787db2ab433d96f6d178cabfce90006b726569766f5f700000000000000000000000000000000000000000000000000e5751c026e543b2e8ab2eb06099daa1d1e5df47778f7787faab45cdf12fe3a8bbe12f00610249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97635d00000000fbfc3007154e4ecc8c0b6e020557d7bd00140fa46946822baecb821dce7c11eb277a822c821ba50102032620012158207010bf838ad1cbf592509e8dd7879cb95c43cb230966d656e2014c618e45fcce225820479bb31bd930d021ff2f1550ed1119bd85d531773bc59930a39733ef13c152c225027b2274797065223a22776562617574686e2e637265617465222c226368616c6c656e6765223a2266717a4d346d422d6b39633375764266686969754d384d4f74414967424f6a413459315a61414977706b6b222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a33303031222c2263726f73734f726967696e223a66616c73657d3059301306072a8648ce3d020106082a8648ce3d030107034200047010bf838ad1cbf592509e8dd7879cb95c43cb230966d656e2014c618e45fcce479bb31bd930d021ff2f1550ed1119bd85d531773bc59930a39733ef13c152c2',
         address: 'CcxDSYQCh2rY6tq9oCeqSN91GMv2F6q4muRAkU2UG77Psqh'
     }

   Si el servidor virto rechaza el registro, se devuelve un json con este formato:
     {
        message: 'Failed to send extrinsic to server',
        stack: 'Error: Failed to send extrinsic to server\n' +
               '    at /app/poc/dist/index.ejs:138:15\n' +
               '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)',
        error: true
     }

   Si hay algun error en el backend, se devuelve un json con este formato:
     {
        message: 'detalles del error',
        error: true
     }
 */
exports.customRegister = async preparedData => {

    console.log("======================================================");
    console.log("customRegister preparedData", JSON.stringify(preparedData, undefined, 2));
    console.log("======================================================");

    await createServerSdk();

    return await serverSdk.auth.completeRegistration(preparedData);
};


/*
    customConnect

    Si login va bien se devuelve un json con este formato:
         {
            userId: session.userId,
            address: session.address,
            createdAt: session.createdAt,
            token: token
        }

   Si el servidor virto rechaza el login, se devuelve un json con este formato:
       ????? Pendiente

   Si hay algun error en el backend, se devuelve un json con este formato:
     {
        message: 'detalles del error',
        error: true
     }
 */
exports.customConnect = async preparedData => {

    await createServerSdk();

    const result = await serverSdk.auth.completeConnection(preparedData);


    console.log("======================================================");
    console.log("Service Result", JSON.stringify(result, undefined, 2));
    console.log("======================================================");

    return {
        userId: result.session.userId,
        address: result.session.address,
        createdAt: result.session.createdAt,
        token: result.token
    };
};

exports.sign = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided or invalid format'
            });
        }

        const token = authHeader.split(' ')[1];
        const commandData = req.body;

        if (!commandData || !commandData.hex) {
            return res.status(400).json({error: 'Incomplete data for signing the command'});
        }

        await createServerSdk();
        const signResult = await serverSdk.auth.signWithToken(token, commandData);

        res.json({
            success: true,
            message: 'Command signed successfully',
            ...signResult
        });
    } catch (error) {
        console.error('Error signing the command:', error);

        if (error.code === 'E_JWT_EXPIRED') {
            return res.status(401).json({
                success: false,
                error: 'Token has expired, please reconnect',
                code: error.code
            });
        } else if (error.code === 'E_JWT_INVALID') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                code: error.code
            });
        } else if (error.code === 'E_SESSION_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: 'Session not found, please reconnect',
                code: error.code
            });
        } else if (error.code === 'E_ADDRESS_MISMATCH') {
            return res.status(401).json({
                success: false,
                error: 'Token address does not match session address',
                code: error.code
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error signing the command',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
