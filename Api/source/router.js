import { Router, urlencoded, static as staticMiddleware } from 'express';

import cors from 'cors';

import { mainPage, detailPage, add, setDone, remove, addendumWrapper, mostActiveUsers } from './controllers/todos.js';
import { mainErrorHandler, error500Handler } from './error-handlers.js';

import { register, login } from './controllers/users.js';

import { handleErrors, loadCurrentUser, isGuest, isLoggedIn } from './middleware.js';
import { todoV, registerV, loginV } from './validator.js';

// const FileStore = _FileStore(session);

const router = Router();

router.use(cors({
    origin: true,
    credentials: true
}));

router.use('/uploaded', staticMiddleware('storage/uploaded'));

// router.use(staticMiddleware('public'));

router.use(urlencoded({ extended: true }));
// router.use(methodOverride('_method'));
// router.use(cookieParser());

// router.use(session({
//     store: new FileStore({
//         path: './storage/sessions',
//         reapAsync: true,
//         reapSyncFallback: true,
//         fallbackSessionFn: () => {
//             return {};
//         },
//         logFn: () => {}
//     }),
//     secret: 'abcdefgh',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 7 * 24
//     }
// }));

// router.use(flash({ sessionKeyName: 'flash-message' }));
// router.use(extendFlashAPI);
router.use(loadCurrentUser);

// router.use(requestToContext);

// router.get('/register', isGuest, getErrors, registerPage);
router.post('/register', isGuest, registerV, handleErrors, register);

// router.get('/login', isGuest, getErrors, loginPage);
router.post('/login', isGuest, loginV, handleErrors, login);

router.use(isLoggedIn);

// router.post('/logout', logout);

router.get('/mostactive', mostActiveUsers);

// router.get('/add', getErrors, addPage);
router.post('/add', addendumWrapper, todoV, handleErrors, add);
router.get('/:id', detailPage);
router.put('/:id', setDone);
router.delete('/:id', remove);
// router.post('/setorder', setOrder);
router.get('/', mainPage);

router.use(mainErrorHandler, error500Handler);

export default router;