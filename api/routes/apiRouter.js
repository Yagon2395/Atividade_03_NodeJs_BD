const express = require('express')
const routerAPI = express.Router()


routerAPI.use(express.urlencoded({ extended: true })) // processar o body
routerAPI.use(express.json()) // processa o body em formato json

const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

// Obter a lista de produtos 
routerAPI.get('/produtos', (req, res, next) => {
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
routerAPI.get('/produtos/:id', (req, res, next) => {
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
routerAPI.post('/produtos', (req, res, next) => {
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
routerAPI.put('/produtos/:id', (req, res, next) => {
    console.log(req.body)
    let id = parseInt(req.params.id)
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Produto deve ser passado no corpo da requisição para atualização' })
    }
    else if (id === 0) {
        res.status(400).json({ message: 'id deve ser maior que 0' })
    }  
    else {
        knex.where({id: id})
            .update({descricao: req.body.descricao, valor: req.body.valor, marca: req.body.marca})
            .table('produto')
            .then(data => {
                console.log(data)
                res.status(!!data?200:404).json({
                    message: !!data?'Produto atualizado com sucesso' : 'Produto não encontrado',
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
routerAPI.delete('/produtos/:id', (req, res, next) => {
    console.log(req.body)
    let id = parseInt(req.params.id)
    if (id === 0) {
        res.status(400).json({ message: 'id deve ser maior que 0' })
    }  
    else {
        knex.where({id: id})
            .delete()
            .table('produto')
            .then(data => {
                console.log(data)
                res.status(!!data?200:404).json({
                    message: !!data?'Produto excluído com sucesso' : 'Produto não encontrado',
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