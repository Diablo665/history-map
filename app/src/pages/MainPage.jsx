import MapPanel from '../components/MapPanel/MapPanel';
import EventPanel from '../components/EventPanel/EventPanel';
import Gallary from '../components/Gallary/Gallary';
import CommentPanel from '../components/CommentPanel/CommentPanel';
import Header from '../components/Header/Header';
import LoginForm from '../components/LoginForm/LoginForm';
import AdminPanel from '../components/AdminPanel/AdminPanel';
import PopupPanel from '../components/PopupPanel/PopupPanel';

const MainPage = () => {
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
                <AdminPanel />
                <LoginForm />
            </div>
            <CommentPanel />*
        </>

    )
}

export default MainPage