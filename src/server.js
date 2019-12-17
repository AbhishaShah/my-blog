import express from "express"
import bodyParser from "body-parser"
import {MongoClient} from "mongodb"
import path from 'path'

const app = express()

app.use(express.static(path.join(__dirname,'/build')))
app.use(bodyParser.json())
const dbURL = 'mongodb://localhost:27017/'

const setDB = async (operations) => {
 try{
        const client = await MongoClient.connect(dbURL,{useUnifiedTopology:true})
        const db = client.db('my-blog')
       
        await operations(db)

        client.close()

    } catch(error){
        res.status(500).json({message:'Error connecting to database', error})
    }
}

app.get('/api/article/:name',async (req,res)=>{
    setDB(async (db)=>{

        const articleName = req.params.name
        const articleInfo = await db.collection('articles').findOne({name:articleName})
        res.status(200).json(articleInfo)
    })
      
})



app.post('/api/article/:name/upvote', async (req , res)=>{
    setDB(async(db)=>{

        const articleName = req.params.name

        const articleInfo = await db.collection('articles').findOne({name:articleName})
        await db.collection('articles').updateOne({name:articleName},{
            '$set': {
                upvotes:articleInfo.upvotes + 1
            }
        })

        res.status(200).json(articleInfo)
    })      

})

app.post('/api/article/:name/addcomment',async (req,res)=>{
    setDB(async(db)=>{

        const {username,comments} = req.body
        const articleName = req.params.name
       
        const articleInfo = await db.collection('articles').findOne({name:articleName})
        await db.collection('articles').updateOne({name:articleName},{
            '$set':{
                comments:articleInfo.comments.concat({username,comments})
            }
        })

        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName})
        res.status(200).json(updatedArticleInfo)
    })  

})

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname + '/build/index.html'))
})
app.listen(8000,()=>console.log("server listening"))