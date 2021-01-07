import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { JediEdit, JediList } from './todoJedi';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { JediProvider } from './todoJedi/JediProvider';
import {AuthProvider, Login, PrivateRoute} from "./auth";
import JediAdd from "./todoJedi/JediAdd";


const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonRouterOutlet>
                <AuthProvider>
                    <Route path="/login" component={Login} exact={true}/>
                    <JediProvider>
                        <PrivateRoute path="/jedis" component={JediList} exact={true}/>
                        <PrivateRoute path="/jedi" component={JediAdd} exact={true}/>
                        <PrivateRoute path="/jedi/:id" component={JediEdit} exact={true}/>
                    </JediProvider>
                    <Route exact path="/" render={() => <Redirect to="/jedis"/>}/>
                    <Redirect exact from="/jedis" to="/login" />
                </AuthProvider>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
