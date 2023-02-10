import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [count, setCount] = useState(0);
    
    return <div>
        <h1>Count: {count}</h1>
        <button onClick={() => setCount(count + 1)}>+</button>
    </div>;
};

const root = document.createElement('div')
document.documentElement.insertBefore(root, document.getElementsByTagName('body')[0])
ReactDOM.render(<App />, root);
