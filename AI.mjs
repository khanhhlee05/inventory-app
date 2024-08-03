import { GoogleGenerativeAI } from "@google/generative-ai";
//import fs from "fs";
import 'dotenv/config';

// Initialize the Google Generative AI client with your API key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/* async function run() {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const result = await model.generateContent([
"Describe the picture below in 1 to 2 words",
{inlineData: {data: Buffer.from(fs.readFileSync('./images/stephen-curry-dribble.jpg')).toString("base64"),
mimeType: 'image/png'}}]
);
console.log(result.response.text());
}

// Call the run function to start the process.
run(); */

export async function imageDetect(image) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent([
    "Describe the picture below in 1 to 2 words, just 2 words no extra dots, chars,..",
    {inlineData: {data: base64Data,
    mimeType: 'image/jpeg'}}]
    );
   return result.response.text();
    }

    export async function generateRecipe(ingredients) {
        // Ensure ingredients is an array
        console.log(ingredients)
        if (!Array.isArray(ingredients)) {
          throw new Error("Ingredients should be an array");
        }
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const ingredientsList = ingredients.join(', ');
        const prompt = `Create a recipe using the following ingredients: ${ingredientsList}. Please provide a step-by-step cooking guide. Make the recipe short and concise`;
      
        const result = await model.generateContent([prompt]);
        
        return result.response.text();
      }