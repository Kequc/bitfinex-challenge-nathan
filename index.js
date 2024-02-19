const readline = require('readline');
const createClient = require('./create-client');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const clients = new Map();

rl.on('line', (input) => {
    const args = input.split(' ');
    const command = args[0];

    function create() {
        const port = parseInt(args[1], 10);
        if (isNaN(port)) {
            console.log('Invalid port');
        } else if (clients.has(port)) {
            console.log(`Client on port ${port} already exists`);
        } else {
            clients.set(port, createClient(port));
            console.log(`Created client on port ${port}`);
        }
    }

    function disconnect() {
        const port = parseInt(args[1], 10);
        if (isNaN(port)) {
            console.log('Invalid port');
        } else if (!clients.has(port)) {
            console.log(`No client on port ${port}`);
        } else {
            // Assuming there's a disconnect method in the client
            clients.get(port).disconnect();
            clients.delete(port);
            console.log(`Disconnected client on port ${port}`);
        }
    }

    function order() {
        const port = parseInt(args[1], 10);
        const type = (args[2] ?? "").toLowerCase();
        const asset = (args[3] ?? "").toUpperCase();
        const price = parseFloat(args[4]);
        const quantity = parseFloat(args[5]);

        if (args.length !== 6) {
            console.log('Invalid number of arguments');
        } else if (isNaN(port)) {
            console.log('Invalid port');
        } else if (!clients.has(port)) {
            console.log(`No client on port ${port}`);
        } else if (!['buy', 'sell'].includes(type)) {
            console.log('Invalid order type');
        } else if (!asset) {
            console.log('Invalid asset');
        } else if (isNaN(price)) {
            console.log('Invalid price');
        } else if (isNaN(quantity)) {
            console.log('Invalid quantity');
        } else {
            clients.get(port).submitOrder({ type, asset, price, quantity });
            console.log(`Submitted ${type} order for ${asset} at ${price} with quantity ${quantity} on port ${port}`);
        }
    }

    function orderbook() {
        const port = parseInt(args[1], 10);
        if (isNaN(port)) {
            console.log('Invalid port');
        } else if (!clients.has(port)) {
            console.log(`No client on port ${port}`);
        } else {
            console.log(clients.get(port).orderbook.getOrders());
        }
    }

    function exit() {
        for (const client of clients.values()) {
            client.disconnect();
        }
        rl.close();
    }

    switch (command) {
        case 'create':
            create();
            break;
        case 'disconnect':
            disconnect();
            break;
        case 'order':
            order();
            break;
        case 'orderbook':
            orderbook();
            break;
        case 'exit':
            exit();
            break;
        default:
            console.log('Unknown command');
    }
});

const COMMANDS = {
    create: '[port]',
    disconnect: '[port]',
    order: '[port] [buy/sell] [asset] [price] [quantity]',
    orderbook: '[port]',
    exit: '',
};
const text = Object.entries(COMMANDS).map(([command, args]) => `${command} ${args}`).join('\n');

console.log('Controller started. Available commands:\n');
console.log(text + '\n');
