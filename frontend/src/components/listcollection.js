const { MongoClient } = require('mongodb');

// Replace with your MongoDB URI
const uri = "mongodb+srv://lokeshdeshmukh34:5WL9kTOq5af4YorQ@cluster0.cfctc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function listDatabasesAndCollections() {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log("Connected to MongoDB!");

        // List all databases
        const databases = await client.db().admin().listDatabases();
        console.log("\nDatabases:");
        for (const db of databases.databases) {
            console.log(`  - ${db.name}`);
            
            // List collections in each database
            const collections = await client.db(db.name).listCollections().toArray();
            console.log(`Collections in database '${db.name}':`);
            collections.forEach(collection => console.log(`  - ${collection.name}`));
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        // Close the connection
        await client.close();
        console.log("\nConnection closed.");
    }
}

// Call the function
listDatabasesAndCollections();
