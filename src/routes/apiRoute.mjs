import { Router } from "express";
import users from '../endpoints/users.mjs'
import rights from '../endpoints/rights.mjs'
import boards from '../endpoints/boards.mjs'
import orders from '../endpoints/orders.mjs'
import products from '../endpoints/products.mjs'
const router = Router();

router.use('/users/', users)
router.use('/rights/', rights)
router.use('/boards/', boards)
router.use('/orders/', orders)
router.use('/products/', products)

export default router;