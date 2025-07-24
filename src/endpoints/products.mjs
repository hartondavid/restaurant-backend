import { Router } from "express";
import databaseManager from "../utils/database.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import { userAuthMiddleware } from "../utils/middlewares/userAuthMiddleware.mjs";
import createMulter from "../utils/uploadUtils.mjs";
import { smartUpload, deleteFromBlob } from "../utils/uploadUtils.mjs";

const upload = createMulter('public/uploads/products', ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']);


const router = Router();

// Adaugă un produs nou
router.post('/addProduct', userAuthMiddleware, upload.fields([{ name: 'image' }]), async (req, res) => {
    try {

        const { name, description, price, quantity } = req.body;

        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }


        if (!req.files || !req.files['image']) {
            return sendJsonResponse(res, false, 400, "Image is required", null);
        }

        console.log('🔍 File upload info:', {
            hasFiles: !!req.files,
            imageField: !!req.files['image'],
            imageArray: req.files['image'] ? req.files['image'].length : 0,
            firstImage: req.files['image'] ? {
                fieldname: req.files['image'][0].fieldname,
                originalname: req.files['image'][0].originalname,
                mimetype: req.files['image'][0].mimetype,
                size: req.files['image'][0].size,
                path: req.files['image'][0].path,
                buffer: !!req.files['image'][0].buffer
            } : null
        });

        const photoUrl = await smartUpload(req.files['image'][0], 'restaurant-food');
        const result = await (await databaseManager.getKnex())('products').insert({ name, image: photoUrl, description, price, quantity, manager_id: userId });

        // Handle different database return formats
        const id = Array.isArray(result) ? result[0] : result;
        const product = await (await databaseManager.getKnex())('products').where({ id }).first();
        return sendJsonResponse(res, true, 201, "Produsul a fost adăugat cu succes!", product);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la adăugarea produsului!", { details: error.message });
    }
});


router.get('/getProducts', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const products = await (await databaseManager.getKnex())('products')
            .leftJoin('users', 'products.manager_id', 'users.id')
            .where('products.manager_id', userId)
            .select('products.*', 'users.name as manager_name');


        if (products.length === 0) {
            return sendJsonResponse(res, true, 200, "Nu există produse pentru acest manager.", []);
        }

        return sendJsonResponse(res, true, 200, "Produsele au fost preluate cu succes!", products);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea produselor!", { details: error.message });
    }
});

// Actualizează un produs
router.put('/updateProduct/:productId', userAuthMiddleware, upload.fields([{ name: 'image' }]), async (req, res) => {

    try {

        const { productId } = req.params;
        const { name, description, price, quantity } = req.body;
        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }


        const product = await (await databaseManager.getKnex())('products').where({ id: productId }).first();

        if (!product) return sendJsonResponse(res, false, 404, "Produsul nu există!", []);

        const updateData = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            quantity: quantity || product.quantity,
            image: product.image
        };


        if (req.files && req.files['image'] && req.files['image'][0]) {
            // Use smart upload function that automatically chooses storage method
            const photoUrl = await smartUpload(req.files['image'][0], 'restaurant-food');

            updateData.image = photoUrl;
        }

        await (await databaseManager.getKnex())('products').where({ id: productId }).update(updateData);

        const updated = await (await databaseManager.getKnex())('products').where({ id: productId }).first();
        return sendJsonResponse(res, true, 200, "Produsul a fost actualizat cu succes!", { product: updated });
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la actualizarea produsului!", { details: error.message });
    }
});

router.delete('/deleteProduct/:productId', userAuthMiddleware, async (req, res) => {

    try {

        const { productId } = req.params;

        const userId = req.user.id;


        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const product = await (await databaseManager.getKnex())('products').where({ id: productId }).first();
        if (!product) return sendJsonResponse(res, false, 404, "Produsul nu există!", []);

        // Delete the image from Vercel Blob if it's a Blob URL
        if (product.image) {

            await deleteFromBlob(product.image);
        }

        await (await databaseManager.getKnex())('products').where({ id: productId }).del();

        return sendJsonResponse(res, true, 200, "Produsul a fost șters cu succes!", []);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la ștergerea produsului!", { details: error.message });
    }
});

