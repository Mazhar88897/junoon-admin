import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://mak:mak@cluster0.wm2v9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

if (!MONGODB_URI) {
   console.log("cannot connet") 
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

async function dbConnect() {
  console.log("connecting")  
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
