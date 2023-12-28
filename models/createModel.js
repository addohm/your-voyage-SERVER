import mongoose from "mongoose";

// Define a function to create and export models dynamically
const createModel = (modelName, obj) => {
    const schema = new mongoose.Schema({
        // any field
        ...obj
    }, { strict: false, timestamps: true });

    // Use the provided modelName as the model name
    return mongoose.model(modelName, schema);
};

// Export the createModel function
export default createModel;
