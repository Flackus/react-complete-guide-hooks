import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import ErrorModal from '../UI/ErrorModal'
import useHttp from '../../hooks/http';
import './Search.css';

const IngredientsUrl = 'https://react-hooks-8434a-default-rtdb.firebaseio.com/ingredients.json';

const Search = React.memo((props) => {
    const [enteredFilter, setEnteredFilter] = useState('');
    const { onLoadIngredients } = props;
    const inputRef = useRef();
    const { loading, data, error, sendRequest, clear } = useHttp();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (enteredFilter === inputRef.current.value) {
                const queryParams = enteredFilter.length === 0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`;
                sendRequest(IngredientsUrl + queryParams, 'GET');
            }
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [enteredFilter, sendRequest, inputRef]);

    useEffect(() => {
        if (loading || error) {
            return;
        }
        const loadedIngredients = [];
        for (const key in data) {
            loadedIngredients.push({
                id: key,
                title: data[key].title,
                amount: data[key].amount
            });
        }
        onLoadIngredients(loadedIngredients);
    }, [data, loading, error, onLoadIngredients]);

    return (
        <section className="search">
            {error && <ErrorModal inClose={clear}>{error}</ErrorModal>}
            <Card>
                <div className="search-input">
                    <label>Filter by Title</label>
                    {loading && <span>Loading...</span>}
                    <input
                        ref={inputRef}
                        type="text"
                        value={enteredFilter}
                        onChange={(event) => setEnteredFilter(event.target.value)}
                        />
                </div>
            </Card>
        </section>
    );
});

export default Search;
