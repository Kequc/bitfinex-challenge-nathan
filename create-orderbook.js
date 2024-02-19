module.exports = function createOrderbook() {
    const ordersSet = new Set();

    function addOrder(order) {
        const existingOrder = findOrder(order.port, order.type, order.price);
        if (existingOrder) {
            existingOrder.quantity += order.quantity;
        } else {
            ordersSet.add(order);
            matchOrders();
        }
    }

    function findOrder(port, type, price) {
        return getOrders().find(order => order.port === port && order.type === type && order.price === price);
    }

    function reduceQuantity(order, quantity) {
        const newQuantity = order.quantity - quantity;
        if (newQuantity === 0) {
            ordersSet.delete(order);
        } else {
            order.quantity = newQuantity;
        }
    }

    function matchOrders() {
        const orders = getOrders();
        const buyOrders = orders.filter(order => order.type === 'buy');
        const sellOrders = orders.filter(order => order.type === 'sell');

        for (let buyOrder of buyOrders) {
            for (let sellOrder of sellOrders) {
                if (buyOrder.asset === sellOrder.asset && buyOrder.price === sellOrder.price) {
                    const minQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
                    reduceQuantity(buyOrder, minQuantity);
                    reduceQuantity(sellOrder, minQuantity);
                    return;
                }
            }
        }
    }

    function getOrders() {
        return Array.from(ordersSet);
    }

    return {
        addOrder,
        getOrders,
    };
}
