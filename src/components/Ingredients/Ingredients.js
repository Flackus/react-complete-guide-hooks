import React, { useReducer, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const BASE_URL = 'https://react-hooks-8434a-default-rtdb.firebaseio.com';

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case 'SET':
            return action.ingredients;
        case 'ADD':
            return [
                ...currentIngredients,
                action.ingredient
            ];
        case 'DELETE':
            return currentIngredients.filter((ingredient) => {
                return ingredient.id !== action.id;
            });
        default:
            throw new Error("Should be unreachable");
    }
};

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...httpState, loading: false };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...httpState, error: null };
        default:
            throw new Error("Should be unreachable");
    }
};

function Ingredients() {
    const [ingredients, dispatch] = useReducer(ingredientReducer, []);
    const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });

    const addIngredientHandler = (ingredient) => {
        dispatchHttp({ type: 'SEND' });
        fetch(`${BASE_URL}/ingredients.json`, {
                method: 'POST',
                body: JSON.stringify(ingredient),
                headers: { 'Content-Type': 'application/json' }
            })
            .then((response) => response.json())
            .then((responseData) => {
                dispatchHttp({ type: 'RESPONSE' });
                dispatch({
                    type: 'ADD',
                    ingredient: {
                        id: responseData.id,
                        ...ingredient
                    }
                });
            })
            .catch((error) => {
                dispatchHttp({ type: 'ERROR', errorMessage: error.message });
            });
    };

    const removeIngredientHandler = (ingredientId) => {
        dispatchHttp({ type: 'SEND' });
        fetch(`${BASE_URL}/ingredients/${ingredientId}.json`, { method: 'DELETE' })
            .then(() => {
                dispatchHttp({ type: 'RESPONSE' });
                dispatch({
                    type: 'DELETE',
                    id: ingredientId
                });
            })
            .catch((error) => {
                dispatchHttp({ type: 'ERROR', errorMessage: error.message });
            });
    };

    const filteredIngredientsHandler = useCallback((filtered) => {
        dispatch({
            type: 'SET',
            ingredients: filtered
        });
    }, []);

    const clearLoadError = () => {
        dispatchHttp({ type: 'CLEAR' });
    };

    return (
        <div className="App">
            {httpState.error && <ErrorModal onClose={clearLoadError}>{httpState.error}</ErrorModal>}
            <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />
            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
            </section>
        </div>
    );
}

export default Ingredients;
