import {default as SDK} from 'https://cdn.jsdelivr.net/npm/@virtonetwork/sdk@0.0.4-alpha.5/dist/esm/sdk.js';

const JWT_TOKEN_KEY = 'virto_jwt_token';
const CONNECTED_USER_KEY = 'virto_connected_user';

function loadFromLocalStorage() {
    const storedToken = localStorage.getItem(JWT_TOKEN_KEY);
    const storedUserId = localStorage.getItem(CONNECTED_USER_KEY);

    if (storedToken) {
        authToken = storedToken;
        console.log('Token JWT loaded from localStorage', 'info');
    }

    if (storedUserId) {
        connectedUserId = storedUserId;
        console.log(`Connected user loaded from localStorage: ${storedUserId}`, 'info');
    }
}


let preparedRegistrationData = null;   //: PreparedRegistrationData | null = null;
let preparedConnectionData = null;     //: : PreparedConnectionData | null = null;
let connectedUserId = null;            //: : string | null = null;
let authToken = null;                 //:  string | null = null;

loadFromLocalStorage();

console.log("+++++ FIN +++++");

const userIdElement = document.getElementById('userId');
const userNameElement = document.getElementById('userName');
const commandHex = document.getElementById('commandHex');

const registrationButton = document.getElementById('registrationButton');

const prepareRegistrationButton = document.getElementById('prepareRegistrationButton');
const completeRegistrationButton = document.getElementById('completeRegistrationButton');
const prepareConnectionButton = document.getElementById('prepareConnectionButton');
const completeConnectionButton = document.getElementById('completeConnectionButton');
const signButton = document.getElementById('signButton');


