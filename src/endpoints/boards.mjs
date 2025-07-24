import { Router } from "express";
import db from "../utils/database.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import { userAuthMiddleware } from "../utils/middlewares/userAuthMiddleware.mjs";

const router = Router();

// Adaugă o masa
router.post('/addBoard', userAuthMiddleware, async (req, res) => {

    try {
        const { number } = req.body;
        const userId = req.user?.id;

        if (!number) {
            return sendJsonResponse(res, false, 400, "Numarul mesei este obligatoriu!", []);
        }

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .orWhere('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const [id] = await (await databaseManager.getKnex())('boards').insert({ number, waiter_id: userId });

        const board = await (await databaseManager.getKnex())('boards').where({ id }).first();
        return sendJsonResponse(res, true, 201, "Masa a fost adăugată cu succes!", { board });
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la adăugarea mesei!", { details: error.message });
    }
});

// Actualizează o prăjitură
router.put('/updateBoardStatus/:boardId', userAuthMiddleware, async (req, res) => {

    try {

        const { boardId } = req.params;
        const { status } = req.body;


        const userId = req.user?.id;

        if (!status) {
            return sendJsonResponse(res, false, 400, "Statusul este obligatoriu!", []);
        }

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const board = await (await databaseManager.getKnex())('boards').where({ id: boardId }).first();

        if (!board) return sendJsonResponse(res, false, 404, "Masa nu există!", []);

        const updateData = {
            status: status || board.status,
        }


        const updated = await (await databaseManager.getKnex())('boards').where({ id: boardId }).update(updateData);


        if (!updated) return sendJsonResponse(res, false, 404, "Masa nu a fost actualizată!", []);

        return sendJsonResponse(res, true, 200, "Masa a fost actualizată cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la actualizarea mesei!", { details: error.message });
    }
});

// Șterge o prăjitură
router.delete('/deleteBoard/:boardId', userAuthMiddleware, async (req, res) => {

    try {

        const { boardId } = req.params;

        const userId = req.user?.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const board = await (await databaseManager.getKnex())('boards').where({ id: boardId }).first();
        if (!board) return sendJsonResponse(res, false, 404, "Masa nu există!", []);
        await (await databaseManager.getKnex())('boards').where({ id: boardId }).del();


        return sendJsonResponse(res, true, 200, "Masa a fost ștearsă cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la ștergerea mesei!", { details: error.message });
    }
});


router.get('/getBoards', userAuthMiddleware, async (req, res) => {
    try {


        const boards = await (await databaseManager.getKnex())('boards')
            .join('users', 'boards.waiter_id', 'users.id')
            .select(
                'boards.id',
                'boards.number',
                'boards.status',
                'users.name',
                'boards.created_at',
                'boards.order_id',
            )

        const results = await Promise.all(boards.map(async board => {
            const boardItems = await (await databaseManager.getKnex())('boards')
                .join('board_items', 'boards.id', 'board_items.board_id')
                .join('products', 'board_items.product_id', 'products.id')
                .where('boards.id', board.id)
                .select(
                    'board_items.id',
                    'board_items.board_id',
                    'board_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',
                );
            return {
                ...board,
                boardItems
            };
        }));


        if (results.length === 0) {
            return sendJsonResponse(res, false, 404, 'Nu există mese!', []);
        }
        return sendJsonResponse(res, true, 200, 'Mese a fost găsite!', results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, 'Eroare la preluarea meselor!', { details: error.message });
    }
});

router.get('/getBoardsByWaiterId', userAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user?.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('user_rights.user_id', userId)
            .where('rights.right_code', 1)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }
        const boards = await db('boards')
            .join('users', 'boards.waiter_id', 'users.id')
            .join('user_rights', 'users.id', 'user_rights.user_id')
            .where('users.id', req.user.id)
            .select(
                'boards.id',
                'boards.number',
                'boards.status',
                'users.name',
                'boards.created_at',
                'boards.order_id',
            )

        const results = await Promise.all(boards.map(async board => {
            const boardItems = await (await databaseManager.getKnex())('boards')
                .join('board_items', 'boards.id', 'board_items.board_id')
                .join('products', 'board_items.product_id', 'products.id')
                .where('boards.id', board.id)
                .select(
                    'board_items.board_id',
                    'board_items.product_id',
                    'products.name',
                    'products.price',
                    'products.image',
                    'products.quantity',

                );
            return {
                ...board,
                boardItems
            };
        }));


        if (results.length === 0) {
            return sendJsonResponse(res, false, 404, 'Nu există mese!', []);
        }
        return sendJsonResponse(res, true, 200, 'Mese a fost găsite!', results);
    } catch (error) {
        return sendJsonResponse(res, false, 500, 'Eroare la preluarea meselor!', { details: error.message });
    }
});

