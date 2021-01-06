import React, {useContext, useEffect, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage, IonSearchbar, IonSelectOption,
  IonTitle,
  IonToolbar, useIonViewWillEnter, IonSelect, IonInfiniteScroll, IonInfiniteScrollContent, IonButton, IonButtons, IonImg
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Jedi from './Jedi';
import { getLogger } from '../core';
import { JediContext } from './JediProvider';
import {JediProps} from "./JediProps";
import {AuthContext, Storage} from '../auth'
import {useAppState} from "./jediAppState";
import {useNetwork} from "./jediUseNetwork";
import { addToStorage, getFromStorage, getListFromStorage, removeFromStorage } from '../localStorage/localStorageApi';
import {Photo, usePhotoGallery} from "../forPhoto/usePhotoGallery";
const log = getLogger('JediList');

const JediList: React.FC<RouteComponentProps> = ({ history }) => {
  const { appState } = useAppState();
  const { networkStatus } = useNetwork();

  const { jedis, fetching, fetchingError,saveItem,refresh} = useContext(JediContext);
  const [jediList, setJedis] = useState<JediProps[]>([]);

  const { photos } = usePhotoGallery();
  const [photoList, setPhotoList] = useState<Photo[]>([]);
  const [searchJedi, setSearchJedi] = useState<string>('');
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [pos, setPos] = useState(14);
  const { logout } = useContext(AuthContext);

  const handleLogOut = () => {
    //return history.push(`/login`);
    logout?.();
    return <Redirect to={{ pathname: "/login" }} />;
  };

  useEffect(() => {
    if(refresh){
      console.log("refresh")
      refresh();
    }
    if (jedis?.length) {
      setJedis(jedis.slice(0, 14));
    }

  }, [jedis]);
  addToStorage("jediDisplayList",jediList);
  function sendFunction(){
    if (networkStatus.connected){
      getListFromStorage("local_data").then(x=>{
        addToStorage("local_data",[])
        if (x && x.length>=1){
          x.forEach(jedi => {
            //console.log("sending:..."+ recipe.version.toString());
            if( jedi.status ===1 || jedi.status===2){
              jedi.status=0
              saveItem && saveItem(jedi);
            }
          });

        }
      })
    }
  }
  useEffect(sendFunction,[networkStatus.connected]);


  async function searchNext($event: CustomEvent<void>) {
    if (jedis && pos < jedis.length) {
      setJedis([...jediList, ...jedis.slice(pos, 5 + pos)]);
      setPos(pos + 5);
    } else {
      setDisableInfiniteScroll(true);
    }
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }
  async  function setPhotos(idP:string|undefined){
    setPhotoList(photos.filter(p=>p.jediID===idP));
  }
  useEffect(()=>{

    if(filter && jedis){
      if(filter==="M" || filter==="F"){
        setJedis(jedis.filter((jedi)=>jedi.gender===filter));
        setDisableInfiniteScroll(true);
      }
      else {
        setDisableInfiniteScroll(false);
        setFilter("Gender");

        setJedis(jedis.slice(0,pos));
      }
    }

  },[filter]);




  log('render');



  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Jedi List</IonTitle>

            <IonButtons slot="end" >
              <IonButton  onClick={handleLogOut}>
                Logout
              </IonButton>
            </IonButtons>
          </IonToolbar>

        </IonHeader>
        <IonContent>
          <div className="stateDiv">
            <IonSelect   value={filter} placeholder="Gender" okText="Okay" cancelText="Dismiss"
                       onIonChange={e => setFilter(e.detail.value) } >
              <IonSelectOption value="None">No Filter</IonSelectOption>
              <IonSelectOption value="M">M</IonSelectOption>
              <IonSelectOption value="F">F</IonSelectOption>
            </IonSelect>
            <div className="stateDivItem">
              <div > App is active: {JSON.stringify(appState.isActive)}</div>
              <div > App is online: {JSON.stringify(networkStatus.connected)}</div>
            </div>


          </div>
          <IonSearchbar
              value={searchJedi}
              debounce={700}
              onIonChange={e => setSearchJedi(e.detail.value!)}>
          </IonSearchbar>

          <IonLoading isOpen={fetching} message="Fetching jedis"/>
          {jediList  &&(
              <IonList>

                {
                  jediList
                    .filter(j => j.name.startsWith(searchJedi) )
                    .map(({ _id, name ,gender,status,latitude,longitude}) =>
                      <div className="listImage">
                        <Jedi key={_id} _id={_id} name={name} gender={gender} status={status} latitude={latitude} longitude={longitude}
                              onEdit={id => history.push(`/jedi/${id}`)}/>

                        <IonImg   src={photos.filter(p=>p.jediID===_id).shift()?.webviewPath} />



                      </div>
                    )}

              </IonList>
          )}
          <IonInfiniteScroll
              threshold="50px"
              disabled={disableInfiniteScroll}
              onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
          >
            <IonInfiniteScrollContent loadingText="Loading more jedi..."/>
          </IonInfiniteScroll>
          {fetchingError && (
              <div>{fetchingError.message || 'Failed to fetch jedis'}</div>
          )}
          <IonFab vertical="bottom" horizontal="end" slot="fixed" >
            <IonFabButton onClick={() => history.push('/jedi')}>
              <IonIcon icon={add}/>
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
  );
};

export default JediList;