function initializeSDK() {
    try {
        const sdk = new SDK({
            federate_server: 'http://localhost:3000/api',
            provider_url: 'ws://localhost:12281',
            config: {
                wallet: 'polkadot'
            }
        });

        console.log('SDK initialized successfully', 'success');
        return sdk;
    } catch (error) {
        console.log(`Error initializing SDK: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        throw error;
    }
}

function getUserData() {
    return {
        profile: {
            id: userIdElement.value,
            name: userNameElement.value || undefined
        }
    };
}


function saveToLocalStorage() {
    if (authToken) {
        localStorage.setItem(JWT_TOKEN_KEY, authToken);
    }
    if (connectedUserId) {
        localStorage.setItem(CONNECTED_USER_KEY, connectedUserId);
    }
}


async function registration() {
    try {
        console.log('--0-- Preparing registration data on the client...');

        console.log('--1-- Formulario:', userIdElement.value, userNameElement.value);

        if (!userIdElement.value) {
            console.log('Error: User ID is required', 'error');
            return;
        }

        console.log('--2--');

        registrationButton.disabled = true;

        const sdk = initializeSDK();
        console.log('--3--');
        const userData = getUserData();
        console.log('--4--');

        console.log(`Preparing registration for user with ID: ${userData.profile.id}...`);

        preparedRegistrationData = await sdk.auth.prepareRegistration(userData);

        console.log('--5--');

        console.log('Registration data prepared successfully:', 'success');
        console.log(JSON.stringify(preparedRegistrationData, null, 2));

        console.log('--6--');

        console.log('Sending data to the server to complete registration...');

        if (!preparedRegistrationData) {
            console.log('Error: No prepared registration data. Run Step 1 first.', 'error');
            return;
        }

        const response = await fetch(`http://localhost:3001/virto/custom-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preparedRegistrationData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        console.log('Registration completed successfully on the server:', 'success');
        console.log(JSON.stringify(result, null, 2));

        // After successful registration, automatically start the connection process
         userId = preparedRegistrationData.userId;
        console.log(`Starting automatic connection process for ${userId}...`, 'info');

        preparedRegistrationData = null;

        await prepareConnection();

        // If we have prepared data, complete the connection
        if (preparedConnectionData) {
            await completeConnection();
        }
    } catch (error) {
        console.log(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
        registrationButton.disabled = false;
    }
}


async function prepareRegistration() {
    try {
        console.log('Preparing registration data on the client...');

        if (!userId.value) {
            console.log('Error: User ID is required', 'error');
            return;
        }

        prepareRegistrationButton.disabled = true;

        const sdk = initializeSDK();
        const userData = getUserData();

        console.log(`Preparing registration for user with ID: ${userData.profile.id}...`);

        preparedRegistrationData = await sdk.auth.prepareRegistration(userData);

        console.log('Registration data prepared successfully:', 'success');
        console.log(JSON.stringify(preparedRegistrationData, null, 2));

        completeRegistrationButton.disabled = false;
    } catch (error) {
        console.log(`Error preparing registration: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
        prepareRegistrationButton.disabled = false;
    }
}

async function completeRegistration() {
    try {
        console.log('Sending data to the server to complete registration...');

        if (!preparedRegistrationData) {
            console.log('Error: No prepared registration data. Run Step 1 first.', 'error');
            return;
        }

        completeRegistrationButton.disabled = true;

        const response = await fetch(`http://localhost:3001/virto/custom-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preparedRegistrationData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        console.log('Registration completed successfully on the server:', 'success');
        console.log(JSON.stringify(result, null, 2));

        // After successful registration, automatically start the connection process
        const userId = preparedRegistrationData.userId;
        console.log(`Starting automatic connection process for ${userId}...`, 'info');

        preparedRegistrationData = null;
        completeRegistrationButton.disabled = true;

        await prepareConnection();

        // If we have prepared data, complete the connection
        if (preparedConnectionData) {
            await completeConnection();
        }
    } catch (error) {
        console.log(`Error completing registration: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
        completeRegistrationButton.disabled = !preparedRegistrationData;
    }
}

async function prepareConnection() {
    try {
        console.log('Preparing connection data on the client...');

        if (!userId.value) {
            console.log('Error: User ID is required', 'error');
            return;
        }

        prepareConnectionButton.disabled = true;

        const sdk = initializeSDK();

        console.log(`Preparing connection for user with ID: ${userId.value}...`);

        preparedConnectionData = await sdk.auth.prepareConnection(userId.value);

        console.log('Connection data prepared successfully:', 'success');
        console.log(JSON.stringify(preparedConnectionData, null, 2));

        completeConnectionButton.disabled = false;
    } catch (error) {
        console.log(`Error preparing connection: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
        prepareConnectionButton.disabled = false;
    }
}

async function completeConnection() {
    try {
        console.log('Sending data to the server to complete connection...');

        if (!preparedConnectionData) {
            console.log('Error: No prepared connection data. Run Step 1 first.', 'error');
            return;
        }

        completeConnectionButton.disabled = true;

        const response = await fetch(`http://localhost:3001/virto/custom-connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preparedConnectionData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        console.log('Connection completed successfully on the server:', 'success');
        console.log(JSON.stringify(result, null, 2));

        connectedUserId = preparedConnectionData.userId;

        authToken = result.token || null;

        if (authToken) {
            console.log('JWT token received and stored for future requests', 'success');
            saveToLocalStorage();
        } else {
            console.log('Warning: No JWT token received from server', 'warning');
        }

        preparedConnectionData = null;
        completeConnectionButton.disabled = true;
    } catch (error) {
        console.log(`Error completing connection: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
        completeConnectionButton.disabled = !preparedConnectionData;
    }
}

async function signCommand() {
    try {
        console.log('Starting signing process...');

        if (!connectedUserId) {
            console.log('Error: You must connect first before signing', 'error');
            return;
        }

        if (!commandHex.value) {
            console.log('Error: You must provide a command to sign', 'error');
            return;
        }

        console.log(`Signing command for user ${connectedUserId}...`);

        const command = {
            url: 'http://localhost:9000/sign',
            body: commandHex.value,
            hex: commandHex.value
        };

        try {
            console.log('Using secure endpoint with JWT token authentication', 'info');
            console.log(localStorage.getItem('virto_jwt_token'));
            const response = await fetch('http://localhost:3001/virto/sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('virto_jwt_token')}`
                },
                body: JSON.stringify(command)
            });

            const result = await response.json();

            console.log('Command signed successfully on the server using JWT authentication:', 'success');
            console.log(JSON.stringify(result, null, 2));
        } catch (clientError) {
            console.log(`Error signing the command: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.log(`Error signing the command: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
}

registrationButton?.addEventListener('click', registration);

prepareRegistrationButton?.addEventListener('click', prepareRegistration);
completeRegistrationButton?.addEventListener('click', completeRegistration);
prepareConnectionButton?.addEventListener('click', prepareConnection);
completeConnectionButton?.addEventListener('click', completeConnection);
signButton?.addEventListener('click', signCommand);

if (completeRegistrationButton) {
    completeRegistrationButton.disabled = !preparedRegistrationData;
}
if (completeConnectionButton) {
    completeConnectionButton.disabled = !preparedConnectionData;
}
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