// router.get('/getProductsForBoard/:boardId', userAuthMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const { boardId } = req.params;

//         const userRights = await (await databaseManager.getKnex())('user_rights')
//             .join('rights', 'user_rights.right_id', 'rights.id')
//             .where('rights.right_code', 3)
//             .where('user_rights.user_id', userId)
//             .first();

//         if (!userRights) {
//             return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
//         }

//         const products = await (await databaseManager.getKnex())('products')
//             .leftJoin('users', 'products.manager_id', 'users.id')
//             .where('products.manager_id', userId)
//             .whereNotIn('boards.id', databaseManager('orders').where('orders.board_id', boardId))
//             .select('products.*');


//         if (products.length === 0) {
//             return sendJsonResponse(res, true, 200, "Nu există produse pentru acest manager.", []);
//         }

//         return sendJsonResponse(res, true, 200, "Produsele au fost preluate cu succes!", products);
//     } catch (error) {
//         return sendJsonResponse(res, false, 500, "Eroare la preluarea produselor!", { details: error.message });
//     }
// });


router.get('/searchProduct', userAuthMiddleware, async (req, res) => {


    try {

        const { searchField } = req.query;

        if (!searchField) {
            return sendJsonResponse(res, false, 400, 'Search field is required', null);
        }


        const userId = req.user.id;


        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 1)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }


        // Query the database to search for employees where name contains the searchField
        const products = await (await databaseManager.getKnex())('products')
            .where(function () {
                this.where('products.name', 'like', `%${searchField}%`)
                    .orWhere('products.description', 'like', `%${searchField}%`)
                    .orWhere('products.price', 'like', `%${searchField}%`)
                    .orWhere('products.quantity', 'like', `%${searchField}%`)
            })
            // .join('orders', 'products.id', 'orders.product_id')
            // .whereNotIn('products.id', (await databaseManager.getKnex())('orders').where('orders.board_id', boardId))
            .select('products.*');


        if (products.length === 0) {
            return sendJsonResponse(res, false, 404, 'Nu există produse!', []);
        }

        // Attach the employees to the request object for the next middleware or route handler
        return sendJsonResponse(res, true, 200, 'Produsele au fost găsiți!', products);
    } catch (err) {
        console.error(err);
        return sendJsonResponse(res, false, 500, 'An error occurred while retrieving products', null);
    }
})

router.get('/getProduct/:productId', userAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const product = await (await databaseManager.getKnex())('products')
            .where('products.id', productId)
            .select('products.*').first();

        console.log('product', product);


        if (!product) {
            return sendJsonResponse(res, true, 200, "Nu există produsul.", []);
        }

        return sendJsonResponse(res, true, 200, "Produsul a fost preluat cu succes!", product);
    } catch (error) {
        return sendJsonResponse(res, false, 500, "Eroare la preluarea produsului!", { details: error.message });
    }
});


router.get('/getPaymentsByMonth', userAuthMiddleware, async (req, res) => {
    try {


        const userId = req.user.id;

        const userRights = await (await databaseManager.getKnex())('user_rights')
            .join('rights', 'user_rights.right_id', 'rights.id')
            .where('rights.right_code', 3)
            .where('user_rights.user_id', userId)
            .first();

        if (!userRights) {
            return sendJsonResponse(res, false, 403, "Nu sunteti autorizat!", []);
        }

        const products = await (await databaseManager.getKnex())('order_items')
            .join('products', 'order_items.product_id', 'products.id')
            .select('order_items.created_at', 'products.price');

        const monthNames = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

        const paymentsByMonth = products.reduce((acc, currentItem) => {

            const foundMonth = new Date(currentItem.created_at).getMonth() + 1;

            let month = acc.find(item => item.month === foundMonth);


            if (!month) {

                acc.push(month = {
                    month: foundMonth,
                    total: 0,
                    month_name: monthNames[foundMonth - 1]
                });
            }
            month.total += currentItem.price;

            return acc;
        }, []);


        return sendJsonResponse(res, true, 200, "Payments fetched successfully", paymentsByMonth);

    } catch (err) {
        return sendJsonResponse(res, false, 500, "Failed to get payments", { details: err.message });
    }
});



export default router;
