const express = require('express');
const router = require('express-promise-router')();

const { validateBody, schemas } = require('../helpers/routeHelpers');
const UserController = require('../controllers/transactions');

router.route('/sendTokens')
    .post(validateBody(schemas.sendingSchema), UserController.sendTokens);

router.route('/getToken')
    .post(UserController.getToken);

router.route('/tx/all')
    .get(UserController.txAll);

router.route('/tx/hash/:id')
    .get(UserController.txHash);

router.route('/tx/address/:id')
    .get(UserController.txAddress);

module.exports = router;