import React, { useContext, useEffect, useState } from 'react';
import {
  createAnimation,
  IonActionSheet,
  IonButton,
  IonButtons, IonCol,
  IonContent, IonFab, IonFabButton, IonGrid,
  IonHeader, IonIcon, IonImg,
  IonInput,
  IonLoading,
  IonPage, IonRow, IonSelect, IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { JediContext } from './JediProvider';
import { RouteComponentProps } from 'react-router';
import { JediProps } from './JediProps';
import {Photo, usePhotoGallery} from "../forPhoto/usePhotoGallery";
import {camera, close, trash} from "ionicons/icons";
import {useMyLocation} from "../useLocation/useMyLocation";
import {MyMap} from "../useLocation/MyMap";

const log = getLogger('JediEdit');

interface JediEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const JediEdit: React.FC<JediEditProps> = ({ history, match }) => {
  const { jedis, saving, savingError, saveItem,refresh } = useContext(JediContext);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [status,setStatus] = useState(0);
  const [jediId,setJediId] = useState("");
  const [jedi, setJedi] = useState<JediProps>();

  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [photoToDelete, setPhotoToDelete] = useState<Photo>();

  const myLocation = useMyLocation();
  console.log("lattt: "+myLocation.position?.coords.latitude);

  const [latitude, setLat]=useState(0);
  const [longitude,setLng]=useState(0);
  const [ showMap, setShowMap ] = useState(false);
  useEffect(groupAnimation,[]);
  const onMapClick = (e: any) =>{
    console.log("click: "+e.latLng.lat()+" , " +e.latLng.lng());
    setLng(e.latLng.lng());
    setLat(e.latLng.lat());
  }
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = jedis?.find(it => it._id === routeId);
    setJedi(item);
    if (item) {
      setJediId(routeId);
      setName(item.name);
      setGender(item.gender);
      setStatus(item.status);

      setLat(item.latitude);
      setLng(item.longitude);
      setShowMap(true);
    }
  }, [match.params.id, jedis]);
  function groupAnimation() {
    const nameEl = document.querySelector('.inputName');
    const genderEl = document.querySelector('.selectGender');
    if (nameEl && genderEl) {
      const animationName = createAnimation()
          .addElement(nameEl)
          .duration(3000)
          .keyframes([
            { offset: 0, transform: 'scale(1) rotate(0)' },
            { offset: 0.25, transform: 'scale(0.5) rotate(-90deg)' },
            { offset: 0.5, transform: 'scale(0) rotate(-180deg)' },
            { offset: 0.75, transform: 'scale(0.5) rotate(-270deg)' },
            {offset: 1, transform: 'scale(1) rotate(-360deg)' }
          ])
          .afterStyles({'beckground':'yellow'});

      const animationGender = createAnimation()
          .addElement(genderEl)
          .duration(3000)
          .keyframes([
            { offset: 0, transform: 'scale(1) rotate(0)' },
            { offset: 0.25, transform: 'translateX(100px)  scale(1.5) rotate(90deg)' },
            { offset: 0.5, transform: ' scale(2) rotate(180deg)' },
            { offset: 0.75, transform: 'translateX(-100px) scale(1.5) rotate(270deg)' },
            {offset: 1, transform: 'scale(1) rotate(360deg)' }
          ])
          .afterStyles({'beckground':'lime'});

      (async () => {
        await animationName.play();
        await animationGender.play();
      })();
    }
  }

  const handleSave = () => {
    const editedJedi = jedi  ?{ ...jedi, name ,gender,status,latitude,longitude} : { name ,gender,status,latitude,longitude};
    console.log(editedJedi);
    saveItem && saveItem(editedJedi).then(() => history.goBack());
  };
  log('render');
  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonInput className={"inputName"} value={name} placeholder="name" onIonChange={e => setName(e.detail.value || '')} />
          <IonSelect className={"selectGender"} value={gender} placeholder="gender" okText="Okay" cancelText="Dismiss"
                     onIonChange={e => setGender(e.detail.value) }>
            <IonSelectOption value="M">M</IonSelectOption>
            <IonSelectOption value="F">F</IonSelectOption>
          </IonSelect>
          <IonGrid>
            <IonRow>
              {photos
                  .filter(p=>p.jediID.match(jediId))
                  .map((photo, index) => (
                  <IonCol size="3" key={index}>
                    <IonImg className="listImage" onClick={() => setPhotoToDelete(photo)}
                            src={photo.webviewPath}/>
                  </IonCol>
              ))}
            </IonRow>
          </IonGrid>


          <div className={"myLocation"}>My Location is</div>
          <div>latitude: {latitude}</div>
          <div>longitude: {longitude}</div>

          {showMap && <MyMap
              lat={latitude}
              lng={longitude}
              onMapClick={onMapClick}
              onMarkerClick={log('onMarker')}
          />}
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton onClick={() => takePhoto(jediId)}>
              <IonIcon icon={camera}/>
            </IonFabButton>
          </IonFab>
          <IonActionSheet
              isOpen={!!photoToDelete}
              buttons={[{
                text: 'Delete',
                role: 'destructive',
                icon: trash,
                handler: () => {
                  if (photoToDelete) {
                    deletePhoto(photoToDelete);
                    setPhotoToDelete(undefined);
                  }
                }
              }, {
                text: 'Cancel',
                icon: close,
                role: 'cancel'
              }]}
              onDidDismiss={() => setPhotoToDelete(undefined)}
          />
          <IonLoading isOpen={saving} />
          {savingError && (
              <div>{savingError.message || 'Failed to save todoJedi'}</div>
          )}
        </IonContent>
      </IonPage>
  );

};

export default JediEdit;
