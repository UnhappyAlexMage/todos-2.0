import { randomBytes } from 'node:crypto';

import { pbkdf2Promisified, signPromisified } from '../utility.js';
import { addUser } from '../models/users.js';

// export function registerPage(req, res) {
//     res.render('register', { title: 'Регистрация' });
// }

export async function register(req, res) {
    const salt = randomBytes(16);
    const hash = await pbkdf2Promisified(req.body.password, salt, 100000, 32, 'sha256');

    const user = {
        username: req.body.username,
        password: hash,
        salt: salt
    };
    await addUser(user);
    res.status(201);
    res.end();
};

// export function loginPage(req, res) {
//     res.render('login', { title: 'Вход' });
// }

export async function login(req, res, next) {
    const secret = process.env.SECRETKEY;
    const token = await signPromisified({ name: req._user.username }, secret);

    res.json({ token: token });
}

export function logout(req, res, next) {
    delete req.session.user;
    req.session.save((err) => {
        if(err)
            next(err);
        else {
            req.session.regenerate((err) => {
                if(err)
                    next(err);
                else
                    res.redirect('/login');
            });
        }
    })
}