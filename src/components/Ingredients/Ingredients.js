import React, { useReducer, useCallback, useMemo, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

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

function Ingredients() {
    const [ingredients, dispatch] = useReducer(ingredientReducer, []);
    const { loading, error, data, sendRequest, reqExtra, identifier, clear } = useHttp();

    useEffect(() => {
        if (loading || error) {
            return;
        }
        if (identifier === 'REMOVE_INGREDIENT') {
            dispatch({
                type: 'DELETE',
                id: reqExtra
            });
        } else if (identifier === 'ADD_INGREDIENT') {
            dispatch({
                type: 'ADD',
                ingredient: {
                    id: data.name,
                    ...reqExtra
                }
            });
        }
    }, [data, reqExtra, identifier, loading, error]);

    const addIngredientHandler = useCallback((ingredient) => {
        sendRequest(`${BASE_URL}/ingredients.json`, 'POST', JSON.stringify(ingredient), ingredient, 'ADD_INGREDIENT');
    }, [sendRequest]);

    const removeIngredientHandler = useCallback((ingredientId) => {
        sendRequest(`${BASE_URL}/ingredients/${ingredientId}.json`, 'DELETE', null, ingredientId, 'REMOVE_INGREDIENT');
    }, [sendRequest]);

    const filteredIngredientsHandler = useCallback((filtered) => {
        dispatch({
            type: 'SET',
            ingredients: filtered
        });
    }, []);

    const ingredientList = useMemo(() => {
        return <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />;
    }, [ingredients, removeIngredientHandler])

    return (
        <div className="App">
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
            <IngredientForm onAddIngredient={addIngredientHandler} loading={loading} />
            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredientList}
            </section>
        </div>
    );
}

export default Ingredients;
