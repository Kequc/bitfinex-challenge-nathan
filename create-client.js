'use strict'
const { PeerRPCClient, PeerRPCServer } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const createOrderbook = require('./create-orderbook');

module.exports = function createClient(port) {
    const orderbook = createOrderbook();

    const link = new Link({
        grape: 'http://127.0.0.1:30001'
    });
    link.start();

    const rpcServer = new PeerRPCServer(link, {
        timeout: 300000,
    });
    rpcServer.init();

    const service = rpcServer.transport('server');
    service.listen(port);
    service.on('request', async (rid, key, payload, handler) => {
        if (typeof payload === 'object' && 'order' in payload) {
            if (payload.order.port !== port) {
                orderbook.addOrder(payload.order);
            }
        }
        handler.reply(null, { success: 'ok' });
    });

    const peer = new PeerRPCClient(link, {})
    peer.init()

    function announce() {
        link.announce('orderbook', service.port, {});
    }
    setInterval(announce, 1000);
    announce();

    function broadcast(payload) {
        return new Promise((resolve, reject) => {
            peer.map('orderbook', payload, { timeout: 10000 }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    async function submitOrder(parts) {
        if (!validateOrder(parts)) {
            throw new Error('Invalid order');
        }

        const order = {
            ...parts,
            type: parts.type.toLowerCase(),
            asset: parts.asset.toUpperCase(),
            port,
            created: Date.now(),
        };

        orderbook.addOrder(order);
        await broadcast({ order });
    }

    function disconnect() {
        link.stop();
    }

    return {
        submitOrder,
        disconnect,
        orderbook,
    };
}

function validateOrder(order) {
    if (typeof order !== 'object') return false;
    if (typeof order.type !== 'string') return false;
    if (!['buy', 'sell'].includes(order.type.toLowerCase())) return false;
    if (typeof order.asset !== 'string') return false;
    if (typeof order.price !== 'number') return false;
    if (typeof order.quantity !== 'number') return false;
    return true;
}

// // create clients
// const client1 = createClient(1025);
// const client2 = createClient(1026);

// // delay before submitting orders
// setTimeout(async () => {
//     await Promise.all([
//         client1.submitOrder({ type: 'buy', asset: 'BTC', price: 100, quantity: 1 }),
//         client1.submitOrder({ type: 'sell', asset: 'BTC', price: 110, quantity: 1 }),
//         client1.submitOrder({ type: 'buy', asset: 'BTC', price: 120, quantity: 1 }),
//         client2.submitOrder({ type: 'sell', asset: 'BTC', price: 100, quantity: 1 }),
//         client2.submitOrder({ type: 'buy', asset: 'ETH', price: 110, quantity: 1 }),
//         client2.submitOrder({ type: 'buy', asset: 'BTC', price: 120, quantity: 1 }),
//     ]);

//     console.log('Client 1 orders:', client1.orderbook.getOrders());
//     console.log('Client 2 orders:', client2.orderbook.getOrders());
//     process.exit(0);
// }, 2000);
