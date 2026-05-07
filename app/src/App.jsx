import React from 'react';
import MapPanel from './components/MapPanel/MapPanel';
import EventPanel from './components/EventPanel/EventPanel';
import Gallary from './components/Gallary/Gallary';
import CommentPanel from './components/CommentPanel/CommentPanel';
import PopupPanel from './components/PopupPanel/PopupPanel';
import Header from './components/Header/Header';
import "./styles.css"

function App() {

    return (
        <>
            <Header />
            <div id='mainConteiner'>
                <div id="leftPanel"> 
                    <MapPanel />
                    <Gallary />
                </div>
                <div id="rightPanel"> 
                    <EventPanel />
                </div>
                <PopupPanel />
            </div>
            <CommentPanel />
        </>
    );
}

export default App;
