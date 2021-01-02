import { useReducer, useCallback } from 'react';

const initialState = {
    loading: false,
    error: null,
    data: null,
    extra: null,
    identifier: null
};

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null, data: null, extra: null, identifier: action.identifier };
        case 'RESPONSE':
            return { ...httpState, loading: false, data: action.responseData, extra: action.extra };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return initialState;
        default:
            throw new Error("Should be unreachable");
    }
};

const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

    const clear = useCallback(() => {
        dispatchHttp({ type: 'CLEAR' });
    }, []);

    const sendRequest = useCallback((url, method, body, reqExtra, reqIdentifier) => {
        dispatchHttp({ type: 'SEND', identifier: reqIdentifier });
        fetch(url, {
                method,
                body,
                headers: { 'Content-Type': 'application/json' }
            })
            .then((response) => response.json())
            .then((responseData) => {
                dispatchHttp({ type: 'RESPONSE', responseData, extra: reqExtra });
            })
            .catch((error) => {
                dispatchHttp({ type: 'ERROR', errorMessage: error.message });
            });
    }, []);

    return {
        loading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest,
        reqExtra: httpState.extra,
        identifier: httpState.identifier,
        clear
    };
};

export default useHttp;
