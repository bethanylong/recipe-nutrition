import React from 'react';
import './App.css';

const Nutrition = ({ nutrients, ing_definitions }) => {
    const order = [
        "Calories",
        "Fat",
        "Protein",
        "Sodium",
        "Calcium",
        "Iron",
        "Potassium",
        "Vitamin A",
        "Vitamin C"
    ];
    let insignificant = [];
    let elements = [];

    for (let nutrient of order) {
        if (!nutrients.hasOwnProperty(nutrient)) {
            insignificant.push(nutrient);
            continue;
        }
        const amount = Math.round(nutrients[nutrient].quantity * 10) / 10;
        const units = nutrients[nutrient].units;

        let prettyAmount = amount + " " + units;
        if (units === "%DV") prettyAmount = amount + "%";
        if (units === null) prettyAmount = amount;

        const key1 = nutrient;
        const key2 = nutrient + "-amount";
        elements.push(<div key={key1}>{nutrient}</div>);
        elements.push(<div key={key2}>{prettyAmount}</div>);
    }

    let insigElem = <span />;
    if (insignificant.length) insigElem = <p>Not a significant source of {insignificant.join(", ")}</p>;

    return <div>
        <div className="nutrition">{elements}</div>
        {insigElem}
    </div>;
}

const RecipeIngredient = ({ name, quantity, units, hasNutrition }) => {
    //return <li>{name} {quantity} {units}</li>;
    let nameClasses = "ingredients-name";
    if (!hasNutrition) nameClasses += " ingredients-name-no-nutrition-info";
    return (
        <>
            <div className="ingredients-amount">{quantity} {units}</div>
            <div className={nameClasses}>{name}</div>
        </>
    );
}

const Recipe = ({ name, ing_quantities, ing_definitions }) => {
    let ingredients = [];
    let nutrients = {};
    for (let ing_name in ing_quantities) {
        const ing_amount = ing_quantities[ing_name];

        let hasNutrition = false;
        if (ing_definitions.hasOwnProperty(ing_name)) {
            // Scale ing_definitions.ing_name.(amount and nutrients) by ing_amount.(quanity and units)
            // TODO
            // XXX assume everything of the same type has the same units
            const def = ing_definitions[ing_name]
            const scaleFactor = ing_amount.quantity / def.amount.quantity;
            for (let nutrient in def.nutrients) {
                if (!nutrients.hasOwnProperty(nutrient)) {
                    nutrients[nutrient] = {"quantity": 0, "units": def.nutrients[nutrient].units};
                }
                nutrients[nutrient].quantity += def.nutrients[nutrient].quantity * scaleFactor;
                hasNutrition = true;
            }
        }

        ingredients.push(<RecipeIngredient key={ing_name} name={ing_name}
            quantity={ing_amount.quantity} units={ing_amount.units}
            hasNutrition={hasNutrition}/>);
    }
    return (
        <div>
            <h2>{name}</h2>
            <div className="recipe">
                <div className="ingredients-list">{ingredients}</div>
                <Nutrition nutrients={nutrients} ing_definitions={ing_definitions} />
            </div>
        </div>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ingredients: {},
            recipes: {}
        };
    }

    componentDidMount() {
        fetch('ingredients.json')
            .then(response => response.json())
            .then(json => this.setState({'ingredients': json}));
        fetch('recipes.json')
            .then(response => response.json())
            .then(json => this.setState({'recipes': json}));
    }

    render() {
        let recipes = [];
        for (const [name, obj] of Object.entries(this.state.recipes)) {
            recipes.push(<Recipe key={name} name={name} ing_quantities={obj.ingredients} ing_definitions={this.state.ingredients} />);
        }
        return (
            <div className="App">
                <h1>Backpacking Recipes</h1>
                <p>Ingredients in <span className="ingredients-name-no-nutrition-info">red</span> are not included in the nutrition calculation because I haven't put them in the JSON yet.</p>
                {recipes}
            </div>
        );
    }
}

export default App;
