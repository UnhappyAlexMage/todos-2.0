import { getList, getItem, addItem, setDoneItem, deleteItem, getMostAcriveUsers } from '../models/todos.js';
import createError from 'http-errors';

import { addendUploader } from '../uploaders.js';

import { join } from "node:path";
import { rm } from 'node:fs/promises';
import { currentDir } from '../utility.js';

export async function mainPage(req, res) {
        let list = await getList(req.user.id, req.cookies.doneAtLast, req.query.search);

        if(req.cookies.doneAtLast === '1') {
                list = [...list];
                list.sort((el1, el2) => {
                        const date1 = new Date(el1.createdAt);
                        const date2 = new Date(el2.createdAt);
                        const done1 = el1.done|| false;
                        const done2 = el2.done|| false;
                        const doneDiff = done1 - done2;
                        if(doneDiff != 0)
                                return doneDiff;
                        else
                                return date1 - date2;
                });
        };

        if (req.query.search) {
                const q = req.query.search.toLowerCase();
                list = list.filter((el) => {
                        if (el.title.toLowerCase().includes(q))
                                return true;
                        else
                                if(el.desc)
                                        return el.desc.toLowerCase().includes(q);
                                else
                                        return false;
                });
        };

        res.json({ todos: list });
};

export async function detailPage(req, res, next) {
        try { 
                const t = await getItem(req.params.id, req.user.id);
                if(!t) {
                        throw createError(404, 'Запрошнное дело не существует');
                }

                res.json({ todo: t.toJSON() });
        } catch (err) {
                next(err);
        };

};

export function addPage(req, res) {
        res.render('add', { title: 'Добавление дела!'});
};

export async function add(req, res) {
        const todo = {
                title: req.body.title,
                desc: req.body.desc || '',
                user: req.user.id
        };
        if(req.file)
                todo.addendum = req.file.filename;
        await addItem(todo);
        res.status(201);
        res.end();
};

export async function setDone(req, res, next) {
        try {
                if (await setDoneItem(req.params.id, req.user.id)) {
                        res.status(202);
                        res.end();
                }
                else
                        throw createError(404, 'Запрошнное дело не существует');
        } catch (err) {
                next(err);
        }
};

export async function remove(req, res, next) {
        try {
                const t = deleteItem(req.params.id, req.user.id);
                if (!t)
                        throw createError(404, 'Запрошенного дела не сущевствует');
                if(t.addendum)
                        await rm(join(currentDir, 'storage', 'uploaded', t.addendum));
                res.status(204);
                res.end();
        } catch(err) {
                next(err);
        }
};

export function setOrder(req, res) {
        res.cookie('doneAtLast', req.body.done_at_last);
        res.redirect('/');
};

export function addendumWrapper(req, res, next) {
        addendUploader(req, res, (err) => {
                if(err)
                        if(err.code == 'LIMIT_FILE_SIZE') {
                                req.errorObj = {
                                        addendum: {
                                                msg: 'Допускаются лишь файлы размером' + ' не более 100 Кбайт'
                                        }
                                };
                                next();
                        }else
                                next(err);
                else
                        next();
        });
};

export async function mostActiveUsers(req, res) {
        const r = await getMostAcriveUsers();
        res.json({
                mostActiveAll: r[0],
                mostActiveDone: r[1]
        })
};