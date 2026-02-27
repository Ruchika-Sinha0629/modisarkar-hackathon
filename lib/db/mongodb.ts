import mongoose from "mongoose"

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is not defined")
  }
  return uri
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null
  }
}

async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const uri = getMongoUri()
    cached.promise = mongoose.connect(uri, {
      dbName: "operation_sentinel",
      bufferCommands: false
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB