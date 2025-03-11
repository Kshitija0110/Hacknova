const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://lokeshdeshmukh34:5WL9kTOq5af4YorQ@cluster0.cfctc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();
