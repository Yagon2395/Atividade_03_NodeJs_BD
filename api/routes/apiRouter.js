const express = require('express')
const routerAPI = express.Router()
const jwt = require('jsonwebtoken')
const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

routerAPI.use(express.urlencoded({ extended: true })) // processar o body
routerAPI.use(express.json()) // processa o body em formato json


// Checa se possui autenticação
let checkToken = (req, res, next) => {
    let authToken = req.headers["authorization"]
    if (!authToken) {
        res.status(401).json({ message: 'Token de acesso requerida' })
    }
    else {
        let token = authToken.split(' ')[1]
        req.token = token
    }

    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ message: 'Acesso negado' })
            return
        }
        req.usuarioId = decodeToken.id
        next()
    })
}

// Verifica se a autenticação possui perfil ADMIN
let isAdmin = (req, res, next) => {
    knex
        .select('*').from('usuario').where({ id: req.usuarioId })
        .then((usuarios) => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let roles = usuario.roles.split(';')
                let adminRole = roles.find(i => i === 'ADMIN')
                if (adminRole === 'ADMIN') {
                    next()
                    return
                }
                else {
                    res.status(403).json({ message: 'Role de ADMIN requerida' })
                    return
                }
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar roles de usuário - ' + err.message
            })
        })
}

// Obter a lista de produtos 
routerAPI.get('/produtos', checkToken, (req, res, next) => {
    //res.json(lista_produtos)
    knex.select('*').from('produto')
        .then(data => res.status(200).json(data))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

// Obter um produto específico 
routerAPI.get('/produtos/:id', checkToken, (req, res, next) => {
    let id = parseInt(req.params.id)

    knex.select('*')
        .where({ id: id })
        .table('produto')
        .first()
        .then(data => {
            if (data != null) {
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    message: 'Produto não encontrado'
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao buscar o produto de id: ' + id + ' - ' + err.message
            })
        })
})

// Incluir um produto 
routerAPI.post('/produtos', checkToken, isAdmin, (req, res, next) => {
    console.log(req.body)
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Produto deve ser passado no corpo da requisição para o cadastro' })
    } else {
        knex.insert(req.body)
            .returning('id')
            .into('produto')
            .then(data => {
                res.status(200).json({
                    message: 'Produto inserido com sucesso',
                    id: data
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao inserir o produto - ' + err.message
                })
            })
    }
})

// Alterar um produto
routerAPI.put('/produtos/:id', checkToken, isAdmin, (req, res, next) => {
    console.log(req.body)
    let id = parseInt(req.params.id)
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Produto deve ser passado no corpo da requisição para atualização' })
    }
    else if (id === 0) {
        res.status(400).json({ message: 'id deve ser maior que 0' })
    }
    else {
        knex.where({ id: id })
            .update({ descricao: req.body.descricao, valor: req.body.valor, marca: req.body.marca })
            .table('produto')
            .then(data => {
                console.log(data)
                res.status(!!data ? 200 : 404).json({
                    message: !!data ? 'Produto atualizado com sucesso' : 'Produto não encontrado',
                    updatedRows: data
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao atualizar o produto - ' + err.message
                })
            })
    }
})

// Excluir um produto 
routerAPI.delete('/produtos/:id', checkToken, isAdmin, (req, res, next) => {
    console.log(req.body)
    let id = parseInt(req.params.id)
    if (id === 0) {
        res.status(400).json({ message: 'id deve ser maior que 0' })
    }
    else {
        knex.where({ id: id })
            .delete()
            .table('produto')
            .then(data => {
                console.log(data)
                res.status(!!data ? 200 : 404).json({
                    message: !!data ? 'Produto excluído com sucesso' : 'Produto não encontrado',
                    updatedRows: data
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao excluir o produto - ' + err.message
                })
            })
    }
})

module.exports = routerAPI