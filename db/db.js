import mongoose from 'mongoose'

const ConnectToDb = async () => {
    try {
         const connect = await mongoose.connect(process.env.DB_URL , {
            dbName : 'database'
         })
         console.log('Connected to MongoDB' , connect.connection.host)
    } catch (error) {
        console.log(`connection failed`);
        
        process.exit(1)
    }
}

export default ConnectToDb