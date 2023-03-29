import React from 'react';
import { useSelector } from 'react-redux';

const Home = () => {
    const data = useSelector(state => state.user);
    // console.log("data", data)
    return (
        <div>
            <div style={{ textAlign: 'center' }}>
                <h2>Welcome! {data.user}</h2>
                <p>This is the home page. <br/> token: {data.token}</p>
                {/* <p>{data}</p> */}
            </div>
        </div>
    );
};

export default Home;