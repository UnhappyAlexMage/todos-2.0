import express from 'express';
import { config } from 'dotenv';
import 'dotenv/config'

import { connectToDB } from './source/models/__loaddatabase.js';
import router from './source/router.js';

//config();

const port = process.env.PORT;

const app = express();

app.locals.appTitle = process.env.APPTITLE || 'Backend express';

// app.set('view engine', 'ejs');
// app.set('views', './source/templates');

(async () => {
    await connectToDB();
    app.use('/', router);
    app.listen(port);
})();