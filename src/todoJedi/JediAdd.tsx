import React, { useContext, useEffect, useState } from 'react';
import { createAnimation } from '@ionic/react';
import {
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

const JediAdd: React.FC<JediEditProps> = ({ history, match }) => {
    const { jedis, saving, savingError, saveItem,refresh } = useContext(JediContext);
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [status,setStatus] = useState(0);
    // const [jediId,setJediId] = useState("");
    const [jedi, setJedi] = useState<JediProps>();

    // const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    // const [photoToDelete, setPhotoToDelete] = useState<Photo>();

    const myLocation = useMyLocation();
    console.log("lattt: "+myLocation.position?.coords.latitude);

    const [latitude, setLat]=useState(0);
    const [longitude,setLng]=useState(0);
    const [ showMap, setShowMap ] = useState(false);
    const onMapClick = (e: any) =>{
        console.log("click: "+e.latLng.lat()+" , " +e.latLng.lng());
        setLng(e.latLng.lng());
        setLat(e.latLng.lat());
    }
    // useEffect(warningInputName,[]);
    // useEffect(warningSelectGender,[])
    useEffect(groupAnimation,[])
    useEffect(() => {
        log('useEffect');

        setLng(23.613403432071205);
        setLat(46.75665869874103);
        setShowMap(true);

    }, [match.params.id, jedis]);


    function warningInputName() {
        const el = document.querySelector('.inputName');
        if (el && name=='') {
            const animation = createAnimation()
                .addElement(el)
                .duration(70)
                .direction('alternate')
                .iterations(20)
                .fromTo('transform', 'translateX(0px)', 'translateX(6px)')

            animation.play();
        }
    }


    function warningSelectGender() {
        const el = document.querySelector('.selectGender');
        if (el && gender=='') {
            const animation = createAnimation()
                .addElement(el)
                .duration(70)
                .direction('alternate')
                .iterations(20)
                .keyframes([
                    { offset: 0, transform: ' rotate(0)' },
                    { offset: 0.33, transform: 'rotate(5deg)' },
                    { offset: 0.66, transform: ' rotate(-10deg)' },
                    {offset: 1, transform: 'rotate(5deg)' }
                ]);

            animation.play();
        }
    }
    function groupAnimation() {
        const nameEl = document.querySelector('.inputName');
        const genderEl = document.querySelector('.selectGender');
        if (nameEl && genderEl) {
            const animationName = createAnimation()
                .addElement(nameEl)
                .fromTo('transform', 'translateX(1000px)', 'translateX(0px)');
            const animationGender = createAnimation()
                .addElement(genderEl)
                .fromTo('transform', 'translateY(1000px)', 'translateY(0px)');
            const parentAnimation = createAnimation()
                .duration(2000)
                .addAnimation([animationName, animationGender]);
            parentAnimation.play();
        }
    }

    const handleSave = () => {
        const saveJedi = jedi  ?{ ...jedi, name ,gender,status,latitude,longitude} : { name ,gender,status,latitude,longitude};
        console.log(saveJedi);
        if(name==""){
            warningInputName();
            if(gender==""|| gender == undefined){
                warningSelectGender()
            }
        }
        else if(gender=="" || gender==undefined){
            warningSelectGender()
        }
        else{
            saveItem && saveItem(saveJedi).then(() => history.goBack());
        }

    };

    const handleNameChanged=(name :string)=>{
        setName(name);
    };

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>ADD</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput className={"inputName"} value={name} placeholder="name"
                          onIonChange={e =>handleNameChanged(e.detail.value || '')} />
                <IonSelect className={"selectGender"} value={gender} placeholder="gender" okText="Okay" cancelText="Dismiss"
                           onIonChange={e => setGender(e.detail.value) }>
                    <IonSelectOption value="M">M</IonSelectOption>
                    <IonSelectOption value="F">F</IonSelectOption>
                </IonSelect>
                <div className={"myLocation"}>My Location is</div>
                <div>latitude: {latitude}</div>
                <div>longitude: {longitude}</div>

                {showMap && <MyMap
                    lat={latitude}
                    lng={longitude}
                    onMapClick={onMapClick}
                    onMarkerClick={log('onMarker')}
                />}
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save todoJedi'}</div>
                )}
            </IonContent>
        </IonPage>
    );

};

export default JediAdd;
