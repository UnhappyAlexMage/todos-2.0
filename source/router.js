import { Router, urlencoded, static as staticMiddleware } from 'express';

import { mainPage, detailPage, addPage, add, setDone, remove, setOrder, addendumWrapper } from './controllers/todos.js';
import { mainErrorHandler, error500Handler } from './error-handlers.js';
import methodOverride from 'method-override';

import { registerPage, register, loginPage, login, logout } from './controllers/users.js';

import { requestToContext, handleErrors, extendFlashAPI, getErrors, loadCurrentUser, isGuest, isLoggedIn } from './middleware.js';
import { todoV, registerV, loginV } from './validator.js';

import cookieParser from 'cookie-parser';

import session from 'express-session';
import _FileStore from 'session-file-store';
import { flash } from 'express-flash-message';

const router = Router();

router.use(cookieParser());

const FileStore = _FileStore(session);
router.use(session({
    store: new FileStore({
        path: './storage/sessions',
        reapAsync: true,
        reapSyncFallback: true,
        fallbackSessionFn: () => {
            return {};
        },
        logFn: () => {}
    }),
    secret: 'abcdefgh',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

router.use(flash({ sessionKeyName: 'flash-message' }));
router.use(extendFlashAPI);

router.use(loadCurrentUser);

router.use('/uploaded', staticMiddleware('storage/uploaded'));

router.use(staticMiddleware('public'));

router.use(urlencoded({ extended: true, limit: 32}));
router.use(methodOverride('_method'));

router.use(mainErrorHandler, error500Handler);

router.use(requestToContext);

router.get('/register', isGuest, getErrors, registerPage);
router.post('/register', isGuest, registerV, handleErrors, register);

router.get('/login', isGuest, getErrors, loginPage);
router.post('/login', isGuest, loginV, handleErrors, login);

router.use(isLoggedIn);

router.post('/login', logout);

router.get('/add', getErrors, addPage);
router.post('/add', addendumWrapper, todoV, handleErrors, add);
router.get('/:id', detailPage);
router.put('/:id', setDone);
router.delete('/:id', remove);
router.post('/setorder', setOrder);
router.get('/', mainPage);

export default router;