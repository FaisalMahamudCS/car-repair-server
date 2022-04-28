const express=require('express');
const cors=require('cors');
const { MongoClient, ServerApiVersion, MongoRuntimeError,ObjectId } = require('mongodb');
require('dotenv').config();
const port=process.env.PORT || 5000;
const jwt=require('jsonwebtoken');

const app=express();

app.use(cors());
app.use(express.json());
//console.log(process.env.ACCESS_TOKEN_SECRET)
function verifyJWT(req,res,next){
const authHeader=req.headers.authorization;
console.log('inside VarifyJWT',authHeader);
if(!authHeader){
    return res.status(401).send({message:'unauthorized'});
}
const token=authHeader.split(' ')[1]
jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    
    if(err){
        return res.status(403).send({message:'forbidden'})
    }
    console.log('decoded',decoded)
    req.decoded=decoded;
})
 









next();
}

//



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5tcjz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
try{
 await client.connect();
 const serviceCollection =client.db('geniusCar').collection('service');
 const orderCollection=client.db('geniusCar').collection('order');
 app.get('/service',async(req,res)=>{
    const query={};
    const cursor=serviceCollection.find(query);
    const services=await cursor.toArray();
    res.send(services);
 });
app.get('/service/:id',async(req,res)=>{
 const id=req.params.id;
 const query={_id:ObjectId(id)} ;  
 const service=await serviceCollection.findOne(query);
 res.send(service);
})

app.post('/login',async(req,res)=>{
const user=req.body;
const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:'1d'
});
res.send({accessToken});
})

app.get('/order',verifyJWT,async(req,res)=>{
const decodedEmail=req.decoded.email;
    const authHeader=req.headers.authorization;
    console.log(authHeader);
    const email=req.query.email;
    if(email=== decodedEmail){
    const query={email:email};
    const cursor = orderCollection.find(query);
    const orders=await cursor.toArray();
    res.send(orders);
    }
    else{
        res.status(403).send({message:'Forbidden Access'});
    }

})

app.post('/service',async(req,res)=>{
    const serviceCollection =client.db('geniusCar').collection('service');
  
    const service=req.body;
    const result=await serviceCollection.insertOne(service);
    
    res.send(result);
    console.log(`user inserted with id:${result.insertedId}`)
})
// app.put('/service/:id',async(req,res)=>{
// const id=req.params.id;
// const updateService=req.body;
// const filter={_id:objectId(id)};
// const options={upsert:true};
// const updatedDoc={
//     $set:{
//         service:updatedUser.service,
//         picture:updatedUser.picture,
//         description:updatedUser.description

//     }
// };
// const result=await userCollection.updateOne(filter,updatedDoc,options);
// res.send(result);
// console.log(result);
// })

app.post('/order',async(req,res)=>{
    const order=req.body;
    const result=await orderCollection.insertOne(order);
    res.send(result);
})

}
finally{

}

}
run().catch(console.dir);
app.get('/',(req,res)=>{
    res.send('Running server');
});
app.listen(port,()=>{
    console.log('listening to port 5000')
})