router.post('/addProductToBoard', userAuthMiddleware, async (req, res) => {

    try {

        const { board_id, product_id } = req.body;
        const userId = req.user.id;



        if (!board_id || !product_id) {
            return sendJsonResponse(res, false, 400, "Masa si produsul sunt obligatorii!", []);
        }

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }



        const product = await (await databaseManager.getKnex())('board_items').where({ board_id, product_id }).first();

        console.log('product', product);

        // if (product) {
        //     return sendJsonResponse(res, false, 400, "Produsul există deja in comanda!", []);
        // }

        const [id] = await (await databaseManager.getKnex())('board_items').insert({
            board_id, product_id, waiter_id: userId
        });

        // const item = await db('board_items').where({ board_id: board_id }).first();
        // console.log('item', item);
        // if (item) {
        //     await db('boards').where({ id: board_id }).update({ status: 'reserved' });

        // }

        const board = await (await databaseManager.getKnex())('boards').where({ id: board_id }).where('status', 'free').first();

        // if (item) {
        //     await db('boards').where({ id: board_id }).update({ status: 'reserved' });

        // }

        if (board) {
            const [id] = await (await databaseManager.getKnex())('orders').insert({ board_id: board_id, waiter_id: userId });
            await (await databaseManager.getKnex())('boards').update({ order_id: id }).where({ id: board_id });
            await (await databaseManager.getKnex())('order_items').insert({
                order_id: id,
                product_id,
            });
            await (await databaseManager.getKnex())('boards').where({ id: board_id }).update({ status: 'reserved' });
        } else {

            const board = await (await databaseManager.getKnex())('boards').where({ id: board_id }).first();
            await db('order_items').insert({
                order_id: board.order_id,
                product_id,
            });
        }


        const boardItem = await (await databaseManager.getKnex())('board_items').where({ id }).first();
        return sendJsonResponse(res, true, 201, "Produsul a fost adăugat cu succes!", { boardItem });
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la adăugarea produsului!", { details: error.message });
    }
});

router.delete('/deleteProductFromBoard/:productId/:boardId', userAuthMiddleware, async (req, res) => {

    try {

        const { productId, boardId } = req.params;


        console.log('productId', productId);
        console.log('boardId', boardId);

        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }


        const boardItem = await (await databaseManager.getKnex())('board_items').where({ product_id: productId, board_id: boardId }).first();
        console.log('Rezultat:', boardItem);

        if (!boardItem) return sendJsonResponse(res, false, 404, "Produsul nu există!", []);
        await (await databaseManager.getKnex())('board_items').where({ product_id: productId, board_id: boardId }).del();


        const order = await (await databaseManager.getKnex())('orders').where({ board_id: boardId }).first();
        const orderId = order ? order.id : null;

        if (orderId) {
            await (await databaseManager.getKnex())('order_items').where({ order_id: orderId, product_id: productId }).del();
        }
        // if (!order) return sendJsonResponse(res, false, 404, "Comanda nu există!", []);
        // await db('orders').where({ board_id: boardId }).del();

        const item = await (await databaseManager.getKnex())('board_items').where({ board_id: boardId }).first();
        if (!item) {
            await (await databaseManager.getKnex())('boards').where({ id: boardId }).update({ status: 'free', order_id: null });
            await (await databaseManager.getKnex())('orders').where({ board_id: boardId }).del();

        }


        return sendJsonResponse(res, true, 200, "Produsul a fost șters cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la ștergerea produsului!", { details: error.message });
    }
});

router.get('/getProductsByBoardId/:boardId', userAuthMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        const { boardId } = req.params;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const boardItems = await (await databaseManager.getKnex())('board_items')
            .join('boards', 'board_items.board_id', 'boards.id')
            .join('users', 'board_items.waiter_id', 'users.id')
            .join('products', 'board_items.product_id', 'products.id')
            .where('board_items.board_id', boardId)
            .select(
                'board_items.product_id',
                'board_items.board_id',
                'boards.number as board_number',
                'boards.created_at',
                'products.name',
                'products.price',
                'products.quantity',
            )

        console.log('boardItems', boardItems);


        if (!boardItems) {
            return sendJsonResponse(res, false, 404, 'Produsele nu există!', []);
        }
        return sendJsonResponse(res, true, 200, 'Produsele au fost gasite!', boardItems);
    } catch (error) {
        return sendJsonResponse(res, false, 500, 'Eroare la preluarea produselor!', { details: error.message });
    }
});

export default router; 