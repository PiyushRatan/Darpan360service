const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING, {
            family: 4 // Force IPv4 routing to fix Network DNS errors
        });
        console.log(
            "Database connected:", 
            connect.connection.host, 
            connect.connection.name
        );
    } catch (err) {
        console.error("Database Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDb;
