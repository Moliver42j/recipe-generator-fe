# DishFromThis - README

## Introduction

Welcome to **DishFromThis**, a recipe generation web application that allows users to input fresh ingredients, pantry staples, spices, and dietary restrictions to generate custom recipes. DishFromThis aims to help users cook delicious meals with the ingredients they already have on hand. Users can also save their favorite recipes and export ingredient lists.

## Features

- **Recipe Generation**: Generate recipes based on fresh ingredients, pantry items, spices, and dietary preferences.
- **Ingredient Management**: Add, edit, and remove fresh ingredients, pantry staples, and spices easily. Supports adding items as comma-separated lists for convenience.
- **Favorites**: Save favorite recipes for future use. Edit and delete your favorite recipes as needed.
- **Export**: Export pantry items, fresh ingredients, spices, and dietary requirements as separate comma-separated lists.
- **Responsive Design**: The site is fully responsive, adapting to both desktop and mobile views.
- **Sidebar Navigation**: Easy access to different sections via a sidebar on desktop or a hamburger menu on mobile.

## Pages

### Home Page
- **Enter Fresh Ingredients**: Input the fresh ingredients you have on hand.
- **Pantry Items**: Tick off pantry staples you'd like to include in the recipe or hide the section to keep things tidy.
- **Generate Recipe**: Submit your ingredients and receive a recipe suggestion based on what you have.
- **Save to Favorites**: Add a recipe to your favorites for easy access later.

### Configuration Page
- **Manage Ingredients**: Add pantry items, spices, or dietary requirements by entering them as comma-separated values. Items will be automatically saved and displayed with checkboxes.
- **Delete and Edit Items**: Remove items or toggle their status for recipe generation.
- **Collapsible Pantry Section**: Hide or show the pantry section for a cleaner interface.

### Favorites Page
- **View Saved Recipes**: Review recipes you’ve marked as favorites.
- **Edit Recipes**: Modify ingredients or instructions for any saved recipe.
- **Delete Recipes**: Remove recipes from your favorites.

### Export Page
- **Export Ingredients**: Export lists of fresh ingredients, pantry items, spices, and dietary requirements as CSV for external use.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repository-url
   cd recipe-generator-fe
   ```

2. **Install Dependancies**
    ```bash
    npm install
    ```

3. **Run the Application**
    ```bash
   npm run dev
   ```

4. **Access the Application**

Open your browser and go to http://localhost:3000. 
    
5. **Build Application**
    ```bash
    npm run build
    ```

## Technologies Used
### Frontend: 
Next.js (React Framework), Tailwind CSS for styling
### Backend: 
API integration for recipe generation
### State Management: 
React Context API for handling ingredients, pantry, and spices
### LocalStorage: 
Persist user data (e.g., ingredients, favorites) between sessions
### Icons: 
Heroicons for icons (Trash, Heart, etc.)

## Usage Instructions
### 1. Add Ingredients:

On the Home or Configuration page, add fresh ingredients or pantry items. You can input multiple items by separating them with commas.
### 2. Generate a Recipe:

After adding ingredients and selecting pantry staples, click the Generate Recipe button. A recipe will be displayed based on your input.
### 3. Favorite a Recipe:

On the recipe display page, click the Add to Favorites button to save a recipe.
### 4. Manage Your Favorites:

Visit the Favorites page to view saved recipes. You can edit or delete any favorite recipe.
### 5. Export Ingredients:

Use the Export page to download your ingredient lists in CSV format for pantry management or shopping lists.
Customization
You can easily customize the colors, styles, and layout by modifying the Tailwind CSS styles defined in globals.css. Additionally, you can adjust the sidebar or mobile menu behavior to suit your design preferences.

## Contact
For any inquiries or contributions, please reach out to matthewoliver88gmail.com.
