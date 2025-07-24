import { Router } from "express";
import databaseManager from "../utils/database.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import { userAuthMiddleware } from "../utils/middlewares/userAuthMiddleware.mjs";

const router = Router();

// Adaugă o livrare nouă
router.post('/addOrder', userAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }


        const [id] = await (await databaseManager.getKnex())('orders').insert({ board_id: boardId, waiter_id: userId });

        const order = await (await databaseManager.getKnex())('orders').where({ id }).first();
        return sendJsonResponse(res, true, 201, "Comanda a fost adăugată cu succes!", order);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la adăugarea comenzii!", { details: error.message });
    }
});


router.get('/getOrdersByWaiterId', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const orders = await (await databaseManager.getKnex())('orders')
            .leftJoin('users', 'orders.waiter_id', 'users.id')
            .join('boards', 'orders.board_id', 'boards.id')
            .where('orders.waiter_id', userId)
            .whereNot('orders.status', 'done')
            .select('orders.*', 'users.name as waiter_name', 'boards.number as board_number');


        if (orders.length === 0) {
            return sendJsonResponse(res, true, 200, "Nu există comenzi pentru acest ospatar.", []);
        }

        const results = await Promise.all(orders.map(async order => {
            const orderItems = await (await databaseManager.getKnex())('order_items')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('order_items.order_id', order.id)
                .select(
                    'order_items.id',
                    'order_items.order_id',
                    'order_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',
                );
            return {
                ...order,
                orderItems
            };
        }));

        return sendJsonResponse(res, true, 200, "Comenzile au fost preluate cu succes!", results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea comenzilor!", { details: error.message });
    }
});


router.get('/getOrders', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .orWhere('rights.right_code', 2)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const orders = await (await databaseManager.getKnex())('orders')
            .leftJoin('users', 'orders.waiter_id', 'users.id')
            .join('boards', 'orders.board_id', 'boards.id')
            .whereNot('orders.status', 'done')
            .select('orders.*', 'users.name as waiter_name', 'boards.number as board_number');


        if (orders.length === 0) {
            return sendJsonResponse(res, true, 200, "Nu există comenzi.", []);
        }

        const results = await Promise.all(orders.map(async order => {
            const orderItems = await databaseManager('order_items')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('order_items.order_id', order.id)
                .select(
                    'order_items.id',
                    'order_items.order_id',
                    'order_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',
                );
            return {
                ...order,
                orderItems
            };
        }));

        return sendJsonResponse(res, true, 200, "Comenzile au fost preluate cu succes!", results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea comenzilor!", { details: error.message });
    }
});

// Șterge o livrare
router.delete('/deleteOrder/:orderId', userAuthMiddleware, async (req, res) => {

    try {

        const { orderId } = req.params;

        const userId = req.user.id;


        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const order = await (await databaseManager.getKnex())('orders').where({ id: orderId }).first();
        if (!order) return sendJsonResponse(res, false, 404, "Comanda nu există!", []);
        await (await databaseManager.getKnex())('orders').where({ id: orderId }).del();

        return sendJsonResponse(res, true, 200, "Comanda a fost ștearsă cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la ștergerea comenzii!", { details: error.message });
    }
});

router.put('/updateOrderStatus/:orderId', userAuthMiddleware, async (req, res) => {

    try {

        const { orderId } = req.params;
        const { status } = req.body;


        const userId = req.user?.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .orWhere('rights.right_code', 2)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const order = await (await databaseManager.getKnex())('orders').where({ id: orderId }).first();

        if (!order) return sendJsonResponse(res, false, 404, "Comanda nu există!", []);

        const updateData = {
            status: status || order.status,
        }


        const updated = await (await databaseManager.getKnex())('orders').where({ id: orderId }).update(updateData);


        if (!updated) return sendJsonResponse(res, false, 404, "Masa nu a fost actualizată!", []);

        if (status === 'done') {
            await (await databaseManager.getKnex())('boards').where({ id: order.board_id }).update({ status: 'free', order_id: null });
            await (await databaseManager.getKnex())('board_items').where({ board_id: order.board_id }).del();

        }

        return sendJsonResponse(res, true, 200, "Comanda a fost actualizată cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la actualizarea comenzii!", { details: error.message });
    }
});

router.get('/getFinishedOrdersByWaiterId', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const orders = await (await databaseManager.getKnex())('orders')
            .leftJoin('users', 'orders.waiter_id', 'users.id')
            .join('boards', 'orders.board_id', 'boards.id')
            .where('orders.status', 'done')
            .where('orders.waiter_id', userId)
            .select('orders.*', 'users.name as waiter_name', 'boards.number as board_number')


        if (orders.length === 0) {
            return sendJsonResponse(res, true, 200, "Nu există comenzi.", []);
        }

        const results = await Promise.all(orders.map(async order => {
            const orderItems = await (await databaseManager.getKnex())('order_items')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('order_items.order_id', order.id)
                .select(
                    'order_items.id',
                    'order_items.order_id',
                    'order_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',
                );
            return {
                ...order,
                orderItems
            };
        }));

        return sendJsonResponse(res, true, 200, "Comenzile au fost preluate cu succes!", results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea comenzilor!", { details: error.message });
    }
});

router.get('/getFinishedOrders', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .orWhere('rights.right_code', 2)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const orders = await (await databaseManager.getKnex())('orders')
            .leftJoin('users', 'orders.waiter_id', 'users.id')
            .join('boards', 'orders.board_id', 'boards.id')
            .where('orders.status', 'done')
            .select('orders.*', 'users.name as waiter_name', 'boards.number as board_number');


        if (orders.length === 0) {
            return sendJsonResponse(res, true, 200, "Nu există comenzi.", []);
        }

        const results = await Promise.all(orders.map(async order => {
            const orderItems = await (await databaseManager.getKnex())('order_items')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('order_items.order_id', order.id)
                .select(
                    'order_items.id',
                    'order_items.order_id',
                    'order_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',
                );
            return {
                ...order,
                orderItems
            };
        }));

        return sendJsonResponse(res, true, 200, "Comenzile au fost preluate cu succes!", results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea comenzilor!", { details: error.message });
    }
});


export default router;
