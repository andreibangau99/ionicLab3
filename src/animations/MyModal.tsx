import React, { useState } from 'react';
import {createAnimation, IonModal, IonButton, IonContent, IonImg} from '@ionic/react';
import {Photo} from "../forPhoto/usePhotoGallery";

interface PhotoAnimationProps{
    _id?: string;
    photo?: string;
}

export const MyModal: React.FC<PhotoAnimationProps> = ({_id,photo}) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0,opacity:0,  transform: 'scale(0)' },
                { offset: 1,opacity:0.99,  transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(1000)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>

                <h1 className={"modalH1"}>Photo View</h1>
                <IonImg className={"photo"} src={photo} />
                <IonButton className={"modalCloseButton"} onClick={() => setShowModal(false)}>Close Photo View</IonButton>





            </IonModal>
            <IonImg onClick={() => setShowModal(true)}
                    src={photo} />
        </>
    );
};
