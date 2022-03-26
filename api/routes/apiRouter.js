const express = require ('express')
const routerAPI = express.Router()

const lista_produtos = {
    produtos: [
        { id: 1, descricao: "Arroz parboilizado 5Kg", valor: 25.00, marca: "Tio João"  },
        { id: 2, descricao: "Maionese 250gr", valor: 7.20, marca: "Helmans"  },
        { id: 3, descricao: "Iogurte Natural 200ml", valor: 2.50, marca: "Itambé"  },
        { id: 4, descricao: "Batata Maior Palha 300gr", valor: 15.20, marca: "Chipps"  },
        { id: 5, descricao: "Nescau 400gr", valor: 8.00, marca: "Nestlé"  },
    ]
}

const knex = require('knex')({ 
    client: 'pg', 
    debug: true, 
    connection: { 
        connectionString : process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false }, 
      } 
});

routerAPI.get ('/produtos', (req, res, next) => {
    //res.json(lista_produtos)
    knex.select('*').from('produto') 
    .then( produtos => res.status(200).json(produtos) ) 
    .catch(err => { 
        res.status(500).json({  
           message: 'Erro ao recuperar produtos - ' + err.message }) 
    })   
})

routerAPI.get ('/produtos/:id', (req, res, next) => {
    let id = parseInt (req.params.id)
    let idx = lista_produtos.produtos.findIndex (elem => elem.id === id)

    if (idx != -1) {
        res.status(200).json(lista_produtos.produtos[idx])
    }
    else {
        res.status(404).json({ message: 'Produto não encontrado' })
    }    
})

routerAPI.post ('/produtos', (req, res, next) => {
    res.json({ message: 'Recurso não implementado' })
})

routerAPI.put ('/produtos/:id', (req, res, next) => {
    res.json({ message: 'Recurso não implementado' })
})

routerAPI.delete ('/produtos/:id', (req, res, next) => {
    let id = parseInt (req.params.id)
    let idx = lista_produtos.produtos.findIndex (elem => elem.id === id)

    if (idx != -1) {
        lista_produtos.produtos.splice (idx, 1)
        res.status(200).json({ message: 'produto excluido' })
    }
    else {
        res.status(404).json({ message: 'Produto não encontrado' })
    } 
})

module.exports = routerAPI