import React from 'react';
import MapPanel from './components/MapPanel/MapPanel';
import EventPanel from './components/CommentPanel/EventPanel';
import Gallary from './components/Gallary/Gallary';
import "./styles.css"

function App() {

    return (
        <div id='mainConteiner'>
            <div id="leftPanel"> 
                <MapPanel />
                <Gallary />
            </div>
            <div id="rightPanel"> 
                <EventPanel />
            </div>
        </div>
    );
}

export default App;
