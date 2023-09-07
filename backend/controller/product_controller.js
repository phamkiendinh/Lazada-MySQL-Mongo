const client = require('../database/mongoDB.js');
const db = require('../database/mySQL.js');

async function getAllProduct(req, res) {
    const json = req.body;
    const query = `SELECT * from product_template`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            // console.log(response);
            res.send(response);
            return;
        }
    });
}

async function getAllProductCategory(req,res) {
    const query = `SELECT DISTINCT category from product_template`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            // console.log(response);
            res.send(response);
            return;
        }
    });
}

async function countProducts(req, res) {
    const templateID = req.params.templateID;
    const query = `
    SELECT COUNT(product.id) AS count 
    from product 
    WHERE product.template_id = ? AND product.wid IS NOT NULL AND product.oid IS NULL;`;
    db.query(query, [templateID], async (err, response) => {
        if (err) {
            console.log(err);

            res.send({status:400});
        }
        else {
            // console.log(response);
            res.send(response);
            return;
        }
    });
}

async function orderProduct(req, res) {
    const product_template_id = req.body.product_template_id;
    const customer_id = req.body.customer_id;
    const product_quantity = req.body.product_quantity;
    console.log(req.body);

    const query = `CALL order_product(?,?,?)`;
    db.query(query,[product_template_id, customer_id, product_quantity], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            console.log(response[0]);
            res.send(response[0]);
            return;
        }
    });
    // res.send({status: 200});
}

async function finishOrder(req, res) {
    const order_status = req.body.order_status;
    const product_order_id = req.body.product_order_id;

    // console.log(req.body);
    const query = `
        UPDATE product_order
        SET product_order.order_status = ?
        WHERE product_order.id = ?
    `;

    db.query(query, [order_status, product_order_id], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            console.log(response);
            // await cleanOrder();
            res.send(response);
            return;
        }
    });

    // res.json({status: 200});
}

async function cleanOrder() {
    const query = `CALL clean_up_order()`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(response);
            return;
        }
    });
}

// order_product(1,1,2)
// accept_order
// reject_order




module.exports = {
    getAllProduct,
    countProducts,
    orderProduct,
    finishOrder,
    getAllProductCategory
}

