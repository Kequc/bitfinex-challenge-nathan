const createClient = require('./create-client');
const assert = require('assert');

async function it(desc, fn) {
    try {
        await fn();
        console.log('\x1b[32m%s\x1b[0m', `\u2714 ${desc}`);
    } catch (error) {
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', `\u2718 ${desc}`);
        console.error(error);
    } finally {
        process.exit(0);
    }
};

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

it('places an order', async () => {
    const port = 1025;
    const client = createClient(port);
    await wait(2000);
    const order = { type: 'buy', asset: 'gold', price: 100, quantity: 10 };
    await client.submitOrder(order);
    const orders = client.orderbook.getOrders();
    assert.deepStrictEqual(orders, [{
        ...order,
        asset: order.asset.toUpperCase(),
        port,
        created: orders[0].created,
    }]);
    client.disconnect();
});
