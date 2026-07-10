const mongoose = require('mongoose');

const maskURI = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  console.log(`🔌 Attempting to connect to MongoDB with URI: ${maskURI(uri)}`);

  try {
    // Mongoose 8.x recommended connection options (no deprecated options)
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/codfusion');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error! Details below:`);
    console.error(`- Name: ${error.name}`);
    console.error(`- Message: ${error.message}`);
    if (error.code) console.error(`- Code: ${error.code}`);
    if (error.reason) console.error(`- Reason: ${JSON.stringify(error.reason)}`);
    console.error(`- Stack Trace: ${error.stack}`);

    // Custom diagnostic checks
    if (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('ECONNREFUSED')) {
      console.error(`\n⚠️  DIAGNOSTIC HINT:`);
      console.error(`This error indicates a connection or DNS resolution refusal. The most common causes are:`);
      console.error(`1. Outbound port 27017 is blocked by your local network, ISP, or firewall/antivirus.`);
      console.error(`2. DNS SRV records cannot be resolved by your configured DNS server.`);
      console.error(`3. Your current public IP is not whitelisted in the MongoDB Atlas Network Access rules.`);
    }
    throw error;
  }
};

module.exports = connectDB;
